import React, {useState} from 'react';
import {Check, Copy, ExternalLink, MapPin, Pencil, RotateCcw, TrainFront} from 'lucide-react';

interface VenueAndRundownProps {
  onShowToast: (message: string) => void;
}

const VENUE_ADDRESS =
  'Lumé Coffee, Jl. KH Abdullah Syafei No.7, RT.6/RW.2, Manggarai Sel., Kec. Tebet, Kota Jakarta Selatan, DKI Jakarta 12860';
const MAPS_URL =
  'https://www.google.com/maps/search/?api=1&query=Lume+Coffee+Jl+KH+Abdullah+Syafei+No+7+Tebet+Jakarta+Selatan+12860';

/**
 * PLACEHOLDER EMBED GOOGLE MAPS:
 * Ganti URL di bawah ini dengan link `src` dari Google Maps -> Bagikan -> Sematkan peta (Embed a map)
 * Contoh: "https://www.google.com/maps/embed?pb=!1m18!..."
 */
const DEFAULT_GOOGLE_MAP_EMBED_PLACEHOLDER =
  'https://maps.google.com/maps?q=Lume%20Coffee%20Jl.%20KH%20Abdullah%20Syafei%20No.7%20Tebet%20Jakarta%20Selatan&t=&z=16&ie=UTF8&iwloc=&output=embed';

const MAP_STORAGE_KEY = 'choo_choo_khitan_map_embed_v1';

function extractGoogleMapsEmbedSrc(rawInput: string): string | null {
  const trimmed = rawInput.trim();
  if (!trimmed) return null;

  // Support pasting full <iframe src="..."></iframe> snippet from Google Maps
  const iframeSrcMatch = trimmed.match(/src=["']([^"']+)["']/i);
  const candidate = iframeSrcMatch ? iframeSrcMatch[1].trim() : trimmed;

  try {
    const parsed = new URL(candidate);
    const isGoogleMapsHost =
      parsed.protocol === 'https:' &&
      (parsed.hostname === 'www.google.com' ||
        parsed.hostname === 'google.com' ||
        parsed.hostname === 'maps.google.com');
    if (!isGoogleMapsHost) return null;
    return parsed.toString();
  } catch {
    return null;
  }
}

const SCHEDULE_STOPS = [
  {
    stop: '01',
    time: '18.00–19.00',
    duration: '1 jam',
    title: 'Kedatangan tamu undangan',
    note: 'Keluarga Besar',
  },
  {
    stop: '02',
    time: '19.00–19.05',
    duration: '5 menit',
    title: 'Pembukaan oleh MC',
    note: 'MC',
  },
  {
    stop: '03',
    time: '19.05–19.20',
    duration: '15 menit',
    title: "Pembacaan ayat suci Al-Qur'an",
    note: 'Ua Hafsah',
  },
  {
    stop: '04',
    time: '19.20–19.40',
    duration: '20 menit',
    title: 'Sambutan dari orang tua',
    note: 'Orang Tua',
  },
  {
    stop: '05',
    time: '19.40–20.00',
    duration: '20 menit',
    title: 'Tausiyah singkat',
    note: 'Pak Ustad Ridwan',
  },
  {
    stop: '06',
    time: '20.00–20.15',
    duration: '15 menit',
    title: 'Doa bersama',
    note: 'Pak Ustad Ridwan / Kakek',
  },
  {
    stop: '07',
    time: '20.15–20.45',
    duration: '30 menit',
    title: 'Penyampaian ucapan dan nasihat untuk anak yang dikhitan',
    note: 'Nenek/Kakek, Om/Tante, dan keluarga lainnya',
  },
  {
    stop: '08',
    time: '20.45–20.55',
    duration: '10 menit',
    title: 'Foto bersama keluarga',
    note: 'Keluarga Besar',
  },
  {
    stop: '09',
    time: '20.55–21.55',
    duration: '60 menit',
    title: 'Makan bersama',
    note: 'Keluarga Besar',
  },
  {
    stop: '10',
    time: '21.55–23.55',
    duration: '60 menit',
    title: 'Karaoke dan Fun Time',
    note: 'Keluarga Besar',
  },
  {
    stop: '11',
    time: '23.55–00.00',
    duration: '5 menit',
    title: 'Penutupan',
    note: 'Orang Tua',
  },
];

