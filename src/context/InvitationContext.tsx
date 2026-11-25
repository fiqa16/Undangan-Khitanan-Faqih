import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  supabase,
  isSupabaseConfigured,
  InvitationInfo,
  GalleryPhoto,
  MusicSetting,
  RundownItem,
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
  venue_photo_url: null,
  venue_photo_path: null,
  venue_description: 'Lumé Coffee Tebet, lokasi stasiun utama perayaan Walimatul Khitan Faqih.',
  maps_url:
    'https://www.google.com/maps/search/?api=1&query=Lume+Coffee+Jl+KH+Abdullah+Syafei+No+7+Tebet+Jakarta+Selatan+12860',
  maps_embed_url:
    'https://maps.google.com/maps?q=Lume%20Coffee%20Jl.%20KH%20Abdullah%20Syafei%20No.7%20Tebet%20Jakarta%20Selatan&t=&z=16&ie=UTF8&iwloc=&output=embed',
};

export const DEFAULT_RUNDOWN_ITEMS: RundownItem[] = [
  {
    id: 'draft-1',
    activity_name: 'Kedatangan tamu undangan',
    start_time: '18.00',
    end_time: '19.00',
    duration: '1 jam',
    description: 'Keluarga Besar & Tamu Undangan',
    order_index: 1,
    is_published: false,
  },
  {
    id: 'draft-2',
    activity_name: 'Pembukaan oleh MC',
    start_time: '19.00',
    end_time: '19.05',
    duration: '5 menit',
    description: 'MC',
    order_index: 2,
    is_published: false,
  },
  {
    id: 'draft-3',
    activity_name: "Pembacaan ayat suci Al-Qur'an",
    start_time: '19.05',
    end_time: '19.20',
    duration: '15 menit',
    description: 'Ua Hafsah',
    order_index: 3,
    is_published: false,
  },
  {
    id: 'draft-4',
    activity_name: 'Sambutan dari orang tua',
    start_time: '19.20',
    end_time: '19.40',
    duration: '20 menit',
    description: 'Orang Tua',
    order_index: 4,
    is_published: false,
  },
  {
    id: 'draft-5',
    activity_name: 'Tausiyah singkat',
    start_time: '19.40',
    end_time: '20.00',
    duration: '20 menit',
    description: 'Pak Ustad Ridwan',
    order_index: 5,
    is_published: false,
  },
  {
    id: 'draft-6',
    activity_name: 'Doa bersama',
    start_time: '20.00',
    end_time: '20.15',
    duration: '15 menit',
    description: 'Pak Ustad Ridwan / Kakek',
    order_index: 6,
    is_published: false,
  },
  {
    id: 'draft-7',
    activity_name: 'Penyampaian ucapan dan nasihat untuk anak yang dikhitan',
    start_time: '20.15',
    end_time: '20.45',
    duration: '30 menit',
    description: 'Nenek/Kakek, Om/Tante, dan keluarga lainnya',
    order_index: 7,
    is_published: false,
  },
  {
    id: 'draft-8',
    activity_name: 'Foto bersama keluarga',
    start_time: '20.45',
    end_time: '20.55',
    duration: '10 menit',
    description: 'Keluarga Besar',
    order_index: 8,
    is_published: false,
  },
  {
    id: 'draft-9',
    activity_name: 'Makan bersama',
    start_time: '20.55',
    end_time: '21.55',
    duration: '60 menit',
    description: 'Keluarga Besar',
    order_index: 9,
    is_published: false,
  },
  {
    id: 'draft-10',
    activity_name: 'Karaoke dan Fun Time',
    start_time: '21.55',
    end_time: '23.55',
    duration: '60 menit',
    description: 'Keluarga Besar',
    order_index: 10,
    is_published: false,
  },
  {
    id: 'draft-11',
    activity_name: 'Penutupan',
    start_time: '23.55',
    end_time: '00.00',
    duration: '5 menit',
    description: 'Orang Tua',
    order_index: 11,
    is_published: false,
  },
];

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
  rundownItems: RundownItem[];
  isLoading: boolean;
  isRundownLoading: boolean;
  isSupabaseConfigured: boolean;
  refreshData: () => Promise<void>;
  updateInvitationInfo: (data: Partial<InvitationInfo>) => Promise<void>;
  updateVenueLocation: (data: {
    venue_photo_url?: string | null;
    venue_photo_path?: string | null;
    venue_description?: string | null;
  }) => Promise<void>;
  addGalleryPhoto: (photo: Omit<GalleryPhoto, 'id' | 'created_at'>) => Promise<GalleryPhoto>;
  updateGalleryPhoto: (id: string, updates: Partial<GalleryPhoto>) => Promise<void>;
  deleteGalleryPhoto: (id: string, storagePath?: string | null) => Promise<void>;
  updateMusicSetting: (updates: Partial<MusicSetting>) => Promise<void>;
  addRundownItem: (item: Omit<RundownItem, 'id' | 'created_at' | 'updated_at'>) => Promise<RundownItem>;
  updateRundownItem: (id: string, updates: Partial<RundownItem>) => Promise<void>;
  deleteRundownItem: (id: string) => Promise<void>;
  reorderRundownItems: (reordered: RundownItem[]) => Promise<void>;
  publishRundown: (published: boolean) => Promise<void>;
}

