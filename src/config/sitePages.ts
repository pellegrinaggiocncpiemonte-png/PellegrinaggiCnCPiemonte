export type SitePage =
  | 'home'
  | 'pellegrinaggio'
  | 'documenti'
  | 'area-riservata'
  | 'app'
  | 'video'
  | 'canti'
  | 'versamenti';

export const PAGE_PATHS: Record<SitePage, string> = {
  home: '/',
  pellegrinaggio: '/pellegrinaggio',
  documenti: '/documenti',
  'area-riservata': '/area-riservata',
  app: '/app',
  video: '/video',
  canti: '/canti',
  versamenti: '/versamenti',
};

export const SECTION_PAGE: Record<string, SitePage> = {
  home: 'home',
  'giorni-alla-partenza': 'home',
  'gmg-2027-iscrizione': 'pellegrinaggio',
  'invito-santo-padre': 'pellegrinaggio',
  'wyd-seul': 'pellegrinaggio',
  'incontro-vocazionale': 'pellegrinaggio',
  passaporti: 'documenti',
  'visti-passaporti': 'documenti',
  'area-riservata': 'area-riservata',
  'reserved-area-actions': 'area-riservata',
  'reserved-area-entry': 'area-riservata',
  'installa-app': 'app',
  'sezione-video': 'video',
  'canti-in-coreano': 'canti',
  donazioni: 'versamenti',
};

export const PAGE_META: Record<Exclude<SitePage, 'home'>, { eyebrow: string; title: string; intro: string }> = {
  pellegrinaggio: {
    eyebrow: 'Korea 2027 · Piemonte e Svizzera',
    title: 'Pellegrinaggio vocazionale',
    intro: 'Iscrizione del gruppo, programma della GMG di Seoul e incontro vocazionale del Cammino Neocatecumenale.',
  },
  documenti: {
    eyebrow: 'Prima della partenza',
    title: 'Passaporti e visti',
    intro: 'Le informazioni da leggere con attenzione per preparare i documenti di viaggio senza arrivare a ridosso della partenza.',
  },
  'area-riservata': {
    eyebrow: 'Accesso personale',
    title: 'Area Riservata',
    intro: 'Profilo, iscrizione al pellegrinaggio, documenti e versamenti: qui trovi il percorso corretto per completare tutto.',
  },
  app: {
    eyebrow: 'Sempre sul cellulare',
    title: 'Installa la web app',
    intro: 'Aggiungi l’Area Riservata alla schermata Home e attiva le notifiche per ricevere le comunicazioni importanti.',
  },
  video: {
    eyebrow: 'Korea 2027',
    title: 'Video',
    intro: 'Inviti, testimonianze e contenuti utili per conoscere e preparare il pellegrinaggio.',
  },
  canti: {
    eyebrow: 'Preparazione',
    title: 'Canti del pellegrinaggio',
    intro: 'Audio, testi, accordi e video karaoke raccolti in un’unica pagina ordinata e facile da consultare.',
  },
  versamenti: {
    eyebrow: 'Quote e ricevute',
    title: 'Versamenti e donazioni',
    intro: 'Codice bonifico, dati bancari e procedura per associare automaticamente ricevute, partecipanti e quote.',
  },
};

export function getSitePageFromPath(pathname = window.location.pathname): SitePage {
  const normalized = pathname.replace(/\/+$/, '') || '/';
  const entry = (Object.entries(PAGE_PATHS) as Array<[SitePage, string]>).find(([, path]) => path === normalized);
  return entry?.[0] ?? 'home';
}

export function navigateToSection(sectionId: string, options?: { replace?: boolean; smooth?: boolean }) {
  const page = SECTION_PAGE[sectionId] ?? 'home';
  const path = PAGE_PATHS[page];
  const url = sectionId === 'home' ? path : `${path}#${sectionId}`;
  if (options?.replace) window.history.replaceState({}, '', url);
  else window.history.pushState({}, '', url);
  window.dispatchEvent(new CustomEvent('site-route-change', { detail: { page, sectionId } }));

  window.setTimeout(() => {
    const target = document.getElementById(sectionId);
    if (!target) {
      window.scrollTo({ top: 0, behavior: options?.smooth === false ? 'auto' : 'smooth' });
      return;
    }
    const top = Math.max(0, target.offsetTop - 92);
    window.scrollTo({ top, behavior: options?.smooth === false ? 'auto' : 'smooth' });
  }, 70);
}
