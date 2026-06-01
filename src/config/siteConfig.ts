export const SITE_CONFIG = {
  browserTitle: 'Pellegrinaggi CnC Piemonte',
  browserOgTitle: 'Pellegrinaggi CnC Piemonte',
  heroTitleLines: ['Pellegrinaggi', 'CnC', 'Piemonte - Svizzera'],
  email: 'pellegrinaggio.cnc.piemonte@gmail.com',
  reservedAreaUrl:
    'https://script.google.com/macros/s/AKfycbxoay9uqD-q6EaLwTHJm119BJ2XZbaMcg63l1PH5EJMQfrr-AUOjph2E0Tv9QZIU74b/exec',
  assistanceUrl: 'https://tawk.to/chat/65fdae1ba0c6737bd123b4bd/1hpjf07eo',
  contactPeople: [
    {
      name: 'Contatto principale',
      role: 'WhatsApp',
      phoneDisplay: '+39 347 465 9282',
      phonePlain: '393474659282',
    },
    // Esempio per aggiungere altri contatti:
    // {
    //   name: 'Mario Rossi',
    //   role: 'Referente iscrizioni',
    //   phoneDisplay: '+39 333 123 4567',
    //   phonePlain: '393331234567',
    // },
  ],
} as const;


export const COUNTER_CONFIG = {
  webAppUrl:
    'https://script.google.com/macros/s/AKfycbz2py2LldK05Lm9jVmnDfQuKUFViwY_pxfiYnCcVyaseKgejBPyqEtf4mBP3xNqo7Rv/exec',
  namespace: 'pellegrinaggi-cnc-piemonte-svizzera',
  pageKey: 'home',
} as const;

export const QUICK_ACTIONS = [
  {
    id: 'email',
    label: 'Email',
    type: 'link' as const,
    href: `mailto:${SITE_CONFIG.email}`,
  },
  {
    id: 'reserved-area',
    label: 'Area riservata',
    type: 'reserved-area' as const,
    href: SITE_CONFIG.reservedAreaUrl,
  },
  {
    id: 'telegram',
    label: 'Telegram',
    type: 'section' as const,
    targetId: 'telegram',
  },
  {
    id: 'contact',
    label: 'Contatto',
    type: 'modal' as const,
  },
] as const;
