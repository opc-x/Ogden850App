import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import type { AuthProvider, GuestCredentials, UserProfile } from '../types/auth';

const GUEST_CREDS_KEY = 'ogden850_guest_creds';

type ProfileRow = {
  id: string;
  email: string | null;
  display_name: string | null;
  avatar_url: string | null;
  is_guest: boolean;
  auth_provider: AuthProvider;
  created_at: string;
};

function rowToProfile(row: ProfileRow): UserProfile {
  return {
    id: row.id,
    email: row.email,
    displayName: row.display_name,
    avatarUrl: row.avatar_url,
    isGuest: row.is_guest,
    authProvider: row.auth_provider,
    createdAt: row.created_at,
  };
}

function randomGuestId(): string {
  return crypto.randomUUID().replace(/-/g, '').slice(0, 10);
}

function buildGuestCredentials(): GuestCredentials {
  const id = randomGuestId();
  return {
    email: `guest_${id}@guest.ogden850.local`,
    password: crypto.randomUUID().replace(/-/g, '') + 'Aa1!',
  };
}

export const AuthService = {
  onAuthStateChange(callback: (session: Session | null) => void) {
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      callback(session);
    });
    return data.subscription;
  },

  async getSession(): Promise<Session | null> {
    const { data } = await supabase.auth.getSession();
    return data.session;
  },

  async fetchProfile(userId: string): Promise<UserProfile | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, email, display_name, avatar_url, is_guest, auth_provider, created_at')
      .eq('id', userId)
      .maybeSingle();

    if (error) throw new Error(error.message);
    return data ? rowToProfile(data as ProfileRow) : null;
  },

  async signInWithGoogle(): Promise<void> {
    const redirectTo = `${window.location.origin}/`;
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
        queryParams: { access_type: 'offline', prompt: 'consent' },
      },
    });
    if (error) throw new Error(error.message);
  },

  async signUpWithEmail(email: string, password: string, displayName?: string): Promise<User> {
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: {
          auth_provider: 'email',
          display_name: displayName?.trim() || email.split('@')[0],
          is_guest: false,
        },
      },
    });
    if (error) throw new Error(error.message);
    if (!data.user) throw new Error('注册失败，请重试');

    if (!data.session) {
      const { error: signInErr } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (signInErr) throw new Error(signInErr.message);
    }

    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session?.user) throw new Error('登录未建立，请重试');
    return sessionData.session.user;
  },

  async signInWithEmail(email: string, password: string): Promise<User> {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    if (error) throw new Error(error.message);
    if (!data.user) throw new Error('账号或密码不正确');
    return data.user;
  },

  loadStoredGuestCreds(): GuestCredentials | null {
    try {
      const raw = localStorage.getItem(GUEST_CREDS_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as GuestCredentials;
      if (parsed?.email && parsed?.password) return parsed;
    } catch {
      /* ignore */
    }
    return null;
  },

  storeGuestCreds(creds: GuestCredentials) {
    localStorage.setItem(GUEST_CREDS_KEY, JSON.stringify(creds));
  },

  async signInAsGuest(): Promise<{ user: User; creds: GuestCredentials; reused: boolean }> {
    const stored = this.loadStoredGuestCreds();
    if (stored) {
      const { data, error } = await supabase.auth.signInWithPassword(stored);
      if (!error && data.user) {
        return { user: data.user, creds: stored, reused: true };
      }
    }

    const creds = buildGuestCredentials();
    const displayName = `访客_${creds.email.split('@')[0].replace('guest_', '')}`;

    const { data, error } = await supabase.auth.signUp({
      email: creds.email,
      password: creds.password,
      options: {
        data: {
          is_guest: true,
          auth_provider: 'guest',
          display_name: displayName,
        },
      },
    });
    if (error) throw new Error(error.message);

    if (!data.session) {
      const { error: signInErr } = await supabase.auth.signInWithPassword(creds);
      if (signInErr) throw new Error(signInErr.message);
    }

    this.storeGuestCreds(creds);
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session?.user) throw new Error('访客登录失败');
    return { user: sessionData.session.user, creds, reused: false };
  },

  async signOut(): Promise<void> {
    const { error } = await supabase.auth.signOut();
    if (error) throw new Error(error.message);
  },
};
