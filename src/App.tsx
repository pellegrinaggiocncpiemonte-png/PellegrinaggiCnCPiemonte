import Navigation from './components/Navigation';
import { ChevronDown, FileText, Landmark, Play, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import FlipCountdown from './components/FlipCountdown';
import { SITE_CONFIG } from './config/siteConfig';
import { RESERVED_AREA_GUIDE_ITEMS, RESERVED_AREA_GUIDE_TITLE } from './config/reservedAreaGuide';
import VisitCounterBadge from './components/VisitCounterBadge';
import FloatingAssistance from './components/FloatingAssistance';
import SiteMotion from './components/SiteMotion';

type KoreanSong = {
  id: number;
  titleIt: string;
  titleKr: string;
  note?: string;
  videoSrc?: string;
  sheetSrc?: string;
};

const getGoogleDrivePreviewUrl = (url: string) => {
  const match = url.match(/drive\.google\.com\/file\/d\/([^/]+)/);
  return match ? `https://drive.google.com/file/d/${match[1]}/preview` : url;
};

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
  },
  {
    id: 4,
    titleIt: 'Guardate come è bello',
    titleKr: '보라, 얼마나 아름다운가',
    videoSrc: 'https://drive.google.com/file/d/17Cu2oZWRT_qLxq3j93MRWtbQELjgQxlg/view?usp=sharing',
  },
  {
    id: 5,
    titleIt: 'Gerusalemme ricostruita',
    titleKr: '재건된 예루살렘',
    videoSrc: 'https://drive.google.com/file/d/1S6a4PqvvlpTc_pMUK7hIiN2r74NLWfK_/view?usp=sharing',
  },
  {
    id: 6,
    titleIt: 'Andate ed annunziate ai miei fratelli',
    titleKr: '가서 내 형제들에게 전하여라',
  },
  {
    id: 7,
    titleIt: 'Salve Regina dei cieli',
    titleKr: '하늘의 모후님',
    videoSrc: 'https://drive.google.com/file/d/1dx3jsOhpjlw-kNExA8q25tgIVHQue3yH/view?usp=sharing',
  },
];

const RESERVED_AREA_READING_STEPS = [
  {
    title: 'ATTENZIONE: creare l’account non basta',
    text: 'Registrarsi all’Area Riservata serve solo per creare l’accesso personale. NON significa essere iscritti alla JMJ Seoul 2027. Dopo l’accesso devi continuare fino alla sezione “Iscrizione Pellegrinaggi”.',
  },
  {
    title: '1. Scegli e completa il profilo',
    text: 'Premi “Leggi prima di registrarti”, scegli il profilo corretto e completa i dati anagrafici richiesti. Il profilo è importante, ma da solo non costituisce iscrizione al pellegrinaggio.',
  },
  {
    title: '2. Iscriviti alla JMJ',
    text: 'Dopo aver creato o aperto il profilo, vai nella sezione “Iscrizione Pellegrinaggi”, scegli Korea 2027 e completa l’iscrizione.',
  },
  {
    title: '3. Documenti',
    text: 'I documenti richiesti sono necessari e vanno caricati nella sezione dedicata. Se al momento non li hai disponibili, puoi aggiungerli successivamente: non fermarti per questo e completa comunque l’iscrizione al pellegrinaggio.',
  },
  {
    title: '4. Prima rata: rende valida l’iscrizione',
    text: 'L’iscrizione al pellegrinaggio non è valida senza il versamento della prima rata di 400,00 € per partecipante entro e non oltre il 20 ottobre 2026. La scadenza è inderogabile e la quota serve a bloccare il posto sul volo. Le rate successive saranno comunicate prossimamente.',
  },
];


