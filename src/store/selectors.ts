import { addDays, diffDays, rangeKeys, timeToMin, weekStart } from '../domain/dates'
import { occursOn } from '../domain/recurrence'
import type { DateKey, DayStats, Row, Task } from '../domain/types'
import { getState, idx } from './store'

const alive = (t: Task) => !t.deletedAt

/**
 * Righe del giorno.
 * - task singole datate quel giorno
 * - task singole scadute e mai completate → riportate SOLO su oggi (carry-over)
 * - ricorrenti la cui regola cade quel giorno
 * Le occorrenze sono cercate sempre sul giorno visualizzato, così lo storico
 * dei giorni passati resta fedele anche se una task viene chiusa in ritardo.
 */
export function rowsForDay(day: DateKey, today: DateKey): Row[] {
  const { tasks } = getState()
  const out: Row[] = []

  for (const t of tasks) {
    if (!alive(t)) continue
    let lateDays = 0
    let include = false

    if (t.kind === 'single') {
      if (t.date === day) include = true
      else if (day === today && t.date && t.date < today && !t.archivedAt) {
        // carry-over: solo se non è mai stata completata
        const everDone = idx.occsOf(t.id).some((o) => o.status === 'done')
        if (!everDone) {
          include = true
          lateDays = diffDays(t.date, today)
        }
      }
    } else if (occursOn(t, day)) {
      include = true
    }

    if (!include) continue
    const occ = idx.occ(t.id, day)
    if (occ?.status === 'moved') continue
    out.push({
      key: `${t.id}:${day}`,
      task: t,
      occ,
      status: occ?.status === 'done' ? 'done' : occ?.status === 'skipped' ? 'skipped' : 'todo',
      lateDays
    })
  }

  return sortRows(out)
}

export function sortRows(rows: Row[]): Row[] {
  return rows.sort((a, b) => {
    if (a.task.mustDo !== b.task.mustDo) return a.task.mustDo ? -1 : 1
    const ta = timeToMin(a.task.time)
    const tb = timeToMin(b.task.time)
    if (ta >= 0 && tb >= 0 && ta !== tb) return ta - tb
    if (ta >= 0 !== (tb >= 0)) return ta >= 0 ? -1 : 1
    if (a.task.order !== b.task.order) return a.task.order - b.task.order
    return a.task.createdAt - b.task.createdAt
  })
}

export function statsOf(rows: Row[]): DayStats {
  let done = 0
  let skipped = 0
  let mustTotal = 0
  let mustDone = 0
  for (const r of rows) {
    if (r.status === 'skipped') {
      skipped++
      continue
    }
    if (r.task.mustDo) {
      mustTotal++
      if (r.status === 'done') mustDone++
    }
    if (r.status === 'done') done++
  }
  return { total: rows.length - skipped, done, skipped, mustTotal, mustDone }
}

export function dayStats(day: DateKey, today: DateKey): DayStats {
  return statsOf(rowsForDay(day, today))
}

// --- Insights --------------------------------------------------------------

export interface Bucket {
  id: string
  label: string
  color?: string
  done: number
  total: number
}

export interface Insights {
  streak: number
  bestStreak: number
  rate7: number
  rate30: number
  delta7: number
  totalDone: number
  byCategory: Bucket[]
  byType: Bucket[]
  topMissed: { task: Task; missed: number }[]
  weekly: { label: string; rate: number }[]
  daysWithData: number
}

function completionOverRange(days: DateKey[], today: DateKey) {
  let done = 0
  let total = 0
  for (const d of days) {
    const s = dayStats(d, today)
    done += s.done
    total += s.total
  }
  return { done, total, rate: total ? done / total : 0 }
}

