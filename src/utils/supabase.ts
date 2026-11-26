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
  hero_photo_path?: string | null;
  venue_photo_url?: string | null;
  venue_photo_path?: string | null;
  venue_description?: string | null;
  qris_photo_url?: string | null;
  qris_photo_path?: string | null;
  maps_url?: string | null;
  maps_embed_url?: string | null;
  tumbler_reminder?: string | null;
  venue_building_floor?: string | null;
  venue_stairs_instructions?: string | null;
  venue_lift_instructions?: string | null;
  venue_video_url?: string | null;
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

export type GalleryPhotoUpdate = Partial<
  Pick<
    GalleryPhoto,
    'carriage_no' | 'tag_label' | 'title' | 'caption' | 'image_url' | 'storage_path' | 'order_index'
  >
>;

export interface RundownItem {
  id: string;
  activity_name: string;
  start_time: string;
  end_time?: string | null;
  duration?: string | null;
  description?: string | null;
  order_index: number;
  is_published: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface MusicSetting {
  id: string;
  title: string;
  audio_url: string;
  storage_path?: string | null;
  is_active: boolean;
  updated_at?: string;
}

export type VenueGuideCategory = 'stairs' | 'lift' | 'cafe';

export interface VenueGuidePhoto {
  id: string;
  category: VenueGuideCategory;
  title: string;
  description: string;
  image_url: string;
  storage_path: string | null;
  order_index: number;
  is_published: boolean;
  created_at?: string;
}

/**
 * Upload file to Supabase Storage (bucket: invitation-assets)
 */
export async function uploadFileToStorage(
  file: File,
  folder: 'gallery' | 'music' | 'venue' | 'qris'
): Promise<{ publicUrl: string; path: string }> {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase belum dikonfigurasi dengan URL dan Anon Key yang valid.');
  }

  const cleanFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const fileExt = cleanFileName.split('.').pop() || (folder === 'music' ? 'mp3' : 'jpg');
  // Unique file naming to prevent browser caching or file name collisions
  const uniqueToken =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `${Date.now()}_${Math.random().toString(36).substring(2, 12)}`;
  const filePath = `${folder}/${uniqueToken}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(filePath, file, {
      cacheControl: '0',
      upsert: false,
    });

  if (uploadError) {
    if (uploadError.message?.toLowerCase().includes('bucket not found') || uploadError.message?.includes('404')) {
      throw new Error(
        `Bucket '${BUCKET_NAME}' belum tersedia di Supabase Storage. Jalankan 'supabase-security-update.sql' di Supabase SQL Editor.`
      );
    }
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
export async function deleteFileFromStorage(filePath: string): Promise<void> {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase belum dikonfigurasi; file tidak dapat dihapus.');
  }
  if (!filePath) {
    throw new Error('Path file tidak tersedia; file tidak dapat dihapus.');
  }

  const { error } = await supabase.storage.from(BUCKET_NAME).remove([filePath]);
  if (error) {
    throw new Error(`Gagal menghapus file dari Supabase Storage: ${error.message}`);
  }
}
