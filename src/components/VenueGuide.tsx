import React, { useEffect, useState } from 'react';
import { CupSoda, MapPin, Footprints, TrainFront } from 'lucide-react';
import { useInvitationData } from '../context/InvitationContext';
import { supabase, VenueGuidePhoto } from '../utils/supabase';

const categories = [
  { key: 'stairs', title: 'A. Melalui tangga cafe', Icon: Footprints },
  { key: 'lift', title: 'B. Melalui lift gedung sebelah', Icon: TrainFront },
  { key: 'cafe', title: 'Suasana dan galeri Lumé Coffee', Icon: MapPin },
] as const;

export const VenueGuide: React.FC<{ onShowToast: (message: string) => void }> = ({ onShowToast }) => {
  const { invitationInfo } = useInvitationData();
  const [photos, setPhotos] = useState<VenueGuidePhoto[]>([]);

  useEffect(() => {
    let active = true;
    void supabase.from('venue_guide_photos').select('*').eq('is_published', true)
      .order('order_index', { ascending: true }).then(({ data, error }) => {
        if (!active) return;
        if (error) { console.warn('Panduan venue belum tersedia:', error.message); return; }
        setPhotos((data || []) as VenueGuidePhoto[]);
      });
    return () => { active = false; };
  }, []);

  const embedCandidate = invitationInfo.maps_embed_url || '';
  let safeEmbed = 'https://maps.google.com/maps?q=Lume%20Coffee%20Tebet&t=&z=16&output=embed';
  try {
    const url = new URL(embedCandidate);
    if (url.protocol === 'https:' && ['google.com', 'www.google.com', 'maps.google.com'].includes(url.hostname) && url.pathname.includes('/maps')) safeEmbed = url.toString();
  } catch { /* Use the known safe default. */ }
  let safeMapsLink = 'https://maps.google.com';
  try {
    const url = new URL(invitationInfo.maps_url || '');
    if (url.protocol === 'https:' && ['google.com', 'www.google.com', 'maps.google.com', 'maps.app.goo.gl'].includes(url.hostname)) safeMapsLink = url.toString();
  } catch { /* Use the known safe default. */ }

  const copyAddress = async () => {
    try { await navigator.clipboard.writeText(invitationInfo.event_address); onShowToast('Alamat lokasi tersalin.'); }
    catch { onShowToast(invitationInfo.event_address); }
  };

  return <section id="lokasi" className="space-y-5 px-1" aria-labelledby="venue-guide-heading">
    <div className="card-storybook rounded-3xl p-5">
      <div className="mb-2 flex items-center gap-2 text-[#7D5800]"><MapPin className="h-4 w-4 text-[#D62828]"/><p className="text-[11px] font-bold uppercase tracking-wider">Lokasi Acara</p></div>
      <h2 id="venue-guide-heading" className="mb-3 text-xl font-extrabold text-[#2B2D42]">{invitationInfo.event_venue}</h2>
      {invitationInfo.venue_photo_url && <img src={invitationInfo.venue_photo_url} alt={`Lokasi ${invitationInfo.event_venue}`} loading="lazy" className="mb-3 aspect-[16/10] w-full rounded-2xl border-2 border-[#FCBF49]/45 object-cover"/>}
      {invitationInfo.venue_description && <p className="mb-3 text-sm leading-relaxed text-[#5C403D]">{invitationInfo.venue_description}</p>}
      <div className="mb-3 h-52 overflow-hidden rounded-2xl border-2 border-[#FCBF49]/45"><iframe title={`Peta ${invitationInfo.event_venue}`} src={safeEmbed} loading="lazy" referrerPolicy="no-referrer-when-downgrade" allowFullScreen className="h-full w-full border-0"/></div>
      <p className="text-xs leading-relaxed text-[#5C403D]">{invitationInfo.event_address}</p>
      {invitationInfo.venue_building_floor && <p className="mt-2 text-xs text-[#5C403D]"><b>Gedung dan lantai:</b> {invitationInfo.venue_building_floor}</p>}
      {invitationInfo.venue_video_url && /^https:\/\//i.test(invitationInfo.venue_video_url) && <a href={invitationInfo.venue_video_url} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex min-h-10 items-center rounded-full border border-[#FCBF49]/60 px-4 text-xs font-bold text-[#7D5800]">Lihat video panduan akses</a>}
      <div className="mt-3 grid grid-cols-2 gap-2">
        <a href={safeMapsLink} target="_blank" rel="noopener noreferrer" className="btn-tactile-red flex min-h-11 items-center justify-center gap-2 rounded-full px-3 text-xs font-bold"><MapPin className="h-4 w-4"/>Buka Peta</a>
        <button type="button" onClick={copyAddress} className="min-h-11 rounded-full border border-[#2B2D42]/20 bg-[#FFF9F2] px-3 text-xs font-bold">Salin Alamat</button>
      </div>
    </div>

    <div className="rounded-3xl border border-[#FCBF49]/60 bg-gradient-to-br from-[#FFF1CF] to-white p-5 shadow-sm">
      <div className="mb-2 flex items-center gap-2 text-[#7D5800]"><CupSoda className="h-5 w-5 text-[#D62828]"/><h2 className="text-base font-extrabold">Pengingat untuk Pengunjung</h2></div>
      <p className="text-sm leading-relaxed text-[#5C403D]">{invitationInfo.tumbler_reminder || 'Mohon membawa tumbler pribadi yang sudah diisi air putih untuk kenyamanan selama acara berlangsung.'}</p>
    </div>

    <div className="card-storybook space-y-5 rounded-3xl p-5">
      <div><p className="text-[11px] font-bold uppercase tracking-wider text-[#7D5800]">Panduan Akses</p><h2 className="text-xl font-extrabold text-[#2B2D42]">Panduan Menuju Lumé Coffee</h2><p className="mt-1 text-xs text-[#5C403D]">Pilih akses yang paling nyaman untuk menuju lokasi acara.</p></div>
      {categories.map(({ key, title, Icon }) => {
        const items = photos.filter((photo) => photo.category === key);
        const instruction = key === 'stairs' ? invitationInfo.venue_stairs_instructions : key === 'lift' ? invitationInfo.venue_lift_instructions : '';
        return <section key={key} className="space-y-3">
          <div className="flex items-center gap-2"><Icon className="h-4 w-4 text-[#D62828]"/><h3 className="text-sm font-extrabold text-[#2B2D42]">{title}</h3></div>
          {instruction && <p className="text-xs leading-relaxed text-[#5C403D]">{instruction}</p>}
          {items.length ? <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">{items.map((photo) => <article key={photo.id} className="overflow-hidden rounded-2xl border border-[#FCBF49]/45 bg-white"><img src={photo.image_url} alt={photo.title} loading="lazy" className="aspect-[16/10] w-full object-cover"/><div className="p-3"><h4 className="text-sm font-bold text-[#2B2D42]">{photo.title}</h4>{photo.description && <p className="mt-1 text-xs leading-relaxed text-[#5C403D]">{photo.description}</p>}</div></article>)}</div> : <p className="rounded-xl bg-[#FFF9F2] p-3 text-xs text-[#906F6B]">Foto panduan akan ditampilkan setelah dipublikasikan.</p>}
        </section>;
      })}
    </div>
  </section>;
};
