import React, { useCallback, useEffect, useState } from 'react';
import { Check, Loader2, Pencil, RefreshCw, Search, Trash2, X } from 'lucide-react';
import { supabase } from '../../utils/supabase';

interface GuestResponse {
  id: string;
  guest_name: string;
  attendance_status: 'hadir' | 'doa';
  passenger_count: number;
  message: string | null;
  created_at: string;
}

interface GuestResponseManagerProps {
  mode: 'wishes' | 'rsvp';
  onShowToast: (message: string) => void;
}

export const GuestResponseManager: React.FC<GuestResponseManagerProps> = ({ mode, onShowToast }) => {
  const [rows, setRows] = useState<GuestResponse[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [editing, setEditing] = useState<GuestResponse | null>(null);
  const [editName, setEditName] = useState('');
  const [editMessage, setEditMessage] = useState('');
  const [saving, setSaving] = useState(false);

  const loadRows = useCallback(async (showSpinner = false) => {
    if (showSpinner) setLoading(true);
    const { data, error } = await supabase
      .from('guest_responses')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) {
      setLoadError(`Gagal memuat data. Pastikan migrasi supabase-guest-responses-migration.sql sudah dijalankan dan akun memiliki akses admin. (${error.message})`);
    } else {
      setRows((data || []) as GuestResponse[]);
      setLoadError(null);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void loadRows(true);
    // Periodic refresh makes new submissions appear without manual re-entry or requiring Realtime setup.
    const timer = window.setInterval(() => { void loadRows(); }, 10000);
    const refreshOnFocus = () => { if (document.visibilityState === 'visible') void loadRows(); };
    document.addEventListener('visibilitychange', refreshOnFocus);
    return () => { window.clearInterval(timer); document.removeEventListener('visibilitychange', refreshOnFocus); };
  }, [loadRows]);

  const isWishes = mode === 'wishes';
  const filteredRows = rows.filter((row) => {
    const matchesName = row.guest_name.toLocaleLowerCase('id').includes(query.trim().toLocaleLowerCase('id'));
    return matchesName && (!isWishes || Boolean(row.message?.trim()));
  });
  const confirmedResponses = rows.filter((row) => row.attendance_status === 'hadir').length;
  const totalPassengers = rows.reduce((sum, row) => row.attendance_status === 'hadir' ? sum + row.passenger_count : sum, 0);

  const startEdit = (row: GuestResponse) => {
    setEditing(row); setEditName(row.guest_name); setEditMessage(row.message || '');
  };

  const saveEdit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!editing || !editName.trim() || !editMessage.trim()) return;
    setSaving(true);
    const { error } = await supabase.from('guest_responses').update({ guest_name: editName.trim(), message: editMessage.trim() }).eq('id', editing.id);
    if (error) onShowToast(`Ucapan gagal disimpan: ${error.message}`);
    else { setEditing(null); await loadRows(); onShowToast('Nama dan ucapan berhasil diperbarui.'); }
    setSaving(false);
  };

  const deleteRow = async (row: GuestResponse) => {
    const prompt = isWishes
      ? `Hapus ucapan dari ${row.guest_name}? Data RSVP tamu akan tetap disimpan.`
      : `Hapus data RSVP dari ${row.guest_name}, termasuk ucapan yang terkait?`;
    if (!window.confirm(prompt)) return;
    const result = isWishes
      ? await supabase.from('guest_responses').update({ message: null }).eq('id', row.id)
      : await supabase.from('guest_responses').delete().eq('id', row.id);
    if (result.error) onShowToast(`Data gagal dihapus: ${result.error.message}`);
    else { await loadRows(); onShowToast(isWishes ? 'Ucapan dihapus; data RSVP tetap tersimpan.' : 'Data RSVP berhasil dihapus.'); }
  };

  const clearLegacyBrowserData = () => {
    const confirmed = window.confirm('Hapus data ucapan/RSVP lama yang tersimpan hanya di localStorage browser ini? Ini tidak menghapus data Supabase. Data lokal lama tidak dapat dipulihkan setelah dihapus.');
    if (!confirmed) return;
    window.localStorage.removeItem('choo_choo_khitan_faqih_wishes_v1');
    onShowToast('Data lama di browser ini telah dibersihkan. Data Supabase tidak berubah.');
  };

  return <section className="space-y-5">
    <header className="rounded-3xl border border-[#FCBF49]/40 bg-white p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div><h2 className="text-base font-extrabold">{isWishes ? 'Kelola Ucapan' : 'Data RSVP & Penumpang'}</h2><p className="mt-1 text-xs text-[#5C403D]">Data dibaca langsung dari Supabase dan diperbarui otomatis setiap 10 detik.</p></div>
        <div className="flex flex-wrap gap-2"><button type="button" onClick={() => void loadRows(true)} className="min-h-10 rounded-full border border-[#FCBF49]/60 px-4 text-xs font-bold"><RefreshCw className="mr-2 inline h-3.5 w-3.5"/>Segarkan</button>{isWishes && <button type="button" onClick={clearLegacyBrowserData} className="min-h-10 rounded-full border border-[#FFCCD0] px-4 text-xs font-bold text-[#A61E1E]">Bersihkan data lama browser</button>}</div>
      </div>
      {!isWishes && <div className="mt-4 grid grid-cols-2 gap-3"><div className="rounded-2xl bg-[#FFF1EF] p-4"><p className="text-[11px] font-bold text-[#7D5800]">Tamu mengonfirmasi hadir</p><p className="mt-1 text-2xl font-black text-[#D62828]">{confirmedResponses}</p></div><div className="rounded-2xl bg-[#E4F6FF] p-4"><p className="text-[11px] font-bold text-[#005F76]">Total penumpang hadir</p><p className="mt-1 text-2xl font-black text-[#005F76]">{totalPassengers}</p></div></div>}
    </header>

    {loadError && <div role="alert" className="rounded-2xl border border-[#FFCCD0] bg-[#FFEAE8] p-4 text-xs text-[#A61E1E]">{loadError}</div>}
    {!isWishes && <label className="relative block"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#906F6B]"/><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Cari nama tamu..." className="min-h-11 w-full rounded-xl border border-[#FCBF49]/50 bg-white pl-10 pr-3 text-sm"/></label>}

    {loading ? <div className="flex items-center justify-center gap-2 rounded-2xl bg-white p-8 text-sm text-[#5C403D]"><Loader2 className="h-4 w-4 animate-spin"/>Memuat data Supabase...</div>
      : !loadError && filteredRows.length === 0 ? <div className="rounded-2xl border border-dashed border-[#FCBF49]/60 bg-white p-8 text-center text-sm text-[#5C403D]">{isWishes ? 'Belum ada ucapan dari tamu.' : query ? 'Tidak ada RSVP yang cocok dengan pencarian.' : 'Belum ada data RSVP dari tamu.'}</div>
      : !loadError && <div className="space-y-3">{filteredRows.map((row) => <article key={row.id} className="rounded-2xl border border-[#FCBF49]/40 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3"><div className="min-w-0"><h3 className="break-words text-sm font-extrabold text-[#2B2D42]">{row.guest_name}</h3><p className="mt-1 text-[11px] text-[#906F6B]">{row.created_at ? new Date(row.created_at).toLocaleString('id-ID') : 'Waktu tidak tersedia'}</p></div><div className="flex flex-wrap items-center gap-2"><span className={`rounded-full px-3 py-1 text-[11px] font-bold ${row.attendance_status === 'hadir' ? 'bg-[#EBFBEE] text-[#287A37]' : 'bg-[#E4F6FF] text-[#005F76]'}`}>{row.attendance_status === 'hadir' ? 'Hadir' : 'Titip doa'}</span>{!isWishes && row.attendance_status === 'hadir' && <span className="rounded-full bg-[#FFF1CF] px-3 py-1 text-[11px] font-bold text-[#7D5800]">{row.passenger_count} penumpang</span>}</div></div>
        {isWishes && <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-relaxed text-[#2B2D42]">{row.message}</p>}
        <div className="mt-3 flex justify-end gap-2 border-t border-[#FCBF49]/25 pt-3">{isWishes && <button type="button" onClick={() => startEdit(row)} className="min-h-9 rounded-full border border-[#FCBF49]/60 px-3 text-xs font-bold"><Pencil className="mr-1 inline h-3.5 w-3.5"/>Edit</button>}<button type="button" onClick={() => void deleteRow(row)} className="min-h-9 rounded-full border border-[#FFCCD0] px-3 text-xs font-bold text-[#D62828]"><Trash2 className="mr-1 inline h-3.5 w-3.5"/>Hapus</button></div>
      </article>)}</div>}

    {editing && <div className="fixed inset-0 z-[60] flex items-center justify-center overflow-y-auto bg-[#181A2E]/65 p-4"><form onSubmit={saveEdit} className="w-full max-w-lg space-y-4 rounded-3xl border-2 border-[#FCBF49] bg-white p-6"><div className="flex items-center justify-between"><h3 className="text-base font-extrabold">Edit Ucapan Tamu</h3><button type="button" onClick={() => setEditing(null)} aria-label="Tutup" className="rounded-full p-2"><X className="h-5 w-5"/></button></div><label className="block text-xs font-bold">Nama pengirim<input required value={editName} onChange={(event) => setEditName(event.target.value)} className="mt-1 min-h-11 w-full rounded-xl border bg-[#FFF9F2] px-3 text-sm"/></label><label className="block text-xs font-bold">Isi ucapan<textarea required rows={5} value={editMessage} onChange={(event) => setEditMessage(event.target.value)} className="mt-1 w-full rounded-xl border bg-[#FFF9F2] p-3 text-sm"/></label><div className="flex justify-end gap-2"><button type="button" onClick={() => setEditing(null)} className="min-h-10 rounded-full border px-4 text-xs font-bold">Batal</button><button disabled={saving} className="min-h-10 rounded-full bg-[#D62828] px-5 text-xs font-bold text-white disabled:opacity-50">{saving ? <Loader2 className="mr-1 inline h-4 w-4 animate-spin"/> : <Check className="mr-1 inline h-4 w-4"/>}Simpan</button></div></form></div>}
  </section>;
};
