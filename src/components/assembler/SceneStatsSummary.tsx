import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { FORMULA_RULE_LABEL } from '../../data/sceneCatalog';
import { useSceneCatalog } from '../../hooks/useSceneCatalog';

export function SceneStatsSummary() {
  const { stats } = useSceneCatalog();
  const [expanded, setExpanded] = useState(false);

  if (!stats) return null;

  const dialoguePct = Math.min(100, Math.round((stats.dialogueReady / stats.dialogueTarget) * 100));
  const dialogueLabel =
    stats.dialogueReady >= stats.dialogueTarget
      ? `${stats.dialogueReady.toLocaleString()}+`
      : stats.dialogueReady.toLocaleString();

  return (
    <section className="mb-4">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
        className="w-full flex items-center justify-between rounded-xl border border-orange-100/60 bg-white/80 px-4 py-2.5 text-left cursor-pointer hover:bg-white transition-colors shadow-sm"
      >
        <span className="text-[11px] font-semibold text-slate-500 tabular-nums">
          {dialogueLabel} 对话句 · {dialoguePct}%
        </span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-400 transition-transform ${expanded ? 'rotate-180' : ''}`}
        />
      </button>

      {expanded && (
        <div className="mt-2 relative overflow-hidden rounded-2xl border border-orange-100/60 shadow-sm bg-gradient-to-br from-[#fff6f0] via-white to-cyan-50/25">
          <div className="pointer-events-none absolute -top-10 -right-10 h-32 w-32 rounded-full bg-orange-200/20 blur-3xl" aria-hidden />
          <div className="pointer-events-none absolute -bottom-8 -left-8 h-24 w-24 rounded-full bg-cyan-200/15 blur-3xl" aria-hidden />

          <div className="relative px-4 sm:px-6 pt-5 pb-3.5 space-y-4">
            <div className="flex items-center justify-between w-full px-1 sm:px-3">
              <FormulaFactor value={String(stats.wordCount)} label="核心词" />
              <FormulaOp />
              <FormulaRuleFactor label={FORMULA_RULE_LABEL} />
              <FormulaOp />
              <FormulaFactor value={String(stats.sceneTarget)} label="场景" />
            </div>

            <div className="h-px bg-gradient-to-r from-transparent via-orange-100/80 to-transparent" />

            <div className="flex items-baseline justify-center gap-2.5">
              <span className="text-slate-200 font-light text-lg leading-none select-none" aria-hidden>
                =
              </span>
              <p className="text-[1.85rem] sm:text-3xl font-black text-[#c65a30] tabular-nums leading-none tracking-tight">
                {dialogueLabel}
              </p>
              <p className="text-xs text-slate-500 font-bold pb-0.5">对话句</p>
            </div>
          </div>

          <div className="relative px-4 sm:px-6 pb-4 space-y-1.5 border-t border-white/60 bg-white/40 backdrop-blur-[2px]">
            <div className="flex items-center gap-2.5 pt-3">
              <div className="flex-1 h-1 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full bg-[#c65a30] rounded-full transition-all duration-500"
                  style={{ width: `${dialoguePct}%` }}
                />
              </div>
              <span className="text-[10px] font-bold text-slate-400 tabular-nums shrink-0 w-7 text-right">
                {dialoguePct}%
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium text-center sm:text-left">
              {stats.sceneReady} 个场景共 {stats.dialogueReady.toLocaleString()} 句 · 目标{' '}
              {stats.dialogueTarget.toLocaleString()} 句
            </p>
          </div>
        </div>
      )}
    </section>
  );
}

function FormulaFactor({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center shrink-0 min-w-[3.25rem] sm:min-w-[4rem]">
      <p className="text-xl sm:text-2xl font-black text-slate-800 tabular-nums leading-none">{value}</p>
      <p className="text-[10px] text-slate-500 font-bold mt-1.5">{label}</p>
    </div>
  );
}

function FormulaRuleFactor({ label }: { label: string }) {
  return (
    <div className="text-center shrink-0 min-w-[4rem] sm:min-w-[5rem] px-1">
      <p className="text-xs sm:text-sm font-bold text-slate-600 leading-snug whitespace-nowrap">{label}</p>
      <p className="text-[10px] text-slate-500 font-bold mt-1.5">Ogden</p>
    </div>
  );
}

function FormulaOp() {
  return (
    <span className="text-orange-200/90 font-medium text-base leading-none shrink-0 select-none px-0.5" aria-hidden>
      ×
    </span>
  );
}
