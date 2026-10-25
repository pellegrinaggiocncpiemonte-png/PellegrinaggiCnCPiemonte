# Project 2 – Avvio in locale

Questo progetto usa **Vite + React**.

## Requisiti
- Node.js 18+ (ok anche 20/22/24)

## Installazione
```bash
npm install
```

## Variabili Supabase (obbligatorie per il form contatti)
1. Copia `.env.example` in `.env.local`
2. Inserisci i valori reali di Supabase:
   - **Project URL**
   - **anon public key**

```bash
cp .env.example .env.local
```

> Dopo aver modificato `.env`/`.env.local` devi **riavviare** il server Vite.

## Avvio DEV
```bash
npm run dev
```
Apri l’URL mostrato in terminale (es. `http://localhost:5173`).

## Build + preview
```bash
npm run build
npm run preview
```

## Navigazione a pagine
La versione aggiornata usa URL separati per rendere il sito più semplice da consultare:
- `/` – Home e countdown
- `/pellegrinaggio` – iscrizione del gruppo, GMG e incontro vocazionale
- `/documenti` – passaporti e visti
- `/area-riservata` – istruzioni complete per chi deve iscriversi; dal pulsante Area Riservata si può scegliere tra nuova iscrizione e login per chi è già iscritto
- `/app` – installazione web app e notifiche
- `/video` – video
- `/canti` – canti del pellegrinaggio
- `/versamenti` – codice bonifico, versamenti, ricevute e donazioni

Su Vercel il file `vercel.json` mantiene funzionanti gli URL anche quando una pagina viene aperta o ricaricata direttamente.
