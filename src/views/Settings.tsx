import { useEffect, useRef, useState } from 'preact/hooks'
import { requestNotifications } from '../lib/alarms'
import { isIOS, isStandalone } from '../lib/hooks'
import * as A from '../store/actions'
import { exportBackup, importBackup, parseBackup, type Backup } from '../store/backup'
import { estimate } from '../store/db'
import { patchSettings, useStore } from '../store/store'
import { Chip, Field, Segmented, Sheet } from '../ui/primitives'

const COLORS = ['#4C535B', '#6B7A6E', '#8C5A3E', '#5D6B8C', '#8B6F5A', '#61666B', '#898882', '#B3826C']

export function SettingsSheet(props: { open: boolean; onClose: () => void }) {
  const s = useStore()
  const [pending, setPending] = useState<Backup | null>(null)
  const [storage, setStorage] = useState<string>('')
  const [newCat, setNewCat] = useState('')
  const file = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!props.open) return
    estimate().then((e) => {
      if (e) setStorage(`${(e.usage / 1024).toFixed(0)} KB usati`)
    })
  }, [props.open])

  const onFile = async (e: Event) => {
    const f = (e.target as HTMLInputElement).files?.[0]
    if (!f) return
    try {
      setPending(parseBackup(await f.text()))
    } catch {
      alert('File non valido.')
    }
  }

  return (
    <Sheet open={props.open} onClose={props.onClose} title="Impostazioni" full>
      <section class="block">
        <h3 class="section-label">Aspetto</h3>
        <Segmented
          value={s.settings.theme}
          onChange={(theme) => patchSettings({ theme })}
          options={[
            { value: 'light', label: 'Chiaro' },
            { value: 'dark', label: 'Scuro' },
            { value: 'system', label: 'Sistema' }
          ]}
        />
      </section>

      <section class="block">
        <h3 class="section-label">Giornata</h3>
        <Field label="La mia giornata inizia alle" hint="Prima di quest'ora vedi ancora il giorno precedente.">
          <input
            type="number"
            min={0}
            max={12}
            value={s.settings.dayStartHour}
            onInput={(e) => patchSettings({ dayStartHour: Number((e.target as HTMLInputElement).value) })}
          />
        </Field>
      </section>

      <section class="block">
        <h3 class="section-label">Sveglie</h3>
        <label class="toggle-row">
          <span>Sveglie in-app</span>
          <input type="checkbox" checked={s.settings.alarms} onChange={(e) => patchSettings({ alarms: (e.target as HTMLInputElement).checked })} />
        </label>
        <label class="toggle-row">
          <span>Suono</span>
          <input type="checkbox" checked={s.settings.sound} onChange={(e) => patchSettings({ sound: (e.target as HTMLInputElement).checked })} />
        </label>
        <label class="toggle-row">
          <span>Notifiche di sistema</span>
          <input
            type="checkbox"
            checked={s.settings.notifications}
            onChange={async (e) => {
              const on = (e.target as HTMLInputElement).checked
              if (!on) return patchSettings({ notifications: false })
              patchSettings({ notifications: await requestNotifications() })
            }}
          />
        </label>
        <p class="hint">
          Le sveglie scattano quando l'app è aperta e, alla riapertura, come "sveglie mancate" del giorno.
          {isIOS() && ' Su iPhone una web app non può suonare da chiusa: è un limite di iOS, non dell\'app.'}
        </p>
      </section>

      <section class="block">
        <h3 class="section-label">Categorie</h3>
        <ul class="cat-list">
          {s.categories.map((c) => (
            <li key={c.id}>
              <input
                class="cat-name"
                value={c.name}
                onChange={(e) => A.saveCategory({ id: c.id, name: (e.target as HTMLInputElement).value, color: c.color })}
              />
              <div class="cat-colors">
                {COLORS.map((col) => (
                  <button
                    class={'swatch' + (col === c.color ? ' is-active' : '')}
                    style={{ background: col }}
                    onClick={() => A.saveCategory({ id: c.id, name: c.name, color: col })}
                    aria-label={col}
                  />
                ))}
              </div>
              <button class="link-btn is-danger" onClick={() => A.deleteCategory(c.id)}>Rimuovi</button>
            </li>
          ))}
        </ul>
        <div class="row-inline">
          <input value={newCat} placeholder="Nuova categoria" onInput={(e) => setNewCat((e.target as HTMLInputElement).value)} />
          <button
            class="btn btn-ghost"
            disabled={!newCat.trim()}
            onClick={() => {
              A.saveCategory({ name: newCat.trim(), color: COLORS[s.categories.length % COLORS.length] })
              setNewCat('')
            }}
          >
            Aggiungi
          </button>
        </div>
      </section>

      <section class="block">
        <h3 class="section-label">Dati</h3>
        <div class="row-inline">
          <button class="btn btn-primary" onClick={exportBackup}>Esporta JSON</button>
          <button class="btn btn-ghost" onClick={() => file.current?.click()}>Importa JSON</button>
          <input ref={file} type="file" accept="application/json,.json" hidden onChange={onFile} />
        </div>
        {pending && (
          <div class="import-preview">
            <p>
              {pending.tasks.length} task · {pending.occurrences.length} occorrenze · {pending.dayLogs.length} voci di diario
              {pending.exportedAt && ` · esportato il ${pending.exportedAt.slice(0, 10)}`}
            </p>
            <div class="row-inline">
              <button class="btn btn-ghost" onClick={async () => { await importBackup(pending, 'merge'); setPending(null) }}>Unisci</button>
              <button class="btn btn-ghost is-danger" onClick={async () => { await importBackup(pending, 'replace'); setPending(null) }}>Sostituisci</button>
              <button class="link-btn" onClick={() => setPending(null)}>Annulla</button>
            </div>
          </div>
        )}
        <p class="hint">
          {s.settings.lastExport
            ? `Ultimo export: ${new Date(s.settings.lastExport).toLocaleDateString('it-IT')}.`
            : 'Non hai mai esportato i dati.'}{' '}
          {storage}
        </p>
      </section>

      <section class="block">
        <h3 class="section-label">Dove vivono i tuoi dati</h3>
        <p class="prose">
          Tutto è salvato solo su questo dispositivo, nel database del browser. Non esiste alcun server: nessuno,
          nemmeno noi, può leggere le tue task.
        </p>
        <p class="prose">
          Su iPhone questo comporta dei rischi concreti. I dati vengono cancellati se rimuovi l'icona dalla Home
          Screen, se usi <em>Impostazioni → Safari → Cancella dati siti web</em>, se iOS ha bisogno di liberare
          spazio, o se cambi telefono: le web app non finiscono nel backup iCloud in modo affidabile.
        </p>
        <p class="prose">
          Inoltre l'app installata sulla Home Screen ha un archivio <strong>separato</strong> da quello di Safari:
          i due non condividono nulla. Se hai iniziato in Safari, esporta e reimporta nell'app installata.
        </p>
        <p class="prose">
          Ogni dispositivo (iPhone, iPad, PC) ha il proprio archivio indipendente. Per allinearli usa Esporta su
          uno e <em>Importa → Unisci</em> sull'altro.
        </p>
      </section>

      {!isStandalone() && (
        <section class="block">
          <h3 class="section-label">Installazione</h3>
          <p class="prose">
            {isIOS()
              ? 'Safari → icona Condividi → Aggiungi a Home. Farlo è importante: le web app non installate vengono ripulite da iOS dopo 7 giorni di inutilizzo.'
              : 'Dal menu del browser scegli “Installa app” per averla come finestra separata.'}
          </p>
        </section>
      )}

      <p class="version">Cadence v1.0</p>
    </Sheet>
  )
}
