import React, { useRef, useState } from 'react';
import { CalendarPlus, Camera, MapPin, RotateCcw, Ticket, Volume2 } from 'lucide-react';
import { BuntingPennants, HeroSteamLocomotive } from './StorybookIllustrations';
import { downloadCalendarInvite } from '../utils/calendar';
import { useInvitationData } from '../context/InvitationContext';

interface BoardingPassTicketProps {
  guestName: string;
  onJumpToRsvp: () => void;
  onPlayWhistle: () => void;
  onShowToast: (message: string) => void;
}

const PHOTO_STORAGE_KEY = 'choo_choo_faqih_hero_photo_v1';

export const BoardingPassTicket: React.FC<BoardingPassTicketProps> = ({
  guestName,
  onJumpToRsvp,
  onPlayWhistle,
  onShowToast,
}) => {
  const { invitationInfo } = useInvitationData();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [localHeroPhoto, setLocalHeroPhoto] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null;
    try {
      return window.localStorage.getItem(PHOTO_STORAGE_KEY);
    } catch {
      return null;
    }
  });

  // Effective hero photo: Supabase info takes priority if available, otherwise local override
  const effectiveHeroPhoto = invitationInfo.hero_photo_url || localHeroPhoto;

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      onShowToast('Pilih file gambar (JPG/PNG) untuk foto Faqih.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : null;
      if (!result) return;
      setLocalHeroPhoto(result);
      try {
        window.localStorage.setItem(PHOTO_STORAGE_KEY, result);
      } catch {
        // Ignore quota errors
      }
      onShowToast('Foto Faqih berhasil dipasang di bingkai kereta!');
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleRemovePhoto = () => {
    setLocalHeroPhoto(null);
    try {
      window.localStorage.removeItem(PHOTO_STORAGE_KEY);
    } catch {
      // Ignore storage error
    }
    onShowToast('Foto dikembalikan ke tampilan awal.');
  };

  const handleSaveCalendar = () => {
    downloadCalendarInvite({
      title: `Walimatul Khitan ${invitationInfo.child_name || 'Faqih Al-Arif Billah'}`,
      description: `Mohon doa restu dan kehadiran Bapak/Ibu/Saudara/i pada acara Walimatul Khitan putra kami, ${invitationInfo.child_name || 'Faqih Al-Arif Billah'} (putra ${invitationInfo.parents_name || 'Bpk. Dede Nurjaya & Ibu Ruslinawati'}).`,
      location: invitationInfo.event_address || 'Lumé Coffee, Tebet, Jakarta Selatan',
      startIso: '20261219T110000Z',
      endIso: '20261219T170000Z',
    });
    onShowToast('Tiket jadwal tersimpan ke kalender!');
  };

  return (
    <section id="tiket" className="relative pt-1 pb-2">
      {/* Festive overhead bunting */}
      <div className="-mx-4 mb-2">
        <BuntingPennants />
      </div>

      {/* Personalized guest welcome */}
      <div className="text-center mb-4 px-2">
        <p className="text-xs font-bold tracking-[0.06em] uppercase text-[#7D5800] mb-1">
          Undangan Walimatul Khitan
        </p>
        <p className="text-sm text-[#5C403D]">
          Kepada Yth.{' '}
          <span className="font-bold text-[#2B2D42]">{guestName}</span>
        </p>
      </div>

      {/* Split-card Boarding Pass Ticket */}
      <div className="card-ticket rounded-3xl overflow-visible relative">
        {/* Top Ticket Header Band */}
        <div className="bg-[#D62828] text-white px-5 pt-4 pb-3 rounded-t-[22px] flex items-center justify-between gap-2">
          <div className="min-w-0">
            <p className="text-[11px] font-bold tracking-[0.06em] uppercase text-[#FFDEA9] truncate">
              Tiket Keberangkatan Masinis Cilik
            </p>
            <p className="text-xs font-medium text-white/90 tabular-nums">
              No. KHT-2026-01 · Gerbong Utama
            </p>
          </div>
          <button
            type="button"
            onClick={onPlayWhistle}
            className="min-h-[44px] min-w-[44px] px-3 rounded-full bg-[#FCBF49] text-[#271900] font-bold text-xs flex items-center gap-1.5 shrink-0 hover:bg-[#ffd06b] active:scale-95 transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4CC9F0] cursor-pointer"
            aria-label="Bunyikan peluit kereta uap"
          >
            <Volume2 className="w-4 h-4 shrink-0" />
            <span className="whitespace-nowrap">Peluit</span>
          </button>
        </div>

        {/* Upper Ticket Section: Train-Decorated Photo Frame + Boy's Hero Name */}
        <div className="px-5 pt-4 pb-5 text-center bg-gradient-to-b from-[#E4F6FF]/55 to-white">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handlePhotoChange}
            className="hidden"
            aria-label={`Unggah foto ${invitationInfo.child_name}`}
          />

          {/* Train-ornamented Photo Frame */}
          <div className="relative max-w-[260px] mx-auto mb-3 pt-2">
            {/* Decorative steam puffs & stars around top of frame */}
            <div className="flex items-center justify-center gap-2 mb-1.5" aria-hidden="true">
              <span className="w-2.5 h-2.5 rounded-full bg-white border border-[#4CC9F0]" />
              <span className="w-4 h-4 rounded-full bg-white border border-[#4CC9F0]" />
              <svg viewBox="0 0 20 20" className="w-4 h-4 text-[#FCBF49]" fill="currentColor">
                <path d="M10 1.5l2.4 5 5.6.8-4 3.9.9 5.5-4.9-2.6-4.9 2.6.9-5.5-4-3.9 5.6-.8z" />
              </svg>
              <span className="w-3.5 h-3.5 rounded-full bg-white border border-[#4CC9F0]" />
              <span className="w-2 h-2 rounded-full bg-white border border-[#4CC9F0]" />
            </div>

            {/* Locomotive Cabin Window Frame */}
            <div className="relative mx-auto w-[184px] rounded-t-[92px] rounded-b-[28px] p-2 bg-[#D62828] border-[3px] border-[#2B2D42] shadow-[0_8px_20px_rgba(214,40,40,0.18)]">
              {/* Brass rivets on frame */}
              <span
                className="absolute top-3 left-4 w-2 h-2 rounded-full bg-[#FCBF49] border border-[#2B2D42]"
                aria-hidden="true"
              />
              <span
                className="absolute top-3 right-4 w-2 h-2 rounded-full bg-[#FCBF49] border border-[#2B2D42]"
                aria-hidden="true"
              />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="group relative block w-full aspect-[4/4.4] rounded-t-[82px] rounded-b-[20px] overflow-hidden border-[3px] border-[#FCBF49] bg-[#FFF9F2] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4CC9F0] cursor-pointer"
                aria-label={effectiveHeroPhoto ? 'Ganti foto Faqih' : 'Tambah foto Faqih'}
              >
                {effectiveHeroPhoto ? (
                  <>
                    <img
                      src={effectiveHeroPhoto}
                      alt={`Foto ${invitationInfo.child_name}`}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute inset-x-0 bottom-0 py-1.5 bg-[#2B2D42]/75 text-white text-[11px] font-bold flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity">
                      <Camera className="w-3.5 h-3.5 text-[#FCBF49]" />
                      <span>Ganti Foto</span>
                    </span>
                  </>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center px-3 text-center bg-gradient-to-b from-[#E4F6FF]/70 to-[#FFF9F2]">
                    <div className="w-12 h-12 rounded-full bg-[#FCBF49]/35 border-2 border-dashed border-[#D62828] flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                      <Camera className="w-5 h-5 text-[#D62828]" />
                    </div>
                    <span className="text-xs font-extrabold text-[#2B2D42] leading-snug">
                      Foto {invitationInfo.child_name}
                    </span>
                    <span className="text-[11px] text-[#5C403D] mt-0.5">
                      Ketuk bingkai kereta ini
                    </span>
                  </div>
                )}
              </button>
            </div>

            {/* Little Red Steam Train Ornament Riding Along the Frame Base */}
            <div className="-mt-5 relative z-10 pointer-events-none">
              <HeroSteamLocomotive className="w-full max-w-[238px] mx-auto drop-shadow-xs" />
            </div>

            {/* Subtle photo actions when uploaded locally */}
            {localHeroPhoto && (
              <div className="mt-1 flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="min-h-[36px] px-3 py-1 rounded-full bg-[#FFF9F2] border border-[#FCBF49]/60 text-[11px] font-bold text-[#2B2D42] inline-flex items-center gap-1 hover:bg-[#FFDEA9]/40"
                >
                  <Camera className="w-3 h-3 text-[#D62828]" />
                  <span>Ganti Foto</span>
                </button>
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  className="min-h-[36px] px-3 py-1 rounded-full bg-[#FFF9F2] border border-[#E5BDB9] text-[11px] font-bold text-[#5C403D] inline-flex items-center gap-1 hover:bg-[#FFF1EF]"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset</span>
                </button>
              </div>
            )}
          </div>

          <h1 className="text-[28px] leading-[34px] font-extrabold text-[#2B2D42] tracking-[-0.015em] [text-wrap:balance]">
            {invitationInfo.child_name}
          </h1>
          <p className="mt-1.5 text-sm font-medium text-[#5C403D]">
            Putra tercinta dari{' '}
            <span className="font-bold text-[#2B2D42]">
              {invitationInfo.parents_name}
            </span>
          </p>
        </div>

        {/* Perforated Tear Line with Symmetrical Lateral Cutouts */}
        <div className="relative flex items-center my-0.5">
          <div
            className="w-6 h-6 rounded-full bg-[#FFF9F2] border-r border-[#FCBF49]/45 -ml-3 shrink-0 shadow-inner"
            aria-hidden="true"
          />
          <div className="flex-1 border-t-2 border-dashed border-[#E5BDB9] mx-1" />
          <div
            className="w-6 h-6 rounded-full bg-[#FFF9F2] border-l border-[#FCBF49]/45 -mr-3 shrink-0 shadow-inner"
            aria-hidden="true"
          />
        </div>

        {/* Lower Ticket Stub: Departure Date, Time, Destination & Actions */}
        <div className="px-5 pt-4 pb-5 bg-white rounded-b-[22px]">
          <div className="grid grid-cols-2 gap-3 mb-4 text-left">
            <div className="bg-[#FFF9F2] rounded-2xl p-3 border border-[#FCBF49]/30">
              <p className="text-[11px] font-bold tracking-[0.05em] uppercase text-[#7D5800]">
                Tanggal Berangkat
              </p>
              <p className="text-sm font-extrabold text-[#2B2D42] mt-0.5 line-clamp-1">
                {invitationInfo.event_day_date}
              </p>
              <p className="text-xs text-[#5C403D] mt-0.5 tabular-nums line-clamp-1">
                {invitationInfo.event_time}
              </p>
            </div>

            <div className="bg-[#FFF9F2] rounded-2xl p-3 border border-[#FCBF49]/30">
              <p className="text-[11px] font-bold tracking-[0.05em] uppercase text-[#7D5800]">
                Stasiun Tujuan
              </p>
              <p className="text-sm font-extrabold text-[#2B2D42] mt-0.5 leading-snug line-clamp-1">
                {invitationInfo.event_venue}
              </p>
              <p className="text-xs text-[#5C403D] mt-0.5 flex items-center gap-1 line-clamp-1">
                <MapPin className="w-3 h-3 text-[#D62828] shrink-0" />
                <span className="truncate">{invitationInfo.event_venue}</span>
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-2.5">
            <button
              type="button"
              onClick={onJumpToRsvp}
              className="btn-tactile-red w-full min-h-[48px] px-5 py-3 rounded-full font-bold text-sm flex items-center justify-center gap-2 whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4CC9F0] focus-visible:ring-offset-2 cursor-pointer"
            >
              <Ticket className="w-4 h-4 shrink-0" />
              <span>Konfirmasi Kehadiran</span>
            </button>

            <button
              type="button"
              onClick={handleSaveCalendar}
              className="w-full min-h-[44px] px-4 py-2.5 rounded-full border-2 border-dashed border-[#7D5800]/45 bg-[#FFDEA9]/25 text-[#5E4100] font-bold text-xs tracking-wide uppercase flex items-center justify-center gap-2 hover:bg-[#FFDEA9]/45 active:scale-[0.99] transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4CC9F0] cursor-pointer"
            >
              <CalendarPlus className="w-4 h-4 shrink-0" />
              <span>Simpan ke Kalender</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
