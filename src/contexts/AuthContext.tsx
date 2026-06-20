import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { AuthService } from '../services/auth.service';
import type { GuestCredentials, UserProfile } from '../types/auth';

interface AuthContextValue {
  session: Session | null;
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  isAuthenticated: boolean;
  signInWithGoogle: () => Promise<void>;
  signUpWithEmail: (email: string, password: string, displayName?: string) => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signInAsGuest: () => Promise<GuestCredentials>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async (userId: string) => {
    try {
      const p = await AuthService.fetchProfile(userId);
      setProfile(p);
    } catch (e) {
      console.warn('Profile fetch failed:', e);
      setProfile(null);
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    if (session?.user?.id) await loadProfile(session.user.id);
  }, [session?.user?.id, loadProfile]);

  useEffect(() => {
    let mounted = true;

    (async () => {
      const existing = await AuthService.getSession();
      if (!mounted) return;
      setSession(existing);
      if (existing?.user?.id) await loadProfile(existing.user.id);
      setLoading(false);
    })();

    const sub = AuthService.onAuthStateChange((next) => {
      setSession(next);
      if (next?.user?.id) {
        void loadProfile(next.user.id);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => {
      mounted = false;
      sub.unsubscribe();
    };
  }, [loadProfile]);

  const signInWithGoogle = useCallback(async () => {
    await AuthService.signInWithGoogle();
  }, []);

  const signUpWithEmail = useCallback(
    async (email: string, password: string, displayName?: string) => {
      const user = await AuthService.signUpWithEmail(email, password, displayName);
      await loadProfile(user.id);
    },
    [loadProfile],
  );

  const signInWithEmail = useCallback(
    async (email: string, password: string) => {
      const user = await AuthService.signInWithEmail(email, password);
      await loadProfile(user.id);
    },
    [loadProfile],
  );

  const signInAsGuest = useCallback(async () => {
    const { user, creds } = await AuthService.signInAsGuest();
    await loadProfile(user.id);
    return creds;
  }, [loadProfile]);

  const signOut = useCallback(async () => {
    await AuthService.signOut();
    setProfile(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user: session?.user ?? null,
      profile,
      loading,
      isAuthenticated: !!session?.user,
      signInWithGoogle,
      signUpWithEmail,
      signInWithEmail,
      signInAsGuest,
      signOut,
      refreshProfile,
    }),
    [
      session,
      profile,
      loading,
      signInWithGoogle,
      signUpWithEmail,
      signInWithEmail,
      signInAsGuest,
      signOut,
      refreshProfile,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
