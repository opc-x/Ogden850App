export type AuthProvider = 'email' | 'google' | 'guest';

export interface UserProfile {
  id: string;
  email: string | null;
  displayName: string | null;
  avatarUrl: string | null;
  /** 数据层标记；个人页展示「访客」徽章 */
  isGuest: boolean;
  authProvider: AuthProvider;
  createdAt: string;
}

export interface GuestCredentials {
  email: string;
  password: string;
}
