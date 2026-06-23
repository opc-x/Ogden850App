import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { AuthService, fallbackProfileFromUser } from '../services/auth.service';
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
  signInAsGuest: (options?: { forceNew?: boolean }) => Promise<GuestCredentials>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  updateProfile: (patch: { displayName?: string; avatarUrl?: string | null }) => Promise<void>;
  /** 等待首屏 session 恢复完成 */
  waitUntilReady: () => Promise<void>;
  /** 已有 session / 本机凭证则复用，否则新建访客 */
  ensureGuestSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const loadingRef = useRef(true);
  loadingRef.current = loading;

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

  const updateProfile = useCallback(
    async (patch: { displayName?: string; avatarUrl?: string | null }) => {
      if (!session?.user?.id) throw new Error('请先登录');
      const updated = await AuthService.updateProfile(session.user.id, patch);
      setProfile(updated);
      if (session.user) {
        setSession({
          ...session,
          user: {
            ...session.user,
            user_metadata: {
              ...session.user.user_metadata,
              display_name: updated.displayName,
              avatar_url: updated.avatarUrl,
            },
          },
        });
      }
    },
    [session],
  );

  useEffect(() => {
    let mounted = true;

    (async () => {
      let existing = await AuthService.getSession();
      if (!existing) {
        existing = await AuthService.tryRestoreGuestSession();
      }
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

  const signInAsGuest = useCallback(async (options?: { forceNew?: boolean }) => {
    const { user, creds } = await AuthService.signInAsGuest(options);
    const sess = (await AuthService.getSession()) ?? AuthService.sessionFromUser(user);
    setSession(sess);
    try {
      await loadProfile(user.id);
    } catch {
      setProfile(null);
    }
    return creds;
  }, [loadProfile]);

  const signOut = useCallback(async () => {
    await AuthService.signOut();
    setSession(null);
    setProfile(null);
  }, []);

  const waitUntilReady = useCallback((): Promise<void> => {
    return new Promise((resolve) => {
      const tick = () => {
        if (!loadingRef.current) resolve();
        else setTimeout(tick, 20);
      };
      tick();
    });
  }, []);

  const ensureGuestSession = useCallback(async () => {
    await waitUntilReady();
    const sess = (await AuthService.getSession()) ?? (await AuthService.tryRestoreGuestSession());
    if (sess?.user) {
      setSession(sess);
      try {
        await loadProfile(sess.user.id);
      } catch {
        setProfile(null);
      }
      return;
    }
    await signInAsGuest();
  }, [waitUntilReady, signInAsGuest, loadProfile]);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user: session?.user ?? null,
      profile:
        profile ?? (session?.user ? fallbackProfileFromUser(session.user) : null),
      loading,
      isAuthenticated: !!session?.user,
      signInWithGoogle,
      signUpWithEmail,
      signInWithEmail,
      signInAsGuest,
      signOut,
      refreshProfile,
      updateProfile,
      waitUntilReady,
      ensureGuestSession,
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
      updateProfile,
      waitUntilReady,
      ensureGuestSession,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
