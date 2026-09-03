import { useEffect, useState } from 'preact/hooks'
import type { Category, DayLog, Occurrence, Settings, Task } from '../domain/types'
import * as db from './db'

export interface State {
  tasks: Task[]
  occurrences: Occurrence[]
  dayLogs: DayLog[]
  categories: Category[]
  settings: Settings
  loaded: boolean
}

export const DEFAULT_SETTINGS: Settings = {
  theme: 'system',
  dayStartHour: 4,
  alarms: true,
  sound: true,
  notifications: false,
  lastExport: null
}

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'work', name: 'Lavoro', color: '#4C535B', order: 0, updatedAt: 0 },
  { id: 'training', name: 'Allenamento', color: '#6B7A6E', order: 1, updatedAt: 0 },
  { id: 'personal', name: 'Personale', color: '#8C5A3E', order: 2, updatedAt: 0 },
  { id: 'study', name: 'Studio', color: '#5D6B8C', order: 3, updatedAt: 0 },
  { id: 'errands', name: 'Commissioni', color: '#8B6F5A', order: 4, updatedAt: 0 }
]

const SETTINGS_KEY = 'cadence.settings'

function loadSettings(): Settings {
  try {
    return { ...DEFAULT_SETTINGS, ...JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}') }
  } catch {
    return { ...DEFAULT_SETTINGS }
  }
}

let state: State = {
  tasks: [],
  occurrences: [],
  dayLogs: [],
  categories: [],
  settings: loadSettings(),
  loaded: false
}

// --- indici derivati -------------------------------------------------------
let occByKey = new Map<string, Occurrence>()
let occByTask = new Map<string, Occurrence[]>()
let logByDate = new Map<string, DayLog>()

function reindex() {
  occByKey = new Map()
  occByTask = new Map()
  for (const o of state.occurrences) {
    occByKey.set(o.id, o)
    const arr = occByTask.get(o.taskId)
    if (arr) arr.push(o)
    else occByTask.set(o.taskId, [o])
  }
  logByDate = new Map(state.dayLogs.map((d) => [d.date, d]))
}

export const idx = {
  occ: (taskId: string, date: string) => occByKey.get(`${taskId}:${date}`),
  occsOf: (taskId: string) => occByTask.get(taskId) || [],
  dayLog: (date: string) => logByDate.get(date)
}

// --- pub/sub ---------------------------------------------------------------
const listeners = new Set<() => void>()

export function getState(): State {
  return state
}

export function setState(patch: Partial<State>) {
  state = { ...state, ...patch }
  reindex()
  listeners.forEach((l) => l())
}

export function patchSettings(patch: Partial<Settings>) {
  const settings = { ...state.settings, ...patch }
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
  } catch {}
  setState({ settings })
  applyTheme(settings.theme)
}

export function applyTheme(theme: Settings['theme']) {
  const dark = theme === 'dark' || (theme === 'system' && matchMedia('(prefers-color-scheme: dark)').matches)
  document.documentElement.dataset.theme = dark ? 'dark' : 'light'
}

export function useStore(): State {
  const [, force] = useState(0)
  useEffect(() => {
    const l = () => force((n) => n + 1)
    listeners.add(l)
    return () => {
      listeners.delete(l)
    }
  }, [])
  return state
}

export async function bootstrap() {
  const data = await db.loadAll()
  if (data.categories.length === 0) {
    for (const c of DEFAULT_CATEGORIES) db.put('categories', c)
    data.categories = DEFAULT_CATEGORIES
  }
  setState({ ...data, loaded: true })
  applyTheme(state.settings.theme)
}

export const uid = () =>
  Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
