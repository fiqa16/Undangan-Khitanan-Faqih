import React, { useCallback, useEffect, useState } from 'react';
import { CheckCircle2, Mail, Minus, Plus, Send, Users } from 'lucide-react';
import { isSupabaseConfigured, supabase } from '../utils/supabase';

type AttendanceStatus = 'hadir' | 'doa';
interface WishEntry { id: string; name: string; message: string; createdAt: string; }
interface SubmittedReceipt { name: string; guests: number; status: AttendanceStatus; }
interface RsvpAndWishesProps { defaultGuestName: string; onShowToast: (message: string) => void; onSuccessWhistle: () => void; }

export const RsvpAndWishes: React.FC<RsvpAndWishesProps> = ({ defaultGuestName, onShowToast, onSuccessWhistle }) => {
  const [name, setName] = useState(defaultGuestName !== 'Keluarga & Sahabat Tercinta' ? defaultGuestName : '');
  const [guests, setGuests] = useState(2);
  const [status, setStatus] = useState<AttendanceStatus>('hadir');
  const [message, setMessage] = useState('');
  const [submittedReceipt, setSubmittedReceipt] = useState<SubmittedReceipt | null>(null);
  const [wishes, setWishes] = useState<WishEntry[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [dataError, setDataError] = useState<string | null>(null);

  const refreshPublicData = useCallback(async () => {
    if (!isSupabaseConfigured) { setDataLoading(false); setDataError('Supabase belum dikonfigurasi.'); return; }
    const wishesResult = await supabase.from('public_guest_wishes').select('id, guest_name, message, created_at').order('created_at', { ascending: false });
    if (wishesResult.error) {
      setDataError(wishesResult.error.message || 'Ucapan belum dapat dimuat.');
    } else {
      setWishes((wishesResult.data || []).map((row) => ({
        id: row.id, name: row.guest_name, message: row.message, createdAt: row.created_at,
      })) as WishEntry[]);
      setDataError(null);
    }
    setDataLoading(false);
  }, []);

  useEffect(() => { void refreshPublicData(); }, [refreshPublicData]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const trimmedName = name.trim();
    const trimmedMessage = message.trim();
    if (!trimmedName) { onShowToast('Mohon isi nama lengkap Bapak/Ibu terlebih dahulu.'); return; }
    if (!isSupabaseConfigured) { onShowToast('RSVP belum dapat dikirim karena Supabase belum dikonfigurasi.'); return; }
    setSubmitting(true);
    try {
      const { error } = await supabase.from('guest_responses').insert({
        guest_name: trimmedName,
        attendance_status: status,
        passenger_count: status === 'hadir' ? guests : 0,
        message: trimmedMessage || null,
      });
      if (error) throw new Error(error.message);
      setSubmittedReceipt({ name: trimmedName, guests: status === 'hadir' ? guests : 0, status });
      setMessage('');
      await refreshPublicData();
      onSuccessWhistle();
      onShowToast('Konfirmasi kehadiran berhasil disimpan.');
    } catch (error) {
      onShowToast(`Konfirmasi gagal disimpan: ${error instanceof Error ? error.message : 'Kesalahan tidak diketahui.'}`);
    } finally { setSubmitting(false); }
  };

  return (
    <section id="rsvp" aria-labelledby="rsvp-heading" className="px-1 space-y-5">
      <div className="card-storybook rounded-3xl p-5">
        <div className="flex items-center gap-2 mb-1"><Mail className="w-4 h-4 text-[#D62828]"/><p className="text-[11px] font-bold tracking-[0.06em] uppercase text-[#7D5800]">Konfirmasi Penumpang &amp; Telegram Doa</p></div>
        <h2 id="rsvp-heading" className="text-xl font-extrabold text-[#2B2D42] mb-1 [text-wrap:balance]">Pesan Kursi Kereta Sekarang</h2>
        <p className="text-xs text-[#5C403D] mb-4">Silakan konfirmasi kehadiran dan tuliskan doa untuk Faqih.</p>

        <form onSubmit={(event) => void handleSubmit(event)} className="space-y-4">
          <div><label htmlFor="guest-name-input" className="block text-xs font-bold text-[#2B2D42] mb-1.5">Nama Lengkap Tamu</label><input id="guest-name-input" type="text" value={name} onChange={(event) => setName(event.target.value)} placeholder="Contoh: Bpk. Budi Santoso & Keluarga" className="w-full min-h-[48px] px-4 rounded-2xl bg-[#FFF9F2] border border-[#E5BDB9] text-sm text-[#2B2D42] placeholder:text-[#906F6B]/80 focus:outline-none focus:ring-2 focus:ring-[#4CC9F0]" required/></div>
          <div><span className="block text-xs font-bold text-[#2B2D42] mb-1.5">Status Kehadiran</span><div className="grid grid-cols-2 gap-2.5">
            <button type="button" onClick={() => setStatus('hadir')} aria-pressed={status === 'hadir'} className={`min-h-[54px] px-3 py-2.5 rounded-2xl border-2 text-left transition-all ${status === 'hadir' ? 'border-[#D62828] bg-[#FFF1EF]' : 'border-[#E5BDB9]/70 bg-[#FFF9F2]'}`}><span className="block text-xs font-extrabold">Hadir Siap Berangkat!</span><span className="block text-[11px] text-[#5C403D] mt-0.5">Datang ke LumÃ© Coffee</span></button>
            <button type="button" onClick={() => setStatus('doa')} aria-pressed={status === 'doa'} className={`min-h-[54px] px-3 py-2.5 rounded-2xl border-2 text-left transition-all ${status === 'doa' ? 'border-[#007995] bg-[#E4F6FF]' : 'border-[#E5BDB9]/70 bg-[#FFF9F2]'}`}><span className="block text-xs font-extrabold">Titip Doa Restu</span><span className="block text-[11px] text-[#5C403D] mt-0.5">Berhalangan hadir</span></button>
          </div></div>
          {status === 'hadir' && <div className="flex items-center justify-between bg-[#FFF9F2] rounded-2xl px-4 py-2.5 border border-[#E5BDB9]/70"><div className="flex items-center gap-2"><Users className="w-4 h-4 text-[#D62828]"/><span className="text-xs font-bold text-[#2B2D42]">Jumlah Penumpang</span></div><div className="flex items-center gap-2"><button type="button" onClick={() => setGuests((count) => Math.max(1, count - 1))} className="min-h-[44px] min-w-[44px] rounded-full bg-white border border-[#E5BDB9] flex items-center justify-center" aria-label="Kurangi jumlah tamu"><Minus className="w-4 h-4"/></button><span className="w-8 text-center text-sm font-extrabold tabular-nums">{guests}</span><button type="button" onClick={() => setGuests((count) => Math.min(6, count + 1))} className="min-h-[44px] min-w-[44px] rounded-full bg-white border border-[#E5BDB9] flex items-center justify-center" aria-label="Tambah jumlah tamu"><Plus className="w-4 h-4"/></button></div></div>}
          <div><label htmlFor="guest-wish-input" className="block text-xs font-bold text-[#2B2D42] mb-1.5">Telegram Ucapan &amp; Doa untuk Faqih</label><textarea id="guest-wish-input" rows={3} value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Tuliskan doa terbaik untuk Masinis Cilik Faqih..." className="w-full px-4 py-3 rounded-2xl bg-[#FFF9F2] border border-[#E5BDB9] text-sm text-[#2B2D42] placeholder:text-[#906F6B]/80 focus:outline-none focus:ring-2 focus:ring-[#4CC9F0]"/></div>
          <button type="submit" disabled={submitting} className="btn-tactile-red w-full min-h-[48px] px-5 py-3 rounded-full font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-60"><Send className="w-4 h-4 shrink-0"/><span>{submitting ? 'Menyimpan...' : 'Kirim Konfirmasi & Doa'}</span></button>
        </form>
        {submittedReceipt && <div className="mt-4 rounded-2xl bg-[#E4F6FF] border border-[#4CC9F0]/60 p-3.5 flex items-start gap-2.5"><CheckCircle2 className="w-5 h-5 text-[#005F76] shrink-0 mt-0.5"/><div className="text-xs text-[#2B2D42] leading-relaxed"><p className="font-extrabold">Terima kasih, {submittedReceipt.name}!</p><p className="text-[#005F76]">{submittedReceipt.status === 'hadir' ? `Konfirmasi untuk ${submittedReceipt.guests} penumpang telah tersimpan.` : 'Konfirmasi dan doa restu Anda telah tersimpan.'}</p></div></div>}
      </div>

      <div className="card-storybook rounded-3xl p-5">
        <div className="mb-3.5"><h3 className="text-base font-extrabold text-[#2B2D42]">Telegram Ucapan Tamu</h3><p className="text-xs text-[#5C403D] tabular-nums">{wishes.length} ucapan dari tamu</p></div>
        {dataError && <p role="alert" className="mb-3 rounded-xl bg-[#FFEAE8] p-3 text-xs text-[#A61E1E]">Ucapan belum dapat dimuat. Pastikan migrasi RSVP sudah dijalankan.</p>}
        <div className="space-y-3 max-h-[340px] overflow-y-auto pr-1">{dataLoading ? <p className="py-5 text-center text-xs text-[#5C403D]">Memuat ucapan tamu...</p> : wishes.length === 0 ? <p className="py-5 text-center text-xs text-[#5C403D]">Belum ada ucapan dari tamu.</p> : wishes.map((wish) => <article key={wish.id} className="rounded-2xl bg-[#FFF9F2] border border-dashed border-[#906F6B]/35 p-3.5"><div className="flex items-baseline justify-between gap-2"><h4 className="text-sm font-extrabold text-[#2B2D42] truncate">{wish.name}</h4><span className="text-[11px] text-[#906F6B] shrink-0">{new Date(wish.createdAt).toLocaleString('id-ID')}</span></div><p className="text-sm text-[#2B2D42] leading-relaxed mt-1.5">{wish.message}</p></article>)}</div>
      </div>
    </section>
  );
};
