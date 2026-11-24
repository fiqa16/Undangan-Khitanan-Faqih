import React from 'react';

export const BuntingPennants: React.FC<{className?: string}> = ({className = ''}) => (
  <svg
    viewBox="0 0 430 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`w-full h-auto block ${className}`}
    aria-hidden="true"
  >
    <path
      d="M-5 6 Q 107 26, 215 10 Q 323 -4, 435 12"
      stroke="#2B2D42"
      strokeWidth="2.2"
      strokeLinecap="round"
      fill="none"
    />
    {/* Pennants */}
    <polygon points="18,10 46,13 30,39" fill="#D62828" />
    <polygon points="56,14 84,16 68,42" fill="#FCBF49" />
    <polygon points="94,16 122,16 108,43" fill="#4CC9F0" />
    <polygon points="132,16 160,15 147,42" fill="#D62828" />
    <polygon points="170,14 198,12 185,39" fill="#FCBF49" />
    <polygon points="208,11 236,9 223,36" fill="#4CC9F0" />
    <polygon points="246,8 274,7 261,34" fill="#D62828" />
    <polygon points="284,7 312,7 298,34" fill="#FCBF49" />
    <polygon points="322,7 350,9 335,36" fill="#4CC9F0" />
    <polygon points="360,9 388,11 372,38" fill="#D62828" />
    <polygon points="396,11 422,13 408,39" fill="#FCBF49" />
  </svg>
);

