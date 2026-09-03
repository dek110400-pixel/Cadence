import { useMemo, useState } from 'preact/hooks'
import type { DateKey } from '../domain/types'
import { computeInsights, type Bucket } from '../store/selectors'
import { useStore } from '../store/store'
import { Segmented } from '../ui/primitives'

const pct = (n: number) => Math.round(n * 100) + '%'

function BarList(props: { items: Bucket[] }) {
  if (props.items.length === 0) return <p class="dim">Nessun dato nel periodo.</p>
  return (
    <ul class="bars">
      {props.items.map((b) => {
        const r = b.total ? b.done / b.total : 0
        return (
          <li key={b.id}>
            <div class="bar-head">
              <span class="bar-label">
                {b.color && <span class="dot" style={{ background: b.color }} />}
                {b.label}
              </span>
              <span class="bar-value">
                {b.done}/{b.total} <em>{pct(r)}</em>
              </span>
            </div>
            <div class="bar-track">
              <div class="bar-fill" style={{ width: pct(r), background: b.color || 'var(--accent)' }} />
            </div>
          </li>
        )
      })}
    </ul>
  )
}

export function Insights(p: { today: DateKey }) {
  const s = useStore()
  const [win, setWin] = useState<'7' | '30' | '90'>('30')
  const ins = useMemo(() => computeInsights(p.today, Number(win)), [s.tasks, s.occurrences, p.today, win])

  return (
    <div class="insights">
      <div class="stat-hero">
        <div>
          <strong>{ins.streak}</strong>
          <span>giorni di fila con tutti i must do</span>
        </div>
        {ins.bestStreak > ins.streak && <p class="dim">Record: {ins.bestStreak} giorni</p>}
      </div>

      <div class="stat-pair">
        <div>
          <strong>{pct(ins.rate7)}</strong>
          <span>ultimi 7 giorni</span>
          {Math.abs(ins.delta7) >= 0.01 && (
            <em class={ins.delta7 >= 0 ? 'up' : 'down'}>
              {ins.delta7 >= 0 ? '+' : ''}
              {Math.round(ins.delta7 * 100)}
            </em>
          )}
        </div>
        <div>
          <strong>{pct(ins.rate30)}</strong>
          <span>ultimi 30 giorni</span>
        </div>
      </div>

      <Segmented
        value={win}
        onChange={setWin}
        options={[
          { value: '7', label: '7 giorni' },
          { value: '30', label: '30 giorni' },
          { value: '90', label: '90 giorni' }
        ]}
      />

      <section>
        <h2 class="section-label">Completate per categoria</h2>
        <BarList items={ins.byCategory} />
      </section>

      <section>
        <h2 class="section-label">Completate per tipologia</h2>
        <BarList items={ins.byType} />
      </section>

      {ins.topMissed.length > 0 && (
        <section>
          <h2 class="section-label">Più spesso non completate</h2>
          <ul class="missed">
            {ins.topMissed.map((m) => (
              <li key={m.task.id}>
                <span>{m.task.title}</span>
                <em>{m.missed}×</em>
              </li>
            ))}
          </ul>
          <p class="hint">Non è pigrizia: di solito una task rimandata spesso è formulata male o collocata nel momento sbagliato.</p>
        </section>
      )}

      <section>
        <h2 class="section-label">Andamento settimanale</h2>
        {ins.daysWithData < 14 ? (
          <p class="dim">Servono almeno 14 giorni di dati. Ne hai {ins.daysWithData}.</p>
        ) : (
          <div class="spark">
            {ins.weekly.map((w) => (
              <div class="spark-col" title={`${w.label}: ${pct(w.rate)}`}>
                <div class="spark-bar" style={{ height: Math.max(2, w.rate * 100) + '%' }} />
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
