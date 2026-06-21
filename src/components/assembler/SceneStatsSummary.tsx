import { Sparkles } from 'lucide-react';
import { useSceneCatalog } from '../../hooks/useSceneCatalog';

export function SceneStatsSummary() {
  const { stats } = useSceneCatalog();

  if (!stats) return null;

  const dialoguePct = Math.min(100, Math.round((stats.dialogueReady / stats.dialogueTarget) * 100));
  const dialogueLabel =
    stats.dialogueReady >= stats.dialogueTarget
      ? `${stats.dialogueReady.toLocaleString()}+`
      : stats.dialogueReady.toLocaleString();

  return (
    <section className="mb-5">
      <div className="relative overflow-hidden rounded-3xl border border-emerald-100 bg-gradient-to-br from-[#f0f9f2] via-white to-[#f4fbf6] shadow-[0_4px_24px_rgba(47,125,79,0.08)]">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-12 -right-10 h-44 w-44 rounded-full bg-emerald-200/30 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-10 -left-8 h-32 w-32 rounded-full bg-emerald-100/40 blur-3xl"
        />

        <div className="relative px-5 py-6 sm:px-7 sm:py-7">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-100 bg-white/80 px-3 py-1">
            <Sparkles className="w-3 h-3 text-[#2f7d4f]" />
            <span className="text-[11px] font-bold text-[#2f7d4f]">用最小的词，说最多的话</span>
          </div>

          {/* 价值公式：词根 × 场景 = 句子 */}
          <div className="mt-5 flex flex-wrap items-end gap-x-4 gap-y-3 sm:gap-x-6">
            <div className="flex flex-col">
              <span className="text-4xl sm:text-5xl font-black text-slate-800 tabular-nums leading-none">
                {stats.wordCount}
              </span>
              <span className="mt-1.5 text-xs font-bold text-slate-500">个核心词根</span>
            </div>

            <span className="pb-6 text-2xl sm:text-3xl font-light text-emerald-400">×</span>

            <div className="flex flex-col">
              <span className="text-4xl sm:text-5xl font-black text-slate-800 tabular-nums leading-none">
                {stats.sceneTarget}
              </span>
              <span className="mt-1.5 text-xs font-bold text-slate-500">个真实场景</span>
            </div>

            <span className="pb-6 text-2xl sm:text-3xl font-light text-emerald-400">=</span>

            <div className="flex flex-col">
              <span className="text-5xl sm:text-6xl font-black text-[#2f7d4f] tabular-nums leading-none tracking-tight">
                {dialogueLabel}
              </span>
              <span className="mt-1.5 text-xs font-black text-[#2f7d4f]">句能听会说的口语</span>
            </div>
          </div>

          <p className="mt-5 text-sm font-semibold text-slate-500 leading-relaxed text-pretty">
            背 850 个最基础的词根，就能听懂、读通这 50 个高频场景里的每一句话。
          </p>

          {/* 进度条 */}
          <div className="mt-5 border-t border-emerald-100/70 pt-4">
            <div className="flex items-baseline justify-between">
              <span className="text-xs font-bold text-slate-500">
                口语库进度 · 已上线 <span className="text-[#2f7d4f] tabular-nums">{stats.dialogueReady.toLocaleString()}</span> 句
              </span>
              <span className="text-sm font-black text-[#2f7d4f] tabular-nums">{dialoguePct}%</span>
            </div>
            <div className="mt-2.5 h-2 overflow-hidden rounded-full bg-emerald-100/70">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#5cb377] to-[#2f7d4f] transition-all duration-500"
                style={{ width: `${dialoguePct}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