function App() {
  const [isReservedGuideOpen, setIsReservedGuideOpen] = useState(false);
  const [isReservedReadingOpen, setIsReservedReadingOpen] = useState(false);
  const [reservedReadingStep, setReservedReadingStep] = useState(0);
  const [isTelegramGuideOpen, setIsTelegramGuideOpen] = useState(false);
  const [isTelegramDetailsOpen, setIsTelegramDetailsOpen] = useState(false);
  const [isBankDetailsOpen, setIsBankDetailsOpen] = useState(false);
  const [isPaymentInstructionsOpen, setIsPaymentInstructionsOpen] = useState(false);
  const [isPaymentNoticeOpen, setIsPaymentNoticeOpen] = useState(false);
  const [openVideoId, setOpenVideoId] = useState<number | null>(1);
  const [comingSoonKey, setComingSoonKey] = useState<string | null>(null);
  const [songViewer, setSongViewer] = useState<{ type: 'video' | 'sheet'; title: string; src: string } | null>(null);
  const [sheetZoom, setSheetZoom] = useState(1);
  const sheetViewportRef = useRef<HTMLDivElement | null>(null);
  const sheetPointersRef = useRef(new Map<number, { x: number; y: number }>());
  const sheetPinchStartRef = useRef<{ distance: number; zoom: number } | null>(null);
  const sheetPanLastRef = useRef<{ x: number; y: number } | null>(null);

  const startReservedAreaReading = () => {
    const section = document.getElementById('area-riservata');
    if (section) {
      window.scrollTo({ top: section.offsetTop - 88, behavior: 'smooth' });
    }
    setReservedReadingStep(0);
    window.setTimeout(() => setIsReservedReadingOpen(true), 450);
  };

  const completeReservedAreaReading = () => {
    setIsReservedReadingOpen(false);
    window.setTimeout(() => {
      document.getElementById('reserved-area-actions')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 120);
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

  const showComingSoon = (key: string) => {
    setComingSoonKey(key);
    window.setTimeout(() => {
      setComingSoonKey((current) => (current === key ? null : current));
    }, 2000);
  };

  const openSongViewer = (type: 'video' | 'sheet', song: KoreanSong) => {
    const src = type === 'video' ? song.videoSrc : song.sheetSrc;
    if (!src) {
      showComingSoon(`song-${song.id}-${type}`);
      return;
    }
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
    <div className="min-h-screen site-shell theme-verso-la-luce">
      <SiteMotion />
      <Navigation />

      {/* ✅ Pulsante chat custom (Tawk launcher nascosto) */}
     

      


      <section id="home" className="hero-section min-h-screen relative flex items-center justify-center">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: 'url(/images/maria.png)',
          }}
        >
          <div className="absolute inset-0 bg-black/40"></div>
        </div>
        <div className="hero-copy relative z-10 text-center px-4 max-w-[94vw] mx-auto pt-24 sm:pt-16 -translate-y-[105px] sm:-translate-y-[96px] md:-translate-y-[72px]">
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

      <section id="gmg-2027-iscrizione" className="content-section section-registration py-20 bg-stone-100">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
                <h2 className="text-4xl md:text-5xl font-serif font-bold tracking-wider">
                  ISCRIZIONI JMJ SEOUL 2027
                </h2>
                <span className="animate-pulse rounded-full bg-red-600 px-3 py-1 text-xs font-bold tracking-wider text-white shadow-lg">
                  APERTE
                </span>
              </div>
              <div className="w-32 h-1 bg-amber-600 mx-auto mt-4"></div>
            </div>

            <div className="bg-white rounded-3xl shadow-xl border border-gray-200 p-6 sm:p-8 md:p-12 space-y-6 text-center">
              <p className="text-2xl font-bold leading-snug text-gray-700 md:text-3xl">
                Iscrizioni aperte: JMJ Seoul 2027<br />
                Giovani del Cammino Neocatecumenale di Piemonte e Svizzera.
              </p>

              <div className="mx-auto max-w-3xl rounded-xl border-2 border-red-500 bg-red-50 px-3 py-3 text-left shadow-sm sm:px-4 sm:py-4">
                <p className="whitespace-nowrap text-center text-sm font-extrabold uppercase leading-tight tracking-wide text-red-800 sm:text-base md:text-lg">
                  Informazioni
                </p>
                <div className="mt-3 space-y-2 text-sm leading-relaxed text-gray-900 sm:text-base">
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
                      <p className="mt-2 text-sm leading-relaxed sm:text-base">
                        Il costo complessivo del pellegrinaggio e il piano completo delle rate non sono ancora definitivi. Le rate successive saranno comunicate prossimamente.
                      </p>
                    </div>
                  </div>
                </details>

                <div className="flex justify-center">
                  <button
                    type="button"
                    onClick={startReservedAreaReading}
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

      <section id="giorni-alla-partenza" className="content-section section-countdown py-20 bg-black">
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

      <section id="area-riservata" className="content-section section-private py-20 bg-black relative">
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

              <div className="rounded-2xl border-2 border-amber-400 bg-amber-400/10 px-5 py-4 text-base md:text-lg leading-relaxed text-white">
                <p className="font-bold text-amber-200">⚠️ LEGGI CON ATTENZIONE PRIMA DI ACCEDERE</p>
                <p className="mt-1 text-white/90">
                  Se arrivi a questa sezione dal menu <span className="font-extrabold text-amber-200">“Area riservata”</span>, leggerai prima una breve guida con i passaggi principali. Poi potrai usare <span className="font-extrabold text-amber-200">“LEGGI PRIMA DI REGISTRARTI”</span> oppure <span className="font-extrabold text-amber-200">“ACCEDI”</span>.
                </p>
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
                    <p className="text-xl font-extrabold text-amber-200">2. ISCRIVITI ALLA JMJ</p>
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

                  <article className="rounded-2xl border-2 border-red-400 bg-red-500/10 px-4 py-5">
                    <p className="text-lg font-extrabold text-red-200">4. Versa la prima rata — 400,00 €</p>
                    <p className="mt-2 text-white/90 leading-relaxed">
                      L&apos;iscrizione al pellegrinaggio <span className="font-extrabold text-white">non è valida</span> senza il versamento della prima rata di <span className="font-extrabold text-white">400,00 € per partecipante entro e non oltre il 20 ottobre 2026</span>. La scadenza è inderogabile e la quota serve a bloccare il posto sul volo.
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

              <div className="w-full max-w-md">
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

      <section id="telegram" className="content-section section-telegram py-20 bg-stone-100">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="max-w-[92vw] mx-auto px-4 text-center font-serif font-bold uppercase leading-[0.95] tracking-tight text-[clamp(1.7rem,6.2vw,3.2rem)] sm:text-[clamp(2.8rem,7vw,5rem)] mb-4">
                <span className="block whitespace-nowrap">RICEVI</span>
                <span className="block whitespace-nowrap">COMUNICAZIONI</span>
                <span className="block whitespace-nowrap">SU TELEGRAM</span>
              </h2>
              <span className="inline-flex animate-pulse rounded-full bg-sky-500 px-3 py-1 text-xs font-bold tracking-wider text-white shadow-lg">
                ATTIVA TELEGRAM
              </span>
              <div className="w-32 h-1 bg-amber-600 mx-auto mt-4"></div>
              <p className="mt-6 text-lg md:text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
                Servizio riservato agli utenti registrati all&apos;area riservata.
                Le comunicazioni dell&apos;organizzazione potranno arrivare su Telegram tramite il bot dedicato.
              </p>
            </div>

            <div className="bg-white rounded-3xl shadow-xl border border-gray-200 p-8 md:p-12">
              <div className="grid lg:grid-cols-[220px,1fr] gap-8 lg:gap-12 items-center">
                <div className="flex justify-center lg:justify-start">
                  <div className="rounded-[2rem] bg-sky-50 border border-sky-100 p-5 shadow-sm">
                    <img
                      src="/images/telegram-app.jpg"
                      alt="Logo Telegram"
                      className="w-36 h-36 sm:w-40 sm:h-40 object-contain"
                    />
                  </div>
                </div>

                <div className="space-y-6 text-center lg:text-left">
                  <div className="space-y-3">
                    <div className="flex flex-col items-center gap-3 lg:items-start">
                      <p className="text-2xl md:text-3xl font-serif font-bold text-black">
                        Solo per utenti registrati all&apos;area riservata
                      </p>
                      <button
                        type="button"
                        onClick={() => setIsTelegramDetailsOpen((prev) => !prev)}
                        aria-expanded={isTelegramDetailsOpen}
                        aria-controls="telegram-details-content"
                        aria-label={isTelegramDetailsOpen ? 'Nascondi dettagli Telegram' : 'Mostra dettagli Telegram'}
                        title={isTelegramDetailsOpen ? 'Nascondi dettagli' : 'Mostra dettagli'}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-gray-300 bg-white text-gray-800 shadow-sm transition-colors hover:bg-gray-50"
                      >
                        <ChevronDown
                          className={`h-5 w-5 transition-transform duration-300 ${isTelegramDetailsOpen ? 'rotate-180' : ''}`}
                        />
                      </button>
                    </div>

                    <div
                      id="telegram-details-content"
                      className={`overflow-hidden transition-all duration-300 ease-in-out ${isTelegramDetailsOpen ? 'max-h-[900px] opacity-100 pt-1' : 'max-h-0 opacity-0'}`}
                    >
                      <div className="space-y-3">
                        <p className="text-lg text-gray-700 leading-relaxed">
                          Dopo la registrazione all&apos;area riservata, per poter ricevere anche le notifiche su Telegram,
                          sarà prima necessario attendere che <span className="font-semibold text-black">l&apos;amministrazione attivi il tuo link personale Telegram</span>.
                          Per questo motivo, dovrai entrare nella sezione
                          <span className="font-semibold text-black"> “Ricevi notifiche Telegram”</span> presente nel tuo profilo e verificare se il collegamento è stato attivato.
                          Quando il link sarà disponibile, potrai cliccarlo direttamente dalla sezione: si aprirà l&apos;app Telegram,
                          che dovrà essere già installata sul tuo cellulare. All&apos;interno di Telegram dovrai premere
                          <span className="font-semibold text-black"> Start</span> una sola volta. Poi torna nella sezione Ricevi notifiche Telegram dell&apos;area riservata e premi su
                          <span className="font-semibold text-black"> Verifica collegamento</span>. Se tutto è corretto, vedrai in verde
                          <span className="font-semibold text-green-700"> “Notifiche Telegram attivate correttamente.”</span>.
                        </p>
                        <p className="text-base text-gray-600 leading-relaxed">
                          In caso di messaggi particolarmente lunghi, il testo completo resterà leggibile
                          all&apos;interno dell&apos;area riservata.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                    <button
                      type="button"
                      onClick={() => setIsTelegramGuideOpen(true)}
                      className="inline-flex items-center justify-center bg-black text-white px-8 py-4 rounded-lg font-semibold hover:bg-gray-800 transition-colors"
                    >
                      Istruzioni
                    </button>
                    <a
                      href="https://telegram.org/apps?setln=it"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center bg-sky-500 text-white px-8 py-4 rounded-lg font-semibold hover:bg-sky-600 transition-colors"
                    >
                      Scarica Telegram
                    </a>
                    <a
                      href={SITE_CONFIG.reservedAreaUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center bg-white text-black px-8 py-4 rounded-lg font-semibold border border-gray-300 hover:bg-gray-50 transition-colors"
                    >
                      Vai all&apos;area riservata
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="wyd-seul" className="content-section section-wyd py-20 bg-white">
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

      <section id="sezione-video" className="content-section section-videos py-20 bg-black">
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

      <section id="canti-in-coreano" className="content-section section-songs py-20 bg-stone-100">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-serif font-bold tracking-wider mb-4 text-black">
              CANTI IN COREANO
            </h2>
            <div className="w-32 h-1 bg-amber-600 mx-auto"></div>
            <p className="mx-auto mt-6 max-w-3xl text-lg text-gray-700 leading-relaxed">
              In preparazione alla Giornata Mondiale della Gioventù di Seoul 2027, qui trovi i canti in coreano da imparare insieme in vista del pellegrinaggio.
            </p>
          </div>

          <div className="mx-auto max-w-4xl space-y-4">
            {KOREAN_SONGS.map((song, index) => {
              const sheetKey = `song-${song.id}-sheet`;
              return (
                <div key={song.id} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="min-w-0">
                      <p className="text-lg font-serif font-bold text-black leading-snug">
                        {index + 1}. {song.titleIt}
                      </p>
                      <p className="text-base text-gray-600 leading-snug">
                        {song.titleKr}
                        {song.note ? <span className="text-sm text-gray-500"> — {song.note}</span> : null}
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
                      <button
                        type="button"
                        onClick={() => openSongViewer('video', song)}
                        disabled={!song.videoSrc}
                        className={`inline-flex items-center justify-center gap-2 rounded-lg px-5 py-3 font-semibold text-white transition-colors ${song.videoSrc ? 'bg-black hover:bg-gray-800' : 'cursor-not-allowed bg-gray-500/90'}`}
                        title={song.videoSrc ? `Apri il video di ${song.titleIt}` : 'Video in arrivo'}
                      >
                        <Play size={18} />
                        {song.videoSrc ? 'Video (voce e testi)' : 'VIDEO — IN ARRIVO'}
                      </button>
                      <button
                        type="button"
                        onClick={() => openSongViewer('sheet', song)}
                        className="inline-flex items-center justify-center gap-2 rounded-lg bg-amber-600 px-5 py-3 font-semibold text-white transition-colors hover:bg-amber-700"
                      >
                        <FileText size={18} />
                        {song.sheetSrc ? 'Testo e accordi' : comingSoonKey === sheetKey ? 'In arrivo' : 'Testo e accordi'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

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
          </div>
        </div>
      ) : null}

      {isTelegramGuideOpen ? (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 py-6">
          <button
            type="button"
            className="absolute inset-0 bg-black/75 backdrop-blur-sm"
            onClick={() => setIsTelegramGuideOpen(false)}
            aria-label="Chiudi istruzioni Telegram"
          />

          <div className="relative z-10 w-full max-w-4xl max-h-[82vh] overflow-y-auto rounded-2xl border border-white/20 bg-white text-black shadow-2xl sm:max-h-[86vh]">
            <div className="sticky top-0 z-10 flex items-start justify-between gap-3 border-b border-gray-200 bg-white/95 px-4 py-4 backdrop-blur sm:px-5 md:px-6">
              <div className="min-w-0">
                <h3 className="text-xl sm:text-2xl md:text-[1.75rem] font-serif font-bold leading-tight">
                  Ricevi comunicazioni su Telegram
                </h3>
                <p className="mt-1.5 text-xs sm:text-sm md:text-[0.95rem] text-gray-700 max-w-2xl leading-relaxed">
                  Procedura guidata per attivare il collegamento Telegram dedicato agli utenti registrati all&apos;area riservata.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsTelegramGuideOpen(false)}
                className="shrink-0 rounded-full border border-gray-300 px-3 py-1.5 text-xs sm:text-sm font-semibold text-gray-700 hover:bg-gray-100 active:scale-95 transition-all duration-200"
              >
                Chiudi
              </button>
            </div>

            <div className="p-4 sm:p-5 md:p-6 space-y-4">
              {[
                'Registrati all’area riservata.',
                'Scarica l’app Telegram sul tuo cellulare.',
                'Dopo la registrazione, attendi che l’amministrazione attivi il tuo link personale Telegram.',
                'Entra nel tuo profilo, nella sezione “Ricevi notifiche Telegram”, e verifica se il link è stato attivato.',
                'Quando il link risulta disponibile, cliccalo per aprire l’app Telegram.',
                'Dentro Telegram, premi il pulsante Start una sola volta.',
                'Torna nell’area riservata e apri di nuovo la sezione “Ricevi notifiche Telegram”.',
                'Premi su “Verifica collegamento” per controllare che l’attivazione sia andata a buon fine.',
                'Se il collegamento è corretto, vedrai in verde la scritta: “Notifiche Telegram attivate correttamente.”',
                'Da quel momento potrai ricevere le comunicazioni dell’organizzazione anche su Telegram dal contatto “Pellegrinaggio CnC Piemonte e Svizzera Bot”.',
                'Se un messaggio è troppo lungo, potrai leggerlo integralmente all’interno dell’area riservata.',
                'La chat Telegram è in modalità broadcast, quindi potrai solo leggere i messaggi inviati dall’organizzazione.',
              ].map((step, index) => (
                <article key={step} className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-4 sm:px-5">
                  <div className="flex items-start gap-4">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sky-500 text-sm font-bold text-white shadow-sm">
                      {index + 1}
                    </div>
                    <p className="pt-1 text-sm sm:text-base text-gray-800 leading-relaxed">{step}</p>
                  </div>
                </article>
              ))}

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <a
                  href="https://telegram.org/apps?setln=it"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center bg-sky-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-sky-600 transition-colors"
                >
                  Scarica Telegram
                </a>
                <a
                  href={SITE_CONFIG.reservedAreaUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center bg-black text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors"
                >
                  Vai all&apos;area riservata
                </a>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <section id="donazioni" className="content-section section-donations py-20 bg-black">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
              <h2 className="text-4xl md:text-5xl font-serif font-bold tracking-wider text-white">
                VERSAMENTI E DONAZIONI
              </h2>
              <span className="animate-pulse rounded-full bg-emerald-600 px-3 py-1 text-xs font-bold tracking-wider text-white shadow-lg">
                SEZIONE ATTIVA
              </span>
            </div>
            <div className="w-32 h-1 bg-amber-600 mx-auto mt-4"></div>
          </div>

          <div className="max-w-4xl mx-auto rounded-3xl border border-white/15 bg-white/10 p-6 text-white shadow-2xl backdrop-blur-sm sm:p-8 md:p-10">
            <div className="space-y-4 text-base leading-relaxed text-white/90 sm:text-lg">
              <p>
                In questa sezione trovi le indicazioni per effettuare versamenti e donazioni destinati alla JMJ Seoul 2027.
              </p>
              <p>
                Le stesse informazioni saranno disponibili anche nell&apos;area riservata personale, nella sezione <span className="font-semibold text-white">“Rateizzo e situazione economica”</span>.
              </p>
              <div className="rounded-2xl border-2 border-red-400 bg-red-500/10 px-4 py-4 text-left">
                <p className="font-extrabold text-red-200">PRIMA RATA JMJ SEOUL 2027 — 400,00 € PER PARTECIPANTE</p>
                <p className="mt-2 text-white/95">
                  Da versare entro e non oltre il <span className="font-extrabold text-white">20 ottobre 2026</span>. La scadenza è inderogabile: la quota serve a bloccare il posto sul volo e senza il versamento l&apos;iscrizione non può essere considerata completa.
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
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-amber-600 px-6 py-3.5 font-semibold text-white transition-colors hover:bg-amber-700"
              >
                <FileText size={19} />
                Indicazioni e causali
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
                    Aggiungere 8,50 € di commissioni per ogni operazione.
                  </p>
                  <p>
                    Le ricevute non devono essere inviate via email: vanno caricate esclusivamente tramite l&apos;area personale dell&apos;iscritto oppure tramite il profilo che gestisce i versamenti, come genitore, collaboratore o responsabile.
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
                Al termine troverai i pulsanti per leggere le modalità di creazione del profilo e accedere all&apos;Area Riservata.
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
            aria-label="Chiudi indicazioni e causali"
          />
          <div className="relative z-10 flex h-[calc(100dvh-1rem)] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white text-black shadow-2xl sm:h-auto sm:max-h-[88vh]">
            <div className="shrink-0 flex items-center justify-between gap-3 border-b border-gray-200 px-4 py-3.5 sm:px-5 sm:py-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500 sm:text-xs">JMJ Seoul 2027</p>
                <h3 className="text-lg font-serif font-bold sm:text-2xl">Indicazioni e causali</h3>
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
              <p className="rounded-xl border border-blue-200 bg-blue-50 px-3 py-3 text-sm leading-relaxed text-blue-950 sm:px-4 sm:text-base">
                Scrivere esclusivamente la causale indicata, senza aggiungere altro testo.
              </p>

              {[
                ['Singola quota', 'Cognome, Nome x JMJ Seoul 2027'],
                ['Donazione', 'Donazione: JMJ Seoul 2027'],
                ['Versamento multiplo figli', 'Cognome famiglia, n° quote versate, x JMJ Seoul 2027'],
                ['Versamento multiplo comunitario', 'Diocesi, parrocchia, n° quote versate x JMJ Seoul 2027'],
              ].map(([title, cause]) => (
                <article key={title} className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-3 sm:px-4 sm:py-4">
                  <h4 className="font-bold text-black">{title}</h4>
                  <p className="mt-1.5 text-sm leading-relaxed text-gray-800 sm:text-base">{cause}</p>
                  {title.includes('multiplo') ? (
                    <p className="mt-2 text-xs leading-relaxed text-gray-600 sm:text-sm">
                      Dopo il versamento, caricare la ricevuta tramite l&apos;area riservata specificando i singoli nominativi.
                    </p>
                  ) : null}
                </article>
              ))}

              <div className="space-y-2 rounded-xl border border-amber-300 bg-amber-50 px-3 py-3 text-sm leading-relaxed text-amber-950 sm:px-4 sm:py-4 sm:text-base">
                <p><span className="font-bold">Bonifici dalla Svizzera:</span> aggiungere 8,50 € di commissioni per ogni operazione.</p>
                <p><span className="font-bold">Ricevute:</span> non inviarle via email. Caricarle esclusivamente tramite l&apos;area personale o tramite il profilo che gestisce i versamenti.</p>
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
            <a href="#gmg-2027-iscrizione" className="hover:text-amber-500 transition-colors">Iscrizione JMJ Seoul 2027</a>
            <a href="#telegram" className="hover:text-amber-500 transition-colors">Telegram</a>
            <a href="#donazioni" className="hover:text-amber-500 transition-colors">Versamenti e Donazioni</a>
          </div>

          <div className="text-center text-sm text-gray-400 space-y-2">
            <p>© 2026 Pellegrinaggi CnC Piemonte. Tutti i diritti riservati.</p>
<p>Powered by iFabry Studio</p>
          </div>
        </div>
      </footer>
      <FloatingAssistance />
      <VisitCounterBadge />
    </div>
  );
}

export default App;
