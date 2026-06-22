import { User } from 'lucide-react';
import { defaultAvatarUrl } from '../../lib/defaultAvatar';
import type { UserProfile } from '../../types/auth';

const SIZE_CLASS = {
  sm: 'w-10 h-10 text-sm',
  md: 'w-16 h-16 text-2xl',
  lg: 'w-20 h-20 text-3xl',
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

  if (placeholder || !profile) {
    return (
      <div
        className={`${dim} rounded-full border-2 border-dashed border-slate-200 bg-slate-50 flex items-center justify-center text-slate-300 shrink-0 ${className}`}
      >
        <User className={size === 'lg' ? 'w-9 h-9' : size === 'md' ? 'w-8 h-8' : 'w-5 h-5'} strokeWidth={1.75} />
      </div>
    );
  }

  const src = profile.avatarUrl ?? defaultAvatarUrl(profile.id);

  return (
    <img
      src={src}
      alt=""
      className={`${dim} rounded-full object-cover border-2 border-white/30 shrink-0 bg-slate-100 ${className}`}
    />
  );
}
