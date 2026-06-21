import React from 'react';
import { BookOpen, Blocks } from 'lucide-react';
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
  const r = 54;
  const c = 2 * Math.PI * r;
  const offset = c - (percent / 100) * c;

  return (
    <div className="relative w-40 h-40 mx-auto">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120" aria-hidden>
        <circle cx="60" cy="60" r={r} fill="none" strokeWidth="10" className={trackClass} />
        <circle
          cx="60"
          cy="60"
          r={r}
          fill="none"
          strokeWidth="10"
          strokeLinecap="round"
          className={accentClass}
          strokeDasharray={c}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.8s ease' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-black text-slate-800 tabular-nums leading-none">{current}</span>
        <span className="text-[10px] text-slate-400 font-black mt-1">/ {total}</span>
      </div>
    </div>
  );
}

export const StatsView: React.FC<StatsViewProps> = ({ totalWords, setActiveTab }) => {
  const { masteredCount, progressPercent } = useProgress();
  const sceneStats = useScenePracticeStats();

  return (
    <div className="space-y-4 pb-4">
      <header className="px-1">
        <h2 className="text-2xl font-black text-slate-800 tracking-tight">学习进度</h2>
        <p className="text-sm text-slate-500 font-medium mt-0.5">850 词 + 生活场景，练多少看多少</p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <section className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 flex flex-col items-center text-center">
          <div className="flex items-center gap-2 mb-6 self-start">
            <BookOpen className="w-5 h-5 text-indigo-500" />
            <h3 className="text-base font-black text-slate-800">850 词掌握</h3>
          </div>

          <ProgressRing
            current={masteredCount}
            total={totalWords}
            percent={progressPercent}
            accentClass="stroke-indigo-500"
            trackClass="stroke-slate-100"
          />

          <p className="mt-5 text-2xl font-black text-indigo-600 tabular-nums">{progressPercent}%</p>
          <p className="text-xs text-slate-500 font-medium mt-1">在词典里标记「已掌握」</p>

          <button
            type="button"
            onClick={() => setActiveTab('browser')}
            className="mt-5 text-xs font-black text-indigo-600 hover:text-indigo-500 cursor-pointer"
          >
            去词典 →
          </button>
        </section>

        <section className="bg-white rounded-3xl border border-emerald-100 shadow-sm p-6 flex flex-col items-center text-center">
          <div className="flex items-center gap-2 mb-6 self-start">
            <Blocks className="w-5 h-5 text-[#2f7d4f]" />
            <h3 className="text-base font-black text-slate-800">场景掌握</h3>
          </div>

          <ProgressRing
            current={sceneStats.practicedSceneCount}
            total={sceneStats.totalSceneCount || 0}
            percent={sceneStats.scenePercent}
            accentClass="stroke-[#2f7d4f]"
            trackClass="stroke-emerald-100"
          />

          <p className="mt-5 text-2xl font-black text-[#2f7d4f] tabular-nums">{sceneStats.scenePercent}%</p>
          <p className="text-xs text-slate-500 font-medium mt-1">在场景里标记「已练完」</p>

          <button
            type="button"
            onClick={() => setActiveTab('assembler')}
            className="mt-5 text-xs font-black text-[#2f7d4f] hover:opacity-80 cursor-pointer"
          >
            去练场景 →
          </button>
        </section>
      </div>
    </div>
  );
};
