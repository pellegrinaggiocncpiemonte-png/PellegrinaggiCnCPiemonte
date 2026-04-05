export type ReservedAreaGuideItem = {
  id: string;
  title: string;
  icon: string;
  description: string;
  bullets?: string[];
  note?: string;
};

export const RESERVED_AREA_GUIDE_TITLE = 'Area riservata: registrazione e accesso rapido';
export const RESERVED_AREA_GUIDE_SUBTITLE =
  'Qui trovi sia le indicazioni per scegliere il profilo corretto durante la registrazione, sia i passaggi per salvare la web app sulla schermata Home del telefono e aprirla più velocemente.';

export const RESERVED_AREA_GUIDE_ITEMS: ReservedAreaGuideItem[] = [
  {
    id: 'partecipante',
    title: 'Partecipante',
    icon: '🏃',
    description:
      'È il profilo principale per chi vive il pellegrinaggio e deve essere scelto da:',
    bullets: [
      'Giovani minori e maggiorenni.',
      'Accompagnatori e catechisti che partecipano attivamente al cammino.',
      'Responsabili di comunità in cammino con i ragazzi.',
      'Genitori che partecipano fisicamente all’evento.',
    ],
  },
  {
    id: 'responsabile',
    title: 'Responsabile',
    icon: '🛡️',
    description:
      'Profilo dedicato a chi ha il compito di coordinare e gestire il gruppo di giovani a lui associati.',
  },
  {
    id: 'collaboratore',
    title: 'Collaboratore',
    icon: '🤝',
    description:
      'Profilo specifico per catechisti e accompagnatori che supportano la gestione organizzativa.',
  },
  {
    id: 'genitore-codice',
    title: 'Genitore (con codice)',
    icon: '👨‍👩‍👧',
    description:
      'Da scegliere se tuo figlio si è iscritto autonomamente come Partecipante.',
    note:
      'Se tuo figlio è minore, dovrà inviarti un codice di verifica via email dalla sua sezione “Profilo” per permetterti di registrarti.',
  },
  {
    id: 'genitore-figli',
    title: 'Genitore + Figli (senza email)',
    icon: '👥',
    description:
      'Da scegliere se devi gestire figli che non hanno un indirizzo email personale.',
    note:
      'Utilizzerai la tua email per registrarli e potrai creare i profili figli. Per gestirli dovrai impersonare ogni singolo figlio dal tuo pannello, così da completare le loro iscrizioni.',
  },
  {
    id: 'iphone-safari',
    title: 'iPhone / Safari',
    icon: '📱',
    description:
      'Puoi salvare la web app sulla schermata Home del cellulare per aprirla direttamente, senza dover ogni volta rientrare dal sito.',
    bullets: [
      'Apri la pagina dell’Area Riservata in Safari.',
      'Premi Condividi.',
      'Seleziona “Aggiungi a Home”.',
      'Conferma con “Aggiungi”.',
    ],
    note:
      'La web app continuerà a funzionare normalmente. Su iPhone il collegamento viene salvato come accesso rapido dalla schermata Home.',
  },
  {
    id: 'android-chrome',
    title: 'Android / Chrome',
    icon: '🤖',
    description:
      'Su Android puoi creare un accesso rapido sulla Home e, quando disponibile, usare anche la voce di installazione proposta dal browser.',
    bullets: [
      'Apri la pagina dell’Area Riservata in Chrome.',
      'Premi il menu con i tre puntini.',
      'Seleziona “Aggiungi a schermata Home” oppure “Installa app”.',
      'Conferma l’operazione.',
    ],
    note:
      'La disponibilità della voce “Installa app” dipende dal browser e da come è pubblicata la web app.',
  },
  {
    id: 'nota-tecnica',
    title: 'Nota importante',
    icon: 'ℹ️',
    description:
      'L’Area Riservata è una web app. Sul telefono puoi quindi creare un accesso rapido molto comodo dalla schermata Home.',
    note:
      'Il comportamento finale dipende dal dispositivo e dal browser usato. In alcuni casi si apre come collegamento web avanzato, in altri come vera installazione leggera supportata dal browser.',
  },
];
