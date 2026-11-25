import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../utils/supabase';

export interface AdminDebugInfo {
  uid: string;
  email?: string;
  stage: 'auth' | 'session' | 'metadata' | 'uid_lookup' | 'user_id_lookup' | 'email_lookup' | 'table_error' | 'not_found' | 'role_mismatch';
  details?: string;
  roleFound?: string;
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

  /**
   * Thorough verification of admin status checking:
   * 1. app_metadata and user_metadata role === 'admin'
   * 2. admin_users table match by UID (id = currentUser.id)
   * 3. admin_users table match by user_id (user_id = currentUser.id)
   * 4. admin_users table match by email (email = currentUser.email)
   * With explicit database error diagnostics (e.g. 42501 permission denied, RLS issues)
   */
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

    // 1. Check metadata (app_metadata or user_metadata)
    const appRole = (currentUser.app_metadata?.role || '').toString().toLowerCase().trim();
    const userRole = (currentUser.user_metadata?.role || '').toString().toLowerCase().trim();

    if (appRole === 'admin' || userRole === 'admin') {
      return {
        authorized: true,
        debugInfo: {
          uid,
          email,
          stage: 'metadata',
          roleFound: appRole || userRole,
          details: 'Role admin terverifikasi dari metadata akun.',
        },
      };
    }

    if (!isSupabaseConfigured) {
      return {
        authorized: true,
        debugInfo: {
          uid,
          email,
          stage: 'metadata',
          details: 'Mode pratinjau lokal (Supabase belum terkonfigurasi).',
        },
      };
    }

    // 2. Primary Check: Query public.admin_users by UID (id = currentUser.id)
    try {
      const { data: uidData, error: uidError } = await supabase
        .from('admin_users')
        .select('*')
        .eq('id', uid)
        .maybeSingle();

      if (uidError) {
        console.warn('Query admin_users by id error:', uidError);
        // Catch PostgreSQL 42501 (permission denied / RLS blocking)
        if (uidError.code === '42501') {
          return {
            authorized: false,
            error: `Autentikasi akun berhasil (UID: ${uid}), namun database menolak akses ke tabel "public.admin_users" (PostgreSQL Error 42501: permission denied). Peran "authenticated" memerlukan hak akses SELECT pada tabel admin_users.`,
            debugInfo: {
              uid,
              email,
              stage: 'table_error',
              dbErrorCode: '42501',
              details: uidError.message,
            },
          };
        }
      }

      if (uidData) {
        const role = (uidData.role || '').toString().toLowerCase().trim();
        // Check if role is admin or if presence in admin_users implies admin
        if (role === 'admin' || !uidData.role) {
          return {
            authorized: true,
            debugInfo: {
              uid,
              email,
              stage: 'uid_lookup',
              roleFound: uidData.role || 'admin',
              details: `UID ${uid} terverifikasi cocok di tabel admin_users dengan role "${uidData.role || 'admin'}".`,
            },
          };
        } else {
          return {
            authorized: false,
            error: `UID Anda (${uid}) terdaftar di tabel admin_users, namun memiliki role "${uidData.role}" (dibutuhkan role "admin").`,
            debugInfo: {
              uid,
              email,
              stage: 'role_mismatch',
              roleFound: uidData.role,
              details: `Role yang ditemukan adalah "${uidData.role}", bukan "admin".`,
            },
          };
        }
      }

      // 3. Secondary Check: Column user_id = currentUser.id (in case column is named user_id)
      try {
        const { data: userIdData, error: userIdError } = await supabase
          .from('admin_users')
          .select('*')
          .eq('user_id', uid)
          .maybeSingle();

        if (!userIdError && userIdData) {
          const role = (userIdData.role || '').toString().toLowerCase().trim();
          if (role === 'admin' || !userIdData.role) {
            return {
              authorized: true,
              debugInfo: {
                uid,
                email,
                stage: 'user_id_lookup',
                roleFound: userIdData.role || 'admin',
                details: `UID ${uid} terverifikasi melalui kolom user_id.`,
              },
            };
          } else {
            return {
              authorized: false,
              error: `UID ${uid} ditemukan di kolom user_id, namun memiliki role "${userIdData.role}".`,
              debugInfo: {
                uid,
                email,
                stage: 'role_mismatch',
                roleFound: userIdData.role,
              },
            };
          }
        }
      } catch {
        // Ignore if user_id column doesn't exist
      }

      // 4. Tertiary Check: Match by email (case-insensitive)
      if (email) {
        try {
          const { data: emailData, error: emailError } = await supabase
            .from('admin_users')
            .select('*')
            .ilike('email', email.trim())
            .maybeSingle();

          if (!emailError && emailData) {
            const role = (emailData.role || '').toString().toLowerCase().trim();
            if (role === 'admin' || !emailData.role) {
              return {
                authorized: true,
                debugInfo: {
                  uid,
                  email,
                  stage: 'email_lookup',
                  roleFound: emailData.role || 'admin',
                  details: `Email ${email} terverifikasi cocok di tabel admin_users.`,
                },
              };
            } else {
              return {
                authorized: false,
                error: `Email ${email} ditemukan di tabel admin_users, namun role adalah "${emailData.role}".`,
                debugInfo: {
                  uid,
                  email,
                  stage: 'role_mismatch',
                  roleFound: emailData.role,
                },
              };
            }
          }
        } catch {
          // Ignore if email column doesn't exist
        }
      }

      // If not found in admin_users
      return {
        authorized: false,
        error: `Akses ditolak: Akun ${email} (UID: ${uid}) tidak ditemukan di tabel public.admin_users. Pastikan kolom id pada tabel admin_users berisi UID: ${uid} dan kolom role berisi "admin".`,
        debugInfo: {
          uid,
          email,
          stage: 'not_found',
          details: `UID ${uid} tidak ditemukan pada kolom id maupun user_id di tabel admin_users.`,
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
