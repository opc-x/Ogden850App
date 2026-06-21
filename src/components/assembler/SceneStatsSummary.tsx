import { Sparkles, Play, ArrowRight } from 'lucide-react';
import { useSceneCatalog } from '../../hooks/useSceneCatalog';

interface SceneStatsSummaryProps {
  /** 推荐场景标题，显示在按钮上 */
  recommendedSceneTitle?: string;
  /** 点击「随便挑个场景开练」 */
  onStart?: () => void;
}

export function SceneStatsSummary({ recommendedSceneTitle, onStart }: SceneStatsSummaryProps) {
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

        <div className="relative grid gap-6 px-5 py-6 sm:px-7 sm:py-7 md:grid-cols-[1.15fr_1fr] md:items-center md:gap-8">
          {/* Left column — headline + CTA */}
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-100 bg-white/80 px-3 py-1">
              <Sparkles className="w-3 h-3 text-[#2f7d4f]" />
              <span className="text-[11px] font-bold text-[#2f7d4f] tabular-nums">
                {stats.wordCount} 词 · {stats.sceneTarget} 场景
              </span>
            </div>

            <div className="mt-4 flex items-end gap-2">
              <span className="text-[3.25rem] sm:text-6xl font-black text-[#2f7d4f] tabular-nums leading-[0.85] tracking-tight">
                {dialogueLabel}
              </span>
              <span className="text-base font-black text-slate-700 pb-1.5">句生活口语</span>
            </div>
            <p className="mt-2.5 text-sm font-semibold text-slate-500 leading-relaxed text-pretty">
              最小词根 × 真实场景，练完今天就能张嘴说
            </p>

            {onStart && (
              <div className="mt-5">
                <button
                  type="button"
                  onClick={onStart}
                  className="group inline-flex w-full items-center justify-center gap-2.5 rounded-2xl bg-[#2f7d4f] px-7 py-3.5 text-base font-black text-white shadow-lg shadow-emerald-600/25 transition-all hover:bg-[#266641] hover:shadow-emerald-600/30 active:scale-[0.97] sm:w-auto"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>开始开口练</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </button>
                {recommendedSceneTitle && (
                  <p className="mt-2 text-xs font-semibold text-slate-400">
                    推荐从「{recommendedSceneTitle}」开始
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Right column — progress panel (fills the empty space on wide screens) */}
          <div className="rounded-2xl border border-emerald-100/80 bg-white/70 p-5 backdrop-blur-sm">
            <div className="flex items-baseline justify-between">
              <span className="text-xs font-bold text-slate-500">口语库进度</span>
              <span className="text-2xl font-black text-[#2f7d4f] tabular-nums">{dialoguePct}%</span>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-emerald-100/70">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#5cb377] to-[#2f7d4f] transition-all duration-500"
                style={{ width: `${dialoguePct}%` }}
              />
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-emerald-50/80 px-3 py-2.5">
                <div className="text-lg font-black text-[#2f7d4f] tabular-nums leading-none">
                  {stats.dialogueReady.toLocaleString()}
                </div>
                <div className="mt-1 text-[11px] font-semibold text-slate-500">已上线句子</div>
              </div>
              <div className="rounded-xl bg-emerald-50/80 px-3 py-2.5">
                <div className="text-lg font-black text-[#2f7d4f] tabular-nums leading-none">
                  {stats.sceneTarget}
                </div>
                <div className="mt-1 text-[11px] font-semibold text-slate-500">真实场景</div>
              </div>
            </div>
            <p className="mt-3 text-[11px] font-semibold text-slate-400">持续更新中，越练越多</p>
          </div>
        </div>
      </div>
    </section>
  );
}
