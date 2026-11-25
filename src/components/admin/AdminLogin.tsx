import React, { useState } from 'react';
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  Train,
  ArrowLeft,
  AlertCircle,
  Loader2,
  Copy,
  Check,
  ShieldAlert,
} from 'lucide-react';
import { useAuth, AdminDebugInfo } from '../../context/AuthContext';
import { isSupabaseConfigured } from '../../utils/supabase';

interface AdminLoginProps {
  onBackToSite: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onBackToSite }) => {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<AdminDebugInfo | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedUid, setCopiedUid] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setDebugInfo(null);

    if (!email.trim() || !password) {
      setErrorMessage('Harap masukkan email dan kata sandi.');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await signIn(email, password);
      if (!result.success) {
        setErrorMessage(result.error || 'Email atau password salah.');
        if (result.debugInfo) {
          setDebugInfo(result.debugInfo);
        }
      }
    } catch {
      setErrorMessage('Terjadi kendala saat proses login. Silakan periksa koneksi internet Anda.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyUid = (uid: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(uid);
      setCopiedUid(true);
      setTimeout(() => setCopiedUid(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF9F2] flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      {/* Decorative background glows */}
      <div
        className="fixed inset-0 pointer-events-none opacity-60"
        aria-hidden="true"
        style={{
          backgroundImage: `
            radial-gradient(circle at 20% 20%, rgba(214, 40, 40, 0.08) 0, rgba(214, 40, 40, 0) 30%),
            radial-gradient(circle at 80% 80%, rgba(252, 191, 73, 0.15) 0, rgba(252, 191, 73, 0) 35%)
          `,
        }}
      />

      {/* Back button */}
      <button
        type="button"
        onClick={onBackToSite}
        className="absolute top-6 left-6 z-20 inline-flex items-center gap-2 text-xs font-bold text-[#5C403D] hover:text-[#D62828] bg-white/80 backdrop-blur-xs px-3.5 py-2 rounded-full border border-[#FCBF49]/40 shadow-xs transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Kembali ke Website Undangan</span>
      </button>

      <div className="relative z-10 w-full max-w-[460px]">
        {/* Header Badge */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-3xl bg-[#D62828] text-white mx-auto flex items-center justify-center shadow-lg border-[3px] border-[#FCBF49] mb-3">
            <Train className="w-8 h-8 text-[#FCBF49]" />
          </div>
          <p className="text-xs font-extrabold uppercase tracking-widest text-[#7D5800]">
            Panel Masinis
          </p>
          <h1 className="text-2xl font-black text-[#2B2D42] mt-0.5">
            Admin Khitanan Faqih
          </h1>
          <p className="text-xs text-[#5C403D] mt-1">
            Masuk untuk mengelola galeri, info acara, dan musik undangan
          </p>
        </div>

        {/* Supabase Notice if not configured */}
        {!isSupabaseConfigured && (
          <div className="mb-4 p-4 rounded-2xl bg-[#FFF3CD] border border-[#FFEEBA] text-[#856404] text-xs leading-relaxed">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-[#856404] shrink-0 mt-0.5" />
              <div>
                <p className="font-bold mb-1">Supabase Belum Dikonfigurasi</p>
                <p>
                  Harap tambahkan <code className="bg-white/80 px-1 py-0.5 rounded font-mono">VITE_SUPABASE_URL</code> dan{' '}
                  <code className="bg-white/80 px-1 py-0.5 rounded font-mono">VITE_SUPABASE_ANON_KEY</code> pada file{' '}
                  <code className="bg-white/80 px-1 py-0.5 rounded font-mono">.env.local</code> atau Vercel Environment Variables.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Card Form */}
        <div className="card-ticket rounded-3xl p-6 sm:p-8 bg-white border border-[#FCBF49]/50 shadow-xl">
          {/* Main Error Alert */}
          {errorMessage && (
            <div
              role="alert"
              className="mb-4 p-3.5 rounded-2xl bg-[#FFEAE8] border border-[#FFCCD0] text-[#D62828] text-xs font-medium flex items-start gap-2.5 animate-in fade-in duration-200"
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="flex-1 leading-relaxed">
                <span className="font-bold block mb-0.5">Kendala Masuk Admin:</span>
                <span>{errorMessage}</span>
              </div>
            </div>
          )}

          {/* Diagnostic Box: Appears when Supabase Auth succeeds but admin check fails */}
          {debugInfo && (
            <div className="mb-5 p-3.5 rounded-2xl bg-[#F8F9FA] border border-[#E9ECEF] text-xs space-y-2.5 animate-in fade-in duration-200">
              <div className="flex items-center gap-1.5 text-[#2B2D42] font-bold">
                <ShieldAlert className="w-4 h-4 text-[#D62828]" />
                <span>Detail Pemeriksaan Supabase:</span>
              </div>

              {debugInfo.uid && (
                <div className="bg-white p-2.5 rounded-xl border border-gray-200 flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-[10px] text-gray-500 font-bold uppercase">UID Akun Anda:</p>
                    <p className="font-mono text-[11px] text-[#2B2D42] truncate select-all">{debugInfo.uid}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopyUid(debugInfo.uid)}
                    className="px-2.5 py-1 rounded-lg bg-[#FFF9F2] hover:bg-[#FFDEA9]/50 border border-[#FCBF49]/60 text-[10px] font-bold text-[#2B2D42] shrink-0 inline-flex items-center gap-1 cursor-pointer"
                  >
                    {copiedUid ? <Check className="w-3 h-3 text-green-600" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedUid ? 'Tersalin' : 'Salin UID'}</span>
                  </button>
                </div>
              )}

              {/* Specific guidance for PostgreSQL 42501 (Permission Denied) */}
              {debugInfo.dbErrorCode === '42501' && (
                <div className="bg-[#FFF3CD] p-3 rounded-xl border border-[#FFEEBA] text-[11px] text-[#856404] space-y-2">
                  <p className="font-bold">Solusi Izin Database (Error 42501):</p>
                  <p>
                    Jalankan file <code>supabase-security-update.sql</code> di Supabase SQL Editor.
                    Jangan gunakan perintah GRANT ALL atau policy yang mengizinkan semua user login.
                  </p>
                </div>
              )}

              {/* Specific guidance for UID not found */}
              {debugInfo.stage === 'not_found' && (
                <div className="bg-[#EBF5FB] p-2.5 rounded-xl border border-[#D4E6F1] text-[11px] text-[#1B4F72]">
                  <p className="font-bold mb-1">Cara Menambahkan ke admin_users:</p>
                  <p>
                    Buka Supabase Dashboard &rarr; <strong>Table Editor</strong> &rarr; <strong>admin_users</strong> &rarr; <strong>Insert Row</strong>:
                  </p>
                  <ul className="list-disc list-inside mt-1 space-y-0.5 font-mono text-[10px]">
                    <li>id = <span className="text-[#D62828] font-bold">{debugInfo.uid}</span></li>
                    <li>role = <span className="text-[#D62828] font-bold">admin</span></li>
                  </ul>
                </div>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="admin-email"
                className="block text-xs font-bold text-[#2B2D42] mb-1.5"
              >
                Email Admin
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#906F6B] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="admin-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@email.com"
                  required
                  className="w-full min-h-[46px] pl-10 pr-4 rounded-xl bg-[#FFF9F2] border border-[#FCBF49]/40 text-xs font-medium text-[#2B2D42] placeholder:text-[#906F6B]/60 focus:outline-none focus:ring-2 focus:ring-[#D62828] focus:bg-white transition-all"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="admin-password"
                className="block text-xs font-bold text-[#2B2D42] mb-1.5"
              >
                Kata Sandi
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#906F6B] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="admin-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full min-h-[46px] pl-10 pr-11 rounded-xl bg-[#FFF9F2] border border-[#FCBF49]/40 text-xs font-medium text-[#2B2D42] placeholder:text-[#906F6B]/60 focus:outline-none focus:ring-2 focus:ring-[#D62828] focus:bg-white transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#906F6B] hover:text-[#2B2D42] p-1 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4CC9F0] cursor-pointer"
                  aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-tactile-red w-full min-h-[48px] mt-2 rounded-full text-xs font-extrabold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed shadow-md"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Memverifikasi Akun...</span>
                </>
              ) : (
                <span>Masuk Dashboard</span>
              )}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-[#FCBF49]/20 text-center">
            <p className="text-[11px] text-[#5C403D]">
              Hanya akun terdaftar di Supabase dengan role admin yang dapat mengakses.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
