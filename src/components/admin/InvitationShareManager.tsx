import React, { useMemo, useState } from 'react';
import { Clipboard, ExternalLink, Send } from 'lucide-react';
import { useInvitationData } from '../../context/InvitationContext';

export const InvitationShareManager: React.FC<{ onShowToast: (message: string) => void }> = ({ onShowToast }) => {
  const { invitationInfo } = useInvitationData();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const personalUrl = useMemo(() => {
    if (!name.trim() || typeof window === 'undefined') return '';
    const url = new URL('/', window.location.origin);
    url.searchParams.set('to', name.trim());
    return url.toString();
  }, [name]);
  const normalizedPhone = phone.replace(/[^\d+]/g, '').replace(/^\+/, '').replace(/^0/, '62');
  const message = `Yth. ${name.trim() || 'Bapak/Ibu/Saudara/i'},\n\nDengan hormat, kami mengundang Bapak/Ibu untuk hadir dalam acara khitanan ${invitationInfo.child_name}.\n\nAcara akan berlangsung pada ${invitationInfo.event_day_date}, ${invitationInfo.event_time} di ${invitationInfo.event_venue}.\n\nInformasi lengkap mengenai acara dapat dilihat melalui undangan berikut:\n${personalUrl}\n\nMerupakan suatu kebahagiaan bagi kami apabila Bapak/Ibu berkenan hadir.`;
  const whatsappUrl = `https://wa.me/${normalizedPhone}?text=${encodeURIComponent(message)}`;
  const copyLink = async () => {
    if (!personalUrl) return onShowToast('Masukkan nama penerima terlebih dahulu.');
    try { await navigator.clipboard.writeText(personalUrl); onShowToast('Link personal tersalin.'); }
    catch { onShowToast('Tidak dapat menyalin link pada browser ini.'); }
  };

  return <section className="max-w-2xl space-y-5 rounded-3xl border border-[#FCBF49]/40 bg-white p-6">
    <div><h2 className="text-base font-extrabold">Buat dan Bagikan Undangan</h2><p className="mt-1 text-xs text-[#5C403D]">WhatsApp akan terbuka dengan pesan siap diperiksa dan dikirim oleh admin.</p></div>
    <label className="block text-xs font-bold">Nama penerima<input value={name} onChange={(event) => setName(event.target.value)} placeholder="Keluarga Bapak Andi" className="mt-1 min-h-11 w-full rounded-xl border border-[#FCBF49]/50 bg-[#FFF9F2] px-3 text-sm font-normal"/></label>
    <label className="block text-xs font-bold">Nomor WhatsApp<input type="tel" value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="08xxxxxxxxxx atau +628xxxxxxxxxx" className="mt-1 min-h-11 w-full rounded-xl border border-[#FCBF49]/50 bg-[#FFF9F2] px-3 text-sm font-normal"/><span className="mt-1 block font-normal text-[#906F6B]">Nomor lokal berawalan 0 akan diubah ke kode negara Indonesia (62).</span></label>
    {personalUrl && <div className="break-all rounded-xl bg-[#FFF9F2] p-3 text-xs text-[#5C403D]">{personalUrl}</div>}
    <div className="flex flex-wrap gap-2"><button type="button" disabled={!personalUrl} onClick={copyLink} className="min-h-11 rounded-full border border-[#FCBF49]/60 px-4 text-xs font-bold disabled:opacity-50"><Clipboard className="mr-2 inline h-4 w-4"/>Salin Link</button><a aria-disabled={!personalUrl || !normalizedPhone} onClick={(event) => { if (!personalUrl || !normalizedPhone) { event.preventDefault(); onShowToast('Isi nama dan nomor WhatsApp terlebih dahulu.'); } }} href={personalUrl && normalizedPhone ? whatsappUrl : undefined} target="_blank" rel="noopener noreferrer" className={`btn-tactile-red flex min-h-11 items-center rounded-full px-4 text-xs font-bold ${!personalUrl || !normalizedPhone ? 'pointer-events-auto opacity-50' : ''}`}><Send className="mr-2 h-4 w-4"/>Buka WhatsApp</a>{personalUrl && <a href={personalUrl} target="_blank" rel="noopener noreferrer" className="flex min-h-11 items-center rounded-full px-4 text-xs font-bold text-[#5C403D]"><ExternalLink className="mr-2 h-4 w-4"/>Pratinjau</a>}</div>
  </section>;
};
