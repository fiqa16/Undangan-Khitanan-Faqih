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
  hero_photo_path text,
  venue_photo_url text,
  venue_photo_path text,
  venue_description text,
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


-- 4. TABEL: admin_users (Tabel Akun Admin - id diisi UID dari auth.users)
CREATE TABLE IF NOT EXISTS public.admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text,
  role text DEFAULT 'admin',
  created_at timestamptz DEFAULT now()
);

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


-- ==============================================================
-- SECURITY POLICIES
-- ==============================================================
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE id = (SELECT auth.uid()) AND role = 'admin'
  );
$function$;
REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

GRANT USAGE ON SCHEMA public TO anon, authenticated;
REVOKE ALL ON public.invitation_info, public.gallery_photos, public.music_settings,
  public.event_rundown, public.admin_users FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.invitation_info, public.gallery_photos, public.music_settings,
  public.event_rundown TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.invitation_info, public.gallery_photos,
  public.music_settings, public.event_rundown TO authenticated;
GRANT SELECT ON public.admin_users TO authenticated;

ALTER TABLE public.invitation_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.music_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_rundown ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

DO $policies$
DECLARE
  policy_record record;
BEGIN
  FOR policy_record IN
    SELECT schemaname, tablename, policyname
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename IN (
        'invitation_info',
        'gallery_photos',
        'music_settings',
        'event_rundown',
        'admin_users'
      )
  LOOP
    EXECUTE format(
      'DROP POLICY %I ON %I.%I',
      policy_record.policyname,
      policy_record.schemaname,
      policy_record.tablename
    );
  END LOOP;

  FOR policy_record IN
    SELECT schemaname, tablename, policyname
    FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND (
        COALESCE(qual, '') ILIKE '%invitation-assets%'
        OR COALESCE(with_check, '') ILIKE '%invitation-assets%'
      )
  LOOP
    EXECUTE format(
      'DROP POLICY %I ON %I.%I',
      policy_record.policyname,
      policy_record.schemaname,
      policy_record.tablename
    );
  END LOOP;
END
$policies$;

DROP POLICY IF EXISTS "Public can view invitation_info" ON public.invitation_info;
DROP POLICY IF EXISTS "Admin can manage invitation_info" ON public.invitation_info;
DROP POLICY IF EXISTS "Public Read invitation_info" ON public.invitation_info;
DROP POLICY IF EXISTS "Admin Manage invitation_info" ON public.invitation_info;
DROP POLICY IF EXISTS "Public can view gallery_photos" ON public.gallery_photos;
DROP POLICY IF EXISTS "Admin can manage gallery_photos" ON public.gallery_photos;
DROP POLICY IF EXISTS "Public Read gallery_photos" ON public.gallery_photos;
DROP POLICY IF EXISTS "Admin Manage gallery_photos" ON public.gallery_photos;
DROP POLICY IF EXISTS "Public can view music_settings" ON public.music_settings;
DROP POLICY IF EXISTS "Admin can manage music_settings" ON public.music_settings;
DROP POLICY IF EXISTS "Public Read music_settings" ON public.music_settings;
DROP POLICY IF EXISTS "Admin Manage music_settings" ON public.music_settings;
DROP POLICY IF EXISTS "Public can view published rundown" ON public.event_rundown;
DROP POLICY IF EXISTS "Admin can manage rundown" ON public.event_rundown;
DROP POLICY IF EXISTS "Allow authenticated read admin_users" ON public.admin_users;
DROP POLICY IF EXISTS "Allow authenticated manage admin_users" ON public.admin_users;
DROP POLICY IF EXISTS "Public Access to invitation-assets" ON storage.objects;
DROP POLICY IF EXISTS "Public can view invitation-assets" ON storage.objects;
DROP POLICY IF EXISTS "Admin can upload to invitation-assets" ON storage.objects;
DROP POLICY IF EXISTS "Admin can upload invitation-assets" ON storage.objects;
DROP POLICY IF EXISTS "Admin can update invitation-assets" ON storage.objects;
DROP POLICY IF EXISTS "Admin can delete from invitation-assets" ON storage.objects;
DROP POLICY IF EXISTS "Admin can delete invitation-assets" ON storage.objects;
DROP POLICY IF EXISTS "Public Read Assets" ON storage.objects;
DROP POLICY IF EXISTS "Admin Upload Assets" ON storage.objects;
DROP POLICY IF EXISTS "Admin Update Assets" ON storage.objects;
DROP POLICY IF EXISTS "Admin Delete Assets" ON storage.objects;
DROP POLICY IF EXISTS "public_read_invitation_info" ON public.invitation_info;
DROP POLICY IF EXISTS "admin_manage_invitation_info" ON public.invitation_info;
DROP POLICY IF EXISTS "public_read_gallery_photos" ON public.gallery_photos;
DROP POLICY IF EXISTS "admin_manage_gallery_photos" ON public.gallery_photos;
DROP POLICY IF EXISTS "public_read_music_settings" ON public.music_settings;
DROP POLICY IF EXISTS "admin_manage_music_settings" ON public.music_settings;
DROP POLICY IF EXISTS "public_read_published_rundown" ON public.event_rundown;
DROP POLICY IF EXISTS "admin_read_rundown" ON public.event_rundown;
DROP POLICY IF EXISTS "admin_manage_rundown" ON public.event_rundown;
DROP POLICY IF EXISTS "admin_read_own_admin_users_row" ON public.admin_users;
DROP POLICY IF EXISTS "public_read_invitation_assets" ON storage.objects;
DROP POLICY IF EXISTS "admin_upload_invitation_assets" ON storage.objects;
DROP POLICY IF EXISTS "admin_update_invitation_assets" ON storage.objects;
DROP POLICY IF EXISTS "admin_delete_invitation_assets" ON storage.objects;

CREATE POLICY "public_read_invitation_info" ON public.invitation_info
  FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "admin_manage_invitation_info" ON public.invitation_info
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "public_read_gallery_photos" ON public.gallery_photos
  FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "admin_manage_gallery_photos" ON public.gallery_photos
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "public_read_music_settings" ON public.music_settings
  FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "admin_manage_music_settings" ON public.music_settings
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "public_read_published_rundown" ON public.event_rundown
  FOR SELECT TO anon USING (is_published = true);
CREATE POLICY "admin_read_rundown" ON public.event_rundown
  FOR SELECT TO authenticated USING (is_published = true OR public.is_admin());
CREATE POLICY "admin_manage_rundown" ON public.event_rundown
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "admin_read_own_admin_users_row" ON public.admin_users
  FOR SELECT TO authenticated
  USING (id = (SELECT auth.uid()) AND role = 'admin');

INSERT INTO storage.buckets (id, name, public)
VALUES ('invitation-assets', 'invitation-assets', true)
ON CONFLICT (id) DO UPDATE SET public = EXCLUDED.public;

CREATE POLICY "public_read_invitation_assets" ON storage.objects
  FOR SELECT TO anon, authenticated USING (bucket_id = 'invitation-assets');
CREATE POLICY "admin_upload_invitation_assets" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'invitation-assets' AND public.is_admin());
CREATE POLICY "admin_update_invitation_assets" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'invitation-assets' AND public.is_admin())
  WITH CHECK (bucket_id = 'invitation-assets' AND public.is_admin());
CREATE POLICY "admin_delete_invitation_assets" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'invitation-assets' AND public.is_admin());
