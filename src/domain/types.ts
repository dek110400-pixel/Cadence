export type ID = string
/** Chiave giorno locale, sempre "YYYY-MM-DD". Mai timestamp UTC. */
export type DateKey = string

export type Freq = 'daily' | 'weekly' | 'interval' | 'monthly'

export interface RRule {
  freq: Freq
  /** 0=domenica .. 6=sabato (solo freq 'weekly') */
  weekdays?: number[]
  /** ogni X giorni (solo freq 'interval') */
  interval?: number
  /** 1-31, con clamp a fine mese (solo freq 'monthly') */
  monthDay?: number
  startDate: DateKey
  endDate?: DateKey | null
}

export interface Task {
  id: ID
  title: string
  note?: string
  categoryId?: ID | null
  mustDo: boolean
  /** "HH:MM" locale */
  time?: string | null
  /** sveglia in-app all'orario indicato */
  alarm?: boolean
  estimatedMin?: number | null
  order: number
  createdAt: number
  updatedAt: number
  /** soft delete: preserva lo storico */
  archivedAt?: number | null
  deletedAt?: number | null
  kind: 'single' | 'recurring'
  date?: DateKey | null
  rrule?: RRule | null
}

export type OccStatus = 'done' | 'skipped' | 'moved'

export interface Occurrence {
  /** `${taskId}:${date}` */
  id: ID
  taskId: ID
  date: DateKey
  status: OccStatus
  completedAt?: number | null
  /** commento scritto dopo il completamento */
  log?: string
  updatedAt: number
}

export interface DayLog {
  date: DateKey
  /** voce di diario del giorno */
  note?: string
  reviewedAt?: number | null
  updatedAt: number
}

export interface Category {
  id: ID
  name: string
  color: string
  order: number
  updatedAt: number
  deletedAt?: number | null
}

export interface Settings {
  theme: 'light' | 'dark' | 'system'
  /** ora in cui inizia il "tuo" giorno (default 4) */
  dayStartHour: number
  alarms: boolean
  sound: boolean
  notifications: boolean
  lastExport?: number | null
  installDismissed?: boolean
}

export interface Row {
  key: string
  task: Task
  occ?: Occurrence
  status: 'todo' | 'done' | 'skipped'
  /** giorni di ritardo per le task singole riportate avanti */
  lateDays: number
}

export interface DayStats {
  total: number
  done: number
  skipped: number
  mustTotal: number
  mustDone: number
}
