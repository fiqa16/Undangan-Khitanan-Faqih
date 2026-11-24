import React, { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Loader2, Lock, Share2, Train } from 'lucide-react';
import { BoardingPassTicket } from './components/BoardingPassTicket';
import { BottomStationNav } from './components/BottomStationNav';
import { CarriageGallery } from './components/CarriageGallery';
import { CulturalBlessing } from './components/CulturalBlessing';
import { RsvpAndWishes } from './components/RsvpAndWishes';
import { StationCountdown } from './components/StationCountdown';
import { TrackDivider } from './components/StorybookIllustrations';
import { TicketBoothGift } from './components/TicketBoothGift';
import { VenueAndRundown } from './components/VenueAndRundown';
import { playTrainWhistle, toggleBackgroundMusic, setBackgroundMusicUrl } from './utils/sound';
import { AuthProvider } from './context/AuthContext';
import { InvitationProvider, useInvitationData } from './context/InvitationContext';

const AdminPage = React.lazy(() =>
  import('./components/admin/AdminPage').then((mod) => ({ default: mod.AdminPage }))
);

function MainInvitationContent({
  onNavigateToAdmin,
  showToast,
}: {
  onNavigateToAdmin: () => void;
  showToast: (message: string) => void;
}) {
  const { invitationInfo, musicSettings } = useInvitationData();
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);

  // Sync music URL from Supabase settings
  useEffect(() => {
    if (musicSettings.audio_url) {
      setBackgroundMusicUrl(musicSettings.audio_url);
    }
  }, [musicSettings.audio_url]);

  const guestName = useMemo(() => {
    if (typeof window === 'undefined') return 'Keluarga & Sahabat Tercinta';
    const params = new URLSearchParams(window.location.search);
    const to = params.get('to')?.trim();
    return to && to.length > 0 ? to : 'Keluarga & Sahabat Tercinta';
  }, []);

  const handlePlayWhistle = () => {
    playTrainWhistle();
    showToast('Tuut-tuut! Kereta Masinis Cilik siap berangkat!');
  };

  const handleToggleMusic = () => {
    const nextState = !isMusicPlaying;
    const active = toggleBackgroundMusic(nextState, musicSettings.audio_url);
    setIsMusicPlaying(active);
    showToast(active ? `Memutar: ${musicSettings.title}` : 'Musik latar dijeda');
  };

  const scrollToSection = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleShareInvite = async () => {
    const shareUrl = window.location.origin;
    const shareTitle = `Undangan Walimatul Khitan — ${invitationInfo.child_name}`;
    const shareText = `Assalamu’alaikum! Mari naik kereta petualangan menuju Walimatul Khitan ${invitationInfo.child_name} pada ${invitationInfo.event_day_date} di ${invitationInfo.event_venue}.`;

    if (navigator.share) {
      try {
        await navigator.share({ title: shareTitle, text: shareText, url: shareUrl });
        return;
      } catch {
        // User cancelled or share unavailable; fallback to clipboard
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
              <span className="font-bold text-[#2B2D42]">{invitationInfo.child_name}</span>.
            </p>

            <div className="bg-[#FFF9F2] rounded-2xl p-3.5 border border-[#FCBF49]/35 mb-4">
              <p className="text-[11px] font-bold tracking-[0.05em] uppercase text-[#7D5800] mb-1">
                Kami yang Berbahagia
              </p>
              <p className="text-sm font-extrabold text-[#2B2D42]">
                {invitationInfo.parents_name}
              </p>
              <p className="text-xs text-[#5C403D] mt-1">
                Beserta keluarga besar Jakarta Selatan
              </p>
            </div>

            <button
              type="button"
              onClick={handleShareInvite}
              className="btn-tactile-gold min-h-[44px] px-5 py-2.5 rounded-full text-xs font-extrabold inline-flex items-center justify-center gap-2 whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4CC9F0] cursor-pointer"
            >
              <Share2 className="w-4 h-4 shrink-0" />
              <span>Bagikan Undangan</span>
            </button>

            <p className="text-[11px] text-[#906F6B] mt-5">
              Choo-Choo Khitan Adventure · {invitationInfo.event_day_date}
            </p>

            {/* Subtle Admin Access Link */}
            <div className="mt-4 pt-3 border-t border-[#FCBF49]/20 flex justify-center">
              <button
                type="button"
                onClick={onNavigateToAdmin}
                className="inline-flex items-center gap-1.5 text-[10px] font-bold text-[#906F6B] hover:text-[#D62828] px-3 py-1.5 rounded-full hover:bg-[#FFDEA9]/30 transition-colors cursor-pointer"
                title="Kelola Undangan (Khusus Admin)"
              >
                <Lock className="w-3 h-3" />
                <span>Panel Admin</span>
              </button>
            </div>
          </div>
        </footer>
      </main>

      {/* Sticky Bottom Station Navigation */}
      <BottomStationNav
        isMusicPlaying={isMusicPlaying}
        onToggleMusic={handleToggleMusic}
        onNavigate={scrollToSection}
      />
    </div>
  );
}

export default function App() {
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimerRef = useRef<number | null>(null);

  // Routing state: detects /admin or #admin
  const [currentPath, setCurrentPath] = useState<string>(() => {
    if (typeof window === 'undefined') return '/';
    const path = window.location.pathname;
    const hash = window.location.hash;
    if (path.startsWith('/admin') || hash.includes('admin')) {
      return '/admin';
    }
    return '/';
  });

  const showToast = useCallback((message: string) => {
    setToastMessage(message);
    if (toastTimerRef.current !== null) {
      window.clearTimeout(toastTimerRef.current);
    }
    toastTimerRef.current = window.setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  }, []);

  const navigateTo = useCallback((targetPath: string) => {
    if (typeof window !== 'undefined') {
      window.history.pushState({}, '', targetPath);
    }
    setCurrentPath(targetPath);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      const hash = window.location.hash;
      if (path.startsWith('/admin') || hash.includes('admin')) {
        setCurrentPath('/admin');
      } else {
        setCurrentPath('/');
      }
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('hashchange', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('hashchange', handlePopState);
      if (toastTimerRef.current !== null) {
        window.clearTimeout(toastTimerRef.current);
      }
      toggleBackgroundMusic(false);
    };
  }, []);

  const isAdminRoute = currentPath.startsWith('/admin');

  return (
    <AuthProvider>
      <InvitationProvider>
        {isAdminRoute ? (
          <Suspense
            fallback={
              <div className="min-h-screen bg-[#FFF9F2] flex flex-col items-center justify-center p-4">
                <div className="w-16 h-16 rounded-3xl bg-[#D62828] text-white flex items-center justify-center shadow-lg border-[3px] border-[#FCBF49] mb-4">
                  <Train className="w-8 h-8 text-[#FCBF49] animate-bounce" />
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-[#7D5800]">
                  <Loader2 className="w-4 h-4 animate-spin text-[#D62828]" />
                  <span>Memuat Panel Admin...</span>
                </div>
              </div>
            }
          >
            <AdminPage
              onBackToSite={() => navigateTo('/')}
              onShowToast={showToast}
            />
          </Suspense>
        ) : (
          <MainInvitationContent
            onNavigateToAdmin={() => navigateTo('/admin')}
            showToast={showToast}
          />
        )}

        {/* Global Micro-Toast Notification */}
        {toastMessage && (
          <div
            role="status"
            aria-live="polite"
            className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-max max-w-[90vw] px-4 py-2.5 rounded-full bg-[#2B2D42] text-white text-xs font-bold shadow-xl border border-[#FCBF49]/70 flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-200"
          >
            <Train className="w-4 h-4 text-[#FCBF49] shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}
      </InvitationProvider>
    </AuthProvider>
  );
}
