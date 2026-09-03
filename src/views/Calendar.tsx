import { useMemo, useState } from 'preact/hooks'
import { MONTHS, WD_SHORT, monthGrid, parseKey } from '../domain/dates'
import type { DateKey } from '../domain/types'
import { dayStats } from '../store/selectors'
import { useStore } from '../store/store'
import { IconChevron, Ring } from '../ui/primitives'

export function Calendar(p: { today: DateKey; onPick: (d: DateKey) => void }) {
  const s = useStore()
  const base = parseKey(p.today)
  const [ym, setYm] = useState({ y: base.getFullYear(), m: base.getMonth() })

  const cells = useMemo(() => {
    return monthGrid(ym.y, ym.m).map((k) => {
      const inMonth = parseKey(k).getMonth() === ym.m
      const future = k > p.today
      const st = inMonth && !future ? dayStats(k, p.today) : null
      return { k, inMonth, future, st }
    })
  }, [ym, s.tasks, s.occurrences, p.today])

  const month = cells.filter((c) => c.inMonth && c.st)
  const totals = month.reduce(
    (a, c) => ({ done: a.done + c.st!.done, total: a.total + c.st!.total, missed: a.missed + (c.st!.mustTotal - c.st!.mustDone) }),
    { done: 0, total: 0, missed: 0 }
  )

  const shift = (n: number) => {
    const d = new Date(ym.y, ym.m + n, 1)
    setYm({ y: d.getFullYear(), m: d.getMonth() })
  }

  return (
    <div class="cal">
      <div class="cal-head">
        <button class="icon-btn" onClick={() => shift(-1)} aria-label="Mese precedente"><IconChevron dir="left" /></button>
        <h2>{MONTHS[ym.m]} {ym.y}</h2>
        <button class="icon-btn" onClick={() => shift(1)} aria-label="Mese successivo"><IconChevron /></button>
      </div>

      <div class="cal-grid cal-wd">
        {WD_SHORT.map((w) => <span>{w}</span>)}
      </div>

      <div class="cal-grid">
        {cells.map((c) => {
          const rate = c.st && c.st.total ? c.st.done / c.st.total : 0
          const missedMust = c.st ? c.st.mustTotal > c.st.mustDone : false
          return (
            <button
              key={c.k}
              class={'cal-cell' + (c.inMonth ? '' : ' is-out') + (c.k === p.today ? ' is-today' : '')}
              onClick={() => p.onPick(c.k)}
            >
              <span class="cal-ring"><Ring value={rate} size={34} stroke={2} /></span>
              <span class="cal-num">{parseKey(c.k).getDate()}</span>
              {missedMust && <span class="cal-dot" />}
            </button>
          )
        })}
      </div>

      <div class="cal-summary">
        <div><strong>{totals.done}</strong><span>completate</span></div>
        <div><strong>{totals.total ? Math.round((totals.done / totals.total) * 100) : 0}%</strong><span>del mese</span></div>
        <div><strong>{totals.missed}</strong><span>must do mancati</span></div>
      </div>
      <p class="hint">L'anello mostra la quota di task completate. Il punto segnala un must do mancato.</p>
    </div>
  )
}
