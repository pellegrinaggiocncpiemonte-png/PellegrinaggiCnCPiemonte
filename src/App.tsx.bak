import Navigation from './components/Navigation';
import { Play } from 'lucide-react';
import { useEffect, useState } from 'react';
import FlipCountdown from './components/FlipCountdown';
import { SITE_CONFIG } from './config/siteConfig';
import { RESERVED_AREA_GUIDE_ITEMS, RESERVED_AREA_GUIDE_SUBTITLE, RESERVED_AREA_GUIDE_TITLE } from './config/reservedAreaGuide';

function App() {
  const [pageViews, setPageViews] = useState<number | null>(null);
  const [isReservedGuideOpen, setIsReservedGuideOpen] = useState(false);

  useEffect(() => {
    document.title = SITE_CONFIG.browserTitle;
  }, []);

  useEffect(() => {
    // Prova conteggio globale (CountAPI). Se bloccato da privacy/adblock,
    // usa un fallback locale (localStorage) così non resta "—".
    const LS_KEY = 'pellegrinaggi_cnc_piemonte_page_views_local';

    const incLocal = () => {
      try {
        const raw = localStorage.getItem(LS_KEY);
        const current = raw ? parseInt(raw, 10) : 0;
        const next = Number.isFinite(current) ? current + 1 : 1;
        localStorage.setItem(LS_KEY, String(next));
        return next;
      } catch {
        return 1;
      }
    };

    const controller = new AbortController();
    const t = window.setTimeout(() => controller.abort(), 3000);

    fetch('https://api.countapi.xyz/hit/cnc-piemonte-wyd-2027/page-views', { signal: controller.signal })
      .then((res) => res.json())
      .then((data) => {
        const v = Number(data?.value);
        if (Number.isFinite(v)) setPageViews(v);
        else setPageViews(incLocal());
      })
      .catch(() => {
        setPageViews(incLocal());
      })
      .finally(() => {
        window.clearTimeout(t);
      });
  }, []);
  return (
    <div className="min-h-screen">
      <Navigation />

      {/* ✅ Pulsante chat custom (Tawk launcher nascosto) */}
     

      

      {/* ✅ Contatore visite sempre visibile (basso a sinistra) */}
      <div className="fixed left-4 bottom-4 z-40">
        <div className="bg-black/70 text-white px-3 py-2 rounded-full text-xs tracking-wide shadow-lg backdrop-blur">
          <span className="opacity-80">Visite:</span> <span className="font-semibold">{pageViews ?? '—'}</span>
        </div>
      </div>

      <section id="home" className="min-h-screen relative flex items-center justify-center">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: 'url(/images/maria.png)',
          }}
        >
          <div className="absolute inset-0 bg-black/40"></div>
        </div>
        <div className="relative z-10 text-center px-4 max-w-[94vw] mx-auto pt-24 sm:pt-16">
          <div className="space-y-2 sm:space-y-3">
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
          </div>
        </div>
      </section>

      <section id="prossimi-eventi" className="min-h-screen relative flex items-center justify-center py-20">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: 'url(https://images.pexels.com/photos/1252890/pexels-photo-1252890.jpeg?auto=compress&cs=tinysrgb&w=1920)',
          }}
        >
          <div className="absolute inset-0 bg-black/60"></div>
        </div>
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <h2 className="text-5xl md:text-6xl font-serif text-white font-bold tracking-wider">
            Estate 2026
          </h2>
          <p className="text-2xl md:text-3xl text-white/90 mt-6 font-light tracking-wide">
            Iscrizioni aperte dall'area riservata
          </p>
          <p className="text-lg md:text-xl text-white/85 mt-8 leading-relaxed">
            Per i pellegrinaggi Estate 2026 occorre registrarsi nell'area riservata,
            inserire tutti i dati richiesti e iscriversi nella sezione dedicata scegliendo
            il pellegrinaggio di interesse.
          </p>
          <p className="text-base md:text-lg text-white/80 mt-5 leading-relaxed">
            Le quote dei pellegrinaggi non sono ancora impostate.
          </p>
          <div className="mt-8 flex flex-col items-center gap-3">
            <div className="relative inline-flex items-center justify-center group">
              <button
                type="button"
                onClick={() => setIsReservedGuideOpen(true)}
                className="w-7 h-7 rounded-full border border-white/35 bg-white text-black shadow-lg hover:scale-105 hover:bg-amber-50 active:scale-95 transition-all duration-200 flex items-center justify-center"
                aria-label="Info registrazione all'app"
                title="Info registrazione all'app"
              >
                <span className="text-sm font-bold leading-none">i</span>
              </button>

              <div className="pointer-events-none absolute left-1/2 top-full z-10 mt-2 -translate-x-1/2 whitespace-nowrap rounded-lg border border-white/20 bg-black/90 px-3 py-1.5 text-xs text-white opacity-0 shadow-xl transition-all duration-200 group-hover:opacity-100 group-hover:translate-y-0 translate-y-1">
                Info registrazione all'app
              </div>
            </div>

            <a
              href={SITE_CONFIG.reservedAreaUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center bg-white text-black px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Vai all'area riservata
            </a>
          </div>
        </div>
      </section>

      {/* ✅ Nuova sezione: Giorni alla partenza (countdown a cartelli) */}
      <section id="giorni-alla-partenza" className="py-20 bg-black">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-4xl md:text-5xl font-serif text-white font-bold tracking-wider mb-4">
              Giorni alla partenza
            </h2>
            <p className="text-white/80 mt-4 text-lg md:text-xl">La partenza a cui si riferisce il conto alla rovescia è quella per la GMG di Seoul 2027.</p>
            <div className="w-32 h-1 bg-amber-600 mx-auto mt-4"></div>
          </div>

          <div className="flex justify-center">
            <FlipCountdown target={new Date('2027-08-02T00:00:00+02:00')} />
          </div>
        </div>
      </section>

      <section id="wyd-seul" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
            <div className="space-y-6">
              <h2 className="text-4xl md:text-5xl font-serif font-bold">WYD Seoul 2027</h2>
              <p className="text-lg text-gray-700 leading-relaxed">
                La Giornata Mondiale della Gioventù 2027 si svolgerà a Seoul, in Corea del Sud,
                dal 2 all'8 agosto 2027. Un'esperienza unica di fede, comunità e cultura che
                riunirà giovani da tutto il mondo per celebrare insieme la propria spiritualità.
              </p>
              <p className="text-lg text-gray-700 leading-relaxed">
                Unisciti a noi in questo straordinario pellegrinaggio che cambierà la tua vita.
                Scopri la bellezza della cultura coreana mentre approfondisci la tua fede.
              </p>
              <p className="text-lg text-gray-700 leading-relaxed font-bold text-black">
                "Abbiate coraggio: io ho vinto il mondo."
              </p>
              <p className="text-lg text-gray-700 leading-relaxed">
                I giovani, “lieti nella speranza” (tema della 38ª Giornata Mondiale della Gioventù), “camminano senza stancarsi” (tema della 39ª Giornata Mondiale della Gioventù), ‘testimoniando’ Cristo che hanno già incontrato (tema della 40ª Giornata Mondiale della Gioventù) e con “coraggio” (tema della 41ª Giornata Mondiale della Gioventù) si mettono in cammino verso Seul.
              </p>
              <p className="text-lg text-gray-700 leading-relaxed">
                Papa Francesco ha scelto il versetto 33 del capitolo 16 del Vangelo secondo Giovanni come tema della GMG 2027 a Seul. Queste parole, rivolte ai discepoli durante l'Ultima Cena, ci ricordano la profonda verità che Gesù, anche di fronte alla sofferenza e alla morte imminente, aveva già superato la paura e alla fine aveva vinto la morte. La certezza della resurrezione contenuta in queste parole non è semplice ottimismo, ma significa “speranza e coraggio” profondamente radicati nel Cristo vivente.
              </p>
              <p className="text-lg text-gray-700 leading-relaxed">
                I giovani di tutto il mondo, che oggi affrontano diverse sfide quali conflitti, precarietà lavorativa e difficoltà economiche, sperimenteranno la gioia di essere “luce e sale del mondo” durante la GMG che si terrà a Seul nel 2027. Incontrandosi e sperimentando l'amore incondizionato, saranno inviati nel mondo come “pellegrini di speranza” e “missionari pieni di coraggio”, mettendo in pratica con coraggio nella loro vita la gioia del Vangelo che hanno compreso.
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

      <section id="sezione-video" className="py-20 bg-black">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-serif text-white font-bold tracking-wider mb-4">
              SEZIONE VIDEO
            </h2>
            <div className="w-32 h-1 bg-amber-600 mx-auto"></div>
          </div>

          <div className="space-y-16">
            <div className="text-center space-y-4">
              <h3 className="text-3xl md:text-4xl font-serif text-white font-bold tracking-wider">
                WYD Seoul 2027 - World Youth Day South Korea
              </h3>
              <div className="w-24 h-1 bg-amber-600 mx-auto"></div>
              <div className="max-w-4xl mx-auto">
                <div className="relative h-64 md:h-96 rounded-lg overflow-hidden shadow-2xl mb-8">
                  <img
                    src="https://img.youtube.com/vi/BMbkoZwqRtI/hqdefault.jpg"
                    alt="Anteprima Video 1"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                </div>
                <div className="text-center">
                  <a
                    href="https://www.youtube.com/watch?v=BMbkoZwqRtI"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-transparent text-white border-2 border-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-black transition-all shadow-lg"
                  >
                    <Play size={20} />
                    Guarda video 1
                  </a>
                </div>
              </div>
            </div>

            <div className="text-center space-y-6">
              <h3 className="text-3xl md:text-4xl font-serif text-white font-bold tracking-wider">
                WYD Seoul 2027 - Official Promo Video
              </h3>
              <div className="w-24 h-1 bg-amber-600 mx-auto"></div>
              <a
                href="https://www.youtube.com/watch?v=DgtBKDW8iq0"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-transparent text-white border-2 border-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-black transition-all shadow-lg"
              >
                <Play size={20} />
                Guarda video 2
              </a>
            </div>

            <div className="text-center space-y-6">
              <h3 className="text-3xl md:text-4xl font-serif text-white font-bold tracking-wider">
                Esperienza Seminarista in Corea
              </h3>
              <div className="w-24 h-1 bg-amber-600 mx-auto"></div>
              <a
                href="https://www.youtube.com/watch?v=3EBJaZTvQ8w"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-transparent text-white border-2 border-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-black transition-all shadow-lg"
              >
                <Play size={20} />
                Guarda video 3
              </a>
            </div>

            <div className="text-center space-y-6">
              <h3 className="text-3xl md:text-4xl font-serif text-white font-bold tracking-wider">
                Invito del Vescovo di Seul
              </h3>
              <div className="w-24 h-1 bg-amber-600 mx-auto"></div>
              <a
                href="https://www.youtube.com/watch?v=PXKnjtHtVFw"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-transparent text-white border-2 border-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-black transition-all shadow-lg"
              >
                <Play size={20} />
                Guarda video 4
              </a>
            </div>
          </div>
        </div>
      </section>

      <section id="comunicazioni" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-serif font-bold tracking-wider mb-4">
              COMUNICAZIONI
            </h2>
            <div className="w-32 h-1 bg-amber-600 mx-auto"></div>
          </div>
          <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-6">
            <div className="bg-gray-50 rounded-2xl shadow-sm border border-gray-200 p-8 text-left">
              <h3 className="text-2xl font-serif font-bold text-black mb-4">Estate 2026</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                Anche per Estate 2026 l'iscrizione reale va effettuata passando dall'area riservata
                e scegliendo il pellegrinaggio di interesse nella sezione dedicata.
              </p>
              <p className="text-gray-700 leading-relaxed font-semibold">
                Le quote dei pellegrinaggi non sono ancora impostate.
              </p>
            </div>
            <div className="bg-gray-50 rounded-2xl shadow-sm border border-gray-200 p-8 text-left">
              <h3 className="text-2xl font-serif font-bold text-black mb-4">GMG Seoul 2027</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                La preiscrizione serve solo all'organizzazione per avere un'idea indicativa dei numeri dei partecipanti.
                Non equivale all'iscrizione reale.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Dopo la preiscrizione verrà comunque richiesto di completare l'iscrizione dall'area riservata,
                inserendo quanto prima tutti i dati richiesti.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="gmg-2027-iscrizione" className="py-20 bg-stone-100">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-serif font-bold tracking-wider mb-4">
                ISCRIZIONE GMG 2027
              </h2>
              <div className="w-32 h-1 bg-amber-600 mx-auto"></div>
            </div>

            <div className="bg-white rounded-3xl shadow-xl border border-gray-200 p-8 md:p-12 space-y-6">
              <p className="text-lg text-gray-700 leading-relaxed">
                Per la GMG 2027 è possibile fare una preiscrizione tramite il modulo dedicato.
                La preiscrizione non significa iscrizione reale: serve soltanto all'organizzazione,
                soprattutto per avere una prima idea dei numeri dei partecipanti.
              </p>

              <p className="text-lg text-gray-700 leading-relaxed">
                L'iscrizione reale va fatta dall'area riservata, nella sezione dedicata,
                scegliendo il pellegrinaggio di interesse e inserendo prima possibile tutti i dati richiesti.
              </p>

              <p className="text-lg text-gray-700 leading-relaxed">
                Se una persona effettua la preiscrizione, le verrà comunque richiesto di iscriversi successivamente
                dall'area riservata per completare correttamente la procedura.
              </p>

              <p className="text-lg text-gray-700 leading-relaxed font-semibold">
                Le quote dei pellegrinaggi non sono ancora impostate.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <a
                  href="https://pellegrinaggiocncpiemonte.fillout.com/t/gTrbdqkQ9Jus"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center bg-black text-white px-8 py-4 rounded-lg font-semibold hover:bg-gray-800 transition-colors"
                >
                  Preiscrizione Seoul 2027
                </a>
                <a
                  href={SITE_CONFIG.reservedAreaUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center bg-amber-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-amber-700 transition-colors"
                >
                  Iscrizione reale da area riservata
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ✅ Countdown non è più una sezione: ora è un “logo animato” sempre visibile nel menu */}

      <section id="area-riservata" className="py-20 bg-black relative">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-8">
            <div className="max-w-md mx-auto">
              <a href={SITE_CONFIG.reservedAreaUrl} target="_blank" rel="noopener noreferrer" title="Apri area riservata" className="inline-block hover:opacity-90 transition-opacity">
                <img
                  src="/images/area riservata.png"
                  alt="Area Riservata"
                  className="w-full h-auto rounded-lg shadow-2xl"
                />
              </a>
            </div>
            <h2 className="text-4xl md:text-5xl font-serif text-white font-bold tracking-wider">
              AREA RISERVATA
            </h2>
            <div className="w-32 h-1 bg-amber-600 mx-auto"></div>
            <p className="text-lg md:text-xl text-white/90 font-light tracking-wide max-w-3xl mx-auto leading-relaxed">
              Accedi all'area riservata per registrarti, completare i dati richiesti e iscriverti
              nella sezione dedicata al pellegrinaggio di tuo interesse, sia per Estate 2026 sia per la GMG Seoul 2027.
            </p>
            <p className="text-base md:text-lg text-white/75 max-w-3xl mx-auto leading-relaxed">
              Le quote dei pellegrinaggi non sono ancora impostate.
            </p>

            <div className="pt-4 md:pt-6 flex flex-col items-center gap-3">
              <div className="relative inline-flex items-center justify-center group">
                <button
                  type="button"
                  onClick={() => setIsReservedGuideOpen(true)}
                  className="w-7 h-7 rounded-full border border-white/35 bg-white text-black shadow-lg hover:scale-105 hover:bg-amber-50 active:scale-95 transition-all duration-200 flex items-center justify-center"
                  aria-label="Info registrazione all'app"
                  title="Info registrazione all'app"
                >
                  <span className="text-sm font-bold leading-none">i</span>
                </button>

                <div className="pointer-events-none absolute left-1/2 top-full z-10 mt-2 -translate-x-1/2 whitespace-nowrap rounded-lg border border-white/20 bg-black/90 px-3 py-1.5 text-xs text-white opacity-0 shadow-xl transition-all duration-200 group-hover:opacity-100 group-hover:translate-y-0 translate-y-1">
                  Info registrazione all'app
                </div>
              </div>

              {/* ✅ Pulsante (ora attivo) */}
              <a
                href={SITE_CONFIG.reservedAreaUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center bg-white text-black px-10 py-4 rounded-lg font-semibold border border-white/30 hover:bg-gray-100 transition-colors"
                title="Apri area riservata"
              >
                ENTRA
              </a>
            </div>
          </div>
        </div>
      </section>


      {isReservedGuideOpen ? (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 py-6">
          <button
            type="button"
            className="absolute inset-0 bg-black/75 backdrop-blur-sm"
            onClick={() => setIsReservedGuideOpen(false)}
            aria-label="Chiudi informazioni registrazione"
          />

          <div className="relative z-10 w-full max-w-4xl max-h-[82vh] overflow-y-auto rounded-2xl border border-white/20 bg-white text-black shadow-2xl sm:max-h-[86vh]">
            <div className="sticky top-0 z-10 flex items-start justify-between gap-3 border-b border-gray-200 bg-white/95 px-4 py-4 backdrop-blur sm:px-5 md:px-6">
              <div className="min-w-0">
                <h3 className="text-xl sm:text-2xl md:text-[1.75rem] font-serif font-bold leading-tight">{RESERVED_AREA_GUIDE_TITLE}</h3>
                <p className="mt-1.5 text-xs sm:text-sm md:text-[0.95rem] text-gray-700 max-w-2xl leading-relaxed">
                  {RESERVED_AREA_GUIDE_SUBTITLE}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsReservedGuideOpen(false)}
                className="shrink-0 rounded-full border border-gray-300 px-3 py-1.5 text-xs sm:text-sm font-semibold text-gray-700 hover:bg-gray-100 active:scale-95 transition-all duration-200"
              >
                Chiudi
              </button>
            </div>

            <div className="p-4 sm:p-5 md:p-6">
              <div className="grid gap-3 sm:gap-4 md:grid-cols-2">
                {RESERVED_AREA_GUIDE_ITEMS.map((item) => (
                  <article key={item.id} className="rounded-xl border border-gray-200 bg-white p-4 sm:p-4.5 md:p-5 shadow-sm">
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

      <section id="donazioni" className="py-20 bg-black">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-serif font-bold tracking-wider mb-4 text-white">
              VERSAMENTI E DONAZIONI
            </h2>
            <div className="w-32 h-1 bg-amber-600 mx-auto"></div>
          </div>
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-xl text-gray-300">
              Indicazioni disponibili a breve.
            </p>
          </div>
        </div>
      </section>

      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-6 mb-8">
            <a href="#home" className="hover:text-amber-500 transition-colors">Home Page</a>
            <a href="#prossimi-eventi" className="hover:text-amber-500 transition-colors">Prossimi eventi</a>
            <a href="#wyd-seul" className="hover:text-amber-500 transition-colors">WYD Seul 2027</a>
            <a href="#gmg-2027-iscrizione" className="hover:text-amber-500 transition-colors">Iscrizione GMG 2027</a>
            <a href="#donazioni" className="hover:text-amber-500 transition-colors">Versamenti e Donazioni</a>
          </div>

          <div className="text-center text-sm text-gray-400 space-y-2">
            <p>© 2026 Pellegrinaggi CnC Piemonte. Tutti i diritti riservati.</p>
<p>Powered by iFabry Studio</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
