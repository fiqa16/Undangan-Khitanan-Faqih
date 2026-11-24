import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  supabase,
  isSupabaseConfigured,
  InvitationInfo,
  GalleryPhoto,
  MusicSetting,
  deleteFileFromStorage,
} from '../utils/supabase';
import { setBackgroundMusicUrl } from '../utils/sound';

export const DEFAULT_INVITATION_INFO: InvitationInfo = {
  id: 'default',
  child_name: 'Faqih Al-Arif Billah',
  parents_name: 'Bpk. Dede Nurjaya & Ibu Ruslinawati',
  event_day_date: 'Sabtu, 19 Desember 2026',
  event_time: '18.00 – 00.00 WIB',
  event_venue: 'Lumé Coffee',
  event_address:
    'Lumé Coffee, Jl. KH Abdullah Syafei No.7, RT.6/RW.2, Manggarai Sel., Kec. Tebet, Kota Jakarta Selatan, DKI Jakarta 12860',
  invitation_message:
    'Dengan memohon rahmat dan ridho Allah SWT, kami mengundang Bapak/Ibu/Saudara/i untuk turut hadir memberikan doa restu pada acara Walimatul Khitan putra kami, langkah awal sang pemberani menuju pribadi yang sholeh, sehat, dan penuh semangat.',
  hero_photo_url: null,
  maps_url:
    'https://www.google.com/maps/search/?api=1&query=Lume+Coffee+Jl+KH+Abdullah+Syafei+No+7+Tebet+Jakarta+Selatan+12860',
  maps_embed_url:
    'https://maps.google.com/maps?q=Lume%20Coffee%20Jl.%20KH%20Abdullah%20Syafei%20No.7%20Tebet%20Jakarta%20Selatan&t=&z=16&ie=UTF8&iwloc=&output=embed',
};

export const DEFAULT_GALLERY_PHOTOS: GalleryPhoto[] = [
  {
    id: 'default-1',
    carriage_no: 'Gerbong 01',
    tag_label: 'Masa Kecil',
    title: 'Masa Kecil Faqih (Childhood)',
    caption:
      'Potret manis masa kecil Faqih saat balita dengan senyum cerianya dan topi masinis kecil kesayangan.',
    image_url: '',
    order_index: 1,
  },
  {
    id: 'default-2',
    carriage_no: 'Gerbong 02',
    tag_label: 'Marching Band TK',
    title: 'Aksi Marching Band TK',
    caption:
      'Momen gagah Faqih tampil penuh percaya diri membawakan irama drum bersama barisan marching band TK.',
    image_url: '',
    order_index: 2,
  },
  {
    id: 'default-3',
    carriage_no: 'Gerbong 03',
    tag_label: 'Wisuda TK',
    title: 'Wisuda TK Penuh Bangga',
    caption:
      'Langkah penuh syukur saat Faqih mengenakan toga wisuda TK dan merayakan kelulusan pertamanya.',
    image_url: '',
    order_index: 3,
  },
  {
    id: 'default-4',
    carriage_no: 'Gerbong 04',
    tag_label: 'Sekolah',
    title: 'Semangat Belajar di Sekolah',
    caption:
      'Keseruan Faqih mengikuti pelajaran di kelas dengan penuh rasa ingin tahu dan semangat belajar tinggi.',
    image_url: '',
    order_index: 4,
  },
  {
    id: 'default-5',
    carriage_no: 'Gerbong 05',
    tag_label: 'Favoritnya',
    title: 'Faqih Bersama Favoritnya',
    caption:
      'Momen penuh tawa saat Faqih menghabiskan waktu dengan mainan dan aktivitas favorit kesukaannya.',
    image_url: '',
    order_index: 5,
  },
  {
    id: 'default-6',
    carriage_no: 'Gerbong 06',
    tag_label: 'Keluarga',
    title: 'Faqih & Keluarga Tercinta',
    caption:
      'Kebersamaan hangat Faqih bersama Bapak Dede Nurjaya dan Ibu Ruslinawati yang selalu mendukung langkahnya.',
    image_url: '',
    order_index: 6,
  },
];

