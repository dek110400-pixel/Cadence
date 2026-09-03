import { addDays, dateKey } from '../domain/dates'
import type { Category, DateKey, DayLog, Occurrence, Task } from '../domain/types'
import * as db from './db'
import { getState, idx, setState, uid } from './store'

const now = () => Date.now()

// --- Task ------------------------------------------------------------------

export function createTask(input: Partial<Task> & { title: string }): Task {
  const s = getState()
  const t: Task = {
    id: uid(),
    title: input.title.trim(),
    note: input.note,
    categoryId: input.categoryId ?? null,
    mustDo: !!input.mustDo,
    time: input.time ?? null,
    alarm: !!input.alarm,
    estimatedMin: input.estimatedMin ?? null,
    order: s.tasks.length,
    createdAt: now(),
    updatedAt: now(),
    kind: input.kind || 'single',
    date: input.kind === 'recurring' ? null : input.date || null,
    rrule: input.kind === 'recurring' ? input.rrule || null : null
  }
  setState({ tasks: [...s.tasks, t] })
  db.put('tasks', t)
  return t
}

export function updateTask(id: string, patch: Partial<Task>) {
  const s = getState()
  let updated: Task | undefined
  const tasks = s.tasks.map((t) => {
    if (t.id !== id) return t
    updated = { ...t, ...patch, updatedAt: now() }
    return updated
  })
  if (!updated) return
  setState({ tasks })
  db.put('tasks', updated)
}

/** Soft delete: preserva lo storico se la task è stata completata almeno una volta. */
export function deleteTask(id: string) {
  const hasHistory = idx.occsOf(id).some((o) => o.status === 'done')
  if (hasHistory) {
    updateTask(id, { archivedAt: now(), rrule: patchEnd(id) })
    return
  }
  const s = getState()
  setState({
    tasks: s.tasks.filter((t) => t.id !== id),
    occurrences: s.occurrences.filter((o) => o.taskId !== id)
  })
  db.del('tasks', id)
  for (const o of idx.occsOf(id)) db.del('occurrences', o.id)
}

function patchEnd(id: string) {
  const t = getState().tasks.find((x) => x.id === id)
  if (!t?.rrule) return null
  return { ...t.rrule, endDate: addDays(dateKey(new Date()), -1) }
}

/** Chiude la regola al giorno precedente e crea un nuovo template: "da qui in avanti". */
export function splitRecurring(id: string, fromDay: DateKey, patch: Partial<Task>) {
  const t = getState().tasks.find((x) => x.id === id)
  if (!t || !t.rrule) return
  updateTask(id, { rrule: { ...t.rrule, endDate: addDays(fromDay, -1) } })
  createTask({
    ...t,
    ...patch,
    id: undefined as unknown as string,
    kind: 'recurring',
    rrule: { ...(patch.rrule || t.rrule), startDate: fromDay, endDate: null }
  })
}

// --- Occorrenze ------------------------------------------------------------

function writeOcc(o: Occurrence) {
  const s = getState()
  const exists = s.occurrences.some((x) => x.id === o.id)
  setState({
    occurrences: exists ? s.occurrences.map((x) => (x.id === o.id ? o : x)) : [...s.occurrences, o]
  })
  db.put('occurrences', o)
}

function dropOcc(id: string) {
  const s = getState()
  setState({ occurrences: s.occurrences.filter((x) => x.id !== id) })
  db.del('occurrences', id)
}

export function setStatus(taskId: string, date: DateKey, status: Occurrence['status'] | null) {
  const id = `${taskId}:${date}`
  if (status === null) {
    const prev = idx.occ(taskId, date)
    // conservo il log anche se annullo il completamento
    if (prev?.log) writeOcc({ ...prev, status: 'done', completedAt: null, updatedAt: now() })
    dropOcc(id)
    return
  }
  const prev = idx.occ(taskId, date)
  writeOcc({
    id,
    taskId,
    date,
    status,
    completedAt: status === 'done' ? now() : null,
    log: prev?.log,
    updatedAt: now()
  })
}

