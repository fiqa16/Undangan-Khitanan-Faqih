import React, { useState, useRef } from 'react';
import {
  MapPin,
  Camera,
  Upload,
  Trash2,
  Check,
  Loader2,
  Sparkles,
  ExternalLink,
  AlertCircle,
  Eye,
  X,
  FileImage,
} from 'lucide-react';
import { useInvitationData } from '../../context/InvitationContext';
import { uploadFileToStorage, deleteFileFromStorage } from '../../utils/supabase';

interface VenueLocationManagerProps {
  onShowToast: (message: string) => void;
}

export const VenueLocationManager: React.FC<VenueLocationManagerProps> = ({ onShowToast }) => {
  const { invitationInfo, updateVenueLocation, isSupabaseConfigured } = useInvitationData();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [descriptionInput, setDescriptionInput] = useState<string>(
    invitationInfo.venue_description ||
      'Suasana venue Lumé Coffee Tebet, lokasi stasiun utama acara Walimatul Khitan Faqih.'
  );
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [statusError, setStatusError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const currentPhotoUrl = invitationInfo.venue_photo_url;
  const currentPhotoPath = invitationInfo.venue_photo_path;

  // Handle file select
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      onShowToast('Harap pilih file gambar (JPG, PNG, atau WebP).');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      onShowToast('Ukuran file foto maksimal 10MB.');
      return;
    }

    setSelectedFile(file);
    setStatusError(null);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    e.target.value = '';
  };

  // Upload or replace photo
  const handleSavePhoto = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedFile && !currentPhotoUrl) {
      onShowToast('Silakan pilih foto lokasi dari perangkat Anda.');
      return;
    }
    if (selectedFile && !isSupabaseConfigured) {
      onShowToast('Supabase belum dikonfigurasi; foto lokasi tidak dapat diunggah.');
      return;
    }

    setIsUploading(true);
    setStatusError(null);
    let uploadedPath: string | null = null;
    let locationSaved = false;
    try {
      let finalPhotoUrl = currentPhotoUrl;
      let finalPhotoPath = currentPhotoPath;

      if (selectedFile) {
        const uploadResult = await uploadFileToStorage(selectedFile, 'venue');
        uploadedPath = uploadResult.path;
        finalPhotoUrl = uploadResult.publicUrl;
        finalPhotoPath = uploadResult.path;
      }

      await updateVenueLocation({
        venue_photo_url: finalPhotoUrl,
        venue_photo_path: finalPhotoPath,
        venue_description: descriptionInput.trim(),
      });
      locationSaved = true;

      if (currentPhotoPath && currentPhotoPath !== finalPhotoPath) {
        try {
          await deleteFileFromStorage(currentPhotoPath);
        } catch (cleanupError) {
          const detail =
            cleanupError instanceof Error ? cleanupError.message : 'Kesalahan tidak diketahui.';
          setStatusError(`Perubahan tersimpan, tetapi file foto lama belum terhapus: ${detail}`);
          onShowToast('Foto lokasi tersimpan, tetapi file foto lama belum terhapus.');
          setSelectedFile(null);
          setPreviewUrl(null);
          return;
        }
      }

      onShowToast('Foto lokasi Lumé Coffee berhasil disimpan!');
      setSelectedFile(null);
      setPreviewUrl(null);
    } catch (err: unknown) {
      let msg = err instanceof Error ? err.message : 'Gagal menyimpan foto lokasi.';
      if (uploadedPath && !locationSaved) {
        try {
          await deleteFileFromStorage(uploadedPath);
        } catch (cleanupError) {
          const detail =
            cleanupError instanceof Error ? cleanupError.message : 'Kesalahan tidak diketahui.';
          msg = `${msg} File yang gagal disimpan belum dapat dibersihkan: ${detail}`;
        }
      }
      setStatusError(msg);
      onShowToast(msg);
    } finally {
      setIsUploading(false);
    }
  };

  // Delete photo
  const handleDeletePhoto = async () => {
    if (!isSupabaseConfigured) {
      onShowToast('Supabase belum dikonfigurasi; foto lokasi tidak dapat dihapus.');
      return;
    }
    setIsDeleting(true);
    setStatusError(null);
    try {
      await updateVenueLocation({
        venue_photo_url: null,
        venue_photo_path: null,
      });

      if (currentPhotoPath) {
        try {
          await deleteFileFromStorage(currentPhotoPath);
        } catch (cleanupError) {
          const detail =
            cleanupError instanceof Error ? cleanupError.message : 'Kesalahan tidak diketahui.';
          setStatusError(`Foto dihapus dari website, tetapi file Storage belum terhapus: ${detail}`);
          setIsConfirmDeleteOpen(false);
          onShowToast('Foto dihapus dari website, tetapi file Storage belum terhapus.');
          return;
        }
      }

      setSelectedFile(null);
      setPreviewUrl(null);
      setIsConfirmDeleteOpen(false);
      onShowToast('Foto lokasi berhasil dihapus dari sistem.');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal menghapus foto lokasi.';
      setStatusError(msg);
      onShowToast(msg);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Intro Header */}
      <div className="p-5 rounded-3xl bg-white border border-[#FCBF49]/40 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <MapPin className="w-4 h-4 text-[#D62828]" />
            <h2 className="text-base font-extrabold text-[#2B2D42]">
              Kelola Lokasi Acara: {invitationInfo.event_venue || 'Lumé Coffee'}
            </h2>
          </div>
          <p className="text-xs text-[#5C403D]">
            Unggah dan perbarui foto asli suasana atau fasad Lumé Coffee Tebet. Foto ini akan tampil di bagian lokasi undangan utama bersama peta Google Maps.
          </p>
        </div>

        {currentPhotoUrl && (
          <span className="px-3 py-1 rounded-full bg-[#EBFBEE] text-[#2B8A3E] border border-[#B2F2BB] text-[11px] font-bold inline-flex items-center gap-1.5 shrink-0">
            <Check className="w-3.5 h-3.5" />
            <span>Foto Asli Terpasang</span>
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {statusError && (
          <div role="alert" className="lg:col-span-12 p-3 rounded-xl bg-[#FFEAE8] border border-[#FFCCD0] text-xs text-[#A61E1E]">
            {statusError}
          </div>
        )}
        {/* Left Column: Photo Preview & Upload Form */}
        <div className="lg:col-span-7 space-y-4">
          <form
            onSubmit={handleSavePhoto}
            className="card-storybook rounded-3xl p-6 bg-white border border-[#FCBF49]/40 space-y-5"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-extrabold text-[#2B2D42] flex items-center gap-2">
                <Camera className="w-4 h-4 text-[#D62828]" />
                <span>Foto Asli Lokasi Lumé Coffee</span>
              </h3>
              {previewUrl && (
                <span className="text-[11px] font-bold text-[#D62828] bg-[#FFF1EF] px-2.5 py-0.5 rounded-full border border-[#FFCCD0]">
                  Foto Baru Terpilih (Belum Disimpan)
                </span>
              )}
            </div>

            {/* Hidden File Input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />

            {/* Display Area: Active Photo or Upload Box */}
            {previewUrl || currentPhotoUrl ? (
              <div className="space-y-3">
                <div className="relative w-full aspect-[16/10] rounded-2xl overflow-hidden border-2 border-[#2B2D42] bg-[#FFF9F2] group shadow-sm">
                  <img
                    src={previewUrl || currentPhotoUrl || ''}
                    alt="Foto Lokasi Lumé Coffee"
                    className="w-full h-full object-cover"
                  />

                  {/* Overlay Controls */}
                  <div className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsLightboxOpen(true)}
                      className="px-3.5 py-2 rounded-full bg-white text-xs font-bold text-[#2B2D42] shadow-md inline-flex items-center gap-1.5 hover:bg-[#FFF9F2] transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5 text-[#005F76]" />
                      <span>Lihat Ukuran Penuh</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3.5 py-2 rounded-full bg-[#D62828] text-xs font-bold text-white shadow-md inline-flex items-center gap-1.5 hover:bg-[#E63946] transition-colors"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>Ganti Foto</span>
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-xs font-bold text-[#D62828] hover:underline inline-flex items-center gap-1 cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Pilih foto lain dari perangkat</span>
                  </button>

                  {currentPhotoUrl && (
                    <button
                      type="button"
                      onClick={() => setIsConfirmDeleteOpen(true)}
                      className="text-xs font-bold text-[#C92A2A] hover:bg-[#FFEAE8] px-2.5 py-1 rounded-lg border border-[#FFCCD0] inline-flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Hapus Foto Lokasi</span>
                    </button>
                  )}
                </div>
              </div>
            ) : (
              /* Empty state: No photo uploaded yet */
              <div
                onClick={() => fileInputRef.current?.click()}
                className="w-full min-h-[220px] rounded-2xl border-2 border-dashed border-[#FCBF49] bg-[#FFF9F2] hover:bg-[#FFDEA9]/25 flex flex-col items-center justify-center p-6 text-center transition-colors cursor-pointer group"
              >
                <div className="w-14 h-14 rounded-full bg-[#FCBF49]/30 text-[#D62828] flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                  <Upload className="w-7 h-7" />
                </div>
                <h4 className="text-sm font-extrabold text-[#2B2D42]">
                  Klik untuk Memilih Foto Asli Lumé Coffee
                </h4>
                <p className="text-xs text-[#5C403D] mt-1 max-w-sm">
                  Pilih foto asli dari perangkat (JPG, PNG, WebP). Jangan gunakan foto ilustrasi atau tempat lain.
                </p>
                <span className="mt-3 px-3.5 py-1.5 rounded-full bg-white border border-[#FCBF49]/70 text-[11px] font-bold text-[#7D5800] shadow-xs">
                  Pilih dari Perangkat
                </span>
              </div>
            )}

            {/* Caption / Description Input */}
            <div>
              <label className="block text-xs font-bold text-[#2B2D42] mb-1.5">
                Keterangan / Catatan Lokasi (Opsional)
              </label>
              <textarea
                rows={2}
                value={descriptionInput}
                onChange={(e) => setDescriptionInput(e.target.value)}
                placeholder="Contoh: Suasana nyaman Lumé Coffee Tebet, dilengkapi area parkir dan musholla."
                className="w-full p-3 rounded-xl bg-[#FFF9F2] border border-[#FCBF49]/40 text-xs text-[#2B2D42] focus:outline-none focus:ring-2 focus:ring-[#D62828]"
              />
            </div>

            {/* Save Button */}
            <div className="pt-2 border-t border-[#FCBF49]/30 flex items-center justify-end">
              <button
                type="submit"
                disabled={isUploading || (!selectedFile && descriptionInput === invitationInfo.venue_description)}
                className="btn-tactile-red min-h-[42px] px-6 rounded-full text-xs font-bold inline-flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Menyimpan ke Supabase...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Simpan Perubahan Foto</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Venue Details & Preview on Main Site */}
        <div className="lg:col-span-5 space-y-4">
          <div className="card-storybook rounded-3xl p-5 bg-white border border-[#FCBF49]/40 space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-[#FCBF49]/30">
              <Sparkles className="w-4 h-4 text-[#D62828]" />
              <h3 className="text-sm font-extrabold text-[#2B2D42]">
                Informasi Stasiun Utama
              </h3>
            </div>

            <div className="space-y-2 text-xs">
              <div>
                <span className="font-bold text-[#7D5800]">Nama Tempat:</span>
                <p className="font-extrabold text-sm text-[#2B2D42] mt-0.5">
                  {invitationInfo.event_venue || 'Lumé Coffee'}
                </p>
              </div>

              <div>
                <span className="font-bold text-[#7D5800]">Alamat Lengkap:</span>
                <p className="text-[#5C403D] mt-0.5 leading-relaxed">
                  {invitationInfo.event_address ||
                    'Jl. KH Abdullah Syafei No.7, RT.6/RW.2, Manggarai Sel., Kec. Tebet, Kota Jakarta Selatan'}
                </p>
              </div>

              <div>
                <span className="font-bold text-[#7D5800]">Hari &amp; Jam:</span>
                <p className="text-[#2B2D42] font-semibold mt-0.5">
                  {invitationInfo.event_day_date} · {invitationInfo.event_time}
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#FFF9F2] border border-[#FCBF49]/50 text-xs text-[#5C403D] space-y-1.5">
              <div className="flex items-center gap-1.5 font-bold text-[#7D5800]">
                <AlertCircle className="w-3.5 h-3.5 text-[#D62828]" />
                <span>Pedoman Foto Lokasi:</span>
              </div>
              <ul className="list-disc list-inside space-y-1 text-[11px] leading-relaxed">
                <li>Gunakan foto asli tampak depan (fasad) atau interior Lumé Coffee.</li>
                <li>Hindari gambar ilustrasi atau gambar kartun kereta pada bagian foto venue ini.</li>
                <li>Foto akan langsung muncul di halaman undangan utama di atas frame Google Maps.</li>
              </ul>
            </div>

            {invitationInfo.maps_url && (
              <a
                href={invitationInfo.maps_url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full min-h-[40px] px-3 rounded-full bg-[#FFF9F2] hover:bg-[#FFDEA9]/50 border border-[#FCBF49]/60 text-xs font-bold text-[#2B2D42] flex items-center justify-center gap-1.5 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5 text-[#D62828]" />
                <span>Buka Titik di Google Maps</span>
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Lightbox Modal */}
      {isLightboxOpen && (previewUrl || currentPhotoUrl) && (
        <div
          className="fixed inset-0 z-50 bg-[#181A2E]/80 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setIsLightboxOpen(false)}
        >
          <div
            className="relative max-w-3xl w-full bg-white rounded-3xl p-3 border-2 border-[#FCBF49] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setIsLightboxOpen(false)}
              className="absolute -top-3 -right-3 w-9 h-9 rounded-full bg-white border border-[#2B2D42] text-[#2B2D42] flex items-center justify-center shadow-md hover:bg-[#FFF9F2]"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="rounded-2xl overflow-hidden aspect-[16/10] bg-black">
              <img
                src={previewUrl || currentPhotoUrl || ''}
                alt="Foto Penuh Lokasi Lumé Coffee"
                className="w-full h-full object-contain"
              />
            </div>
            {descriptionInput && (
              <p className="text-xs text-[#5C403D] mt-2.5 px-2 text-center font-medium">
                {descriptionInput}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Confirm Delete Modal */}
      {isConfirmDeleteOpen && (
        <div
          className="fixed inset-0 z-50 bg-[#181A2E]/60 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setIsConfirmDeleteOpen(false)}
        >
          <div
            className="w-full max-w-sm bg-white rounded-3xl p-6 border-2 border-[#FCBF49] shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-full bg-[#FFEAE8] text-[#D62828] flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-base font-extrabold text-[#2B2D42]">
                Hapus Foto Lokasi?
              </h3>
              <p className="text-xs text-[#5C403D]">
                Foto asli Lumé Coffee akan dihapus dari Supabase Storage dan halaman utama. Pengunjung tidak akan melihat foto hingga Anda mengunggah yang baru.
              </p>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsConfirmDeleteOpen(false)}
                disabled={isDeleting}
                className="flex-1 min-h-[42px] px-4 rounded-full border border-[#5C403D]/20 text-xs font-bold text-[#5C403D] hover:bg-gray-100"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleDeletePhoto}
                disabled={isDeleting}
                className="flex-1 min-h-[42px] px-4 rounded-full bg-[#D62828] hover:bg-[#E63946] text-white text-xs font-bold inline-flex items-center justify-center gap-1.5"
              >
                {isDeleting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <span>Ya, Hapus</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
