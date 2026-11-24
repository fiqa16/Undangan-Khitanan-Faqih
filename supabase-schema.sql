-- ==============================================================
-- SKEMA DATABASE & STORAGE SUPABASE
-- UNDANGAN KHITANAN FAQIH AL-ARIF BILLAH
-- Jalankan seluruh script ini di Supabase SQL Editor:
-- (Buka Supabase Dashboard -> SQL Editor -> New Query -> Paste & Run)
-- ==============================================================

-- 1. TABEL: invitation_info (Informasi Acara & Teks Undangan)
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

-- Data Default Info Undangan (Hanya ditambahkan jika belum ada)
INSERT INTO public.invitation_info (
  id,
  child_name,
  parents_name,
  event_day_date,
  event_time,
  event_venue,
  event_address,
  invitation_message
)
VALUES (
  'default',
  'Faqih Al-Arif Billah',
  'Bpk. Dede Nurjaya & Ibu Ruslinawati',
  'Sabtu, 19 Desember 2026',
  '18.00 – 00.00 WIB',
  'Lumé Coffee',
  'Lumé Coffee, Jl. KH Abdullah Syafei No.7, RT.6/RW.2, Manggarai Sel., Kec. Tebet, Kota Jakarta Selatan, DKI Jakarta 12860',
  'Dengan memohon rahmat dan ridho Allah SWT, kami mengundang Bapak/Ibu/Saudara/i untuk turut hadir memberikan doa restu pada acara Walimatul Khitan putra kami, langkah awal sang pemberani menuju pribadi yang sholeh, sehat, dan penuh semangat.'
)
ON CONFLICT (id) DO NOTHING;


-- 2. TABEL: gallery_photos (Foto Gerbong Kenangan & Galeri)
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


-- 3. TABEL: music_settings (Pengaturan Musik Latar Undangan)
CREATE TABLE IF NOT EXISTS public.music_settings (
  id text PRIMARY KEY DEFAULT 'default',
  title text NOT NULL DEFAULT 'Thomas & Friends Theme Song',
  audio_url text NOT NULL DEFAULT '/lagu-undangan.mp3',
  storage_path text,
  is_active boolean DEFAULT true,
  updated_at timestamptz DEFAULT now()
);

-- Data Default Musik Undangan
INSERT INTO public.music_settings (id, title, audio_url, is_active)
VALUES ('default', 'Thomas & Friends Theme Song', '/lagu-undangan.mp3', true)
ON CONFLICT (id) DO NOTHING;


-- 4. TABEL: admin_users (Whitelist Akun Email yang Diizinkan Masuk Admin)
CREATE TABLE IF NOT EXISTS public.admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  role text DEFAULT 'admin',
  created_at timestamptz DEFAULT now()
);

-- CONTOH: Masukkan email admin Anda di sini jika ingin whitelist ketat:
-- INSERT INTO public.admin_users (email) VALUES ('fadhiyah16@gmail.com') ON CONFLICT (email) DO NOTHING;


-- ==============================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Pastikan tabel aman: Pengunjung umum hanya bisa BACA (SELECT),
-- hanya akun Admin yang terautentikasi (auth.role() = 'authenticated')
-- yang bisa INSERT, UPDATE, dan DELETE.
-- ==============================================================

-- Aktifkan RLS di setiap tabel
ALTER TABLE public.invitation_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.music_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Policy untuk invitation_info
DROP POLICY IF EXISTS "Public can view invitation_info" ON public.invitation_info;
CREATE POLICY "Public can view invitation_info" ON public.invitation_info
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin can manage invitation_info" ON public.invitation_info;
CREATE POLICY "Admin can manage invitation_info" ON public.invitation_info
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Policy untuk gallery_photos
DROP POLICY IF EXISTS "Public can view gallery_photos" ON public.gallery_photos;
CREATE POLICY "Public can view gallery_photos" ON public.gallery_photos
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin can manage gallery_photos" ON public.gallery_photos;
CREATE POLICY "Admin can manage gallery_photos" ON public.gallery_photos
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Policy untuk music_settings
DROP POLICY IF EXISTS "Public can view music_settings" ON public.music_settings;
CREATE POLICY "Public can view music_settings" ON public.music_settings
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin can manage music_settings" ON public.music_settings;
CREATE POLICY "Admin can manage music_settings" ON public.music_settings
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Policy untuk admin_users
DROP POLICY IF EXISTS "Public / Auth can check admin_users" ON public.admin_users;
CREATE POLICY "Public / Auth can check admin_users" ON public.admin_users
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin can manage admin_users" ON public.admin_users;
CREATE POLICY "Admin can manage admin_users" ON public.admin_users
  FOR ALL TO authenticated USING (true) WITH CHECK (true);


-- ==============================================================
-- STORAGE BUCKET: invitation-assets
-- Untuk menyimpan file Foto Galeri & File Audio Musik
-- ==============================================================

-- Buat bucket publik jika belum ada
INSERT INTO storage.buckets (id, name, public)
VALUES ('invitation-assets', 'invitation-assets', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Policy Storage: Siapapun (publik) boleh melihat dan mengunduh foto/musik
DROP POLICY IF EXISTS "Public Access to invitation-assets" ON storage.objects;
CREATE POLICY "Public Access to invitation-assets" ON storage.objects
  FOR SELECT USING (bucket_id = 'invitation-assets');

-- Policy Storage: Hanya user authenticated (Admin) yang boleh upload
DROP POLICY IF EXISTS "Admin can upload to invitation-assets" ON storage.objects;
CREATE POLICY "Admin can upload to invitation-assets" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'invitation-assets');

-- Policy Storage: Hanya user authenticated (Admin) yang boleh update
DROP POLICY IF EXISTS "Admin can update invitation-assets" ON storage.objects;
CREATE POLICY "Admin can update invitation-assets" ON storage.objects
  FOR UPDATE TO authenticated USING (bucket_id = 'invitation-assets');

-- Policy Storage: Hanya user authenticated (Admin) yang boleh delete
DROP POLICY IF EXISTS "Admin can delete from invitation-assets" ON storage.objects;
CREATE POLICY "Admin can delete from invitation-assets" ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'invitation-assets');
