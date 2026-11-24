import React, {useEffect, useMemo, useState} from 'react';
import {CheckCircle2, Mail, Minus, Plus, Send, Users} from 'lucide-react';

type AttendanceStatus = 'hadir' | 'doa';

interface WishEntry {
  id: string;
  name: string;
  guests: number;
  status: AttendanceStatus;
  message: string;
  createdAt: string;
}

interface RsvpAndWishesProps {
  defaultGuestName: string;
  onShowToast: (message: string) => void;
  onSuccessWhistle: () => void;
}

const STORAGE_KEY = 'choo_choo_khitan_faqih_wishes_v1';

const INITIAL_WISHES: WishEntry[] = [
  {
    id: 'w-1',
    name: 'Ua Hafsah & Keluarga',
    guests: 4,
    status: 'hadir',
    message:
      'Barakallah untuk Masinis Cilik Faqih Al-Arif Billah! Semoga tumbuh menjadi anak sholeh, sehat selalu, dan membanggakan Bapak Dede & Ibu Ruslinawati.',
    createdAt: '2 jam lalu',
  },
  {
    id: 'w-2',
    name: 'Om & Tante Keluarga Tebet',
    guests: 2,
    status: 'hadir',
    message:
      'Tiket sudah siap, sampai bertemu Sabtu malam di Lumé Coffee! Semangat terus ya Faqih hebat.',
    createdAt: '5 jam lalu',
  },
  {
    id: 'w-3',
    name: 'Pak Ustad Ridwan',
    guests: 1,
    status: 'hadir',
    message:
      'InsyaAllah hadir membawakan tausiyah dan doa bersama untuk ananda Faqih agar istiqamah dalam kebaikan.',
    createdAt: 'Kemarin',
  },
];

