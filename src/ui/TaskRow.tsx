import { useRef, useState } from 'preact/hooks'
import { timeToMin } from '../domain/dates'
import type { Category, Row } from '../domain/types'
import { IconBell, IconNote, IconRepeat } from './primitives'

interface Props {
  row: Row
  categories: Category[]
  /** true se la riga appartiene al giorno corrente */
  live: boolean
  nowMin: number
  optimisticDone?: boolean
  onToggle: (row: Row) => void
  onOpen: (row: Row) => void
  onSwipeRight?: (row: Row) => void
  onSwipeLeft?: (row: Row) => void
}

const THRESHOLD = 78

export function TaskRow(p: Props) {
  const { row, categories } = p
  const t = row.task
  const cat = categories.find((c) => c.id === t.categoryId)
  const done = p.optimisticDone || row.status === 'done'
  const skipped = row.status === 'skipped'

  const [dx, setDx] = useState(0)
  const [dragging, setDragging] = useState(false)
  const start = useRef<{ x: number; y: number; lock: 'none' | 'x' | 'y' } | null>(null)

  const canSwipe = !!(p.onSwipeRight || p.onSwipeLeft) && !done && !skipped

  const onDown = (e: PointerEvent) => {
    if (!canSwipe || e.pointerType === 'mouse') return
    start.current = { x: e.clientX, y: e.clientY, lock: 'none' }
  }
  const onMove = (e: PointerEvent) => {
    const s = start.current
    if (!s) return
    const ddx = e.clientX - s.x
    const ddy = e.clientY - s.y
    if (s.lock === 'none') {
      if (Math.abs(ddx) < 10 && Math.abs(ddy) < 10) return
      s.lock = Math.abs(ddx) > Math.abs(ddy) ? 'x' : 'y'
      if (s.lock === 'x') setDragging(true)
    }
    if (s.lock !== 'x') return
    const clamped = Math.max(-140, Math.min(140, ddx))
    setDx(p.onSwipeRight || clamped < 0 ? clamped : 0)
  }
  const onUp = () => {
    const s = start.current
    start.current = null
    setDragging(false)
    if (!s || s.lock !== 'x') return
    if (dx > THRESHOLD && p.onSwipeRight) p.onSwipeRight(row)
    else if (dx < -THRESHOLD && p.onSwipeLeft) p.onSwipeLeft(row)
    setDx(0)
  }

  const overdue =
    p.live && !done && !skipped && t.time ? timeToMin(t.time) < p.nowMin : false
  const meta: preact.ComponentChildren[] = []
  if (cat) meta.push(<span class="meta-cat"><span class="dot" style={{ background: cat.color }} />{cat.name}</span>)
  if (t.kind === 'recurring') meta.push(<span class="meta-i"><IconRepeat /></span>)
  if (t.estimatedMin) meta.push(<span>{t.estimatedMin}m</span>)
  if (row.lateDays > 0) meta.push(<span class="meta-late">{row.lateDays}g di ritardo</span>)
  if (t.note) meta.push(<span class="meta-i"><IconNote /></span>)
  if (row.occ?.log) meta.push(<span class="meta-log">{row.occ.log}</span>)

  return (
    <div class="task-wrap">
      {canSwipe && (
        <>
          <div class={'swipe-hint left' + (dx > THRESHOLD ? ' is-armed' : '')}>Domani</div>
          <div class={'swipe-hint right' + (dx < -THRESHOLD ? ' is-armed' : '')}>
            {t.kind === 'recurring' ? 'Salta' : 'Elimina'}
          </div>
        </>
      )}
      <div
        class={
          'task' +
          (done ? ' is-done' : '') +
          (skipped ? ' is-skipped' : '') +
          (t.mustDo ? ' is-must' : '') +
          (dragging ? ' is-dragging' : '')
        }
        style={dx ? { transform: `translateX(${dx}px)` } : undefined}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
      >
        <button
          class="check"
          aria-label={done ? 'Segna come da fare' : 'Completa'}
          onClick={(e) => {
            e.stopPropagation()
            p.onToggle(row)
          }}
        >
          <span class="check-box">
            <svg viewBox="0 0 24 24" class="check-mark">
              <path d="M5 12.5 10 17.5 19 7.5" />
            </svg>
          </span>
        </button>

        <div class="task-main" onClick={() => p.onOpen(row)}>
          <div class="task-title-line">
            <span class="task-title">{t.title}</span>
            {t.time && (
              <span class={'task-time' + (overdue ? ' is-overdue' : '')}>
                {t.alarm && <IconBell />}
                {t.time}
              </span>
            )}
          </div>
          {meta.length > 0 && <div class="task-meta">{meta}</div>}
        </div>
      </div>
    </div>
  )
}
