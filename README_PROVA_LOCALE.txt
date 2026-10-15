PROPOSTA 2 - VERSO LA LUCE - REVISIONE 2

CORREZIONI APPLICATE
- La barra fissa del menu è tornata identica a quella del sito originale.
- Rimossa la barra grafica aggiuntiva sopra il menu.
- Rimossa la scritta/pulsante fisso "Rivedi intro", perché occupava una zona già usata dal contatore.
- Nuova introduzione chiaramente animata: immagine della Madonna, croce che si disegna,
  cammino di luce, titolo e contenuti in ingresso progressivo.
- Corretti i contrasti: le sezioni scure hanno testi chiari; le schede bianche mantengono testi scuri.
- Contenuti, menu, link e funzioni restano quelli dello ZIP originale.

PER PROVARLO IN VISUAL STUDIO CODE
1. Apri questa cartella con Visual Studio Code.
2. Apri Terminale > Nuovo terminale.
3. Esegui: npm install
4. Esegui: npm run dev
5. Apri l'indirizzo indicato, normalmente http://localhost:5173

L'introduzione viene mostrata una volta per sessione.
Per forzarla durante le prove usa:
http://localhost:5173/?intro=1

CONTROLLI PRIMA DI GITHUB / VERCEL
npm run typecheck
npm run build

REVISIONE 4 - TRANSIZIONE INTRO
Premendo ENTRA NEL SITO, la luce bianca nasce dal pulsante, riempie lo schermo e la Home compare con un effetto fade-in.
Per rivedere l'introduzione: http://localhost:5173/?intro=1
