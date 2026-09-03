# Cadence

PWA di produttività personale, mobile-first. Nessun backend: tutti i dati vivono in IndexedDB sul dispositivo.

## Avvio

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # output in dist/
```

## Deploy (consigliato: Cloudflare Pages)

1. `git init && git add . && git commit -m "cadence v1"` e push su GitHub.
2. Cloudflare Pages → Create project → Connect to Git.
3. Build command `npm run build`, output directory `dist`.
4. Il dominio `*.pages.dev` è già HTTPS: requisito per service worker e PWA.

Vercel e Netlify funzionano identicamente. GitHub Pages è sconsigliato: il deploy su sotto-path rompe scope del manifest e del service worker.

## Installazione su iPhone

Safari → Condividi → **Aggiungi a Home**.

Va fatto **prima** di inserire dati: la web app installata usa un archivio separato da quello di Safari, i due non condividono nulla. Installarla è anche ciò che protegge i dati dalla pulizia automatica di iOS dopo 7 giorni di inutilizzo.

## Struttura

```
src/
  domain/      logica pura: date locali, regole di ricorrenza, tipi
  store/       stato in memoria + IndexedDB + selettori + export/import
  lib/         sveglie, audio, hook condivisi
  ui/          primitive e riga task
  views/       Today, Calendar, Diary, Insights, Settings, sheet
  styles/      token e CSS
```

`domain/` non dipende da Preact né da IndexedDB: è la parte da testare per prima se qualcosa nelle date o nelle ricorrenze si comporta male.

## Note importanti

- **Le occorrenze future non esistono nel database.** Una ricorrenza è una regola; una riga viene scritta solo quando interagisci con essa. Il database resta sotto il MB anche dopo anni.
- **Sveglie**: scattano quando l'app è aperta e alla riapertura. Su iOS una PWA non può suonare da chiusa — è un limite della piattaforma.
- **Multi-dispositivo**: ogni dispositivo ha il proprio archivio. Per allineare: Esporta su uno, Importa → Unisci sull'altro.
