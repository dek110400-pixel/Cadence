import { useEffect, useMemo, useState } from 'preact/hooks'
import { addDays, formatLong, formatRelative, minutesNow } from '../domain/dates'
import type { DateKey, Row } from '../domain/types'
import * as A from '../store/actions'
import { rowsForDay, statsOf } from '../store/selectors'
import { useStore } from '../store/store'
import { IconChevron, IconSettings, QuoteBar, Ring } from '../ui/primitives'
import { TaskRow } from '../ui/TaskRow'
import { playTick, buzz } from '../lib/alarms'
import { quoteOfDay } from '../lib/quote'

interface Props {
  date: DateKey
  today: DateKey
  onDate: (d: DateKey) => void
  onOpenTask: (r: Row) => void
  onSettings: () => void
  onReview: () => void
  onLog: (t: { taskId: string; date: DateKey; title: string }) => void
  toast: (text: string, actions?: { label: string; onClick: () => void }[]) => void
}

export function Today(p: Props) {
  const s = useStore()
  const [pending, setPending] = useState<string | null>(null)
  const [showDone, setShowDone] = useState(false)
  const [nowMin, setNowMin] = useState(minutesNow())

  useEffect(() => {
    const id = setInterval(() => setNowMin(minutesNow()), 30_000)
    return () => clearInterval(id)
  }, [])

  const quote = useMemo(() => quoteOfDay(p.today), [p.today])
  const isToday = p.date === p.today
  const isPast = p.date < p.today
  const rows = useMemo(() => rowsForDay(p.date, p.today), [s.tasks, s.occurrences, p.date, p.today])
  const stats = statsOf(rows)

  const must = rows.filter((r) => r.task.mustDo && r.status !== 'done')
  const normal = rows.filter((r) => !r.task.mustDo && r.status !== 'done')
  const doneRows = rows.filter((r) => r.status === 'done')

  const toggle = (r: Row) => {
    if (r.status === 'done') {
      A.uncomplete(r.task.id, p.date)
      return
    }
    if (r.status === 'skipped') {
      A.setStatus(r.task.id, p.date, null)
      return
    }
    if (s.settings.sound) playTick()
    buzz()
    setPending(r.key)
    setTimeout(() => {
      A.complete(r.task.id, p.date)
      setPending(null)
      p.toast('Completata', [
        { label: 'Annulla', onClick: () => A.uncomplete(r.task.id, p.date) },
        { label: 'Nota', onClick: () => p.onLog({ taskId: r.task.id, date: p.date, title: r.task.title }) }
      ])
    }, 380)
  }

  const swipeRight = (r: Row) => {
    const undo = A.moveToNextDay(r.task.id, p.date)
    p.toast(`"${r.task.title}" spostata a domani`, [{ label: 'Annulla', onClick: undo }])
  }

  const swipeLeft = (r: Row) => {
    if (r.task.kind === 'recurring') {
      A.skip(r.task.id, p.date)
      p.toast('Saltata oggi', [{ label: 'Annulla', onClick: () => A.setStatus(r.task.id, p.date, null) }])
    } else {
      A.deleteTask(r.task.id)
      p.toast('Task eliminata')
    }
  }

  const rowProps = {
    categories: s.categories,
    live: isToday,
    nowMin,
    onToggle: toggle,
    onOpen: p.onOpenTask,
    onSwipeRight: isPast ? undefined : swipeRight,
    onSwipeLeft: isPast ? undefined : swipeLeft
  }

  return (
    <div class="view">
      <QuoteBar text={quote.text} author={quote.author} />
      <header class="head">
        <div class="head-nav">
          <button class="icon-btn" onClick={() => p.onDate(addDays(p.date, -1))} aria-label="Giorno precedente">
            <IconChevron dir="left" />
          </button>
          <label class="head-date">
            <span class="head-kicker">{formatRelative(p.date, p.today)}</span>
            <input class="chip-native" type="date" value={p.date} onChange={(e) => p.onDate((e.target as HTMLInputElement).value)} />
          </label>
          <button class="icon-btn" onClick={() => p.onDate(addDays(p.date, 1))} aria-label="Giorno successivo">
            <IconChevron />
          </button>
        </div>
        <button class="icon-btn" onClick={p.onSettings} aria-label="Impostazioni">
          <IconSettings />
        </button>
      </header>

      <div class="head-sub">
        <h1>{formatLong(p.date)}</h1>
        <button class="counter" onClick={p.onReview} aria-label="Riepilogo della giornata">
          <span>
            {stats.done} di {stats.total}
            {stats.mustTotal > 0 && <em> · {stats.mustDone}/{stats.mustTotal} must</em>}
          </span>
          <Ring value={stats.total ? stats.done / stats.total : 0} />
        </button>
      </div>

      {rows.length === 0 && (
        <div class="empty">
          <p>Nessuna task per {isToday ? 'oggi' : 'questo giorno'}.</p>
          <p class="dim">Tocca + per aggiungerne una.</p>
        </div>
      )}

      {must.length > 0 && (
        <section>
          <h2 class="section-label">Must do</h2>
          <div class="list">
            {must.map((r) => (
              <TaskRow key={r.key} row={r} optimisticDone={pending === r.key} {...rowProps} />
            ))}
          </div>
        </section>
      )}

      {normal.length > 0 && (
        <section>
          {must.length > 0 && <h2 class="section-label">Altro</h2>}
          <div class="list">
            {normal.map((r) => (
              <TaskRow key={r.key} row={r} optimisticDone={pending === r.key} {...rowProps} />
            ))}
          </div>
        </section>
      )}

      {doneRows.length > 0 && (
        <section class="done-section">
          <button class="section-toggle" onClick={() => setShowDone(!showDone)}>
            <span class="section-label">Completate ({doneRows.length})</span>
            <span class={'chev' + (showDone ? ' is-open' : '')}>
              <IconChevron dir={showDone ? 'down' : 'right'} />
            </span>
          </button>
          {showDone && (
            <div class="list">
              {doneRows.map((r) => (
                <TaskRow key={r.key} row={r} {...rowProps} />
              ))}
            </div>
          )}
        </section>
      )}

      {isToday && stats.total > 0 && stats.done === stats.total && (
        <button class="close-day" onClick={p.onReview}>
          Chiudi la giornata
        </button>
      )}
    </div>
  )
}
