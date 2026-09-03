import { useEffect, useState } from 'preact/hooks'
import { formatLong } from '../domain/dates'
import type { DateKey, Row } from '../domain/types'
import * as A from '../store/actions'
import { rowsForDay, statsOf } from '../store/selectors'
import { idx, useStore } from '../store/store'
import { Sheet } from '../ui/primitives'

export function ReviewSheet(props: { open: boolean; date: DateKey; today: DateKey; onClose: () => void }) {
  const s = useStore()
  const [note, setNote] = useState('')

  useEffect(() => {
    if (props.open) setNote(idx.dayLog(props.date)?.note || '')
  }, [props.open, props.date])

  if (!props.open) return null
  const rows = rowsForDay(props.date, props.today)
  const st = statsOf(rows)
  const open = rows.filter((r) => r.status === 'todo')

  return (
    <Sheet open={props.open} onClose={props.onClose}>
      <div class="review">
        <p class="review-date">{formatLong(props.date)}</p>
        <div class="review-num">
          <strong>{st.done} / {st.total}</strong>
          <span>task completate</span>
        </div>
        {st.mustTotal > 0 && (
          <div class={'review-num' + (st.mustDone === st.mustTotal ? ' is-ok' : ' is-warn')}>
            <strong>{st.mustDone} / {st.mustTotal}</strong>
            <span>must do</span>
          </div>
        )}
        {st.skipped > 0 && <p class="dim">{st.skipped} saltate</p>}

        {open.length > 0 && (
          <div class="review-open">
            <h3 class="section-label">Non completate</h3>
            <ul>
              {open.map((r) => (
                <li key={r.key}>{r.task.title}</li>
              ))}
            </ul>
          </div>
        )}

        <h3 class="section-label">Com'è andata?</h3>
        <textarea rows={3} value={note} onInput={(e) => setNote((e.target as HTMLTextAreaElement).value)} />

        <div class="sheet-actions">
          <button
            class="btn btn-primary"
            onClick={() => {
              A.setDayNote(props.date, note)
              A.markReviewed(props.date)
              props.onClose()
            }}
          >
            Chiudi la giornata
          </button>
        </div>
      </div>
    </Sheet>
  )
}

export function AlarmOverlay(props: {
  rows: Row[]
  onDone: (r: Row) => void
  onSnooze: (r: Row) => void
  onDismiss: (r: Row) => void
}) {
  const r = props.rows[0]
  if (!r) return null
  return (
    <div class="alarm-root">
      <div class="alarm">
        <p class="alarm-time">{r.task.time}</p>
        <h2 class="alarm-title">{r.task.title}</h2>
        {r.task.note && <p class="alarm-note">{r.task.note}</p>}
        <div class="alarm-actions">
          <button class="btn btn-primary" onClick={() => props.onDone(r)}>Fatto</button>
          <button class="btn btn-ghost" onClick={() => props.onSnooze(r)}>Rimanda 10 min</button>
          <button class="link-btn" onClick={() => props.onDismiss(r)}>Chiudi</button>
        </div>
      </div>
    </div>
  )
}
