import React, { useState, useRef, useEffect } from 'react';
import {
  Music,
  Play,
  Pause,
  Upload,
  Save,
  Check,
  Volume2,
  VolumeX,
  Loader2,
  Sparkles,
  AlertCircle,
  FileAudio,
} from 'lucide-react';
import { useInvitationData } from '../../context/InvitationContext';
import { uploadFileToStorage } from '../../utils/supabase';

interface MusicManagerProps {
  onShowToast: (message: string) => void;
}

export const MusicManager: React.FC<MusicManagerProps> = ({ onShowToast }) => {
  const { musicSettings, updateMusicSetting, isSupabaseConfigured } = useInvitationData();

  const [musicTitle, setMusicTitle] = useState(musicSettings.title);
  const [isActive, setIsActive] = useState(musicSettings.is_active);
  const [previewAudioUrl, setPreviewAudioUrl] = useState(musicSettings.audio_url);
  const [selectedMusicFile, setSelectedMusicFile] = useState<File | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isSaving, setIsSaving] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setMusicTitle(musicSettings.title);
    setIsActive(musicSettings.is_active);
    setPreviewAudioUrl(musicSettings.audio_url);
  }, [musicSettings]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => {
      setDuration(audio.duration || 0);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime || 0);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [previewAudioUrl]);

  const handleTogglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => {
          onShowToast('Tidak dapat memutar audio.');
          setIsPlaying(false);
        });
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;
    const seekTime = Number(e.target.value);
    audio.currentTime = seekTime;
    setCurrentTime(seekTime);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('audio/') && !file.name.endsWith('.mp3')) {
      onShowToast('Harap pilih file audio (MP3, WAV, AAC, M4A).');
      return;
    }

    setSelectedMusicFile(file);
    const localUrl = URL.createObjectURL(file);
    setPreviewAudioUrl(localUrl);

    // Auto update title with file name without extension
    const cleanName = file.name.replace(/\.[^/.]+$/, '');
    if (!musicTitle || musicTitle === 'Thomas & Friends Theme Song') {
      setMusicTitle(cleanName);
    }

    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!musicTitle.trim()) {
      onShowToast('Judul musik tidak boleh kosong.');
      return;
    }

    setIsSaving(true);
    try {
      let finalAudioUrl = previewAudioUrl;
      let storagePath = musicSettings.storage_path;

      // Upload file to Supabase Storage if configured and user picked a new file
      if (selectedMusicFile && isSupabaseConfigured) {
        const uploadResult = await uploadFileToStorage(selectedMusicFile, 'music');
        finalAudioUrl = uploadResult.publicUrl;
        storagePath = uploadResult.path;
      }

      await updateMusicSetting({
        title: musicTitle.trim(),
        audio_url: finalAudioUrl,
        storage_path: storagePath,
        is_active: isActive,
      });

      onShowToast('Pengaturan musik berhasil disimpan ke Supabase!');
      setSelectedMusicFile(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal menyimpan musik.';
      onShowToast(msg);
    } finally {
      setIsSaving(false);
    }
  };

  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || seconds === 0) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-5 rounded-3xl bg-white border border-[#FCBF49]/40 shadow-xs">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="w-4 h-4 text-[#D62828]" />
          <h2 className="text-base font-extrabold text-[#2B2D42]">
            Kelola Musik Latar Undangan
          </h2>
        </div>
        <p className="text-xs text-[#5C403D]">
          Atur musik pengiring yang diputar saat pengunjung membuka website undangan. Anda dapat mengunggah file lagu baru berformat MP3.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Music Player Card */}
        <div className="card-storybook rounded-3xl p-6 bg-white border border-[#FCBF49]/40 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#7D5800]">
                Pemutar Musik (Audio Player)
              </span>
              <span
                className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full ${
                  isActive
                    ? 'bg-[#E7F8E8] text-[#1B6924] border border-[#A4E3AB]'
                    : 'bg-[#FFF3CD] text-[#856404] border border-[#FFEEBA]'
                }`}
              >
                {isActive ? 'Musik Aktif di Undangan' : 'Musik Dinonaktifkan'}
              </span>
            </div>

            {/* Vinyl / Train Graphic Player */}
            <div className="p-6 rounded-3xl bg-gradient-to-b from-[#2B2D42] to-[#1A1B29] text-white text-center shadow-lg relative overflow-hidden mb-5">
              <div
                className={`w-28 h-28 mx-auto rounded-full bg-[#181A2E] border-4 border-[#FCBF49] flex items-center justify-center shadow-inner mb-4 transition-transform duration-700 ${
                  isPlaying ? 'animate-[spin_4s_linear_infinite]' : ''
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-[#D62828] border-2 border-white flex items-center justify-center">
                  <Music className="w-5 h-5 text-[#FCBF49]" />
                </div>
              </div>

              <h3 className="text-base font-extrabold text-[#FCBF49] truncate px-2">
                {musicTitle || 'Thomas & Friends Theme Song'}
              </h3>
              <p className="text-xs text-white/70 mt-1">
                {selectedMusicFile ? `File baru: ${selectedMusicFile.name}` : 'File audio saat ini'}
              </p>

              {/* Progress Slider */}
              <div className="mt-4 px-2">
                <input
                  type="range"
                  min={0}
                  max={duration || 100}
                  value={currentTime}
                  onChange={handleSeek}
                  className="w-full h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-[#FCBF49]"
                />
                <div className="flex justify-between text-[10px] text-white/70 mt-1 font-mono">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>
            </div>

            {/* Hidden Audio Element */}
            <audio
              ref={audioRef}
              src={previewAudioUrl}
              preload="metadata"
            />

            {/* Controls */}
            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={handleTogglePlay}
                className="btn-tactile-red min-h-[46px] px-6 rounded-full text-xs font-bold inline-flex items-center gap-2 cursor-pointer shadow-md"
              >
                {isPlaying ? (
                  <>
                    <Pause className="w-4 h-4" />
                    <span>Jeda Audio</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-white" />
                    <span>Putar Audio</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-[#FCBF49]/30 text-center">
            <p className="text-[11px] text-[#5C403D]">
              Format yang didukung: MP3, M4A, AAC, WAV (Maksimal 15MB)
            </p>
          </div>
        </div>

        {/* Music Settings & Upload Form */}
        <div className="card-storybook rounded-3xl p-6 bg-white border border-[#FCBF49]/40">
          <form onSubmit={handleSave} className="space-y-4">
            <h3 className="text-sm font-extrabold text-[#2B2D42] pb-2 border-b border-[#FCBF49]/30">
              Pengaturan Musik &amp; Unggah File
            </h3>

            {/* Music Title */}
            <div>
              <label
                htmlFor="music-title"
                className="block text-xs font-bold text-[#2B2D42] mb-1.5"
              >
                Judul Musik *
              </label>
              <input
                id="music-title"
                type="text"
                required
                value={musicTitle}
                onChange={(e) => setMusicTitle(e.target.value)}
                placeholder="Contoh: Thomas & Friends Theme Song"
                className="w-full min-h-[44px] px-3.5 rounded-xl bg-[#FFF9F2] border border-[#FCBF49]/40 text-xs font-bold text-[#2B2D42] focus:outline-none focus:ring-2 focus:ring-[#D62828]"
              />
            </div>

            {/* Upload New Music File */}
            <div>
              <label className="block text-xs font-bold text-[#2B2D42] mb-1.5">
                Ganti File Musik (Upload dari Perangkat)
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept="audio/*,.mp3"
                onChange={handleFileChange}
                className="hidden"
              />

              <div className="p-4 rounded-2xl bg-[#FFF9F2] border-2 border-dashed border-[#FCBF49]/60 text-center">
                <FileAudio className="w-8 h-8 text-[#D62828] mx-auto mb-2 opacity-80" />
                {selectedMusicFile ? (
                  <div className="space-y-1 mb-2">
                    <p className="text-xs font-bold text-[#2B2D42]">
                      {selectedMusicFile.name}
                    </p>
                    <p className="text-[11px] text-[#5C403D]">
                      Ukuran: {(selectedMusicFile.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  </div>
                ) : (
                  <p className="text-xs text-[#5C403D] mb-2">
                    Pilih file MP3 baru dari komputer atau HP
                  </p>
                )}

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="min-h-[38px] px-4 rounded-full bg-white hover:bg-[#FFDEA9]/50 border border-[#FCBF49] text-xs font-bold text-[#2B2D42] inline-flex items-center gap-1.5 shadow-xs"
                >
                  <Upload className="w-3.5 h-3.5 text-[#D62828]" />
                  <span>{selectedMusicFile ? 'Ganti File Lain' : 'Pilih File MP3'}</span>
                </button>
              </div>
            </div>

            {/* Toggle Active Switch */}
            <div className="pt-2">
              <label className="flex items-center justify-between p-3.5 rounded-2xl bg-[#FFF9F2] border border-[#FCBF49]/40 cursor-pointer">
                <div>
                  <span className="block text-xs font-bold text-[#2B2D42]">
                    Aktifkan Musik Otomatis
                  </span>
                  <span className="block text-[11px] text-[#5C403D]">
                    Pengunjung dapat mendengarkan musik saat tombol diputar
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-5 h-5 rounded text-[#D62828] focus:ring-[#D62828] accent-[#D62828]"
                />
              </label>
            </div>

            {/* Save Button */}
            <div className="pt-3">
              <button
                type="submit"
                disabled={isSaving}
                className="btn-tactile-red w-full min-h-[48px] rounded-full text-xs font-extrabold uppercase tracking-wider inline-flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 shadow-md"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Menyimpan ke Supabase...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Simpan Pengaturan Musik</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
