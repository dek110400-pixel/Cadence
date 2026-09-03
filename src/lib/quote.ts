import type { DateKey } from '../domain/types'
import { QUOTES, type Quote } from '../data/quotes'

/** FNV-1a: stessa chiave giorno → stesso indice, su ogni dispositivo, senza rete. */
function hash(s: string): number {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

export function quoteOfDay(day: DateKey): Quote {
  return QUOTES[hash(day) % QUOTES.length]
}
