import React from 'react';
import { Loader2, Train } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { AdminLogin } from './AdminLogin';
import { AdminDashboard } from './AdminDashboard';

interface AdminPageProps {
  onBackToSite: () => void;
  onShowToast: (message: string) => void;
}

export const AdminPage: React.FC<AdminPageProps> = ({ onBackToSite, onShowToast }) => {
  const { user, isAdmin, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FFF9F2] flex flex-col items-center justify-center p-4">
        <div className="w-16 h-16 rounded-3xl bg-[#D62828] text-white flex items-center justify-center shadow-lg border-[3px] border-[#FCBF49] mb-4">
          <Train className="w-8 h-8 text-[#FCBF49] animate-bounce" />
        </div>
        <div className="flex items-center gap-2 text-xs font-bold text-[#7D5800]">
          <Loader2 className="w-4 h-4 animate-spin text-[#D62828]" />
          <span>Memeriksa Otorisasi Masinis...</span>
        </div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return <AdminLogin onBackToSite={onBackToSite} />;
  }

  return <AdminDashboard onViewSite={onBackToSite} onShowToast={onShowToast} />;
};
