import React, { useRef, useState } from 'react';
import { Check, Loader2, Upload } from 'lucide-react';
import { useInvitationData } from '../../context/InvitationContext';
import { deleteFileFromStorage, uploadFileToStorage } from '../../utils/supabase';
import { PhotoCropper } from './PhotoCropper';

export const QrisManager: React.FC<{ onShowToast: (message: string) => void }> = ({ onShowToast }) => {
  const { invitationInfo, updateInvitationInfo, isSupabaseConfigured } = useInvitationData();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [cropFile, setCropFile] = useState<File | null>(null);
  const input = useRef<HTMLInputElement>(null);

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!file || !isSupabaseConfigured) return onShowToast('Pilih foto dan pastikan Supabase sudah dikonfigurasi.');
    setBusy(true);
    let path: string | null = null;
    let saved = false;
    try {
      const uploaded = await uploadFileToStorage(file, 'qris');
      path = uploaded.path;
      await updateInvitationInfo({ qris_photo_url: uploaded.publicUrl, qris_photo_path: uploaded.path });
      saved = true;
      if (invitationInfo.qris_photo_path) await deleteFileFromStorage(invitationInfo.qris_photo_path);
      setFile(null);
      setPreview(null);
      onShowToast('Foto QRIS terbaru tersimpan di Supabase.');
    } catch (error) {
      if (path && !saved) await deleteFileFromStorage(path).catch(() => undefined);
      onShowToast(error instanceof Error ? error.message : 'Foto QRIS gagal disimpan.');
    } finally { setBusy(false); }
  };

  return <form onSubmit={save} className="max-w-2xl space-y-5 rounded-3xl border border-[#FCBF49]/40 bg-white p-6">
    <div><h2 className="text-base font-extrabold">Foto QRIS</h2><p className="mt-1 text-xs text-[#5C403D]">Unggah gambar QRIS yang benar agar pengunjung dapat memindainya.</p></div>
    <img src={preview || invitationInfo.qris_photo_url || ''} alt="Pratinjau QRIS" className={`${preview || invitationInfo.qris_photo_url ? 'block' : 'hidden'} mx-auto max-h-80 max-w-full rounded-xl object-contain`} />
    <input ref={input} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={(e) => { const selected = e.target.files?.[0]; if (selected) setCropFile(selected); e.target.value = ''; }} />
    <button type="button" onClick={() => input.current?.click()} className="min-h-11 rounded-full border border-[#FCBF49]/60 px-4 text-xs font-bold"><Upload className="mr-2 inline h-4 w-4"/>Pilih Foto QRIS</button>
    <div><button disabled={busy || !file} className="btn-tactile-red min-h-11 rounded-full px-5 text-xs font-bold disabled:opacity-50">{busy ? <Loader2 className="mr-2 inline h-4 w-4 animate-spin"/> : <Check className="mr-2 inline h-4 w-4"/>}Simpan ke Supabase</button></div>
    {cropFile && <PhotoCropper file={cropFile} aspect={1} onCancel={() => setCropFile(null)} onSave={(cropped) => { setFile(cropped); setPreview(URL.createObjectURL(cropped)); setCropFile(null); }} />}
  </form>;
};
