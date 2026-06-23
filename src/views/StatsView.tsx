import React, { type FC } from 'react';
import { BookOpen, Blocks, ChevronRight, MessageSquare, type LucideIcon } from 'lucide-react';
import { useProgress } from '../contexts/ProgressContext';
import { useScenePracticeStats } from '../hooks/useScenePracticeStats';

interface StatsViewProps {
  totalWords: number;
  setActiveTab: (tab: string) => void;
  /** PC /web 壳：单列，不影响手机端 md/lg 视口断点 */
  variant?: 'app' | 'web';
}

type StatTheme = {
  icon: LucideIcon;
  iconWrap: string;
  iconColor: string;
  title: string;
  card: string;
  barTrack: string;
  barFill: string;
  percent: string;
  hint: string;
  actionLabel: string;
  tab: string;
};

type StatCardProps = {
  theme: StatTheme;
  current: number;
  total: number;
  percent: number;
  onAction: () => void;
};

const StatCard: FC<StatCardProps> = ({ theme, current, total, percent, onAction }) => {
  const Icon = theme.icon;
  const clamped = Math.min(100, Math.max(0, percent));

  return (
    <button
      type="button"
      onClick={onAction}
      className={`group w-full rounded-2xl border p-4 text-left shadow-[0_2px_12px_rgba(15,23,42,0.04)] transition-transform active:scale-[0.99] cursor-pointer ${theme.card}`}
    >
      <div className="flex items-center gap-2.5">
        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border ${theme.iconWrap}`}
        >
          <Icon className={`h-[17px] w-[17px] ${theme.iconColor}`} strokeWidth={2.25} />
        </div>

        <div className="flex min-w-0 flex-1 items-baseline justify-between gap-2">
          <div className="flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-0.5">
            <h3 className="text-sm font-bold text-slate-800">{theme.title}</h3>
            <span className="text-xs font-semibold tabular-nums text-slate-500">
              <span className="text-slate-700">{current.toLocaleString()}</span>
              <span className="mx-0.5 font-normal text-slate-400">/</span>
              {total.toLocaleString()}
            </span>
          </div>
          <span className={`shrink-0 text-2xl font-black tabular-nums leading-none ${theme.percent}`}>
            {percent}%
          </span>
        </div>
      </div>

      <div className={`mt-2.5 h-2 overflow-hidden rounded-full ${theme.barTrack}`}>
        <div
          className={`h-full rounded-full transition-all duration-700 ease-out ${theme.barFill}`}
          style={{ width: `${clamped}%` }}
        />
      </div>

      <div className="mt-2.5 flex items-center justify-between gap-2">
        <p className="min-w-0 text-body-sm font-medium leading-snug text-slate-500">{theme.hint}</p>
        <span
          className={`inline-flex shrink-0 items-center gap-0.5 text-body-sm font-bold ${theme.percent} group-hover:opacity-80`}
        >
          {theme.actionLabel}
          <ChevronRight className="h-3.5 w-3.5" strokeWidth={2.5} />
        </span>
      </div>
    </button>
  );
};

const STAT_THEMES: StatTheme[] = [
  {
    icon: BookOpen,
    iconWrap: 'border-indigo-100 bg-white/80',
    iconColor: 'text-indigo-600',
    title: '850 词根掌握',
    card: 'border-indigo-100/80 bg-gradient-to-br from-indigo-50/90 via-white to-white',
    barTrack: 'bg-indigo-100/70',
    barFill: 'bg-gradient-to-r from-indigo-500 to-indigo-400',
    percent: 'text-indigo-600',
    hint: '词典里标记「已掌握」',
    actionLabel: '去词典',
    tab: 'browser',
  },
  {
    icon: Blocks,
    iconWrap: 'border-emerald-100 bg-white/80',
    iconColor: 'text-[#2f7d4f]',
    title: '场景掌握',
    card: 'border-emerald-100/80 bg-gradient-to-br from-emerald-50/90 via-white to-white',
    barTrack: 'bg-emerald-100/70',
    barFill: 'bg-gradient-to-r from-[#2f7d4f] to-[#5cb377]',
    percent: 'text-[#2f7d4f]',
    hint: '场景里点「已练完」计数',
    actionLabel: '去练场景',
    tab: 'assembler',
  },
  {
    icon: MessageSquare,
    iconWrap: 'border-amber-100 bg-white/80',
    iconColor: 'text-amber-600',
    title: '对话句子',
    card: 'border-amber-100/80 bg-gradient-to-br from-amber-50/90 via-white to-white',
    barTrack: 'bg-amber-100/70',
    barFill: 'bg-gradient-to-r from-amber-600 to-amber-400',
    percent: 'text-amber-600',
    hint: '按场景整批累计，不逐句记',
    actionLabel: '去练场景',
    tab: 'assembler',
  },
];

export const StatsView: React.FC<StatsViewProps> = ({ totalWords, setActiveTab, variant = 'app' }) => {
  const { masteredCount, progressPercent } = useProgress();
  const sceneStats = useScenePracticeStats();

  const stats = [
    { current: masteredCount, total: totalWords, percent: progressPercent },
    {
      current: sceneStats.practicedSceneCount,
      total: sceneStats.totalSceneCount,
      percent: sceneStats.scenePercent,
    },
    {
      current: sceneStats.practicedSentenceCount,
      total: sceneStats.totalSentenceCount,
      percent: sceneStats.sentencePercent,
    },
  ];

  return (
    <div className="space-y-4 pb-4">
      <header className="px-0.5">
        <h2 className="text-xl font-black tracking-tight text-slate-800">学习进度</h2>
        <p className="mt-0.5 text-xs font-medium text-slate-500">850 词根、场景、对话三种进度，边练边更新</p>
      </header>

      <div
        className={
          variant === 'web'
            ? 'grid grid-cols-1 gap-3'
            : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3'
        }
      >
        {STAT_THEMES.map((theme, i) => (
          <StatCard
            key={theme.title}
            theme={theme}
            current={stats[i].current}
            total={stats[i].total}
            percent={stats[i].percent}
            onAction={() => setActiveTab(theme.tab)}
          />
        ))}
      </div>
    </div>
  );
};