export function computeInsights(today: DateKey, windowDays: number): Insights {
  const { tasks, categories } = getState()
  const from = addDays(today, -(windowDays - 1))
  const days = rangeKeys(from, today)

  // --- streak must do (solo giorni con almeno un must do) ---
  let streak = 0
  let bestStreak = 0
  let run = 0
  let cur = today
  let guard = 0
  // streak corrente, all'indietro
  while (guard++ < 3650) {
    const s = dayStats(cur, today)
    if (s.mustTotal === 0) {
      // giorno neutro: non rompe e non incrementa
    } else if (s.mustDone === s.mustTotal) {
      streak++
    } else {
      if (cur !== today) break
      // oggi ancora in corso: non conta come rotto
    }
    const prev = addDays(cur, -1)
    if (!hasAnyData(prev)) break
    cur = prev
  }
  // best streak sull'intero storico noto
  const first = earliestDate(today)
  for (const d of rangeKeys(first, today)) {
    const s = dayStats(d, today)
    if (s.mustTotal === 0) continue
    if (s.mustDone === s.mustTotal) {
      run++
      bestStreak = Math.max(bestStreak, run)
    } else run = 0
  }

  const r7 = completionOverRange(rangeKeys(addDays(today, -6), today), today)
  const r30 = completionOverRange(rangeKeys(addDays(today, -29), today), today)
  const prev7 = completionOverRange(rangeKeys(addDays(today, -13), addDays(today, -7)), today)

  // --- ripartizione completate / non completate ---
  const catMap = new Map<string, Bucket>()
  const typeMap = new Map<string, Bucket>([
    ['recurring', { id: 'recurring', label: 'Ricorrenti', done: 0, total: 0 }],
    ['single', { id: 'single', label: 'Straordinarie', done: 0, total: 0 }],
    ['must', { id: 'must', label: 'Must do', done: 0, total: 0 }]
  ])
  const missed = new Map<string, number>()
  let totalDone = 0

  for (const d of days) {
    for (const r of rowsForDay(d, today)) {
      if (r.status === 'skipped') continue
      const isDone = r.status === 'done'
      if (isDone) totalDone++
      else if (d < today) missed.set(r.task.id, (missed.get(r.task.id) || 0) + 1)

      const cid = r.task.categoryId || '__none'
      if (!catMap.has(cid)) {
        const c = categories.find((x) => x.id === cid)
        catMap.set(cid, {
          id: cid,
          label: c?.name || 'Senza categoria',
          color: c?.color,
          done: 0,
          total: 0
        })
      }
      const cb = catMap.get(cid)!
      cb.total++
      if (isDone) cb.done++

      const tb = typeMap.get(r.task.kind)!
      tb.total++
      if (isDone) tb.done++
      if (r.task.mustDo) {
        const mb = typeMap.get('must')!
        mb.total++
        if (isDone) mb.done++
      }
    }
  }

  const topMissed = [...missed.entries()]
    .map(([id, n]) => ({ task: tasks.find((t) => t.id === id)!, missed: n }))
    .filter((x) => !!x.task && !x.task.deletedAt)
    .sort((a, b) => b.missed - a.missed)
    .slice(0, 5)

  // --- andamento settimanale (12 settimane) ---
  const weekly: { label: string; rate: number }[] = []
  for (let i = 11; i >= 0; i--) {
    const ws = addDays(weekStart(today), -7 * i)
    const we = addDays(ws, 6)
    const r = completionOverRange(rangeKeys(ws, we > today ? today : we), today)
    weekly.push({ label: ws.slice(8) + '/' + ws.slice(5, 7), rate: r.rate })
  }

  return {
    streak,
    bestStreak,
    rate7: r7.rate,
    rate30: r30.rate,
    delta7: r7.rate - prev7.rate,
    totalDone,
    byCategory: [...catMap.values()].sort((a, b) => b.total - a.total),
    byType: [...typeMap.values()].filter((b) => b.total > 0),
    topMissed,
    weekly,
    daysWithData: diffDays(earliestDate(today), today) + 1
  }
}

function hasAnyData(day: DateKey): boolean {
  const { tasks } = getState()
  return tasks.some((t) => alive(t) && (t.kind === 'single' ? t.date === day : occursOn(t, day)))
}

/** Primo giorno con dati (limitato a 2 anni per sicurezza). */
export function earliestDate(today: DateKey): DateKey {
  const { tasks, occurrences } = getState()
  let min = today
  for (const t of tasks) {
    if (!alive(t)) continue
    const d = t.kind === 'single' ? t.date : t.rrule?.startDate
    if (d && d < min) min = d
  }
  for (const o of occurrences) if (o.date < min) min = o.date
  const floor = addDays(today, -730)
  return min < floor ? floor : min
}