export const DEFAULT_MUSIC_SETTING: MusicSetting = {
  id: 'default',
  title: 'Thomas & Friends Theme Song',
  audio_url: '/lagu-undangan.mp3',
  is_active: true,
};

interface InvitationContextType {
  invitationInfo: InvitationInfo;
  galleryPhotos: GalleryPhoto[];
  musicSettings: MusicSetting;
  isLoading: boolean;
  isSupabaseConfigured: boolean;
  refreshData: () => Promise<void>;
  updateInvitationInfo: (data: Partial<InvitationInfo>) => Promise<void>;
  addGalleryPhoto: (photo: Omit<GalleryPhoto, 'id' | 'created_at'>) => Promise<GalleryPhoto>;
  updateGalleryPhoto: (id: string, updates: Partial<GalleryPhoto>) => Promise<void>;
  deleteGalleryPhoto: (id: string, storagePath?: string | null) => Promise<void>;
  updateMusicSetting: (updates: Partial<MusicSetting>) => Promise<void>;
}

const InvitationContext = createContext<InvitationContextType | undefined>(undefined);

export const InvitationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [invitationInfo, setInvitationInfo] = useState<InvitationInfo>(DEFAULT_INVITATION_INFO);
  const [galleryPhotos, setGalleryPhotos] = useState<GalleryPhoto[]>(DEFAULT_GALLERY_PHOTOS);
  const [musicSettings, setMusicSettings] = useState<MusicSetting>(DEFAULT_MUSIC_SETTING);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchAllData = useCallback(async () => {
    setIsLoading(true);

    if (!isSupabaseConfigured) {
      setIsLoading(false);
      return;
    }

    try {
      // 1. Fetch invitation info
      const { data: infoData, error: infoErr } = await supabase
        .from('invitation_info')
        .select('*')
        .eq('id', 'default')
        .maybeSingle();

      if (!infoErr && infoData) {
        setInvitationInfo((prev) => ({ ...prev, ...infoData }));
      }

      // 2. Fetch gallery photos
      const { data: photosData, error: photosErr } = await supabase
        .from('gallery_photos')
        .select('*')
        .order('order_index', { ascending: true })
        .order('created_at', { ascending: true });

      if (!photosErr && photosData && photosData.length > 0) {
        setGalleryPhotos(photosData);
      } else {
        // Fallback to defaults if table is empty
        setGalleryPhotos(DEFAULT_GALLERY_PHOTOS);
      }

      // 3. Fetch music settings
      const { data: musicData, error: musicErr } = await supabase
        .from('music_settings')
        .select('*')
        .eq('id', 'default')
        .maybeSingle();

      if (!musicErr && musicData) {
        setMusicSettings((prev) => ({ ...prev, ...musicData }));
        if (musicData.audio_url) {
          setBackgroundMusicUrl(musicData.audio_url);
        }
      }
    } catch (err) {
      console.warn('Gagal memuat data dari Supabase, menggunakan data bawaan:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchAllData();
  }, [fetchAllData]);

  // Update invitation info in Supabase
  const updateInvitationInfo = async (data: Partial<InvitationInfo>) => {
    const updated = {
      ...invitationInfo,
      ...data,
      id: 'default',
      updated_at: new Date().toISOString(),
    };

    setInvitationInfo(updated);

    if (isSupabaseConfigured) {
      const { error } = await supabase.from('invitation_info').upsert(updated);
      if (error) {
        throw new Error(`Gagal menyimpan info undangan ke Supabase: ${error.message}`);
      }
    }
  };

  // Add new gallery photo in Supabase
  const addGalleryPhoto = async (
    photo: Omit<GalleryPhoto, 'id' | 'created_at'>
  ): Promise<GalleryPhoto> => {
    const newOrder = photo.order_index || galleryPhotos.length + 1;
    const tempId = `photo-${Date.now()}`;

    const newPhotoItem: GalleryPhoto = {
      ...photo,
      id: tempId,
      order_index: newOrder,
      created_at: new Date().toISOString(),
    };

    if (!isSupabaseConfigured) {
      setGalleryPhotos((prev) => [...prev, newPhotoItem]);
      return newPhotoItem;
    }

    const { data, error } = await supabase
      .from('gallery_photos')
      .insert({
        carriage_no: photo.carriage_no || `Gerbong 0${newOrder}`,
        tag_label: photo.tag_label || 'Kenangan',
        title: photo.title,
        caption: photo.caption,
        image_url: photo.image_url,
        storage_path: photo.storage_path || null,
        order_index: newOrder,
      })
      .select()
      .single();

    if (error || !data) {
      throw new Error(`Gagal menambahkan foto ke Supabase: ${error?.message || 'Unknown error'}`);
    }

    setGalleryPhotos((prev) => {
      // If previous gallery was default list without real URLs, replace or append
      const isDefaultOnly = prev.length === DEFAULT_GALLERY_PHOTOS.length && prev.every((p) => !p.image_url);
      if (isDefaultOnly) {
        return [data];
      }
      return [...prev, data];
    });

    return data;
  };

  // Update existing gallery photo
  const updateGalleryPhoto = async (id: string, updates: Partial<GalleryPhoto>) => {
    setGalleryPhotos((prev) =>
      prev.map((photo) => (photo.id === id ? { ...photo, ...updates } : photo))
    );

    if (isSupabaseConfigured) {
      const { error } = await supabase
        .from('gallery_photos')
        .update(updates)
        .eq('id', id);

      if (error) {
        throw new Error(`Gagal memperbarui foto di Supabase: ${error.message}`);
      }
    }
  };

  // Delete gallery photo from table and storage
  const deleteGalleryPhoto = async (id: string, storagePath?: string | null) => {
    // 1. Delete from storage if storage path exists
    if (storagePath) {
      await deleteFileFromStorage(storagePath);
    }

    setGalleryPhotos((prev) => {
      const filtered = prev.filter((p) => p.id !== id);
      return filtered.length > 0 ? filtered : DEFAULT_GALLERY_PHOTOS;
    });

    if (isSupabaseConfigured) {
      const { error } = await supabase.from('gallery_photos').delete().eq('id', id);
      if (error) {
        throw new Error(`Gagal menghapus foto dari Supabase: ${error.message}`);
      }
    }
  };

  // Update music settings
  const updateMusicSetting = async (updates: Partial<MusicSetting>) => {
    const updated = {
      ...musicSettings,
      ...updates,
      id: 'default',
      updated_at: new Date().toISOString(),
    };

    setMusicSettings(updated);

    if (updated.audio_url) {
      setBackgroundMusicUrl(updated.audio_url);
    }

    if (isSupabaseConfigured) {
      const { error } = await supabase.from('music_settings').upsert(updated);
      if (error) {
        throw new Error(`Gagal menyimpan pengaturan musik ke Supabase: ${error.message}`);
      }
    }
  };

  return (
    <InvitationContext.Provider
      value={{
        invitationInfo,
        galleryPhotos,
        musicSettings,
        isLoading,
        isSupabaseConfigured,
        refreshData: fetchAllData,
        updateInvitationInfo,
        addGalleryPhoto,
        updateGalleryPhoto,
        deleteGalleryPhoto,
        updateMusicSetting,
      }}
    >
      {children}
    </InvitationContext.Provider>
  );
};

export const useInvitationData = (): InvitationContextType => {
  const context = useContext(InvitationContext);
  if (!context) {
    throw new Error('useInvitationData harus digunakan di dalam InvitationProvider');
  }
  return context;
};
