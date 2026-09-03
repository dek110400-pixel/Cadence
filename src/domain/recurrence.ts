import type { DateKey, RRule, Task } from './types'
import { dayOfWeek, daysInMonth, diffDays, parseKey } from './dates'

/**
 * Una ricorrenza cade nel giorno indicato?
 * Calcolo puro: nessuna occorrenza futura viene mai scritta nel database.
 */
export function matchesRule(r: RRule, k: DateKey): boolean {
  if (k < r.startDate) return false
  if (r.endDate && k > r.endDate) return false
  switch (r.freq) {
    case 'daily':
      return true
    case 'weekly':
      return !!r.weekdays?.length && r.weekdays.includes(dayOfWeek(k))
    case 'interval': {
      const n = Math.max(1, r.interval || 1)
      return diffDays(r.startDate, k) % n === 0
    }
    case 'monthly': {
      const d = parseKey(k)
      // clamp: il 31 in un mese di 30 giorni cade l'ultimo giorno
      const want = Math.min(r.monthDay || 1, daysInMonth(d.getFullYear(), d.getMonth()))
      return d.getDate() === want
    }
  }
}

export function occursOn(t: Task, k: DateKey): boolean {
  return t.kind === 'recurring' && !!t.rrule && matchesRule(t.rrule, k)
}

const WD_FULL = ['dom', 'lun', 'mar', 'mer', 'gio', 'ven', 'sab']

export function describeRule(r: RRule): string {
  switch (r.freq) {
    case 'daily':
      return 'Ogni giorno'
    case 'weekly': {
      const ws = [...(r.weekdays || [])].sort((a, b) => ((a + 6) % 7) - ((b + 6) % 7))
      if (ws.length === 0) return 'Nessun giorno'
      if (ws.length === 7) return 'Ogni giorno'
      return ws.map((d) => WD_FULL[d]).join(', ')
    }
    case 'interval':
      return (r.interval || 1) === 1 ? 'Ogni giorno' : `Ogni ${r.interval} giorni`
    case 'monthly':
      return `Il ${r.monthDay} di ogni mese`
  }
}
