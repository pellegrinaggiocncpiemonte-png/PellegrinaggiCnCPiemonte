import { type CSSProperties, type MouseEvent, useEffect, useRef, useState } from 'react';
import { ArrowRight, FastForward, MapPin } from 'lucide-react';

type IntroVariant = 'in-cammino' | 'verso-la-luce';
type ExitMode = 'light' | 'skip' | null;

const SESSION_KEY = 'pellegrinaggi-cnc-intro-seen-v2';

function introStorageKey(variant: IntroVariant) {
  return `${SESSION_KEY}-${variant}`;
}

function shouldShowIntro(variant: IntroVariant) {
  if (typeof window === 'undefined') return true;
  const force = new URLSearchParams(window.location.search).get('intro') === '1';
  return force || window.sessionStorage.getItem(introStorageKey(variant)) !== 'yes';
}

export default function CinematicIntro({ variant }: { variant: IntroVariant }) {
  const [visible, setVisible] = useState(() => shouldShowIntro(variant));
  const [closing, setClosing] = useState(false);
  const [exitMode, setExitMode] = useState<ExitMode>(null);
  const [lightOrigin, setLightOrigin] = useState({ x: '50vw', y: '62vh' });
  const timers = useRef<number[]>([]);

  const queue = (callback: () => void, delay: number) => {
    const timer = window.setTimeout(callback, delay);
    timers.current.push(timer);
  };

  useEffect(() => {
    return () => {
      timers.current.forEach((timer) => window.clearTimeout(timer));
      document.body.classList.remove('intro-home-pending', 'intro-home-entering');
    };
  }, []);

  useEffect(() => {
    if (!visible) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.documentElement.classList.add('cinematic-intro-active');
    document.body.classList.add('cinematic-intro-active');

    // Nasconde anche l'eventuale widget Tawk già caricato prima dell'introduzione.
    window.Tawk_API?.hideWidget?.();

    return () => {
      document.body.style.overflow = previousOverflow;
      document.documentElement.classList.remove('cinematic-intro-active');
      document.body.classList.remove('cinematic-intro-active');
      window.Tawk_API?.hideWidget?.();
    };
  }, [visible]);

  const startClose = (mode: Exclude<ExitMode, null>) => {
    if (closing) return;

    setExitMode(mode);
    setClosing(true);
    window.sessionStorage.setItem(introStorageKey(variant), 'yes');

    if (mode === 'light') {
      // La home parte nascosta dietro il lampo bianco e compare con un vero fade-in.
      document.body.classList.add('intro-home-pending');

      queue(() => {
        document.body.classList.add('intro-home-entering');
      }, 780);

      queue(() => {
        setVisible(false);
      }, 1500);

      queue(() => {
        document.body.classList.remove('intro-home-pending', 'intro-home-entering');
      }, 2250);
      return;
    }

    queue(() => setVisible(false), 920);
  };

  const enterSite = (event: MouseEvent<HTMLButtonElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setLightOrigin({
      x: `${rect.left + rect.width / 2}px`,
      y: `${rect.top + rect.height / 2}px`,
    });

    // Il frame successivo assicura che l'origine della luce sia aggiornata
    // prima dell'avvio dell'animazione.
    window.requestAnimationFrame(() => startClose('light'));
  };

  if (!visible) return null;

  const warm = variant === 'in-cammino';
  const lightStyle = {
    '--intro-light-x': lightOrigin.x,
    '--intro-light-y': lightOrigin.y,
  } as CSSProperties;

  return (
    <div
      className={`cinematic-intro cinematic-intro--${variant} ${closing ? 'is-closing' : ''} ${exitMode ? `is-closing--${exitMode}` : ''}`}
      role="dialog"
      aria-modal="true"
      aria-label="Introduzione al sito Pellegrinaggi CnC Piemonte e Svizzera"
    >
      <div className="intro-backdrop" aria-hidden="true" />
      <div className="intro-stars" aria-hidden="true" />
      <div className="intro-vignette" aria-hidden="true" />

      {warm ? (
        <div className="intro-journey" aria-hidden="true">
          <svg className="intro-journey-svg" viewBox="0 0 1200 650" preserveAspectRatio="xMidYMid slice">
            <defs>
              <filter id="journeyGlow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="8" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              <linearGradient id="journeyLine" x1="0" x2="1">
                <stop offset="0" stopColor="#ffe3a0" />
                <stop offset="0.52" stopColor="#d99a31" />
                <stop offset="1" stopColor="#fff0bd" />
              </linearGradient>
            </defs>
            <g className="intro-continent-lines">
              <path d="M90 245 C140 160 230 135 302 172 C357 200 390 184 427 144 C473 94 559 91 607 132 C663 178 688 163 733 119 C786 68 875 77 904 126 C939 183 987 181 1118 115" />
              <path d="M104 468 C197 421 258 440 327 485 C397 530 456 518 512 471 C574 419 648 423 716 466 C788 511 855 490 925 425 C989 366 1057 367 1130 400" />
              <path d="M218 70 C184 155 195 243 232 324 C265 397 256 505 224 585" />
              <path d="M835 42 C804 122 817 218 850 286 C887 360 881 477 843 610" />
            </g>
            <path id="pilgrimageRoute" className="intro-route-glow" d="M170 430 C275 350 325 466 430 355 C535 244 590 362 690 272 C798 175 854 270 1034 154" />
            <path className="intro-route-line" d="M170 430 C275 350 325 466 430 355 C535 244 590 362 690 272 C798 175 854 270 1034 154" />
            <circle className="intro-route-point intro-route-point--start" cx="170" cy="430" r="9" />
            <circle className="intro-route-point intro-route-point--end" cx="1034" cy="154" r="11" />
            <circle className="intro-moving-light" r="8" filter="url(#journeyGlow)">
              <animateMotion dur="3.2s" begin="0.35s" fill="freeze" path="M170 430 C275 350 325 466 430 355 C535 244 590 362 690 272 C798 175 854 270 1034 154" />
            </circle>
          </svg>
          <div className="intro-location intro-location--start"><MapPin size={15} /> Piemonte e Svizzera</div>
          <div className="intro-location intro-location--end"><MapPin size={15} /> Seoul 2027</div>
        </div>
      ) : (
        <div className="intro-light-scene" aria-hidden="true">
          <div className="intro-maria-panel"><img src="/images/maria.png" alt="" /></div>
          <div className="intro-cross"><span /><span /><i /></div>
          <div className="intro-golden-path"><span /><span /><span /><span /></div>
        </div>
      )}

      <button type="button" className="intro-skip" onClick={() => startClose('skip')}>
        <FastForward size={16} /> Salta introduzione
      </button>

      <main className="intro-copy">
        <div className="intro-brand-lockup">
          <span className="intro-brand-mark" aria-hidden="true">✦</span>
          <div>
            <p className="intro-brand">Pellegrinaggi CnC</p>
            <p className="intro-region">Piemonte e Svizzera</p>
          </div>
        </div>

        <div className="intro-title-mask">
          <h1>{warm ? 'IN CAMMINO' : 'VERSO LA LUCE'}</h1>
        </div>
        <p className="intro-message">
          {warm
            ? 'Pellegrinaggi, incontri e grandi eventi vissuti insieme nella fede.'
            : 'Ogni passo è un cammino. Ogni cammino è un incontro.'}
        </p>
        <div className="intro-divider" aria-hidden="true"><span /></div>

        <div className="intro-event-card">
          <img src="/images/logo.png" alt="WYD Seoul 2027" />
          <div>
            <small>Prossimo grande appuntamento</small>
            <strong>GMG Seoul 2027</strong>
          </div>
        </div>

        <button type="button" className="intro-enter" onClick={enterSite}>
          <span>ENTRA NEL SITO</span>
          <ArrowRight size={19} />
        </button>
      </main>

      <div className="intro-white-transition" style={lightStyle} aria-hidden="true" />
      <div className="intro-opening-panel intro-opening-panel--left" aria-hidden="true" />
      <div className="intro-opening-panel intro-opening-panel--right" aria-hidden="true" />
    </div>
  );
}
