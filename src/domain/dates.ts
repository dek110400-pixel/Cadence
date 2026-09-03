import type { DateKey } from './types'

const p2 = (n: number) => (n < 10 ? '0' + n : '' + n)

export function dateKey(d: Date): DateKey {
  return `${d.getFullYear()}-${p2(d.getMonth() + 1)}-${p2(d.getDate())}`
}

/** Mezzanotte locale della chiave. */
export function parseKey(k: DateKey): Date {
  const [y, m, d] = k.split('-').map(Number)
  return new Date(y, m - 1, d)
}

/** Il "giorno di oggi" tenendo conto dell'ora di inizio giornata. */
export function todayKey(dayStartHour = 4, now = Date.now()): DateKey {
  return dateKey(new Date(now - dayStartHour * 3600_000))
}

export function addDays(k: DateKey, n: number): DateKey {
  const d = parseKey(k)
  d.setDate(d.getDate() + n)
  return dateKey(d)
}

export function diffDays(a: DateKey, b: DateKey): number {
  const ms = parseKey(b).getTime() - parseKey(a).getTime()
  return Math.round(ms / 86_400_000)
}

/** 0=domenica .. 6=sabato */
export function dayOfWeek(k: DateKey): number {
  return parseKey(k).getDay()
}

export function daysInMonth(year: number, month0: number): number {
  return new Date(year, month0 + 1, 0).getDate()
}

export function timeToMin(t?: string | null): number {
  if (!t) return -1
  const [h, m] = t.split(':').map(Number)
  return h * 60 + m
}

export function minutesNow(now = new Date()): number {
  return now.getHours() * 60 + now.getMinutes()
}

const WD = ['domenica', 'lunedì', 'martedì', 'mercoledì', 'giovedì', 'venerdì', 'sabato']
const MO = [
  'gennaio', 'febbraio', 'marzo', 'aprile', 'maggio', 'giugno',
  'luglio', 'agosto', 'settembre', 'ottobre', 'novembre', 'dicembre'
]
/** Etichette colonne calendario, lunedì primo. */
export const WD_SHORT = ['L', 'M', 'M', 'G', 'V', 'S', 'D']
export const MONTHS = MO

/** "giovedì 3 settembre" */
export function formatLong(k: DateKey): string {
  const d = parseKey(k)
  return `${WD[d.getDay()]} ${d.getDate()} ${MO[d.getMonth()]}`
}

/** "3 set" */
export function formatShort(k: DateKey): string {
  const d = parseKey(k)
  return `${d.getDate()} ${MO[d.getMonth()].slice(0, 3)}`
}

/** Oggi / Domani / Ieri / data breve */
export function formatRelative(k: DateKey, today: DateKey): string {
  const n = diffDays(today, k)
  if (n === 0) return 'Oggi'
  if (n === 1) return 'Domani'
  if (n === -1) return 'Ieri'
  return formatShort(k)
}

/** Indice 0-6 con lunedì primo. */
export function mondayIndex(jsDay: number): number {
  return (jsDay + 6) % 7
}

/** Griglia del mese: 6 settimane × 7 giorni, lunedì primo. */
export function monthGrid(year: number, month0: number): DateKey[] {
  const first = new Date(year, month0, 1)
  const start = new Date(first)
  start.setDate(1 - mondayIndex(first.getDay()))
  const out: DateKey[] = []
  for (let i = 0; i < 42; i++) {
    out.push(dateKey(start))
    start.setDate(start.getDate() + 1)
  }
  return out
}

/** Lunedì della settimana che contiene k. */
export function weekStart(k: DateKey): DateKey {
  return addDays(k, -mondayIndex(dayOfWeek(k)))
}

export function rangeKeys(from: DateKey, to: DateKey): DateKey[] {
  const out: DateKey[] = []
  let c = from
  while (c <= to) {
    out.push(c)
    c = addDays(c, 1)
  }
  return out
}
