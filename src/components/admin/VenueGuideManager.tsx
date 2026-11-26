import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Check, Loader2, Trash2, Upload } from 'lucide-react';
import { PhotoCropper } from './PhotoCropper';
import { deleteFileFromStorage, isSupabaseConfigured, supabase, uploadFileToStorage, VenueGuideCategory, VenueGuidePhoto } from '../../utils/supabase';
import { useInvitationData } from '../../context/InvitationContext';

const categoryLabels: Record<VenueGuideCategory, string> = { stairs: 'Akses tangga cafe', lift: 'Akses lift gedung sebelah', cafe: 'Suasana dan galeri Lumé Coffee' };

const compressImage = async (file: File): Promise<File> => {
  const image = await createImageBitmap(file);
  const scale = Math.min(1, 1920 / Math.max(image.width, image.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(image.width * scale); canvas.height = Math.round(image.height * scale);
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Browser tidak dapat memproses gambar.');
  context.drawImage(image, 0, 0, canvas.width, canvas.height); image.close();
  const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob((result) => result ? resolve(result) : reject(new Error('Kompresi gambar gagal.')), 'image/webp', 0.86));
  return new File([blob], `${file.name.replace(/\.[^.]+$/, '')}.webp`, { type: 'image/webp' });
};

export const VenueGuideManager: React.FC<{ onShowToast: (message: string) => void }> = ({ onShowToast }) => {
  const { invitationInfo, updateInvitationInfo } = useInvitationData();
  const [photos, setPhotos] = useState<VenueGuidePhoto[]>([]);
  const [category, setCategory] = useState<VenueGuideCategory>('stairs');
  const [description, setDescription] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [cropFile, setCropFile] = useState<File | null>(null);
  const [bulkCropIndex, setBulkCropIndex] = useState<number | null>(null);
  const [pendingReplace, setPendingReplace] = useState<VenueGuidePhoto | null>(null);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.from('venue_guide_photos').select('*').order('order_index', { ascending: true });
    if (error) onShowToast(`Panduan belum dapat dimuat. Jalankan migrasi konten venue: ${error.message}`);
    else setPhotos((data || []) as VenueGuidePhoto[]);
    setLoading(false);
  }, [onShowToast]);
  useEffect(() => { void reload(); }, [reload]);

  const uploadSelected = async (selected: File[]) => {
    if (!selected.length) return;
    if (!isSupabaseConfigured) return onShowToast('Supabase belum dikonfigurasi.');
    setBusy(true);
    const uploadedPaths: string[] = [];
    try {
      const firstOrder = photos.length;
      for (const [index, file] of selected.entries()) {
        const optimized = await compressImage(file);
        const upload = await uploadFileToStorage(optimized, 'venue');
        uploadedPaths.push(upload.path);
        const cleanTitle = file.name.replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' ');
        const { error } = await supabase.from('venue_guide_photos').insert({ category, title: cleanTitle, description: description.trim(), image_url: upload.publicUrl, storage_path: upload.path, order_index: firstOrder + index + 1, is_published: false });
        if (error) throw new Error(error.message);
      }
      setFiles([]); setDescription('');
      await reload();
      onShowToast(`${selected.length} foto tersimpan sebagai draft. Pilih Publikasikan untuk menampilkannya.`);
    } catch (error) {
      onShowToast(error instanceof Error ? error.message : 'Upload foto panduan gagal.');
      // Keep uploaded objects: a database request can fail after another image was already saved.
      void uploadedPaths;
    } finally { setBusy(false); }
  };

  const patchPhoto = async (photo: VenueGuidePhoto, updates: Partial<VenueGuidePhoto>) => {
    const { data, error } = await supabase.from('venue_guide_photos').update(updates).eq('id', photo.id).select().single();
    if (error || !data) return onShowToast(`Gagal menyimpan foto: ${error?.message || 'data tidak ditemukan'}`);
    setPhotos((previous) => previous.map((item) => item.id === photo.id ? data as VenueGuidePhoto : item));
  };

  const removePhoto = async (photo: VenueGuidePhoto) => {
    if (!window.confirm(`Hapus foto “${photo.title}” dari panduan?`)) return;
    const { error } = await supabase.from('venue_guide_photos').delete().eq('id', photo.id);
    if (error) return onShowToast(`Gagal menghapus foto: ${error.message}`);
    setPhotos((previous) => previous.filter((item) => item.id !== photo.id));
    if (photo.storage_path) await deleteFileFromStorage(photo.storage_path).catch((e: unknown) => onShowToast(e instanceof Error ? e.message : 'File Storage belum terhapus.'));
  };

  const replacePhoto = async (photo: VenueGuidePhoto, file: File) => {
    setBusy(true);
    let nextPath: string | null = null;
    try {
      const optimized = await compressImage(file);
      const upload = await uploadFileToStorage(optimized, 'venue'); nextPath = upload.path;
      const { error } = await supabase.from('venue_guide_photos').update({ image_url: upload.publicUrl, storage_path: upload.path }).eq('id', photo.id);
      if (error) throw new Error(error.message);
      if (photo.storage_path) await deleteFileFromStorage(photo.storage_path).catch(() => undefined);
      await reload(); onShowToast('Foto panduan berhasil diganti.');
    } catch (error) {
      if (nextPath) await deleteFileFromStorage(nextPath).catch(() => undefined);
      onShowToast(error instanceof Error ? error.message : 'Gagal mengganti foto.');
    } finally { setBusy(false); }
  };

  const saveDirections = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setBusy(true);
    try {
      const form = new FormData(event.currentTarget);
      const videoUrl = String(form.get('video') || '').trim();
      if (videoUrl && new URL(videoUrl).protocol !== 'https:') throw new Error('Link video harus menggunakan HTTPS.');
      await updateInvitationInfo({ venue_building_floor: String(form.get('building') || ''), venue_stairs_instructions: String(form.get('stairs') || ''), venue_lift_instructions: String(form.get('lift') || ''), venue_video_url: videoUrl });
      onShowToast('Informasi petunjuk lokasi tersimpan.');
    } catch (error) { onShowToast(error instanceof Error ? error.message : 'Gagal menyimpan informasi lokasi.'); }
    finally { setBusy(false); }
  };

  return <div className="space-y-5">
    <section className="rounded-3xl border border-[#FCBF49]/40 bg-white p-5"><h2 className="text-base font-extrabold">Panduan Lokasi &amp; Venue</h2><p className="mt-1 text-xs text-[#5C403D]">Unggah foto asli yang Anda ambil sendiri. Foto baru disimpan sebagai draft hingga dipublikasikan.</p>
      <form onSubmit={saveDirections} className="mt-4 grid gap-3 sm:grid-cols-2">
        <label className="text-xs font-bold">Nama gedung dan lantai<input name="building" defaultValue={invitationInfo.venue_building_floor || ''} placeholder="Isi bila sudah diketahui" className="mt-1 min-h-10 w-full rounded-xl border bg-[#FFF9F2] px-3 font-normal"/></label>
        <label className="text-xs font-bold">Petunjuk melalui tangga<textarea name="stairs" rows={2} defaultValue={invitationInfo.venue_stairs_instructions || ''} placeholder="Petunjuk tangga cafe" className="mt-1 w-full rounded-xl border bg-[#FFF9F2] p-3 font-normal"/></label>
        <label className="text-xs font-bold">Petunjuk melalui lift<textarea name="lift" rows={2} defaultValue={invitationInfo.venue_lift_instructions || ''} placeholder="Petunjuk lift gedung sebelah" className="mt-1 w-full rounded-xl border bg-[#FFF9F2] p-3 font-normal"/></label>
        <label className="text-xs font-bold">Link video eksternal (opsional, HTTPS)<input name="video" type="url" defaultValue={invitationInfo.venue_video_url || ''} placeholder="https://..." className="mt-1 min-h-10 w-full rounded-xl border bg-[#FFF9F2] px-3 font-normal"/></label>
        <button disabled={busy} className="min-h-10 self-end rounded-full bg-[#D62828] px-4 text-xs font-bold text-white disabled:opacity-60">Simpan Petunjuk</button>
      </form>
    </section>
    <form onSubmit={(event) => { event.preventDefault(); void uploadSelected(files); }} className="space-y-3 rounded-3xl border border-[#FCBF49]/40 bg-white p-5">
      <h3 className="text-sm font-extrabold">Tambah Foto Panduan</h3>
      <div className="grid gap-3 sm:grid-cols-2"><label className="text-xs font-bold">Kategori<select value={category} onChange={(event) => setCategory(event.target.value as VenueGuideCategory)} className="mt-1 min-h-10 w-full rounded-xl border bg-[#FFF9F2] px-3">{Object.entries(categoryLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label><label className="text-xs font-bold">Deskripsi awal (opsional)<input value={description} onChange={(event) => setDescription(event.target.value)} className="mt-1 min-h-10 w-full rounded-xl border bg-[#FFF9F2] px-3 font-normal"/></label></div>
      <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" multiple className="hidden" onChange={(event) => setFiles(Array.from(event.target.files || []))}/>
      <button type="button" onClick={() => inputRef.current?.click()} className="min-h-11 rounded-full border border-[#FCBF49]/60 px-4 text-xs font-bold"><Upload className="mr-2 inline h-4 w-4"/>Pilih beberapa foto</button><span className="ml-3 text-xs text-[#5C403D]">{files.length ? `${files.length} foto dipilih` : 'JPG, PNG, WebP'}</span>
      <button type="button" disabled={busy || !files.length} onClick={() => setBulkCropIndex(0)} className="block min-h-11 rounded-full bg-[#D62828] px-5 text-xs font-bold text-white disabled:opacity-50">{busy ? <><Loader2 className="mr-2 inline h-4 w-4 animate-spin"/>Menyimpan...</> : `Atur crop${files.length > 1 ? ` (${files.length} foto)` : ''} & Unggah sebagai Draft`}</button>
    </form>
    <div className="space-y-3">{loading ? <p className="text-xs">Memuat foto panduan...</p> : photos.map((photo) => <article key={photo.id} className="grid gap-3 rounded-2xl border border-[#FCBF49]/40 bg-white p-4 sm:grid-cols-[150px_1fr]">
      <img src={photo.image_url} alt={photo.title} className="aspect-[16/10] w-full rounded-xl object-cover"/>
      <div className="space-y-2"><div className="grid gap-2 sm:grid-cols-2"><select aria-label="Kategori foto" value={photo.category} onChange={(event) => void patchPhoto(photo, { category: event.target.value as VenueGuideCategory })} className="min-h-9 rounded-lg border px-2 text-xs">{Object.entries(categoryLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select><input aria-label="Urutan foto" type="number" min="1" value={photo.order_index} onChange={(event) => setPhotos((previous) => previous.map((item) => item.id === photo.id ? { ...item, order_index: Number(event.target.value) } : item))} onBlur={(event) => void patchPhoto(photo, { order_index: Number(event.target.value) })} className="min-h-9 rounded-lg border px-2 text-xs"/></div>
      <input aria-label="Judul foto" value={photo.title} onChange={(event) => setPhotos((previous) => previous.map((item) => item.id === photo.id ? { ...item, title: event.target.value } : item))} onBlur={(event) => void patchPhoto(photo, { title: event.target.value })} className="min-h-9 w-full rounded-lg border px-2 text-xs font-bold"/><textarea aria-label="Deskripsi foto" rows={2} value={photo.description || ''} onChange={(event) => setPhotos((previous) => previous.map((item) => item.id === photo.id ? { ...item, description: event.target.value } : item))} onBlur={(event) => void patchPhoto(photo, { description: event.target.value })} className="w-full rounded-lg border p-2 text-xs"/>
      <div className="flex flex-wrap gap-2"><button type="button" disabled={busy} onClick={() => void patchPhoto(photo, { is_published: !photo.is_published })} className={`min-h-9 rounded-full px-3 text-xs font-bold ${photo.is_published ? 'bg-green-100 text-green-800' : 'bg-[#FFF1CF] text-[#7D5800]'}`}><Check className="mr-1 inline h-3.5 w-3.5"/>{photo.is_published ? 'Publik (klik jadikan draft)' : 'Publikasikan'}</button><button type="button" disabled={busy} onClick={() => { const picker = document.createElement('input'); picker.type = 'file'; picker.accept = 'image/jpeg,image/png,image/webp'; picker.onchange = () => { const file = picker.files?.[0]; if (file) setCropFile(file); }; setPendingReplace(photo); picker.click(); }} className="min-h-9 rounded-full border px-3 text-xs font-bold">Ganti / Crop Foto</button><button type="button" onClick={() => void removePhoto(photo)} className="min-h-9 rounded-full border border-red-200 px-3 text-xs font-bold text-red-700"><Trash2 className="mr-1 inline h-3.5 w-3.5"/>Hapus</button></div>
      </div>
    </article>)}</div>
    {cropFile && <PhotoCropper file={cropFile} aspect={1.6} onCancel={() => { setCropFile(null); setPendingReplace(null); }} onSave={(file) => { const target = pendingReplace; setCropFile(null); setPendingReplace(null); if (target) void replacePhoto(target, file); }}/ >}
    {bulkCropIndex !== null && files[bulkCropIndex] && <PhotoCropper file={files[bulkCropIndex]} aspect={1.6} onCancel={() => setBulkCropIndex(null)} onSave={(cropped) => {
      const nextFiles = [...files]; nextFiles[bulkCropIndex] = cropped; setFiles(nextFiles);
      if (bulkCropIndex + 1 < nextFiles.length) setBulkCropIndex(bulkCropIndex + 1);
      else { setBulkCropIndex(null); void uploadSelected(nextFiles); }
    }} />}
  </div>;
};
