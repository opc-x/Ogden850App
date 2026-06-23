import { MoreHorizontal, Share, SquarePlus } from 'lucide-react';
import { getIosInAppFollowUp, type IosInstallGuide } from '../../lib/iosInstallGuide';

function StepBadge({ n }: { n: number }) {
  return (
    <span className="w-8 h-8 rounded-full bg-indigo-600 text-white text-sm font-black flex items-center justify-center shrink-0 shadow-sm">
      {n}
    </span>
  );
}

function ToolbarDot() {
  return <span className="w-7 h-7 rounded-lg bg-slate-300/70" />;
}

function ShareChip({ label }: { label: string }) {
  const isMenu = label === '···';
  return (
    <div className="inline-flex items-center gap-2 rounded-xl bg-blue-50 border-2 border-blue-300 px-3 py-2 shadow-sm">
      {isMenu ? (
        <MoreHorizontal className="w-5 h-5 text-blue-600 shrink-0" strokeWidth={2.25} />
      ) : (
        <Share className="w-5 h-5 text-blue-600 shrink-0" strokeWidth={2.25} />
      )}
      <span className="text-sm font-black text-blue-700">{label}</span>
    </div>
  );
}

function PlacementMock({ guide }: { guide: IosInstallGuide }) {
  if (guide.sharePlacement === 'bottom') {
    return (
      <div className="rounded-2xl bg-slate-100/90 border border-slate-200 px-3 pt-2.5 pb-3">
        <p className="text-[10px] font-bold text-slate-400 text-center tracking-wide mb-2">
          {guide.browserLabel.toUpperCase()} 底部 · 第 1 步点这里
        </p>
        <div className="flex items-end justify-center gap-6 px-2">
          <ToolbarDot />
          <ToolbarDot />
          <div className="flex flex-col items-center gap-1 -mb-0.5">
            <div className="rounded-xl bg-white ring-2 ring-blue-500 ring-offset-2 ring-offset-slate-100 px-3 py-2 shadow-md">
              <Share className="w-6 h-6 text-blue-600" strokeWidth={2.25} />
            </div>
            <span className="text-[10px] font-black text-blue-600">分享</span>
          </div>
          <ToolbarDot />
          <ToolbarDot />
        </div>
      </div>
    );
  }

  if (guide.sharePlacement === 'top-right') {
    return (
      <div className="rounded-2xl bg-slate-100/90 border border-slate-200 px-3 py-3">
        <p className="text-[10px] font-bold text-slate-400 text-center tracking-wide mb-2">
          {guide.browserLabel.toUpperCase()} 右上方 · 第 1 步点这里
        </p>
        <div className="flex items-center justify-end gap-2 px-1">
          <span className="flex-1 h-8 rounded-lg bg-white border border-slate-200" />
          <div className="flex flex-col items-center gap-1">
            <div className="rounded-xl bg-white ring-2 ring-blue-500 ring-offset-2 ring-offset-slate-100 p-2 shadow-md">
              {guide.browser === 'in-app' ? (
                <MoreHorizontal className="w-5 h-5 text-blue-600" strokeWidth={2.25} />
              ) : (
                <Share className="w-5 h-5 text-blue-600" strokeWidth={2.25} />
              )}
            </div>
            <span className="text-[10px] font-black text-blue-600">{guide.step1Chip}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-slate-100/90 border border-slate-200 px-3 py-3">
      <p className="text-[10px] font-bold text-slate-400 text-center tracking-wide mb-2">
        {guide.browserLabel.toUpperCase()} 右下角 · 先点菜单
      </p>
      <div className="flex items-end justify-end gap-3 px-1">
        <div className="flex flex-col items-center gap-1">
          <div className="rounded-xl bg-white ring-2 ring-blue-500 ring-offset-2 ring-offset-slate-100 px-3 py-2 shadow-md text-blue-600 font-black text-lg leading-none">
            ≡
          </div>
          <span className="text-[10px] font-black text-blue-600">菜单</span>
        </div>
      </div>
    </div>
  );
}

function LookArrow({ guide }: { guide: IosInstallGuide }) {
  return (
    <div className="flex justify-center mt-3">
      <div className="flex flex-col items-center text-blue-600">
        <span className="text-[10px] font-black tracking-wide">{guide.lookHint}</span>
        <svg viewBox="0 0 24 24" className="w-5 h-5 animate-bounce" aria-hidden>
          {guide.arrow === 'down' ? (
            <path d="M12 5v14M6 13l6 6 6-6" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          ) : (
            <path d="M12 19V5M6 11l6-6 6 6" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          )}
        </svg>
      </div>
    </div>
  );
}

type IosInstallStepsProps = {
  guide: IosInstallGuide;
  inAppFollowUp?: boolean;
};

export function IosInstallSteps({ guide, inAppFollowUp }: IosInstallStepsProps) {
  const followUp = inAppFollowUp ? getIosInAppFollowUp() : null;
  const isInApp = guide.browser === 'in-app';

  return (
    <div className="space-y-3.5 pr-5">
      <div>
        <p className="text-[15px] font-black text-slate-900 leading-tight">
          {isInApp ? '先跳出微信，再 2 步装好' : '只需 2 步，装到 iPhone 桌面'}
        </p>
        <p className="text-[11px] text-slate-500 font-medium mt-0.5">
          当前：{guide.browserLabel} · 照着做就行
        </p>
      </div>

      <div className="flex gap-3">
        <StepBadge n={1} />
        <div className="min-w-0 space-y-1.5">
          <p className="text-sm font-bold text-slate-800 leading-snug">{guide.step1Title}</p>
          <ShareChip label={guide.step1Chip} />
          {guide.step1Extra && (
            <p className="text-[11px] text-slate-500 font-medium">{guide.step1Extra}</p>
          )}
        </div>
      </div>

      <div className="flex gap-3">
        <StepBadge n={2} />
        <div className="min-w-0 space-y-1.5">
          <p className="text-sm font-bold text-slate-800 leading-snug">{guide.step2Title}</p>
          {!isInApp && (
            <div className="inline-flex items-center gap-2 rounded-xl bg-slate-50 border-2 border-slate-300 px-3 py-2 shadow-sm">
              <SquarePlus className="w-5 h-5 text-slate-700 shrink-0" strokeWidth={2.25} />
              <span className="text-sm font-black text-slate-800">添加到主屏幕</span>
            </div>
          )}
          {isInApp && (
            <p className="text-[11px] text-slate-500 font-medium">打开 Safari 后会再提示你后 2 步</p>
          )}
          {!isInApp && (
            <p className="text-[11px] text-slate-500 font-medium">菜单可能要往上滑一点才能看到</p>
          )}
        </div>
      </div>

      {followUp && (
        <div className="rounded-xl bg-emerald-50 border border-emerald-200 px-3 py-2.5 space-y-1">
          <p className="text-[11px] font-black text-emerald-800">Safari 打开后：</p>
          <p className="text-[11px] text-emerald-700 font-medium">① {followUp.step1Title}</p>
          <p className="text-[11px] text-emerald-700 font-medium">② {followUp.step2Title}</p>
        </div>
      )}

      <PlacementMock guide={guide} />
      <LookArrow guide={guide} />
    </div>
  );
}
