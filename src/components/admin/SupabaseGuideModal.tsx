import React, { useState } from 'react';
import {
  X,
  Copy,
  Check,
  Database,
  ExternalLink,
  ShieldCheck,
  HardDrive,
  Key,
  Info,
} from 'lucide-react';
import { isSupabaseConfigured } from '../../utils/supabase';

interface SupabaseGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShowToast: (message: string) => void;
}

const SQL_SCHEMA_SNIPPET = `-- SKEMA DATABASE, IZIN (GRANT), & STORAGE SUPABASE
-- Jalankan di: Supabase Dashboard -> SQL Editor -> New Query -> Paste & Run

-- 1. TABEL: invitation_info
CREATE TABLE IF NOT EXISTS public.invitation_info (
  id text PRIMARY KEY DEFAULT 'default',
  child_name text NOT NULL DEFAULT 'Faqih Al-Arif Billah',
  parents_name text NOT NULL DEFAULT 'Bpk. Dede Nurjaya & Ibu Ruslinawati',
  event_day_date text NOT NULL DEFAULT 'Sabtu, 19 Desember 2026',
  event_time text NOT NULL DEFAULT '18.00 – 00.00 WIB',
  event_venue text NOT NULL DEFAULT 'Lumé Coffee',
  event_address text NOT NULL DEFAULT 'Lumé Coffee, Jl. KH Abdullah Syafei No.7, RT.6/RW.2, Manggarai Sel., Kec. Tebet, Kota Jakarta Selatan, DKI Jakarta 12860',
  invitation_message text NOT NULL DEFAULT 'Dengan memohon rahmat dan ridho Allah SWT, kami mengundang Bapak/Ibu/Saudara/i untuk turut hadir memberikan doa restu pada acara Walimatul Khitan putra kami, langkah awal sang pemberani menuju pribadi yang sholeh, sehat, dan penuh semangat.',
  hero_photo_url text,
  maps_url text DEFAULT 'https://www.google.com/maps/search/?api=1&query=Lume+Coffee+Jl+KH+Abdullah+Syafei+No+7+Tebet+Jakarta+Selatan+12860',
  maps_embed_url text DEFAULT 'https://maps.google.com/maps?q=Lume%20Coffee%20Jl.%20KH%20Abdullah%20Syafei%20No.7%20Tebet%20Jakarta%20Selatan&t=&z=16&ie=UTF8&iwloc=&output=embed',
  updated_at timestamptz DEFAULT now()
);

-- 2. TABEL: gallery_photos
CREATE TABLE IF NOT EXISTS public.gallery_photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  carriage_no text,
  tag_label text,
  title text NOT NULL,
  caption text,
  image_url text NOT NULL,
  storage_path text,
  order_index integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- 3. TABEL: music_settings
CREATE TABLE IF NOT EXISTS public.music_settings (
  id text PRIMARY KEY DEFAULT 'default',
  title text NOT NULL DEFAULT 'Thomas & Friends Theme Song',
  audio_url text NOT NULL DEFAULT '/lagu-undangan.mp3',
  storage_path text,
  is_active boolean DEFAULT true,
  updated_at timestamptz DEFAULT now()
);

-- 4. TABEL: admin_users (Tabel Akun Admin - id diisi UID dari auth.users)
CREATE TABLE IF NOT EXISTS public.admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text,
  role text DEFAULT 'admin',
  created_at timestamptz DEFAULT now()
);

-- 5. HAK AKSES SCHEMA & TABEL (GRANT)
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON public.invitation_info TO anon, authenticated;
GRANT SELECT ON public.gallery_photos TO anon, authenticated;
GRANT SELECT ON public.music_settings TO anon, authenticated;
GRANT ALL ON public.invitation_info TO authenticated;
GRANT ALL ON public.gallery_photos TO authenticated;
GRANT ALL ON public.music_settings TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.admin_users TO authenticated;
GRANT SELECT ON public.admin_users TO anon;

-- 6. ENABLE ROW LEVEL SECURITY (RLS)
ALTER TABLE public.invitation_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.music_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- 7. POLICIES: Public Read, Authenticated Admin Manage
DROP POLICY IF EXISTS "Public Read invitation_info" ON public.invitation_info;
CREATE POLICY "Public Read invitation_info" ON public.invitation_info FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admin Manage invitation_info" ON public.invitation_info;
CREATE POLICY "Admin Manage invitation_info" ON public.invitation_info FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public Read gallery_photos" ON public.gallery_photos;
CREATE POLICY "Public Read gallery_photos" ON public.gallery_photos FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admin Manage gallery_photos" ON public.gallery_photos;
CREATE POLICY "Admin Manage gallery_photos" ON public.gallery_photos FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public Read music_settings" ON public.music_settings;
CREATE POLICY "Public Read music_settings" ON public.music_settings FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admin Manage music_settings" ON public.music_settings;
CREATE POLICY "Admin Manage music_settings" ON public.music_settings FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow authenticated read admin_users" ON public.admin_users;
CREATE POLICY "Allow authenticated read admin_users" ON public.admin_users FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "Allow authenticated manage admin_users" ON public.admin_users;
CREATE POLICY "Allow authenticated manage admin_users" ON public.admin_users FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 8. STORAGE BUCKET: invitation-assets
INSERT INTO storage.buckets (id, name, public) VALUES ('invitation-assets', 'invitation-assets', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "Public Read Assets" ON storage.objects;
CREATE POLICY "Public Read Assets" ON storage.objects FOR SELECT USING (bucket_id = 'invitation-assets');
DROP POLICY IF EXISTS "Admin Upload Assets" ON storage.objects;
CREATE POLICY "Admin Upload Assets" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'invitation-assets');
DROP POLICY IF EXISTS "Admin Update Assets" ON storage.objects;
CREATE POLICY "Admin Update Assets" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'invitation-assets');
DROP POLICY IF EXISTS "Admin Delete Assets" ON storage.objects;
CREATE POLICY "Admin Delete Assets" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'invitation-assets');`;

