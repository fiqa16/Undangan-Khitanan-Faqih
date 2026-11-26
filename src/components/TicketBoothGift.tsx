import React, {useState} from 'react';
import {Check, Copy, Gift, QrCode, X} from 'lucide-react';
import {QrisMatrixGraphic} from './StorybookIllustrations';
import { useInvitationData } from '../context/InvitationContext';

interface TicketBoothGiftProps {
  onShowToast: (message: string) => void;
}

interface BankAccount {
  bank: string;
  fullName: string;
  number: string;
  holder: string;
  accent: string;
}

const BANK_ACCOUNTS: BankAccount[] = [
  {
    bank: 'BSI',
    fullName: 'Bank Syariah Indonesia (BSI)',
    number: '7315521844',
    holder: 'a.n. Ruslinawati',
    accent: 'text-[#005F76]',
  },
  {
    bank: 'BCA',
    fullName: 'Bank Central Asia (BCA)',
    number: '575-0610-635',
    holder: 'a.n. Ruslinawati',
    accent: 'text-[#B20112]',
  },
];

export const TicketBoothGift: React.FC<TicketBoothGiftProps> = ({onShowToast}) => {
  const { invitationInfo } = useInvitationData();
  const [activeTab, setActiveTab] = useState<'bank' | 'qris'>('bank');
  const [copiedBank, setCopiedBank] = useState<string | null>(null);
  const [qrisModalOpen, setQrisModalOpen] = useState(false);

  const handleCopyAccount = async (account: BankAccount) => {
    const cleanDigits = account.number.replace(/\s+/g, '');
    try {
      await navigator.clipboard.writeText(cleanDigits);
    } catch {
      // Clipboard fallback still shows feedback toast
    }
    setCopiedBank(account.bank);
    onShowToast(`Nomor rekening ${account.bank} tersalin!`);
    window.setTimeout(() => {
      setCopiedBank((curr) => (curr === account.bank ? null : curr));
    }, 2000);
  };

  return (
    <section aria-labelledby="loket-heading" className="px-1">
      <div className="card-storybook rounded-3xl p-5">
        <div className="flex items-center gap-2 mb-1">
          <Gift className="w-4 h-4 text-[#D62828]" />
          <p className="text-[11px] font-bold tracking-[0.06em] uppercase text-[#7D5800]">
            Loket Kado Digital
          </p>
        </div>
        <h2
          id="loket-heading"
          className="text-xl font-extrabold text-[#2B2D42] [text-wrap:balance]"
        >
          Tanda Kasih &amp; Doa Terbaik
        </h2>
        <p className="text-sm text-[#5C403D] mt-1 mb-4 leading-relaxed">
          Doa restu Bapak/Ibu adalah hadiah terindah bagi kami. Bagi keluarga atau sahabat yang
          ingin mengirimkan tanda kasih jarak jauh, dapat melalui Bank BSI, BCA, atau QRIS berikut:
        </p>

        {/* Segmented Control */}
        <div className="grid grid-cols-2 gap-1.5 p-1.5 rounded-2xl bg-[#FFF9F2] border border-[#FCBF49]/40 mb-4">
          <button
            type="button"
            onClick={() => setActiveTab('bank')}
            className={`min-h-[44px] rounded-xl text-xs font-bold transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4CC9F0] ${
              activeTab === 'bank'
                ? 'bg-[#D62828] text-white shadow-xs'
                : 'text-[#5C403D] hover:text-[#2B2D42]'
            }`}
          >
            Transfer Bank
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('qris')}
            className={`min-h-[44px] rounded-xl text-xs font-bold transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4CC9F0] ${
              activeTab === 'qris'
                ? 'bg-[#D62828] text-white shadow-xs'
                : 'text-[#5C403D] hover:text-[#2B2D42]'
            }`}
          >
            QRIS Instan
          </button>
        </div>

        {activeTab === 'bank' ? (
          <div className="space-y-2.5">
            {BANK_ACCOUNTS.map((acc) => {
              const isCopied = copiedBank === acc.bank;
              return (
                <div
                  key={acc.bank}
                  className="rounded-2xl bg-[#FFF9F2] border border-[#FCBF49]/40 p-3.5 flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <p className={`text-xs font-extrabold uppercase tracking-wider ${acc.accent}`}>
                      {acc.fullName}
                    </p>
                    <p className="text-base font-extrabold text-[#2B2D42] tabular-nums mt-0.5 truncate">
                      {acc.number}
                    </p>
                    <p className="text-xs text-[#5C403D] mt-0.5 truncate">{acc.holder}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopyAccount(acc)}
                    className={`min-h-[44px] px-3.5 rounded-full text-xs font-bold flex items-center gap-1.5 shrink-0 transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4CC9F0] ${
                      isCopied
                        ? 'bg-[#005F76] text-white'
                        : 'bg-white border border-[#2B2D42]/15 text-[#2B2D42] hover:bg-[#FFDEA9]/45'
                    }`}
                  >
                    {isCopied ? (
                      <>
                        <Check className="w-3.5 h-3.5 shrink-0" />
                        <span>Tersalin</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 shrink-0" />
                        <span>Salin</span>
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-2xl bg-[#FFF9F2] border border-[#FCBF49]/40 p-4 text-center">
            <p className="text-xs font-bold text-[#7D5800] mb-2">
              NMID: ID1020264419820 · Khitan Faqih Jakarta Selatan
            </p>
            <div className="inline-block bg-white p-2.5 rounded-2xl border border-[#E5BDB9]/70 shadow-xs">
              {invitationInfo.qris_photo_url ? <img src={invitationInfo.qris_photo_url} alt="Kode QRIS" className="mx-auto h-52 w-52 object-contain" /> : <QrisMatrixGraphic />}
            </div>
            <p className="text-xs text-[#5C403D] mt-2.5 mb-3">
              Pindai kode QRIS melalui GoPay, OVO, Dana, ShopeePay, atau Mobile Banking.
            </p>
            <button
              type="button"
              onClick={() => setQrisModalOpen(true)}
              className="btn-tactile-gold min-h-[44px] px-5 py-2.5 rounded-full text-xs font-extrabold inline-flex items-center gap-2 whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4CC9F0]"
            >
              <QrCode className="w-4 h-4 shrink-0" />
              <span>Perbesar Kode QRIS</span>
            </button>
          </div>
        )}
      </div>

      {/* Expandable QRIS Modal */}
      {qrisModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-[#181A2E]/65 backdrop-blur-xs flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="qris-modal-title"
          onClick={() => setQrisModalOpen(false)}
        >
          <div
            className="w-full max-w-[350px] bg-white rounded-3xl p-5 border-2 border-[#FCBF49] shadow-2xl text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 id="qris-modal-title" className="text-base font-extrabold text-[#2B2D42]">
                QRIS Kado Digital
              </h3>
              <button
                type="button"
                onClick={() => setQrisModalOpen(false)}
                className="min-h-[44px] min-w-[44px] rounded-full bg-[#FFF9F2] text-[#2B2D42] flex items-center justify-center hover:bg-[#FFDEA9]/50"
                aria-label="Tutup modal QRIS"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="bg-[#FFF9F2] rounded-2xl p-4 border border-[#FCBF49]/40">
              {invitationInfo.qris_photo_url ? <img src={invitationInfo.qris_photo_url} alt="Kode QRIS" className="mx-auto h-64 w-64 object-contain" /> : <QrisMatrixGraphic />}
              <p className="text-xs font-bold text-[#2B2D42] mt-3">
                Walimatul Khitan Faqih Al-Arif Billah
              </p>
              <p className="text-[11px] text-[#5C403D] mt-0.5 tabular-nums">
                NMID: ID1020264419820
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                onShowToast('ID Merchant QRIS tersalin!');
                setQrisModalOpen(false);
              }}
              className="btn-tactile-red w-full min-h-[44px] mt-4 rounded-full text-xs font-bold"
            >
              Selesai
            </button>
          </div>
        </div>
      )}
    </section>
  );
};
