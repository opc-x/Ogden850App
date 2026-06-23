/** 陪练教练吉祥物 — 绿帽 + 金星，小尺寸也易辨认 */
export function CoachMascotMark({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      <ellipse cx="24" cy="21" rx="17" ry="4.5" fill="#1a5c38" />
      <path
        d="M9 21c0-9 30-9 30 0v3H9v-3z"
        fill="#2f7d4f"
      />
      <path
        d="M14 24c0-8 20-8 20 0v14c0 4-20 4-20 0V24z"
        fill="#fcd9b6"
      />
      <circle cx="19" cy="29" r="2.2" fill="#1e293b" />
      <circle cx="29" cy="29" r="2.2" fill="#1e293b" />
      <path
        d="M19 34.5c2.2 2.8 7.8 2.8 10 0"
        stroke="#1e293b"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx="35" cy="13" r="6" fill="#fbbf24" />
      <path
        d="M35 9.8l.9 2.1 2.3.2-1.7 1.5.5 2.2-2-1.2-2 1.2.5-2.2-1.7-1.5 2.3-.2.9-2.1z"
        fill="#fffef5"
      />
    </svg>
  );
}

/** 场景陪练教练头像 — 独立于 A/B 角色，负责暖心点评 */
export function CoachAvatar({ size = 'sm' }: { size?: 'xs' | 'sm' | 'md' }) {
  const dim =
    size === 'xs' ? 'w-6 h-6' : size === 'sm' ? 'w-8 h-8' : 'w-9 h-9';
  const mark =
    size === 'xs'
      ? 'w-[18px] h-[18px]'
      : size === 'sm'
        ? 'w-[26px] h-[26px]'
        : 'w-7 h-7';

  return (
    <div
      className={`shrink-0 ${dim} rounded-full flex items-center justify-center select-none bg-white border border-slate-100 ring-1 ring-[#2f7d4f]/20`}
      title="陪练教练"
      aria-label="陪练教练"
    >
      <CoachMascotMark className={mark} />
    </div>
  );
}