const InvitationContext = createContext<InvitationContextType | undefined>(undefined);

export const InvitationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [invitationInfo, setInvitationInfo] = useState<InvitationInfo>(DEFAULT_INVITATION_INFO);
  const [galleryPhotos, setGalleryPhotos] = useState<GalleryPhoto[]>(DEFAULT_GALLERY_PHOTOS);
  const [musicSettings, setMusicSettings] = useState<MusicSetting>(DEFAULT_MUSIC_SETTING);
  const [rundownItems, setRundownItems] = useState<RundownItem[]>(DEFAULT_RUNDOWN_ITEMS);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRundownLoading, setIsRundownLoading] = useState<boolean>(false);

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

      // 4. Fetch event rundown
      const { data: rundownData, error: rundownErr } = await supabase
        .from('event_rundown')
        .select('*')
        .order('order_index', { ascending: true });

      if (!rundownErr && rundownData && rundownData.length > 0) {
        setRundownItems(rundownData);
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

  // Update venue photo / location in Supabase
  const updateVenueLocation = async (data: {
    venue_photo_url?: string | null;
    venue_photo_path?: string | null;
    venue_description?: string | null;
  }) => {
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
        throw new Error(`Gagal menyimpan foto lokasi ke Supabase: ${error.message}`);
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
    // If it's a default card that wasn't in Supabase yet, insert it as a real record!
    if (id.startsWith('default-') && isSupabaseConfigured) {
      const existingDefault = galleryPhotos.find((p) => p.id === id);
      const merged = { ...existingDefault, ...updates };

      const { data, error } = await supabase
        .from('gallery_photos')
        .insert({
          carriage_no: merged.carriage_no || 'Gerbong Kenangan',
          tag_label: merged.tag_label || 'Kenangan',
          title: merged.title || 'Foto Kenangan Faqih',
          caption: merged.caption || '',
          image_url: merged.image_url || '',
          storage_path: merged.storage_path || null,
          order_index: merged.order_index || 1,
        })
        .select()
        .single();

      if (error || !data) {
        throw new Error(`Gagal menyimpan foto ke Supabase: ${error?.message || 'Error'}`);
      }

      setGalleryPhotos((prev) => prev.map((photo) => (photo.id === id ? data : photo)));
      return;
    }

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

    if (isSupabaseConfigured && !id.startsWith('default-')) {
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

  // --- RUNDOWN METHODS ---
  const addRundownItem = async (
    item: Omit<RundownItem, 'id' | 'created_at' | 'updated_at'>
  ): Promise<RundownItem> => {
    setIsRundownLoading(true);
    const tempId = `rundown-${Date.now()}`;
    const nextOrder = item.order_index || rundownItems.length + 1;

    const newItem: RundownItem = {
      ...item,
      id: tempId,
      order_index: nextOrder,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (!isSupabaseConfigured) {
      setRundownItems((prev) => [...prev, newItem]);
      setIsRundownLoading(false);
      return newItem;
    }

    try {
      const { data, error } = await supabase
        .from('event_rundown')
        .insert({
          activity_name: item.activity_name,
          start_time: item.start_time,
          end_time: item.end_time || null,
          duration: item.duration || null,
          description: item.description || null,
          order_index: nextOrder,
          is_published: item.is_published ?? false,
        })
        .select()
        .single();

      if (error || !data) {
        throw new Error(error?.message || 'Gagal menambahkan kegiatan ke rundown.');
      }

      setRundownItems((prev) => [...prev, data]);
      return data;
    } finally {
      setIsRundownLoading(false);
    }
  };

  const updateRundownItem = async (id: string, updates: Partial<RundownItem>) => {
    setIsRundownLoading(true);
    setRundownItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, ...updates, updated_at: new Date().toISOString() } : item
      )
    );

    if (isSupabaseConfigured && !id.startsWith('draft-')) {
      try {
        const { error } = await supabase
          .from('event_rundown')
          .update({
            ...updates,
            updated_at: new Date().toISOString(),
          })
          .eq('id', id);

        if (error) {
          throw new Error(`Gagal memperbarui rundown di Supabase: ${error.message}`);
        }
      } finally {
        setIsRundownLoading(false);
      }
    } else {
      setIsRundownLoading(false);
    }
  };

  const deleteRundownItem = async (id: string) => {
    setIsRundownLoading(true);
    setRundownItems((prev) => prev.filter((item) => item.id !== id));

    if (isSupabaseConfigured && !id.startsWith('draft-')) {
      try {
        const { error } = await supabase.from('event_rundown').delete().eq('id', id);
        if (error) {
          throw new Error(`Gagal menghapus kegiatan dari Supabase: ${error.message}`);
        }
      } finally {
        setIsRundownLoading(false);
      }
    } else {
      setIsRundownLoading(false);
    }
  };

  const reorderRundownItems = async (reordered: RundownItem[]) => {
    const updated = reordered.map((item, idx) => ({ ...item, order_index: idx + 1 }));
    setRundownItems(updated);

    if (isSupabaseConfigured) {
      try {
        for (const item of updated) {
          if (!item.id.startsWith('draft-')) {
            await supabase
              .from('event_rundown')
              .update({ order_index: item.order_index })
              .eq('id', item.id);
          }
        }
      } catch (err) {
        console.warn('Gagal memperbarui urutan rundown di Supabase:', err);
      }
    }
  };

  const publishRundown = async (published: boolean) => {
    setIsRundownLoading(true);
    const updated = rundownItems.map((item) => ({ ...item, is_published: published }));
    setRundownItems(updated);

    if (isSupabaseConfigured) {
      try {
        // If items are draft only (not yet saved to table), insert them
        for (const item of updated) {
          if (item.id.startsWith('draft-')) {
            await supabase.from('event_rundown').insert({
              activity_name: item.activity_name,
              start_time: item.start_time,
              end_time: item.end_time || null,
              duration: item.duration || null,
              description: item.description || null,
              order_index: item.order_index,
              is_published: published,
            });
          } else {
            await supabase
              .from('event_rundown')
              .update({ is_published: published, updated_at: new Date().toISOString() })
              .eq('id', item.id);
          }
        }
        // Refetch to sync real IDs from DB
        const { data } = await supabase
          .from('event_rundown')
          .select('*')
          .order('order_index', { ascending: true });
        if (data && data.length > 0) {
          setRundownItems(data);
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Gagal mengubah status publikasi rundown.';
        throw new Error(msg);
      } finally {
        setIsRundownLoading(false);
      }
    } else {
      setIsRundownLoading(false);
    }
  };

  return (
    <InvitationContext.Provider
      value={{
        invitationInfo,
        galleryPhotos,
        musicSettings,
        rundownItems,
        isLoading,
        isRundownLoading,
        isSupabaseConfigured,
        refreshData: fetchAllData,
        updateInvitationInfo,
        updateVenueLocation,
        addGalleryPhoto,
        updateGalleryPhoto,
        deleteGalleryPhoto,
        updateMusicSetting,
        addRundownItem,
        updateRundownItem,
        deleteRundownItem,
        reorderRundownItems,
        publishRundown,
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