export const RsvpAndWishes: React.FC<RsvpAndWishesProps> = ({
  defaultGuestName,
  onShowToast,
  onSuccessWhistle,
}) => {
  const [name, setName] = useState(
    defaultGuestName !== 'Keluarga & Sahabat Tercinta' ? defaultGuestName : ''
  );
  const [guests, setGuests] = useState(2);
  const [status, setStatus] = useState<AttendanceStatus>('hadir');
  const [message, setMessage] = useState('');
  const [filter, setFilter] = useState<'all' | AttendanceStatus>('all');
  const [submittedReceipt, setSubmittedReceipt] = useState<WishEntry | null>(null);

  const [wishes, setWishes] = useState<WishEntry[]>(() => {
    if (typeof window === 'undefined') return INITIAL_WISHES;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as WishEntry[];
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // Fallback to initial wishes
    }
    return INITIAL_WISHES;
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(wishes));
    } catch {
      // Ignore storage quota errors
    }
  }, [wishes]);

  const filteredWishes = useMemo(() => {
    if (filter === 'all') return wishes;
    return wishes.filter((w) => w.status === filter);
  }, [filter, wishes]);

  const stats = useMemo(() => {
    const hadirCount = wishes.filter((w) => w.status === 'hadir').length;
    const totalPassengers = wishes
      .filter((w) => w.status === 'hadir')
      .reduce((sum, w) => sum + w.guests, 0);
    return {hadirCount, totalPassengers, totalWishes: wishes.length};
  }, [wishes]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    const trimmedMsg = message.trim();

    if (!trimmedName) {
      onShowToast('Mohon isi nama lengkap Bapak/Ibu terlebih dahulu.');
      return;
    }

    const newEntry: WishEntry = {
      id: `w-${Date.now()}`,
      name: trimmedName,
      guests: status === 'hadir' ? guests : 1,
      status,
      message:
        trimmedMsg ||
        (status === 'hadir'
          ? 'InsyaAllah hadir memeriahkan Walimatul Khitan Faqih!'
          : 'Titip doa restu terbaik untuk ananda Faqih.'),
      createdAt: 'Baru saja',
    };

    setWishes((prev) => [newEntry, ...prev]);
    setSubmittedReceipt(newEntry);
    setMessage('');
    onSuccessWhistle();
    onShowToast('Konfirmasi & telegram doa berhasil dikirim!');
  };

  return (
    <section id="rsvp" aria-labelledby="rsvp-heading" className="px-1 space-y-5">
      {/* RSVP Ticket Form Card */}
      <div className="card-storybook rounded-3xl p-5">
        <div className="flex items-center gap-2 mb-1">
          <Mail className="w-4 h-4 text-[#D62828]" />
          <p className="text-[11px] font-bold tracking-[0.06em] uppercase text-[#7D5800]">
            Konfirmasi Penumpang &amp; Telegram Doa
          </p>
        </div>
        <h2
          id="rsvp-heading"
          className="text-xl font-extrabold text-[#2B2D42] mb-1 [text-wrap:balance]"
        >
          Pesan Kursi Kereta Sekarang
        </h2>
        <p className="text-xs text-[#5C403D] mb-4 tabular-nums">
          {stats.totalPassengers} penumpang terkonfirmasi · {stats.totalWishes} telegram masuk
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="guest-name-input"
              className="block text-xs font-bold text-[#2B2D42] mb-1.5"
            >
              Nama Lengkap Tamu
            </label>
            <input
              id="guest-name-input"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Bpk. Budi Santoso & Keluarga"
              className="w-full min-h-[48px] px-4 rounded-2xl bg-[#FFF9F2] border border-[#E5BDB9] text-sm text-[#2B2D42] placeholder:text-[#906F6B]/80 focus:outline-none focus:ring-2 focus:ring-[#4CC9F0] focus:border-[#4CC9F0]"
              required
            />
          </div>

          {/* Ticket-shaped Attendance Radio Selector */}
          <div>
            <span className="block text-xs font-bold text-[#2B2D42] mb-1.5">
              Status Keberangkatan
            </span>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setStatus('hadir')}
                aria-pressed={status === 'hadir'}
                className={`min-h-[54px] px-3 py-2.5 rounded-2xl border-2 text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4CC9F0] ${
                  status === 'hadir'
                    ? 'border-[#D62828] bg-[#FFF1EF] text-[#2B2D42]'
                    : 'border-[#E5BDB9]/70 bg-[#FFF9F2] text-[#5C403D] hover:border-[#FCBF49]'
                }`}
              >
                <span className="block text-xs font-extrabold">Hadir Siap Berangkat!</span>
                <span className="block text-[11px] text-[#5C403D] mt-0.5">
                  Datang ke Lumé Coffee
                </span>
              </button>

              <button
                type="button"
                onClick={() => setStatus('doa')}
                aria-pressed={status === 'doa'}
                className={`min-h-[54px] px-3 py-2.5 rounded-2xl border-2 text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4CC9F0] ${
                  status === 'doa'
                    ? 'border-[#007995] bg-[#E4F6FF] text-[#2B2D42]'
                    : 'border-[#E5BDB9]/70 bg-[#FFF9F2] text-[#5C403D] hover:border-[#FCBF49]'
                }`}
              >
                <span className="block text-xs font-extrabold">Titip Doa Restu</span>
                <span className="block text-[11px] text-[#5C403D] mt-0.5">
                  Berhalangan hadir
                </span>
              </button>
            </div>
          </div>

          {/* Passenger Count Stepper (visible when attending) */}
          {status === 'hadir' && (
            <div className="flex items-center justify-between bg-[#FFF9F2] rounded-2xl px-4 py-2.5 border border-[#E5BDB9]/70">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-[#D62828]" />
                <span className="text-xs font-bold text-[#2B2D42]">Jumlah Penumpang</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setGuests((g) => Math.max(1, g - 1))}
                  className="min-h-[44px] min-w-[44px] rounded-full bg-white border border-[#E5BDB9] flex items-center justify-center text-[#2B2D42] hover:bg-[#FFDEA9]/40"
                  aria-label="Kurangi jumlah tamu"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-8 text-center text-sm font-extrabold text-[#2B2D42] tabular-nums">
                  {guests}
                </span>
                <button
                  type="button"
                  onClick={() => setGuests((g) => Math.min(6, g + 1))}
                  className="min-h-[44px] min-w-[44px] rounded-full bg-white border border-[#E5BDB9] flex items-center justify-center text-[#2B2D42] hover:bg-[#FFDEA9]/40"
                  aria-label="Tambah jumlah tamu"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          <div>
            <label
              htmlFor="guest-wish-input"
              className="block text-xs font-bold text-[#2B2D42] mb-1.5"
            >
              Telegram Ucapan &amp; Doa untuk Faqih
            </label>
            <textarea
              id="guest-wish-input"
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Tuliskan doa terbaik untuk Masinis Cilik Faqih..."
              className="w-full px-4 py-3 rounded-2xl bg-[#FFF9F2] border border-[#E5BDB9] text-sm text-[#2B2D42] placeholder:text-[#906F6B]/80 focus:outline-none focus:ring-2 focus:ring-[#4CC9F0] focus:border-[#4CC9F0]"
            />
          </div>

          <button
            type="submit"
            className="btn-tactile-red w-full min-h-[48px] px-5 py-3 rounded-full font-bold text-sm flex items-center justify-center gap-2 whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4CC9F0]"
          >
            <Send className="w-4 h-4 shrink-0" />
            <span>Kirim Konfirmasi &amp; Doa</span>
          </button>
        </form>

        {submittedReceipt && (
          <div className="mt-4 rounded-2xl bg-[#E4F6FF] border border-[#4CC9F0]/60 p-3.5 flex items-start gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-[#005F76] shrink-0 mt-0.5" />
            <div className="text-xs text-[#2B2D42] leading-relaxed">
              <p className="font-extrabold">
                Terima kasih, {submittedReceipt.name}!
              </p>
              <p className="text-[#005F76]">
                {submittedReceipt.status === 'hadir'
                  ? `Kursi untuk ${submittedReceipt.guests} penumpang telah tercatat.`
                  : 'Telegram doa restu Anda telah diterima di stasiun.'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Telegram Wishes Feed */}
      <div className="card-storybook rounded-3xl p-5">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3.5">
          <div>
            <h3 className="text-base font-extrabold text-[#2B2D42]">
              Telegram Ucapan Tamu
            </h3>
            <p className="text-xs text-[#5C403D] tabular-nums">
              {wishes.length} pesan doa tersimpan
            </p>
          </div>

          <div className="flex items-center gap-1 p-1 rounded-xl bg-[#FFF9F2] border border-[#FCBF49]/40">
            {(
              [
                {key: 'all', label: 'Semua'},
                {key: 'hadir', label: 'Hadir'},
                {key: 'doa', label: 'Doa'},
              ] as const
            ).map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setFilter(tab.key)}
                className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-colors whitespace-nowrap ${
                  filter === tab.key
                    ? 'bg-[#D62828] text-white'
                    : 'text-[#5C403D] hover:text-[#2B2D42]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3 max-h-[340px] overflow-y-auto pr-1">
          {filteredWishes.map((wish) => (
            <article
              key={wish.id}
              className="rounded-2xl bg-[#FFF9F2] border border-dashed border-[#906F6B]/35 p-3.5"
            >
              <div className="flex items-baseline justify-between gap-2">
                <h4 className="text-sm font-extrabold text-[#2B2D42] truncate">
                  {wish.name}
                </h4>
                <span className="text-[11px] text-[#906F6B] shrink-0">
                  {wish.createdAt}
                </span>
              </div>
              <p className="text-[11px] font-bold text-[#7D5800] mt-0.5">
                {wish.status === 'hadir'
                  ? `Hadir · ${wish.guests} Penumpang`
                  : 'Titip Doa Restu'}
              </p>
              <p className="text-sm text-[#2B2D42] leading-relaxed mt-1.5">
                {wish.message}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};