export function complete(taskId: string, date: DateKey) {
  setStatus(taskId, date, 'done')
}

export function uncomplete(taskId: string, date: DateKey) {
  setStatus(taskId, date, null)
}

export function skip(taskId: string, date: DateKey) {
  setStatus(taskId, date, 'skipped')
}

export function setLog(taskId: string, date: DateKey, log: string) {
  const prev = idx.occ(taskId, date)
  if (!prev) return
  writeOcc({ ...prev, log: log.trim() || undefined, updatedAt: now() })
}

/**
 * Sposta a domani.
 * - singola: cambia semplicemente la data
 * - ricorrente: segna l'occorrenza come 'moved' e crea una copia singola per domani
 */
export function moveToNextDay(taskId: string, date: DateKey): () => void {
  const t = getState().tasks.find((x) => x.id === taskId)
  if (!t) return () => {}
  const target = addDays(date, 1)
  if (t.kind === 'single') {
    updateTask(taskId, { date: target })
    return () => updateTask(taskId, { date })
  }
  setStatus(taskId, date, 'moved')
  const clone = createTask({
    title: t.title,
    note: t.note,
    categoryId: t.categoryId,
    mustDo: t.mustDo,
    time: t.time,
    alarm: t.alarm,
    estimatedMin: t.estimatedMin,
    kind: 'single',
    date: target
  })
  return () => {
    setStatus(taskId, date, null)
    deleteTask(clone.id)
  }
}

export function moveTo(taskId: string, from: DateKey, target: DateKey) {
  const t = getState().tasks.find((x) => x.id === taskId)
  if (!t) return
  if (t.kind === 'single') {
    updateTask(taskId, { date: target })
    return
  }
  setStatus(taskId, from, 'moved')
  createTask({ ...t, id: undefined as unknown as string, kind: 'single', date: target, rrule: null })
}

// --- Diario / giornata -----------------------------------------------------

export function setDayNote(date: DateKey, note: string) {
  const s = getState()
  const prev = idx.dayLog(date)
  const entry: DayLog = {
    date,
    note: note.trim() || undefined,
    reviewedAt: prev?.reviewedAt ?? null,
    updatedAt: now()
  }
  setState({
    dayLogs: prev ? s.dayLogs.map((d) => (d.date === date ? entry : d)) : [...s.dayLogs, entry]
  })
  db.put('dayLogs', entry)
}

export function markReviewed(date: DateKey) {
  const s = getState()
  const prev = idx.dayLog(date)
  const entry: DayLog = { ...(prev || { date, updatedAt: 0 }), date, reviewedAt: now(), updatedAt: now() }
  setState({
    dayLogs: prev ? s.dayLogs.map((d) => (d.date === date ? entry : d)) : [...s.dayLogs, entry]
  })
  db.put('dayLogs', entry)
}

// --- Categorie -------------------------------------------------------------

export function saveCategory(c: Partial<Category> & { name: string }) {
  const s = getState()
  if (c.id && s.categories.some((x) => x.id === c.id)) {
    const cats = s.categories.map((x) => (x.id === c.id ? { ...x, ...c, updatedAt: now() } : x))
    setState({ categories: cats })
    db.put('categories', cats.find((x) => x.id === c.id))
    return
  }
  const cat: Category = {
    id: c.id || uid(),
    name: c.name,
    color: c.color || '#6F6F6F',
    order: s.categories.length,
    updatedAt: now()
  }
  setState({ categories: [...s.categories, cat] })
  db.put('categories', cat)
}

export function deleteCategory(id: string) {
  const s = getState()
  setState({
    categories: s.categories.filter((c) => c.id !== id),
    tasks: s.tasks.map((t) => (t.categoryId === id ? { ...t, categoryId: null, updatedAt: now() } : t))
  })
  db.del('categories', id)
  for (const t of getState().tasks) if (t.categoryId === null) db.put('tasks', t)
}
