export type ReservedAreaGuideItem = {
  id: string;
  title: string;
  icon: string;
  description: string;
  bullets?: string[];
  note?: string;
};

export const RESERVED_AREA_GUIDE_TITLE = 'Prima di registrarti: scegli la modalità corretta';
export const RESERVED_AREA_GUIDE_SUBTITLE =
  'Leggi con attenzione prima di creare un profilo. La scelta corretta è particolarmente importante per i genitori che desiderano gestire i profili dei figli. Qui trovi anche i passaggi per salvare la web app sulla schermata Home del telefono.';

export const RESERVED_AREA_GUIDE_ITEMS: ReservedAreaGuideItem[] = [
  {
    id: 'partecipante',
    title: 'Partecipante',
    icon: '🏃',
    description:
      'È il profilo obbligatorio per chi partecipa personalmente al pellegrinaggio. Devono registrarsi come Partecipante:',
    bullets: [
      'Giovani minori e maggiorenni.',
      'Accompagnatori, catechisti e collaboratori che partecipano al pellegrinaggio.',
      'Responsabili di comunità che partecipano al pellegrinaggio.',
      'Genitori che partecipano fisicamente all’evento.',
      'Presbiteri che partecipano al pellegrinaggio.',
    ],
    note:
      'Chi partecipa al pellegrinaggio deve sempre risultare registrato anche come Partecipante, anche se ricopre altri ruoli organizzativi.',
  },
  {
    id: 'responsabile',
    title: 'Responsabile',
    icon: '🛡️',
    description:
      'Profilo dedicato al responsabile di una comunità, non al responsabile del pellegrinaggio.',
    note:
      'Se il responsabile partecipa anche al pellegrinaggio, deve registrarsi anche come Partecipante. Questo profilo serve alla gestione del gruppo e non sostituisce l’iscrizione personale. Chi si registra come Responsabile potrebbe inoltre essere contattato per una verifica.',
  },
  {
    id: 'collaboratore',
    title: 'Collaboratore / Accompagnatore',
    icon: '🤝',
    description:
      'Profilo specifico per catechisti e accompagnatori che supportano la gestione organizzativa.',
    note:
      'Attenzione: se ti registri come Collaboratore / Accompagnatore e partecipi al pellegrinaggio, devi registrarti anche come Partecipante. Il profilo organizzativo non sostituisce quello di partecipazione. Chi si registra come Collaboratore potrebbe essere contattato per una verifica.',
  },
  {
    id: 'genitore-codice',
    title: 'Genitore (con codice)',
    icon: '👨‍👩‍👧',
    description:
      'Da scegliere soltanto quando tuo figlio possiede già un profilo Partecipante autonomo e desidera collegarti successivamente come genitore.',
    note:
      'Se tuo figlio è minore, dovrà inviarti un codice di verifica via email dalla sua sezione “Profilo”. Se invece vuoi creare e gestire tu i profili dei figli, scegli Genitore + Figli. Se anche il genitore partecipa al pellegrinaggio, deve registrarsi anche come Partecipante.',
  },
  {
    id: 'genitore-figli',
    title: 'Genitore + Figli',
    icon: '👥',
    description:
      'È il profilo corretto quando un genitore desidera creare e gestire direttamente i profili dei propri figli usando la propria email, anche se alcuni figli possiedono già un indirizzo email personale.',
    bullets: [
      'Non creare più profili Partecipante separati usando la stessa email del genitore: dal secondo profilo il sistema segnalerà che l’email è già utilizzata.',
      'Registrati una sola volta come Genitore + Figli inserendo l’email del genitore.',
      'Dopo l’accesso al pannello, crea i profili dei singoli figli e gestiscili direttamente dal profilo del genitore.',
    ],
    note:
      'Questa è la procedura consigliata quando il genitore vuole gestire personalmente i figli. Se anche il genitore partecipa al pellegrinaggio, dovrà completare anche la propria iscrizione come Partecipante.',
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
      'In sintesi: chi partecipa al pellegrinaggio deve sempre registrarsi come Partecipante. I profili Collaboratore / Accompagnatore, Responsabile, Genitore e Genitore + Figli sono profili aggiuntivi di gestione e non sostituiscono l’iscrizione personale al pellegrinaggio. I presbiteri si registrano come Partecipanti e, solo se necessario, anche come Collaboratori.',
  },
];