export const HeroSteamLocomotive: React.FC<{className?: string}> = ({className = ''}) => (
  <svg
    viewBox="0 0 320 156"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    role="img"
    aria-label="Ilustrasi kereta api uap merah ceria dengan kepulan awan putih dan bintang emas"
  >
    {/* Sky background clouds */}
    <path
      d="M36 52 C24 52 16 43 18 32 C20 22 30 16 40 19 C46 10 60 10 68 19 C78 18 87 26 86 37 C85 46 77 52 67 52 Z"
      fill="#E4F6FF"
    />
    <path
      d="M236 42 C226 42 219 35 221 26 C223 18 231 13 239 16 C244 8 256 8 263 16 C272 15 279 22 278 30 C277 38 270 42 262 42 Z"
      fill="#E4F6FF"
    />

    {/* Steam puffs from funnel */}
    <g className="animate-steam-rise">
      <circle cx="212" cy="40" r="10" fill="#FFFFFF" stroke="#4CC9F0" strokeWidth="1.5" />
      <circle cx="195" cy="28" r="13" fill="#FFFFFF" stroke="#4CC9F0" strokeWidth="1.5" />
      <circle cx="174" cy="20" r="15" fill="#FFFFFF" stroke="#4CC9F0" strokeWidth="1.5" />
    </g>

    {/* Golden stars */}
    <path
      d="M112 24 L115 31 L122 32 L117 37 L118 44 L112 40 L106 44 L107 37 L102 32 L109 31 Z"
      fill="#FCBF49"
    />
    <path
      d="M286 58 L288 63 L293 64 L289 67 L290 72 L286 69 L282 72 L283 67 L279 64 L284 63 Z"
      fill="#FCBF49"
    />

    {/* Railway Track */}
    <line x1="16" y1="142" x2="304" y2="142" stroke="#2B2D42" strokeWidth="4" strokeLinecap="round" />
    <g stroke="#906F6B" strokeWidth="4" strokeLinecap="round">
      <line x1="34" y1="145" x2="46" y2="145" />
      <line x1="66" y1="145" x2="78" y2="145" />
      <line x1="98" y1="145" x2="110" y2="145" />
      <line x1="130" y1="145" x2="142" y2="145" />
      <line x1="162" y1="145" x2="174" y2="145" />
      <line x1="194" y1="145" x2="206" y2="145" />
      <line x1="226" y1="145" x2="238" y2="145" />
      <line x1="258" y1="145" x2="270" y2="145" />
      <line x1="286" y1="145" x2="296" y2="145" />
    </g>

    {/* Train Group */}
    <g className="animate-gentle-bob">
      {/* Cab Roof */}
      <path d="M52 52 Q 82 42 112 52 L 108 60 L 56 60 Z" fill="#FCBF49" stroke="#2B2D42" strokeWidth="2.5" strokeLinejoin="round" />
      {/* Cab Body */}
      <rect x="58" y="60" width="50" height="58" rx="6" fill="#D62828" stroke="#2B2D42" strokeWidth="2.5" />
      {/* Cab Window */}
      <rect x="68" y="69" width="30" height="24" rx="8" fill="#E4F6FF" stroke="#2B2D42" strokeWidth="2.2" />
      {/* Smiling little conductor silhouette inside window */}
      <circle cx="83" cy="81" r="7" fill="#FFDEA9" />
      <path d="M76 77 Q83 72 90 77 Z" fill="#2B2D42" />
      <circle cx="80.5" cy="81.5" r="1" fill="#2B2D42" />
      <circle cx="85.5" cy="81.5" r="1" fill="#2B2D42" />
      <path d="M81 84 Q83 86 85 84" stroke="#2B2D42" strokeWidth="1.2" strokeLinecap="round" />

      {/* Boiler Body */}
      <rect x="108" y="68" width="124" height="50" rx="10" fill="#E63946" stroke="#2B2D42" strokeWidth="2.5" />
      {/* Boiler Gold Bands */}
      <rect x="136" y="68" width="6" height="50" fill="#FCBF49" />
      <rect x="186" y="68" width="6" height="50" fill="#FCBF49" />

      {/* Brass Steam Dome & Bell */}
      <path d="M148 68 C148 54, 174 54, 174 68 Z" fill="#FCBF49" stroke="#2B2D42" strokeWidth="2.3" />
      <circle cx="161" cy="54" r="3.5" fill="#FCBF49" stroke="#2B2D42" strokeWidth="2" />

      {/* Smoke Stack Funnel */}
      <path d="M202 68 L197 46 L225 46 L220 68 Z" fill="#2B2D42" stroke="#2B2D42" strokeWidth="2" strokeLinejoin="round" />
      <rect x="194" y="42" width="34" height="7" rx="3.5" fill="#FCBF49" stroke="#2B2D42" strokeWidth="2" />

      {/* Front Smokebox & Headlamp */}
      <rect x="232" y="71" width="14" height="44" rx="6" fill="#2B2D42" />
      <rect x="242" y="76" width="10" height="14" rx="3" fill="#FCBF49" stroke="#2B2D42" strokeWidth="2" />
      {/* Warm light beam */}
      <polygon points="252,78 288,68 288,98 252,88" fill="#FCBF49" fillOpacity="0.25" />

      {/* Cowcatcher */}
      <polygon points="234,118 264,132 234,132" fill="#D62828" stroke="#2B2D42" strokeWidth="2.5" strokeLinejoin="round" />

      {/* Chassis Frame */}
      <rect x="52" y="114" width="192" height="11" rx="5.5" fill="#2B2D42" />

      {/* Wheels */}
      <g>
        {/* Big Rear Drive Wheel */}
        <circle cx="84" cy="126" r="15" fill="#2B2D42" stroke="#FCBF49" strokeWidth="3" />
        <circle cx="84" cy="126" r="5" fill="#FCBF49" />
        {/* Mid Wheel */}
        <circle cx="144" cy="128" r="13" fill="#2B2D42" stroke="#FCBF49" strokeWidth="3" />
        <circle cx="144" cy="128" r="4.5" fill="#FCBF49" />
        {/* Front Wheel */}
        <circle cx="204" cy="128" r="13" fill="#2B2D42" stroke="#FCBF49" strokeWidth="3" />
        <circle cx="204" cy="128" r="4.5" fill="#FCBF49" />
        {/* Connecting Rod */}
        <rect x="82" y="123.5" width="124" height="5" rx="2.5" fill="#D62828" stroke="#2B2D42" strokeWidth="1.5" />
      </g>
    </g>
  </svg>
);

