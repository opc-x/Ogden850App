import React from 'react';
import { BookOpen, Blocks, MessageSquare, type LucideIcon } from 'lucide-react';
import { useProgress } from '../contexts/ProgressContext';
import { useScenePracticeStats } from '../hooks/useScenePracticeStats';

interface StatsViewProps {
  totalWords: number;
  setActiveTab: (tab: string) => void;
}

function ProgressRing({
  current,
  total,
  percent,
  accentClass,
  trackClass,
}: {
  current: number;
  total: number;
  percent: number;
  accentClass: string;
  trackClass: string;
}) {
  const r = 34;
  const c = 2 * Math.PI * r;
  const offset = c - (percent / 100) * c;

  return (
    <div className="relative h-[5.5rem] w-[5.5rem] shrink-0">
      <svg className="h-full w-full -rotate-90" viewBox="0 0 80 80" aria-hidden>
        <circle cx="40" cy="40" r={r} fill="none" strokeWidth="7" className={trackClass} />
        <circle
          cx="40"
          cy="40"
          r={r}
          fill="none"
          strokeWidth="7"
          strokeLinecap="round"
          className={accentClass}
          strokeDasharray={c}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.8s ease' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-lg font-black tabular-nums leading-none text-slate-800">
          {current.toLocaleString()}
        </span>
        <span className="mt-0.5 text-[9px] font-bold text-slate-400">/ {total.toLocaleString()}</span>
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  iconClass,
  title,
  current,
  total,
  percent,
  accentClass,
  trackClass,
  percentClass,
  hint,
  actionLabel,
  onAction,
}: {
  icon: LucideIcon;
  iconClass: string;
  title: string;
  current: number;
  total: number;
  percent: number;
  accentClass: string;
  trackClass: string;
  percentClass: string;
  hint: string;
  actionLabel: string;
  onAction: () => void;
}) {
  return (
    <section className="flex flex-col rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center gap-1.5">
        <Icon className={`h-4 w-4 ${iconClass}`} />
        <h3 className="text-sm font-bold text-slate-800">{title}</h3>
      </div>

      <div className="flex items-center gap-3">
        <ProgressRing
          current={current}
          total={total}
          percent={percent}
          accentClass={accentClass}
          trackClass={trackClass}
        />
        <div className="min-w-0 flex-1">
          <p className={`text-xl font-black tabular-nums leading-none ${percentClass}`}>{percent}%</p>
          <p className="mt-1.5 text-[10px] font-medium leading-snug text-slate-500">{hint}</p>
        </div>
      </div>

      <button
        type="button"
        onClick={onAction}
        className={`mt-3 self-start text-[10px] font-bold ${percentClass} hover:opacity-80 cursor-pointer`}
      >
        {actionLabel}
      </button>
    </section>
  );
}

export const StatsView: React.FC<StatsViewProps> = ({ totalWords, setActiveTab }) => {
  const { masteredCount, progressPercent } = useProgress();
  const sceneStats = useScenePracticeStats();

  return (
    <div className="space-y-4 pb-4">
      <header className="px-0.5">
        <h2 className="text-xl font-black tracking-tight text-slate-800">学习进度</h2>
        <p className="mt-0.5 text-xs font-medium text-slate-500">850 词 + 生活场景，练多少看多少</p>
      </header>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatCard
          icon={BookOpen}
          iconClass="text-indigo-500"
          title="850 词掌握"
          current={masteredCount}
          total={totalWords}
          percent={progressPercent}
          accentClass="stroke-indigo-500"
          trackClass="stroke-slate-100"
          percentClass="text-indigo-600"
          hint="词典里标记「已掌握」"
          actionLabel="去词典 →"
          onAction={() => setActiveTab('browser')}
        />

        <StatCard
          icon={Blocks}
          iconClass="text-[#2f7d4f]"
          title="场景掌握"
          current={sceneStats.practicedSceneCount}
          total={sceneStats.totalSceneCount}
          percent={sceneStats.scenePercent}
          accentClass="stroke-[#2f7d4f]"
          trackClass="stroke-emerald-100"
          percentClass="text-[#2f7d4f]"
          hint="场景里点「已练完」计数"
          actionLabel="去练场景 →"
          onAction={() => setActiveTab('assembler')}
        />

        <StatCard
          icon={MessageSquare}
          iconClass="text-amber-600"
          title="口语句子"
          current={sceneStats.practicedSentenceCount}
          total={sceneStats.totalSentenceCount}
          percent={sceneStats.sentencePercent}
          accentClass="stroke-amber-500"
          trackClass="stroke-amber-100"
          percentClass="text-amber-600"
          hint="按场景整批累计，不逐句记"
          actionLabel="去练场景 →"
          onAction={() => setActiveTab('assembler')}
        />
      </div>
    </div>
  );
};
