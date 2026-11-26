import React, { useState, useEffect, useRef } from 'react';
import {
  Save,
  Check,
  MapPin,
  Calendar,
  Clock,
  User,
  Heart,
  MessageSquare,
  Upload,
  Camera,
  Loader2,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import { useInvitationData } from '../../context/InvitationContext';
import { deleteFileFromStorage, uploadFileToStorage } from '../../utils/supabase';
import { PhotoCropper } from './PhotoCropper';

interface InvitationInfoManagerProps {
  onShowToast: (message: string) => void;
}

export const InvitationInfoManager: React.FC<InvitationInfoManagerProps> = ({ onShowToast }) => {
  const { invitationInfo, updateInvitationInfo, isSupabaseConfigured } = useInvitationData();

  const [formData, setFormData] = useState(invitationInfo);
  const [isSaving, setIsSaving] = useState(false);
  const [heroPhotoFile, setHeroPhotoFile] = useState<File | null>(null);
  const [cropFile, setCropFile] = useState<File | null>(null);
  const [heroPhotoPreview, setHeroPhotoPreview] = useState<string | null>(
    invitationInfo.hero_photo_url || null
  );
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setFormData(invitationInfo);
    setHeroPhotoPreview(invitationInfo.hero_photo_url || null);
  }, [invitationInfo]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleHeroPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      onShowToast('Harap pilih file gambar (JPG, PNG).');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      onShowToast('Ukuran foto utama maksimal 5MB.');
      return;
    }

    setCropFile(file);
    e.target.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.maps_embed_url) {
      try {
        const parsed = new URL(formData.maps_embed_url.trim());
        if (parsed.protocol !== 'https:' || !['google.com', 'www.google.com', 'maps.google.com'].includes(parsed.hostname) || !parsed.pathname.includes('/maps')) {
          throw new Error();
        }
      } catch {
        onShowToast('URL embed hanya boleh memakai halaman Google Maps yang aman.');
        return;
      }
    }
    setIsSaving(true);

    let uploadedPath: string | null = null;
    let informationSaved = false;
    try {
      let finalHeroPhotoUrl = formData.hero_photo_url;
      let finalHeroPhotoPath = formData.hero_photo_path;

      if (heroPhotoFile) {
        if (!isSupabaseConfigured) {
          throw new Error('Supabase belum dikonfigurasi; foto utama tidak dapat diunggah.');
        }
        const uploadResult = await uploadFileToStorage(heroPhotoFile, 'gallery');
        uploadedPath = uploadResult.path;
        finalHeroPhotoUrl = uploadResult.publicUrl;
        finalHeroPhotoPath = uploadResult.path;
      }

      await updateInvitationInfo({
        ...formData,
        hero_photo_url: finalHeroPhotoUrl,
        hero_photo_path: finalHeroPhotoPath,
      });
      informationSaved = true;

      const oldPhotoPath = invitationInfo.hero_photo_path;
      if (oldPhotoPath && oldPhotoPath !== finalHeroPhotoPath) {
        try {
          await deleteFileFromStorage(oldPhotoPath);
        } catch (error) {
          const detail = error instanceof Error ? error.message : 'Kesalahan tidak diketahui.';
          throw new Error(`Perubahan foto tersimpan, tetapi foto lama belum terhapus: ${detail}`);
        }
      }

      setFormData((current) => ({
        ...current,
        hero_photo_url: finalHeroPhotoUrl,
        hero_photo_path: finalHeroPhotoPath,
      }));
      setHeroPhotoPreview(finalHeroPhotoUrl || null);
      setHeroPhotoFile(null);
      onShowToast('Informasi undangan berhasil disimpan ke Supabase!');
    } catch (err: unknown) {
      let msg = err instanceof Error ? err.message : 'Gagal menyimpan informasi undangan.';
      if (uploadedPath && !informationSaved) {
        try {
          await deleteFileFromStorage(uploadedPath);
        } catch (cleanupError) {
          const detail =
            cleanupError instanceof Error ? cleanupError.message : 'Kesalahan tidak diketahui.';
          msg = `${msg} File yang gagal disimpan belum dapat dibersihkan: ${detail}`;
        }
      }
      onShowToast(msg);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Intro Header */}
      <div className="p-5 rounded-3xl bg-white border border-[#FCBF49]/40 shadow-xs">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="w-4 h-4 text-[#D62828]" />
          <h2 className="text-base font-extrabold text-[#2B2D42]">
            Kelola Informasi Acara Undangan
          </h2>
        </div>
        <p className="text-xs text-[#5C403D]">
          Ubah nama anak, orang tua, tanggal, waktu, lokasi, dan kalimat undangan. Perubahan akan langsung tersimpan ke Supabase dan tercermin di halaman utama.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Form Column */}
        <div className="lg:col-span-7">
          <form
            onSubmit={handleSubmit}
            className="card-storybook rounded-3xl p-6 bg-white border border-[#FCBF49]/40 space-y-4"
          >
            {/* Child's Name */}
            <div>
              <label className="block text-xs font-bold text-[#2B2D42] mb-1.5 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-[#D62828]" />
                <span>Nama Anak yang Dikhitan *</span>
              </label>
              <input
                type="text"
                name="child_name"
                required
                value={formData.child_name}
                onChange={handleChange}
                placeholder="Contoh: Faqih Al-Arif Billah"
                className="w-full min-h-[44px] px-3.5 rounded-xl bg-[#FFF9F2] border border-[#FCBF49]/40 text-xs font-bold text-[#2B2D42] focus:outline-none focus:ring-2 focus:ring-[#D62828]"
              />
            </div>

            {/* Parents' Names */}
            <div>
              <label className="block text-xs font-bold text-[#2B2D42] mb-1.5 flex items-center gap-1.5">
                <Heart className="w-3.5 h-3.5 text-[#D62828]" />
                <span>Nama Orang Tua *</span>
              </label>
              <input
                type="text"
                name="parents_name"
                required
                value={formData.parents_name}
                onChange={handleChange}
                placeholder="Contoh: Bpk. Dede Nurjaya & Ibu Ruslinawati"
                className="w-full min-h-[44px] px-3.5 rounded-xl bg-[#FFF9F2] border border-[#FCBF49]/40 text-xs font-medium text-[#2B2D42] focus:outline-none focus:ring-2 focus:ring-[#D62828]"
              />
            </div>

            {/* Date and Time */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#2B2D42] mb-1.5 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#D62828]" />
                  <span>Hari &amp; Tanggal Acara *</span>
                </label>
                <input
                  type="text"
                  name="event_day_date"
                  required
                  value={formData.event_day_date}
                  onChange={handleChange}
                  placeholder="Contoh: Sabtu, 19 Desember 2026"
                  className="w-full min-h-[44px] px-3.5 rounded-xl bg-[#FFF9F2] border border-[#FCBF49]/40 text-xs font-medium text-[#2B2D42] focus:outline-none focus:ring-2 focus:ring-[#D62828]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2B2D42] mb-1.5 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#D62828]" />
                  <span>Waktu Acara *</span>
                </label>
                <input
                  type="text"
                  name="event_time"
                  required
                  value={formData.event_time}
                  onChange={handleChange}
                  placeholder="Contoh: 18.00 – 00.00 WIB"
                  className="w-full min-h-[44px] px-3.5 rounded-xl bg-[#FFF9F2] border border-[#FCBF49]/40 text-xs font-medium text-[#2B2D42] focus:outline-none focus:ring-2 focus:ring-[#D62828]"
                />
              </div>
            </div>

            {/* Venue Name */}
            <div>
              <label className="block text-xs font-bold text-[#2B2D42] mb-1.5 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#D62828]" />
                <span>Nama Lokasi / Tempat Acara *</span>
              </label>
              <input
                type="text"
                name="event_venue"
                required
                value={formData.event_venue}
                onChange={handleChange}
                placeholder="Contoh: Lumé Coffee, Tebet"
                className="w-full min-h-[44px] px-3.5 rounded-xl bg-[#FFF9F2] border border-[#FCBF49]/40 text-xs font-bold text-[#2B2D42] focus:outline-none focus:ring-2 focus:ring-[#D62828]"
              />
            </div>

            {/* Full Address */}
            <div>
              <label className="block text-xs font-bold text-[#2B2D42] mb-1.5 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#D62828]" />
                <span>Alamat Lengkap *</span>
              </label>
              <textarea
                name="event_address"
                rows={2}
                required
                value={formData.event_address}
                onChange={handleChange}
                placeholder="Alamat lengkap lokasi acara..."
                className="w-full p-3.5 rounded-xl bg-[#FFF9F2] border border-[#FCBF49]/40 text-xs text-[#2B2D42] focus:outline-none focus:ring-2 focus:ring-[#D62828]"
              />
            </div>

            {/* Invitation Message */}
            <div>
              <label className="block text-xs font-bold text-[#2B2D42] mb-1.5 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-[#D62828]" />
                <span>Pesan atau Kalimat Undangan *</span>
              </label>
              <textarea
                name="invitation_message"
                rows={4}
                required
                value={formData.invitation_message}
                onChange={handleChange}
                placeholder="Tuliskan kata sambutan dan doa untuk tamu undangan..."
                className="w-full p-3.5 rounded-xl bg-[#FFF9F2] border border-[#FCBF49]/40 text-xs leading-relaxed text-[#2B2D42] focus:outline-none focus:ring-2 focus:ring-[#D62828]"
              />
            </div>

            {/* Hero Photo Ticket */}
            <div>
              <label className="block text-xs font-bold text-[#2B2D42] mb-1.5 flex items-center gap-1.5">
                <Camera className="w-3.5 h-3.5 text-[#D62828]" />
                <span>Foto Utama Faqih (Bingkai Tiket Kereta)</span>
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleHeroPhotoChange}
                className="hidden"
              />
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="min-h-[40px] px-4 rounded-full bg-[#FFF9F2] hover:bg-[#FFDEA9]/50 border border-[#FCBF49]/60 text-xs font-bold text-[#2B2D42] inline-flex items-center gap-2"
                >
                  <Upload className="w-3.5 h-3.5 text-[#D62828]" />
                  <span>{heroPhotoPreview ? 'Ganti Foto Utama' : 'Pilih Foto Utama'}</span>
                </button>
                {heroPhotoPreview && (
                  <button
                    type="button"
                    onClick={() => {
                      setHeroPhotoPreview(null);
                      setHeroPhotoFile(null);
                      setFormData((prev) => ({
                        ...prev,
                        hero_photo_url: null,
                        hero_photo_path: null,
                      }));
                    }}
                    className="text-xs text-[#D62828] hover:underline"
                  >
                    Hapus Foto
                  </button>
                )}
              </div>
            </div>

            {/* Google Maps Link & Embed */}
            <div className="pt-2 border-t border-[#FCBF49]/20 space-y-3">
              <div>
                <label className="block text-xs font-bold text-[#2B2D42] mb-1">Pengingat untuk Pengunjung</label>
                <textarea rows={3} name="tumbler_reminder" value={formData.tumbler_reminder || ''} onChange={handleChange} placeholder="Mohon membawa tumbler pribadi yang sudah diisi air putih..." className="w-full p-3 rounded-xl bg-[#FFF9F2] border border-[#FCBF49]/40 text-xs text-[#2B2D42] focus:outline-none focus:ring-2 focus:ring-[#D62828]" />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#2B2D42] mb-1">
                  Link Google Maps (Tombol Buka Peta)
                </label>
                <input
                  type="url"
                  name="maps_url"
                  value={formData.maps_url || ''}
                  onChange={handleChange}
                  placeholder="https://maps.google.com/..."
                  className="w-full min-h-[40px] px-3.5 rounded-xl bg-[#FFF9F2] border border-[#FCBF49]/40 text-xs text-[#2B2D42] focus:outline-none focus:ring-2 focus:ring-[#D62828]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2B2D42] mb-1">
                  URL Embed Google Maps (Peta Interaktif)
                </label>
                <input
                  type="text"
                  name="maps_embed_url"
                  value={formData.maps_embed_url || ''}
                  onChange={handleChange}
                  placeholder="https://maps.google.com/maps?q=... atau link embed"
                  className="w-full min-h-[40px] px-3.5 rounded-xl bg-[#FFF9F2] border border-[#FCBF49]/40 text-xs text-[#2B2D42] focus:outline-none focus:ring-2 focus:ring-[#D62828]"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4 border-t border-[#FCBF49]/30">
              <button
                type="submit"
                disabled={isSaving}
                className="btn-tactile-red w-full min-h-[48px] rounded-full text-xs font-extrabold uppercase tracking-wider inline-flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 shadow-md"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Menyimpan ke Supabase...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Simpan Perubahan Informasi</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Live Preview Column */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-4 rounded-2xl bg-[#FFF9F2] border border-[#FCBF49]/40">
            <p className="text-[11px] font-extrabold uppercase tracking-wider text-[#7D5800] mb-1">
              Pratinjau Langsung (Live Preview)
            </p>
            <p className="text-xs text-[#5C403D]">
              Tampilan simulasi tiket dan sambutan dengan data di samping:
            </p>
          </div>

          {/* Mini Boarding Pass Ticket Preview */}
          <div className="card-ticket rounded-3xl overflow-hidden bg-white border border-[#FCBF49]/60 shadow-md">
            <div className="bg-[#D62828] text-white p-3.5 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#FFDEA9]">
                  Tiket Keberangkatan
                </p>
                <p className="text-xs font-bold">No. KHT-2026-01</p>
              </div>
              <span className="text-[10px] bg-[#FCBF49] text-[#271900] px-2 py-0.5 rounded-full font-black">
                PREVIEW
              </span>
            </div>

            <div className="p-4 text-center bg-gradient-to-b from-[#E4F6FF]/40 to-white">
              {/* Photo preview */}
              <div className="w-24 h-28 mx-auto rounded-t-full rounded-b-xl overflow-hidden border-2 border-[#D62828] bg-[#FFF9F2] mb-2.5 shadow-sm">
                {heroPhotoPreview ? (
                  <img
                    src={heroPhotoPreview}
                    alt="Hero"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center p-2 text-center text-[#906F6B]">
                    <Camera className="w-6 h-6 mb-1 opacity-70" />
                    <span className="text-[9px] font-bold">Foto Faqih</span>
                  </div>
                )}
              </div>

              <h3 className="text-lg font-black text-[#2B2D42]">
                {formData.child_name || 'Nama Anak'}
              </h3>
              <p className="text-xs text-[#5C403D] mt-0.5">
                Putra tercinta dari{' '}
                <span className="font-bold text-[#2B2D42]">
                  {formData.parents_name || 'Nama Orang Tua'}
                </span>
              </p>
            </div>

            <div className="border-t border-dashed border-[#FCBF49] p-3.5 bg-[#FFF9F2] text-left space-y-2">
              <div>
                <p className="text-[10px] font-bold uppercase text-[#7D5800]">
                  Waktu &amp; Tanggal
                </p>
                <p className="text-xs font-extrabold text-[#2B2D42]">
                  {formData.event_day_date} · {formData.event_time}
                </p>
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase text-[#7D5800]">
                  Lokasi Stasiun
                </p>
                <p className="text-xs font-extrabold text-[#2B2D42]">
                  {formData.event_venue}
                </p>
                <p className="text-[11px] text-[#5C403D] line-clamp-2 mt-0.5">
                  {formData.event_address}
                </p>
              </div>
            </div>
          </div>

          {/* Invitation Message Preview Card */}
          <div className="card-storybook rounded-3xl p-4 bg-white border border-[#FCBF49]/40">
            <p className="text-[10px] font-bold uppercase text-[#7D5800] mb-1">
              Pratinjau Pesan Sambutan
            </p>
            <p className="text-xs text-[#2B2D42] leading-relaxed italic bg-[#FFF9F2] p-3 rounded-xl border border-[#FCBF49]/30">
              "{formData.invitation_message}"
            </p>
          </div>
        </div>
      </div>
      {cropFile && <PhotoCropper file={cropFile} aspect={6 / 7} onCancel={() => setCropFile(null)} onSave={(cropped) => { setHeroPhotoFile(cropped); setHeroPhotoPreview(URL.createObjectURL(cropped)); setCropFile(null); }} />}
    </div>
  );
};
