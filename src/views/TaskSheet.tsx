import { useEffect, useMemo, useState } from 'preact/hooks'
import { addDays, dayOfWeek, formatLong, formatShort, parseKey, WD_SHORT } from '../domain/dates'
import { describeRule } from '../domain/recurrence'
import type { DateKey, Freq, Row, RRule, Task } from '../domain/types'
import * as A from '../store/actions'
import { idx, useStore } from '../store/store'
import { Chip, Field, Sheet } from '../ui/primitives'

type Mode = { kind: 'create'; date: DateKey } | { kind: 'edit'; row: Row; date: DateKey }

const WD_ORDER = [1, 2, 3, 4, 5, 6, 0] // lunedì → domenica

export function TaskSheet(props: { mode: Mode | null; onClose: () => void }) {
  const s = useStore()
  const open = !!props.mode
  const editing = props.mode?.kind === 'edit' ? props.mode.row.task : null
  const day = props.mode?.date || ''

  const [title, setTitle] = useState('')
  const [note, setNote] = useState('')
  const [date, setDate] = useState<DateKey>(day)
  const [time, setTime] = useState('')
  const [alarm, setAlarm] = useState(false)
  const [mustDo, setMustDo] = useState(false)
  const [categoryId, setCategoryId] = useState<string | null>(null)
  const [estimated, setEstimated] = useState('')
  const [repeat, setRepeat] = useState(false)
  const [freq, setFreq] = useState<Freq>('weekly')
  const [weekdays, setWeekdays] = useState<number[]>([])
  const [interval, setInterval] = useState(2)
  const [monthDay, setMonthDay] = useState(1)
  const [more, setMore] = useState(false)

  useEffect(() => {
    if (!props.mode) return
    const t = props.mode.kind === 'edit' ? props.mode.row.task : null
    setTitle(t?.title || '')
    setNote(t?.note || '')
    setDate(t?.kind === 'single' ? t.date || props.mode.date : props.mode.date)
    setTime(t?.time || '')
    setAlarm(!!t?.alarm)
    setMustDo(!!t?.mustDo)
    setCategoryId(t?.categoryId ?? null)
    setEstimated(t?.estimatedMin ? String(t.estimatedMin) : '')
    const r = t?.rrule
    setRepeat(!!r)
    setFreq(r?.freq || 'weekly')
    setWeekdays(r?.weekdays || [dayOfWeek(props.mode.date)])
    setInterval(r?.interval || 2)
    setMonthDay(r?.monthDay || parseKey(props.mode.date).getDate())
    setMore(!!t?.note || !!t?.estimatedMin)
  }, [props.mode])

  const mustCount = useMemo(
    () => s.tasks.filter((t) => !t.deletedAt && t.mustDo && (t.kind === 'recurring' || t.date === day)).length,
    [s.tasks, day]
  )

  if (!open) return null

  const rrule = (): RRule => ({
    freq,
    weekdays: freq === 'weekly' ? weekdays : undefined,
    interval: freq === 'interval' ? Math.max(1, interval) : undefined,
    monthDay: freq === 'monthly' ? Math.min(31, Math.max(1, monthDay)) : undefined,
    startDate: editing?.rrule?.startDate || date || day,
    endDate: editing?.rrule?.endDate ?? null
  })

  const save = () => {
    if (!title.trim()) return
    const base: Partial<Task> = {
      title,
      note: note.trim() || undefined,
      categoryId,
      mustDo,
      time: time || null,
      alarm: !!time && alarm,
      estimatedMin: estimated ? Number(estimated) : null
    }
    if (editing) {
      A.updateTask(editing.id, {
        ...base,
        kind: repeat ? 'recurring' : 'single',
        date: repeat ? null : date,
        rrule: repeat ? rrule() : null
      })
    } else {
      A.createTask({
        ...(base as { title: string }),
        kind: repeat ? 'recurring' : 'single',
        date: repeat ? null : date,
        rrule: repeat ? rrule() : null
      })
    }
    props.onClose()
  }

  const remove = () => {
    if (!editing) return
    A.deleteTask(editing.id)
    props.onClose()
  }

  const history = editing?.kind === 'recurring' ? idx.occsOf(editing.id).slice().sort((a, b) => (a.date < b.date ? 1 : -1)).slice(0, 8) : []

  return (
    <Sheet open={open} onClose={props.onClose} title={editing ? 'Modifica' : 'Nuova task'}>
      <input
        class="title-input"
        value={title}
        placeholder="Cosa devi fare?"
        autoFocus={!editing}
        enterkeyhint="done"
        onInput={(e) => setTitle((e.target as HTMLInputElement).value)}
        onKeyDown={(e) => e.key === 'Enter' && save()}
      />

      {!repeat && (
        <div class="chips">
          <Chip active={date === day} onClick={() => setDate(day)}>Oggi</Chip>
          <Chip active={date === addDays(day, 1)} onClick={() => setDate(addDays(day, 1))}>Domani</Chip>
          <label class={'chip' + (date !== day && date !== addDays(day, 1) ? ' is-active' : '')}>
            {date !== day && date !== addDays(day, 1) ? formatShort(date) : 'Data…'}
            <input class="chip-native" type="date" value={date} onChange={(e) => setDate((e.target as HTMLInputElement).value)} />
          </label>
        </div>
      )}

      <div class="chips">
        <label class={'chip' + (time ? ' is-active' : '')}>
          {time || 'Ora…'}
          <input class="chip-native" type="time" value={time} onChange={(e) => setTime((e.target as HTMLInputElement).value)} />
        </label>
        {time && (
          <>
            <Chip active={alarm} onClick={() => setAlarm(!alarm)}>Sveglia</Chip>
            <Chip onClick={() => { setTime(''); setAlarm(false) }}>✕ ora</Chip>
          </>
        )}
        <Chip active={mustDo} onClick={() => setMustDo(!mustDo)}>Must do</Chip>
        <Chip active={repeat} onClick={() => setRepeat(!repeat)}>Ricorrente</Chip>
      </div>

      {mustDo && mustCount >= 3 && !editing?.mustDo && (
        <p class="hint">{mustCount + 1} must do oggi. Ne consigliamo massimo 3.</p>
      )}

      <div class="chips">
        <Chip active={!categoryId} onClick={() => setCategoryId(null)}>Nessuna</Chip>
        {s.categories.map((c) => (
          <Chip active={categoryId === c.id} color={c.color} onClick={() => setCategoryId(c.id)}>
            {c.name}
          </Chip>
        ))}
      </div>

      {repeat && (
        <div class="block">
          <div class="chips">
            {([['daily', 'Ogni giorno'], ['weekly', 'Giorni'], ['interval', 'Ogni X giorni'], ['monthly', 'Mensile']] as [Freq, string][]).map(
              ([f, label]) => (
                <Chip active={freq === f} onClick={() => setFreq(f)}>{label}</Chip>
              )
            )}
          </div>
          {freq === 'weekly' && (
            <div class="wd-picker">
              {WD_ORDER.map((d, i) => (
                <button
                  class={'wd' + (weekdays.includes(d) ? ' is-active' : '')}
                  onClick={() => setWeekdays(weekdays.includes(d) ? weekdays.filter((x) => x !== d) : [...weekdays, d])}
                >
                  {WD_SHORT[i]}
                </button>
              ))}
            </div>
          )}
          {freq === 'interval' && (
            <Field label="Ogni quanti giorni">
              <input type="number" min={1} max={365} value={interval} onInput={(e) => setInterval(Number((e.target as HTMLInputElement).value))} />
            </Field>
          )}
          {freq === 'monthly' && (
            <Field label="Giorno del mese" hint="Il 29, 30 o 31 cade sull'ultimo giorno nei mesi più corti.">
              <input type="number" min={1} max={31} value={monthDay} onInput={(e) => setMonthDay(Number((e.target as HTMLInputElement).value))} />
            </Field>
          )}
          <p class="hint">{describeRule(rrule())}</p>
        </div>
      )}

      {!more ? (
        <button class="link-btn" onClick={() => setMore(true)}>Nota e durata</button>
      ) : (
        <div class="block">
          <Field label="Nota">
            <textarea rows={2} value={note} placeholder="Dettagli utili per eseguirla" onInput={(e) => setNote((e.target as HTMLTextAreaElement).value)} />
          </Field>
          <Field label="Durata stimata (minuti)">
            <input type="number" min={1} max={1440} value={estimated} onInput={(e) => setEstimated((e.target as HTMLInputElement).value)} />
          </Field>
        </div>
      )}

      {history.length > 0 && (
        <div class="block">
          <h3 class="section-label">Storico</h3>
          <ul class="log-list">
            {history.map((o) => (
              <li>
                <span class="log-date">{formatShort(o.date)}</span>
                <span class={'log-status s-' + o.status}>
                  {o.status === 'done' ? 'fatta' : o.status === 'skipped' ? 'saltata' : 'spostata'}
                </span>
                {o.log && <span class="log-text">{o.log}</span>}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div class="sheet-actions">
        {editing && (
          <button class="btn btn-ghost is-danger" onClick={remove}>
            Elimina
          </button>
        )}
        <button class="btn btn-primary" disabled={!title.trim()} onClick={save}>
          {editing ? 'Salva' : 'Aggiungi'}
        </button>
      </div>
      {editing?.kind === 'recurring' && (
        <p class="hint">Le modifiche valgono da oggi in avanti. Lo storico dei giorni passati resta invariato.</p>
      )}
    </Sheet>
  )
}

// --- Sheet per il commento post-completamento ------------------------------

export function LogSheet(props: { target: { taskId: string; date: DateKey; title: string } | null; onClose: () => void }) {
  const [text, setText] = useState('')
  useEffect(() => {
    if (!props.target) return
    setText(idx.occ(props.target.taskId, props.target.date)?.log || '')
  }, [props.target])

  if (!props.target) return null
  const t = props.target
  return (
    <Sheet open onClose={props.onClose} title={t.title}>
      <p class="hint">{formatLong(t.date)} · com'è andata?</p>
      <textarea
        rows={4}
        autoFocus
        value={text}
        placeholder="Gambe pesanti, fatto comunque in 43 minuti."
        onInput={(e) => setText((e.target as HTMLTextAreaElement).value)}
      />
      <div class="sheet-actions">
        <button
          class="btn btn-primary"
          onClick={() => {
            A.setLog(t.taskId, t.date, text)
            props.onClose()
          }}
        >
          Salva
        </button>
      </div>
    </Sheet>
  )
}
