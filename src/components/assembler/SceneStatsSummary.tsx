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

        <div className="relative px-5 py-5 sm:px-6">
          {/* 价值公式：词根 × 场景 = 句子 */}
          <div className="flex flex-wrap items-end gap-x-3 gap-y-2 sm:gap-x-5">
            <div className="flex flex-col">
              <span className="text-3xl sm:text-4xl font-black text-slate-800 tabular-nums leading-none">
                {stats.wordCount}
              </span>
              <span className="mt-1 text-[11px] font-medium text-slate-400">核心词根</span>
            </div>

            <span className="pb-4 text-xl font-light text-emerald-300">×</span>

            <div className="flex flex-col">
              <span className="text-3xl sm:text-4xl font-black text-slate-800 tabular-nums leading-none">
                {stats.sceneTarget}
              </span>
              <span className="mt-1 text-[11px] font-medium text-slate-400">真实场景</span>
            </div>

            <span className="pb-4 text-xl font-light text-emerald-300">=</span>

            <div className="flex flex-col">
              <span className="text-4xl sm:text-5xl font-black text-[#2f7d4f] tabular-nums leading-none tracking-tight">
                {dialogueLabel}
              </span>
              <span className="mt-1 text-[11px] font-bold text-[#2f7d4f]">句能听会说的口语</span>
            </div>
          </div>

          <p className="mt-4 text-[13px] font-medium text-slate-400 leading-relaxed text-pretty">
            背 <span className="font-bold text-slate-600">850 个</span>最基础的词根，就能听懂、跟读这 <span className="font-bold text-slate-600">50 个</span>高频场景里的每一句话。
          </p>

          {/* 进度条 */}
          <div className="mt-4 flex items-center gap-3">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-emerald-100/70">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#5cb377] to-[#2f7d4f] transition-all duration-500"
                style={{ width: `${dialoguePct}%` }}
              />
            </div>
            <span className="shrink-0 text-[11px] font-medium text-slate-400">
              已上线 <span className="font-bold text-[#2f7d4f] tabular-nums">{stats.dialogueReady.toLocaleString()}</span> 句 · {dialoguePct}%
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
