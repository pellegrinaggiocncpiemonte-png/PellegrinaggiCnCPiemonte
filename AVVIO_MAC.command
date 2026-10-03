#!/bin/zsh
set -e
cd "$(dirname "$0")"

clear
echo "============================================"
echo " Pellegrinaggi CnC - Avvio sito su Mac"
echo "============================================"
echo

if ! command -v node >/dev/null 2>&1; then
  echo "ERRORE: Node.js non risulta installato."
  echo "Installa Node.js e poi riapri AVVIO_MAC.command."
  echo
  read "?Premi Invio per chiudere..."
  exit 1
fi

if [ ! -d node_modules ] || [ ! -e node_modules/.bin/vite ]; then
  echo "Installazione pulita delle dipendenze..."
  rm -rf node_modules
  if [ -f package-lock.json ]; then
    npm ci || {
      echo "npm ci non riuscito: provo npm install..."
      rm -rf node_modules
      npm install
    }
  else
    npm install
  fi
fi

echo
echo "Avvio del sito..."
echo "Lascia aperta questa finestra del Terminale."
echo
npm run dev
