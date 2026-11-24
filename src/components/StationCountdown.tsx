import React, {useEffect, useState} from 'react';
import {Clock} from 'lucide-react';

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  arrived: boolean;
}

const TARGET_DATE_MS = new Date('2026-12-19T18:00:00+07:00').getTime();

function computeTimeLeft(): TimeLeft {
  const diff = TARGET_DATE_MS - Date.now();
  if (diff <= 0) {
    return {days: 0, hours: 0, minutes: 0, seconds: 0, arrived: true};
  }
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);
  return {days, hours, minutes, seconds, arrived: false};
}

export const StationCountdown: React.FC = () => {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(() => computeTimeLeft());

  useEffect(() => {
    const id = window.setInterval(() => {
      setTimeLeft(computeTimeLeft());
    }, 1000);
    return () => window.clearInterval(id);
  }, []);

  const units = [
    {label: 'Hari', value: timeLeft.days, dial: 'bg-[#2B2D42]'},
    {label: 'Jam', value: timeLeft.hours, dial: 'bg-[#D62828]'},
    {label: 'Menit', value: timeLeft.minutes, dial: 'bg-[#2B2D42]'},
    {label: 'Detik', value: timeLeft.seconds, dial: 'bg-[#D62828]'},
  ];

  return (
    <section aria-labelledby="countdown-heading" className="px-1">
      <div className="card-storybook rounded-3xl p-5 text-center">
        <div className="flex items-center justify-center gap-2 mb-1">
          <Clock className="w-4 h-4 text-[#D62828]" />
          <p className="text-[11px] font-bold tracking-[0.06em] uppercase text-[#7D5800]">
            Jam Stasiun Keberangkatan
          </p>
        </div>
        <h2
          id="countdown-heading"
          className="text-xl font-extrabold text-[#2B2D42] mb-4 [text-wrap:balance]"
        >
          {timeLeft.arrived
            ? 'Kereta Petualangan Telah Tiba!'
            : 'Menuju Hari Bahagia Faqih'}
        </h2>

        <div className="grid grid-cols-4 gap-2.5">
          {units.map((unit) => (
            <div
              key={unit.label}
              className="bg-[#FFF9F2] rounded-2xl py-3 px-1.5 border border-[#FCBF49]/40 flex flex-col items-center"
            >
              <div
                className={`w-14 h-14 rounded-full ${unit.dial} border-[3px] border-[#FCBF49] shadow-sm flex items-center justify-center`}
              >
                <span className="text-xl font-extrabold text-[#FCBF49] tabular-nums">
                  {String(unit.value).padStart(2, '0')}
                </span>
              </div>
              <span className="mt-2 text-[11px] font-bold uppercase tracking-[0.05em] text-[#2B2D42]">
                {unit.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
