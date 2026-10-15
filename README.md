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