export const TrackDivider: React.FC = () => (
  <div className="relative w-full py-5 overflow-hidden select-none" aria-hidden="true">
    {/* Sleeper track line */}
    <div className="w-full h-0.5 bg-[#906F6B]/30 relative">
      <div
        className="absolute inset-x-0 -top-1 h-2.5 opacity-45"
        style={{
          backgroundImage: 'repeating-linear-gradient(90deg, #906F6B 0 6px, transparent 6px 18px)',
        }}
      />
    </div>
    {/* Chugging mini train */}
    <div className="animate-train-chug absolute top-0 left-0 w-16 h-8 pointer-events-none">
      <svg viewBox="0 0 80 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <circle cx="52" cy="8" r="4" fill="#FFFFFF" stroke="#4CC9F0" strokeWidth="1.2" />
        <circle cx="43" cy="5" r="5" fill="#FFFFFF" stroke="#4CC9F0" strokeWidth="1.2" />
        <rect x="10" y="14" width="18" height="18" rx="3" fill="#D62828" stroke="#2B2D42" strokeWidth="1.8" />
        <rect x="13" y="17" width="10" height="7" rx="2" fill="#E4F6FF" />
        <rect x="28" y="17" width="32" height="15" rx="4" fill="#E63946" stroke="#2B2D42" strokeWidth="1.8" />
        <rect x="50" y="9" width="7" height="9" rx="2" fill="#2B2D42" />
        <polygon points="60,25 70,32 60,32" fill="#FCBF49" stroke="#2B2D42" strokeWidth="1.5" />
        <circle cx="19" cy="34" r="4.5" fill="#2B2D42" stroke="#FCBF49" strokeWidth="1.5" />
        <circle cx="36" cy="34" r="4.5" fill="#2B2D42" stroke="#FCBF49" strokeWidth="1.5" />
        <circle cx="52" cy="34" r="4.5" fill="#2B2D42" stroke="#FCBF49" strokeWidth="1.5" />
      </svg>
    </div>
  </div>
);

