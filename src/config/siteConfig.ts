export const SITE_CONFIG = {
  browserTitle: 'Pellegrinaggi CnC Piemonte',
  browserOgTitle: 'Pellegrinaggi CnC Piemonte',
  heroTitleLines: ['Pellegrinaggi', 'CnC', 'Piemonte - Svizzera'],
  email: 'pellegrinaggio.cnc.piemonte@gmail.com',
  reservedAreaUrl:
    'https://script.google.com/macros/s/AKfycbzFygX2yK0Nml4S0zgy_TyG3LsrJfWoP5ePICOYD7nR8Qs8ZsM_AJJvOhdoHU46sjTV/exec',
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
    id: 'assistance',
    label: 'Assistenza',
    type: 'link' as const,
    href: SITE_CONFIG.assistanceUrl,
    external: true,
  },
  {
    id: 'contact',
    label: 'Contatto',
    type: 'modal' as const,
  },
] as const;
