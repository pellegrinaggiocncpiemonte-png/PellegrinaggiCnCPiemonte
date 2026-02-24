import { useState, useEffect } from 'react';

const Countdown = () => {
  const targetDate = new Date('2027-08-02T00:00:00').getTime();

  const calculateTimeLeft = () => {
    const now = new Date().getTime();
    const difference = targetDate - now;

    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
      minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
      seconds: Math.floor((difference % (1000 * 60)) / 1000),
    };
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const TimeUnit = ({ value, label }: { value: number; label: string }) => (
    <div className="flex flex-col items-center">
      <div className="bg-gradient-to-b from-gray-800 to-gray-900 rounded-lg p-6 md:p-8 shadow-2xl border border-gray-700 min-w-[100px] md:min-w-[120px]">
        <div className="text-4xl md:text-6xl font-bold text-white font-mono">
          {value.toString().padStart(2, '0')}
        </div>
      </div>
      <div className="text-white text-sm md:text-base mt-3 uppercase tracking-widest font-serif">
        {label}
      </div>
    </div>
  );

  return (
    <div className="flex flex-wrap justify-center gap-4 md:gap-6">
      <TimeUnit value={timeLeft.days} label="Giorni" />
      <TimeUnit value={timeLeft.hours} label="Ore" />
      <TimeUnit value={timeLeft.minutes} label="Minuti" />
      <TimeUnit value={timeLeft.seconds} label="Secondi" />
    </div>
  );
};

export default Countdown;
