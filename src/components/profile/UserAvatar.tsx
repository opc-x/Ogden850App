import { DEFAULT_AVATAR_URL, isLegacyDefaultAvatar } from '../../lib/defaultAvatar';
import type { UserProfile } from '../../types/auth';

const SIZE_CLASS = {
  sm: 'w-10 h-10',
  md: 'w-16 h-16',
  lg: 'w-20 h-20',
} as const;

interface UserAvatarProps {
  profile?: Pick<UserProfile, 'id' | 'displayName' | 'email' | 'avatarUrl' | 'isGuest'> | null;
  size?: keyof typeof SIZE_CLASS;
  placeholder?: boolean;
  className?: string;
}

export function UserAvatar({
  profile,
  size = 'sm',
  placeholder = false,
  className = '',
}: UserAvatarProps) {
  const dim = SIZE_CLASS[size];
  const shell = `rounded-full overflow-hidden shrink-0 bg-white border border-slate-100 shadow-sm object-cover ${dim} ${className}`;
  const src =
    placeholder || !profile || isLegacyDefaultAvatar(profile.avatarUrl)
      ? DEFAULT_AVATAR_URL
      : profile.avatarUrl!;

  return <img src={src} alt="" className={shell} />;
}
