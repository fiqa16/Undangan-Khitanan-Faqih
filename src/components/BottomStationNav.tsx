import React from 'react';
import {Images, MapPin, MessageSquareHeart, Music, Pause, Ticket} from 'lucide-react';

interface BottomStationNavProps {
  isMusicPlaying: boolean;
  onToggleMusic: () => void;
  onNavigate: (sectionId: string) => void;
}

export const BottomStationNav: React.FC<BottomStationNavProps> = ({
  isMusicPlaying,
  onToggleMusic,
  onNavigate,
}) => {
  const navItems = [
    {id: 'tiket', label: 'Tiket', icon: Ticket},
    {id: 'lokasi', label: 'Lokasi', icon: MapPin},
    {id: 'galeri', label: 'Galeri', icon: Images},
    {id: 'rsvp', label: 'RSVP', icon: MessageSquareHeart},
  ];

  return (
    <nav
      aria-label="Navigasi stasiun undangan"
      className="fixed bottom-0 left-0 right-0 z-40 flex justify-center pointer-events-none"
    >
      <div className="w-full max-w-[430px] px-3 pb-2.5 pointer-events-auto">
        <div className="h-14 rounded-full bg-white/95 backdrop-blur-md border border-[#FCBF49]/60 shadow-[0_8px_24px_rgba(43,45,66,0.14)] px-2 grid grid-cols-5 items-center">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onNavigate(item.id)}
                className="min-h-[44px] flex flex-col items-center justify-center rounded-full text-[#5C403D] hover:text-[#D62828] active:scale-95 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4CC9F0]"
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="text-[10px] font-bold tracking-tight mt-0.5 whitespace-nowrap">
                  {item.label}
                </span>
              </button>
            );
          })}

          <button
            type="button"
            onClick={onToggleMusic}
            aria-label={isMusicPlaying ? 'Matikan musik latar' : 'Putar musik latar'}
            aria-pressed={isMusicPlaying}
            className={`min-h-[44px] flex flex-col items-center justify-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4CC9F0] ${
              isMusicPlaying
                ? 'bg-[#D62828] text-white'
                : 'bg-[#FFF9F2] text-[#7D5800] hover:bg-[#FFDEA9]/50'
            }`}
          >
            {isMusicPlaying ? (
              <Pause className="w-4 h-4 shrink-0" />
            ) : (
              <Music className="w-4 h-4 shrink-0" />
            )}
            <span className="text-[10px] font-bold tracking-tight mt-0.5 whitespace-nowrap">
              {isMusicPlaying ? 'Jeda' : 'Musik'}
            </span>
          </button>
        </div>
      </div>
    </nav>
  );
};
