export type AuthProvider = 'email' | 'google' | 'guest';

export interface UserProfile {
  id: string;
  email: string | null;
  displayName: string | null;
  avatarUrl: string | null;
  isGuest: boolean;
  authProvider: AuthProvider;
  createdAt: string;
}

export interface GuestCredentials {
  email: string;
  password: string;
}
