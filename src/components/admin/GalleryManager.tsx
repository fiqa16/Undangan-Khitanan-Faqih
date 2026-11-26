import React, { useState, useRef } from 'react';
import {
  Camera,
  Trash2,
  Edit2,
  Plus,
  X,
  Upload,
  AlertCircle,
  Check,
  Loader2,
  Sparkles,
} from 'lucide-react';
import { useInvitationData } from '../../context/InvitationContext';
import {
  deleteFileFromStorage,
  GalleryPhoto,
  uploadFileToStorage,
} from '../../utils/supabase';
import { PhotoCropper } from './PhotoCropper';

interface GalleryManagerProps {
  onShowToast: (message: string) => void;
}

export const GalleryManager: React.FC<GalleryManagerProps> = ({ onShowToast }) => {
  const {
    galleryPhotos,
    addGalleryPhoto,
    updateGalleryPhoto,
    deleteGalleryPhoto,
    reorderGalleryPhotos,
    isSupabaseConfigured,
    refreshData,
  } = useInvitationData();
  const savedPhotos = galleryPhotos.filter((photo) => !photo.id.startsWith('default-'));

  const movePhoto = async (photo: GalleryPhoto, direction: -1 | 1) => {
    const index = savedPhotos.findIndex((item) => item.id === photo.id);
    const target = index + direction;
    if (target < 0 || target >= savedPhotos.length) return;
    const reordered = [...savedPhotos];
    [reordered[index], reordered[target]] = [reordered[target], reordered[index]];
    try { await reorderGalleryPhotos(reordered); }
    catch (error) { onShowToast(error instanceof Error ? error.message : 'Gagal mengatur urutan galeri.'); }
  };

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingPhoto, setEditingPhoto] = useState<GalleryPhoto | null>(null);
  const [photoToDelete, setPhotoToDelete] = useState<GalleryPhoto | null>(null);

  // Form states for Add/Edit
  const [formTitle, setFormTitle] = useState('');
  const [formCaption, setFormCaption] = useState('');
  const [formCarriageNo, setFormCarriageNo] = useState('');
  const [formTagLabel, setFormTagLabel] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [cropFile, setCropFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Open Add Modal
  const handleOpenAdd = () => {
    const nextIndex = savedPhotos.length + 1;
    setFormTitle(`Momen Faqih 0${nextIndex}`);
    setFormCaption('Cerita momen bahagia ananda Faqih bersama keluarga dan sahabat tercinta.');
    setFormCarriageNo(`Gerbong 0${nextIndex}`);
    setFormTagLabel('Kenangan');
    setPreviewUrl(null);
    setSelectedFile(null);
    setUploadError(null);
    setIsAddModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (photo: GalleryPhoto) => {
    setEditingPhoto(photo);
    setFormTitle(photo.title);
    setFormCaption(photo.caption || '');
    setFormCarriageNo(photo.carriage_no || '');
    setFormTagLabel(photo.tag_label || '');
    setPreviewUrl(photo.image_url);
    setSelectedFile(null);
  };

  // Handle file select & preview
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      onShowToast('Harap pilih file gambar (JPG, PNG, WebP).');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      onShowToast('Ukuran file foto maksimal 5MB.');
      return;
    }

    setCropFile(file);
    setUploadError(null);
  };

  // Save Add
  const handleSaveAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      onShowToast('Judul foto wajib diisi.');
      return;
    }

    if (!selectedFile) {
      onShowToast('Harap pilih foto yang ingin diunggah dari perangkat.');
      return;
    }
    if (!isSupabaseConfigured) {
      onShowToast('Supabase belum dikonfigurasi; foto tidak dapat diunggah.');
      return;
    }

    setIsProcessing(true);
    setUploadError(null);
    let uploadedPath: string | null = null;
    try {
      const uploadResult = await uploadFileToStorage(selectedFile, 'gallery');
      uploadedPath = uploadResult.path;

      await addGalleryPhoto({
        title: formTitle.trim(),
        caption: formCaption.trim(),
        carriage_no: formCarriageNo.trim() || `Gerbong 0${savedPhotos.length + 1}`,
        tag_label: formTagLabel.trim() || 'Kenangan',
        image_url: uploadResult.publicUrl,
        storage_path: uploadResult.path,
        order_index: savedPhotos.length + 1,
      });

      onShowToast('Foto baru berhasil ditambahkan ke galeri!');
      setIsAddModalOpen(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal menyimpan foto.';
      if (uploadedPath) {
        try {
          await deleteFileFromStorage(uploadedPath);
        } catch (cleanupError) {
          const cleanupMessage =
            cleanupError instanceof Error ? cleanupError.message : 'Kesalahan tidak diketahui.';
          setUploadError(`${msg} File yang gagal disimpan juga belum dapat dibersihkan: ${cleanupMessage}`);
          onShowToast(`${msg} File sementara belum dapat dihapus dari Storage.`);
          return;
        }
      }
      setUploadError(msg);
      onShowToast(msg);
    } finally {
      setIsProcessing(false);
    }
  };

  // Save Edit
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPhoto) return;
    if (!isSupabaseConfigured) {
      onShowToast('Supabase belum dikonfigurasi; foto tidak dapat diperbarui.');
      return;
    }

    setIsProcessing(true);
    setUploadError(null);
    let uploadedPath: string | null = null;
    let updateSaved = false;
    try {
      let finalImageUrl = editingPhoto.image_url;
      let storagePath = editingPhoto.storage_path;

      if (selectedFile) {
        const uploadResult = await uploadFileToStorage(selectedFile, 'gallery');
        uploadedPath = uploadResult.path;
        finalImageUrl = uploadResult.publicUrl;
        storagePath = uploadResult.path;
      }

      await updateGalleryPhoto(editingPhoto.id, {
        title: formTitle.trim(),
        caption: formCaption.trim(),
        carriage_no: formCarriageNo.trim(),
        tag_label: formTagLabel.trim(),
        image_url: finalImageUrl,
        storage_path: storagePath,
      });
      updateSaved = true;

      if (editingPhoto.storage_path && editingPhoto.storage_path !== storagePath) {
        try {
          await deleteFileFromStorage(editingPhoto.storage_path);
        } catch (cleanupError) {
          const detail =
            cleanupError instanceof Error ? cleanupError.message : 'Kesalahan tidak diketahui.';
          setEditingPhoto(null);
          setUploadError(`Foto baru tersimpan, tetapi foto lama belum terhapus: ${detail}`);
          onShowToast(`Foto baru tersimpan, tetapi file foto lama belum terhapus.`);
          return;
        }
      }
      onShowToast('Perubahan foto berhasil disimpan!');
      setEditingPhoto(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal memperbarui foto.';
      if (uploadedPath && !updateSaved) {
        try {
          await deleteFileFromStorage(uploadedPath);
        } catch (cleanupError) {
          const detail =
            cleanupError instanceof Error ? cleanupError.message : 'Kesalahan tidak diketahui.';
          const combinedMessage = `${msg} File yang gagal disimpan belum dapat dibersihkan: ${detail}`;
          setUploadError(combinedMessage);
          onShowToast(combinedMessage);
          return;
        }
      }
      setUploadError(msg);
      onShowToast(msg);
    } finally {
      setIsProcessing(false);
    }
  };

  // Confirm Delete
  const handleConfirmDelete = async () => {
    if (!photoToDelete) return;
    if (!isSupabaseConfigured) {
      onShowToast('Supabase belum dikonfigurasi; foto tidak dapat dihapus.');
      return;
    }

    setIsProcessing(true);
    setUploadError(null);
    try {
      await deleteGalleryPhoto(photoToDelete.id, photoToDelete.storage_path);
      onShowToast(`Foto "${photoToDelete.title}" berhasil dihapus.`);
      setPhotoToDelete(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal menghapus foto.';
      setUploadError(msg);
      try {
        await refreshData();
      } catch (refreshError) {
        const detail =
          refreshError instanceof Error ? refreshError.message : 'Data belum dapat dimuat ulang.';
        setUploadError(`${msg} ${detail}`);
      }
      onShowToast(msg);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl bg-white border border-[#FCBF49]/40 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-4 h-4 text-[#D62828]" />
            <h2 className="text-base font-extrabold text-[#2B2D42]">
              Daftar Foto Gerbong Galeri ({galleryPhotos.length} Foto)
            </h2>
          </div>
          <p className="text-xs text-[#5C403D]">
            Foto yang ada di sini akan langsung ditampilkan di bagian gerbong kereta pada website undangan.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          className="btn-tactile-red min-h-[44px] px-4 py-2.5 rounded-full text-xs font-bold inline-flex items-center justify-center gap-2 shrink-0 cursor-pointer shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Foto Baru</span>
        </button>
      </div>

      {/* Photos Grid */}
      {uploadError && (
        <div role="alert" className="p-3 rounded-xl bg-[#FFEAE8] border border-[#FFCCD0] text-xs text-[#A61E1E]">
          {uploadError}
        </div>
      )}
      {savedPhotos.length === 0 ? (
        <div className="card-storybook rounded-3xl p-8 bg-white border border-[#FCBF49]/40 text-center">
          <Camera className="w-8 h-8 text-[#D62828] mx-auto mb-2" />
          <p className="text-sm font-bold text-[#2B2D42]">Belum ada foto yang tersimpan.</p>
          <p className="text-xs text-[#5C403D] mt-1">Tambahkan foto untuk menampilkannya di galeri undangan.</p>
        </div>
      ) : (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {savedPhotos.map((photo, idx) => (
          <div
            key={photo.id}
            className="card-storybook rounded-3xl p-4 bg-white border border-[#FCBF49]/40 flex flex-col justify-between group hover:border-[#FCBF49] transition-all"
          >
            <div>
              {/* Carriage & Tag Header */}
              <div className="flex items-center justify-between text-[11px] font-bold text-[#7D5800] mb-2 px-1">
                <span>{photo.carriage_no || `Gerbong 0${idx + 1}`}</span>
                <span className="px-2 py-0.5 rounded-full bg-[#FFF9F2] border border-[#FCBF49]/50 text-[10px]">
                  {photo.tag_label || 'Kenangan'}
                </span>
              </div>

              {/* Photo Image Preview */}
              <div className="relative w-full aspect-[6/5] rounded-2xl overflow-hidden border-2 border-[#2B2D42] bg-[#FFF9F2] mb-3">
                {photo.image_url ? (
                  <img
                    src={photo.image_url}
                    alt={photo.title}
                    className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center p-3 text-center bg-gradient-to-b from-[#E4F6FF]/70 to-[#FFF9F2]">
                    <Camera className="w-8 h-8 text-[#906F6B] mb-1.5 opacity-60" />
                    <span className="text-xs font-bold text-[#5C403D]">Ilustrasi Default Gerbong</span>
                    <span className="text-[10px] text-[#906F6B]">Belum ada foto yang diunggah</span>
                  </div>
                )}
              </div>

              {/* Title & Caption */}
              <h3 className="text-sm font-extrabold text-[#2B2D42] line-clamp-1">
                {photo.title}
              </h3>
              <p className="text-xs text-[#5C403D] mt-1 line-clamp-2 leading-relaxed">
                {photo.caption || 'Tidak ada keterangan'}
              </p>
            </div>

            {/* Actions: Edit & Delete */}
            <div className="mt-4 pt-3 border-t border-[#FCBF49]/30 flex items-center justify-between gap-2">
              <div className="flex gap-1">
                <button type="button" onClick={() => void movePhoto(photo, -1)} disabled={idx === 0} aria-label={`Naikkan urutan ${photo.title}`} className="min-h-[38px] rounded-full border px-2 text-xs disabled:opacity-40">↑</button>
                <button type="button" onClick={() => void movePhoto(photo, 1)} disabled={idx === savedPhotos.length - 1} aria-label={`Turunkan urutan ${photo.title}`} className="min-h-[38px] rounded-full border px-2 text-xs disabled:opacity-40">↓</button>
              </div>
              <button
                type="button"
                onClick={() => handleOpenEdit(photo)}
                className="flex-1 min-h-[38px] px-3 rounded-full bg-[#FFF9F2] hover:bg-[#FFDEA9]/50 border border-[#FCBF49]/60 text-xs font-bold text-[#2B2D42] inline-flex items-center justify-center gap-1.5 transition-colors"
              >
                <Edit2 className="w-3.5 h-3.5 text-[#7D5800]" />
                <span>Ubah</span>
              </button>

              <button
                type="button"
                onClick={() => setPhotoToDelete(photo)}
                className="min-h-[38px] px-3 rounded-full bg-white hover:bg-[#FFEAE8] border border-[#FFCCD0] text-xs font-bold text-[#D62828] inline-flex items-center justify-center gap-1.5 transition-colors"
                aria-label={`Hapus foto ${photo.title}`}
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Hapus</span>
              </button>
            </div>
          </div>
        ))}
      </div>
      )}

      {/* Modal: Tambah Foto Baru */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#181A2E]/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 border-2 border-[#FCBF49] shadow-2xl animate-in zoom-in-95 duration-200 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-[#FCBF49]/30 mb-4">
              <h3 className="text-base font-extrabold text-[#2B2D42]">
                Tambah Foto Galeri Baru
              </h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-full text-[#5C403D] hover:bg-[#FFF9F2]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAdd} className="space-y-4">
              {/* Photo Upload & Preview Box */}
              <div>
                <label className="block text-xs font-bold text-[#2B2D42] mb-1.5">
                  Foto dari Perangkat *
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />

                {previewUrl ? (
                  <div className="relative rounded-2xl overflow-hidden border-2 border-[#2B2D42] aspect-[16/10] bg-[#FFF9F2] group">
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-4 py-2 rounded-full bg-white text-xs font-bold text-[#2B2D42] shadow-md inline-flex items-center gap-1.5"
                      >
                        <Camera className="w-4 h-4 text-[#D62828]" />
                        <span>Ganti Gambar</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full h-44 rounded-2xl border-2 border-dashed border-[#FCBF49] bg-[#FFF9F2] hover:bg-[#FFDEA9]/25 flex flex-col items-center justify-center p-4 transition-colors cursor-pointer"
                  >
                    <div className="w-12 h-12 rounded-full bg-[#FCBF49]/30 text-[#D62828] flex items-center justify-center mb-2">
                      <Upload className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-bold text-[#2B2D42]">
                      Pilih Foto dari Komputer / HP
                    </span>
                    <span className="text-[11px] text-[#5C403D] mt-1">
                      Mendukung JPG, PNG, WebP (Maksimal 5MB)
                    </span>
                  </button>
                )}
              </div>

              {/* Title & Tag Label */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#2B2D42] mb-1">
                    Label Gerbong
                  </label>
                  <input
                    type="text"
                    value={formCarriageNo}
                    onChange={(e) => setFormCarriageNo(e.target.value)}
                    placeholder="Contoh: Gerbong 07"
                    className="w-full min-h-[42px] px-3 rounded-xl bg-[#FFF9F2] border border-[#FCBF49]/40 text-xs text-[#2B2D42] focus:outline-none focus:ring-2 focus:ring-[#D62828]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#2B2D42] mb-1">
                    Kategori / Tag
                  </label>
                  <input
                    type="text"
                    value={formTagLabel}
                    onChange={(e) => setFormTagLabel(e.target.value)}
                    placeholder="Contoh: Sahabat, Keluarga"
                    className="w-full min-h-[42px] px-3 rounded-xl bg-[#FFF9F2] border border-[#FCBF49]/40 text-xs text-[#2B2D42] focus:outline-none focus:ring-2 focus:ring-[#D62828]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2B2D42] mb-1">
                  Judul Foto *
                </label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="Contoh: Senyum Ceria Masinis Cilik"
                  className="w-full min-h-[42px] px-3 rounded-xl bg-[#FFF9F2] border border-[#FCBF49]/40 text-xs text-[#2B2D42] focus:outline-none focus:ring-2 focus:ring-[#D62828]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2B2D42] mb-1">
                  Keterangan Foto (Caption)
                </label>
                <textarea
                  rows={3}
                  value={formCaption}
                  onChange={(e) => setFormCaption(e.target.value)}
                  placeholder="Ceritakan momen di balik foto ini..."
                  className="w-full p-3 rounded-xl bg-[#FFF9F2] border border-[#FCBF49]/40 text-xs text-[#2B2D42] focus:outline-none focus:ring-2 focus:ring-[#D62828]"
                />
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#FCBF49]/30">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  disabled={isProcessing}
                  className="min-h-[42px] px-4 rounded-full border border-[#5C403D]/20 text-xs font-bold text-[#5C403D] hover:bg-gray-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="btn-tactile-red min-h-[42px] px-6 rounded-full text-xs font-bold inline-flex items-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Mengunggah...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Simpan Foto</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Ubah / Ganti Foto */}
      {editingPhoto && (
        <div className="fixed inset-0 z-50 bg-[#181A2E]/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 border-2 border-[#FCBF49] shadow-2xl animate-in zoom-in-95 duration-200 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-[#FCBF49]/30 mb-4">
              <h3 className="text-base font-extrabold text-[#2B2D42]">
                Ubah Foto: {editingPhoto.title}
              </h3>
              <button
                type="button"
                onClick={() => setEditingPhoto(null)}
                className="p-1 rounded-full text-[#5C403D] hover:bg-[#FFF9F2]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              {/* Photo Preview & Replace */}
              <div>
                <label className="block text-xs font-bold text-[#2B2D42] mb-1.5">
                  Foto Saat Ini / Ganti Foto Baru
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />

                <div className="relative rounded-2xl overflow-hidden border-2 border-[#2B2D42] aspect-[16/10] bg-[#FFF9F2] group">
                  {previewUrl ? (
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-[#906F6B]">
                      Foto Default
                    </div>
                  )}

                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2 rounded-full bg-white text-xs font-bold text-[#2B2D42] shadow-md inline-flex items-center gap-1.5"
                    >
                      <Camera className="w-4 h-4 text-[#D62828]" />
                      <span>Pilih Foto Pengganti</span>
                    </button>
                  </div>
                </div>

                <div className="mt-2 text-center">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-xs font-bold text-[#D62828] hover:underline inline-flex items-center gap-1"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload foto baru untuk mengganti gambar di atas</span>
                  </button>
                </div>
              </div>

              {/* Carriage & Tag Label */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#2B2D42] mb-1">
                    Label Gerbong
                  </label>
                  <input
                    type="text"
                    value={formCarriageNo}
                    onChange={(e) => setFormCarriageNo(e.target.value)}
                    className="w-full min-h-[42px] px-3 rounded-xl bg-[#FFF9F2] border border-[#FCBF49]/40 text-xs text-[#2B2D42] focus:outline-none focus:ring-2 focus:ring-[#D62828]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#2B2D42] mb-1">
                    Kategori / Tag
                  </label>
                  <input
                    type="text"
                    value={formTagLabel}
                    onChange={(e) => setFormTagLabel(e.target.value)}
                    className="w-full min-h-[42px] px-3 rounded-xl bg-[#FFF9F2] border border-[#FCBF49]/40 text-xs text-[#2B2D42] focus:outline-none focus:ring-2 focus:ring-[#D62828]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2B2D42] mb-1">
                  Judul Foto *
                </label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full min-h-[42px] px-3 rounded-xl bg-[#FFF9F2] border border-[#FCBF49]/40 text-xs text-[#2B2D42] focus:outline-none focus:ring-2 focus:ring-[#D62828]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2B2D42] mb-1">
                  Keterangan Foto (Caption)
                </label>
                <textarea
                  rows={3}
                  value={formCaption}
                  onChange={(e) => setFormCaption(e.target.value)}
                  className="w-full p-3 rounded-xl bg-[#FFF9F2] border border-[#FCBF49]/40 text-xs text-[#2B2D42] focus:outline-none focus:ring-2 focus:ring-[#D62828]"
                />
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#FCBF49]/30">
                <button
                  type="button"
                  onClick={() => setEditingPhoto(null)}
                  disabled={isProcessing}
                  className="min-h-[42px] px-4 rounded-full border border-[#5C403D]/20 text-xs font-bold text-[#5C403D] hover:bg-gray-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="btn-tactile-red min-h-[42px] px-6 rounded-full text-xs font-bold inline-flex items-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Simpan Perubahan</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Dialog: Konfirmasi Hapus Foto */}
      {photoToDelete && (
        <div className="fixed inset-0 z-50 bg-[#181A2E]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 border-2 border-[#FCBF49] shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-full bg-[#FFEAE8] text-[#D62828] flex items-center justify-center mx-auto mb-3">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-extrabold text-[#2B2D42] text-center">
              Hapus Foto Ini?
            </h3>
            <p className="text-xs text-[#5C403D] text-center mt-1 mb-5">
              Apakah Anda yakin ingin menghapus foto{' '}
              <span className="font-bold text-[#2B2D42]">"{photoToDelete.title}"</span>? Foto akan dihapus dari Supabase Storage dan website undangan.
            </p>

            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setPhotoToDelete(null)}
                disabled={isProcessing}
                className="min-h-[42px] px-5 rounded-full border border-[#5C403D]/20 text-xs font-bold text-[#5C403D] hover:bg-gray-100"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isProcessing}
                className="min-h-[42px] px-6 rounded-full bg-[#D62828] text-white text-xs font-bold inline-flex items-center gap-2 hover:bg-[#B20112] transition-colors"
              >
                {isProcessing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
                <span>Ya, Hapus</span>
              </button>
            </div>
          </div>
        </div>
      )}
      {cropFile && <PhotoCropper file={cropFile} aspect={1.2} onCancel={() => setCropFile(null)} onSave={(cropped) => { setSelectedFile(cropped); setPreviewUrl(URL.createObjectURL(cropped)); setCropFile(null); }} />}
    </div>
  );
};
