import Navigation from './components/Navigation';
import { ChevronDown, FileText, Landmark, Play, X } from 'lucide-react';
import { useState } from 'react';
import FlipCountdown from './components/FlipCountdown';
import { SITE_CONFIG } from './config/siteConfig';
import { RESERVED_AREA_GUIDE_ITEMS, RESERVED_AREA_GUIDE_SUBTITLE, RESERVED_AREA_GUIDE_TITLE } from './config/reservedAreaGuide';
import VisitCounterBadge from './components/VisitCounterBadge';
import FloatingAssistance from './components/FloatingAssistance';

function App() {
  const [isReservedGuideOpen, setIsReservedGuideOpen] = useState(false);
  const [isTelegramGuideOpen, setIsTelegramGuideOpen] = useState(false);
  const [isTelegramDetailsOpen, setIsTelegramDetailsOpen] = useState(false);
  const [isBankDetailsOpen, setIsBankDetailsOpen] = useState(false);
  const [isPaymentInstructionsOpen, setIsPaymentInstructionsOpen] = useState(false);
  const [isPaymentNoticeOpen, setIsPaymentNoticeOpen] = useState(false);
  const [openVideoId, setOpenVideoId] = useState<number | null>(1);

  return (
    <div className="min-h-screen">
      <Navigation />

      {/* ✅ Pulsante chat custom (Tawk launcher nascosto) */}
     

      


      <section id="home" className="min-h-screen relative flex items-center justify-center">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: 'url(/images/maria.png)',
          }}
        >
          <div className="absolute inset-0 bg-black/40"></div>
        </div>
        <div className="relative z-10 text-center px-4 max-w-[94vw] mx-auto pt-24 sm:pt-16 -translate-y-[105px] sm:-translate-y-[96px] md:-translate-y-[72px]">
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
            <p
              className="text-white/95 text-[clamp(1rem,4.6vw,1.65rem)] sm:text-[clamp(1.1rem,3.2vw,1.85rem)] font-medium tracking-[0.18em] uppercase pt-3"
              style={{ textShadow: '3px 3px 6px rgba(0,0,0,0.75)' }}
            >
              Cammino Neocatecumenale
            </p>
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
            Dal 26 luglio al 29 luglio
          </p>
          <p className="text-xl md:text-2xl text-white/90 mt-4 font-light tracking-wide">
            Attenzione!!!
          </p>
          <div className="mt-8 space-y-4 text-white/85 max-w-4xl mx-auto">
            <p className="text-base md:text-lg leading-relaxed font-semibold text-white">
              Per chi è arrivato in ritardo e desidera ancora aggiungersi al pellegrinaggio Estate 2026,
              è stata aggiunta una nuova possibilità di richiesta iscrizione per un nuovo gruppo.
            </p>
            <p className="text-base md:text-lg leading-relaxed">
              Le richieste dovranno arrivare entro fine maggio, perché i posti sono limitati.
            </p>
            <p className="text-base md:text-lg leading-relaxed">
              Chi desidera aggiungersi può procedere cliccando il pulsante "Richiesta Iscrizione".
            </p>
          </div>
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
              href="https://pellegrinaggiocncpiemonte.fillout.com/t/uyBxG9c1zsus"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center bg-white text-black px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Richiesta Iscrizione
            </a>
            <div className="mt-4 max-w-3xl space-y-2 text-sm md:text-base leading-relaxed text-white/80">
              <p>
                La compilazione della richiesta non conferma automaticamente l'iscrizione.
              </p>
              <p>
                L'organizzazione valuterà le richieste in base ai posti realmente disponibili e contatterà gli interessati per l'eventuale conferma.
              </p>
            </div>
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
            <p className="text-white/80 mt-4 text-lg md:text-xl">La partenza a cui si riferisce il conto alla rovescia è quella per la JMJ Seoul 2027.</p>
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

      <section id="sezione-video" className="py-20 bg-black">
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
                        src={`https://www.youtube.com/embed/${video.youtubeId}?autoplay=1&rel=0`}
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

      <section id="comunicazioni" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="max-w-[92vw] mx-auto px-4 text-center font-serif font-bold uppercase leading-[0.95] tracking-tight text-[clamp(1.65rem,7vw,3.2rem)] sm:text-[clamp(2.8rem,7vw,5rem)] mb-4 whitespace-nowrap">
              COMUNICAZIONI
            </h2>
            <div className="w-32 h-1 bg-amber-600 mx-auto"></div>
          </div>
          <div className="max-w-3xl mx-auto">
            <div className="bg-gray-50 rounded-2xl shadow-sm border border-gray-200 p-8 text-left">
              <h3 className="text-2xl font-serif font-bold text-black mb-4">JMJ Seoul 2027</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                Sono aperte le iscrizioni ufficiali per la JMJ Seoul 2027, dedicate ai giovani fino ai 25 anni.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Chi aveva già compilato la preiscrizione deve completare l'iscrizione ufficiale dall'area riservata personale.
                Invitiamo a procedere il prima possibile, perché i posti sono limitati.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="telegram" className="py-20 bg-stone-100">
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
                Le comunicazioni dell&apos;organizzazione potranno arrivare sia nella sezione comunicazioni,
                sia su Telegram tramite il bot dedicato.
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
                          nella sezione comunicazioni dell&apos;area riservata.
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

      <section id="gmg-2027-iscrizione" className="py-20 bg-stone-100">
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

            <div className="bg-white rounded-3xl shadow-xl border border-gray-200 p-6 sm:p-8 md:p-12 space-y-6">
              <p className="text-lg text-gray-700 leading-relaxed font-semibold">
                Sono aperte le iscrizioni ufficiali per la JMJ Seoul 2027, dedicate ai giovani fino ai 25 anni.
              </p>

              <p className="text-lg text-gray-700 leading-relaxed">
                Chi aveva già compilato la preiscrizione deve ora completare l&apos;iscrizione ufficiale entrando nell&apos;area riservata personale e scegliendo il pellegrinaggio JMJ Seoul 2027.
              </p>

              <p className="text-lg text-gray-700 leading-relaxed">
                La preiscrizione non sostituisce l&apos;iscrizione ufficiale. Invitiamo a procedere il prima possibile, perché i posti disponibili sono limitati.
              </p>

              <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4 text-sm sm:text-base leading-relaxed text-amber-950">
                A breve verranno comunicate le quote minime di iscrizione e le relative scadenze.
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-2">
                <a
                  href={SITE_CONFIG.reservedAreaUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center bg-amber-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-amber-700 transition-colors"
                >
                  Iscriviti dall&apos;area riservata
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
              nella sezione dedicata al pellegrinaggio di tuo interesse, sia per Estate 2026 sia per la JMJ Seoul 2027.
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-2 py-2 sm:px-4 sm:py-6">
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
                  <span className="sm:hidden">Info registrazione e accesso rapido</span>
                  <span className="hidden sm:inline">{RESERVED_AREA_GUIDE_TITLE}</span>
                </h3>
                <p className="mt-1.5 hidden max-w-2xl text-sm leading-relaxed text-gray-700 sm:block md:text-[0.95rem]">
                  {RESERVED_AREA_GUIDE_SUBTITLE}
                </p>
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
              <div className="mb-3 rounded-xl border border-blue-100 bg-blue-50 px-3 py-3 text-sm leading-relaxed text-gray-800 sm:hidden">
                {RESERVED_AREA_GUIDE_SUBTITLE}
              </div>

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
                'Se un messaggio è troppo lungo, potrai leggerlo integralmente nella sezione comunicazioni dell’area riservata.',
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

      <section id="donazioni" className="py-20 bg-black">
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
                Le stesse informazioni saranno disponibili anche nell&apos;area riservata personale, nella sezione <span className="font-semibold text-white">“Info pagamenti”</span>.
              </p>
              <p className="font-semibold text-amber-200">
                A breve verranno comunicate le quote minime di iscrizione e le relative scadenze.
              </p>
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

      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-6 mb-8">
            <a href="#home" className="hover:text-amber-500 transition-colors">Home Page</a>
            <a href="#prossimi-eventi" className="hover:text-amber-500 transition-colors">Prossimi eventi</a>
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
