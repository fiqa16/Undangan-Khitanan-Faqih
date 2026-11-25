import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../utils/supabase';

export interface AdminDebugInfo {
  uid: string;
  email?: string;
  stage: 'auth' | 'session' | 'uid_lookup' | 'table_error' | 'not_found';
  details?: string;
  dbErrorCode?: string;
}

export interface AdminVerifyResult {
  authorized: boolean;
  error?: string;
  debugInfo?: AdminDebugInfo;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isAdmin: boolean;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string; debugInfo?: AdminDebugInfo }>;
  signOut: () => Promise<void>;
  lastVerifyResult: AdminVerifyResult | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [lastVerifyResult, setLastVerifyResult] = useState<AdminVerifyResult | null>(null);

  const verifyAdminStatus = async (currentUser: User | null): Promise<AdminVerifyResult> => {
    if (!currentUser) {
      return {
        authorized: false,
        error: 'Sesi pengguna tidak ditemukan.',
        debugInfo: { uid: '', stage: 'session', details: 'User object is null' },
      };
    }

    const uid = currentUser.id;
    const email = currentUser.email || '';

    if (!isSupabaseConfigured) {
      return {
        authorized: false,
        error: 'Supabase belum dikonfigurasi. Admin harus diverifikasi melalui tabel admin_users.',
        debugInfo: {
          uid,
          email,
          stage: 'table_error',
          details: 'Supabase is not configured.',
        },
      };
    }

    try {
      const { data, error } = await supabase
        .from('admin_users')
        .select('id, role')
        .eq('id', uid)
        .eq('role', 'admin')
        .maybeSingle();

      if (error) {
        return {
          authorized: false,
          error: `Gagal memverifikasi admin di tabel admin_users: ${error.message}`,
          debugInfo: {
            uid,
            email,
            stage: 'table_error',
            dbErrorCode: error.code,
            details: error.message,
          },
        };
      }

      if (data) {
        return {
          authorized: true,
          debugInfo: {
            uid,
            email,
            stage: 'uid_lookup',
            details: 'UID akun cocok dengan baris admin ber-role admin.',
          },
        };
      }

      return {
        authorized: false,
        error: 'Akses ditolak: UID akun ini tidak terdaftar sebagai admin.',
        debugInfo: {
          uid,
          email,
          stage: 'not_found',
          details: 'No matching admin_users row for this auth UID.',
        },
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown database error';
      return {
        authorized: false,
        error: `Terjadi kendala saat memeriksa tabel admin_users: ${msg}`,
        debugInfo: { uid, email, stage: 'table_error', details: msg },
      };
    }
  };

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setIsLoading(false);
      return;
    }

    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session: currentSession } }) => {
      setSession(currentSession);
      const currentUser = currentSession?.user ?? null;
      setUser(currentUser);

      if (currentUser) {
        const verifyRes = await verifyAdminStatus(currentUser);
        setLastVerifyResult(verifyRes);
        setIsAdmin(verifyRes.authorized);
      } else {
        setIsAdmin(false);
        setLastVerifyResult(null);
      }
      setIsLoading(false);
    });

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, currentSession) => {
      setSession(currentSession);
      const currentUser = currentSession?.user ?? null;
      setUser(currentUser);

      if (currentUser) {
        const verifyRes = await verifyAdminStatus(currentUser);
        setLastVerifyResult(verifyRes);
        setIsAdmin(verifyRes.authorized);
      } else {
        setIsAdmin(false);
        setLastVerifyResult(null);
      }
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: string; debugInfo?: AdminDebugInfo }> => {
    if (!isSupabaseConfigured) {
      return {
        success: false,
        error:
          'Supabase belum dikonfigurasi. Harap periksa VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY di file .env.local.',
      };
    }

    try {
      // 1. Supabase Authentication (signInWithPassword)
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (authError) {
        let errorMsg = 'Email atau kata sandi tidak sesuai. Silakan periksa kembali.';
        if (authError.message.includes('Invalid login credentials')) {
          errorMsg = 'Email atau kata sandi yang Anda masukkan salah. Periksa kembali akun di Authentication Supabase.';
        } else if (authError.message.includes('Email not confirmed')) {
          errorMsg = 'Email ini belum dikonfirmasi di Supabase Authentication (pastikan opsi "Auto Confirm" diaktifkan pada user).';
        } else {
          errorMsg = `Gagal login ke Supabase Auth: ${authError.message}`;
        }
        return {
          success: false,
          error: errorMsg,
          debugInfo: {
            uid: '',
            email: email.trim(),
            stage: 'auth',
            details: authError.message,
          },
        };
      }

      if (!data.user) {
        return {
          success: false,
          error: 'Data pengguna tidak ditemukan setelah autentikasi.',
          debugInfo: { uid: '', stage: 'session', details: 'data.user is null' },
        };
      }

      // 2. Verify admin status & permissions
      const verifyRes = await verifyAdminStatus(data.user);
      setLastVerifyResult(verifyRes);

      if (!verifyRes.authorized) {
        // Sign out to prevent unauthorized session
        await supabase.auth.signOut();
        setUser(null);
        setSession(null);
        setIsAdmin(false);

        return {
          success: false,
          error: verifyRes.error || 'Akses ditolak: Akun Anda tidak memiliki izin sebagai Administrator.',
          debugInfo: verifyRes.debugInfo,
        };
      }

      // 3. Authorized successfully
      setUser(data.user);
      setSession(data.session);
      setIsAdmin(true);

      return {
        success: true,
        debugInfo: verifyRes.debugInfo,
      };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Terjadi kesalahan sistem saat masuk.';
      return {
        success: false,
        error: message,
        debugInfo: {
          uid: '',
          stage: 'auth',
          details: message,
        },
      };
    }
  };

  const signOut = async () => {
    if (isSupabaseConfigured) {
      try {
        await supabase.auth.signOut();
      } catch {
        // Ignore signout error
      }
    }
    setUser(null);
    setSession(null);
    setIsAdmin(false);
    setLastVerifyResult(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isAdmin,
        isLoading,
        signIn,
        signOut,
        lastVerifyResult,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth harus digunakan di dalam AuthProvider');
  }
  return context;
};
