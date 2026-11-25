import React, { useState } from 'react';
import { Check, Copy, ExternalLink, MapPin, Pencil, RotateCcw, TrainFront } from 'lucide-react';
import { useInvitationData } from '../context/InvitationContext';

interface VenueAndRundownProps {
  onShowToast: (message: string) => void;
}

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

export const VenueAndRundown: React.FC<VenueAndRundownProps> = ({ onShowToast }) => {
  const { invitationInfo, rundownItems } = useInvitationData();
  const publishedRundown = rundownItems
    .filter((item) => item.is_published)
    .sort((a, b) => a.order_index - b.order_index);

  const [localEmbedUrl, setLocalEmbedUrl] = useState<string>(() => {
    if (typeof window === 'undefined') return DEFAULT_GOOGLE_MAP_EMBED_PLACEHOLDER;
    try {
      const saved = window.localStorage.getItem(MAP_STORAGE_KEY);
      return saved || DEFAULT_GOOGLE_MAP_EMBED_PLACEHOLDER;
    } catch {
      return DEFAULT_GOOGLE_MAP_EMBED_PLACEHOLDER;
    }
  });

  const effectiveEmbedUrl =
    invitationInfo.maps_embed_url || localEmbedUrl || DEFAULT_GOOGLE_MAP_EMBED_PLACEHOLDER;
  const effectiveAddress =
    invitationInfo.event_address ||
    'Lumé Coffee, Jl. KH Abdullah Syafei No.7, RT.6/RW.2, Manggarai Sel., Kec. Tebet, Kota Jakarta Selatan, DKI Jakarta 12860';
  const effectiveMapsUrl =
    invitationInfo.maps_url ||
    'https://www.google.com/maps/search/?api=1&query=Lume+Coffee+Jl+KH+Abdullah+Syafei+No+7+Tebet+Jakarta+Selatan+12860';
  const effectiveVenue = invitationInfo.event_venue || 'Lumé Coffee';

  const [isEditingMap, setIsEditingMap] = useState(false);
  const [mapInput, setMapInput] = useState('');

  const handleCopyAddress = async () => {
    try {
      await navigator.clipboard.writeText(effectiveAddress);
      onShowToast(`Alamat ${effectiveVenue} tersalin!`);
    } catch {
      onShowToast(`Alamat: ${effectiveAddress}`);
    }
  };

  const handleSaveEmbed = (e: React.FormEvent) => {
    e.preventDefault();
    const validSrc = extractGoogleMapsEmbedSrc(mapInput);
    if (!validSrc) {
      onShowToast('Tempel link embed atau kode <iframe> Google Maps yang valid.');
      return;
    }
    setLocalEmbedUrl(validSrc);
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
    setLocalEmbedUrl(DEFAULT_GOOGLE_MAP_EMBED_PLACEHOLDER);
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
            Rute Perjalanan Acara · {invitationInfo.event_day_date}
          </p>
        </div>
        <h2
          id="lokasi-heading"
          className="text-xl font-extrabold text-[#2B2D42] mb-4 [text-wrap:balance]"
        >
          Susunan Acara &amp; Jadwal Kereta
        </h2>

        {publishedRundown.length > 0 ? (
          <div className="space-y-3">
            {publishedRundown.map((item, index) => (
              <div key={item.id} className="flex items-start gap-3 relative">
                <div className="flex flex-col items-center shrink-0 pt-0.5">
                  <div className="w-8 h-8 rounded-full bg-[#D62828] text-white font-extrabold text-[11px] flex items-center justify-center border-2 border-[#FCBF49]">
                    {String(index + 1).padStart(2, '0')}
                  </div>
                  {index < publishedRundown.length - 1 && (
                    <div className="w-0.5 h-7 border-r-2 border-dashed border-[#E5BDB9] mt-1" />
                  )}
                </div>
                <div className="flex-1 min-w-0 pb-2 border-b border-[#E5BDB9]/40 last:border-b-0">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] font-bold text-[#005F76] tabular-nums">
                    <span>
                      {item.start_time}
                      {item.end_time ? `–${item.end_time}` : ''} WIB
                    </span>
                    {item.duration && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span className="text-[#7D5800]">{item.duration}</span>
                      </>
                    )}
                  </div>
                  <h3 className="text-sm font-extrabold text-[#2B2D42] leading-snug mt-0.5">
                    {item.activity_name}
                  </h3>
                  {item.description && (
                    <p className="text-xs text-[#5C403D] mt-0.5">{item.description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="rounded-2xl bg-[#FFF9F2] border border-[#FCBF49]/40 p-4 text-xs text-[#5C403D]">
            Susunan acara sedang disiapkan dan akan ditampilkan setelah dipublikasikan.
          </p>
        )}
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
            className="min-h-[36px] px-2.5 py-1 rounded-full bg-[#FFF9F2] border border-[#FCBF49]/50 text-[11px] font-bold text-[#5C403D] inline-flex items-center gap-1 hover:bg-[#FFDEA9]/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4CC9F0] cursor-pointer"
          >
            <Pencil className="w-3 h-3 text-[#D62828]" />
            <span>{isEditingMap ? 'Tutup' : 'Ganti Embed'}</span>
          </button>
        </div>

        <h3 className="text-lg font-extrabold text-[#2B2D42] mb-3">
          {effectiveVenue}
        </h3>

        {invitationInfo.venue_photo_url && (
          <div className="mb-3">
            <img
              src={invitationInfo.venue_photo_url}
              alt={`Foto lokasi ${effectiveVenue}`}
              className="w-full aspect-[16/10] object-cover rounded-2xl border-2 border-[#FCBF49]/45"
            />
            {invitationInfo.venue_description && (
              <p className="text-xs text-[#5C403D] mt-2 leading-relaxed">
                {invitationInfo.venue_description}
              </p>
            )}
          </div>
        )}

        {/* Google Maps Embed Frame */}
        <div className="w-full h-[220px] rounded-2xl overflow-hidden border-2 border-[#FCBF49]/45 bg-[#F4F2FF] relative">
          <iframe
            title={`Google Maps Lokasi ${effectiveVenue}`}
            src={effectiveEmbedUrl}
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
                className="min-h-[40px] px-3.5 rounded-full bg-[#D62828] text-white text-xs font-bold inline-flex items-center gap-1.5 hover:bg-[#E63946] cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Pasang Peta</span>
              </button>
              <button
                type="button"
                onClick={handleResetEmbed}
                className="min-h-[40px] px-3 rounded-full bg-white border border-[#E5BDB9] text-[#5C403D] text-xs font-bold inline-flex items-center gap-1 hover:bg-[#FFF1EF] cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            </div>
          </form>
        )}

        <p className="text-xs text-[#5C403D] mt-3 leading-relaxed">
          {effectiveAddress}
        </p>

        <div className="grid grid-cols-2 gap-2.5 mt-4">
          <a
            href={effectiveMapsUrl}
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
            className="min-h-[44px] px-3 py-2.5 rounded-full border border-[#2B2D42]/20 bg-[#FFF9F2] text-[#2B2D42] font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-[#FFDEA9]/40 active:scale-[0.98] transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4CC9F0] cursor-pointer"
          >
            <Copy className="w-3.5 h-3.5 shrink-0" />
            <span>Salin Alamat</span>
          </button>
        </div>
      </div>
    </section>
  );
};
