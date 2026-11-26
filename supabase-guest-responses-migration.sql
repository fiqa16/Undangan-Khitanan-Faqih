-- Penyimpanan permanen RSVP dan ucapan tamu.
-- Hanya membuat objek baru; tidak mengubah tabel undangan atau policy Storage.

CREATE TABLE IF NOT EXISTS public.guest_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  guest_name text NOT NULL,
  attendance_status text NOT NULL CHECK (attendance_status IN ('hadir', 'doa')),
  passenger_count integer NOT NULL DEFAULT 0 CHECK (passenger_count >= 0),
  message text,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT guest_responses_absent_has_no_passengers
    CHECK (attendance_status = 'hadir' OR passenger_count = 0)
);

CREATE INDEX IF NOT EXISTS guest_responses_created_at_idx
  ON public.guest_responses (created_at DESC);

ALTER TABLE public.guest_responses ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.guest_responses FROM PUBLIC, anon, authenticated;
GRANT INSERT ON public.guest_responses TO anon, authenticated;
GRANT SELECT, UPDATE, DELETE ON public.guest_responses TO authenticated;

DROP POLICY IF EXISTS guest_responses_public_insert ON public.guest_responses;
CREATE POLICY guest_responses_public_insert ON public.guest_responses
  FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS guest_responses_admin_read ON public.guest_responses;
CREATE POLICY guest_responses_admin_read ON public.guest_responses
  FOR SELECT TO authenticated USING (public.is_admin());

DROP POLICY IF EXISTS guest_responses_admin_update ON public.guest_responses;
CREATE POLICY guest_responses_admin_update ON public.guest_responses
  FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS guest_responses_admin_delete ON public.guest_responses;
CREATE POLICY guest_responses_admin_delete ON public.guest_responses
  FOR DELETE TO authenticated USING (public.is_admin());

-- Feed publik hanya menerima identitas tampilan, isi ucapan, dan waktu kirim.
-- Data status serta jumlah penumpang tetap hanya tersedia dari tabel untuk admin.
CREATE OR REPLACE VIEW public.public_guest_wishes
WITH (security_barrier = true) AS
  SELECT id, guest_name, message, created_at
  FROM public.guest_responses
  WHERE message IS NOT NULL AND btrim(message) <> '';

REVOKE ALL ON public.public_guest_wishes FROM PUBLIC;
GRANT SELECT ON public.public_guest_wishes TO anon, authenticated;
