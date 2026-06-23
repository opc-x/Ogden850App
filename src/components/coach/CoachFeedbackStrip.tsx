import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown } from 'lucide-react';
import { CoachAvatar } from './CoachAvatar';
import type { CoachEvalResult } from '../../types/coach';
import { COACH_PASS_THRESHOLD } from '../../types/coach';

function isDimensionOnlyAnalysis(text: string): boolean {
  return /^语义\s*\d/.test(text.trim());
}

export function CoachFeedbackStrip({ ev }: { ev: CoachEvalResult }) {
  const [open, setOpen] = useState(false);
  const passed = ev.passed;
  const semantic = ev.semantic ?? ev.score;
  const vocabulary = ev.vocabulary ?? ev.score;
  const fluency = ev.fluency ?? ev.score;

  const showAnalysis = ev.analysis && !isDimensionOnlyAnalysis(ev.analysis);
  const hasDetails =
    showAnalysis ||
    Boolean(ev.tip) ||
    Boolean(!passed && ev.correction) ||
    !passed;

  return (
    <motion.div
      initial={{ opacity: 0, y: 2 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-start gap-1.5 py-0.5 pl-1 max-w-[92%]"
    >
      <CoachAvatar size="xs" />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 min-h-[22px]">
          <span
            className={`shrink-0 text-[13px] font-black tabular-nums leading-none ${
              passed ? 'text-emerald-600' : 'text-amber-600'
            }`}
          >
            {ev.score}分
          </span>
          <p className="min-w-0 flex-1 truncate text-[11px] italic text-slate-400 leading-snug">
            {ev.encouragement}
          </p>
          {hasDetails ? (
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              className="shrink-0 p-0.5 rounded text-slate-300 hover:text-slate-500 active:scale-95"
              aria-expanded={open}
              aria-label={open ? '收起点评' : '展开点评'}
            >
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform ${open ? 'rotate-180' : ''}`}
                strokeWidth={2}
              />
            </button>
          ) : null}
        </div>

        <AnimatePresence initial={false}>
          {open && hasDetails ? (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="overflow-hidden"
            >
              <div className="pt-1 pb-0.5 space-y-0.5 text-[10px] italic text-slate-400 leading-relaxed border-l border-slate-200/80 pl-2 ml-0.5">
                <p className="not-italic tabular-nums text-slate-400/90">
                  语义{semantic} · 用词{vocabulary} · 流利{fluency}
                </p>
                {showAnalysis ? <p>{ev.analysis}</p> : null}
                {ev.tip ? <p>{ev.tip}</p> : null}
                {!passed && ev.correction ? <p>参考：{ev.correction}</p> : null}
                {!passed ? (
                  <p className="text-slate-300">过关线 {COACH_PASS_THRESHOLD} 分 · 意思对即可</p>
                ) : null}
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
