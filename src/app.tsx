import { useEffect, useState } from 'preact/hooks'
import { todayKey } from './domain/dates'
import type { DateKey, Row } from './domain/types'
import {
  buzz, clearSnooze, dueAlarms, markFired, playChime, snooze, systemNotify, unlockAudio
} from './lib/alarms'
import { isIOS, isStandalone, useInterval, useKeyboardInset } from './lib/hooks'
import * as A from './store/actions'
import { rowsForDay } from './store/selectors'
import { patchSettings, useStore } from './store/store'
import {
  IconBook, IconHistory, IconInsights, IconPlus, IconToday, Segmented, Toast, type ToastData
} from './ui/primitives'
import { Calendar } from './views/Calendar'
import { Diary } from './views/Diary'
import { Insights } from './views/Insights'
import { AlarmOverlay, ReviewSheet } from './views/Overlays'
import { SettingsSheet } from './views/Settings'
import { LogSheet, TaskSheet } from './views/TaskSheet'
import { Today } from './views/Today'

type Nav = 'today' | 'history'
type Hist = 'calendar' | 'diary' | 'insights'
type SheetMode = { kind: 'create'; date: DateKey } | { kind: 'edit'; row: Row; date: DateKey } | null

export function App() {
  const s = useStore()
  useKeyboardInset()

  const [today, setToday] = useState(() => todayKey(s.settings.dayStartHour))
  const [date, setDate] = useState(today)
  const [nav, setNav] = useState<Nav>('today')
  const [hist, setHist] = useState<Hist>('calendar')
  const [sheet, setSheet] = useState<SheetMode>(null)
  const [settingsOpen, setSettings] = useState(false)
  const [reviewOpen, setReview] = useState(false)
  const [logTarget, setLogTarget] = useState<{ taskId: string; date: DateKey; title: string } | null>(null)
  const [toast, setToast] = useState<ToastData | null>(null)
  const [alarms, setAlarms] = useState<Row[]>([])
  const [needRefresh, setNeedRefresh] = useState(false)

  const pushToast = (text: string, actions?: ToastData['actions']) =>
    setToast({ id: Date.now(), text, actions })

  // sblocco audio al primo gesto (requisito iOS)
  useEffect(() => {
    const h = () => unlockAudio()
    addEventListener('pointerdown', h, { once: true })
    return () => removeEventListener('pointerdown', h)
  }, [])

  // aggiornamento service worker
  useEffect(() => {
    import('virtual:pwa-register')
      .then(({ registerSW }) => registerSW({ immediate: true, onNeedRefresh: () => setNeedRefresh(true) }))
      .catch(() => {})
  }, [])

  // rollover di mezzanotte + tick sveglie
  useInterval(() => {
    const k = todayKey(s.settings.dayStartHour)
    if (k !== today) {
      setToday(k)
      setDate((d) => (d === today ? k : d))
    }
    if (!s.settings.alarms) return
    const rows = rowsForDay(k, k)
    const due = dueAlarms(rows, k, true)
    if (due.length && due[0].key !== alarms[0]?.key) {
      setAlarms(due)
      if (s.settings.sound) playChime()
      buzz([20, 80, 20])
      if (document.hidden) systemNotify(due[0].task.title, `Sveglia · ${due[0].task.time}`)
    } else if (!due.length && alarms.length) {
      setAlarms([])
    }
  }, 20_000)

  // controllo immediato al ritorno in primo piano
  useEffect(() => {
    const check = () => {
      if (document.hidden || !s.settings.alarms) return
      const due = dueAlarms(rowsForDay(today, today), today, true)
      if (due.length) setAlarms(due)
    }
    document.addEventListener('visibilitychange', check)
    check()
    return () => document.removeEventListener('visibilitychange', check)
  }, [today, s.settings.alarms, s.tasks, s.occurrences])

  const closeAlarm = (r: Row, mode: 'done' | 'snooze' | 'dismiss') => {
    if (mode === 'snooze') snooze(r.key, 10)
    else {
      clearSnooze(r.key)
      markFired(today, r.key)
      if (mode === 'done') A.complete(r.task.id, today)
    }
    setAlarms((list) => list.filter((x) => x.key !== r.key))
  }

  const goDate = (d: DateKey) => {
    setDate(d)
    setNav('today')
  }

  const showInstall =
    isIOS() && !isStandalone() && !s.settings.installDismissed && s.loaded

  if (!s.loaded) return <div class="boot" />

  return (
    <div class="app">
      <nav class="side">
        <div class="brand">Cadence</div>
        <button class={'side-item' + (nav === 'today' ? ' is-active' : '')} onClick={() => { setNav('today'); setDate(today) }}>
          <IconToday /> Oggi
        </button>
        <button class={'side-item' + (nav === 'history' && hist === 'calendar' ? ' is-active' : '')} onClick={() => { setNav('history'); setHist('calendar') }}>
          <IconHistory /> Calendario
        </button>
        <button class={'side-item' + (nav === 'history' && hist === 'diary' ? ' is-active' : '')} onClick={() => { setNav('history'); setHist('diary') }}>
          <IconBook /> Diario
        </button>
        <button class={'side-item' + (nav === 'history' && hist === 'insights' ? ' is-active' : '')} onClick={() => { setNav('history'); setHist('insights') }}>
          <IconInsights /> Statistiche
        </button>
        <button class="side-add" onClick={() => setSheet({ kind: 'create', date })}>
          <IconPlus size={18} /> Nuova task
        </button>
      </nav>

      <main class="main">
        {nav === 'today' ? (
          <Today
            date={date}
            today={today}
            onDate={setDate}
            onOpenTask={(r) => setSheet({ kind: 'edit', row: r, date })}
            onSettings={() => setSettings(true)}
            onReview={() => setReview(true)}
            onLog={setLogTarget}
            toast={pushToast}
          />
        ) : (
          <div class="view">
            <header class="head head--simple">
              <h1>Storico</h1>
            </header>
            <div class="hist-tabs">
              <Segmented
                value={hist}
                onChange={setHist}
                options={[
                  { value: 'calendar', label: 'Calendario' },
                  { value: 'diary', label: 'Diario' },
                  { value: 'insights', label: 'Statistiche' }
                ]}
              />
            </div>
            {hist === 'calendar' && <Calendar today={today} onPick={goDate} />}
            {hist === 'diary' && <Diary today={today} onPick={goDate} />}
            {hist === 'insights' && <Insights today={today} />}
          </div>
        )}
      </main>

      <nav class="tabbar">
        <button class={'tab' + (nav === 'today' ? ' is-active' : '')} onClick={() => { setNav('today'); setDate(today) }}>
          <IconToday />
          <span>Oggi</span>
        </button>
        <button class="fab" onClick={() => setSheet({ kind: 'create', date })} aria-label="Nuova task">
          <IconPlus />
        </button>
        <button class={'tab' + (nav === 'history' ? ' is-active' : '')} onClick={() => setNav('history')}>
          <IconHistory />
          <span>Storico</span>
        </button>
      </nav>

      <TaskSheet mode={sheet} onClose={() => setSheet(null)} />
      <LogSheet target={logTarget} onClose={() => setLogTarget(null)} />
      <SettingsSheet open={settingsOpen} onClose={() => setSettings(false)} />
      <ReviewSheet open={reviewOpen} date={date} today={today} onClose={() => setReview(false)} />

      {alarms.length > 0 && (
        <AlarmOverlay
          rows={alarms}
          onDone={(r) => closeAlarm(r, 'done')}
          onSnooze={(r) => closeAlarm(r, 'snooze')}
          onDismiss={(r) => closeAlarm(r, 'dismiss')}
        />
      )}

      <Toast toast={toast} onDismiss={() => setToast(null)} />

      {needRefresh && (
        <div class="toast toast--update">
          <span class="toast-text">Nuova versione disponibile</span>
          <button class="toast-btn" onClick={() => location.reload()}>Ricarica</button>
        </div>
      )}

      {showInstall && (
        <div class="install">
          <p>
            Aggiungi Cadence alla Home Screen: <strong>Condividi → Aggiungi a Home</strong>.
            Senza installarla, iOS può cancellare i dati dopo 7 giorni di inutilizzo.
          </p>
          <button class="link-btn" onClick={() => patchSettings({ installDismissed: true })}>Ho capito</button>
        </div>
      )}

    </div>
  )
}
