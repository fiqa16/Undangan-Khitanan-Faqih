import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../utils/supabase';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isAdmin: boolean;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Check if a user is an authorized admin
  const verifyAdminStatus = async (currentUser: User | null): Promise<boolean> => {
    if (!currentUser || !currentUser.email) return false;

    // Check app metadata role
    if (currentUser.app_metadata?.role === 'admin') {
      return true;
    }

    if (!isSupabaseConfigured) {
      return true; // Local preview mode if Supabase not configured
    }

    try {
      // Check admin_users whitelist table in Supabase
      const { data, error } = await supabase
        .from('admin_users')
        .select('email, role')
        .eq('email', currentUser.email.toLowerCase().trim())
        .maybeSingle();

      if (!error && data) {
        return true;
      }

      // Check if admin_users table exists but has no rows yet (initial onboarding)
      const { count, error: countErr } = await supabase
        .from('admin_users')
        .select('*', { count: 'exact', head: true });

      if (!countErr && (count === null || count === 0)) {
        // First user logging in on fresh Supabase database
        return true;
      }

      // If admin_users has rows and user is not in it, deny
      return false;
    } catch {
      // If table query fails (e.g. table not created yet), default to allowing authenticated user
      return true;
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
        const authorized = await verifyAdminStatus(currentUser);
        setIsAdmin(authorized);
        if (!authorized) {
          await supabase.auth.signOut();
          setUser(null);
          setSession(null);
        }
      } else {
        setIsAdmin(false);
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
        const authorized = await verifyAdminStatus(currentUser);
        setIsAdmin(authorized);
      } else {
        setIsAdmin(false);
      }
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    if (!isSupabaseConfigured) {
      return {
        success: false,
        error:
          'Supabase belum dikonfigurasi. Harap isi VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY di file .env.local terlebih dahulu.',
      };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        let errorMsg = 'Email atau password yang Anda masukkan salah.';
        if (error.message.includes('Invalid login credentials')) {
          errorMsg = 'Email atau kata sandi tidak sesuai. Silakan periksa kembali.';
        } else if (error.message.includes('Email not confirmed')) {
          errorMsg = 'Email belum dikonfirmasi di Supabase Auth.';
        } else {
          errorMsg = error.message;
        }
        return { success: false, error: errorMsg };
      }

      if (!data.user) {
        return { success: false, error: 'User tidak ditemukan.' };
      }

      // Check authorization
      const authorized = await verifyAdminStatus(data.user);
      if (!authorized) {
        await supabase.auth.signOut();
        return {
          success: false,
          error: 'Akses Ditolak: Akun Anda tidak memiliki hak akses sebagai Administrator.',
        };
      }

      setUser(data.user);
      setSession(data.session);
      setIsAdmin(true);
      return { success: true };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Terjadi kesalahan saat masuk.';
      return { success: false, error: message };
    }
  };

  const signOut = async () => {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
    setUser(null);
    setSession(null);
    setIsAdmin(false);
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