export const SupabaseGuideModal: React.FC<SupabaseGuideModalProps> = ({
  isOpen,
  onClose,
  onShowToast,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopySql = async () => {
    try {
      await navigator.clipboard.writeText(SQL_SCHEMA_SNIPPET);
      setCopied(true);
      onShowToast('Script SQL berhasil disalin ke clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      onShowToast('Gagal menyalin script secara otomatis.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#181A2E]/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-2xl bg-white rounded-3xl p-6 sm:p-8 border-2 border-[#FCBF49] shadow-2xl animate-in zoom-in-95 duration-200 my-8 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#FCBF49]/30">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#D62828] text-white flex items-center justify-center">
              <Database className="w-5 h-5 text-[#FCBF49]" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-[#2B2D42]">
                Panduan Setup Supabase &amp; SQL Schema
              </h3>
              <p className="text-xs text-[#5C403D]">
                Langkah konfigurasi database, izin GRANT, dan storage untuk website undangan
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-full text-[#5C403D] hover:bg-[#FFF9F2] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="overflow-y-auto pr-1 py-4 space-y-4 text-xs">
          {/* Connection status */}
          <div
            className={`p-4 rounded-2xl border flex items-center justify-between ${
              isSupabaseConfigured
                ? 'bg-[#E7F8E8] border-[#A4E3AB] text-[#1B6924]'
                : 'bg-[#FFF3CD] border-[#FFEEBA] text-[#856404]'
            }`}
          >
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5" />
              <div>
                <p className="font-extrabold">
                  Status Supabase:{' '}
                  {isSupabaseConfigured ? 'Terkoneksi' : 'Belum Dikonfigurasi'}
                </p>
                <p className="text-[11px] opacity-90">
                  {isSupabaseConfigured
                    ? 'Variabel URL dan Anon Key sudah terdeteksi di lingkungan aplikasi.'
                    : 'File .env.local atau Vercel Environment Variables belum memiliki kredensial.'}
                </p>
              </div>
            </div>
          </div>

          {/* Steps */}
          <div className="space-y-3">
            <h4 className="font-extrabold text-sm text-[#2B2D42]">
              Langkah 1: Jalankan SQL Script di Supabase
            </h4>
            <ol className="list-decimal list-inside space-y-2 text-[#5C403D] pl-1 leading-relaxed">
              <li>
                Buka proyek Supabase Anda di{' '}
                <a
                  href="https://supabase.com/dashboard"
                  target="_blank"
                  rel="noreferrer"
                  className="font-bold text-[#D62828] hover:underline inline-flex items-center gap-0.5"
                >
                  <span>Dashboard Supabase</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
                .
              </li>
              <li>
                Pilih menu <strong>SQL Editor</strong> di bilah sisi kiri, lalu klik <strong>New Query</strong>.
              </li>
              <li>
                Salin dan tempel (paste) kode SQL di bawah ini, lalu klik tombol <strong>Run</strong> (atau Ctrl+Enter).
              </li>
            </ol>

            {/* SQL Snippet box */}
            <div className="relative rounded-2xl bg-[#1E1E2E] text-white p-4 font-mono text-[11px] max-h-56 overflow-y-auto">
              <button
                type="button"
                onClick={handleCopySql}
                className="sticky top-0 float-right px-3 py-1.5 rounded-full bg-[#FCBF49] hover:bg-[#ffd06b] text-[#271900] font-bold text-[10px] inline-flex items-center gap-1 shadow-sm transition-colors cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Tersalin!' : 'Salin SQL'}</span>
              </button>
              <pre className="whitespace-pre">{SQL_SCHEMA_SNIPPET}</pre>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <h4 className="font-extrabold text-sm text-[#2B2D42]">
              Langkah 2: Hubungkan Akun Admin ke Tabel admin_users
            </h4>
            <ol className="list-decimal list-inside space-y-1.5 text-[#5C403D] pl-1 leading-relaxed">
              <li>
                Buka menu <strong>Authentication</strong> &rarr; <strong>Users</strong> untuk melihat <strong>UID</strong> akun Anda.
              </li>
              <li>
                Buka menu <strong>Table Editor</strong> &rarr; tabel <code>admin_users</code>.
              </li>
              <li>
                Pastikan kolom <code>id</code> diisi dengan <strong>UID</strong> dari akun authentication, dan kolom <code>role</code> diisi <code>admin</code>.
              </li>
            </ol>
          </div>

          <div className="space-y-3 pt-2">
            <h4 className="font-extrabold text-sm text-[#2B2D42]">
              Langkah 3: Atur Environment Variables di Vercel &amp; .env.local
            </h4>
            <div className="p-3.5 rounded-2xl bg-[#FFF9F2] border border-[#FCBF49]/40 text-[#2B2D42] space-y-2">
              <p className="text-[11px]">
                Di menu <strong>Project Settings</strong> &rarr; <strong>API</strong> di Supabase:
              </p>
              <div className="font-mono text-[11px] bg-white p-3 rounded-xl border border-[#FCBF49]/30 space-y-1">
                <div><span className="text-[#D62828] font-bold">VITE_SUPABASE_URL</span> = https://xyzcompany.supabase.co</div>
                <div><span className="text-[#D62828] font-bold">VITE_SUPABASE_ANON_KEY</span> = eyJhbGciOiJIUzI1Ni... (anon / publishable key)</div>
              </div>
              <p className="text-[11px] text-[#5C403D]">
                Masukkan kedua variabel di atas pada <strong>Vercel &rarr; Settings &rarr; Environment Variables</strong>, lalu lakukan Redeploy.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-[#FCBF49]/30 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="min-h-[40px] px-6 rounded-full bg-[#2B2D42] text-white text-xs font-bold hover:bg-[#3D3F5A] cursor-pointer"
          >
            Tutup Panduan
          </button>
        </div>
      </div>
    </div>
  );
};
