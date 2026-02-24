import { useEffect, useMemo, useState } from 'react';

type Props = {
  /** Data/ora di riferimento (default: 3 agosto 2027 00:00) */
  target?: Date;
  /** Testo che gira attorno */
  ringText?: string;
  /** Dimensione in px */
  size?: number;
  className?: string;
};

function pad2(n: number) {
  return String(Math.max(0, Math.floor(n))).padStart(2, '0');
}

export default function FloatingCountdownBadge({
  target = new Date('2027-08-03T00:00:00+02:00'),
  ringText = 'GMG SEUL 2027 • PELLEGRINAGGI CNC PIEMONTE •',
  size = 92,
  className = '',
}: Props) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const left = useMemo(() => {
    const total = Math.max(0, Math.floor((target.getTime() - now.getTime()) / 1000));
    const days = Math.floor(total / 86400);
    const rem = total - days * 86400;
    const hours = Math.floor(rem / 3600);
    const rem2 = rem - hours * 3600;
    const minutes = Math.floor(rem2 / 60);
    const seconds = rem2 - minutes * 60;
    return { total, days, hours, minutes, seconds };
  }, [now, target]);

  const mainLabel = left.total === 0 ? 'SI PARTE!' : `D-${left.days}`;
  const hms = `${pad2(left.hours)}:${pad2(left.minutes)}:${pad2(left.seconds)}`;

  return (
    <div className={`select-none ${className}`} style={{ width: size, height: size }}>
      <div className="relative w-full h-full">
        {/* Ring */}
        <div className="absolute inset-0 rounded-full border border-white/35 bg-black/20 backdrop-blur-sm" />

        {/* Rotating text */}
        <div className="absolute inset-0 animate-spin-slow">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <defs>
              <path
                id="countdownTextCircle"
                d="M50,50 m-38,0 a38,38 0 1,1 76,0 a38,38 0 1,1 -76,0"
              />
            </defs>
            <text fill="rgba(255,255,255,.78)" fontSize="8" letterSpacing="2">
              <textPath href="#countdownTextCircle" startOffset="50%" textAnchor="middle">
                {ringText}
              </textPath>
            </text>
          </svg>
        </div>

        {/* Center */}
        <div className="absolute inset-[14px] rounded-full bg-[#f4d84a] shadow-lg flex items-center justify-center">
          <div className="text-center leading-none px-3">
            <div className="text-black font-black text-[18px] whitespace-nowrap">{mainLabel}</div>
            <div className="mt-1 text-black/80 font-semibold text-[11px] tabular-nums whitespace-nowrap">{hms}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
