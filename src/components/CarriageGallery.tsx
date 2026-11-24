import React, {useState} from 'react';
import {Camera, ChevronLeft, ChevronRight, Sparkles, X} from 'lucide-react';
import {CarriageSceneIllustration} from './StorybookIllustrations';

interface CarriageMemory {
  id: 1 | 2 | 3 | 4 | 5 | 6;
  carriageNo: string;
  tagLabel: string;
  title: string;
  caption: string;
}

const CARRIAGES: CarriageMemory[] = [
  {
    id: 1,
    carriageNo: 'Gerbong 01',
    tagLabel: 'Masa Kecil',
    title: 'Masa Kecil Faqih (Childhood)',
    caption:
      'Potret manis masa kecil Faqih saat balita dengan senyum cerianya dan topi masinis kecil kesayangan.',
  },
  {
    id: 2,
    carriageNo: 'Gerbong 02',
    tagLabel: 'Marching Band TK',
    title: 'Aksi Marching Band TK',
    caption:
      'Momen gagah Faqih tampil penuh percaya diri membawakan irama drum bersama barisan marching band TK.',
  },
  {
    id: 3,
    carriageNo: 'Gerbong 03',
    tagLabel: 'Wisuda TK',
    title: 'Wisuda TK Penuh Bangga',
    caption:
      'Langkah penuh syukur saat Faqih mengenakan toga wisuda TK dan merayakan kelulusan pertamanya.',
  },
  {
    id: 4,
    carriageNo: 'Gerbong 04',
    tagLabel: 'Sekolah',
    title: 'Semangat Belajar di Sekolah',
    caption:
      'Keseruan Faqih mengikuti pelajaran di kelas dengan penuh rasa ingin tahu dan semangat belajar tinggi.',
  },
  {
    id: 5,
    carriageNo: 'Gerbong 05',
    tagLabel: 'Favoritnya',
    title: 'Faqih Bersama Favoritnya',
    caption:
      'Momen penuh tawa saat Faqih menghabiskan waktu dengan mainan dan aktivitas favorit kesukaannya.',
  },
  {
    id: 6,
    carriageNo: 'Gerbong 06',
    tagLabel: 'Keluarga',
    title: 'Faqih & Keluarga Tercinta',
    caption:
      'Kebersamaan hangat Faqih bersama Bapak Dede Nurjaya dan Ibu Ruslinawati yang selalu mendukung langkahnya.',
  },
];

