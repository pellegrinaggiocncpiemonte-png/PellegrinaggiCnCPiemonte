import Navigation from './components/Navigation';
import { Bell, ChevronDown, Clock3, FileText, Landmark, Play, Smartphone, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import FlipCountdown from './components/FlipCountdown';
import { SITE_CONFIG } from './config/siteConfig';
import { RESERVED_AREA_GUIDE_ITEMS, RESERVED_AREA_GUIDE_TITLE } from './config/reservedAreaGuide';
import VisitCounterBadge from './components/VisitCounterBadge';
import FloatingAssistance from './components/FloatingAssistance';
import SiteMotion from './components/SiteMotion';
import PageIntro from './components/PageIntro';
import { getSitePageFromPath, navigateToSection, SitePage } from './config/sitePages';

type KoreanSong = {
  id: number;
  titleIt: string;
  titleKr: string;
  note?: string;
  videoSrc?: string;
  sheetSrc?: string;
};

type TutorialViewer = {
  type: 'video' | 'pdf';
  title: string;
  src: string;
};

const getGoogleDrivePreviewUrl = (url: string) => {
  const match = url.match(/drive\.google\.com\/file\/d\/([^/]+)/);
  return match ? `https://drive.google.com/file/d/${match[1]}/preview` : url;
};



type SeoulAvailability = {
  ok?: boolean;
  totalePosti?: number;
  postiRimanenti?: number;
  blocco?: boolean;
  avviso?: boolean;
  limiteCategoriaRaggiunto?: boolean;
  messaggio?: string;
  refreshSecondi?: number;
};

const SEOUL_AVAILABILITY_URL = 'https://script.google.com/macros/s/AKfycbz2py2LldK05Lm9jVmnDfQuKUFViwY_pxfiYnCcVyaseKgejBPyqEtf4mBP3xNqo7Rv/exec';

const SEOUL_REGISTRATION_DEADLINE = new Date('2026-10-30T23:59:00+01:00').getTime();

const getSeoulRegistrationRemainingMs = () => Math.max(0, SEOUL_REGISTRATION_DEADLINE - Date.now());

const formatSeoulCountdown = (ms: number, mode: 'compact' | 'full' = 'compact') => {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (mode === 'full') {
    const parts = [];
    if (days > 0) parts.push(`${days} ${days === 1 ? 'giorno' : 'giorni'}`);
    parts.push(`${hours} ${hours === 1 ? 'ora' : 'ore'}`);
    parts.push(`${minutes} ${minutes === 1 ? 'minuto' : 'minuti'}`);
    parts.push(`${seconds} ${seconds === 1 ? 'secondo' : 'secondi'}`);
    return parts.join(' ');
  }

  const hh = String(hours).padStart(2, '0');
  const mm = String(minutes).padStart(2, '0');
  const ss = String(seconds).padStart(2, '0');
  if (days > 0) return `${days}g ${hh}h ${mm}m ${ss}s`;
  if (hours > 0) return `${hh}h ${mm}m ${ss}s`;
  return `${mm}m ${ss}s`;
};

function SeoulAvailabilityFloating({ page }: { page: SitePage }) {
  const [data, setData] = useState<SeoulAvailability | null>(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [manualPosition, setManualPosition] = useState<{ x: number; y: number } | null>(null);
  const [registrationRemainingMs, setRegistrationRemainingMs] = useState(getSeoulRegistrationRemainingMs());
  const dragStateRef = useRef<{ pointerId: number; startX: number; startY: number; left: number; top: number; moved: boolean } | null>(null);
  const suppressClickRef = useRef(false);

  useEffect(() => {
    let refreshTimer: number | undefined;
    let timeoutTimer: number | undefined;
    let disposed = false;
    let activeScript: HTMLScriptElement | null = null;
    let activeCallback = '';

    const cleanupRequest = () => {
      if (timeoutTimer) window.clearTimeout(timeoutTimer);
      if (activeScript?.parentNode) activeScript.parentNode.removeChild(activeScript);
      if (activeCallback) {
        const target = window as typeof window & Record<string, unknown>;
        try { delete target[activeCallback]; } catch { target[activeCallback] = undefined; }
      }
      activeScript = null;
      activeCallback = '';
    };

    const scheduleNext = (seconds?: number) => {
      if (disposed) return;
      if (refreshTimer) window.clearTimeout(refreshTimer);
      const delay = Math.max(15, Number(seconds) || 30) * 1000;
      refreshTimer = window.setTimeout(loadStatus, delay);
    };

    const loadStatus = () => {
      cleanupRequest();
      if (disposed) return;
      setLoading(true);

      const callbackName = `__seoulAvailability_${Date.now()}_${Math.floor(Math.random() * 100000)}`;
      const script = document.createElement('script');
      const target = window as typeof window & Record<string, unknown>;
      activeCallback = callbackName;
      activeScript = script;

      target[callbackName] = (payload: SeoulAvailability) => {
        cleanupRequest();
        if (disposed) return;
        const valid = Boolean(
          payload?.ok &&
          Number.isFinite(Number(payload.totalePosti)) &&
          Number.isFinite(Number(payload.postiRimanenti))
        );
        if (!valid) {
          setFailed(true);
          setLoading(false);
          scheduleNext(30);
          return;
        }
        setData(payload);
        setFailed(false);
        setLoading(false);
        scheduleNext(payload.refreshSecondi);
      };

      const params = new URLSearchParams({
        action: 'seoul',
        callback: callbackName,
        _: String(Date.now()),
      });

      timeoutTimer = window.setTimeout(() => {
        cleanupRequest();
        if (disposed) return;
        setFailed(true);
        setLoading(false);
        scheduleNext(30);
      }, 12000);

      script.async = true;
      script.src = `${SEOUL_AVAILABILITY_URL}?${params.toString()}`;
      script.onerror = () => {
        cleanupRequest();
        if (disposed) return;
        setFailed(true);
        setLoading(false);
        scheduleNext(30);
      };
      document.head.appendChild(script);
    };

    loadStatus();
    return () => {
      disposed = true;
      cleanupRequest();
      if (refreshTimer) window.clearTimeout(refreshTimer);
    };
  }, []);

  useEffect(() => {
    const updateCountdown = () => setRegistrationRemainingMs(getSeoulRegistrationRemainingMs());
    updateCountdown();
    const timer = window.setInterval(updateCountdown, 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen]);

  useEffect(() => {
    setManualPosition(null);
  }, [page]);

  const handleTriggerPointerDown = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (event.button !== 0) return;
    const rect = event.currentTarget.getBoundingClientRect();
    dragStateRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      left: rect.left,
      top: rect.top,
      moved: false,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handleTriggerPointerMove = (event: React.PointerEvent<HTMLButtonElement>) => {
    const drag = dragStateRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    const dx = event.clientX - drag.startX;
    const dy = event.clientY - drag.startY;
    if (!drag.moved && Math.hypot(dx, dy) < 5) return;
    drag.moved = true;
    const rect = event.currentTarget.getBoundingClientRect();
    const margin = 8;
    const x = Math.min(Math.max(margin, drag.left + dx), Math.max(margin, window.innerWidth - rect.width - margin));
    const y = Math.min(Math.max(margin, drag.top + dy), Math.max(margin, window.innerHeight - rect.height - margin));
    setManualPosition({ x, y });
  };

  const handleTriggerPointerUp = (event: React.PointerEvent<HTMLButtonElement>) => {
    const drag = dragStateRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    suppressClickRef.current = drag.moved;
    dragStateRef.current = null;
    try { event.currentTarget.releasePointerCapture(event.pointerId); } catch { /* no-op */ }
  };

  const total = data ? Math.max(0, Number(data.totalePosti) || 0) : 0;
  const remaining = data ? Math.max(0, Number(data.postiRimanenti) || 0) : 0;
  const occupied = Math.max(0, total - remaining);
  const percentage = total > 0 ? Math.min(100, Math.max(0, (occupied / total) * 100)) : 0;
  const soldOut = Boolean(data?.blocco || (data && remaining <= 0));
  const registrationsClosed = registrationRemainingMs <= 0;
  const compactCountdown = registrationsClosed ? 'ISCRIZIONI CHIUSE' : `Tempo rimanente: ${formatSeoulCountdown(registrationRemainingMs, 'compact')}`;
  const fullCountdown = registrationsClosed ? 'Le iscrizioni si sono chiuse il 30/10/2026 alle 23:59.' : `Tempo rimanente: ${formatSeoulCountdown(registrationRemainingMs, 'full')}`;

  return (
    <>
      <button
        type="button"
        className={`seoul-floating-trigger seoul-floating-trigger--${page} ${manualPosition ? 'is-manually-positioned' : ''} ${soldOut ? 'is-sold-out' : ''}`}
        style={manualPosition ? { left: manualPosition.x, top: manualPosition.y, right: 'auto', bottom: 'auto', transform: 'none' } : undefined}
        onPointerDown={handleTriggerPointerDown}
        onPointerMove={handleTriggerPointerMove}
        onPointerUp={handleTriggerPointerUp}
        onPointerCancel={handleTriggerPointerUp}
        onClick={() => {
          if (suppressClickRef.current) {
            suppressClickRef.current = false;
            return;
          }
          setIsOpen(true);
        }}
        aria-label={data ? (soldOut ? 'Apri disponibilità posti: posti esauriti' : `Apri disponibilità posti: ${remaining} posti rimasti`) : 'Apri disponibilità posti Korea 2027'}
        title={soldOut ? 'Posti esauriti – Pellegrinaggio Piemonte e Svizzera' : 'Posti rimasti – Pellegrinaggio Piemonte e Svizzera. Puoi anche trascinare il pulsante.'}
      >
        <span className="seoul-floating-trigger-main">
          <img src="/images/widget-jmj-logo-rounded.jpg" alt="" aria-hidden="true" className="seoul-floating-logo-mark" />
          <span className="seoul-floating-trigger-copy">
            <small>Piemonte · Svizzera</small>
            <strong>{soldOut ? 'POSTI ESAURITI' : 'Posti rimasti'}</strong>
          </span>
          <span className="seoul-floating-trigger-count" aria-live="polite">
            {loading && !data ? <span className="seoul-posti-spinner" aria-hidden="true" /> : data ? (soldOut ? total : remaining) : '—'}
          </span>
        </span>
        <span className={`seoul-floating-trigger-deadline ${registrationsClosed ? 'is-expired' : ''}`}>
          <span className="seoul-floating-trigger-deadline-label">Chiusura iscrizioni: 30/10/2026 · 23:59</span>
          <strong>{compactCountdown}</strong>
        </span>
      </button>

      {isOpen ? (
        <div className="seoul-floating-layer" role="dialog" aria-modal="true" aria-label="Disponibilità posti pellegrinaggio Korea 2027">
          <button
            type="button"
            className="seoul-floating-backdrop"
            onClick={() => setIsOpen(false)}
            aria-label="Chiudi disponibilità posti"
          />

          <section className={`seoul-floating-panel seoul-floating-panel--${page} ${soldOut ? 'is-sold-out' : ''}`}>
            <button
              type="button"
              className="seoul-floating-close"
              onClick={() => setIsOpen(false)}
              aria-label="Chiudi"
            >
              <X size={20} />
            </button>

            <div className="seoul-floating-panel-head">
              <div className="seoul-floating-brand">
                <img src="/images/widget-jmj-logo-rounded.jpg" alt="Logo JMJ del widget posti rimasti" className="seoul-floating-brand-mark" />
                <div>
                  <p>Posti Korea 2027</p>
                  <span>Pellegrinaggio Piemonte e Svizzera</span>
                </div>
              </div>
              <div className={`seoul-floating-live ${soldOut ? 'is-sold-out' : ''}`}><span /> {soldOut ? 'Posti esauriti' : 'Disponibilità aggiornata'}</div>
            </div>

            {failed && !data ? (
              <div className="seoul-floating-error" role="status">
                Disponibilità momentaneamente non leggibile. Il sistema riproverà automaticamente.
              </div>
            ) : (
              <div className={`seoul-floating-main ${soldOut ? 'is-sold-out' : ''}`} aria-live="polite">
                <div className="seoul-floating-remaining">
                  {soldOut ? (
                    <div className="seoul-floating-soldout-copy">
                      <strong>POSTI ESAURITI</strong>
                      <span>0 posti rimasti</span>
                    </div>
                  ) : (
                    <>
                      <strong>{data ? remaining : '—'}</strong>
                      <span>posti rimasti</span>
                    </>
                  )}
                </div>
                <div className="seoul-floating-stat">
                  <strong>{data ? occupied : '—'}</strong>
                  <span>occupati</span>
                </div>
                <div className="seoul-floating-stat">
                  <strong>{data ? total : '—'}</strong>
                  <span>totali</span>
                </div>
              </div>
            )}

            <div className={`seoul-floating-progress ${soldOut ? 'is-sold-out' : ''}`} aria-hidden="true">
              <span style={{ width: `${soldOut ? 100 : percentage}%` }} />
            </div>
            {data ? (
              <div className="seoul-floating-progress-copy">
                <span>{occupied} occupati</span>
                <span>{remaining} disponibili</span>
              </div>
            ) : null}

            <div className={`seoul-floating-deadline-card ${registrationsClosed ? 'is-expired' : ''}`}>
              <div className="seoul-floating-deadline-grid">
                <div className="seoul-floating-deadline-col seoul-floating-deadline-col--event">
                  <span className="seoul-floating-deadline-chip"><Clock3 size={15} /> Chiusura iscrizioni</span>
                  <span className="seoul-floating-deadline-date">30/10/2026 · 23:59</span>
                </div>
                <div className="seoul-floating-deadline-divider" aria-hidden="true" />
                <div className="seoul-floating-deadline-col seoul-floating-deadline-col--countdown">
                  <span className="seoul-floating-deadline-title">Countdown</span>
                  <strong>{registrationsClosed ? 'ISCRIZIONI CHIUSE' : formatSeoulCountdown(registrationRemainingMs, 'compact')}</strong>
                </div>
              </div>
            </div>
          </section>
        </div>
      ) : null}
    </>
  );
}

type PilgrimageSong = {
  id: number;
  title: string;
  subtitle: string;
  duration: string;
  audioSrc: string;
  textPdfSrc: string;
  textImageSrc: string;
};

const PILGRIMAGE_SONGS: PilgrimageSong[] = [
  {
    id: 2,
    title: 'Per amore dei miei fratelli',
    subtitle: 'Per amore dei miei fratelli',
    duration: '3:39',
    audioSrc: 'https://wyd2027way.com/canto/2/file/4?download=true',
    textPdfSrc: 'https://wyd2027way.com/canto/2/file/5?download=true',
    textImageSrc: 'https://wyd2027way.com/canto/2/file/6?download=true',
  },
  {
    id: 3,
    title: 'Andate e annunciate',
    subtitle: 'Andate e annunciate',
    duration: '3:13',
    audioSrc: 'https://wyd2027way.com/canto/3/file/7?download=true',
    textPdfSrc: 'https://wyd2027way.com/canto/3/file/8?download=true',
    textImageSrc: 'https://wyd2027way.com/canto/3/file/9?download=true',
  },
  {
    id: 4,
    title: 'Voglio andare a Gerusalemme',
    subtitle: 'Voglio andare a Gerusalemme',
    duration: '4:11',
    audioSrc: 'https://wyd2027way.com/canto/4/file/10?download=true',
    textPdfSrc: 'https://wyd2027way.com/canto/4/file/11?download=true',
    textImageSrc: 'https://wyd2027way.com/canto/4/file/12?download=true',
  },
  {
    id: 5,
    title: 'Un grande segno',
    subtitle: 'Una gran señal',
    duration: '6:32',
    audioSrc: 'https://wyd2027way.com/canto/5/file/13?download=true',
    textPdfSrc: 'https://wyd2027way.com/canto/5/file/14?download=true',
    textImageSrc: 'https://wyd2027way.com/canto/5/file/15?download=true',
  },
  {
    id: 6,
    title: 'Che belle sono le tue tende',
    subtitle: 'Che belle sono le tue tende',
    duration: '5:55',
    audioSrc: 'https://wyd2027way.com/canto/6/file/16?download=true',
    textPdfSrc: 'https://wyd2027way.com/canto/6/file/17?download=true',
    textImageSrc: 'https://wyd2027way.com/canto/6/file/18?download=true',
  },
  {
    id: 7,
    title: 'Tu sei più bello',
    subtitle: 'Tu sei più bello',
    duration: '4:43',
    audioSrc: 'https://wyd2027way.com/canto/7/file/19?download=true',
    textPdfSrc: 'https://wyd2027way.com/canto/7/file/20?download=true',
    textImageSrc: 'https://wyd2027way.com/canto/7/file/21?download=true',
  },
  {
    id: 8,
    title: 'Grazie a Jahwè',
    subtitle: 'Grazie a Jahwè',
    duration: '6:07',
    audioSrc: 'https://wyd2027way.com/canto/8/file/22?download=true',
    textPdfSrc: 'https://wyd2027way.com/canto/8/file/23?download=true',
    textImageSrc: 'https://wyd2027way.com/canto/8/file/24?download=true',
  },
  {
    id: 9,
    title: 'Gloria, gloria, gloria',
    subtitle: 'Io vengo a riunire',
    duration: '4:18',
    audioSrc: 'https://wyd2027way.com/canto/9/file/25?download=true',
    textPdfSrc: 'https://wyd2027way.com/canto/9/file/26?download=true',
    textImageSrc: 'https://wyd2027way.com/canto/9/file/27?download=true',
  },
  {
    id: 10,
    title: 'Risuscitò',
    subtitle: 'Risuscitò',
    duration: '5:45',
    audioSrc: 'https://wyd2027way.com/canto/10/file/28?download=true',
    textPdfSrc: 'https://wyd2027way.com/canto/10/file/29?download=true',
    textImageSrc: 'https://wyd2027way.com/canto/10/file/30?download=true',
  },
];

const KOREAN_SONGS: KoreanSong[] = [
  {
    id: 1,
    titleIt: 'Benedetta sei tu, Maria',
    titleKr: '복되신 당신, 마리아',
    videoSrc: 'https://drive.google.com/file/d/1mnNx2WRxY14Jiw_jJSi1TDqUlZvCe9xk/view?usp=sharing',
    sheetSrc: '/canti/benedetta-sei-tu-maria-testo-accordi.png',
  },
  {
    id: 2,
    titleIt: 'Una donna vestita di sole',
    titleKr: '태양을 입은 한 여인',
    note: '2 pagine',
    videoSrc: 'https://drive.google.com/file/d/1lPHFLyrJQV5Q8gHFFpKNI99485GPhZJN/view?usp=sharing',
  },
  {
    id: 3,
    titleIt: 'Le onde della morte mi avvolgevano',
    titleKr: '죽음의 물결이 나를 에워쌌네',
    videoSrc: 'https://drive.google.com/file/d/1bdP3iOYPpwH9OElYkkFr3vUFL6Vs9KB7/view?usp=sharing',
    sheetSrc: '/canti/le-onde-della-morte-mi-avvolgevano-testo-accordi.png',
  },
  {
    id: 4,
    titleIt: 'Guardate come è bello',
    titleKr: '보라, 얼마나 아름다운가',
    videoSrc: 'https://drive.google.com/file/d/17Cu2oZWRT_qLxq3j93MRWtbQELjgQxlg/view?usp=sharing',
    sheetSrc: '/canti/guardate-come-e-bello-testo-accordi.png',
  },
  {
    id: 5,
    titleIt: 'Gerusalemme ricostruita',
    titleKr: '재건된 예루살렘',
    videoSrc: 'https://drive.google.com/file/d/1S6a4PqvvlpTc_pMUK7hIiN2r74NLWfK_/view?usp=sharing',
    sheetSrc: '/canti/gerusalemme-ricostruita-testo-accordi.png',
  },
  {
    id: 6,
    titleIt: 'Andate ed annunziate ai miei fratelli',
    titleKr: '가서 내 형제들에게 전하여라',
    sheetSrc: '/canti/andate-ed-annunziate-ai-miei-fratelli-testo-accordi.png',
  },
  {
    id: 7,
    titleIt: 'Salve Regina dei cieli',
    titleKr: '하늘의 모후님',
    videoSrc: 'https://drive.google.com/file/d/1dx3jsOhpjlw-kNExA8q25tgIVHQue3yH/view?usp=sharing',
    sheetSrc: '/canti/salve-regina-dei-cieli-testo-accordi.png',
  },
];

const RESERVED_AREA_READING_STEPS = [
  {
    title: '⏰ IMPORTANTE – Chiusura iscrizioni del pellegrinaggio vocazionale Piemonte e Svizzera',
    text: 'Questo avviso riguarda esclusivamente l’iscrizione al pellegrinaggio vocazionale Korea 2027 organizzato dal Cammino Neocatecumenale per il gruppo Piemonte e Svizzera; non riguarda la chiusura delle iscrizioni internazionali alla GMG di Seoul 2027. Le iscrizioni al nostro pellegrinaggio si chiuderanno definitivamente il 30 ottobre 2026. Per chi si iscrive a partire dal 20/10, la registrazione e il relativo versamento della quota devono essere effettuati tassativamente entro il 30/10, pena la non accettazione della domanda. Per chi si è invece iscritto prima del 20/10, restano valide le scadenze precedentemente comunicate, fermo restando il termine ultimo e improrogabile del 30/10. La chiusura è necessaria per definire il costo finale del pellegrinaggio e rispettare gli accordi contrattuali già assunti; non sarà quindi possibile prorogare i termini.',
  },
  {
    title: 'ATTENZIONE: creare l’account non basta',
    text: 'Registrarsi all’Area Riservata serve solo per creare l’accesso personale. NON significa essere iscritti al pellegrinaggio Korea 2027. Dopo l’accesso devi continuare fino alla sezione “Iscrizione Pellegrinaggi”.',
  },
  {
    title: '1. Scegli e completa il profilo',
    text: 'Premi “Leggi prima di registrarti”, scegli il profilo corretto e completa i dati anagrafici richiesti. Il profilo è importante, ma da solo non costituisce iscrizione al pellegrinaggio.',
  },
  {
    title: '2. Iscriviti al pellegrinaggio',
    text: 'Dopo aver creato o aperto il profilo, vai nella sezione “Iscrizione Pellegrinaggi”, scegli Korea 2027 e completa l’iscrizione.',
  },
  {
    title: '3. Documenti',
    text: 'I documenti richiesti sono necessari e vanno caricati nella sezione dedicata. Se al momento non li hai disponibili, puoi aggiungerli successivamente: non fermarti per questo e completa comunque l’iscrizione al pellegrinaggio.',
  },
  {
    title: '4. Bonifico: genera prima il codice',
    text: 'La nuova procedura è attiva. Prima di effettuare un versamento delle quote entra nell’Area Riservata, apri “Bonifici e versamenti”, scegli il pellegrinaggio e premi “Genera codice bonifico”. Il codice generato deve comparire nella causale del bonifico; puoi aggiungere altro testo, ma il codice non deve essere modificato. Dopo il bonifico salva la ricevuta e caricala nella stessa sezione, indicando i partecipanti interessati e le relative quote. Non inviare la ricevuta via email: questa procedura serve ad automatizzare i controlli.',
  },
];


type StatusBadgeType = 'updated' | 'new';

const StatusBadge = ({ type }: { type: StatusBadgeType }) => {
  const updated = type === 'updated';
  return (
    <span className={`site-status-badge ${updated ? 'site-status-badge--updated' : 'site-status-badge--new'}`}>
      <span className="site-status-badge-dot" aria-hidden="true" />
      <span>{updated ? 'AGGIORNATO' : 'NUOVO'}</span>
    </span>
  );
};

function App() {
  const [currentPage, setCurrentPage] = useState<SitePage>(() => getSitePageFromPath());
  const [isReservedGuideOpen, setIsReservedGuideOpen] = useState(false);
  const [isReservedReadingOpen, setIsReservedReadingOpen] = useState(false);
  const [reservedReadingStep, setReservedReadingStep] = useState(0);
  const [isBankDetailsOpen, setIsBankDetailsOpen] = useState(false);
  const [isPaymentInstructionsOpen, setIsPaymentInstructionsOpen] = useState(false);
  const [isPaymentNoticeOpen, setIsPaymentNoticeOpen] = useState(false);
  const [openVideoId, setOpenVideoId] = useState<number | null>(1);
  const [expandedSongKey, setExpandedSongKey] = useState<string | null>(null);
  const [songViewer, setSongViewer] = useState<{ type: 'video' | 'sheet'; title: string; src: string } | null>(null);
  const [tutorialViewer, setTutorialViewer] = useState<TutorialViewer | null>(null);
  const [sheetZoom, setSheetZoom] = useState(1);
  const sheetViewportRef = useRef<HTMLDivElement | null>(null);
  const sheetPointersRef = useRef(new Map<number, { x: number; y: number }>());
  const sheetPinchStartRef = useRef<{ distance: number; zoom: number } | null>(null);
  const sheetPanLastRef = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const syncRoute = () => setCurrentPage(getSitePageFromPath());
    window.addEventListener('popstate', syncRoute);
    window.addEventListener('site-route-change', syncRoute as EventListener);
    return () => {
      window.removeEventListener('popstate', syncRoute);
      window.removeEventListener('site-route-change', syncRoute as EventListener);
    };
  }, []);

  useEffect(() => {
    const hash = window.location.hash.replace('#', '');
    if (!hash) {
      window.scrollTo({ top: 0, behavior: 'auto' });
      return;
    }
    const timer = window.setTimeout(() => {
      const target = document.getElementById(hash);
      if (target) window.scrollTo({ top: Math.max(0, target.offsetTop - 92), behavior: 'auto' });
    }, 80);
    return () => window.clearTimeout(timer);
  }, [currentPage]);

  const startReservedAreaReading = () => {
    navigateToSection('area-riservata');
    setReservedReadingStep(0);
    window.setTimeout(() => setIsReservedReadingOpen(true), 360);
  };

  const completeReservedAreaReading = () => {
    setIsReservedReadingOpen(false);
    window.setTimeout(() => navigateToSection('passaporti'), 120);
  };

  const continueAfterPassportReading = () => {
    navigateToSection('visti-passaporti');
  };

  const continueAfterVisaPassportInfo = () => {
    navigateToSection('area-riservata');
  };

  const openReservedAreaChoice = () => {
    window.dispatchEvent(new CustomEvent('reserved-area-choice:open'));
  };

  const completeReservedProfileGuide = () => {
    setIsReservedGuideOpen(false);
    window.setTimeout(() => navigateToSection('reserved-area-entry'), 120);
  };

  useEffect(() => {
    const handleReservedAreaReading = () => startReservedAreaReading();
    window.addEventListener('reserved-area-reading:start', handleReservedAreaReading);
    return () => window.removeEventListener('reserved-area-reading:start', handleReservedAreaReading);
  }, []);

  useEffect(() => {
    if (!isReservedReadingOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isReservedReadingOpen]);

  useEffect(() => {
    if (!tutorialViewer) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [tutorialViewer]);

  useEffect(() => {
    const openPaymentInstructions = () => setIsPaymentInstructionsOpen(true);
    window.addEventListener('payment-instructions:open', openPaymentInstructions);
    return () => window.removeEventListener('payment-instructions:open', openPaymentInstructions);
  }, []);

  const openSongViewer = (type: 'video' | 'sheet', song: KoreanSong) => {
    const src = type === 'video' ? song.videoSrc : song.sheetSrc;
    if (!src) return;
    setSheetZoom(1);
    sheetPointersRef.current.clear();
    sheetPinchStartRef.current = null;
    sheetPanLastRef.current = null;
    setSongViewer({ type, title: song.titleIt, src });
  };

  useEffect(() => {
    const viewport = sheetViewportRef.current;
    if (!viewport || songViewer?.type !== 'sheet') return;

    const handleWheel = (event: WheelEvent) => {
      event.preventDefault();
      const step = event.deltaY < 0 ? 0.1 : -0.1;
      setSheetZoom((value) => Math.min(3, Math.max(0.6, Number((value + step).toFixed(2)))));
    };

    viewport.addEventListener('wheel', handleWheel, { passive: false });
    return () => viewport.removeEventListener('wheel', handleWheel);
  }, [songViewer]);

  return (
    <div className={`min-h-screen site-shell theme-verso-la-luce site-page site-page-${currentPage}`}>
      <SiteMotion />
      <Navigation />
      <PageIntro page={currentPage} />

      {/* ✅ Pulsante chat custom (Tawk launcher nascosto) */}
     

      


      <section id="home" data-page="home" className="page-section hero-section min-h-screen relative flex items-center justify-center">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: 'url(/images/maria.png)',
          }}
        >
          <div className="absolute inset-0 bg-black/40"></div>
        </div>
        <div className="hero-copy relative z-10 text-center px-4 max-w-[94vw] mx-auto pt-24 sm:pt-16 -translate-y-[202px] sm:-translate-y-[96px] md:-translate-y-[72px]">
          <div className="hero-title-wrap space-y-2 sm:space-y-3">
            {SITE_CONFIG.heroTitleLines.map((line, index) => {
              const isFirst = index === 0;
              const isLast = index === SITE_CONFIG.heroTitleLines.length - 1;
              const titleClass = isFirst
                ? 'text-[clamp(2rem,9.8vw,6.2rem)] sm:text-[clamp(2.7rem,14vw,6.5rem)]'
                : isLast
                  ? 'text-[clamp(2.15rem,10.4vw,6.2rem)] sm:text-[clamp(3rem,16vw,7.5rem)]'
                  : 'text-[clamp(2.45rem,11.6vw,7rem)] sm:text-[clamp(3rem,16vw,7.5rem)]';

              if (isLast && line.includes(' - ')) {
                const [left, right] = line.split(' - ');
                return (
                  <div
                    key={`${line}-${index}`}
                    className={`font-serif text-white font-bold leading-none tracking-tight ${titleClass}`}
                    style={{ textShadow: '4px 4px 8px rgba(0,0,0,0.8)' }}
                  >
                    <span className="hidden min-[560px]:inline">{left} - {right}</span>
                    <span className="inline min-[560px]:hidden">
                      <span className="block">{left}</span>
                      <span className="block">-</span>
                      <span className="block">{right}</span>
                    </span>
                  </div>
                );
              }

              return (
                <h1
                  key={`${line}-${index}`}
                  className={`font-serif text-white font-bold leading-none tracking-tight ${titleClass}`}
                  style={{ textShadow: '4px 4px 8px rgba(0,0,0,0.8)' }}
                >
                  {line}
                </h1>
              );
            })}
            <p
              className="text-white/95 text-[clamp(1rem,4.6vw,1.65rem)] sm:text-[clamp(1.1rem,3.2vw,1.85rem)] font-medium tracking-[0.18em] uppercase pt-3"
              style={{ textShadow: '3px 3px 6px rgba(0,0,0,0.75)' }}
            >
              Cammino Neocatecumenale
            </p>
          </div>
        </div>
        <div className="hero-scroll-cue" aria-hidden="true">
          <span>Scopri</span>
          <ChevronDown className="h-5 w-5" />
        </div>
      </section>

      <section id="giorni-alla-partenza" data-page="home" className="page-section content-section section-countdown py-20 bg-black">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-4xl md:text-5xl font-serif text-white font-bold tracking-wider mb-4">
              Giorni alla GMG internazionale
            </h2>
            <p className="text-white/80 mt-4 text-lg md:text-xl">
              Il conto alla rovescia indica l&apos;inizio della GMG internazionale a Seoul, previsto per il <span className="font-bold text-white">3 agosto 2027</span>. Le date di partenza dei gruppi restano invece in definizione.
            </p>
            <div className="w-32 h-1 bg-amber-600 mx-auto mt-4"></div>
          </div>

          <div className="flex justify-center">
            <FlipCountdown target={new Date('2027-08-03T00:00:00+02:00')} />
          </div>
        </div>
      </section>


      <section id="home-sezioni" data-page="home" className="page-section home-sections-hub">
        <div className="container mx-auto px-4">
          <div className="home-hub-heading">
            <p>Informazioni principali</p>
            <h2>Scegli cosa vuoi consultare</h2>
          </div>
          <div className="home-hub-grid">
            {([
              ['Pellegrinaggio Korea 2027', 'Iscrizione del gruppo, GMG e incontro vocazionale', 'gmg-2027-iscrizione', null],
              ['Passaporti e visti', 'Documenti, validità e indicazioni per l’ingresso in Corea', 'passaporti', null],
              ['Area Riservata', 'Profilo, iscrizione, documenti e versamenti personali', 'area-riservata', null],
              ['Installa la web app', 'Icona sul cellulare, tutorial e notifiche push', 'installa-app', null],
              ['Canti 2027', 'Audio, testi, accordi e video karaoke', 'canti-in-coreano', 'new'],
              ['Versamenti', 'Codice bonifico, dati bancari e caricamento ricevute', 'donazioni', 'updated'],
            ] as Array<[string, string, string, StatusBadgeType | null]>).map(([title, description, target, badge], index) => (
              <button
                key={target}
                type="button"
                className="home-hub-card"
                onClick={() => target === 'area-riservata' ? openReservedAreaChoice() : navigateToSection(target)}
              >
                <span className="home-hub-index">{String(index + 1).padStart(2, '0')}</span>
                <span className="home-hub-card-copy">
                  <span className="home-hub-title-row">
                    <strong>{title}</strong>
                    {badge ? <StatusBadge type={badge as StatusBadgeType} /> : null}
                  </span>
                  <small>{description}</small>
                </span>
                <span className="home-hub-arrow" aria-hidden="true">→</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section id="gmg-2027-iscrizione" data-page="pellegrinaggio" className="page-section content-section section-registration py-20 bg-stone-100">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div id="invito-santo-padre" className="papal-invitation-card mx-auto mb-12 max-w-4xl overflow-hidden rounded-2xl border-2 border-amber-500 bg-gradient-to-br from-amber-50 via-white to-sky-50 text-left shadow-lg">
              <div className="px-4 py-4 sm:px-6 sm:py-5">
                <div className="mb-2 flex justify-center"><StatusBadge type="new" /></div>
                <p className="papal-invitation-title text-center text-sm font-extrabold uppercase tracking-wide text-amber-800 sm:text-base">
                  Invito del Santo Padre alla GMG Seoul 2027
                </p>
                <p className="papal-invitation-copy mt-3 text-center text-base font-semibold leading-relaxed text-gray-800">
                  Il <strong>22 ottobre 2026</strong> si aprono ufficialmente le iscrizioni internazionali alla GMG di Seoul 2027.
                </p>
              </div>
              <div className="aspect-video w-full bg-black">
                <iframe
                  src="https://www.youtube-nocookie.com/embed/yr_PK5uBjMM?autoplay=0&rel=0&playsinline=1"
                  title="Invito del Santo Padre ai giovani per la GMG Seoul 2027"
                  className="h-full w-full"
                  allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  loading="lazy"
                />
              </div>
            </div>

            <div className="text-center mb-12">
              <div className="flex items-center justify-center">
                <h2 className="text-4xl md:text-5xl font-serif font-bold tracking-wider">
                  ISCRIZIONI AL PELLEGRINAGGIO VOCAZIONALE KOREA 2027
                </h2>
              </div>
              <div className="w-32 h-1 bg-amber-600 mx-auto mt-4"></div>
            </div>

            <div className="bg-white rounded-3xl shadow-xl border border-gray-200 p-6 sm:p-8 md:p-12 space-y-6 text-center">
              <p className="text-2xl font-bold leading-snug text-gray-700 md:text-3xl">
                Gruppo Piemonte e Svizzera<br />
                Cammino Neocatecumenale
              </p>

              <div className="mx-auto max-w-3xl rounded-2xl border border-sky-300 bg-sky-50 px-4 py-4 text-left shadow-sm sm:px-6 sm:py-5">
                <p className="text-center text-sm font-extrabold uppercase tracking-wide text-sky-800 sm:text-base">
                  Iscrizione al nostro pellegrinaggio
                </p>
                <div className="mt-3 space-y-3 text-base leading-relaxed text-sky-950 sm:text-lg">
                  <p>
                    Questa sezione riguarda <strong>esclusivamente l&apos;iscrizione al pellegrinaggio vocazionale Korea 2027 organizzato per il gruppo Piemonte e Svizzera del Cammino Neocatecumenale</strong>. È distinta dall&apos;iscrizione internazionale alla GMG di Seoul 2027, che si apre ufficialmente il <strong>22 ottobre 2026</strong>.
                  </p>
                  <p>
                    Il nostro pellegrinaggio si svolge nello stesso periodo della GMG e comprende un cammino di preparazione, la partecipazione alla <strong>Veglia con il Santo Padre del 7 agosto</strong>, alla <strong>Santa Messa dell&apos;8 agosto</strong> e all&apos;<strong>Incontro Vocazionale del 9 agosto 2027</strong> con gli iniziatori e l&apos;Équipe Internazionale del Cammino Neocatecumenale.
                  </p>
                </div>
              </div>


              <div className="mx-auto max-w-3xl rounded-2xl border-2 border-red-600 bg-red-50 px-4 py-4 text-left shadow-md sm:px-6 sm:py-5">
                <p className="text-center text-sm font-extrabold uppercase tracking-wide text-red-700 sm:text-base">
                  ⏰ Importante – Chiusura iscrizioni del pellegrinaggio vocazionale Piemonte e Svizzera
                </p>
                <div className="mt-3 space-y-3 text-base font-semibold leading-relaxed text-red-950 sm:text-lg">
                  <p>
                    Si ricorda che le iscrizioni al <strong>pellegrinaggio vocazionale Korea 2027 del gruppo Piemonte e Svizzera</strong> si chiuderanno definitivamente il <strong>30 ottobre 2026</strong>. Questa scadenza riguarda il nostro pellegrinaggio organizzato dal Cammino Neocatecumenale e <strong>non la registrazione internazionale alla GMG</strong>.
                  </p>
                  <p>
                    Per chi si iscrive a partire dal <strong>20/10</strong>, la registrazione e il relativo versamento della quota devono essere effettuati tassativamente entro il <strong>30/10</strong>, pena la non accettazione della domanda. Per chi si è invece iscritto prima del <strong>20/10</strong>, restano valide le scadenze precedentemente comunicate, fermo restando il termine ultimo e improrogabile del <strong>30/10</strong>.
                  </p>
                  <p>
                    La chiusura è necessaria per definire il costo finale del pellegrinaggio e rispettare gli accordi contrattuali già assunti. Il mancato rispetto delle scadenze comporterebbe un aumento dei costi per tutti i partecipanti; per questo motivo, <strong>non sarà possibile in alcun modo prorogare i termini</strong>.
                  </p>
                </div>
              </div>

                <div className="mx-auto max-w-3xl rounded-xl border-2 border-red-500 bg-red-50 px-3 py-3 text-left shadow-sm sm:px-4 sm:py-4">
                <p className="whitespace-nowrap text-center text-sm font-extrabold uppercase leading-tight tracking-wide text-red-800 sm:text-base md:text-lg">
                  Informazioni
                </p>
                <div className="mt-3 space-y-2 text-sm leading-relaxed text-gray-900 sm:text-base">
                  <p className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-2">
                    <span className="font-extrabold text-amber-900">Partecipanti di 13 e 14 anni:</span>{' '}
                    il pellegrinaggio è aperto anche ai ragazzi di 13 e 14 anni, a condizione che siano già inseriti in una comunità del Cammino Neocatecumenale. Per situazioni diverse o particolari, inviare una email all&apos;organizzazione all&apos;indirizzo:
                    <span
                      className="mt-1 block whitespace-nowrap font-bold"
                      style={{ fontSize: 'clamp(9.5px, 2.8vw, 16px)', letterSpacing: '-0.02em' }}
                    >
                      {SITE_CONFIG.email}
                    </span>
                  </p>
                  <p className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-2">
                    <span className="font-extrabold text-amber-900">Partecipanti minorenni:</span>{' '}
                    poiché in Corea la maggiore età si raggiunge a 19 anni, anche i partecipanti di 18 anni dovranno presentare il modello firmato dai genitori.
                  </p>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <details className="group mx-auto max-w-3xl overflow-hidden rounded-xl border-2 border-amber-600 bg-white text-left shadow-sm">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-5 py-4 font-bold text-amber-900 transition-colors hover:bg-amber-50 [&::-webkit-details-marker]:hidden">
                    <span className="inline-flex items-center gap-2">
                      <FileText size={19} />
                      Info viaggio
                    </span>
                    <ChevronDown className="h-5 w-5 shrink-0 transition-transform duration-300 group-open:rotate-180" />
                  </summary>
                  <div className="space-y-4 border-t border-amber-200 bg-amber-50/40 p-4 sm:p-5">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="rounded-xl border border-gray-200 bg-white px-4 py-4">
                        <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Periodo indicativo del pellegrinaggio</p>
                        <p className="mt-1 text-lg font-extrabold text-gray-900">Fine luglio – 10/12 agosto 2027</p>
                        <p className="mt-1 text-sm leading-relaxed text-gray-600">
                          Le partenze potranno essere scaglionate in più gruppi, indicativamente tra il <span className="font-bold">30 e il 31 luglio</span>, in base ai voli che verranno confermati. I rientri potranno avvenire indicativamente il <span className="font-bold">10, 11 o 12 agosto</span>. Sono date ancora in fase di definizione.
                        </p>
                      </div>
                      <div className="rounded-xl border-2 border-red-400 bg-red-50 px-4 py-4">
                        <p className="text-xs font-bold uppercase tracking-wider text-red-800">Prima rata richiesta</p>
                        <p className="mt-1 text-2xl font-extrabold text-red-950">400,00 € <span className="text-sm font-bold">per partecipante</span></p>
                        <p className="mt-1 text-sm font-extrabold leading-relaxed text-red-900">ENTRO E NON OLTRE IL 20 OTTOBRE 2026</p>
                      </div>
                    </div>
                    <div className="rounded-xl border-2 border-sky-400 bg-sky-50 px-4 py-4 text-sky-950 shadow-sm">
                      <p className="text-base font-extrabold sm:text-lg">GMG internazionale e incontro vocazionale</p>
                      <div className="mt-3 grid gap-2 sm:grid-cols-3">
                        <div className="rounded-lg bg-white px-3 py-3 ring-1 ring-sky-200">
                          <p className="text-xs font-bold uppercase tracking-wide text-sky-700">3–8 agosto 2027</p>
                          <p className="mt-1 text-sm font-semibold">Giornata Mondiale della Gioventù a Seoul</p>
                        </div>
                        <div className="rounded-lg bg-white px-3 py-3 ring-1 ring-sky-200">
                          <p className="text-xs font-bold uppercase tracking-wide text-sky-700">7–8 agosto</p>
                          <p className="mt-1 text-sm font-semibold">Veglia il 7 e Santa Messa con il Santo Padre l&apos;8</p>
                        </div>
                        <div className="rounded-lg bg-white px-3 py-3 ring-1 ring-sky-200">
                          <p className="text-xs font-bold uppercase tracking-wide text-sky-700">9 agosto</p>
                          <p className="mt-1 text-sm font-semibold">Incontro vocazionale del Cammino Neocatecumenale</p>
                        </div>
                      </div>
                      <p className="mt-3 text-sm leading-relaxed sm:text-base">
                        Come Cammino Neocatecumenale parteciperemo alla <span className="font-bold">Veglia</span> e alla <span className="font-bold">Santa Messa con il Santo Padre</span>; il giorno successivo parteciperemo all&apos;<span className="font-bold">incontro vocazionale</span>.
                      </p>
                    </div>

                    <div className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-4 text-amber-950">
                      <p className="font-extrabold">Programma e costo complessivo ancora in definizione</p>
                      <p className="mt-2 text-sm leading-relaxed sm:text-base">
                        Il programma completo del pellegrinaggio sarà pubblicato prossimamente. La cifra totale non è ancora definita perché la quotazione dei voli non è stata ancora confermata.
                      </p>
                      <p className="mt-2 text-sm font-semibold leading-relaxed sm:text-base">
                        Le richieste sono moltissime e le disponibilità sono limitate, soprattutto per i gruppi: per questo le partenze e i rientri potranno essere distribuiti su voli e giorni diversi.
                      </p>
                    </div>

                    <div className="rounded-xl border-2 border-red-500 bg-red-50 px-4 py-4 text-red-950 shadow-sm">
                      <p className="text-base font-extrabold sm:text-lg">Prima rata per confermare iscrizione e volo</p>
                      <p className="mt-2 text-sm leading-relaxed sm:text-base">
                        Come annunciato all&apos;incontro del <span className="font-bold">04/10/2026</span>, per confermare economicamente l&apos;iscrizione è necessario versare <span className="font-extrabold">400,00 € per ogni partecipante</span> entro e non oltre il <span className="font-extrabold">20 ottobre 2026</span>.
                      </p>
                      <p className="mt-2 text-sm font-semibold leading-relaxed sm:text-base">
                        La data è inderogabile e la quota serve a bloccare il posto sul volo. Senza il versamento entro la scadenza l&apos;iscrizione non può essere considerata completa.
                      </p>
                      <p className="mt-2 rounded-lg border border-red-300 bg-white/70 px-3 py-2 text-sm font-bold leading-relaxed text-red-950 sm:text-base">
                        Prima del bonifico entra nell&apos;Area Riservata, apri <span className="font-extrabold">“Bonifici e versamenti”</span>, scegli il pellegrinaggio e genera il <span className="font-extrabold">codice bonifico</span>. Il codice deve comparire nella causale. Dopo il pagamento salva la ricevuta e caricala nella stessa sezione associando i partecipanti e le relative quote.
                      </p>
                      <p className="mt-2 text-sm leading-relaxed sm:text-base">
                        Il costo complessivo del pellegrinaggio e il piano completo delle rate non sono ancora definitivi. Le rate successive saranno comunicate prossimamente.
                      </p>
                    </div>
                  </div>
                </details>

                <div className="flex justify-center">
                  <button
                    type="button"
                    onClick={() => navigateToSection('area-riservata')}
                    className="inline-flex items-center justify-center bg-amber-600 text-white px-8 py-4 rounded-lg font-semibold transition-colors hover:bg-amber-700"
                  >
                    Iscriviti dall&apos;area riservata
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="passaporti" data-page="documenti" className="page-section content-section passport-alerts py-16 md:py-20 bg-slate-950 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_top,rgba(245,158,11,0.16),transparent_45%)]" aria-hidden="true" />
        <div className="container relative mx-auto px-4">
          <div className="mx-auto max-w-5xl">
            <div className="text-center">
              <span className="passport-important-badge inline-flex items-center rounded-full bg-red-600 px-3 py-1 text-xs font-extrabold tracking-wider text-white shadow-lg">
                AVVISO IMPORTANTE
              </span>
              <h2 className="mt-4 text-3xl md:text-5xl font-serif font-bold tracking-wide text-white">
                🛂 PASSAPORTO — KOREA 2027
              </h2>
              <div className="mt-4 h-1 w-32 bg-amber-500 mx-auto" />
              <p className="mt-5 text-base md:text-lg leading-relaxed text-white/85">
                Leggi con attenzione queste indicazioni prima di completare i dati nell&apos;Area Riservata.
              </p>
            </div>

            <div className="mt-9 grid gap-6 lg:grid-cols-2">
              <article className="passport-alert-card rounded-3xl border-2 border-amber-400/70 bg-white px-5 py-6 shadow-2xl sm:px-7 sm:py-8">
                <h3 className="text-xl sm:text-2xl font-extrabold leading-snug text-slate-950">
                  🛂 IMPORTANTE – Validità del passaporto per Korea 2027
                </h3>
                <div className="mt-5 space-y-4 text-[15px] sm:text-base leading-relaxed text-slate-800">
                  <p>
                    Per entrare in Corea del Sud, <strong>non è sufficiente che il passaporto sia valido durante il viaggio</strong>.
                  </p>
                  <p>
                    Secondo le attuali indicazioni della Farnesina, per i cittadini italiani che viaggiano senza visto è richiesta una <strong>validità residua del passaporto di almeno 3 mesi</strong>.
                  </p>
                  <p>
                    Per maggiore sicurezza, considerando eventuali scali internazionali, richieste delle compagnie aeree o imprevisti, <strong>si raccomanda una validità residua di almeno 6 mesi dalla data di rientro</strong>.
                  </p>
                  <p>
                    Per il pellegrinaggio <strong>Korea 2027</strong>, considerando il rientro entro il 12 agosto 2027:
                  </p>
                  <ul className="list-disc space-y-2 pl-5">
                    <li><strong>Scadenza minima consigliata:</strong> 12 febbraio 2028 (6 mesi).</li>
                    <li>Chi ha un passaporto con scadenza precedente è invitato a verificarne i requisiti ed eventualmente provvedere al rinnovo.</li>
                  </ul>
                  <p>
                    <strong>Attenzione:</strong> per i partecipanti con cittadinanza diversa da quella italiana potrebbero essere previste condizioni differenti.
                  </p>
                  <p>Le disposizioni saranno soggette a verifica prima della partenza.</p>
                  <p className="pt-1 font-semibold">
                    Fonte ufficiale:{' '}
                    <a
                      href="https://www.viaggiaresicuri.it/find-country/country/KOR"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="passport-source-link text-blue-700 underline decoration-2 underline-offset-2 hover:text-blue-900"
                    >
                      Farnesina – Viaggiare Sicuri, Corea del Sud
                    </a>
                  </p>
                </div>
              </article>

              <article className="passport-alert-card rounded-3xl border-2 border-red-400/70 bg-white px-5 py-6 shadow-2xl sm:px-7 sm:py-8">
                <h3 className="text-xl sm:text-2xl font-extrabold leading-snug text-slate-950">
                  🛂 IMPORTANTE – Inserimento dati del passaporto
                </h3>
                <div className="mt-5 space-y-4 text-[15px] sm:text-base leading-relaxed text-slate-800">
                  <p>
                    Per una corretta organizzazione del pellegrinaggio <strong>Korea 2027</strong>, invitiamo tutti i partecipanti a inserire quanto prima i dati del proprio passaporto nell&apos;<strong>Area Riservata</strong>.
                  </p>
                  <p className="rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3 font-extrabold text-slate-950">
                    Prima vengono inseriti i dati, meglio sarà possibile organizzare e gestire le prenotazioni dei voli e le pratiche di viaggio.
                  </p>
                  <p>
                    Si raccomanda pertanto di provvedere il prima possibile e <strong>comunque non oltre il 30 aprile 2027</strong>.
                  </p>
                  <p>
                    Chi deve richiedere o rinnovare il passaporto è invitato ad attivarsi tempestivamente, considerando i tempi necessari per il rilascio.
                  </p>
                  <p className="font-bold text-slate-950">
                    La collaborazione di tutti è fondamentale per evitare ritardi o difficoltà nell&apos;organizzazione del viaggio.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={continueAfterPassportReading}
                  className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-amber-400 px-5 py-3 text-center text-sm sm:text-base font-extrabold text-black shadow-lg transition-transform hover:scale-[1.02] hover:bg-amber-300 active:scale-[.98]"
                >
                  HO LETTO GLI AVVISI — CONTINUA
                </button>
              </article>
            </div>
          </div>
        </div>
      </section>

      <section id="visti-passaporti" data-page="documenti" className="page-section content-section passport-alerts py-16 md:py-20 bg-slate-100 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_top_right,rgba(14,165,233,0.12),transparent_42%)]" aria-hidden="true" />
        <div className="container relative mx-auto px-4">
          <div className="mx-auto max-w-6xl">
            <div className="text-center">
              <span className="passport-important-badge inline-flex items-center rounded-full bg-sky-700 px-3 py-1 text-xs font-extrabold tracking-wider text-white shadow-lg">
                NUOVA SEZIONE · INFORMAZIONI IMPORTANTI
              </span>
              <h2 className="mt-4 text-3xl md:text-5xl font-serif font-bold tracking-wide text-slate-950">
                🛂 VISTI E PASSAPORTI — KOREA 2027
              </h2>
              <div className="mt-4 h-1 w-32 bg-sky-600 mx-auto" />
              <p className="mx-auto mt-5 max-w-4xl text-base md:text-lg leading-relaxed text-slate-700">
                Informazioni operative per chi parte dall&apos;Italia o dalla Svizzera e per chi deve richiedere o rinnovare il passaporto. Le regole di ingresso possono cambiare: prima della partenza verranno ricontrollate sulle fonti ufficiali.
              </p>
            </div>

            <div className="mt-9 grid gap-6 lg:grid-cols-2">
              <article className="passport-alert-card rounded-3xl border-2 border-sky-300 bg-white px-5 py-6 shadow-xl sm:px-7 sm:py-8">
                <h3 className="text-xl sm:text-2xl font-extrabold leading-snug text-slate-950">
                  🌏 Visto per entrare in Corea del Sud
                </h3>
                <div className="mt-5 space-y-4 text-[15px] sm:text-base leading-relaxed text-slate-800">
                  <p>
                    <strong>Conta la cittadinanza indicata dal passaporto con cui si viaggia.</strong> Vivere o partire dall&apos;Italia o dalla Svizzera non elimina da solo un eventuale obbligo di visto.
                  </p>
                  <p>
                    Per i normali soggiorni brevi, i passaporti italiani e svizzeri rientrano normalmente tra quelli esenti dal visto sudcoreano. Per altre cittadinanze le condizioni possono essere diverse e, in alcuni casi, è necessario un visto consolare.
                  </p>
                  <div className="rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3 text-amber-950">
                    <p className="font-extrabold">Visto e K-ETA non sono la stessa cosa.</p>
                    <p className="mt-1">
                      Il K-ETA può riguardare soltanto chi ha già diritto all&apos;ingresso senza visto. L&apos;esenzione temporanea K-ETA per varie cittadinanze, tra cui Italia e Svizzera, risulta attualmente valida fino al <strong>31 dicembre 2026</strong>; per agosto 2027 la situazione dovrà essere verificata nuovamente.
                    </p>
                  </div>
                  <p>
                    Quando prevista, la <strong>e-Arrival Card</strong> è distinta dal K-ETA. Chi vive in Italia o Svizzera con un passaporto straniero deve inoltre controllare il proprio titolo di soggiorno, il diritto di rientro e le regole degli eventuali Paesi di transito.
                  </p>
                  <p className="font-semibold text-slate-950">
                    Per passaporti non italiani o svizzeri, non basarti soltanto sul Paese di residenza: verifica sempre la cittadinanza effettiva e le regole applicabili al passaporto utilizzato.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setTutorialViewer({ type: 'pdf', title: 'Guida visti e passaporti esteri — Korea 2027', src: '/documenti/Guida_Visti_Passaporti_Esteri_Korea_2027.pdf' })}
                  className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-sky-700 px-5 py-3 font-extrabold text-white shadow-md transition hover:bg-sky-800"
                >
                  <FileText size={19} /> APRI LA GUIDA COMPLETA PDF
                </button>
              </article>

              <article className="passport-alert-card rounded-3xl border-2 border-emerald-300 bg-white px-5 py-6 shadow-xl sm:px-7 sm:py-8">
                <h3 className="text-xl sm:text-2xl font-extrabold leading-snug text-slate-950">
                  📮 Richiesta del passaporto presso gli uffici postali
                </h3>
                <div className="mt-5 space-y-4 text-[15px] sm:text-base leading-relaxed text-slate-800">
                  <p>
                    Il passaporto elettronico può essere richiesto anche presso gli <strong>uffici postali abilitati di Poste Italiane</strong>, oltre che tramite i canali della Polizia di Stato. È una possibilità utile per cercare un appuntamento alternativo, ma non garantisce automaticamente tempi di rilascio più brevi.
                  </p>
                  <p>
                    Chi è residente o domiciliato in un Comune abilitato può presentare la domanda in un ufficio postale abilitato del proprio Comune o della propria provincia. <strong>Prima di spostarsi bisogna verificare che il Comune e l&apos;ufficio scelto siano effettivamente abilitati.</strong>
                  </p>
                  <ul className="list-disc space-y-2 pl-5">
                    <li>Il servizio è rivolto ai maggiorenni e ai genitori che presentano la domanda per un minorenne.</li>
                    <li>Non è disponibile in alcuni casi particolari, tra cui iscritti AIRE, doppio passaporto o passaporto temporaneo.</li>
                    <li>Per i minorenni sono richiesti documenti e consensi aggiuntivi; in alcune situazioni occorre rivolgersi direttamente alla Polizia di Stato.</li>
                  </ul>
                  <div className="rounded-2xl border border-emerald-300 bg-emerald-50 px-4 py-3 text-emerald-950">
                    <p className="font-extrabold">Muoviti con largo anticipo.</p>
                    <p className="mt-1">
                      La guida consiglia di non attendere gli ultimi mesi: per Korea 2027 è opportuno attivarsi il prima possibile e, una volta ottenuto il passaporto, inserire tempestivamente i dati nell&apos;Area Riservata.
                    </p>
                  </div>
                  <p>
                    Per la domanda servono normalmente documento d&apos;identità e copia, codice fiscale, fototessera recente, contrassegno telematico, pagamento del contributo previsto e il vecchio passaporto se posseduto. Costi e modalità possono essere aggiornati dagli enti competenti.
                  </p>
                </div>
                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => setTutorialViewer({ type: 'pdf', title: 'Guida passaporto presso uffici postali — Piemonte', src: '/documenti/Guida_Passaporto_Piemonte_Korea_2027.pdf' })}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 py-3 font-extrabold text-white shadow-md transition hover:bg-emerald-800"
                  >
                    <FileText size={19} /> APRI GUIDA PDF
                  </button>
                  <a
                    href="https://www.poste.it/polis-passaporto-elettronico"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center rounded-xl border-2 border-emerald-700 px-4 py-3 text-center font-extrabold text-emerald-800 transition hover:bg-emerald-50"
                  >
                    VERIFICA SU POSTE ITALIANE
                  </a>
                </div>
              </article>
            </div>

            <div className="mx-auto mt-8 max-w-4xl rounded-2xl border-2 border-amber-400 bg-amber-50 px-5 py-5 text-center text-slate-950 shadow-lg">
              <p className="font-extrabold">⚠️ Informazioni soggette ad aggiornamento</p>
              <p className="mt-2 text-sm leading-relaxed sm:text-base">
                Le guide riportano le regole verificate a ottobre 2026. Per il viaggio di luglio/agosto 2027 sarà indispensabile una nuova verifica ufficiale di visto, K-ETA, e-Arrival Card, transiti e modalità di rilascio dei passaporti.
              </p>
              <button
                type="button"
                onClick={continueAfterVisaPassportInfo}
                className="mt-4 inline-flex w-full max-w-xl items-center justify-center rounded-full bg-amber-400 px-5 py-3 text-sm font-extrabold text-black shadow-lg transition-transform hover:scale-[1.01] hover:bg-amber-300 active:scale-[.98] sm:text-base"
              >
                HO LETTO — CONTINUA ALL&apos;AREA RISERVATA
              </button>
            </div>
          </div>
        </div>
      </section>

      <section id="area-riservata" data-page="area-riservata" className="page-section content-section section-private py-20 bg-black relative">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-8">
            <h2 className="text-4xl md:text-5xl font-serif text-white font-bold tracking-wider">
              AREA RISERVATA
            </h2>
            <div className="w-32 h-1 bg-amber-600 mx-auto"></div>
            <div className="mx-auto max-w-4xl space-y-5 text-center">
              <p className="text-2xl md:text-3xl font-serif font-bold text-white">
                Accedi o Registrati
              </p>
              <p className="text-lg md:text-xl text-white/90 font-light tracking-wide leading-relaxed">
                Crea un account inserendo un&apos;e-mail valida e una password a tua scelta, oppure accedi per gestire il tuo profilo e le tue iscrizioni.
              </p>

              <div className="rounded-2xl border-2 border-red-400 bg-red-500/15 px-4 py-4 text-left shadow-lg sm:px-5 sm:py-5">
                <p className="text-center text-sm font-extrabold uppercase tracking-wide text-red-200 sm:text-base">
                  ⏰ Importante – Chiusura iscrizioni del pellegrinaggio vocazionale Piemonte e Svizzera
                </p>
                <div className="mt-3 space-y-3 text-base font-semibold leading-relaxed text-white sm:text-lg">
                  <p>
                    Questo avviso riguarda le iscrizioni al <strong className="text-red-100">pellegrinaggio vocazionale Korea 2027 del gruppo Piemonte e Svizzera</strong>, non la registrazione internazionale alla GMG. Le iscrizioni al nostro pellegrinaggio si chiuderanno definitivamente il <strong className="text-red-100">30 ottobre 2026</strong>.
                  </p>
                  <p>
                    Per chi si iscrive a partire dal <strong className="text-red-100">20/10</strong>, la registrazione e il relativo versamento della quota devono essere effettuati tassativamente entro il <strong className="text-red-100">30/10</strong>, pena la non accettazione della domanda. Per chi si è invece iscritto prima del <strong className="text-red-100">20/10</strong>, restano valide le scadenze precedentemente comunicate, fermo restando il termine ultimo e improrogabile del <strong className="text-red-100">30/10</strong>.
                  </p>
                  <p>
                    La chiusura è necessaria per definire il costo finale del pellegrinaggio e rispettare gli accordi contrattuali già assunti; per questo motivo, <strong className="text-red-100">non sarà possibile prorogare i termini</strong>.
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-amber-300/60 bg-amber-300/10 px-5 py-5 text-base md:text-lg leading-relaxed text-white">
                <p className="font-bold text-amber-200">Se devi iscriverti, parti da qui</p>
                <p className="mt-2 text-white/90">
                  Leggi i passaggi qui sotto prima di aprire l&apos;Area Riservata: spiegano come creare il profilo, completare l&apos;iscrizione al pellegrinaggio, gestire i documenti e utilizzare la nuova procedura dei bonifici.
                </p>
                <p className="mt-2 text-sm text-white/75 sm:text-base">
                  Se preferisci, puoi anche usare il percorso guidato con le informazioni su passaporti e visti. <span className="font-bold text-white">Non è obbligatorio.</span>
                </p>
                <div className="mt-4 flex justify-center">
                  <button
                    type="button"
                    onClick={startReservedAreaReading}
                    className="inline-flex items-center justify-center rounded-xl border border-amber-300 bg-amber-300/10 px-5 py-3 font-extrabold text-amber-100 transition hover:bg-amber-300/20"
                  >
                    Avvia percorso guidato (facoltativo)
                  </button>
                </div>
              </div>

              <div className="rounded-3xl border border-amber-300/50 bg-white/10 px-4 py-5 sm:px-6 sm:py-6">
                <p className="text-xl md:text-2xl font-serif font-bold text-white">
                  ⚠️ Come procedere dentro l&apos;Area Riservata
                </p>

                <div className="mt-5 grid gap-4 text-center">
                  <article className="rounded-2xl border border-white/15 bg-black/20 px-4 py-4">
                    <p className="text-lg font-semibold text-white">1. Crea l&apos;accesso e completa il profilo</p>
                    <p className="mt-2 text-white/85 leading-relaxed">
                      Registrati con e-mail e password, scegli il profilo corretto e completa i dati anagrafici. <span className="font-bold text-amber-200">Questo passaggio da solo NON ti iscrive al pellegrinaggio.</span>
                    </p>
                  </article>

                  <article className="rounded-2xl border-2 border-amber-400 bg-amber-400/10 px-4 py-5 shadow-lg">
                    <p className="text-xl font-extrabold text-amber-200">2. ISCRIVITI AL PELLEGRINAGGIO</p>
                    <p className="mt-2 text-white leading-relaxed">
                      Questa è l&apos;operazione fondamentale. Nell&apos;Area Riservata apri <span className="font-extrabold">“Iscrizione Pellegrinaggi”</span>, seleziona <span className="font-extrabold">Korea 2027</span> e completa la procedura.
                    </p>
                    <p className="mt-2 font-bold text-red-200">Se non fai questo passaggio, non risulti iscritto al pellegrinaggio.</p>
                  </article>

                  <article className="rounded-2xl border border-white/15 bg-black/20 px-4 py-4">
                    <p className="text-lg font-semibold text-white">3. Documenti</p>
                    <p className="mt-2 text-white/85 leading-relaxed">
                      I documenti richiesti sono necessari. Se li hai, caricali subito; se non sono ancora disponibili, potrai aggiungerli successivamente. <span className="font-semibold text-white">Non rimandare per questo l&apos;iscrizione al pellegrinaggio.</span>
                    </p>
                  </article>

                  <article className="rounded-2xl border-2 border-amber-400 bg-amber-400/10 px-4 py-5">
                    <p className="text-lg font-extrabold text-amber-200">4. Genera il codice bonifico prima di pagare</p>
                    <p className="mt-2 text-white/90 leading-relaxed">
                      Nell&apos;Area Riservata apri <span className="font-extrabold text-white">“Bonifici e versamenti”</span>, scegli il pellegrinaggio e premi <span className="font-extrabold text-white">“Genera codice bonifico”</span>. Il codice generato deve comparire nella causale. Puoi scrivere liberamente il resto della causale, ma il codice deve rimanere presente e invariato.
                    </p>
                    <p className="mt-2 font-bold leading-relaxed text-amber-200">
                      Dopo il bonifico salva la ricevuta e, nella stessa sezione, allegala indicando i partecipanti interessati e le relative quote. Non inviare la ricevuta via email: questo passaggio permette di automatizzare i controlli.
                    </p>
                  </article>
                </div>
              </div>
            </div>

            <div id="reserved-area-actions" className="pt-4 md:pt-6 flex flex-col items-center gap-4">
              <div className="relative inline-flex items-center justify-center group">
                <button
                  type="button"
                  onClick={() => setIsReservedGuideOpen(true)}
                  className="registration-guide-cta inline-flex items-center justify-center gap-2 rounded-full bg-amber-400 px-4 py-2.5 text-sm font-extrabold tracking-wide text-black shadow-xl hover:scale-[1.03] hover:bg-amber-300 active:scale-95 transition-all duration-200 sm:px-5 sm:text-base"
                  aria-label="Scegli il profilo corretto"
                  title="Scegli il profilo corretto"
                >
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-black text-sm font-black leading-none text-white">i</span>
                  <span>LEGGI PRIMA DI REGISTRARTI</span>
                </button>

                <div className="pointer-events-none absolute left-1/2 top-full z-10 mt-3 w-max max-w-[88vw] -translate-x-1/2 rounded-lg border border-amber-300/60 bg-black/95 px-3 py-2 text-center text-xs font-semibold text-white opacity-0 shadow-xl transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100 translate-y-1">
                  Scegli il profilo corretto.
                </div>
              </div>

              <div className="w-full max-w-2xl rounded-2xl border border-emerald-400/60 bg-emerald-500/10 px-4 py-4 text-center text-white sm:px-5">
                <div className="flex flex-wrap items-center justify-center gap-3">
                  <img src="/images/ios.jpg" alt="iOS" className="h-10 w-10 rounded-xl bg-white object-contain p-1 shadow-sm" />
                  <img src="/images/android.jpg" alt="Android" className="h-10 w-10 rounded-xl bg-white object-contain p-1 shadow-sm" />
                  <p className="font-extrabold text-emerald-200">Puoi installare l&apos;Area Riservata sul cellulare</p>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-white/90 sm:text-base">
                  Se sei già iscritto, ti consigliamo di aprire l&apos;Area Riservata direttamente dall&apos;icona installata sul cellulare: in questo modo puoi utilizzare correttamente anche le notifiche push. Dal sito puoi comunque accedere con il browser, ma le funzioni delle notifiche non sono complete come nella web app installata.
                </p>
                <button
                  type="button"
                  onClick={() => document.getElementById('installa-app')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                  className="mt-3 inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-emerald-700 sm:text-base"
                >
                  <Smartphone size={18} /> Vedi istruzioni iOS e Android
                </button>
              </div>

              <div className="w-full max-w-2xl rounded-xl border border-red-400/70 bg-red-500/15 px-3 py-2 text-center shadow-sm">
                <p className="text-sm font-extrabold leading-snug text-red-100 sm:text-base">
                  ⚠️ Per il <strong>pellegrinaggio vocazionale Korea 2027 del gruppo Piemonte e Svizzera</strong>, le iscrizioni si chiuderanno definitivamente il <span className="whitespace-nowrap">30 ottobre 2026</span>. Questa scadenza non riguarda la registrazione internazionale alla GMG.
                </p>
              </div>

              <div id="reserved-area-entry" className="w-full max-w-md">
                <p className="reserved-area-entry-title text-center font-serif font-bold tracking-wider text-white">
                  Entra nell&apos;area riservata
                </p>
                <div className="reserved-area-entry-visual relative mt-4">
                  <a
                    href={SITE_CONFIG.reservedAreaUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="reserved-area-image-link group relative block"
                    title="Clicca sull'immagine per entrare nell'area riservata"
                    aria-label="Entra nell'area riservata"
                  >
                    <img
                      src="/images/area-riservata-animata-v2.gif"
                      alt="Area Riservata"
                      className="w-full h-auto rounded-lg shadow-2xl transition-transform duration-150 group-hover:scale-[1.01]"
                      draggable={false}
                    />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="installa-app" data-page="app" className="page-section content-section section-app-install py-20 bg-stone-100">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-6xl">
            <div className="text-center mb-10">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-lg">
                <Smartphone size={30} />
              </div>
              <h2 className="mx-auto max-w-4xl font-serif text-3xl font-bold uppercase leading-tight text-black sm:text-4xl md:text-5xl">
                Installa l&apos;Area Riservata sul cellulare
              </h2>
              <span className="mt-4 inline-flex animate-pulse rounded-full bg-emerald-600 px-3 py-1 text-xs font-bold tracking-wider text-white shadow-lg">
                APP + NOTIFICHE PUSH
              </span>
              <div className="w-32 h-1 bg-amber-600 mx-auto mt-4"></div>
              <p className="mx-auto mt-6 max-w-4xl text-lg leading-relaxed text-gray-700 md:text-xl">
                L&apos;Area Riservata è una web app: puoi continuare a utilizzarla normalmente anche dal browser senza installarla. Installandola, però, avrai l&apos;icona direttamente sul cellulare e, dopo l&apos;accesso, potrai attivare le notifiche push come in una normale app.
              </p>
              <p className="mx-auto mt-3 max-w-4xl text-base font-semibold leading-relaxed text-gray-800 md:text-lg">
                Questo sistema è stato introdotto per avere un canale diretto e affidabile per la consegna delle comunicazioni importanti dell&apos;organizzazione.
              </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <article className="rounded-3xl border border-gray-200 bg-white p-6 shadow-xl sm:p-8">
                <div className="flex items-center gap-4">
                  <img src="/images/ios.jpg" alt="Logo iOS" className="h-16 w-16 shrink-0 rounded-2xl bg-white object-contain p-1 shadow-sm sm:h-20 sm:w-20" />
                  <div>
                    <p className="text-2xl font-serif font-bold text-black">iPhone / iPad</p>
                    <p className="text-sm font-semibold text-gray-500">Installa da Safari</p>
                  </div>
                </div>
                <ol className="mt-6 space-y-3 text-left text-base leading-relaxed text-gray-700">
                  <li><span className="font-bold text-black">1.</span> Apri l&apos;Area Riservata con <span className="font-bold">Safari</span>.</li>
                  <li><span className="font-bold text-black">2.</span> Tocca <span className="font-bold">Condividi</span> e scegli <span className="font-bold">“Aggiungi alla schermata Home”</span>.</li>
                  <li><span className="font-bold text-black">3.</span> Lascia attivo <span className="font-bold">“Apri come app web”</span> e conferma con <span className="font-bold">“Aggiungi”</span>.</li>
                  <li><span className="font-bold text-black">4.</span> Apri l&apos;icona dalla Home, accedi e <span className="font-bold">attiva le notifiche</span> quando richiesto.</li>
                </ol>
                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => setTutorialViewer({ type: 'video', title: 'Video tutorial iOS', src: SITE_CONFIG.iosTutorialUrl })}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-black px-5 py-4 font-bold text-white transition-colors hover:bg-gray-800"
                  >
                    <Play size={19} /> Guarda video
                  </button>
                  <button
                    type="button"
                    onClick={() => setTutorialViewer({ type: 'pdf', title: 'Guida iOS passo passo', src: SITE_CONFIG.iosGuideUrl })}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl border-2 border-black bg-white px-5 py-4 font-bold text-black transition-colors hover:bg-gray-100"
                  >
                    <FileText size={19} /> Apri guida PDF
                  </button>
                </div>
              </article>

              <article className="rounded-3xl border border-gray-200 bg-white p-6 shadow-xl sm:p-8">
                <div className="flex items-center gap-4">
                  <img src="/images/android.jpg" alt="Logo Android" className="h-16 w-16 shrink-0 rounded-2xl bg-white object-contain p-1 shadow-sm sm:h-20 sm:w-20" />
                  <div>
                    <p className="text-2xl font-serif font-bold text-black">Android</p>
                    <p className="text-sm font-semibold text-gray-500">Installa da Chrome</p>
                  </div>
                </div>
                <ol className="mt-6 space-y-3 text-left text-base leading-relaxed text-gray-700">
                  <li><span className="font-bold text-black">1.</span> Apri l&apos;Area Riservata con <span className="font-bold">Chrome</span>.</li>
                  <li><span className="font-bold text-black">2.</span> Tocca il menu <span className="font-bold">⋮</span> e scegli <span className="font-bold">“Installa app”</span> oppure <span className="font-bold">“Aggiungi a schermata Home”</span>.</li>
                  <li><span className="font-bold text-black">3.</span> Conferma l&apos;installazione e apri la nuova icona dalla schermata Home.</li>
                  <li><span className="font-bold text-black">4.</span> Accedi con le tue credenziali e <span className="font-bold">attiva le notifiche</span> quando richiesto.</li>
                </ol>
                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => setTutorialViewer({ type: 'video', title: 'Video tutorial Android', src: SITE_CONFIG.androidTutorialUrl })}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-4 font-bold text-white transition-colors hover:bg-emerald-700"
                  >
                    <Play size={19} /> Guarda video
                  </button>
                  <button
                    type="button"
                    onClick={() => setTutorialViewer({ type: 'pdf', title: 'Guida Android passo passo', src: SITE_CONFIG.androidGuideUrl })}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl border-2 border-emerald-600 bg-white px-5 py-4 font-bold text-emerald-800 transition-colors hover:bg-emerald-50"
                  >
                    <FileText size={19} /> Apri guida PDF
                  </button>
                </div>
              </article>
            </div>

            <div className="mt-6 rounded-3xl border-2 border-amber-400 bg-amber-50 p-5 text-amber-950 shadow-sm sm:p-6">
              <div className="flex items-start gap-3">
                <Bell className="mt-0.5 h-6 w-6 shrink-0" />
                <div className="text-left">
                  <p className="font-extrabold">Importante per le notifiche</p>
                  <p className="mt-1 leading-relaxed">
                    L&apos;attivazione delle notifiche avviene <span className="font-bold">dopo l&apos;accesso</span> alla web app. Se scegli di non installarla, puoi comunque continuare a utilizzare l&apos;Area Riservata dal link del sito.
                  </p>
                </div>
              </div>
            </div>

            <article className="mt-8 rounded-3xl border-2 border-emerald-500 bg-white p-6 shadow-xl sm:p-8">
              <div className="flex flex-col items-center gap-5 text-center sm:flex-row sm:text-left">
                <img src="/images/whatsapp.jpg" alt="Logo WhatsApp" className="h-20 w-20 shrink-0 rounded-2xl object-cover shadow-sm" />
                <div className="flex-1">
                  <h3 className="text-2xl font-serif font-bold text-black">Gruppo WhatsApp partecipanti</h3>
                  <p className="mt-2 text-base leading-relaxed text-gray-700">
                    Il gruppo WhatsApp è <span className="font-bold">separato dalle notifiche della web app</span>. L&apos;amministrazione lo utilizzerà per inviare comunicazioni a tutti i partecipanti che hanno scelto di aggiungersi al gruppo.
                  </p>
                </div>
                <a
                  href={SITE_CONFIG.whatsappGroupUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex w-full items-center justify-center gap-3 rounded-xl bg-[#25D366] px-5 py-4 text-center text-sm font-extrabold text-white shadow-lg transition-transform hover:scale-[1.02] sm:w-auto sm:px-6 sm:text-base"
                >
                  <img src="/images/whatsapp.jpg" alt="" aria-hidden="true" className="h-7 w-7 rounded-md object-cover" />
                  Unisciti al gruppo WhatsApp
                </a>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section id="wyd-seul" data-page="pellegrinaggio" className="page-section content-section section-wyd py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
            <div className="space-y-6">
              <h2 className="text-4xl md:text-5xl font-serif font-bold">WYD Seoul 2027</h2>
              <p className="text-lg text-gray-700 leading-relaxed">
                La Giornata Mondiale della Gioventù 2027 si svolgerà a Seoul, in Corea del Sud,
                dal <span className="font-bold">3 all&apos;8 agosto 2027</span>. Per il nostro gruppo del Cammino Neocatecumenale, i momenti centrali saranno la <span className="font-bold">Veglia con il Santo Padre il 7 agosto</span>, la <span className="font-bold">Santa Messa l&apos;8 agosto</span> e, il giorno successivo, l&apos;<span className="font-bold">incontro vocazionale del 9 agosto</span>.
              </p>
              <p className="text-lg text-gray-700 leading-relaxed">
                Unisciti a noi in questo straordinario pellegrinaggio che cambierà la tua vita.
                Scopri la bellezza della cultura coreana mentre approfondisci la tua fede.
              </p>
              <p className="text-lg text-gray-700 leading-relaxed font-bold text-black">
                "Abbiate coraggio: io ho vinto il mondo."
              </p>
              <p className="text-lg text-gray-700 leading-relaxed">
                I giovani, “lieti nella speranza” (tema della 38ª Giornata Mondiale della Gioventù), “camminano senza stancarsi” (tema della 39ª Giornata Mondiale della Gioventù), ‘testimoniando’ Cristo che hanno già incontrato (tema della 40ª Giornata Mondiale della Gioventù) e con “coraggio” (tema della 41ª Giornata Mondiale della Gioventù) si mettono in cammino verso Seoul.
              </p>
              <p className="text-lg text-gray-700 leading-relaxed">
                Papa Francesco ha scelto il versetto 33 del capitolo 16 del Vangelo secondo Giovanni come tema della GMG 2027 a Seoul. Queste parole, rivolte ai discepoli durante l'Ultima Cena, ci ricordano la profonda verità che Gesù, anche di fronte alla sofferenza e alla morte imminente, aveva già superato la paura e alla fine aveva vinto la morte. La certezza della resurrezione contenuta in queste parole non è semplice ottimismo, ma significa “speranza e coraggio” profondamente radicati nel Cristo vivente.
              </p>
              <p className="text-lg text-gray-700 leading-relaxed">
                I giovani di tutto il mondo, che oggi affrontano diverse sfide quali conflitti, precarietà lavorativa e difficoltà economiche, sperimenteranno la gioia di essere “luce e sale del mondo” durante la GMG che si terrà a Seoul nel 2027. Incontrandosi e sperimentando l'amore incondizionato, saranno inviati nel mondo come “pellegrini di speranza” e “missionari pieni di coraggio”, mettendo in pratica con coraggio nella loro vita la gioia del Vangelo che hanno compreso.
              </p>
              <a
                href="https://wydseoul.org/it"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-black text-white px-8 py-4 rounded-lg font-semibold hover:bg-gray-800 transition-colors"
              >
                VAI AL SITO
              </a>
            </div>
            <div className="flex justify-center">
              <div className="transform rotate-3 hover:rotate-0 transition-transform duration-300">
                <div className="bg-white p-4 shadow-2xl rounded-lg">
                  <img
                    src="/images/logo.png"
                    alt="WYD Seoul 2027"
                    className="w-full h-auto rounded"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="incontro-vocazionale" data-page="pellegrinaggio" className="page-section content-section py-20 bg-amber-50">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-5xl">
            <div className="mb-10 text-center">
              <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
                <h2 className="text-4xl md:text-5xl font-serif font-bold tracking-wider text-slate-950">
                  INCONTRO VOCAZIONALE
                </h2>
                <StatusBadge type="new" />
              </div>
              <div className="w-32 h-1 bg-amber-600 mx-auto mt-4"></div>
              <p className="mt-4 text-xl font-extrabold text-amber-800 md:text-2xl">9 AGOSTO 2027 · SEOUL</p>
            </div>

            <div className="rounded-3xl border border-amber-200 bg-white p-5 shadow-xl sm:p-8 md:p-10">
              <p className="text-lg leading-relaxed text-slate-700 sm:text-xl">
                L&apos;<strong>Incontro Vocazionale del Cammino Neocatecumenale</strong> con{' '}
                <a
                  href="https://www.google.com/search?kgmid=%2Fm%2F098yzs&q=Kiko+Arg%C3%BCello"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold text-amber-800 underline decoration-amber-500 underline-offset-4 hover:text-amber-950"
                >
                  Kiko Argüello
                </a>{' '}
                e l&apos;<strong>Équipe Internazionale</strong> si terrà a Seoul il <strong>9 agosto 2027</strong> presso il centro espositivo <strong>KINTEX</strong>.
              </p>

              <div className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-black shadow-2xl">
                <div className="aspect-video w-full">
                  <iframe
                    className="h-full w-full"
                    src="https://www.youtube.com/embed/8Oe72bPA1OA?autoplay=0&rel=0"
                    title="Incontro Vocazionale del Cammino Neocatecumenale"
                    allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                    loading="lazy"
                  />
                </div>
              </div>
              <p className="mt-3 text-center text-sm text-slate-500">Il video resta in pausa finché non premi Play.</p>
            </div>
          </div>
        </div>
      </section>

      <section id="sezione-video" data-page="video" className="page-section content-section section-videos py-20 bg-black">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-serif text-white font-bold tracking-wider mb-4">
              SEZIONE VIDEO
            </h2>
            <div className="w-32 h-1 bg-amber-600 mx-auto"></div>
          </div>

          {[
            {
              id: 1,
              title: 'WYD Seoul 2027 - World Youth Day South Korea',
              youtubeId: 'BMbkoZwqRtI',
              buttonLabel: 'Guarda video 1',
            },
            {
              id: 2,
              title: 'WYD Seoul 2027 - Official Promo Video',
              youtubeId: 'DgtBKDW8iq0',
              buttonLabel: 'Guarda video 2',
            },
            {
              id: 3,
              title: 'Esperienza Seminarista in Corea',
              youtubeId: '3EBJaZTvQ8w',
              buttonLabel: 'Guarda video 3',
            },
            {
              id: 4,
              title: 'Invito del Vescovo di Seoul',
              youtubeId: 'PXKnjtHtVFw',
              buttonLabel: 'Guarda video 4',
            },
          ].map((video) => {
            const isOpen = openVideoId === video.id;
            return (
              <div key={video.id} className="text-center space-y-4 mb-16 last:mb-0">
                <h3 className="text-3xl md:text-4xl font-serif text-white font-bold tracking-wider">
                  {video.title}
                </h3>
                <div className="w-24 h-1 bg-amber-600 mx-auto"></div>
                <div className="max-w-4xl mx-auto">
                  <div className="relative aspect-video rounded-lg overflow-hidden shadow-2xl mb-8 bg-black">
                    {isOpen ? (
                      <iframe
                        className="w-full h-full"
                        src={`https://www.youtube.com/embed/${video.youtubeId}?autoplay=1&mute=${video.id === 1 ? 1 : 0}&rel=0`}
                        title={video.title}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        referrerPolicy="strict-origin-when-cross-origin"
                        allowFullScreen
                      />
                    ) : (
                      <>
                        <img
                          src={`https://img.youtube.com/vi/${video.youtubeId}/hqdefault.jpg`}
                          alt={`Anteprima ${video.title}`}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                      </>
                    )}
                  </div>
                  <div className="text-center">
                    <button
                      type="button"
                      onClick={() => setOpenVideoId(video.id)}
                      className="inline-flex items-center gap-2 bg-transparent text-white border-2 border-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-black transition-all shadow-lg"
                    >
                      <Play size={20} />
                      {video.buttonLabel}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section id="canti-in-coreano" data-page="canti" className="page-section content-section section-songs py-20 bg-stone-100">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="flex flex-col items-center justify-center gap-3 sm:flex-row sm:items-center">
              <h2 className="text-4xl md:text-5xl font-serif font-bold tracking-wider text-black">
                CANTI PELLEGRINAGGIO 2027
              </h2>
              <StatusBadge type="new" />
            </div>
            <div className="w-32 h-1 bg-amber-600 mx-auto"></div>
            <p className="mx-auto mt-6 max-w-3xl text-lg text-gray-700 leading-relaxed">
              Raccolta unificata dei canti per il pellegrinaggio: audio, testi con accordi e video karaoke in coreano. Apri un canto per visualizzare i materiali disponibili direttamente nella pagina.
            </p>
          </div>

          <div className="mx-auto max-w-5xl space-y-10">
            <div>
              <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
                <div>
                  <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-emerald-700">Raccolta canti</p>
                  <h3 className="mt-1 font-serif text-2xl font-bold text-gray-900 sm:text-3xl">Audio, testi e accordi</h3>
                </div>
                <p className="max-w-xl text-sm leading-relaxed text-gray-600 sm:text-base">
                  Premi sul titolo del canto: si apre il lettore audio e puoi consultare l&apos;anteprima del testo o il PDF.
                </p>
              </div>

              <div className="space-y-3">
                {PILGRIMAGE_SONGS.map((song) => {
                  const songKey = `raccolta-${song.id}`;
                  const expanded = expandedSongKey === songKey;
                  return (
                    <article
                      key={songKey}
                      className="overflow-hidden rounded-2xl border border-slate-200 bg-white/95 shadow-[0_10px_30px_rgba(34,55,73,0.08)]"
                    >
                      <button
                        type="button"
                        onClick={() => setExpandedSongKey(expanded ? null : songKey)}
                        className="flex w-full items-center gap-3 px-4 py-4 text-left transition-colors hover:bg-slate-50 sm:gap-4 sm:px-5"
                        aria-expanded={expanded}
                      >
                        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-emerald-700 to-blue-600 text-white shadow-md">
                          <Play size={18} fill="currentColor" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-base font-bold leading-snug text-slate-900 sm:text-lg">{song.title}</span>
                          <span className="mt-1 block text-xs leading-snug text-slate-500 sm:text-sm">{song.subtitle}</span>
                        </span>
                        <span className="shrink-0 rounded-lg border border-orange-200 bg-orange-50 px-2.5 py-1.5 text-xs font-extrabold text-orange-700">
                          {song.duration}
                        </span>
                        <ChevronDown className={`h-5 w-5 shrink-0 text-slate-400 transition-transform ${expanded ? 'rotate-180' : ''}`} />
                      </button>

                      {expanded ? (
                        <div className="border-t border-slate-200 px-4 pb-5 pt-4 sm:px-5">
                          <audio
                            src={song.audioSrc}
                            controls
                            preload="none"
                            className="h-12 w-full"
                            aria-label={`Audio ${song.title}`}
                          >
                            Il browser non supporta il lettore audio.
                          </audio>

                          <div className="mt-4 flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() => setTutorialViewer({ type: 'pdf', title: `Testo e accordi – ${song.title}`, src: `https://docs.google.com/gview?embedded=1&url=${encodeURIComponent(song.textPdfSrc)}` })}
                              className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-bold text-slate-800 shadow-sm transition-colors hover:bg-slate-50"
                            >
                              <FileText size={16} /> Apri PDF nella pagina
                            </button>
                          </div>

                          <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-slate-50 p-2 sm:p-3">
                            <img
                              src={song.textImageSrc}
                              alt={`Testo e accordi del canto ${song.title}`}
                              loading="lazy"
                              className="mx-auto block h-auto w-full rounded-lg bg-white object-contain"
                            />
                          </div>
                        </div>
                      ) : null}
                    </article>
                  );
                })}
              </div>
            </div>

            <div>
              <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
                <div>
                  <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-amber-700">Coreano</p>
                  <h3 className="mt-1 font-serif text-2xl font-bold text-gray-900 sm:text-3xl">Video karaoke e testi</h3>
                </div>
                <p className="max-w-xl text-sm leading-relaxed text-gray-600 sm:text-base">
                  I canti già presenti sono ora organizzati nello stesso stile. Dove il materiale non è ancora disponibile resta indicato “in arrivo”.
                </p>
              </div>

              <div className="space-y-3">
                {KOREAN_SONGS.map((song) => {
                  const songKey = `coreano-${song.id}`;
                  const expanded = expandedSongKey === songKey;
                  return (
                    <article
                      key={songKey}
                      className="overflow-hidden rounded-2xl border border-slate-200 bg-white/95 shadow-[0_10px_30px_rgba(34,55,73,0.08)]"
                    >
                      <button
                        type="button"
                        onClick={() => setExpandedSongKey(expanded ? null : songKey)}
                        className="flex w-full items-center gap-3 px-4 py-4 text-left transition-colors hover:bg-slate-50 sm:gap-4 sm:px-5"
                        aria-expanded={expanded}
                      >
                        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-emerald-700 to-blue-600 text-white shadow-md">
                          <Play size={18} fill="currentColor" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-base font-bold leading-snug text-slate-900 sm:text-lg">{song.titleIt}</span>
                          <span className="mt-1 block text-xs leading-snug text-slate-500 sm:text-sm">
                            {song.titleKr}{song.note ? ` — ${song.note}` : ''}
                          </span>
                        </span>
                        <span className="shrink-0 rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-1.5 text-[11px] font-extrabold uppercase tracking-wide text-amber-800 sm:text-xs">
                          Karaoke
                        </span>
                        <ChevronDown className={`h-5 w-5 shrink-0 text-slate-400 transition-transform ${expanded ? 'rotate-180' : ''}`} />
                      </button>

                      {expanded ? (
                        <div className="border-t border-slate-200 px-4 pb-5 pt-4 sm:px-5">
                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() => openSongViewer('video', song)}
                              disabled={!song.videoSrc}
                              className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-bold text-white transition-colors ${song.videoSrc ? 'bg-slate-900 hover:bg-slate-700' : 'cursor-not-allowed bg-slate-400'}`}
                            >
                              <Play size={16} /> {song.videoSrc ? 'Apri video karaoke' : 'VIDEO — IN ARRIVO'}
                            </button>
                            <button
                              type="button"
                              onClick={() => openSongViewer('sheet', song)}
                              disabled={!song.sheetSrc}
                              className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-bold text-white transition-colors ${song.sheetSrc ? 'bg-amber-600 hover:bg-amber-700' : 'cursor-not-allowed bg-slate-400'}`}
                            >
                              <FileText size={16} /> {song.sheetSrc ? 'Apri testo a tutto schermo' : 'TESTO — IN ARRIVO'}
                            </button>
                          </div>

                          {song.sheetSrc ? (
                            <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-slate-50 p-2 sm:p-3">
                              <img
                                src={song.sheetSrc}
                                alt={`Testo e accordi del canto ${song.titleIt}`}
                                loading="lazy"
                                className="mx-auto block h-auto w-full rounded-lg bg-white object-contain"
                              />
                            </div>
                          ) : (
                            <div className="mt-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center text-sm font-semibold text-slate-500">
                              Testo e accordi in arrivo.
                            </div>
                          )}
                        </div>
                      ) : null}
                    </article>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {tutorialViewer ? (
        <div
          className="fixed inset-0 z-[130] flex items-center justify-center bg-black/80 p-2 sm:p-5"
          role="dialog"
          aria-modal="true"
          aria-label={tutorialViewer.title}
          onClick={() => setTutorialViewer(null)}
        >
          <div
            className="flex h-[94vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl sm:h-[92vh]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex shrink-0 items-center justify-between gap-3 border-b border-gray-200 bg-white px-4 py-3 sm:px-5">
              <div className="min-w-0">
                <p className="truncate font-serif text-base font-bold text-black sm:text-xl">{tutorialViewer.title}</p>
                <p className="text-xs font-semibold text-gray-500 sm:text-sm">
                  {tutorialViewer.type === 'video' ? 'Riproduzione dentro il sito' : 'Istruzioni PDF dentro il sito'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setTutorialViewer(null)}
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-100 text-black transition-colors hover:bg-gray-200"
                aria-label="Chiudi tutorial"
                title="Chiudi"
              >
                <X size={22} />
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-hidden bg-neutral-900">
              {tutorialViewer.type === 'video' ? (
                <div className="flex h-full w-full items-center justify-center p-2 sm:p-4">
                  <video
                    key={tutorialViewer.src}
                    src={tutorialViewer.src}
                    controls
                    autoPlay
                    playsInline
                    preload="metadata"
                    className="max-h-full w-full rounded-lg bg-black object-contain"
                  >
                    Il tuo browser non supporta la riproduzione video.
                  </video>
                </div>
              ) : (
                <iframe
                  key={tutorialViewer.src}
                  src={tutorialViewer.src}
                  title={tutorialViewer.title}
                  className="h-full w-full bg-white"
                />
              )}
            </div>
          </div>
        </div>
      ) : null}

      {songViewer ? (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-2 sm:p-5">
          <button
            type="button"
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setSongViewer(null)}
            aria-label="Chiudi visualizzatore canto"
          />

          <div
            className={`relative z-10 flex flex-col overflow-hidden rounded-2xl bg-white shadow-2xl ${
              songViewer.type === 'sheet'
                ? 'h-[86dvh] w-[94vw] max-w-3xl sm:w-[78vw]'
                : 'h-[94dvh] w-full max-w-6xl'
            }`}
          >
            <div className="flex shrink-0 items-center justify-between gap-3 border-b border-gray-200 px-4 py-3 sm:px-5">
              <div className="min-w-0">
                <p className="truncate font-serif text-base font-bold text-black sm:text-xl">{songViewer.title}</p>
                <p className="text-xs text-gray-500 sm:text-sm">
                  {songViewer.type === 'video' ? 'Video (voce e testi)' : 'Testo e accordi'}
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSongViewer(null)}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-black text-white transition-colors hover:bg-gray-800"
                  aria-label="Chiudi"
                  title="Chiudi"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-hidden bg-neutral-950">
              {songViewer.type === 'video' ? (
                <div className="flex h-full w-full items-center justify-center p-2 sm:p-4">
                  <iframe
                    key={songViewer.src}
                    src={getGoogleDrivePreviewUrl(songViewer.src)}
                    title={`Video di ${songViewer.title}`}
                    className="h-full w-full rounded-lg bg-black shadow-2xl"
                    allow="autoplay; encrypted-media; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              ) : (
                <div
                  ref={sheetViewportRef}
                  className="h-full w-full cursor-grab overflow-auto bg-stone-200 p-2 active:cursor-grabbing sm:p-4"
                  style={{ touchAction: 'none' }}
                  onPointerDown={(event) => {
                    const viewport = sheetViewportRef.current;
                    if (!viewport) return;
                    viewport.setPointerCapture?.(event.pointerId);
                    const point = { x: event.clientX, y: event.clientY };
                    sheetPointersRef.current.set(event.pointerId, point);

                    if (sheetPointersRef.current.size === 1) {
                      sheetPanLastRef.current = point;
                    } else if (sheetPointersRef.current.size === 2) {
                      const [first, second] = Array.from(sheetPointersRef.current.values());
                      sheetPinchStartRef.current = {
                        distance: Math.hypot(second.x - first.x, second.y - first.y),
                        zoom: sheetZoom,
                      };
                      sheetPanLastRef.current = null;
                    }
                  }}
                  onPointerMove={(event) => {
                    const viewport = sheetViewportRef.current;
                    const previous = sheetPointersRef.current.get(event.pointerId);
                    if (!viewport || !previous) return;

                    const current = { x: event.clientX, y: event.clientY };
                    sheetPointersRef.current.set(event.pointerId, current);

                    if (sheetPointersRef.current.size >= 2 && sheetPinchStartRef.current) {
                      const [first, second] = Array.from(sheetPointersRef.current.values());
                      const distance = Math.hypot(second.x - first.x, second.y - first.y);
                      const ratio = distance / Math.max(1, sheetPinchStartRef.current.distance);
                      setSheetZoom(
                        Math.min(3, Math.max(0.6, Number((sheetPinchStartRef.current.zoom * ratio).toFixed(2))))
                      );
                      return;
                    }

                    if (sheetPointersRef.current.size === 1 && sheetPanLastRef.current) {
                      viewport.scrollLeft -= current.x - sheetPanLastRef.current.x;
                      viewport.scrollTop -= current.y - sheetPanLastRef.current.y;
                      sheetPanLastRef.current = current;
                    }
                  }}
                  onPointerUp={(event) => {
                    sheetPointersRef.current.delete(event.pointerId);
                    sheetPinchStartRef.current = null;
                    const remaining = Array.from(sheetPointersRef.current.values());
                    sheetPanLastRef.current = remaining.length === 1 ? remaining[0] : null;
                  }}
                  onPointerCancel={(event) => {
                    sheetPointersRef.current.delete(event.pointerId);
                    sheetPinchStartRef.current = null;
                    sheetPanLastRef.current = null;
                  }}
                >
                  <img
                    src={songViewer.src}
                    alt={`Testo e accordi di ${songViewer.title}`}
                    className="mx-auto h-auto select-none rounded-lg bg-white shadow-xl"
                    style={{ width: `${sheetZoom * 100}%`, maxWidth: 'none' }}
                    draggable={false}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}

      {isReservedGuideOpen ? (
        <div className="reserved-modal-layer fixed inset-0 flex items-center justify-center px-2 py-2 sm:px-4 sm:py-6">
          <button
            type="button"
            className="absolute inset-0 bg-black/75 backdrop-blur-sm"
            onClick={() => setIsReservedGuideOpen(false)}
            aria-label="Chiudi informazioni registrazione"
          />

          <div className="relative z-10 flex h-[calc(100dvh-1rem)] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-white/20 bg-white text-black shadow-2xl sm:h-auto sm:max-h-[86vh]">
            <div className="shrink-0 flex items-start justify-between gap-2 border-b border-gray-200 bg-white px-3 py-3 sm:px-5 sm:py-4 md:px-6">
              <div className="min-w-0 pr-1">
                <h3 className="text-base font-serif font-bold leading-tight sm:text-2xl md:text-[1.75rem]">
                  <span className="sm:hidden">Leggi con attenzione prima di creare un profilo</span>
                  <span className="hidden sm:inline">{RESERVED_AREA_GUIDE_TITLE}</span>
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setIsReservedGuideOpen(false)}
                className="shrink-0 rounded-full border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-100 active:scale-95 transition-all duration-200 sm:text-sm"
              >
                Chiudi
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto p-3 sm:p-5 md:p-6">
              <div className="grid gap-3 sm:gap-4 md:grid-cols-2">
                {RESERVED_AREA_GUIDE_ITEMS.map((item) => (
                  <article key={item.id} className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm sm:p-4 md:p-5">
                    <div className="flex items-start gap-2.5 sm:gap-3">
                      <div className="text-2xl sm:text-[1.7rem] leading-none" aria-hidden="true">{item.icon}</div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-lg sm:text-[1.15rem] font-serif font-bold text-black leading-snug">{item.title}</h4>
                        <p className="text-sm sm:text-[0.95rem] text-gray-700 leading-relaxed mt-1.5">{item.description}</p>

                        {item.bullets?.length ? (
                          <ul className="mt-3 space-y-1.5 text-sm sm:text-[0.95rem] text-gray-700">
                            {item.bullets.map((bullet) => (
                              <li key={bullet} className="flex items-start gap-2">
                                <span className="mt-1 text-amber-700">•</span>
                                <span>{bullet}</span>
                              </li>
                            ))}
                          </ul>
                        ) : null}

                        {item.note ? (
                          <div className="mt-3 rounded-xl bg-amber-50 border border-amber-200 px-3 py-2.5 text-xs sm:text-sm text-amber-900 leading-relaxed">
                            <span className="font-semibold">Nota:</span> {item.note}
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>

            <div className="shrink-0 border-t border-gray-200 bg-white px-3 py-3 sm:px-5 sm:py-4">
              <button
                type="button"
                onClick={completeReservedProfileGuide}
                className="w-full rounded-xl bg-amber-400 px-5 py-3.5 text-sm font-extrabold uppercase tracking-wide text-black shadow-lg transition hover:bg-amber-300 active:scale-[0.99] sm:text-base"
              >
                HO LETTO — VAI ALL&apos;ACCESSO
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <section id="donazioni" data-page="versamenti" className="page-section content-section section-donations py-20 bg-black">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
              <h2 className="text-4xl md:text-5xl font-serif font-bold tracking-wider text-white">
                VERSAMENTI E DONAZIONI
              </h2>
              <StatusBadge type="updated" />
            </div>
            <div className="w-32 h-1 bg-amber-600 mx-auto mt-4"></div>
          </div>

          <div className="max-w-4xl mx-auto rounded-3xl border border-white/15 bg-white/10 p-6 text-white shadow-2xl backdrop-blur-sm sm:p-8 md:p-10">
            <div className="space-y-4 text-base leading-relaxed text-white/90 sm:text-lg">
              <p>
                In questa sezione trovi la procedura aggiornata per effettuare i versamenti delle quote del pellegrinaggio Korea 2027 e caricare correttamente le ricevute.
              </p>
              <p>
                La procedura operativa si trova nella tua Area Riservata, nella sezione <span className="font-semibold text-white">“Bonifici e versamenti”</span>.
              </p>

              <div className="rounded-2xl border-2 border-amber-300 bg-amber-300/10 px-4 py-5 text-left shadow-lg shadow-amber-400/10">
                <p className="font-extrabold text-amber-200">NUOVA PROCEDURA ATTIVA — CODICE BONIFICO</p>
                <p className="mt-2 text-white/95">
                  Prima di effettuare un bonifico entra nella tua <span className="font-extrabold text-white">Area Riservata</span>, apri <span className="font-extrabold text-white">“Bonifici e versamenti”</span>, scegli il pellegrinaggio e premi <span className="font-extrabold text-white">“Genera codice bonifico”</span>.
                </p>
                <p className="mt-2 font-semibold text-amber-100">
                  Il <span className="font-extrabold text-white">codice generato deve comparire nella causale</span>. Puoi scrivere come vuoi il resto della causale, ma il codice deve rimanere presente e non va modificato. La procedura vale per <span className="font-extrabold text-white">quota singola, versamento multiplo figli e versamento multiplo comunitario</span>.
                </p>
                <p className="mt-2 text-white/95">
                  Dopo il bonifico salva la ricevuta, torna nella stessa sezione e <span className="font-extrabold text-white">allega la ricevuta del bonifico</span>, indicando i <span className="font-extrabold text-white">partecipanti e le relative quote</span>. Non inviare la ricevuta via email: questa procedura serve ad automatizzare i controlli.
                </p>
                <button
                  type="button"
                  onClick={() => setIsPaymentInstructionsOpen(true)}
                  className="mt-3 inline-flex items-center justify-center gap-2 rounded-lg bg-amber-400 px-4 py-2.5 text-sm font-extrabold text-black shadow transition hover:bg-amber-300"
                >
                  <FileText size={17} />
                  Vedi procedura codice bonifico
                </button>
              </div>

              <div className="rounded-2xl border-2 border-red-400 bg-red-500/10 px-4 py-4 text-left">
                <p className="font-extrabold text-red-200">PRIMA RATA JMJ SEOUL 2027 — 400,00 € PER PARTECIPANTE</p>
                <p className="mt-2 text-white/95">
                  Da versare entro e non oltre il <span className="font-extrabold text-white">20 ottobre 2026</span>. La scadenza è inderogabile: la quota serve a bloccare il posto sul volo e senza il versamento l&apos;iscrizione non può essere considerata completa.
                </p>
                <p className="mt-3 rounded-xl border border-amber-300/60 bg-amber-300/10 px-3 py-3 font-bold leading-relaxed text-amber-100">
                  Prima del pagamento genera il codice nella sezione <span className="font-extrabold text-white">“Bonifici e versamenti”</span> dell&apos;Area Riservata e inseriscilo nella causale. Dopo il bonifico salva la ricevuta: <span className="font-extrabold text-white">non inviarla via email</span>. Torna nella stessa sezione, allega la ricevuta e indica i partecipanti con le relative quote.
                </p>
                <p className="mt-2 text-sm text-white/80">
                  Il costo complessivo e il piano completo delle rate sono ancora in definizione. Le rate successive saranno comunicate prossimamente.
                </p>
              </div>
            </div>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <button
                type="button"
                onClick={() => setIsBankDetailsOpen(true)}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-6 py-3.5 font-semibold text-black transition-colors hover:bg-gray-100"
              >
                <Landmark size={19} />
                Dati bancari
              </button>
              <button
                type="button"
                onClick={() => setIsPaymentInstructionsOpen(true)}
                className="inline-flex animate-pulse items-center justify-center gap-2 rounded-lg bg-amber-500 px-6 py-3.5 font-extrabold text-black shadow-lg shadow-amber-500/20 transition-colors hover:bg-amber-400"
              >
                <FileText size={19} />
                Procedura codice bonifico
              </button>
            </div>

            <div className="mt-7 overflow-hidden rounded-2xl border border-amber-400/40 bg-amber-100/10 text-sm leading-relaxed text-white/90 sm:text-base">
              <button
                type="button"
                onClick={() => setIsPaymentNoticeOpen((prev) => !prev)}
                className="flex w-full items-center justify-between gap-3 px-4 py-4 text-left transition-colors hover:bg-amber-100/10 sm:px-5"
                aria-expanded={isPaymentNoticeOpen}
                aria-controls="payment-important-notice"
              >
                <span className="font-bold text-amber-200">Importante per i bonifici dalla Svizzera</span>
                <ChevronDown className={`h-5 w-5 shrink-0 transition-transform duration-300 ${isPaymentNoticeOpen ? 'rotate-180' : ''}`} />
              </button>
              <div
                id="payment-important-notice"
                className={`overflow-hidden transition-all duration-300 ease-in-out ${isPaymentNoticeOpen ? 'max-h-[520px] opacity-100' : 'max-h-0 opacity-0'}`}
              >
                <div className="space-y-3 border-t border-amber-400/25 px-4 py-4 sm:px-5">
                  <p>
                    Per i bonifici dalla Svizzera aggiungere 8,50 € di commissioni per ogni operazione.
                  </p>
                  <p>
                    Se il pagamento parte da un conto in franchi svizzeri (CHF) e l&apos;importo viene convertito in euro, considerare anche 5,00 € per il cambio valuta: in questo caso la cifra complessiva da aggiungere è quindi di <strong>13,50 €</strong> (8,50 € + 5,00 €).
                  </p>
                  <p>
                    Verificare comunque con la propria banca, prima di eseguire il bonifico, eventuali commissioni o costi aggiuntivi applicati.
                  </p>
                  <p className="font-semibold text-amber-100">
                    È importante che l&apos;importo netto effettivamente accreditato sul conto del Comitato corrisponda esattamente alla quota richiesta.
                  </p>
                  <p>
                    Anche per i bonifici dalla Svizzera, prima del pagamento genera il <strong>codice bonifico</strong> dalla sezione “Bonifici e versamenti” dell&apos;Area Riservata e inseriscilo nella causale. Dopo il bonifico salva la ricevuta. <strong>Non deve essere inviata via email.</strong> Torna nella stessa sezione, allega la ricevuta e indica i partecipanti interessati con le relative quote.
                  </p>
                  <p>
                    Per problemi tecnici con il bonifico o per richiedere informazioni sulla consegna delle quote in contanti, contattare l&apos;organizzazione.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {isReservedReadingOpen ? (
        <div className="reserved-modal-layer fixed inset-0 flex items-center justify-center overflow-hidden px-2 py-2 sm:px-4">
          <div className="absolute inset-0 bg-black/85 backdrop-blur-sm" aria-hidden="true"></div>
          <div className="reserved-reading-modal relative z-10 flex w-full max-w-2xl flex-col overflow-hidden rounded-2xl border-2 border-amber-400 bg-slate-950 text-white shadow-2xl sm:rounded-3xl">
            <div className="reserved-reading-header shrink-0 border-b border-white/15 px-4 py-3 sm:px-7 sm:py-4">
              <p className="reserved-reading-eyebrow text-xs font-extrabold uppercase tracking-[0.18em] text-amber-300">Guida</p>
              <h3 className="reserved-reading-title mt-1 font-serif text-2xl font-bold leading-tight sm:text-3xl">Leggi con attenzione prima di accedere</h3>
              <div className="reserved-reading-progress mt-4 h-2 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-amber-400 transition-all duration-300"
                  style={{ width: `${((reservedReadingStep + 1) / RESERVED_AREA_READING_STEPS.length) * 100}%` }}
                ></div>
              </div>
              <p className="reserved-reading-counter mt-2 text-sm text-white/65">Passaggio {reservedReadingStep + 1} di {RESERVED_AREA_READING_STEPS.length}</p>
            </div>

            <div className="reserved-reading-body min-h-0 flex-1 px-5 py-7 sm:px-7 sm:py-8">
              <div className="reserved-reading-card rounded-2xl border border-white/15 bg-white/5 px-5 py-6 text-left">
                <p className="reserved-reading-step-title text-xl font-extrabold leading-snug text-amber-200 sm:text-2xl">
                  {RESERVED_AREA_READING_STEPS[reservedReadingStep].title}
                </p>
                <p className="reserved-reading-step-text mt-4 text-base leading-relaxed text-white/90 sm:text-lg">
                  {RESERVED_AREA_READING_STEPS[reservedReadingStep].text}
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (reservedReadingStep < RESERVED_AREA_READING_STEPS.length - 1) {
                    setReservedReadingStep((step) => step + 1);
                  } else {
                    completeReservedAreaReading();
                  }
                }}
                className="reserved-reading-button mt-6 w-full rounded-xl bg-amber-400 px-5 py-4 text-base font-extrabold uppercase tracking-wide text-black shadow-lg transition hover:bg-amber-300 active:scale-[0.99]"
              >
                {reservedReadingStep < RESERVED_AREA_READING_STEPS.length - 1 ? 'HO LETTO — CONTINUA' : 'HO LETTO E CAPITO'}
              </button>
              <p className="reserved-reading-footer mt-3 text-center text-xs leading-relaxed text-white/50">
                Al termine verrai portato agli avvisi importanti sul passaporto e, subito dopo, alle informazioni su visti e richiesta del passaporto presso gli uffici postali. Dopo averle lette tornerai all&apos;inizio della sezione Area Riservata per proseguire fino a “LEGGI PRIMA DI REGISTRARTI” e all&apos;accesso.
              </p>
            </div>
          </div>
        </div>
      ) : null}

      {isBankDetailsOpen ? (
        <div className="fixed inset-0 z-[120] flex items-center justify-center px-3 py-4 sm:px-4 sm:py-6">
          <button
            type="button"
            className="absolute inset-0 bg-black/75 backdrop-blur-sm"
            onClick={() => setIsBankDetailsOpen(false)}
            aria-label="Chiudi dati bancari"
          />
          <div className="relative z-10 w-full max-w-xl overflow-hidden rounded-2xl bg-white text-black shadow-2xl">
            <div className="flex items-center justify-between gap-3 border-b border-gray-200 px-4 py-4 sm:px-5">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-gray-500">JMJ Seoul 2027</p>
                <h3 className="text-xl font-serif font-bold sm:text-2xl">Dati bancari</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsBankDetailsOpen(false)}
                className="rounded-full border border-gray-300 p-2 text-gray-700 hover:bg-gray-100"
                aria-label="Chiudi"
              >
                <X size={18} />
              </button>
            </div>
            <div className="max-h-[calc(100dvh-7rem)] overflow-y-auto p-4 sm:p-5">
              <img src="/images/banca-sella-coordinate.png" alt="Banca Sella" className="mx-auto mb-4 hidden w-full rounded border border-gray-200 sm:block" />
              <div className="space-y-3 text-sm sm:text-base">
                <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
                  <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Intestazione conto</p>
                  <p className="mt-1 font-semibold">COMITATO PELLEGRINAGGI CNC PIEMONTE</p>
                </div>
                <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
                  <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Indirizzo Comitato</p>
                  <p className="mt-1 font-semibold">VIA PO, 16 - 10123 TORINO (TO)</p>
                </div>
                <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
                  <p className="text-xs font-bold uppercase tracking-wider text-gray-500">IBAN</p>
                  <p className="mt-1 break-all font-mono font-semibold">IT97M0326830940052574350520</p>
                </div>
                <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
                  <p className="text-xs font-bold uppercase tracking-wider text-gray-500">BIC / Codice Swift</p>
                  <p className="mt-1 font-mono font-semibold">SELBIT2BXXX</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {isPaymentInstructionsOpen ? (
        <div className="fixed inset-0 z-[120] flex items-center justify-center px-2 py-2 sm:px-4 sm:py-6">
          <button
            type="button"
            className="absolute inset-0 bg-black/75 backdrop-blur-sm"
            onClick={() => setIsPaymentInstructionsOpen(false)}
            aria-label="Chiudi procedura codice bonifico"
          />
          <div className="relative z-10 flex h-[calc(100dvh-1rem)] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white text-black shadow-2xl sm:h-auto sm:max-h-[88vh]">
            <div className="shrink-0 flex items-center justify-between gap-3 border-b border-gray-200 px-4 py-3.5 sm:px-5 sm:py-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500 sm:text-xs">JMJ Seoul 2027</p>
                <h3 className="text-lg font-serif font-bold sm:text-2xl">Procedura codice bonifico</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsPaymentInstructionsOpen(false)}
                className="rounded-full border border-gray-300 p-2 text-gray-700 hover:bg-gray-100"
                aria-label="Chiudi"
              >
                <X size={18} />
              </button>
            </div>

            <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-3 sm:p-5">
              <div className="space-y-3 rounded-xl border-2 border-amber-300 bg-amber-50 px-3 py-4 text-sm leading-relaxed text-amber-950 sm:px-4 sm:text-base">
                <p className="font-extrabold">CODICE BONIFICO — PROCEDURA ATTIVA</p>
                <p>
                  Per i versamenti delle quote non devi più copiare una causale fissa. Prima del bonifico genera il codice dalla tua Area Riservata: il <span className="font-extrabold">codice deve comparire nella causale</span>. Il resto della causale può essere scritto liberamente, purché il codice rimanga presente e invariato.
                </p>
              </div>

              {[
                ['1. Entra nell’Area Riservata', 'Accedi con il profilo con cui devi gestire il pagamento.'],
                ['2. Apri “Bonifici e versamenti”', 'Scegli il pellegrinaggio Korea 2027 e premi “Genera codice bonifico”.'],
                ['3. Inserisci il codice nella causale', 'Copia il codice generato nella causale del bonifico. Puoi aggiungere altre parole, ma non eliminare o modificare il codice. La procedura vale per quota singola, versamento multiplo figli e versamento multiplo comunitario.'],
                ['4. Esegui il bonifico e salva la ricevuta', 'Conserva il file o la foto della ricevuta. Non inviarla via email.'],
                ['5. Carica la ricevuta nella stessa sezione', 'Torna in “Bonifici e versamenti”, allega la ricevuta del bonifico e indica tutti i partecipanti interessati con le relative quote. Questo permette al sistema di automatizzare i controlli.'],
              ].map(([title, text]) => (
                <article key={title} className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-3 sm:px-4 sm:py-4">
                  <h4 className="font-bold text-black">{title}</h4>
                  <p className="mt-1.5 text-sm leading-relaxed text-gray-800 sm:text-base">{text}</p>
                </article>
              ))}

              <a
                href={SITE_CONFIG.reservedAreaUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-full items-center justify-center rounded-xl bg-black px-5 py-3.5 text-sm font-extrabold text-white transition hover:bg-gray-800 sm:text-base"
              >
                Entra nell&apos;Area Riservata e genera il codice
              </a>

              <div className="space-y-2 rounded-xl border border-amber-300 bg-amber-50 px-3 py-3 text-sm leading-relaxed text-amber-950 sm:px-4 sm:py-4 sm:text-base">
                <p><span className="font-bold">Bonifici dalla Svizzera:</span> aggiungere 8,50 € di commissioni per ogni operazione. Se il pagamento parte da un conto in franchi svizzeri (CHF) e viene convertito in euro, considerare anche 5,00 € per il cambio valuta: in questo caso la cifra complessiva da aggiungere è <span className="font-bold">13,50 €</span> (8,50 € + 5,00 €). Verificare comunque con la propria banca, prima di eseguire il bonifico, eventuali commissioni o costi aggiuntivi. <span className="font-bold">È importante che l&apos;importo netto effettivamente accreditato sul conto del Comitato corrisponda esattamente alla quota richiesta.</span></p>
                <p><span className="font-bold">Ricevute:</span> dopo ogni bonifico, salvarle. <span className="font-bold">Non inviarle via email.</span> Caricarle nella stessa sezione <span className="font-bold">“Bonifici e versamenti”</span>, allegando la ricevuta e indicando i partecipanti interessati con le relative quote.</p>
                <p><span className="font-bold">Contanti:</span> per problemi tecnici con il bonifico e per ricevere informazioni, contattare l&apos;organizzazione.</p>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <footer className="site-footer bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-6 mb-8">
            <a href="#home" className="hover:text-amber-500 transition-colors">Home Page</a>
            <a href="#wyd-seul" className="hover:text-amber-500 transition-colors">WYD Seoul 2027</a>
            <a href="#gmg-2027-iscrizione" className="hover:text-amber-500 transition-colors">Iscrizione pellegrinaggio vocazionale</a>
            <a href="#installa-app" className="hover:text-amber-500 transition-colors">App sul cellulare</a>
            <a href="#donazioni" className="hover:text-amber-500 transition-colors">Versamenti e Donazioni</a>
          </div>

          <div className="text-center text-sm text-gray-400 space-y-2">
            <p>© 2026 Pellegrinaggi CnC Piemonte. Tutti i diritti riservati.</p>
<p>Powered by iFabry Studio</p>
          </div>
        </div>
      </footer>
      <SeoulAvailabilityFloating page={currentPage} />
      <FloatingAssistance />
      <VisitCounterBadge />
    </div>
  );
}

export default App;
