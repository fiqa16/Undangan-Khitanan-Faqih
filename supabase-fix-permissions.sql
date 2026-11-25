-- ==============================================================
-- PERBAIKAN IZIN TABEL (GRANT) & ROW LEVEL SECURITY (RLS) SUPABASE
-- UNDANGAN KHITANAN FAQIH AL-ARIF BILLAH
-- Jalankan script ini di: Supabase Dashboard -> SQL Editor -> New Query -> Run
-- ==============================================================

-- 1. Berikan hak akses schema public kepada peran anon dan authenticated
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- 2. Berikan hak akses tabel publik agar pengunjung website bisa membaca data undangan
GRANT SELECT ON public.invitation_info TO anon, authenticated;
GRANT SELECT ON public.gallery_photos TO anon, authenticated;
GRANT SELECT ON public.music_settings TO anon, authenticated;

-- 3. Berikan hak akses penuh untuk pengguna yang login (authenticated admin)
GRANT ALL ON public.invitation_info TO authenticated;
GRANT ALL ON public.gallery_photos TO authenticated;
GRANT ALL ON public.music_settings TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- 4. Berikan hak akses tabel admin_users untuk authenticated
GRANT SELECT, INSERT, UPDATE, DELETE ON public.admin_users TO authenticated;
GRANT SELECT ON public.admin_users TO anon;

-- 5. Konfigurasi Kebijakan Row Level Security (RLS)
ALTER TABLE public.invitation_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.music_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Policy RLS admin_users: Authenticated user dapat membaca baris admin_users
DROP POLICY IF EXISTS "Allow authenticated read admin_users" ON public.admin_users;
CREATE POLICY "Allow authenticated read admin_users"
ON public.admin_users
FOR SELECT
TO authenticated
USING (true);

-- Policy RLS admin_users: Admin dapat mengelola admin_users
DROP POLICY IF EXISTS "Allow authenticated manage admin_users" ON public.admin_users;
CREATE POLICY "Allow authenticated manage admin_users"
ON public.admin_users
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Policy RLS invitation_info
DROP POLICY IF EXISTS "Public can view invitation_info" ON public.invitation_info;
CREATE POLICY "Public can view invitation_info" ON public.invitation_info
FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin can manage invitation_info" ON public.invitation_info;
CREATE POLICY "Admin can manage invitation_info" ON public.invitation_info
FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Policy RLS gallery_photos
DROP POLICY IF EXISTS "Public can view gallery_photos" ON public.gallery_photos;
CREATE POLICY "Public can view gallery_photos" ON public.gallery_photos
FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin can manage gallery_photos" ON public.gallery_photos;
CREATE POLICY "Admin can manage gallery_photos" ON public.gallery_photos
FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Policy RLS music_settings
DROP POLICY IF EXISTS "Public can view music_settings" ON public.music_settings;
CREATE POLICY "Public can view music_settings" ON public.music_settings
FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin can manage music_settings" ON public.music_settings;
CREATE POLICY "Admin can manage music_settings" ON public.music_settings
FOR ALL TO authenticated USING (true) WITH CHECK (true);
