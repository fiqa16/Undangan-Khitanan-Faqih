import React, { useState } from 'react';
import { Sparkles, Ticket, Volume2 } from 'lucide-react';
import { BuntingPennants } from './StorybookIllustrations';
import { playLongTrainWhistle } from '../utils/sound';

interface OpeningScreenProps {
  childName?: string;
  guestName?: string;
  onOpenComplete: () => void;
}

export const OpeningScreen: React.FC<OpeningScreenProps> = ({
  childName = 'Faqih Al-Arif Billah',
  guestName,
  onOpenComplete,
}) => {
  const [isDeparting, setIsDeparting] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  const handleOpenInvitation = () => {
    if (isDeparting) return;
    setIsDeparting(true);

    // 1. Play long, realistic multi-chime steam train whistle
    try {
      playLongTrainWhistle();
    } catch {
      // Audio error fallback
    }

    // 2. Allow train to cross screen (~2.6s), then initiate fade-out of opening overlay
    window.setTimeout(() => {
      setIsExiting(true);
    }, 2800);

    // 3. Complete transition and reveal main invitation + start Thomas music
    window.setTimeout(() => {
      onOpenComplete();
    }, 3400);
  };

  return (
    <div
      role="region"
      aria-label="Opening Screen Undangan Khitanan Faqih"
      className={`fixed inset-0 z-50 flex flex-col justify-between items-center px-4 py-6 overflow-hidden transition-opacity duration-700 select-none ${
        isExiting ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      style={{
        background: `
          radial-gradient(circle at 50% 18%, #871616 0%, #610B0B 45%, #3B0505 100%)
        `,
      }}
    >
      {/* Background Star & Cloud Twinkles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        {/* Floating golden stars */}
        <div className="absolute top-[8%] left-[10%] w-3 h-3 text-[#FCBF49] opacity-75 animate-pulse">
          ✦
        </div>
        <div className="absolute top-[14%] right-[12%] w-4 h-4 text-[#FCBF49] opacity-85 animate-pulse delay-300">
          ★
        </div>
        <div className="absolute top-[28%] left-[6%] w-3 h-3 text-[#FCBF49] opacity-60">
          ★
        </div>
        <div className="absolute top-[32%] right-[8%] w-3 h-3 text-[#FCBF49] opacity-70 animate-pulse delay-500">
          ✦
        </div>
        <div className="absolute bottom-[22%] left-[12%] w-4 h-4 text-[#FCBF49] opacity-70">
          ★
        </div>
        <div className="absolute bottom-[18%] right-[10%] w-3 h-3 text-[#FCBF49] opacity-80 animate-pulse">
          ✦
        </div>

        {/* Soft atmospheric cloud gradients */}
        <div className="absolute -top-16 -left-16 w-64 h-64 bg-[#D62828]/25 rounded-full blur-3xl" />
        <div className="absolute -bottom-16 -right-16 w-72 h-72 bg-[#FCBF49]/15 rounded-full blur-3xl" />
      </div>

      {/* Top Festive Bunting Pennants */}
      <div className="w-full max-w-[440px] -mt-3 relative z-10">
        <BuntingPennants className="opacity-95 drop-shadow-sm" />
      </div>

      {/* Main Center Content Box */}
      <div className="relative z-10 w-full max-w-[390px] flex flex-col items-center text-center my-auto px-2">
        {/* Golden Walimatul Khitan Badge */}
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#FCBF49] text-[#2B1B00] border-2 border-[#FFE8A3] shadow-md mb-3">
          <Sparkles className="w-3.5 h-3.5 fill-[#2B1B00]" />
          <span className="text-[11px] font-black tracking-widest uppercase">
            WALIMATUL KHITAN
          </span>
          <Sparkles className="w-3.5 h-3.5 fill-[#2B1B00]" />
        </div>

        {/* Cute Cartoon Train Locomotive Hero Centerpiece */}
        <div className="relative w-48 h-40 sm:w-56 sm:h-44 my-1">
          {/* Animated Steam Clouds floating up from chimney */}
          <div className="absolute top-0 right-10 flex flex-col items-center pointer-events-none" aria-hidden="true">
            <span className="w-4 h-4 rounded-full bg-white/90 border border-[#4CC9F0]/60 animate-steam-rise" />
            <span
              className="w-6 h-6 rounded-full bg-white/95 border border-[#4CC9F0]/60 -mt-1.5 animate-steam-rise"
              style={{ animationDelay: '0.4s' }}
            />
            <span
              className="w-8 h-8 rounded-full bg-white border border-[#4CC9F0]/60 -mt-2 animate-steam-rise"
              style={{ animationDelay: '0.8s' }}
            />
          </div>

          {/* Cute Locomotive Vector Graphic */}
          <div className="animate-gentle-bob w-full h-full drop-shadow-[0_12px_24px_rgba(0,0,0,0.4)]">
            <svg
              viewBox="0 0 240 160"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-full h-full"
            >
              {/* Warm headlight glow cone */}
              <polygon points="185,92 240,70 240,118 185,102" fill="#FCBF49" fillOpacity="0.28" />

              {/* Railway track under opening train */}
              <line x1="10" y1="148" x2="230" y2="148" stroke="#FFE3A8" strokeWidth="3.5" strokeLinecap="round" />
              <g stroke="#FFE3A8" strokeWidth="3" strokeLinecap="round" opacity="0.8">
                <line x1="28" y1="150" x2="38" y2="150" />
                <line x1="56" y1="150" x2="66" y2="150" />
                <line x1="84" y1="150" x2="94" y2="150" />
                <line x1="112" y1="150" x2="122" y2="150" />
                <line x1="140" y1="150" x2="150" y2="150" />
                <line x1="168" y1="150" x2="178" y2="150" />
                <line x1="196" y1="150" x2="206" y2="150" />
              </g>

              {/* Cab Roof Curve */}
              <path
                d="M32 60 Q 60 48 88 60 L 84 68 L 36 68 Z"
                fill="#FCBF49"
                stroke="#2B2D42"
                strokeWidth="2.5"
                strokeLinejoin="round"
              />
              {/* Cab Body */}
              <rect x="36" y="68" width="48" height="58" rx="6" fill="#D62828" stroke="#2B2D42" strokeWidth="2.5" />
              {/* Cab Window */}
              <rect x="46" y="76" width="28" height="24" rx="8" fill="#E4F6FF" stroke="#2B2D42" strokeWidth="2" />

              {/* Cute smiling little conductor Faqih */}
              <circle cx="60" cy="88" r="8" fill="#FFDEA9" />
              <path d="M52 83 Q60 76 68 83 Z" fill="#D62828" stroke="#2B2D42" strokeWidth="1.2" />
              <rect x="50" y="82" width="20" height="3" rx="1.5" fill="#FCBF49" />
              <circle cx="57.5" cy="88" r="1.2" fill="#2B2D42" />
              <circle cx="62.5" cy="88" r="1.2" fill="#2B2D42" />
              <path d="M58 91 Q60 93 62 91" stroke="#2B2D42" strokeWidth="1.2" strokeLinecap="round" />

              {/* Main Boiler */}
              <rect x="84" y="74" width="94" height="52" rx="12" fill="#E63946" stroke="#2B2D42" strokeWidth="2.5" />
              {/* Gold bands */}
              <rect x="108" y="74" width="6" height="52" fill="#FCBF49" />
              <rect x="146" y="74" width="6" height="52" fill="#FCBF49" />

              {/* Brass Steam Dome */}
              <path d="M118 74 C118 60, 138 60, 138 74 Z" fill="#FCBF49" stroke="#2B2D42" strokeWidth="2" />
              <circle cx="128" cy="60" r="3" fill="#FCBF49" stroke="#2B2D42" strokeWidth="1.5" />

              {/* Funnel Chimney */}
              <path
                d="M158 74 L154 50 L178 50 L174 74 Z"
                fill="#2B2D42"
                stroke="#2B2D42"
                strokeWidth="2"
                strokeLinejoin="round"
              />
              <rect x="151" y="46" width="30" height="6" rx="3" fill="#FCBF49" stroke="#2B2D42" strokeWidth="1.8" />

              {/* Front Smokebox & Big Headlamp */}
              <rect x="178" y="78" width="12" height="46" rx="6" fill="#2B2D42" />
              <rect x="186" y="86" width="12" height="16" rx="4" fill="#FCBF49" stroke="#2B2D42" strokeWidth="2" />
              <circle cx="192" cy="94" r="3.5" fill="#FFFFFF" />

              {/* Cowcatcher / Front Grill */}
              <polygon points="180,126 206,140 180,140" fill="#D62828" stroke="#2B2D42" strokeWidth="2" strokeLinejoin="round" />

              {/* Chassis Base */}
              <rect x="32" y="122" width="154" height="12" rx="6" fill="#2B2D42" />

              {/* Wheels with brass centers */}
              <circle cx="60" cy="136" r="14" fill="#2B2D42" stroke="#FCBF49" strokeWidth="3" />
              <circle cx="60" cy="136" r="5" fill="#FCBF49" />

              <circle cx="112" cy="136" r="14" fill="#2B2D42" stroke="#FCBF49" strokeWidth="3" />
              <circle cx="112" cy="136" r="5" fill="#FCBF49" />

              <circle cx="160" cy="136" r="14" fill="#2B2D42" stroke="#FCBF49" strokeWidth="3" />
              <circle cx="160" cy="136" r="5" fill="#FCBF49" />

              {/* Connecting Wheel Rod */}
              <rect x="58" y="133.5" width="104" height="5" rx="2.5" fill="#D62828" stroke="#2B2D42" strokeWidth="1.5" />
            </svg>
          </div>
        </div>

        {/* Personalized Guest Welcome (If Available) */}
        {guestName && (
          <div className="mb-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-xs border border-white/25 text-white/95 text-xs">
            Spesial Mengundang:{' '}
            <span className="font-extrabold text-[#FFE3A8]">{guestName}</span>
          </div>
        )}

        {/* Child Hero Name */}
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.4)] [text-wrap:balance]">
          {childName}
        </h1>

        {/* Cheerful Short Catchphrase */}
        <p className="mt-2 text-sm sm:text-base font-extrabold text-[#FFE3A8] tracking-wide flex items-center justify-center gap-1.5 drop-shadow-sm">
          <span>🚂 Kereta Bahagia Segera Berangkat!</span>
        </p>

        <p className="text-xs text-white/80 max-w-[320px] mt-1 leading-relaxed">
          Mari naik dan ikuti petualangan istimewa Walimatul Khitan sang masinis cilik pemberani.
        </p>

        {/* Big Interactive "BUKA UNDANGAN" Button */}
        <div className="mt-6 w-full max-w-[280px]">
          <button
            type="button"
            onClick={handleOpenInvitation}
            disabled={isDeparting}
            className={`btn-hero-opening w-full min-h-[56px] px-6 py-3.5 rounded-full font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-90 transition-all ${
              !isDeparting ? 'animate-bounce' : 'scale-95'
            }`}
            aria-label="Buka Undangan Khitanan Faqih Al-Arif Billah"
          >
            <Ticket className="w-5 h-5 shrink-0 text-[#381E00]" />
            <span className="text-base text-[#381E00]">
              {isDeparting ? 'BERANGKAT! TUUT-TUUT!' : 'BUKA UNDANGAN'}
            </span>
          </button>

          <p className="text-[11px] text-white/70 mt-2.5 font-medium flex items-center justify-center gap-1.5">
            <Volume2 className="w-3.5 h-3.5 text-[#FCBF49]" />
            <span>Sentuh tombol untuk membunyikan peluit</span>
          </p>
        </div>
      </div>

      {/* Decorative Track at Foot of Opening */}
      <div className="w-full max-w-[430px] text-center pt-2 pb-1 relative z-10">
        <div className="flex items-center justify-center gap-2 text-[11px] font-bold text-white/60 tracking-widest uppercase">
          <span>Stasiun Kebahagiaan</span>
          <span>•</span>
          <span>Sabtu, 19 Des 2026</span>
        </div>
      </div>

      {/* ============================================================== */}
      {/* GRAND TRAIN CROSSING & BILLOWING SMOKE TRANSITION OVERLAY      */}
      {/* Activates when "BUKA UNDANGAN" is pressed                      */}
      {/* ============================================================== */}
      {isDeparting && (
        <div
          className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center overflow-hidden"
          aria-hidden="true"
        >
          {/* Vibrating track line across screen */}
          <div className="absolute inset-x-0 bottom-[28%] h-2.5 bg-[#2B2D42] border-y-2 border-[#FCBF49] shadow-2xl">
            <div
              className="absolute inset-x-0 -top-2 h-4 opacity-70"
              style={{
                backgroundImage:
                  'repeating-linear-gradient(90deg, #FCBF49 0 8px, transparent 8px 24px)',
              }}
            />
          </div>

          {/* Full-width Locomotive + Carriages Racing Across the Screen */}
          <div className="absolute bottom-[28%] left-0 w-[800px] h-48 animate-train-cross flex items-end">
            <svg
              viewBox="0 0 680 160"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-full h-full drop-shadow-[0_20px_35px_rgba(0,0,0,0.6)]"
            >
              {/* Giant Steam Clouds emerging from train stack */}
              <g className="animate-steam-rise">
                <circle cx="160" cy="30" r="22" fill="#FFFFFF" stroke="#4CC9F0" strokeWidth="2.5" />
                <circle cx="125" cy="18" r="28" fill="#FFFFFF" stroke="#4CC9F0" strokeWidth="2.5" />
                <circle cx="80" cy="10" r="34" fill="#FFFFFF" stroke="#4CC9F0" strokeWidth="2.5" />
                <circle cx="20" cy="8" r="38" fill="#FFFFFF" opacity="0.9" />
              </g>

              {/* LOCOMOTIVE (Front Head) */}
              <g transform="translate(140, 0)">
                {/* Cab */}
                <rect x="18" y="44" width="58" height="68" rx="8" fill="#D62828" stroke="#2B2D42" strokeWidth="3" />
                <rect x="28" y="54" width="36" height="28" rx="8" fill="#E4F6FF" stroke="#2B2D42" strokeWidth="2.5" />
                {/* Smiling Conductor Faqih */}
                <circle cx="46" cy="68" r="9" fill="#FFDEA9" />
                <path d="M37 62 Q46 54 55 62 Z" fill="#D62828" stroke="#2B2D42" strokeWidth="1.5" />
                <circle cx="43" cy="68" r="1.5" fill="#2B2D42" />
                <circle cx="49" cy="68" r="1.5" fill="#2B2D42" />
                <path d="M44 72 Q46 74 48 72" stroke="#2B2D42" strokeWidth="1.5" strokeLinecap="round" />

                {/* Boiler */}
                <rect x="76" y="52" width="112" height="60" rx="14" fill="#E63946" stroke="#2B2D42" strokeWidth="3" />
                <rect x="106" y="52" width="7" height="60" fill="#FCBF49" />
                <rect x="150" y="52" width="7" height="60" fill="#FCBF49" />

                {/* Dome */}
                <path d="M120 52 C120 36, 142 36, 142 52 Z" fill="#FCBF49" stroke="#2B2D42" strokeWidth="2.5" />

                {/* Stack */}
                <path d="M165 52 L160 26 L186 26 L181 52 Z" fill="#2B2D42" stroke="#2B2D42" strokeWidth="2.5" />
                <rect x="156" y="22" width="34" height="7" rx="3.5" fill="#FCBF49" stroke="#2B2D42" strokeWidth="2" />

                {/* Front Headlamp with radiant light */}
                <rect x="188" y="60" width="14" height="48" rx="6" fill="#2B2D42" />
                <rect x="198" y="70" width="14" height="18" rx="4" fill="#FCBF49" stroke="#2B2D42" strokeWidth="2.5" />
                <polygon points="212,68 340,30 340,130 212,90" fill="#FCBF49" fillOpacity="0.4" />

                {/* Cowcatcher */}
                <polygon points="190,112 224,128 190,128" fill="#D62828" stroke="#2B2D42" strokeWidth="2.5" />

                {/* Locomotive Wheels */}
                <g className="animate-wheel-spin">
                  <circle cx="48" cy="126" r="16" fill="#2B2D42" stroke="#FCBF49" strokeWidth="3.5" />
                  <circle cx="48" cy="126" r="5" fill="#FCBF49" />
                </g>
                <g className="animate-wheel-spin">
                  <circle cx="108" cy="126" r="16" fill="#2B2D42" stroke="#FCBF49" strokeWidth="3.5" />
                  <circle cx="108" cy="126" r="5" fill="#FCBF49" />
                </g>
                <g className="animate-wheel-spin">
                  <circle cx="166" cy="126" r="16" fill="#2B2D42" stroke="#FCBF49" strokeWidth="3.5" />
                  <circle cx="166" cy="126" r="5" fill="#FCBF49" />
                </g>
              </g>

              {/* PASSENGER CARRIAGE 01 (Behind Locomotive) */}
              <g transform="translate(0, 30)">
                <rect x="16" y="32" width="115" height="54" rx="8" fill="#FCBF49" stroke="#2B2D42" strokeWidth="3" />
                {/* Windows */}
                <rect x="28" y="42" width="22" height="20" rx="4" fill="#FFFFFF" stroke="#2B2D42" strokeWidth="2" />
                <rect x="60" y="42" width="22" height="20" rx="4" fill="#FFFFFF" stroke="#2B2D42" strokeWidth="2" />
                <rect x="92" y="42" width="22" height="20" rx="4" fill="#FFFFFF" stroke="#2B2D42" strokeWidth="2" />
                <text x="73" y="78" fill="#2B2D42" fontSize="9" fontWeight="900" textAnchor="middle">
                  GERBONG 01
                </text>
                {/* Carriage Wheels */}
                <circle cx="38" cy="96" r="13" fill="#2B2D42" stroke="#D62828" strokeWidth="3" />
                <circle cx="108" cy="96" r="13" fill="#2B2D42" stroke="#D62828" strokeWidth="3" />
              </g>

              {/* Coupling bar */}
              <line x1="128" y1="92" x2="142" y2="92" stroke="#2B2D42" strokeWidth="5" />
            </svg>
          </div>

          {/* Celebratory Billowing Cartoon Steam Cloud Curtain that gently covers screen */}
          <div className="absolute inset-0 flex items-center justify-center animate-smoke-billow pointer-events-none">
            <svg
              viewBox="0 0 500 500"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-full h-full scale-125 opacity-90"
            >
              <circle cx="250" cy="250" r="180" fill="#FFFFFF" />
              <circle cx="160" cy="210" r="140" fill="#FFFFFF" />
              <circle cx="340" cy="210" r="150" fill="#FFFFFF" />
              <circle cx="210" cy="330" r="150" fill="#FFFFFF" />
              <circle cx="310" cy="330" r="160" fill="#FFFFFF" />
              <circle cx="120" cy="300" r="120" fill="#E4F6FF" />
              <circle cx="390" cy="300" r="130" fill="#E4F6FF" />
            </svg>
          </div>
        </div>
      )}
    </div>
  );
};