export const CarriageGallery: React.FC = () => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const GALLERY_PHOTO_PREFIX = 'choo_choo_faqih_gallery_photo_';
  const [galleryPhotos, setGalleryPhotos] = useState<Record<number, string>>(() => {
    if (typeof window === 'undefined') return {};

    const photos: Record<number, string> = {};
    CARRIAGES.forEach((item) => {
      try {
        const photo = window.localStorage.getItem(`${GALLERY_PHOTO_PREFIX}${item.id}`);
        if (photo) photos[item.id] = photo;
      } catch {
        // Ignore storage access errors.
      }
    });
    return photos;
  });

  const selectedMemory = selectedIndex !== null ? CARRIAGES[selectedIndex] : null;

  const handleGalleryPhotoChange = (
    id: CarriageMemory['id'],
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== 'string') return;
      setGalleryPhotos((current) => ({...current, [id]: reader.result as string}));
      try {
        window.localStorage.setItem(`${GALLERY_PHOTO_PREFIX}${id}`, reader.result as string);
      } catch {
        // Ignore localStorage quota overflow for large photos.
      }
    };
    reader.readAsDataURL(file);
    event.target.value = '';
  };

  const handleRemoveGalleryPhoto = (id: CarriageMemory['id']) => {
    setGalleryPhotos((current) => {
      const next = {...current};
      delete next[id];
      return next;
    });
    try {
      window.localStorage.removeItem(`${GALLERY_PHOTO_PREFIX}${id}`);
    } catch {
      // Ignore storage access errors.
    }
  };

  const handlePrev = () => {
    if (selectedIndex === null) return;
    setSelectedIndex((selectedIndex - 1 + CARRIAGES.length) % CARRIAGES.length);
  };

  const handleNext = () => {
    if (selectedIndex === null) return;
    setSelectedIndex((selectedIndex + 1) % CARRIAGES.length);
  };

  return (
    <section id="galeri" aria-labelledby="galeri-heading" className="px-1">
      <div className="px-1 mb-3">
        <div className="flex items-center gap-1.5 mb-1">
          <Sparkles className="w-4 h-4 text-[#D62828]" />
          <p className="text-[11px] font-bold tracking-[0.06em] uppercase text-[#7D5800]">
            6 Gerbong Galeri Kenangan
          </p>
        </div>
        <h2
          id="galeri-heading"
          className="text-xl font-extrabold text-[#2B2D42] [text-wrap:balance]"
        >
          Perjalanan Tumbuh Kembang Faqih
        </h2>
        <p className="text-xs text-[#5C403D] mt-0.5">
          Geser ke samping atau ketuk salah satu dari 6 gerbong untuk melihat ceritanya.
        </p>
      </div>

      {/* Horizontal snap-scrolling railway carriages (6 carriages) */}
      <div className="flex items-stretch overflow-x-auto snap-x snap-mandatory no-scrollbar pb-4 pt-2 -mx-2 px-2">
        {CARRIAGES.map((item, idx) => (
          <React.Fragment key={item.id}>
            <div className="snap-center shrink-0 w-[216px] text-left group rounded-3xl">
              <button
                type="button"
                onClick={() => setSelectedIndex(idx)}
                className="block w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4CC9F0] rounded-3xl"
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
                  <span>{item.carriageNo}</span>
                  <span aria-hidden="true">·</span>
                  <span>{item.tagLabel}</span>
                </div>

                {/* Arched Locomotive Cabin Window */}
                <div className="rounded-t-[28px] rounded-b-xl overflow-hidden border-2 border-[#2B2D42] bg-[#FFF9F2] aspect-[6/5]">
                  {galleryPhotos[item.id] ? (
                    <img
                      src={galleryPhotos[item.id]}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <CarriageSceneIllustration variant={item.id} />
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

              <div className="mt-1 flex items-center justify-center gap-1.5">
                <label className="min-h-[36px] px-2.5 rounded-full bg-[#FFF9F2] border border-[#FCBF49]/60 text-[11px] font-bold text-[#2B2D42] inline-flex items-center gap-1 cursor-pointer hover:bg-[#FFDEA9]/40">
                  <Camera className="w-3 h-3 text-[#D62828]" />
                  <span>{galleryPhotos[item.id] ? 'Ganti Foto' : 'Tambah Foto'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(event) => handleGalleryPhotoChange(item.id, event)}
                  />
                </label>
                {galleryPhotos[item.id] && (
                  <button
                    type="button"
                    onClick={() => handleRemoveGalleryPhoto(item.id)}
                    className="min-h-[36px] px-2.5 rounded-full bg-white border border-[#E5BDB9] text-[11px] font-bold text-[#D62828]"
                    aria-label={`Hapus foto ${item.title}`}
                  >
                    Hapus
                  </button>
                )}
              </div>
            </div>

            {/* Graphic Railway Coupling (-o-o-) */}
            {idx < CARRIAGES.length - 1 && (
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
                {selectedMemory.carriageNo} · {selectedMemory.tagLabel}
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

            <div className="rounded-t-[36px] rounded-b-2xl overflow-hidden border-2 border-[#2B2D42] aspect-[6/5] mb-3.5">
              {galleryPhotos[selectedMemory.id] ? (
                <img
                  src={galleryPhotos[selectedMemory.id]}
                  alt={selectedMemory.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <CarriageSceneIllustration variant={selectedMemory.id} />
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
