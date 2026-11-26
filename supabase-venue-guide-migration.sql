-- Migrasi konten pengingat dan panduan lokasi.
-- Tidak mengubah RLS/policy tabel yang sudah ada dan tidak menyentuh storage.objects.

ALTER TABLE public.invitation_info
  ADD COLUMN IF NOT EXISTS tumbler_reminder text,
  ADD COLUMN IF NOT EXISTS venue_building_floor text,
  ADD COLUMN IF NOT EXISTS venue_stairs_instructions text,
  ADD COLUMN IF NOT EXISTS venue_lift_instructions text,
  ADD COLUMN IF NOT EXISTS venue_video_url text;

CREATE TABLE IF NOT EXISTS public.venue_guide_photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text NOT NULL CHECK (category IN ('stairs', 'lift', 'cafe')),
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  image_url text NOT NULL,
  storage_path text,
  order_index integer NOT NULL DEFAULT 1,
  is_published boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.venue_guide_photos ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.venue_guide_photos FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.venue_guide_photos TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.venue_guide_photos TO authenticated;

DROP POLICY IF EXISTS venue_guide_public_read_published ON public.venue_guide_photos;
CREATE POLICY venue_guide_public_read_published ON public.venue_guide_photos
  FOR SELECT TO anon, authenticated USING (is_published = true);

DROP POLICY IF EXISTS venue_guide_admin_read_all ON public.venue_guide_photos;
CREATE POLICY venue_guide_admin_read_all ON public.venue_guide_photos
  FOR SELECT TO authenticated USING (public.is_admin());

DROP POLICY IF EXISTS venue_guide_admin_manage ON public.venue_guide_photos;
CREATE POLICY venue_guide_admin_manage ON public.venue_guide_photos
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
