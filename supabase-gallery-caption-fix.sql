-- Add the missing gallery caption column without recreating the table or changing RLS.
ALTER TABLE public.gallery_photos
  ADD COLUMN IF NOT EXISTS caption text;

NOTIFY pgrst, 'reload schema';
