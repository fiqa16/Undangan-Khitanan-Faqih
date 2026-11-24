import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl !== 'YOUR_SUPABASE_URL' &&
  !supabaseUrl.includes('placeholder')
);

export const BUCKET_NAME = 'invitation-assets';

export const supabase: SupabaseClient = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-anon-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
);

export interface InvitationInfo {
  id: string;
  child_name: string;
  parents_name: string;
  event_day_date: string;
  event_time: string;
  event_venue: string;
  event_address: string;
  invitation_message: string;
  hero_photo_url?: string | null;
  maps_url?: string | null;
  maps_embed_url?: string | null;
  updated_at?: string;
}

export interface GalleryPhoto {
  id: string;
  carriage_no?: string;
  tag_label?: string;
  title: string;
  caption: string;
  image_url: string;
  storage_path?: string | null;
  order_index: number;
  created_at?: string;
}

export interface MusicSetting {
  id: string;
  title: string;
  audio_url: string;
  storage_path?: string | null;
  is_active: boolean;
  updated_at?: string;
}

/**
 * Upload file to Supabase Storage (bucket: invitation-assets)
 */
export async function uploadFileToStorage(
  file: File,
  folder: 'gallery' | 'music'
): Promise<{ publicUrl: string; path: string }> {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase belum dikonfigurasi dengan URL dan Anon Key yang valid.');
  }

  const cleanFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const fileExt = cleanFileName.split('.').pop() || (folder === 'music' ? 'mp3' : 'jpg');
  const filePath = `${folder}/${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (uploadError) {
    throw new Error(`Gagal mengunggah file ke Supabase Storage: ${uploadError.message}`);
  }

  const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(filePath);

  if (!data?.publicUrl) {
    throw new Error('Gagal mendapatkan URL publik dari file yang diunggah.');
  }

  return {
    publicUrl: data.publicUrl,
    path: filePath,
  };
}

/**
 * Delete file from Supabase Storage
 */
export async function deleteFileFromStorage(filePath: string): Promise<boolean> {
  if (!isSupabaseConfigured || !filePath) return false;

  try {
    const { error } = await supabase.storage.from(BUCKET_NAME).remove([filePath]);
    if (error) {
      console.warn('Gagal menghapus file dari storage:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Error saat menghapus file storage:', err);
    return false;
  }
}