export const CarriageSceneIllustration: React.FC<{variant: 1 | 2 | 3 | 4 | 5 | 6}> = ({
  variant,
}) => {
  // 1. Childhood / Masa Kecil Faqih
  if (variant === 1) {
    return (
      <svg viewBox="0 0 180 150" fill="none" className="w-full h-full">
        <rect width="180" height="150" fill="#E4F6FF" />
        <circle cx="36" cy="34" r="14" fill="#FCBF49" opacity="0.85" />
        <path d="M0 116 Q45 102 90 114 T180 110 L180 150 L0 150 Z" fill="#FFE6B3" />
        {/* Toddler Faqih with cute red conductor cap & overalls */}
        <circle cx="90" cy="64" r="21" fill="#FCD5B5" stroke="#2B2D42" strokeWidth="2.2" />
        <path d="M72 56 Q90 42 108 56 Z" fill="#D62828" stroke="#2B2D42" strokeWidth="2" />
        <rect x="70" y="54" width="40" height="5" rx="2.5" fill="#FCBF49" stroke="#2B2D42" strokeWidth="1.8" />
        <circle cx="83" cy="65" r="2.2" fill="#2B2D42" />
        <circle cx="97" cy="65" r="2.2" fill="#2B2D42" />
        <path d="M84 72 Q90 77 96 72" stroke="#2B2D42" strokeWidth="2" strokeLinecap="round" />
        <rect x="70" y="85" width="40" height="36" rx="12" fill="#4CC9F0" stroke="#2B2D42" strokeWidth="2.2" />
        <circle cx="90" cy="100" r="6" fill="#FCBF49" />
      </svg>
    );
  }
  // 2. Faqih Tampil Marching Band TK
  if (variant === 2) {
    return (
      <svg viewBox="0 0 180 150" fill="none" className="w-full h-full">
        <rect width="180" height="150" fill="#FFF1EF" />
        {/* Musical notes */}
        <path d="M32 40 L32 24 L42 22 L42 36" stroke="#D62828" strokeWidth="2.2" strokeLinecap="round" />
        <circle cx="29" cy="40" r="3.5" fill="#D62828" />
        <circle cx="39" cy="36" r="3.5" fill="#D62828" />
        <path d="M142 46 L142 30 L152 28 L152 42" stroke="#007995" strokeWidth="2.2" strokeLinecap="round" />
        <circle cx="139" cy="46" r="3.5" fill="#007995" />
        <circle cx="149" cy="42" r="3.5" fill="#007995" />
        <path d="M0 120 L180 120 L180 150 L0 150 Z" fill="#FFDEA9" />
        {/* Shako marching band hat */}
        <rect x="74" y="21" width="32" height="22" rx="4" fill="#D62828" stroke="#2B2D42" strokeWidth="2" />
        <circle cx="90" cy="17" r="5.5" fill="#FCBF49" stroke="#2B2D42" strokeWidth="1.8" />
        <rect x="71" y="40" width="38" height="4.5" rx="2" fill="#FCBF49" stroke="#2B2D42" strokeWidth="1.5" />
        {/* Face */}
        <circle cx="90" cy="58" r="17" fill="#FCD5B5" stroke="#2B2D42" strokeWidth="2.2" />
        <circle cx="84" cy="58" r="2" fill="#2B2D42" />
        <circle cx="96" cy="58" r="2" fill="#2B2D42" />
        <path d="M85 65 Q90 69 95 65" stroke="#2B2D42" strokeWidth="2" strokeLinecap="round" />
        {/* Marching tunic */}
        <rect x="66" y="75" width="48" height="44" rx="10" fill="#D62828" stroke="#2B2D42" strokeWidth="2.2" />
        <line x1="76" y1="84" x2="104" y2="84" stroke="#FCBF49" strokeWidth="3" strokeLinecap="round" />
        <line x1="76" y1="92" x2="104" y2="92" stroke="#FCBF49" strokeWidth="3" strokeLinecap="round" />
        {/* Snare Drum */}
        <rect x="63" y="96" width="54" height="24" rx="5" fill="#FFFFFF" stroke="#2B2D42" strokeWidth="2.2" />
        <rect x="63" y="96" width="54" height="5" fill="#FCBF49" stroke="#2B2D42" strokeWidth="1.5" />
        <path d="M68 101 L78 120 L88 101 L98 120 L108 101" stroke="#D62828" strokeWidth="2" strokeLinejoin="round" />
        {/* Drumsticks */}
        <line x1="56" y1="84" x2="80" y2="98" stroke="#7D5800" strokeWidth="3" strokeLinecap="round" />
        <line x1="124" y1="84" x2="100" y2="98" stroke="#7D5800" strokeWidth="3" strokeLinecap="round" />
      </svg>
    );
  }
  // 3. Faqih Wisuda TK
  if (variant === 3) {
    return (
      <svg viewBox="0 0 180 150" fill="none" className="w-full h-full">
        <rect width="180" height="150" fill="#F4F2FF" />
        <path d="M26 32 L29 38 L35 39 L30 43 L31 49 L26 46 L21 49 L22 43 L17 39 L23 38 Z" fill="#FCBF49" />
        <path d="M150 28 L153 34 L159 35 L154 39 L155 45 L150 42 L145 45 L146 39 L141 35 L147 34 Z" fill="#FCBF49" />
        {/* Mortarboard Graduation Cap */}
        <polygon points="90,20 124,32 90,44 56,32" fill="#2B2D42" stroke="#2B2D42" strokeWidth="2" strokeLinejoin="round" />
        <rect x="74" y="37" width="32" height="10" rx="2" fill="#2B2D42" />
        <path d="M118 33 L118 52" stroke="#FCBF49" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="118" cy="54" r="3" fill="#FCBF49" />
        {/* Face */}
        <circle cx="90" cy="61" r="18" fill="#FCD5B5" stroke="#2B2D42" strokeWidth="2.2" />
        <circle cx="84" cy="61" r="2" fill="#2B2D42" />
        <circle cx="96" cy="61" r="2" fill="#2B2D42" />
        <path d="M84 68 Q90 73 96 68" stroke="#2B2D42" strokeWidth="2" strokeLinecap="round" />
        {/* Graduation Gown & Gold Sash */}
        <rect x="64" y="80" width="52" height="48" rx="12" fill="#2B2D42" stroke="#2B2D42" strokeWidth="2.2" />
        <path d="M76 80 L90 105 L104 80" fill="#FCBF49" />
        {/* Diploma Scroll */}
        <rect x="67" y="103" width="46" height="14" rx="7" fill="#FFFFFF" stroke="#2B2D42" strokeWidth="2" />
        <rect x="86" y="102" width="8" height="16" rx="2" fill="#D62828" />
      </svg>
    );
  }
  // 4. Faqih Belajar di Sekolah
  if (variant === 4) {
    return (
      <svg viewBox="0 0 180 150" fill="none" className="w-full h-full">
        <rect width="180" height="150" fill="#FFF9F2" />
        {/* Classroom chalkboard */}
        <rect x="20" y="16" width="140" height="58" rx="8" fill="#005F76" stroke="#7D5800" strokeWidth="3" />
        <text x="90" y="42" textAnchor="middle" fill="#FFFFFF" fontSize="12" fontWeight="800">
          A B C · 1 2 3
        </text>
        <path d="M52 56 L128 56" stroke="#FCBF49" strokeWidth="2" strokeDasharray="4 4" />
        {/* Faqih studying */}
        <circle cx="90" cy="70" r="17" fill="#FCD5B5" stroke="#2B2D42" strokeWidth="2.2" />
        <path d="M75 63 Q90 50 105 63 Z" fill="#2B2D42" />
        <circle cx="84" cy="71" r="2" fill="#2B2D42" />
        <circle cx="96" cy="71" r="2" fill="#2B2D42" />
        <path d="M85 77 Q90 81 95 77" stroke="#2B2D42" strokeWidth="2" strokeLinecap="round" />
        {/* White & Red Indonesian Elementary Uniform */}
        <rect x="66" y="88" width="48" height="32" rx="10" fill="#FFFFFF" stroke="#2B2D42" strokeWidth="2.2" />
        <rect x="66" y="108" width="48" height="12" fill="#D62828" />
        {/* Wooden desk & open notebook */}
        <rect x="34" y="114" width="112" height="24" rx="5" fill="#FCBF49" stroke="#2B2D42" strokeWidth="2.2" />
        <path d="M62 110 L90 105 L118 110 L118 124 L90 119 L62 124 Z" fill="#FFFFFF" stroke="#2B2D42" strokeWidth="2" />
        <line x1="90" y1="105" x2="90" y2="119" stroke="#2B2D42" strokeWidth="1.8" />
      </svg>
    );
  }
  // 5. Faqih Sama Favoritnya (Mainan Kereta & Bola Favorit)
  if (variant === 5) {
    return (
      <svg viewBox="0 0 180 150" fill="none" className="w-full h-full">
        <rect width="180" height="150" fill="#FFF2DA" />
        <circle cx="144" cy="30" r="12" fill="#4CC9F0" opacity="0.45" />
        <path d="M0 118 L180 118 L180 150 L0 150 Z" fill="#E6E6FF" />
        {/* Favorite Red Toy Train */}
        <rect x="44" y="92" width="32" height="22" rx="4" fill="#D62828" stroke="#2B2D42" strokeWidth="2" />
        <rect x="76" y="97" width="46" height="17" rx="4" fill="#FCBF49" stroke="#2B2D42" strokeWidth="2" />
        <rect x="108" y="85" width="10" height="12" rx="2" fill="#2B2D42" />
        <circle cx="56" cy="116" r="6" fill="#2B2D42" stroke="#FFFFFF" strokeWidth="2" />
        <circle cx="88" cy="116" r="6" fill="#2B2D42" stroke="#FFFFFF" strokeWidth="2" />
        <circle cx="112" cy="116" r="6" fill="#2B2D42" stroke="#FFFFFF" strokeWidth="2" />
        {/* Happy Faqih */}
        <circle cx="90" cy="48" r="18" fill="#FCD5B5" stroke="#2B2D42" strokeWidth="2" />
        <path d="M74 42 Q90 29 106 42 Z" fill="#2B2D42" />
        <circle cx="84" cy="49" r="2" fill="#2B2D42" />
        <circle cx="96" cy="49" r="2" fill="#2B2D42" />
        <path d="M85 55 Q90 60 95 55" stroke="#2B2D42" strokeWidth="2" strokeLinecap="round" />
        <path d="M68 68 Q90 64 112 68 L108 90 L72 90 Z" fill="#D62828" stroke="#2B2D42" strokeWidth="2" />
      </svg>
    );
  }
  // 6. Faqih & Keluarganya (Ayah Dede Nurjaya, Ibu Ruslinawati & Faqih)
  return (
    <svg viewBox="0 0 180 150" fill="none" className="w-full h-full">
      <rect width="180" height="150" fill="#FFF1EF" />
      <path d="M90 18 L94 26 L102 27 L96 33 L97 41 L90 37 L83 41 L84 33 L78 27 L86 26 Z" fill="#FCBF49" />
      {/* Ayah (Left) */}
      <circle cx="48" cy="58" r="15" fill="#FCD5B5" stroke="#2B2D42" strokeWidth="2" />
      <rect x="35" y="38" width="26" height="11" rx="3" fill="#2B2D42" />
      <rect x="28" y="75" width="40" height="55" rx="12" fill="#005F76" stroke="#2B2D42" strokeWidth="2" />
      <circle cx="43" cy="58" r="1.8" fill="#2B2D42" />
      <circle cx="53" cy="58" r="1.8" fill="#2B2D42" />
      <path d="M44 64 Q48 67 52 64" stroke="#2B2D42" strokeWidth="1.6" strokeLinecap="round" />

      {/* Ibu (Right) */}
      <circle cx="132" cy="58" r="16" fill="#FCBF49" stroke="#2B2D42" strokeWidth="2" />
      <circle cx="132" cy="60" r="12" fill="#FCD5B5" />
      <path d="M112 76 Q132 70 152 76 L154 130 L110 130 Z" fill="#E63946" stroke="#2B2D42" strokeWidth="2" />
      <circle cx="128" cy="60" r="1.7" fill="#2B2D42" />
      <circle cx="136" cy="60" r="1.7" fill="#2B2D42" />
      <path d="M129 65 Q132 68 135 65" stroke="#2B2D42" strokeWidth="1.6" strokeLinecap="round" />

      {/* Faqih (Center Hero) */}
      <circle cx="90" cy="70" r="16" fill="#FCD5B5" stroke="#2B2D42" strokeWidth="2.2" />
      <rect x="76" y="50" width="28" height="11" rx="3" fill="#2B2D42" />
      <rect x="76" y="58" width="28" height="3" fill="#FCBF49" />
      <circle cx="85" cy="70" r="1.8" fill="#2B2D42" />
      <circle cx="95" cy="70" r="1.8" fill="#2B2D42" />
      <path d="M86 76 Q90 80 94 76" stroke="#2B2D42" strokeWidth="1.8" strokeLinecap="round" />
      <rect x="70" y="88" width="40" height="44" rx="11" fill="#D62828" stroke="#2B2D42" strokeWidth="2.2" />
      <rect x="85" y="88" width="10" height="44" fill="#FCBF49" />
    </svg>
  );
};

