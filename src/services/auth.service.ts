import type { Session, User } from '@supabase/supabase-js';
import { isLegacyDefaultAvatar } from '../lib/defaultAvatar';
import { supabase } from '../lib/supabase';
import { supabaseProjectRef } from '../lib/supabaseConfig';
import type { AuthProvider, GuestCredentials, UserProfile } from '../types/auth';

const GUEST_CREDS_KEY = 'ogden850_guest_creds';
const DEVICE_ID_KEY = 'ogden850_device_id';
const MOCK_GUEST_USER_ID_KEY = 'ogden850_mock_guest_user_id';
/** E2E mock session — 绝不写入 sb-*-auth-token，避免污染 Supabase 客户端 JWT */
const MOCK_SESSION_KEY = 'ogden850_mock_session';
const PROFILE_OVERRIDES_KEY = 'ogden850_profile_overrides';

type ProfilePatch = { displayName?: string; avatarUrl?: string | null };
type ProfileOverridesMap = Record<string, ProfilePatch>;

type StoredGuestCreds = GuestCredentials & { deviceId?: string };

/** 本机稳定设备标识；首次生成后永不清除，用于绑定访客账号 */
export function getOrCreateDeviceId(): string {
  try {
    const existing = localStorage.getItem(DEVICE_ID_KEY);
    if (existing) return existing;
    const id = crypto.randomUUID();
    localStorage.setItem(DEVICE_ID_KEY, id);
    return id;
  } catch {
    return crypto.randomUUID();
  }
}

function isMockGuestAuth(): boolean {
  if (import.meta.env.VITE_MOCK_GUEST_AUTH === 'true') return true;
  try {
    return localStorage.getItem('ogden850_mock_guest_auth') === 'true';
  } catch {
    return false;
  }
}

function mapAuthErrorMessage(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes('email rate limit exceeded') || lower.includes('over_email_send_rate_limit')) {
    return '登录服务繁忙（请求过于频繁），请稍后再试，或使用 Google 登录';
  }
  return message;
}

function authStorageKey(): string {
  const ref = supabaseProjectRef(import.meta.env.VITE_SUPABASE_URL ?? '');
  return ref ? `sb-${ref}-auth-token` : 'sb-mock-auth-token';
}

function buildMockUser(userId: string, email: string): User {
  const guestTag = email.split('+')[1]?.split('@')[0] ?? userId.slice(0, 6);
  return {
    id: userId,
    email,
    aud: 'authenticated',
    role: 'authenticated',
    app_metadata: {},
    user_metadata: {
      is_guest: true,
      auth_provider: 'guest',
      display_name: `学习者 ${guestTag.slice(0, 6)}`,
    },
    created_at: new Date().toISOString(),
  } as User;
}

function isInvalidJwt(token: string): boolean {
  if (token.startsWith('mock-access-') || token.startsWith('mock-refresh-')) return true;
  return token.split('.').length !== 3;
}

/** 清掉 E2E mock 或损坏 token，让词库等请求回退到 anon key */
async function purgeCorruptSupabaseAuthToken(): Promise<void> {
  try {
    const raw = localStorage.getItem(authStorageKey());
    if (!raw) return;
    const parsed = JSON.parse(raw) as { access_token?: string };
    const token = parsed?.access_token ?? '';
    if (!token || !isInvalidJwt(token)) return;
    localStorage.removeItem(authStorageKey());
    await supabase.auth.signOut({ scope: 'local' });
  } catch {
    localStorage.removeItem(authStorageKey());
  }
}

function loadMockSession(): Session | null {
  try {
    const raw = localStorage.getItem(MOCK_SESSION_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw) as Session;
    if (!session?.user?.id) return null;
    return session;
  } catch {
    return null;
  }
}

