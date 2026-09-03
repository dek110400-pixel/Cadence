import { openDB, type IDBPDatabase } from 'idb'
import type { Category, DayLog, Occurrence, Task } from '../domain/types'

const NAME = 'cadence'
const VERSION = 1

export type StoreName = 'tasks' | 'occurrences' | 'dayLogs' | 'categories'

let dbp: Promise<IDBPDatabase> | null = null
/** true se IndexedDB non è disponibile (es. Private Browsing): l'app resta usabile ma volatile. */
export let ephemeral = false

function get(): Promise<IDBPDatabase> {
  if (!dbp) {
    dbp = openDB(NAME, VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('tasks')) db.createObjectStore('tasks', { keyPath: 'id' })
        if (!db.objectStoreNames.contains('occurrences')) db.createObjectStore('occurrences', { keyPath: 'id' })
        if (!db.objectStoreNames.contains('dayLogs')) db.createObjectStore('dayLogs', { keyPath: 'date' })
        if (!db.objectStoreNames.contains('categories')) db.createObjectStore('categories', { keyPath: 'id' })
      }
    }).catch((e) => {
      ephemeral = true
      throw e
    })
  }
  return dbp
}

export async function loadAll() {
  try {
    const db = await get()
    const [tasks, occurrences, dayLogs, categories] = await Promise.all([
      db.getAll('tasks') as Promise<Task[]>,
      db.getAll('occurrences') as Promise<Occurrence[]>,
      db.getAll('dayLogs') as Promise<DayLog[]>,
      db.getAll('categories') as Promise<Category[]>
    ])
    return { tasks, occurrences, dayLogs, categories }
  } catch {
    ephemeral = true
    return { tasks: [], occurrences: [], dayLogs: [], categories: [] }
  }
}

/** Scrittura fire-and-forget: la UI ha già aggiornato lo stato in memoria. */
export function put(store: StoreName, value: unknown) {
  if (ephemeral) return
  get()
    .then((db) => db.put(store, value))
    .catch(() => {})
}

export function del(store: StoreName, key: string) {
  if (ephemeral) return
  get()
    .then((db) => db.delete(store, key))
    .catch(() => {})
}

export async function replaceAll(data: {
  tasks: Task[]
  occurrences: Occurrence[]
  dayLogs: DayLog[]
  categories: Category[]
}) {
  const db = await get()
  const tx = db.transaction(['tasks', 'occurrences', 'dayLogs', 'categories'], 'readwrite')
  await Promise.all([
    tx.objectStore('tasks').clear(),
    tx.objectStore('occurrences').clear(),
    tx.objectStore('dayLogs').clear(),
    tx.objectStore('categories').clear()
  ])
  for (const t of data.tasks) tx.objectStore('tasks').put(t)
  for (const o of data.occurrences) tx.objectStore('occurrences').put(o)
  for (const d of data.dayLogs) tx.objectStore('dayLogs').put(d)
  for (const c of data.categories) tx.objectStore('categories').put(c)
  await tx.done
}

export async function estimate(): Promise<{ usage: number; quota: number } | null> {
  if (!navigator.storage?.estimate) return null
  const e = await navigator.storage.estimate()
  return { usage: e.usage || 0, quota: e.quota || 0 }
}
