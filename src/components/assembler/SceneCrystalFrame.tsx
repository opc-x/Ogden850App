import type { ReactNode } from 'react';

const ROUND_INNER = {
  xl: { active: 'rounded-[10px]', inactive: 'rounded-[11px]' },
  '2xl': { active: 'rounded-[14px]', inactive: 'rounded-[15px]' },
} as const;

/** 场景插画水晶描边 — 与 AI 陪练场景条一致 */
export function SceneCrystalFrame({
  active = false,
  rounded = 'xl',
  shadow = 'default',
  className = '',
  children,
}: {
  active?: boolean;
  rounded?: 'xl' | '2xl';
  /** carousel = 左侧轻阴影，避免向下晕染干扰标题 */
  shadow?: 'default' | 'carousel';
  className?: string;
  children: ReactNode;
}) {
  const outerRounded = rounded === '2xl' ? 'rounded-2xl' : 'rounded-xl';
  const innerRounded = active ? ROUND_INNER[rounded].active : ROUND_INNER[rounded].inactive;
  const activeShadow =
    shadow === 'carousel'
      ? 'shadow-[0_0_0_1px_rgba(255,255,255,0.55)_inset,-8px_0_16px_rgba(47,125,79,0.07)]'
      : 'shadow-[0_0_0_1px_rgba(255,255,255,0.55)_inset,0_4px_20px_rgba(47,125,79,0.22)]';

  return (
    <div
      className={`relative transition-all duration-300 ${outerRounded} ${
        active
          ? `bg-gradient-to-br from-[#2f7d4f]/50 via-white/95 to-cyan-100/70 p-[2px] ${activeShadow}`
          : 'ring-1 ring-slate-100/90'
      } ${className}`}
    >
      <div className={`relative overflow-hidden bg-slate-50 ${innerRounded}`}>
        {children}
        {active && (
          <>
            <div
              className="pointer-events-none absolute inset-x-0 top-0 h-3 bg-gradient-to-b from-white/50 to-transparent"
              aria-hidden
            />
            <div
              className={`pointer-events-none absolute inset-0 ${innerRounded} ring-1 ring-inset ring-white/60`}
              aria-hidden
            />
            <div
              className="pointer-events-none absolute inset-x-2 bottom-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent"
              aria-hidden
            />
          </>
        )}
      </div>
    </div>
  );
}