export const VenueStationMap: React.FC = () => (
  <svg
    viewBox="0 0 360 164"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="w-full h-auto rounded-2xl border border-[#FCBF49]/35"
    role="img"
    aria-label="Peta ilustrasi jalur menuju Lumé Coffee, Jl. KH Abdullah Syafei No.7, Tebet, Jakarta Selatan"
  >
    <rect width="360" height="164" fill="#F4F2FF" />
    {/* Park & Green zones */}
    <rect x="18" y="18" width="96" height="52" rx="12" fill="#E4F6FF" />
    <rect x="242" y="96" width="98" height="48" rx="12" fill="#FFF2DA" />

    {/* Main Roads */}
    <path d="M0 108 Q130 108 180 86 T360 72" stroke="#FFFFFF" strokeWidth="18" />
    <path d="M0 108 Q130 108 180 86 T360 72" stroke="#E0E0FC" strokeWidth="2" strokeDasharray="6 6" />
    <path d="M138 0 L138 164" stroke="#FFFFFF" strokeWidth="14" />

    {/* Railway line */}
    <path d="M0 44 L360 44" stroke="#906F6B" strokeWidth="3" strokeDasharray="8 6" />
    <rect x="24" y="28" width="84" height="22" rx="6" fill="#2B2D42" />
    <text x="66" y="42" textAnchor="middle" fill="#FCBF49" fontSize="9" fontWeight="700">
      St. Tebet
    </text>

    {/* Street Labels */}
    <text x="20" y="126" fill="#5C403D" fontSize="9" fontWeight="700">
      Jl. KH Abdullah Syafei No.7
    </text>
    <text x="291" y="124" textAnchor="middle" fill="#7D5800" fontSize="9" fontWeight="700">
      Manggarai Sel · Tebet
    </text>

    {/* Destination Pin */}
    <g transform="translate(202, 52)">
      <ellipse cx="18" cy="46" rx="14" ry="4" fill="#2B2D42" fillOpacity="0.18" />
      <path
        d="M18 0 C8 0 0 8 0 18 C0 31 18 46 18 46 C18 46 36 31 36 18 C36 8 28 0 18 0 Z"
        fill="#D62828"
        stroke="#FFFFFF"
        strokeWidth="2.5"
      />
      <circle cx="18" cy="18" r="7" fill="#FCBF49" />
    </g>
    <rect x="162" y="16" width="116" height="24" rx="8" fill="#FFFFFF" stroke="#D62828" strokeWidth="1.5" />
    <text x="220" y="31" textAnchor="middle" fill="#2B2D42" fontSize="10" fontWeight="800">
      Lumé Coffee Tebet
    </text>
  </svg>
);

