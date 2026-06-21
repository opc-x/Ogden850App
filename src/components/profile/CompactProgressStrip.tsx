import { BookOpen, Blocks } from 'lucide-react';

function MiniBar({
  label,
  icon: Icon,
  current,
  total,
  percent,
  accent,
  track,
}: {
  label: string;
  icon: typeof BookOpen;
  current: number;
  total: number;
  percent: number;
  accent: string;
  track: string;
}) {
  return (
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-1.5 mb-2">
        <Icon className={`w-3.5 h-3.5 ${accent}`} />
        <span className="text-[11px] font-black text-slate-700 truncate">{label}</span>
        <span className="text-[10px] font-bold text-slate-400 ml-auto tabular-nums shrink-0">
          {current}/{total}
        </span>
      </div>
      <div className={`h-2 rounded-full ${track} overflow-hidden`}>
        <div
          className={`h-full rounded-full transition-all duration-700 ${
            accent === 'text-[#2f7d4f]' ? 'bg-[#2f7d4f]' : 'bg-indigo-500'
          }`}
          style={{ width: `${Math.min(100, percent)}%` }}
        />
      </div>
      <p className={`text-xs font-black mt-1.5 tabular-nums ${accent}`}>{percent}%</p>
    </div>
  );
}

interface CompactProgressStripProps {
  wordCurrent: number;
  wordTotal: number;
  wordPercent: number;
  sceneCurrent: number;
  sceneTotal: number;
  scenePercent: number;
  onWordsClick?: () => void;
  onScenesClick?: () => void;
}

export function CompactProgressStrip({
  wordCurrent,
  wordTotal,
  wordPercent,
  sceneCurrent,
  sceneTotal,
  scenePercent,
  onWordsClick,
  onScenesClick,
}: CompactProgressStripProps) {
  return (
    <section className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-3">学习概览</p>
      <div className="flex gap-4">
        <button
          type="button"
          onClick={onWordsClick}
          className="flex-1 text-left cursor-pointer active:opacity-80"
        >
          <MiniBar
            label="850 词"
            icon={BookOpen}
            current={wordCurrent}
            total={wordTotal}
            percent={wordPercent}
            accent="text-indigo-600"
            track="bg-indigo-50"
          />
        </button>
        <div className="w-px bg-slate-100 shrink-0" />
        <button
          type="button"
          onClick={onScenesClick}
          className="flex-1 text-left cursor-pointer active:opacity-80"
        >
          <MiniBar
            label="场景"
            icon={Blocks}
            current={sceneCurrent}
            total={sceneTotal}
            percent={scenePercent}
            accent="text-[#2f7d4f]"
            track="bg-emerald-50"
          />
        </button>
      </div>
    </section>
  );
}
