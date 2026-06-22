import { useAuth } from '../../contexts/AuthContext';
import { UserAvatar } from './UserAvatar';

interface HeaderUserButtonProps {
  onClick: () => void;
}

export function HeaderUserButton({ onClick }: HeaderUserButtonProps) {
  const { isAuthenticated, profile } = useAuth();
  const title = isAuthenticated ? '我的账号' : '登录 / 注册';

  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      aria-label={title}
      className="relative shrink-0 active:scale-95 transition-transform hover:opacity-90"
    >
      <UserAvatar profile={isAuthenticated ? profile : null} placeholder={!isAuthenticated} />
      <span
        className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${
          isAuthenticated ? 'bg-emerald-500' : 'bg-slate-300'
        }`}
      />
    </button>
  );
}
