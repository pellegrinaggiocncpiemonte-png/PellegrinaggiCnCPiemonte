# CORRETTO 59 — Widget posti flottante intelligente

- Home come pagina iniziale (`/`).
- Widget posti centrato in basso sulla Home.
- Posizione automatica diversa nelle altre pagine per ridurre le sovrapposizioni.
- Widget trascinabile manualmente con mouse o dito; al cambio pagina torna alla posizione consigliata.
- Logo JMJ reso in bianco/oro tramite CSS.
- Testi “Piemonte · Svizzera” e “Posti rimasti” centrati nel mini-widget.
- Apertura rapida con animazione di ingrandimento coerente con la posizione della pagina.

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

## Aggiornamento v57
- Ripristinato nella sezione iscrizioni il contatore pubblico di disponibilità Korea 2027.
- Il widget usa il collegamento storico Apps Script `action=seoul`, aggiorna automaticamente i dati e non espone dati personali.
- In caso di endpoint non disponibile, il sito resta funzionante e mostra un avviso temporaneo senza bloccare la navigazione.
