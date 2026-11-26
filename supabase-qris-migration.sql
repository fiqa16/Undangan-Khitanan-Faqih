-- Migrasi terpisah untuk foto QRIS. Aman dijalankan ulang.
-- Hanya menambah kolom pada invitation_info; tidak mengubah RLS atau Storage.
ALTER TABLE public.invitation_info
  ADD COLUMN IF NOT EXISTS qris_photo_url text,
  ADD COLUMN IF NOT EXISTS qris_photo_path text;
