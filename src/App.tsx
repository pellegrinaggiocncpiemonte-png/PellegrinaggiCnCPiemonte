import Navigation from './components/Navigation';
import { Play } from 'lucide-react';
import { useEffect, useState } from 'react';
import FlipCountdown from './components/FlipCountdown';


function App() {
  const [pageViews, setPageViews] = useState<number | null>(null);

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
        <div className="relative z-10 text-center">
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-serif text-white font-bold tracking-wider lg:whitespace-nowrap break-normal" style={{ textShadow: '4px 4px 8px rgba(0,0,0,0.8)' }}>
            Pellegrinaggi
          </h1>
          <h1 className="text-6xl md:text-8xl font-serif text-white font-bold tracking-wider mt-4" style={{ textShadow: '4px 4px 8px rgba(0,0,0,0.8)' }}>
            CnC
          </h1>
          <h1 className="text-6xl md:text-8xl font-serif text-white font-bold tracking-wider mt-4" style={{ textShadow: '4px 4px 8px rgba(0,0,0,0.8)' }}>
            Piemonte
          </h1>
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
        <div className="relative z-10 text-center px-4">
          <h2 className="text-5xl md:text-6xl font-serif text-white font-bold tracking-wider">
            Estate 2026
          </h2>
          <p className="text-2xl md:text-3xl text-white/90 mt-6 font-light tracking-wide">
            in Programmazione
          </p>
        </div>
      </section>

      {/* ✅ Nuova sezione: Giorni alla partenza (countdown a cartelli) */}
      <section id="giorni-alla-partenza" className="py-20 bg-black">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-4xl md:text-5xl font-serif text-white font-bold tracking-wider mb-4">
              Giorni alla partenza
            </h2>
            <div className="w-32 h-1 bg-amber-600 mx-auto"></div>
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
                    src="https://img.youtube.com/vi/IGXzw3-fY0o/hqdefault.jpg"
                    alt="Anteprima Video 1"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                </div>
                <div className="text-center">
                  <a
                    href="https://www.youtube.com/watch?v=IGXzw3-fY0o"
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
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-xl text-gray-700">
              Pre-iscrizioni GmG 2027: Prossimamente
            </p>
          </div>
        </div>
      </section>

      {/* ✅ Countdown non è più una sezione: ora è un “logo animato” sempre visibile nel menu */}

      <section id="area-riservata" className="py-20 bg-black relative">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-8">
            <div className="max-w-md mx-auto">
              <a href="https://script.google.com/macros/s/AKfycbwfcxLkimZF8gPJggncy6cFWBc1OWAnnIzfeDE2-vLpImRZmdh4BoXcBCjPagVoDF-P/exec" target="_blank" rel="noopener noreferrer" title="Apri area riservata" className="inline-block hover:opacity-90 transition-opacity">
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
            <p className="text-2xl md:text-3xl text-white/90 font-light tracking-widest">
              PROSSIMAMENTE
            </p>

            {/* ✅ Pulsante (ora attivo) */}
            <a
              href="https://script.google.com/macros/s/AKfycbwfcxLkimZF8gPJggncy6cFWBc1OWAnnIzfeDE2-vLpImRZmdh4BoXcBCjPagVoDF-P/exec"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center bg-white text-black px-10 py-4 rounded-lg font-semibold border border-white/30 hover:bg-gray-100 transition-colors"
              title="Apri area riservata"
            >
              ENTRA
            </a>
          </div>
        </div>

        
      </section>


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
