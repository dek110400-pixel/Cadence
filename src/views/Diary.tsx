import { useMemo, useState } from 'preact/hooks'
import { formatLong, formatShort } from '../domain/dates'
import type { DateKey } from '../domain/types'
import * as A from '../store/actions'
import { useStore } from '../store/store'

interface Entry {
  date: DateKey
  note?: string
  logs: { title: string; text: string }[]
}

export function Diary(p: { today: DateKey; onPick: (d: DateKey) => void }) {
  const s = useStore()
  const [editing, setEditing] = useState<DateKey | null>(null)
  const [draft, setDraft] = useState('')
  const [query, setQuery] = useState('')

  const entries = useMemo<Entry[]>(() => {
    const map = new Map<DateKey, Entry>()
    for (const d of s.dayLogs) {
      if (!d.note) continue
      map.set(d.date, { date: d.date, note: d.note, logs: [] })
    }
    for (const o of s.occurrences) {
      if (!o.log) continue
      const t = s.tasks.find((x) => x.id === o.taskId)
      const e = map.get(o.date) || { date: o.date, logs: [] }
      e.logs.push({ title: t?.title || 'Task', text: o.log })
      map.set(o.date, e)
    }
    let list = [...map.values()].sort((a, b) => (a.date < b.date ? 1 : -1))
    if (query.trim()) {
      const q = query.toLowerCase()
      list = list.filter(
        (e) =>
          e.note?.toLowerCase().includes(q) ||
          e.logs.some((l) => l.text.toLowerCase().includes(q) || l.title.toLowerCase().includes(q))
      )
    }
    return list
  }, [s.dayLogs, s.occurrences, s.tasks, query])

  const todayNote = s.dayLogs.find((d) => d.date === p.today)?.note || ''

  const startEdit = (date: DateKey, current: string) => {
    setEditing(date)
    setDraft(current)
  }
  const commit = () => {
    if (editing) A.setDayNote(editing, draft)
    setEditing(null)
  }

  return (
    <div class="diary">
      <div class="diary-today">
        <h2 class="section-label">Oggi · {formatLong(p.today)}</h2>
        {editing === p.today ? (
          <>
            <textarea
              rows={4}
              autoFocus
              value={draft}
              placeholder="Com'è andata la giornata?"
              onInput={(e) => setDraft((e.target as HTMLTextAreaElement).value)}
            />
            <div class="sheet-actions">
              <button class="btn btn-ghost" onClick={() => setEditing(null)}>Annulla</button>
              <button class="btn btn-primary" onClick={commit}>Salva</button>
            </div>
          </>
        ) : (
          <button class="diary-write" onClick={() => startEdit(p.today, todayNote)}>
            {todayNote || 'Scrivi la voce di oggi…'}
          </button>
        )}
      </div>

      <input
        class="search"
        type="search"
        value={query}
        placeholder="Cerca nel diario"
        onInput={(e) => setQuery((e.target as HTMLInputElement).value)}
      />

      {entries.length === 0 && <p class="empty dim">Nessuna voce. Le note che scrivi dopo aver completato una task finiscono qui.</p>}

      <ol class="diary-list">
        {entries.map((e) => (
          <li key={e.date}>
            <button class="diary-date" onClick={() => p.onPick(e.date)}>
              {formatShort(e.date)}
            </button>
            {e.note &&
              (editing === e.date ? (
                <>
                  <textarea rows={3} autoFocus value={draft} onInput={(ev) => setDraft((ev.target as HTMLTextAreaElement).value)} />
                  <div class="sheet-actions">
                    <button class="btn btn-ghost" onClick={() => setEditing(null)}>Annulla</button>
                    <button class="btn btn-primary" onClick={commit}>Salva</button>
                  </div>
                </>
              ) : (
                <p class="diary-note" onClick={() => startEdit(e.date, e.note || '')}>
                  {e.note}
                </p>
              ))}
            {e.logs.length > 0 && (
              <ul class="diary-logs">
                {e.logs.map((l) => (
                  <li>
                    <span class="log-task">{l.title}</span>
                    <span class="log-text">{l.text}</span>
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ol>
    </div>
  )
}
