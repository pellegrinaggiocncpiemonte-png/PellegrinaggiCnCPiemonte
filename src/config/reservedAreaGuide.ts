export type ReservedAreaGuideItem = {
  id: string;
  title: string;
  icon: string;
  description: string;
  bullets?: string[];
  note?: string;
};

export const RESERVED_AREA_GUIDE_TITLE = 'Leggi con attenzione prima di creare un profilo';
export const RESERVED_AREA_GUIDE_SUBTITLE = '';

export const RESERVED_AREA_GUIDE_ITEMS: ReservedAreaGuideItem[] = [
  {
    id: 'partecipante',
    title: 'Partecipante',
    icon: '🏃',
    description:
      'È il profilo obbligatorio per chi partecipa personalmente al pellegrinaggio. Anche un Accompagnatore / Catechista / Collaboratore che partecipa deve registrarsi come Partecipante. Il suo profilo Partecipante viene gestito come quello di qualsiasi altro partecipante: per completare l’iscrizione a Korea 2027 deve compilare le sezioni richieste e poi effettuare l’iscrizione nella sezione “Iscrizione Pellegrinaggi”.',
    bullets: [
      'Giovani minori e maggiorenni.',
      'Accompagnatori, catechisti e collaboratori che partecipano al pellegrinaggio.',
      'Responsabili di comunità che partecipano al pellegrinaggio.',
      'Genitori che partecipano fisicamente all’evento.',
      'Presbiteri che partecipano al pellegrinaggio.',
    ],
    note:
      'Chi partecipa al pellegrinaggio deve sempre risultare registrato come Partecipante e completare da questo profilo tutti i passaggi richiesti, esattamente come gli altri partecipanti. Avere anche un profilo Accompagnatore / Catechista / Collaboratore non sostituisce e non completa l’iscrizione al pellegrinaggio.',
  },
  {
    id: 'responsabile',
    title: 'Responsabile di comunità',
    icon: '🛡️',
    description:
      'Questo profilo è riservato esclusivamente ai responsabili di comunità. Non è il profilo del responsabile del pellegrinaggio e non va scelto per altri incarichi.',
    note:
      'Se scegli di creare il profilo Responsabile di comunità, prima di consentire l’accesso al sistema verrà verificato il ruolo. Se partecipi anche al pellegrinaggio devi avere anche il profilo Partecipante e fare da lì l’iscrizione a Korea 2027.',
  },
  {
    id: 'collaboratore',
    title: 'Accompagnatore / Catechista / Collaboratore',
    icon: '🤝',
    description:
      'È un profilo aggiuntivo riservato ad accompagnatori, catechisti e collaboratori. Serve per la gestione e la supervisione di tutti gli iscritti con profilo Partecipante e per le attività organizzative assegnate all’accompagnatore.',
    note:
      'Questo profilo non serve per iscrivere se stessi al pellegrinaggio. Se partecipi anche tu, devi creare anche il profilo Partecipante con la stessa email e la stessa password, completare tutte le sezioni richieste come ogni altro partecipante e iscriverti a Korea 2027 entrando come Partecipante.',
  },
  {
    id: 'presbiteri',
    title: 'Presbiteri',
    icon: '⛪',
    description:
      'I presbiteri si registrano prima come Partecipanti e, nella sezione Profilo, indicano di essere presbiteri.',
    note:
      'Successivamente creano anche il profilo Accompagnatore / Catechista / Collaboratore usando esattamente le stesse credenziali del profilo Partecipante: stessa email e stessa password.',
  },
  {
    id: 'genitore',
    title: 'Genitore',
    icon: '👨‍👩‍👧‍👦',
    description:
      'Con il profilo Genitore si possono creare i profili dei figli minorenni o maggiorenni, oppure controllare e gestire anche i profili Partecipante dei figli che si sono registrati autonomamente con la propria email.',
    note:
      'Se il genitore partecipa al pellegrinaggio deve registrarsi anche come Partecipante e, se svolge un incarico organizzativo, può avere anche il profilo Accompagnatore / Catechista / Collaboratore.',
  },
  {
    id: 'accesso-multiplo',
    title: 'Accesso multiplo: come funziona',
    icon: '🔐',
    description:
      'Accesso multiplo significa avere più profili associati alle stesse credenziali. Per creare profili diversi usa sempre la stessa email e la stessa password.',
    note:
      'Quando avrai più profili con la stessa email e password, inserisci le credenziali e richiedi l’accesso: comparirà la scelta del tipo di profilo. Scegli il profilo con cui vuoi entrare e poi accedi alla relativa area.',
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
      'In sintesi: l’iscrizione al pellegrinaggio va sempre fatta e completata con il profilo Partecipante. Il profilo Accompagnatore / Catechista / Collaboratore serve invece alla gestione e supervisione di tutti gli iscritti partecipanti e non sostituisce il proprio profilo Partecipante. Anche Responsabile di comunità è un profilo aggiuntivo.',
  },
];
