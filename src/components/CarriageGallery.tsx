import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Sparkles, X } from 'lucide-react';
import { CarriageSceneIllustration } from './StorybookIllustrations';
import { useInvitationData } from '../context/InvitationContext';

export const CarriageGallery: React.FC = () => {
  const { galleryPhotos } = useInvitationData();
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const selectedMemory = selectedIndex !== null ? galleryPhotos[selectedIndex] : null;

  const handlePrev = () => {
    if (selectedIndex === null) return;
    setSelectedIndex((selectedIndex - 1 + galleryPhotos.length) % galleryPhotos.length);
  };

  const handleNext = () => {
    if (selectedIndex === null) return;
    setSelectedIndex((selectedIndex + 1) % galleryPhotos.length);
  };

  return (
    <section id="galeri" aria-labelledby="galeri-heading" className="px-1">
      <div className="px-1 mb-3">
        <div className="flex items-center gap-1.5 mb-1">
          <Sparkles className="w-4 h-4 text-[#D62828]" />
          <p className="text-[11px] font-bold tracking-[0.06em] uppercase text-[#7D5800]">
            {galleryPhotos.length} Gerbong Galeri Kenangan
          </p>
        </div>
        <h2
          id="galeri-heading"
          className="text-xl font-extrabold text-[#2B2D42] [text-wrap:balance]"
        >
          Perjalanan Tumbuh Kembang Faqih
        </h2>
        <p className="text-xs text-[#5C403D] mt-0.5">
          Geser ke samping atau ketuk gerbong untuk melihat cerita foto kenangan.
        </p>
      </div>

      {/* Horizontal snap-scrolling railway carriages */}
      <div className="flex items-stretch overflow-x-auto snap-x snap-mandatory no-scrollbar pb-4 pt-2 -mx-2 px-2">
        {galleryPhotos.map((item, idx) => (
          <React.Fragment key={item.id}>
            <div className="snap-center shrink-0 w-[216px] text-left group rounded-3xl">
              <button
                type="button"
                onClick={() => setSelectedIndex(idx)}
                className="block w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4CC9F0] rounded-3xl cursor-pointer"
              >
                {/* Steam puff cap above carriage */}
                <div className="flex items-center justify-center gap-1 mb-1" aria-hidden="true">
                  <span className="w-2.5 h-2.5 rounded-full bg-white border border-[#4CC9F0]/60" />
                  <span className="w-3.5 h-3.5 rounded-full bg-white border border-[#4CC9F0]/60" />
                  <span className="w-2 h-2 rounded-full bg-white border border-[#4CC9F0]/60" />
                </div>

                {/* Passenger Carriage Body */}
                <div className="card-storybook rounded-3xl p-3 bg-white group-hover:-translate-y-0.5 transition-transform">
                  <div className="flex items-center justify-between text-[11px] font-bold text-[#7D5800] mb-2 px-1">
                    <span>{item.carriage_no || `Gerbong 0${idx + 1}`}</span>
                    <span aria-hidden="true">·</span>
                    <span>{item.tag_label || 'Kenangan'}</span>
                  </div>

                  {/* Arched Locomotive Cabin Window */}
                  <div className="rounded-t-[28px] rounded-b-xl overflow-hidden border-2 border-[#2B2D42] bg-[#FFF9F2] aspect-[6/5]">
                    {item.image_url ? (
                      <img
                        src={item.image_url}
                        alt={item.title}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <CarriageSceneIllustration
                        variant={(((idx % 6) + 1) as 1 | 2 | 3 | 4 | 5 | 6)}
                      />
                    )}
                  </div>

                  <h3 className="mt-2.5 text-sm font-extrabold text-[#2B2D42] leading-snug line-clamp-1">
                    {item.title}
                  </h3>
                  <p className="mt-1 text-xs text-[#5C403D] line-clamp-2 leading-relaxed">
                    {item.caption}
                  </p>
                </div>

                {/* Locomotive Wheels at Base */}
                <div className="flex items-center justify-around px-6 -mt-2" aria-hidden="true">
                  <div className="w-6 h-6 rounded-full bg-[#2B2D42] border-[2.5px] border-[#FCBF49] flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-[#FCBF49]" />
                  </div>
                  <div className="w-6 h-6 rounded-full bg-[#2B2D42] border-[2.5px] border-[#FCBF49] flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-[#FCBF49]" />
                  </div>
                </div>
              </button>
            </div>

            {/* Graphic Railway Coupling (-o-o-) */}
            {idx < galleryPhotos.length - 1 && (
              <div
                className="shrink-0 flex items-center justify-center px-1 self-center mb-3"
                aria-hidden="true"
              >
                <div className="flex items-center">
                  <span className="w-2.5 h-1 bg-[#2B2D42]" />
                  <span className="w-2.5 h-2.5 rounded-full border-2 border-[#2B2D42] bg-[#FCBF49]" />
                  <span className="w-2 h-1 bg-[#2B2D42]" />
                  <span className="w-2.5 h-2.5 rounded-full border-2 border-[#2B2D42] bg-[#FCBF49]" />
                  <span className="w-2.5 h-1 bg-[#2B2D42]" />
                </div>
              </div>
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Lightbox Modal for Selected Carriage */}
      {selectedMemory && (
        <div
          className="fixed inset-0 z-50 bg-[#181A2E]/65 backdrop-blur-xs flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="carriage-modal-title"
          onClick={() => setSelectedIndex(null)}
        >
          <div
            className="w-full max-w-[380px] bg-white rounded-3xl p-5 border-2 border-[#FCBF49] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="text-xs font-bold text-[#7D5800]">
                {selectedMemory.carriage_no || `Gerbong 0${(selectedIndex || 0) + 1}`} ·{' '}
                {selectedMemory.tag_label || 'Kenangan'}
              </div>
              <button
                type="button"
                onClick={() => setSelectedIndex(null)}
                className="min-h-[44px] min-w-[44px] rounded-full bg-[#FFF9F2] text-[#2B2D42] flex items-center justify-center hover:bg-[#FFDEA9]/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4CC9F0]"
                aria-label="Tutup galeri"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="rounded-t-[36px] rounded-b-2xl overflow-hidden border-2 border-[#2B2D42] aspect-[6/5] mb-3.5 bg-[#FFF9F2]">
              {selectedMemory.image_url ? (
                <img
                  src={selectedMemory.image_url}
                  alt={selectedMemory.title}
                    loading="lazy"
                    decoding="async"
                  className="w-full h-full object-cover"
                />
              ) : (
                <CarriageSceneIllustration
                  variant={((((selectedIndex || 0) % 6) + 1) as 1 | 2 | 3 | 4 | 5 | 6)}
                />
              )}
            </div>

            <h3
              id="carriage-modal-title"
              className="text-lg font-extrabold text-[#2B2D42]"
            >
              {selectedMemory.title}
            </h3>
            <p className="text-sm text-[#5C403D] leading-relaxed mt-1">
              {selectedMemory.caption}
            </p>

            <div className="flex items-center justify-between gap-3 mt-4 pt-3 border-t border-[#E5BDB9]/50">
              <button
                type="button"
                onClick={handlePrev}
                className="min-h-[44px] px-4 rounded-full bg-[#FFF9F2] border border-[#2B2D42]/15 text-xs font-bold text-[#2B2D42] flex items-center gap-1 hover:bg-[#FFDEA9]/40"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Sebelumnya</span>
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="min-h-[44px] px-4 rounded-full bg-[#D62828] text-xs font-bold text-white flex items-center gap-1 hover:bg-[#E63946]"
              >
                <span>Berikutnya</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
