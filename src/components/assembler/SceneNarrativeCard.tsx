import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { NARRATIVE_LABELS, useSceneNarrative } from '../../hooks/useSceneNarrative';
import type { StoryNarrative } from '../../types/scene';

const CONTEXT_KEYS: Array<keyof StoryNarrative> = ['when', 'where', 'who'];
const DETAIL_KEYS: Array<keyof StoryNarrative> = ['how', 'method'];

const labelByKey = Object.fromEntries(NARRATIVE_LABELS.map((l) => [l.key, l.label])) as Record<
  keyof StoryNarrative,
  string
>;

export function SceneNarrativeCard({ sceneKey }: { sceneKey: string }) {
  const { narrative, loading } = useSceneNarrative(sceneKey);
  const [expanded, setExpanded] = useState(false);

  if (loading) {
    return (
      <div className="mb-3 h-9 rounded-xl border border-slate-100 bg-slate-50/60 animate-pulse" />
    );
  }

  if (!narrative) return null;

  return (
    <div className="mb-3">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
        className="w-full flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/40 px-4 py-2.5 text-left cursor-pointer hover:bg-slate-50 transition-colors"
      >
        <span className="text-[11px] font-semibold text-slate-500">故事背景</span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-400 transition-transform ${expanded ? 'rotate-180' : ''}`}
        />
      </button>

      {expanded && (
        <div className="mt-2 rounded-xl border border-slate-100 bg-slate-50/40 px-4 py-3.5">
          <p className="text-[13px] text-slate-800 font-semibold leading-relaxed">{narrative.event}</p>

          <dl className="mt-3 grid grid-cols-3 gap-2">
            {CONTEXT_KEYS.map((key) => (
              <div key={key} className="min-w-0 rounded-lg bg-white/80 border border-slate-100 px-2.5 py-2">
                <dt className="text-[9px] font-bold text-slate-400 mb-0.5">{labelByKey[key]}</dt>
                <dd className="text-[11px] text-slate-600 leading-snug line-clamp-3">{narrative[key]}</dd>
              </div>
            ))}
          </dl>

          <dl className="mt-3 space-y-2 border-l-2 border-slate-200/80 pl-3">
            {DETAIL_KEYS.map((key) => (
              <div key={key}>
                <dt className="text-[9px] font-bold text-slate-400">{labelByKey[key]}</dt>
                <dd className="text-[11px] text-slate-600 leading-relaxed mt-0.5">{narrative[key]}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}
    </div>
  );
}