function persistMockSession(user: User): Session {
  const expiresAt = Math.floor(Date.now() / 1000) + 60 * 60;
  const session = {
    expires_at: expiresAt,
    expires_in: 60 * 60,
    access_token: `mock-access-${user.id}`,
    refresh_token: `mock-refresh-${user.id}`,
    token_type: 'bearer',
    user,
  } as Session;
  localStorage.setItem(MOCK_SESSION_KEY, JSON.stringify(session));
  // 历史版本误写过 sb-*-auth-token，会炸词库 JWT 校验
  localStorage.removeItem(authStorageKey());
  void supabase.auth.signOut({ scope: 'local' });
  return session;
}

function clearMockAuthToken(): void {
  localStorage.removeItem(MOCK_SESSION_KEY);
  localStorage.removeItem(authStorageKey());
}

function clearMockGuestIdentity(): void {
  clearMockAuthToken();
  localStorage.removeItem(MOCK_GUEST_USER_ID_KEY);
}

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
  return mergeProfileOverrides({
    id: row.id,
    email: row.email,
    displayName: row.display_name,
    avatarUrl: row.avatar_url,
    isGuest: row.is_guest,
    authProvider: row.auth_provider,
    createdAt: row.created_at,
  });
}

function loadProfileOverrides(): ProfileOverridesMap {
  try {
    const raw = localStorage.getItem(PROFILE_OVERRIDES_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as ProfileOverridesMap;
  } catch {
    return {};
  }
}

function saveProfileOverrides(map: ProfileOverridesMap): void {
  localStorage.setItem(PROFILE_OVERRIDES_KEY, JSON.stringify(map));
}

export function mergeProfileOverrides(profile: UserProfile): UserProfile {
  const patch = loadProfileOverrides()[profile.id];
  if (!patch) return profile;
  return {
    ...profile,
    displayName: patch.displayName ?? profile.displayName,
    avatarUrl: patch.avatarUrl !== undefined ? patch.avatarUrl : profile.avatarUrl,
  };
}

function isGuestEmail(email: string | null | undefined): boolean {
  return Boolean(email && /^guest\+/i.test(email));
}

export function fallbackProfileFromUser(user: User): UserProfile {
  const meta = (user.user_metadata ?? {}) as Record<string, unknown>;
  const email = user.email ?? null;
  const isGuest = Boolean(meta.is_guest) || isGuestEmail(email);
  return mergeProfileOverrides({
    id: user.id,
    email,
    displayName:
      (typeof meta.display_name === 'string' && meta.display_name) ||
      email?.split('@')[0] ||
      '学习者',
    avatarUrl:
      (typeof meta.avatar_url === 'string' && !isLegacyDefaultAvatar(meta.avatar_url) && meta.avatar_url) ||
      null,
    isGuest,
    authProvider:
      (meta.auth_provider as AuthProvider) ??
      (isGuest ? 'guest' : 'email'),
    createdAt: user.created_at ?? new Date().toISOString(),
  });
}

function randomGuestId(): string {
  return crypto.randomUUID().replace(/-/g, '').slice(0, 10);
}

function buildGuestCredentials(): GuestCredentials {
  const id = randomGuestId();
  return {
    email: `guest+${id}@example.com`,
    password: crypto.randomUUID().replace(/-/g, '') + 'Aa1!',
  };
}

/** 启动时清掉 sb-* 里残留的 mock/坏 JWT，避免首屏词库请求就炸 */
export async function repairSupabaseAuthStorage(): Promise<void> {
  await purgeCorruptSupabaseAuthToken();
}

export const AuthService = {
  sessionFromUser(user: User): Session {
    return persistMockSession(user);
  },

  onAuthStateChange(callback: (session: Session | null) => void) {
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      callback(session);
    });
    return data.subscription;
  },

  async getSession(): Promise<Session | null> {
    await purgeCorruptSupabaseAuthToken();
    if (isMockGuestAuth()) return loadMockSession();
    const { data } = await supabase.auth.getSession();
    return data.session;
  },

  async fetchProfile(userId: string): Promise<UserProfile | null> {
    if (isMockGuestAuth()) {
      const session = loadMockSession();
      if (session?.user?.id === userId) {
        return fallbackProfileFromUser(session.user);
      }
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('id, email, display_name, avatar_url, is_guest, auth_provider, created_at')
      .eq('id', userId)
      .maybeSingle();

    if (error) throw new Error(mapAuthErrorMessage(error.message));
    return data ? rowToProfile(data as ProfileRow) : null;
  },

  async updateProfile(
    userId: string,
    patch: ProfilePatch,
  ): Promise<UserProfile> {
    const base = await this.fetchProfile(userId);
    if (!base) throw new Error('无法读取用户资料');

    const next: UserProfile = {
      ...base,
      displayName: patch.displayName ?? base.displayName,
      avatarUrl: patch.avatarUrl !== undefined ? patch.avatarUrl : base.avatarUrl,
    };

    if (isMockGuestAuth()) {
      const map = loadProfileOverrides();
      map[userId] = { ...map[userId], ...patch };
      saveProfileOverrides(map);

      const session = loadMockSession();
      if (session?.user?.id === userId) {
        const user = {
          ...session.user,
          user_metadata: {
            ...session.user.user_metadata,
            display_name: next.displayName,
            avatar_url: next.avatarUrl,
          },
        } as User;
        persistMockSession(user);
      }
      return mergeProfileOverrides(next);
    }

    const rowPatch: Record<string, string | null> = {};
    if (patch.displayName !== undefined) rowPatch.display_name = patch.displayName;
    if (patch.avatarUrl !== undefined) rowPatch.avatar_url = patch.avatarUrl;

    const { error } = await supabase.from('profiles').update(rowPatch).eq('id', userId);
    if (error) throw new Error(mapAuthErrorMessage(error.message));

    const metaPatch: Record<string, string | null> = {};
    if (patch.displayName !== undefined) metaPatch.display_name = patch.displayName;
    if (patch.avatarUrl !== undefined) metaPatch.avatar_url = patch.avatarUrl;
    if (Object.keys(metaPatch).length > 0) {
      const { error: metaErr } = await supabase.auth.updateUser({ data: metaPatch });
      if (metaErr) throw new Error(mapAuthErrorMessage(metaErr.message));
    }

    const map = loadProfileOverrides();
    delete map[userId];
    saveProfileOverrides(map);

    return (await this.fetchProfile(userId)) ?? mergeProfileOverrides(next);
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
    if (error) throw new Error(mapAuthErrorMessage(error.message));
  },

  async signUpWithEmail(email: string, password: string, displayName?: string): Promise<User> {
    const trimmedEmail = email.trim();
    const { data, error } = await supabase.auth.signUp({
      email: trimmedEmail,
      password,
      options: {
        data: {
          auth_provider: 'email',
          display_name: displayName?.trim() || trimmedEmail.split('@')[0],
          avatar_url: null,
          is_guest: false,
        },
      },
    });
    if (error) throw new Error(mapAuthErrorMessage(error.message));
    if (!data.user) throw new Error('注册失败，请重试');

    if (!data.session) {
      const { error: signInErr } = await supabase.auth.signInWithPassword({
        email: trimmedEmail,
        password,
      });
      if (signInErr) throw new Error(mapAuthErrorMessage(signInErr.message));
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
    if (error) throw new Error(mapAuthErrorMessage(error.message));
    if (!data.user) throw new Error('账号或密码不正确');
    return data.user;
  },

  loadStoredGuestCreds(): GuestCredentials | null {
    try {
      const raw = localStorage.getItem(GUEST_CREDS_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as StoredGuestCreds;
      if (!parsed?.email || !parsed?.password) return null;
      const deviceId = getOrCreateDeviceId();
      if (parsed.deviceId && parsed.deviceId !== deviceId) return null;
      if (!parsed.deviceId) {
        this.storeGuestCreds({ email: parsed.email, password: parsed.password });
      }
      return { email: parsed.email, password: parsed.password };
    } catch {
      /* ignore */
    }
    return null;
  },

  storeGuestCreds(creds: GuestCredentials) {
    const payload: StoredGuestCreds = { ...creds, deviceId: getOrCreateDeviceId() };
    localStorage.setItem(GUEST_CREDS_KEY, JSON.stringify(payload));
  },

  clearGuestCreds() {
    localStorage.removeItem(GUEST_CREDS_KEY);
  },

  /** Session 过期时，用本机保存的访客凭证静默恢复同一账号 */
  async tryRestoreGuestSession(): Promise<Session | null> {
    if (isMockGuestAuth()) {
      const storedId = localStorage.getItem(MOCK_GUEST_USER_ID_KEY);
      const storedCreds = this.loadStoredGuestCreds();
      if (storedId && storedCreds) {
        const user = buildMockUser(storedId, storedCreds.email);
        return persistMockSession(user);
      }
      return null;
    }

    const existing = await this.getSession();
    if (existing) return existing;

    const stored = this.loadStoredGuestCreds();
    if (!stored) return null;

    const { data, error } = await supabase.auth.signInWithPassword(stored);
    if (error || !data.session) return null;
    return data.session;
  },

  async signInAsGuest(options?: { forceNew?: boolean }): Promise<{ user: User; creds: GuestCredentials; reused: boolean }> {
    if (options?.forceNew) {
      this.clearGuestCreds();
      if (isMockGuestAuth()) clearMockGuestIdentity();
    } else {
      const active = await this.getSession();
      if (active?.user) {
        const creds = this.loadStoredGuestCreds();
        return {
          user: active.user,
          creds: creds ?? { email: active.user.email ?? '', password: '' },
          reused: true,
        };
      }
    }

    if (isMockGuestAuth()) {
      const storedId = localStorage.getItem(MOCK_GUEST_USER_ID_KEY);
      const storedCreds = this.loadStoredGuestCreds();
      if (storedId && storedCreds && !options?.forceNew) {
        const user = buildMockUser(storedId, storedCreds.email);
        persistMockSession(user);
        return { user, creds: storedCreds, reused: true };
      }

      const userId = crypto.randomUUID();
      const creds = buildGuestCredentials();
      this.storeGuestCreds(creds);
      localStorage.setItem(MOCK_GUEST_USER_ID_KEY, userId);
      const user = buildMockUser(userId, creds.email);
      persistMockSession(user);
      return { user, creds, reused: false };
    }

    const stored = this.loadStoredGuestCreds();
    if (stored && !options?.forceNew) {
      const { data, error } = await supabase.auth.signInWithPassword(stored);
      if (error) throw new Error(`恢复本设备账号失败：${mapAuthErrorMessage(error.message)}`);
      if (!data.user) throw new Error('恢复本设备账号失败');
      return { user: data.user, creds: stored, reused: true };
    }

    if (stored && options?.forceNew) {
      // forceNew 已清凭证，继续走新建
    }

    const creds = buildGuestCredentials();
    const guestTag = creds.email.split('+')[1]?.split('@')[0] ?? randomGuestId();
    const displayName = `学习者 ${guestTag.slice(0, 6)}`;

    const { data, error } = await supabase.auth.signUp({
      email: creds.email,
      password: creds.password,
      options: {
        data: {
          is_guest: true,
          auth_provider: 'guest',
          display_name: displayName,
          avatar_url: null,
        },
      },
    });
    if (error) throw new Error(mapAuthErrorMessage(error.message));

    if (!data.session) {
      const { error: signInErr } = await supabase.auth.signInWithPassword(creds);
      if (signInErr) throw new Error(mapAuthErrorMessage(signInErr.message));
    }

    this.storeGuestCreds(creds);
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session?.user) throw new Error('访客登录失败');
    return { user: sessionData.session.user, creds, reused: false };
  },

  async signOut(): Promise<void> {
    // 仅清 Supabase session；保留 deviceId + guest creds，下次「开始体验」复用同账号
    if (isMockGuestAuth()) {
      clearMockAuthToken();
      await supabase.auth.signOut({ scope: 'local' });
      return;
    }
    const { error } = await supabase.auth.signOut();
    if (error) throw new Error(mapAuthErrorMessage(error.message));
  },
};