export const QrisMatrixGraphic: React.FC = () => {
  // Deterministic 15x15 QR pattern matrix
  const pattern = [
    '111110101011111',
    '100010011010001',
    '101010110010101',
    '100010101010001',
    '111110111011111',
    '000000100000000',
    '101101101101101',
    '011010010110010',
    '110101111010111',
    '000000101001010',
    '111110110110101',
    '100010001011011',
    '101010111010101',
    '100010100011001',
    '111110101101111',
  ];

  return (
    <svg
      viewBox="0 0 170 170"
      className="w-44 h-44 mx-auto"
      role="img"
      aria-label="Kode QRIS Amplop Digital Walimatul Khitan"
    >
      <rect width="170" height="170" rx="14" fill="#FFFFFF" />
      <g transform="translate(10, 10)">
        {pattern.map((row, r) =>
          row.split('').map((cell, c) =>
            cell === '1' ? (
              <rect
                key={`${r}-${c}`}
                x={c * 10}
                y={r * 10}
                width="9"
                height="9"
                rx="2"
                fill={(r < 5 && c < 5) || (r < 5 && c > 9) || (r > 9 && c < 5) ? '#D62828' : '#2B2D42'}
              />
            ) : null
          )
        )}
        {/* Center emblem */}
        <rect x="61" y="61" width="28" height="28" rx="6" fill="#FFFFFF" stroke="#FCBF49" strokeWidth="2" />
        <text x="75" y="79" textAnchor="middle" fill="#D62828" fontSize="9" fontWeight="800">
          QRIS
        </text>
      </g>
    </svg>
  );
};
