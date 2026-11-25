import React, { useState } from 'react';
import {
  TrainFront,
  Plus,
  Edit2,
  Trash2,
  ArrowUp,
  ArrowDown,
  Check,
  X,
  Clock,
  Calendar,
  Sparkles,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { useInvitationData } from '../../context/InvitationContext';
import { RundownItem } from '../../utils/supabase';

interface RundownManagerProps {
  onShowToast: (message: string) => void;
}

export const RundownManager: React.FC<RundownManagerProps> = ({ onShowToast }) => {
  const {
    rundownItems,
    isRundownLoading,
    addRundownItem,
    updateRundownItem,
    deleteRundownItem,
    reorderRundownItems,
    publishRundown,
  } = useInvitationData();

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<RundownItem | null>(null);
  const [itemToDelete, setItemToDelete] = useState<RundownItem | null>(null);

  // Form states
  const [formActivityName, setFormActivityName] = useState('');
  const [formStartTime, setFormStartTime] = useState('');
  const [formEndTime, setFormEndTime] = useState('');
  const [formDuration, setFormDuration] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [isFormProcessing, setIsFormProcessing] = useState(false);

  // Determine if rundown is fully or partially published
  const hasPublishedItems = rundownItems.some((item) => item.is_published);
  const allPublished = rundownItems.length > 0 && rundownItems.every((item) => item.is_published);

  // Open Add Modal
  const handleOpenAdd = () => {
    setFormActivityName('');
    setFormStartTime('');
    setFormEndTime('');
    setFormDuration('');
    setFormDescription('');
    setIsAddModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (item: RundownItem) => {
    setEditingItem(item);
    setFormActivityName(item.activity_name);
    setFormStartTime(item.start_time);
    setFormEndTime(item.end_time || '');
    setFormDuration(item.duration || '');
    setFormDescription(item.description || '');
  };

  // Save Add
  const handleSaveAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formActivityName.trim() || !formStartTime.trim()) {
      onShowToast('Nama kegiatan dan waktu mulai wajib diisi.');
      return;
    }

    setIsFormProcessing(true);
    try {
      await addRundownItem({
        activity_name: formActivityName.trim(),
        start_time: formStartTime.trim(),
        end_time: formEndTime.trim() || null,
        duration: formDuration.trim() || null,
        description: formDescription.trim() || null,
        order_index: rundownItems.length + 1,
        is_published: false, // Default saved as draft until published
      });

      onShowToast('Kegiatan baru berhasil ditambahkan sebagai draf.');
      setIsAddModalOpen(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal menambahkan kegiatan.';
      onShowToast(msg);
    } finally {
      setIsFormProcessing(false);
    }
  };

  // Save Edit
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    if (!formActivityName.trim() || !formStartTime.trim()) {
      onShowToast('Nama kegiatan dan waktu mulai wajib diisi.');
      return;
    }

    setIsFormProcessing(true);
    try {
      await updateRundownItem(editingItem.id, {
        activity_name: formActivityName.trim(),
        start_time: formStartTime.trim(),
        end_time: formEndTime.trim() || null,
        duration: formDuration.trim() || null,
        description: formDescription.trim() || null,
      });

      onShowToast('Perubahan kegiatan berhasil disimpan.');
      setEditingItem(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal mengubah kegiatan.';
      onShowToast(msg);
    } finally {
      setIsFormProcessing(false);
    }
  };

  // Move Up
  const handleMoveUp = async (index: number) => {
    if (index === 0) return;
    const newItems = [...rundownItems];
    const temp = newItems[index];
    newItems[index] = newItems[index - 1];
    newItems[index - 1] = temp;
    try {
      await reorderRundownItems(newItems);
    } catch (err: unknown) {
      onShowToast(err instanceof Error ? err.message : 'Gagal mengubah urutan rundown.');
    }
  };

  // Move Down
  const handleMoveDown = async (index: number) => {
    if (index === rundownItems.length - 1) return;
    const newItems = [...rundownItems];
    const temp = newItems[index];
    newItems[index] = newItems[index + 1];
    newItems[index + 1] = temp;
    try {
      await reorderRundownItems(newItems);
    } catch (err: unknown) {
      onShowToast(err instanceof Error ? err.message : 'Gagal mengubah urutan rundown.');
    }
  };

  // Confirm Delete
  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;

    try {
      await deleteRundownItem(itemToDelete.id);
      onShowToast(`Kegiatan "${itemToDelete.activity_name}" berhasil dihapus.`);
      setItemToDelete(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal menghapus kegiatan.';
      onShowToast(msg);
    }
  };

  // Toggle Publish
  const handleTogglePublish = async (targetPublish: boolean) => {
    try {
      await publishRundown(targetPublish);
      if (targetPublish) {
        onShowToast('Rundown berhasil DITERBITKAN ke website utama!');
      } else {
        onShowToast('Rundown dialihkan menjadi DRAF (disembunyikan dari pengunjung).');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal mengubah status publikasi.';
      onShowToast(msg);
    }
  };

  return (
    <div className="space-y-6">
      {/* Action Header */}
      <div className="p-5 rounded-3xl bg-white border border-[#FCBF49]/40 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <TrainFront className="w-4 h-4 text-[#D62828]" />
            <h2 className="text-base font-extrabold text-[#2B2D42]">
              Kelola Rundown Acara ({rundownItems.length} Kegiatan)
            </h2>
            {hasPublishedItems ? (
              <span className="px-2.5 py-0.5 rounded-full bg-[#EBFBEE] text-[#2B8A3E] border border-[#B2F2BB] text-[10px] font-extrabold flex items-center gap-1">
                <Eye className="w-3 h-3" />
                <span>Terbit di Website</span>
              </span>
            ) : hasPublishedItems ? (
              <span className="px-2.5 py-0.5 rounded-full bg-[#E4F6FF] text-[#005F76] border border-[#4CC9F0]/40 text-[10px] font-extrabold flex items-center gap-1">
                <span>Sebagian Terbit</span>
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded-full bg-[#FFF3CD] text-[#856404] border border-[#FFEEBA] text-[10px] font-extrabold flex items-center gap-1">
                <EyeOff className="w-3 h-3" />
                <span>Draf (Belum Terbit)</span>
              </span>
            )}
          </div>
          <p className="text-xs text-[#5C403D]">
            Atur urutan, jam, dan deskripsi kegiatan. Pengunjung hanya akan melihat jadwal di website jika Anda menekan tombol <strong>Publikasikan Rundown</strong>.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {/* Toggle Publish Button */}
          {allPublished ? (
            <button
              type="button"
              onClick={() => handleTogglePublish(false)}
              disabled={isRundownLoading}
              className="min-h-[40px] px-3.5 rounded-full bg-white hover:bg-[#FFF1EF] border border-[#E5BDB9] text-xs font-bold text-[#D62828] inline-flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <EyeOff className="w-3.5 h-3.5" />
              <span>Tarik ke Draf</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => handleTogglePublish(true)}
              disabled={isRundownLoading || rundownItems.length === 0}
              className="min-h-[40px] px-4 rounded-full bg-[#2B8A3E] hover:bg-[#237032] text-white text-xs font-bold inline-flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Publikasikan Rundown</span>
            </button>
          )}

          {/* Add Item Button */}
          <button
            type="button"
            onClick={handleOpenAdd}
            className="btn-tactile-red min-h-[40px] px-4 rounded-full text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Kegiatan</span>
          </button>
        </div>
      </div>

      {/* Info notice about draft / discussion mode */}
      <div className="p-4 rounded-2xl bg-[#FFF9F2] border border-[#FCBF49]/50 text-xs text-[#5C403D] flex items-start gap-3">
        <AlertCircle className="w-4 h-4 text-[#D62828] shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold text-[#7D5800]">
            Tahap Diskusi Jadwal:
          </p>
          <p className="text-[11px] leading-relaxed">
            Jadwal draf tidak ditampilkan di website utama. Masukkan susunan final sendiri, lalu publikasikan saat sudah siap.
          </p>
        </div>
      </div>

      {/* Rundown Items List */}
      {rundownItems.length === 0 ? (
        <div className="card-storybook rounded-3xl p-8 bg-white border border-[#FCBF49]/40 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-[#FFF9F2] text-[#D62828] flex items-center justify-center mx-auto border border-[#FCBF49]/60">
            <TrainFront className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-extrabold text-[#2B2D42]">
            Belum Ada Kegiatan di Rundown
          </h3>
          <p className="text-xs text-[#5C403D] max-w-md mx-auto">
            Belum ada kegiatan. Tambahkan jadwal final saat sudah disepakati.
          </p>
          <div className="pt-2 flex flex-wrap items-center justify-center gap-2">
            <button
              type="button"
              onClick={handleOpenAdd}
              className="btn-tactile-red min-h-[38px] px-4 rounded-full text-xs font-bold inline-flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Kegiatan</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {rundownItems.map((item, index) => (
            <div
              key={item.id}
              className="card-storybook rounded-2xl p-4 bg-white border border-[#FCBF49]/40 hover:border-[#FCBF49] transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
            >
              {/* Left: Sequence number & details */}
              <div className="flex items-start gap-3 min-w-0">
                <div className="w-8 h-8 rounded-full bg-[#D62828] text-white font-extrabold text-xs flex items-center justify-center border-2 border-[#FCBF49] shrink-0 mt-0.5 shadow-xs">
                  {String(index + 1).padStart(2, '0')}
                </div>

                <div className="min-w-0 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-extrabold text-[#005F76] tabular-nums">
                      {item.start_time}
                      {item.end_time ? ` – ${item.end_time} WIB` : ' WIB'}
                    </span>
                    {item.duration && (
                      <span className="px-2 py-0.5 rounded-full bg-[#FFF9F2] border border-[#FCBF49]/50 text-[10px] font-bold text-[#7D5800]">
                        {item.duration}
                      </span>
                    )}
                    {item.is_published ? (
                      <span className="px-2 py-0.5 rounded-full bg-[#EBFBEE] text-[#2B8A3E] text-[10px] font-bold">
                        Terbit
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-[#FFF3CD] text-[#856404] text-[10px] font-bold">
                        Draf
                      </span>
                    )}
                  </div>

                  <h4 className="text-sm font-extrabold text-[#2B2D42]">
                    {item.activity_name}
                  </h4>

                  {item.description && (
                    <p className="text-xs text-[#5C403D] leading-relaxed">
                      {item.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Right: Actions (Reorder, Edit, Delete) */}
              <div className="flex items-center justify-end gap-1.5 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#FCBF49]/30">
                {/* Move Up */}
                <button
                  type="button"
                  onClick={() => handleMoveUp(index)}
                  disabled={index === 0}
                  className="w-8 h-8 rounded-full bg-[#FFF9F2] hover:bg-[#FFDEA9]/50 text-[#2B2D42] border border-[#FCBF49]/50 flex items-center justify-center disabled:opacity-30 disabled:pointer-events-none"
                  title="Pindah ke atas"
                >
                  <ArrowUp className="w-3.5 h-3.5" />
                </button>

                {/* Move Down */}
                <button
                  type="button"
                  onClick={() => handleMoveDown(index)}
                  disabled={index === rundownItems.length - 1}
                  className="w-8 h-8 rounded-full bg-[#FFF9F2] hover:bg-[#FFDEA9]/50 text-[#2B2D42] border border-[#FCBF49]/50 flex items-center justify-center disabled:opacity-30 disabled:pointer-events-none"
                  title="Pindah ke bawah"
                >
                  <ArrowDown className="w-3.5 h-3.5" />
                </button>

                {/* Edit */}
                <button
                  type="button"
                  onClick={() => handleOpenEdit(item)}
                  className="min-h-[32px] px-3 rounded-full bg-[#FFF9F2] hover:bg-[#FFDEA9]/50 text-xs font-bold text-[#7D5800] border border-[#FCBF49]/60 inline-flex items-center gap-1 ml-1"
                >
                  <Edit2 className="w-3 h-3 text-[#D62828]" />
                  <span>Ubah</span>
                </button>

                {/* Delete */}
                <button
                  type="button"
                  onClick={() => setItemToDelete(item)}
                  className="w-8 h-8 rounded-full bg-white hover:bg-[#FFEAE8] text-[#D62828] border border-[#FFCCD0] flex items-center justify-center"
                  title="Hapus kegiatan"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal: Tambah Kegiatan */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#181A2E]/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 border-2 border-[#FCBF49] shadow-2xl animate-in zoom-in-95 duration-200 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-[#FCBF49]/30 mb-4">
              <h3 className="text-base font-extrabold text-[#2B2D42]">
                Tambah Kegiatan Rundown
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
              <div>
                <label className="block text-xs font-bold text-[#2B2D42] mb-1">
                  Nama Kegiatan *
                </label>
                <input
                  type="text"
                  required
                  value={formActivityName}
                  onChange={(e) => setFormActivityName(e.target.value)}
                  placeholder="Contoh: Pembukaan oleh MC"
                  className="w-full min-h-[42px] px-3 rounded-xl bg-[#FFF9F2] border border-[#FCBF49]/40 text-xs text-[#2B2D42] focus:outline-none focus:ring-2 focus:ring-[#D62828]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#2B2D42] mb-1">
                    Waktu Mulai *
                  </label>
                  <input
                    type="text"
                    required
                    value={formStartTime}
                    onChange={(e) => setFormStartTime(e.target.value)}
                    placeholder="Contoh: 18.00"
                    className="w-full min-h-[42px] px-3 rounded-xl bg-[#FFF9F2] border border-[#FCBF49]/40 text-xs text-[#2B2D42] focus:outline-none focus:ring-2 focus:ring-[#D62828]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#2B2D42] mb-1">
                    Waktu Selesai (Opsional)
                  </label>
                  <input
                    type="text"
                    value={formEndTime}
                    onChange={(e) => setFormEndTime(e.target.value)}
                    placeholder="Contoh: 19.00"
                    className="w-full min-h-[42px] px-3 rounded-xl bg-[#FFF9F2] border border-[#FCBF49]/40 text-xs text-[#2B2D42] focus:outline-none focus:ring-2 focus:ring-[#D62828]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2B2D42] mb-1">
                  Durasi Waktu (Opsional)
                </label>
                <input
                  type="text"
                  value={formDuration}
                  onChange={(e) => setFormDuration(e.target.value)}
                  placeholder="Contoh: 30 menit / 1 jam"
                  className="w-full min-h-[42px] px-3 rounded-xl bg-[#FFF9F2] border border-[#FCBF49]/40 text-xs text-[#2B2D42] focus:outline-none focus:ring-2 focus:ring-[#D62828]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2B2D42] mb-1">
                  Keterangan / Pelaksana (Opsional)
                </label>
                <textarea
                  rows={2}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Contoh: MC / Keluarga Besar / Ustadz"
                  className="w-full p-3 rounded-xl bg-[#FFF9F2] border border-[#FCBF49]/40 text-xs text-[#2B2D42] focus:outline-none focus:ring-2 focus:ring-[#D62828]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#FCBF49]/30">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  disabled={isFormProcessing}
                  className="min-h-[40px] px-4 rounded-full border border-[#5C403D]/20 text-xs font-bold text-[#5C403D] hover:bg-gray-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isFormProcessing}
                  className="btn-tactile-red min-h-[40px] px-6 rounded-full text-xs font-bold inline-flex items-center gap-1.5"
                >
                  {isFormProcessing ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                  <span>Simpan Kegiatan</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Ubah Kegiatan */}
      {editingItem && (
        <div className="fixed inset-0 z-50 bg-[#181A2E]/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 border-2 border-[#FCBF49] shadow-2xl animate-in zoom-in-95 duration-200 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-[#FCBF49]/30 mb-4">
              <h3 className="text-base font-extrabold text-[#2B2D42]">
                Ubah Kegiatan Rundown
              </h3>
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                className="p-1 rounded-full text-[#5C403D] hover:bg-[#FFF9F2]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#2B2D42] mb-1">
                  Nama Kegiatan *
                </label>
                <input
                  type="text"
                  required
                  value={formActivityName}
                  onChange={(e) => setFormActivityName(e.target.value)}
                  className="w-full min-h-[42px] px-3 rounded-xl bg-[#FFF9F2] border border-[#FCBF49]/40 text-xs text-[#2B2D42] focus:outline-none focus:ring-2 focus:ring-[#D62828]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#2B2D42] mb-1">
                    Waktu Mulai *
                  </label>
                  <input
                    type="text"
                    required
                    value={formStartTime}
                    onChange={(e) => setFormStartTime(e.target.value)}
                    className="w-full min-h-[42px] px-3 rounded-xl bg-[#FFF9F2] border border-[#FCBF49]/40 text-xs text-[#2B2D42] focus:outline-none focus:ring-2 focus:ring-[#D62828]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#2B2D42] mb-1">
                    Waktu Selesai (Opsional)
                  </label>
                  <input
                    type="text"
                    value={formEndTime}
                    onChange={(e) => setFormEndTime(e.target.value)}
                    className="w-full min-h-[42px] px-3 rounded-xl bg-[#FFF9F2] border border-[#FCBF49]/40 text-xs text-[#2B2D42] focus:outline-none focus:ring-2 focus:ring-[#D62828]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2B2D42] mb-1">
                  Durasi Waktu (Opsional)
                </label>
                <input
                  type="text"
                  value={formDuration}
                  onChange={(e) => setFormDuration(e.target.value)}
                  className="w-full min-h-[42px] px-3 rounded-xl bg-[#FFF9F2] border border-[#FCBF49]/40 text-xs text-[#2B2D42] focus:outline-none focus:ring-2 focus:ring-[#D62828]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2B2D42] mb-1">
                  Keterangan / Pelaksana (Opsional)
                </label>
                <textarea
                  rows={2}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full p-3 rounded-xl bg-[#FFF9F2] border border-[#FCBF49]/40 text-xs text-[#2B2D42] focus:outline-none focus:ring-2 focus:ring-[#D62828]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#FCBF49]/30">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  disabled={isFormProcessing}
                  className="min-h-[40px] px-4 rounded-full border border-[#5C403D]/20 text-xs font-bold text-[#5C403D] hover:bg-gray-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isFormProcessing}
                  className="btn-tactile-red min-h-[40px] px-6 rounded-full text-xs font-bold inline-flex items-center gap-1.5"
                >
                  {isFormProcessing ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                  <span>Simpan Perubahan</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Konfirmasi Hapus */}
      {itemToDelete && (
        <div
          className="fixed inset-0 z-50 bg-[#181A2E]/60 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setItemToDelete(null)}
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
                Hapus Kegiatan Ini?
              </h3>
              <p className="text-xs text-[#5C403D]">
                "{itemToDelete.activity_name}" akan dihapus dari rundown acara.
              </p>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setItemToDelete(null)}
                className="flex-1 min-h-[40px] px-4 rounded-full border border-[#5C403D]/20 text-xs font-bold text-[#5C403D] hover:bg-gray-100"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="flex-1 min-h-[40px] px-4 rounded-full bg-[#D62828] hover:bg-[#E63946] text-white text-xs font-bold"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
