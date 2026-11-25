-- ==============================================================
-- UPDATE SKEMA DATABASE & STORAGE SUPABASE (TAHAP 1, 2, & 3)
-- UNDANGAN KHITANAN FAQIH AL-ARIF BILLAH
-- Jalankan seluruh script ini di Supabase SQL Editor:
-- (Buka Supabase Dashboard -> SQL Editor -> New Query -> Paste & Run)
-- ==============================================================

-- 1. FUNGSI KEAMANAN: Memastikan User Adalah Admin Resmi di admin_users
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- 2. TAHAP 2: Tambahkan Kolom Foto Lokasi Lumé Coffee pada invitation_info
ALTER TABLE public.invitation_info
ADD COLUMN IF NOT EXISTS venue_photo_url text,
ADD COLUMN IF NOT EXISTS venue_photo_path text,
ADD COLUMN IF NOT EXISTS venue_description text;

-- 3. TAHAP 3: Buat Tabel public.event_rundown (Kelola Rundown Acara)
CREATE TABLE IF NOT EXISTS public.event_rundown (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_name text NOT NULL,
  start_time text NOT NULL,
  end_time text,
  duration text,
  description text,
  order_index integer NOT NULL DEFAULT 1,
  is_published boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 4. BUCKET STORAGE: Buat bucket 'invitation-assets' jika belum ada
INSERT INTO storage.buckets (id, name, public)
VALUES ('invitation-assets', 'invitation-assets', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 5. HAK AKSES DASAR (GRANT)
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- Hak baca untuk anon & authenticated
GRANT SELECT ON public.invitation_info TO anon, authenticated;
GRANT SELECT ON public.gallery_photos TO anon, authenticated;
GRANT SELECT ON public.music_settings TO anon, authenticated;
GRANT SELECT ON public.event_rundown TO anon, authenticated;
GRANT SELECT ON public.admin_users TO anon, authenticated;

-- Hak kelola untuk user authenticated
GRANT ALL ON public.invitation_info TO authenticated;
GRANT ALL ON public.gallery_photos TO authenticated;
GRANT ALL ON public.music_settings TO authenticated;
GRANT ALL ON public.event_rundown TO authenticated;
GRANT ALL ON public.admin_users TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- 6. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.invitation_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.music_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_rundown ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Policy: invitation_info
DROP POLICY IF EXISTS "Public can view invitation_info" ON public.invitation_info;
CREATE POLICY "Public can view invitation_info" ON public.invitation_info
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin can manage invitation_info" ON public.invitation_info;
CREATE POLICY "Admin can manage invitation_info" ON public.invitation_info
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Policy: gallery_photos
DROP POLICY IF EXISTS "Public can view gallery_photos" ON public.gallery_photos;
CREATE POLICY "Public can view gallery_photos" ON public.gallery_photos
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin can manage gallery_photos" ON public.gallery_photos;
CREATE POLICY "Admin can manage gallery_photos" ON public.gallery_photos
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Policy: event_rundown
DROP POLICY IF EXISTS "Public can view published rundown" ON public.event_rundown;
CREATE POLICY "Public can view published rundown" ON public.event_rundown
  FOR SELECT USING (is_published = true OR public.is_admin());

DROP POLICY IF EXISTS "Admin can manage rundown" ON public.event_rundown;
CREATE POLICY "Admin can manage rundown" ON public.event_rundown
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Policy: music_settings
DROP POLICY IF EXISTS "Public can view music_settings" ON public.music_settings;
CREATE POLICY "Public can view music_settings" ON public.music_settings
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin can manage music_settings" ON public.music_settings;
CREATE POLICY "Admin can manage music_settings" ON public.music_settings
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Policy: admin_users
DROP POLICY IF EXISTS "Allow authenticated read admin_users" ON public.admin_users;
CREATE POLICY "Allow authenticated read admin_users" ON public.admin_users
  FOR SELECT TO authenticated USING (true);

-- 7. STORAGE POLICIES (Bucket: invitation-assets)
DROP POLICY IF EXISTS "Public can view invitation-assets" ON storage.objects;
CREATE POLICY "Public can view invitation-assets" ON storage.objects
  FOR SELECT USING (bucket_id = 'invitation-assets');

DROP POLICY IF EXISTS "Admin can upload invitation-assets" ON storage.objects;
CREATE POLICY "Admin can upload invitation-assets" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'invitation-assets' AND public.is_admin());

DROP POLICY IF EXISTS "Admin can update invitation-assets" ON storage.objects;
CREATE POLICY "Admin can update invitation-assets" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'invitation-assets' AND public.is_admin());

DROP POLICY IF EXISTS "Admin can delete invitation-assets" ON storage.objects;
CREATE POLICY "Admin can delete invitation-assets" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'invitation-assets' AND public.is_admin());