export const VenueAndRundown: React.FC<VenueAndRundownProps> = ({onShowToast}) => {
  const [embedUrl, setEmbedUrl] = useState<string>(() => {
    if (typeof window === 'undefined') return DEFAULT_GOOGLE_MAP_EMBED_PLACEHOLDER;
    try {
      const saved = window.localStorage.getItem(MAP_STORAGE_KEY);
      return saved || DEFAULT_GOOGLE_MAP_EMBED_PLACEHOLDER;
    } catch {
      return DEFAULT_GOOGLE_MAP_EMBED_PLACEHOLDER;
    }
  });
  const [isEditingMap, setIsEditingMap] = useState(false);
  const [mapInput, setMapInput] = useState('');

  const handleCopyAddress = async () => {
    try {
      await navigator.clipboard.writeText(VENUE_ADDRESS);
      onShowToast('Alamat Lumé Coffee tersalin!');
    } catch {
      onShowToast('Alamat: Jl. KH Abdullah Syafei No.7, Tebet');
    }
  };

  const handleSaveEmbed = (e: React.FormEvent) => {
    e.preventDefault();
    const validSrc = extractGoogleMapsEmbedSrc(mapInput);
    if (!validSrc) {
      onShowToast('Tempel link embed atau kode <iframe> Google Maps yang valid.');
      return;
    }
    setEmbedUrl(validSrc);
    try {
      window.localStorage.setItem(MAP_STORAGE_KEY, validSrc);
    } catch {
      // Ignore storage errors
    }
    setIsEditingMap(false);
    setMapInput('');
    onShowToast('Embed Google Maps berhasil diperbarui!');
  };

  const handleResetEmbed = () => {
    setEmbedUrl(DEFAULT_GOOGLE_MAP_EMBED_PLACEHOLDER);
    try {
      window.localStorage.removeItem(MAP_STORAGE_KEY);
    } catch {
      // Ignore storage errors
    }
    setIsEditingMap(false);
    setMapInput('');
    onShowToast('Peta dikembalikan ke placeholder bawaan.');
  };

  return (
    <section id="lokasi" aria-labelledby="lokasi-heading" className="px-1 space-y-5">
      {/* Rundown Card */}
      <div className="card-storybook rounded-3xl p-5">
        <div className="flex items-center gap-2 mb-1">
          <TrainFront className="w-4 h-4 text-[#D62828]" />
          <p className="text-[11px] font-bold tracking-[0.06em] uppercase text-[#7D5800]">
            Rute Perjalanan Acara · Sabtu, 19 Des 2026
          </p>
        </div>
        <h2
          id="lokasi-heading"
          className="text-xl font-extrabold text-[#2B2D42] mb-4 [text-wrap:balance]"
        >
          Susunan Acara &amp; Jadwal Kereta
        </h2>

        <div className="space-y-3">
          {SCHEDULE_STOPS.map((item, index) => (
            <div key={item.stop} className="flex items-start gap-3 relative">
              <div className="flex flex-col items-center shrink-0 pt-0.5">
                <div className="w-8 h-8 rounded-full bg-[#D62828] text-white font-extrabold text-[11px] flex items-center justify-center border-2 border-[#FCBF49]">
                  {item.stop}
                </div>
                {index < SCHEDULE_STOPS.length - 1 && (
                  <div className="w-0.5 h-7 border-r-2 border-dashed border-[#E5BDB9] mt-1" />
                )}
              </div>
              <div className="flex-1 min-w-0 pb-2 border-b border-[#E5BDB9]/40 last:border-b-0">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] font-bold text-[#005F76] tabular-nums">
                  <span>{item.time} WIB</span>
                  <span aria-hidden="true">·</span>
                  <span className="text-[#7D5800]">{item.duration}</span>
                </div>
                <h3 className="text-sm font-extrabold text-[#2B2D42] leading-snug mt-0.5">
                  {item.title}
                </h3>
                <p className="text-xs text-[#5C403D] mt-0.5">{item.note}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Venue & Google Maps Embed Card */}
      <div className="card-storybook rounded-3xl p-5">
        <div className="flex items-center justify-between gap-2 mb-1">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-[#D62828]" />
            <p className="text-[11px] font-bold tracking-[0.06em] uppercase text-[#7D5800]">
              Peta Stasiun Utama
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsEditingMap((v) => !v)}
            className="min-h-[36px] px-2.5 py-1 rounded-full bg-[#FFF9F2] border border-[#FCBF49]/50 text-[11px] font-bold text-[#5C403D] inline-flex items-center gap-1 hover:bg-[#FFDEA9]/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4CC9F0]"
          >
            <Pencil className="w-3 h-3 text-[#D62828]" />
            <span>{isEditingMap ? 'Tutup' : 'Ganti Embed'}</span>
          </button>
        </div>

        <h3 className="text-lg font-extrabold text-[#2B2D42] mb-3">
          Lumé Coffee · Tebet
        </h3>

        {/* Google Maps Embed Frame */}
        <div className="w-full h-[220px] rounded-2xl overflow-hidden border-2 border-[#FCBF49]/45 bg-[#F4F2FF] relative">
          <iframe
            title="Google Maps Lokasi Lumé Coffee Tebet Jakarta Selatan"
            src={embedUrl}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
            className="w-full h-full border-0"
          />
        </div>

        {/* Optional Placeholder Editor for Swapping Real Google Maps Embed */}
        {isEditingMap && (
          <form
            onSubmit={handleSaveEmbed}
            className="mt-3 p-3.5 rounded-2xl bg-[#FFF9F2] border border-[#FCBF49]/50 space-y-2.5"
          >
            <label
              htmlFor="gmaps-embed-input"
              className="block text-[11px] font-bold text-[#2B2D42]"
            >
              Placeholder Link Embed Google Maps (URL / kode &lt;iframe&gt;)
            </label>
            <input
              id="gmaps-embed-input"
              type="text"
              value={mapInput}
              onChange={(e) => setMapInput(e.target.value)}
              placeholder="https://www.google.com/maps/embed?pb=... atau <iframe>"
              className="w-full min-h-[44px] px-3 rounded-xl bg-white border border-[#E5BDB9] text-xs text-[#2B2D42] placeholder:text-[#906F6B]/80 focus:outline-none focus:ring-2 focus:ring-[#4CC9F0]"
            />
            <div className="flex items-center gap-2">
              <button
                type="submit"
                className="min-h-[40px] px-3.5 rounded-full bg-[#D62828] text-white text-xs font-bold inline-flex items-center gap-1.5 hover:bg-[#E63946]"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Pasang Peta</span>
              </button>
              <button
                type="button"
                onClick={handleResetEmbed}
                className="min-h-[40px] px-3 rounded-full bg-white border border-[#E5BDB9] text-[#5C403D] text-xs font-bold inline-flex items-center gap-1 hover:bg-[#FFF1EF]"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            </div>
          </form>
        )}

        <p className="text-xs text-[#5C403D] mt-3 leading-relaxed">
          Jl. KH Abdullah Syafei No.7, RT.6/RW.2, Manggarai Sel., Kec. Tebet, Kota Jakarta
          Selatan, DKI Jakarta 12860.
        </p>

        <div className="grid grid-cols-2 gap-2.5 mt-4">
          <a
            href={MAPS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-tactile-red min-h-[44px] px-3 py-2.5 rounded-full font-bold text-xs flex items-center justify-center gap-1.5 whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4CC9F0]"
          >
            <ExternalLink className="w-3.5 h-3.5 shrink-0" />
            <span>Buka Peta</span>
          </a>

          <button
            type="button"
            onClick={handleCopyAddress}
            className="min-h-[44px] px-3 py-2.5 rounded-full border border-[#2B2D42]/20 bg-[#FFF9F2] text-[#2B2D42] font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-[#FFDEA9]/40 active:scale-[0.98] transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4CC9F0]"
          >
            <Copy className="w-3.5 h-3.5 shrink-0" />
            <span>Salin Alamat</span>
          </button>
        </div>
      </div>
    </section>
  );
};
