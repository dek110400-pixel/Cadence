import type { ComponentChildren } from 'preact'
import { useEffect, useState } from 'preact/hooks'
import { useBackClose } from '../lib/hooks'

// --- Sheet -----------------------------------------------------------------

export function Sheet(props: {
  open: boolean
  onClose: () => void
  title?: string
  children: ComponentChildren
  full?: boolean
}) {
  const [mounted, setMounted] = useState(props.open)
  const [visible, setVisible] = useState(false)
  useBackClose(props.open, props.onClose)

  useEffect(() => {
    if (props.open) {
      setMounted(true)
      requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true)))
    } else if (mounted) {
      setVisible(false)
      const t = setTimeout(() => setMounted(false), 240)
      return () => clearTimeout(t)
    }
  }, [props.open])

  if (!mounted) return null
  return (
    <div class={'sheet-root' + (visible ? ' is-open' : '')}>
      <div class="sheet-backdrop" onClick={props.onClose} />
      <div class={'sheet' + (props.full ? ' sheet--full' : '')} role="dialog" aria-modal="true">
        <div class="sheet-grip" />
        {props.title && (
          <div class="sheet-head">
            <h2>{props.title}</h2>
            <button class="icon-btn" onClick={props.onClose} aria-label="Chiudi">
              <IconClose />
            </button>
          </div>
        )}
        <div class="sheet-body">{props.children}</div>
      </div>
    </div>
  )
}

// --- Toast -----------------------------------------------------------------

export interface ToastAction {
  label: string
  onClick: () => void
}
export interface ToastData {
  id: number
  text: string
  actions?: ToastAction[]
}

export function Toast(props: { toast: ToastData | null; onDismiss: () => void }) {
  useEffect(() => {
    if (!props.toast) return
    const t = setTimeout(props.onDismiss, 5000)
    return () => clearTimeout(t)
  }, [props.toast?.id])

  if (!props.toast) return null
  return (
    <div class="toast" key={props.toast.id}>
      <span class="toast-text">{props.toast.text}</span>
      {props.toast.actions?.map((a) => (
        <button
          class="toast-btn"
          onClick={() => {
            a.onClick()
            props.onDismiss()
          }}
        >
          {a.label}
        </button>
      ))}
    </div>
  )
}

// --- Ring (anello di completamento) ---------------------------------------

export function Ring(props: { value: number; size?: number; stroke?: number; muted?: boolean }) {
  const size = props.size || 28
  const sw = props.stroke || 2
  const r = (size - sw) / 2
  const c = 2 * Math.PI * r
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} class="ring">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--border)" stroke-width={sw} />
      {props.value > 0 && (
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={props.muted ? 'var(--fg-3)' : 'var(--accent)'}
          stroke-width={sw}
          stroke-linecap="round"
          stroke-dasharray={`${c * Math.min(1, props.value)} ${c}`}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      )}
    </svg>
  )
}

// --- Segmented -------------------------------------------------------------

export function Segmented<T extends string>(props: {
  value: T
  options: { value: T; label: string }[]
  onChange: (v: T) => void
}) {
  return (
    <div class="segmented" role="tablist">
      {props.options.map((o) => (
        <button
          role="tab"
          aria-selected={o.value === props.value}
          class={'segmented-item' + (o.value === props.value ? ' is-active' : '')}
          onClick={() => props.onChange(o.value)}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

// --- Chip ------------------------------------------------------------------

export function Chip(props: {
  active?: boolean
  children: ComponentChildren
  onClick?: () => void
  color?: string
}) {
  return (
    <button class={'chip' + (props.active ? ' is-active' : '')} onClick={props.onClick} type="button">
      {props.color && <span class="dot" style={{ background: props.color }} />}
      {props.children}
    </button>
  )
}

export function Field(props: { label: string; children: ComponentChildren; hint?: string }) {
  return (
    <label class="field">
      <span class="field-label">{props.label}</span>
      {props.children}
      {props.hint && <span class="field-hint">{props.hint}</span>}
    </label>
  )
}

// --- Quote of the day --------------------------------------------------------

export function QuoteBar(props: { text: string; author: string }) {
  return (
    <figure class="quote-bar">
      <blockquote>{props.text}</blockquote>
      <figcaption>{props.author}</figcaption>
    </figure>
  )
}

// --- Icone (stroke 1.6, 20px) ---------------------------------------------

const svg = (d: ComponentChildren, size = 20) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
    {d}
  </svg>
)

export const IconClose = () => svg(<><path d="M18 6 6 18" /><path d="m6 6 12 12" /></>)
export const IconPlus = (p: { size?: number }) => svg(<><path d="M12 5v14" /><path d="M5 12h14" /></>, p?.size || 22)
export const IconToday = () => svg(<><rect x="3" y="4.5" width="18" height="16" rx="3" /><path d="M8 2.5v4M16 2.5v4M3 9.5h18" /></>, 22)
export const IconHistory = () => svg(<><path d="M3 12a9 9 0 1 0 3-6.7" /><path d="M3 4.5V9h4.5" /><path d="M12 7.5V12l3 2" /></>, 22)
export const IconInsights = () => svg(<><path d="M4 19V9M10 19V5M16 19v-7M22 19H2" /></>, 22)
export const IconBook = () => svg(<><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21.5z" /><path d="M8 7.5h8M8 11h6" /></>, 22)
export const IconSettings = () => svg(<><circle cx="12" cy="12" r="3.2" /><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-2.87 1.2V21a2 2 0 1 1-4 0v-.09A1.7 1.7 0 0 0 7 19.4a1.7 1.7 0 0 0-1.87.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.7 1.7 0 0 0 2.6 15a1.7 1.7 0 0 0-1.6-1.1H1a2 2 0 1 1 0-4h.09A1.7 1.7 0 0 0 2.6 9a1.7 1.7 0 0 0-.34-1.87l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.7 1.7 0 0 0 7 4.6h.09A1.7 1.7 0 0 0 8.2 3V3a2 2 0 1 1 4 0" /></>)
export const IconBell = () => svg(<><path d="M18 8a6 6 0 1 0-12 0c0 7-3 8-3 8h18s-3-1-3-8" /><path d="M13.7 21a2 2 0 0 1-3.4 0" /></>, 16)
export const IconNote = () => svg(<><path d="M4 5.5h16M4 10h16M4 14.5h9" /></>, 14)
export const IconRepeat = () => svg(<><path d="m17 2 4 4-4 4" /><path d="M3 11V9a4 4 0 0 1 4-4h14" /><path d="m7 22-4-4 4-4" /><path d="M21 13v2a4 4 0 0 1-4 4H3" /></>, 14)
export const IconChevron = (p: { dir?: 'left' | 'right' | 'down' }) => {
  const d = p?.dir || 'right'
  const rot = d === 'left' ? 180 : d === 'down' ? 90 : 0
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style={{ transform: `rotate(${rot}deg)` }}>
      <path d="m9 18 6-6-6-6" />
    </svg>
  )
}
