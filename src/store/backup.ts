import type { Category, DayLog, Occurrence, Settings, Task } from '../domain/types'
import * as db from './db'
import { getState, patchSettings, setState } from './store'

export const SCHEMA = 1

export interface Backup {
  schema: number
  app: 'cadence'
  exportedAt: string
  tasks: Task[]
  occurrences: Occurrence[]
  dayLogs: DayLog[]
  categories: Category[]
  settings: Settings
}

export function buildBackup(): Backup {
  const s = getState()
  return {
    schema: SCHEMA,
    app: 'cadence',
    exportedAt: new Date().toISOString(),
    tasks: s.tasks,
    occurrences: s.occurrences,
    dayLogs: s.dayLogs,
    categories: s.categories,
    settings: s.settings
  }
}

export async function exportBackup() {
  const data = buildBackup()
  const json = JSON.stringify(data, null, 2)
  const name = `cadence-${data.exportedAt.slice(0, 10)}.json`
  const file = new File([json], name, { type: 'application/json' })

  // iOS: lo share sheet permette di salvare su File / iCloud Drive
  const nav = navigator as Navigator & { canShare?: (d: ShareData) => boolean }
  if (nav.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: 'Backup Cadence' })
      patchSettings({ lastExport: Date.now() })
      return
    } catch {
      /* utente ha annullato oppure share non disponibile: fallback */
    }
  }
  const url = URL.createObjectURL(file)
  const a = document.createElement('a')
  a.href = url
  a.download = name
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
  patchSettings({ lastExport: Date.now() })
}

export function parseBackup(text: string): Backup {
  const d = JSON.parse(text)
  if (!d || !Array.isArray(d.tasks)) throw new Error('File non valido')
  return {
    schema: d.schema ?? 1,
    app: 'cadence',
    exportedAt: d.exportedAt || '',
    tasks: d.tasks || [],
    occurrences: d.occurrences || [],
    dayLogs: d.dayLogs || [],
    categories: d.categories || [],
    settings: d.settings
  }
}

type Keyed = { updatedAt?: number }

function mergeBy<T extends Keyed>(current: T[], incoming: T[], key: (x: T) => string): T[] {
  const map = new Map(current.map((x) => [key(x), x]))
  for (const inc of incoming) {
    const k = key(inc)
    const cur = map.get(k)
    // in caso di conflitto vince il record modificato più di recente
    if (!cur || (inc.updatedAt || 0) > (cur.updatedAt || 0)) map.set(k, inc)
  }
  return [...map.values()]
}

export async function importBackup(b: Backup, mode: 'replace' | 'merge') {
  const s = getState()
  const next =
    mode === 'replace'
      ? {
          tasks: b.tasks,
          occurrences: b.occurrences,
          dayLogs: b.dayLogs,
          categories: b.categories.length ? b.categories : s.categories
        }
      : {
          tasks: mergeBy(s.tasks, b.tasks, (x) => x.id),
          occurrences: mergeBy(s.occurrences, b.occurrences, (x) => x.id),
          dayLogs: mergeBy(s.dayLogs, b.dayLogs, (x) => x.date),
          categories: mergeBy(s.categories, b.categories, (x) => x.id)
        }
  setState(next)
  await db.replaceAll(next)
  if (mode === 'replace' && b.settings) patchSettings(b.settings)
}
