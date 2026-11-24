import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {Share2, Train} from 'lucide-react';
import {BoardingPassTicket} from './components/BoardingPassTicket';
import {BottomStationNav} from './components/BottomStationNav';
import {CarriageGallery} from './components/CarriageGallery';
import {CulturalBlessing} from './components/CulturalBlessing';
import {RsvpAndWishes} from './components/RsvpAndWishes';
import {StationCountdown} from './components/StationCountdown';
import {TrackDivider} from './components/StorybookIllustrations';
import {TicketBoothGift} from './components/TicketBoothGift';
import {VenueAndRundown} from './components/VenueAndRundown';
import {playTrainWhistle, toggleBackgroundMusic} from './utils/sound';

export default function App() {
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const toastTimerRef = useRef<number | null>(null);

  const guestName = useMemo(() => {
    if (typeof window === 'undefined') return 'Keluarga & Sahabat Tercinta';
    const params = new URLSearchParams(window.location.search);
    const to = params.get('to')?.trim();
    return to && to.length > 0 ? to : 'Keluarga & Sahabat Tercinta';
  }, []);

  const showToast = useCallback((message: string) => {
    setToastMessage(message);
    if (toastTimerRef.current !== null) {
      window.clearTimeout(toastTimerRef.current);
    }
    toastTimerRef.current = window.setTimeout(() => {
      setToastMessage(null);
    }, 2600);
  }, []);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current !== null) {
        window.clearTimeout(toastTimerRef.current);
      }
      toggleBackgroundMusic(false);
    };
  }, []);

  const handlePlayWhistle = () => {
    playTrainWhistle();
    showToast('Tuut-tuut! Kereta Masinis Cilik siap berangkat!');
  };

  const handleToggleMusic = () => {
    const nextState = !isMusicPlaying;
    const active = toggleBackgroundMusic(nextState);
    setIsMusicPlaying(active);
    showToast(active ? 'Musik kotak ceria diputar' : 'Musik latar dijeda');
  };

  const scrollToSection = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({behavior: 'smooth', block: 'start'});
    }
  };

  const handleShareInvite = async () => {
    const shareUrl = window.location.href;
    const shareTitle = 'Undangan Walimatul Khitan — Faqih Al-Arif Billah';
    const shareText =
      'Assalamu’alaikum! Mari naik kereta petualangan menuju Walimatul Khitan Faqih Al-Arif Billah pada Sabtu, 19 Desember 2026 di Lumé Coffee, Tebet.';

    if (navigator.share) {
      try {
        await navigator.share({title: shareTitle, text: shareText, url: shareUrl});
        return;
      } catch {
        // User cancelled or native share unavailable; fall back to clipboard
      }
    }

    try {
      await navigator.clipboard.writeText(shareUrl);
      showToast('Tautan undangan tersalin!');
    } catch {
      showToast('Salin tautan dari bilah alamat peramban.');
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF9F2] relative overflow-x-hidden">
      {/* Ambient storybook cloud & star pattern visible on wider screens */}
      <div
        className="fixed inset-0 pointer-events-none opacity-65"
        aria-hidden="true"
        style={{
          backgroundImage: `
            radial-gradient(circle at 14% 18%, rgba(76, 201, 240, 0.14) 0, rgba(76, 201, 240, 0) 22%),
            radial-gradient(circle at 86% 24%, rgba(252, 191, 73, 0.16) 0, rgba(252, 191, 73, 0) 24%),
            radial-gradient(circle at 18% 76%, rgba(214, 40, 40, 0.08) 0, rgba(214, 40, 40, 0) 24%),
            radial-gradient(circle at 84% 82%, rgba(76, 201, 240, 0.14) 0, rgba(76, 201, 240, 0) 22%)
          `,
        }}
      />

      {/* Centered Mobile-First Canvas (max 430px) */}
      <main className="relative z-10 max-w-[430px] mx-auto min-h-screen bg-[#FFF9F2] sm:shadow-[0_0_50px_rgba(43,45,66,0.08)] sm:border-x sm:border-[#FCBF49]/25 px-4 pb-24">
        {/* Stop 1: Boarding Pass Event Ticket Hero */}
        <BoardingPassTicket
          guestName={guestName}
          onJumpToRsvp={() => scrollToSection('rsvp')}
          onPlayWhistle={handlePlayWhistle}
          onShowToast={showToast}
        />

        <TrackDivider />

        {/* Stop 2: Cultural Greeting & Quranic Blessing */}
        <CulturalBlessing />

        <TrackDivider />

        {/* Stop 3: Station Master Countdown Clock */}
        <StationCountdown />

        <TrackDivider />

        {/* Stop 4: Event Rundown & Venue Station Map */}
        <VenueAndRundown onShowToast={showToast} />

        <TrackDivider />

        {/* Stop 5: Railway Carriage Photo Gallery */}
        <CarriageGallery />

        <TrackDivider />

        {/* Stop 6: Digital Envelope Ticket Booth (Bank & QRIS) */}
        <TicketBoothGift onShowToast={showToast} />

        <TrackDivider />

        {/* Stop 7: RSVP Form & Telegram Wishes Feed */}
        <RsvpAndWishes
          defaultGuestName={guestName}
          onShowToast={showToast}
          onSuccessWhistle={playTrainWhistle}
        />

        <TrackDivider />

        {/* Closing Family Credits */}
        <footer className="px-1 pt-1 pb-6">
          <div className="card-storybook rounded-3xl p-6 text-center">
            <p className="text-sm font-extrabold text-[#D62828] mb-2">
              Wassalamu’alaikum Warahmatullahi Wabarakatuh
            </p>
            <p className="text-xs text-[#5C403D] leading-relaxed mb-4">
              Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i
              berkenan hadir serta memberikan doa restu untuk putra kami tercinta,{' '}
              <span className="font-bold text-[#2B2D42]">Faqih Al-Arif Billah</span>.
            </p>

            <div className="bg-[#FFF9F2] rounded-2xl p-3.5 border border-[#FCBF49]/35 mb-4">
              <p className="text-[11px] font-bold tracking-[0.05em] uppercase text-[#7D5800] mb-1">
                Kami yang Berbahagia
              </p>
              <p className="text-sm font-extrabold text-[#2B2D42]">
                Bpk. Dede Nurjaya &amp; Ibu Ruslinawati
              </p>
              <p className="text-xs text-[#5C403D] mt-1">
                Beserta keluarga besar Jakarta Selatan
              </p>
            </div>

            <button
              type="button"
              onClick={handleShareInvite}
              className="btn-tactile-gold min-h-[44px] px-5 py-2.5 rounded-full text-xs font-extrabold inline-flex items-center justify-center gap-2 whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4CC9F0]"
            >
              <Share2 className="w-4 h-4 shrink-0" />
              <span>Bagikan Undangan</span>
            </button>

            <p className="text-[11px] text-[#906F6B] mt-5">
              Choo-Choo Khitan Adventure · Sabtu, 19 Desember 2026
            </p>
          </div>
        </footer>
      </main>

      {/* Micro-Toast Notification */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-max max-w-[90vw] px-4 py-2.5 rounded-full bg-[#2B2D42] text-white text-xs font-bold shadow-xl border border-[#FCBF49]/70 flex items-center gap-2"
        >
          <Train className="w-4 h-4 text-[#FCBF49] shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Sticky Bottom Station Navigation */}
      <BottomStationNav
        isMusicPlaying={isMusicPlaying}
        onToggleMusic={handleToggleMusic}
        onNavigate={scrollToSection}
      />
    </div>
  );
}
