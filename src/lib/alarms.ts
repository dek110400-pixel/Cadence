import { minutesNow, timeToMin } from '../domain/dates'
import type { DateKey, Row } from '../domain/types'

/**
 * Sveglie in-app.
 *
 * LIMITE REALE, da comunicare all'utente: iOS non permette a una PWA di
 * schedulare notifiche locali quando l'app è chiusa. Le sveglie scattano
 * quando l'app è aperta (anche in background nella stessa sessione) e, alla
 * riapertura, vengono mostrate come "sveglie mancate" del giorno.
 */

const FIRED_KEY = 'cadence.fired'
const SNOOZE_KEY = 'cadence.snooze'

type FiredMap = Record<string, string[]>
type SnoozeMap = Record<string, number> // key -> minuti del giorno

function read<T>(k: string, fallback: T): T {
  try {
    return JSON.parse(localStorage.getItem(k) || '') ?? fallback
  } catch {
    return fallback
  }
}
function write(k: string, v: unknown) {
  try {
    localStorage.setItem(k, JSON.stringify(v))
  } catch {}
}

export function markFired(date: DateKey, key: string) {
  const m = read<FiredMap>(FIRED_KEY, {})
  const list = new Set(m[date] || [])
  list.add(key)
  write(FIRED_KEY, { [date]: [...list] }) // teniamo solo il giorno corrente
}

export function hasFired(date: DateKey, key: string): boolean {
  const m = read<FiredMap>(FIRED_KEY, {})
  return (m[date] || []).includes(key)
}

export function snooze(key: string, minutes: number) {
  const m = read<SnoozeMap>(SNOOZE_KEY, {})
  m[key] = minutesNow() + minutes
  write(SNOOZE_KEY, m)
}

function snoozedUntil(key: string): number | null {
  const m = read<SnoozeMap>(SNOOZE_KEY, {})
  return m[key] ?? null
}

export function clearSnooze(key: string) {
  const m = read<SnoozeMap>(SNOOZE_KEY, {})
  delete m[key]
  write(SNOOZE_KEY, m)
}

/** Righe la cui sveglia è scattata e non ancora gestita. */
export function dueAlarms(rows: Row[], date: DateKey, isToday: boolean): Row[] {
  if (!isToday) return []
  const nowMin = minutesNow()
  return rows.filter((r) => {
    if (!r.task.alarm || !r.task.time || r.status !== 'todo') return false
    const sn = snoozedUntil(r.key)
    if (sn !== null) return nowMin >= sn
    if (hasFired(date, r.key)) return false
    return nowMin >= timeToMin(r.task.time)
  })
}

// --- suono -----------------------------------------------------------------

let ctx: AudioContext | null = null

/** Su iOS l'audio va sbloccato da un gesto utente: chiamato al primo tap. */
export function unlockAudio() {
  if (ctx) return
  try {
    ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
    const b = ctx.createBuffer(1, 1, 22050)
    const s = ctx.createBufferSource()
    s.buffer = b
    s.connect(ctx.destination)
    s.start(0)
  } catch {}
}

export function playChime(repeat = 3) {
  if (!ctx) return
  const c = ctx
  const base = c.currentTime
  for (let i = 0; i < repeat; i++) {
    for (const [j, f] of [880, 1174].entries()) {
      const t = base + i * 0.62 + j * 0.16
      const osc = c.createOscillator()
      const g = c.createGain()
      osc.type = 'sine'
      osc.frequency.value = f
      g.gain.setValueAtTime(0.0001, t)
      g.gain.exponentialRampToValueAtTime(0.22, t + 0.02)
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.34)
      osc.connect(g).connect(c.destination)
      osc.start(t)
      osc.stop(t + 0.36)
    }
  }
}

export function playTick() {
  if (!ctx) return
  const c = ctx
  const t = c.currentTime
  const osc = c.createOscillator()
  const g = c.createGain()
  osc.type = 'sine'
  osc.frequency.value = 1320
  g.gain.setValueAtTime(0.0001, t)
  g.gain.exponentialRampToValueAtTime(0.06, t + 0.008)
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.12)
  osc.connect(g).connect(c.destination)
  osc.start(t)
  osc.stop(t + 0.14)
}

export function buzz(pattern: number | number[] = 18) {
  try {
    navigator.vibrate?.(pattern) // no-op su iOS
  } catch {}
}

export async function requestNotifications(): Promise<boolean> {
  if (!('Notification' in window)) return false
  if (Notification.permission === 'granted') return true
  const p = await Notification.requestPermission()
  return p === 'granted'
}

export function systemNotify(title: string, body: string) {
  if (!('Notification' in window) || Notification.permission !== 'granted') return
  try {
    new Notification(title, { body, icon: '/icons/icon-192.png', tag: 'cadence-alarm' })
  } catch {}
}
