import { useEffect, useMemo, useRef, useState } from 'react';

type Props = {
  /** Data/ora di arrivo (default: 2 agosto 2027 00:00 Europe/Rome) */
  target?: Date;
  className?: string;
};

type Units = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

function pad2(n: number) {
  return String(Math.max(0, Math.floor(n))).padStart(2, '0');
}

function diffClockUnits(now: Date, target: Date): Units {
  const delta = Math.max(0, target.getTime() - now.getTime());
  const totalSeconds = Math.floor(delta / 1000);

  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return { days, hours, minutes, seconds };
}

function FlipUnit({ value, label }: { value: number; label: string }) {
  const v = useMemo(() => pad2(value), [value]);
  const [prev, setPrev] = useState(v);
  const [flip, setFlip] = useState(false);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    if (v === prev) return;
    setFlip(true);
    if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    timeoutRef.current = window.setTimeout(() => {
      setPrev(v);
      setFlip(false);
    }, 650);
    return () => {
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [v]);

  return (
    <div className="flex flex-col items-center">
      <div className="flip-card">
        <div className="flip-card-inner">
          <span className="flip-pin flip-pin-left" aria-hidden />
          <span className="flip-pin flip-pin-right" aria-hidden />
          {/* Static halves: stesso numero (niente “doppio”) */}
          <div className="flip-card-top" aria-hidden>
            <span className="flip-value">{v}</span>
          </div>
          <div className="flip-card-bottom" aria-hidden>
            <span className="flip-value">{v}</span>
          </div>

          {/* Animated halves */}
          {flip && (
            <>
              <div className="flip-card-top flip-animate-top" aria-hidden>
                <span className="flip-value">{prev}</span>
              </div>
              <div className="flip-card-bottom flip-animate-bottom" aria-hidden>
                <span className="flip-value">{v}</span>
              </div>
            </>
          )}
        </div>
      </div>
      <div className="mt-3 flip-label">
        {label}
      </div>
    </div>
  );
}

export default function FlipCountdown({
  target = new Date('2027-08-02T00:00:00+02:00'),
  className = '',
}: Props) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const left = useMemo(() => diffClockUnits(now, target), [now, target]);
  const done = left.days + left.hours + left.minutes + left.seconds === 0;

  return (
    <div className={`w-full ${className}`}>
      {done ? (
        <div className="text-center text-white font-serif text-3xl md:text-4xl font-bold tracking-wider">
          SI PARTE!
        </div>
      ) : (
        <div className="flex flex-wrap justify-center gap-4 md:gap-6">
          <FlipUnit value={left.days} label="Giorni" />
          <FlipUnit value={left.hours} label="Ore" />
          <FlipUnit value={left.minutes} label="Minuti" />
          <FlipUnit value={left.seconds} label="Secondi" />
        </div>
      )}
    </div>
  );
}
