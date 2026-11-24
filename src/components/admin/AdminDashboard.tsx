import React, { useState } from 'react';
import {
  Train,
  LogOut,
  ExternalLink,
  Images,
  FileText,
  Music,
  HelpCircle,
  Shield,
  Sparkles,
  RefreshCw,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useInvitationData } from '../../context/InvitationContext';
import { GalleryManager } from './GalleryManager';
import { InvitationInfoManager } from './InvitationInfoManager';
import { MusicManager } from './MusicManager';
import { SupabaseGuideModal } from './SupabaseGuideModal';

type ActiveTab = 'galeri' | 'info' | 'musik';

interface AdminDashboardProps {
  onViewSite: () => void;
  onShowToast: (message: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onViewSite,
  onShowToast,
}) => {
  const { user, signOut } = useAuth();
  const { isSupabaseConfigured, refreshData, isLoading } = useInvitationData();
  const [activeTab, setActiveTab] = useState<ActiveTab>('galeri');
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshData();
    setIsRefreshing(false);
    onShowToast('Data berhasil diperbarui dari Supabase.');
  };

  const handleLogout = async () => {
    await signOut();
    onShowToast('Anda telah berhasil keluar dari akun admin.');
  };

  return (
    <div className="min-h-screen bg-[#FFF9F2] text-[#2B2D42]">
      {/* Top Navbar */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-[#FCBF49]/40 shadow-xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-[#D62828] text-white flex items-center justify-center border-2 border-[#FCBF49] shadow-xs shrink-0">
              <Train className="w-5 h-5 text-[#FCBF49]" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-sm sm:text-base font-black text-[#2B2D42] truncate">
                  Admin Khitanan Faqih
                </h1>
                <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-[#E4F6FF] text-[#005F76] border border-[#4CC9F0]/40">
                  <Shield className="w-3 h-3" />
                  <span>Admin</span>
                </span>
              </div>
              <p className="text-[11px] text-[#5C403D] truncate">
                {user?.email || 'Administrator Terverifikasi'}
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Guide Button */}
            <button
              type="button"
              onClick={() => setIsGuideOpen(true)}
              className="min-h-[38px] px-3 rounded-full bg-[#FFF9F2] hover:bg-[#FFDEA9]/50 border border-[#FCBF49]/60 text-xs font-bold text-[#7D5800] inline-flex items-center gap-1.5 transition-colors"
              title="Panduan Supabase"
            >
              <HelpCircle className="w-4 h-4 text-[#D62828]" />
              <span className="hidden md:inline">Panduan Supabase</span>
            </button>

            {/* Refresh Data */}
            <button
              type="button"
              onClick={handleRefresh}
              disabled={isRefreshing || isLoading}
              className="min-h-[38px] min-w-[38px] px-2.5 rounded-full bg-[#FFF9F2] hover:bg-[#FFDEA9]/50 border border-[#FCBF49]/60 text-xs font-bold text-[#2B2D42] inline-flex items-center justify-center transition-colors"
              title="Segarkan Data"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>

            {/* View Site */}
            <button
              type="button"
              onClick={onViewSite}
              className="min-h-[38px] px-3.5 rounded-full bg-[#FFF9F2] hover:bg-[#FFDEA9]/50 border border-[#2B2D42]/20 text-xs font-bold text-[#2B2D42] inline-flex items-center gap-1.5 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Lihat Undangan</span>
            </button>

            {/* Logout */}
            <button
              type="button"
              onClick={handleLogout}
              className="min-h-[38px] px-3.5 rounded-full bg-white hover:bg-[#FFEAE8] border border-[#FFCCD0] text-xs font-bold text-[#D62828] inline-flex items-center gap-1.5 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Keluar</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {/* Supabase Notice Banner if not configured */}
        {!isSupabaseConfigured && (
          <div className="p-4 rounded-3xl bg-[#FFF3CD] border border-[#FFEEBA] text-[#856404] shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-5 h-5 text-[#856404] shrink-0" />
              <p className="text-xs">
                <strong>Mode Pratinjau Lokal:</strong> Kredensial Supabase belum terisi di{' '}
                <code>.env.local</code>. Klik tombol Panduan Supabase untuk melihat petunjuk setup lengkap.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsGuideOpen(true)}
              className="px-3.5 py-1.5 rounded-full bg-[#856404] text-white text-xs font-bold hover:bg-[#6d5102] shrink-0"
            >
              Lihat Panduan
            </button>
          </div>
        )}

        {/* Navigation Tabs Bar */}
        <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-white border border-[#FCBF49]/40 shadow-xs overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('galeri')}
            className={`min-h-[44px] px-5 rounded-xl text-xs font-bold transition-all inline-flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'galeri'
                ? 'bg-[#D62828] text-white shadow-xs'
                : 'text-[#5C403D] hover:text-[#2B2D42] hover:bg-[#FFF9F2]'
            }`}
          >
            <Images className="w-4 h-4" />
            <span>A. Kelola Foto Galeri</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('info')}
            className={`min-h-[44px] px-5 rounded-xl text-xs font-bold transition-all inline-flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'info'
                ? 'bg-[#D62828] text-white shadow-xs'
                : 'text-[#5C403D] hover:text-[#2B2D42] hover:bg-[#FFF9F2]'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>B. Kelola Informasi Undangan</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('musik')}
            className={`min-h-[44px] px-5 rounded-xl text-xs font-bold transition-all inline-flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'musik'
                ? 'bg-[#D62828] text-white shadow-xs'
                : 'text-[#5C403D] hover:text-[#2B2D42] hover:bg-[#FFF9F2]'
            }`}
          >
            <Music className="w-4 h-4" />
            <span>C. Kelola Musik</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="animate-in fade-in duration-200">
          {activeTab === 'galeri' && <GalleryManager onShowToast={onShowToast} />}
          {activeTab === 'info' && <InvitationInfoManager onShowToast={onShowToast} />}
          {activeTab === 'musik' && <MusicManager onShowToast={onShowToast} />}
        </div>
      </main>

      {/* Supabase Guide Modal */}
      <SupabaseGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
        onShowToast={onShowToast}
      />
    </div>
  );
};
