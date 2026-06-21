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
      <div className="relative overflow-hidden rounded-3xl border border-orange-100 bg-gradient-to-br from-[#fff4ec] via-white to-[#fff8f3] shadow-[0_4px_24px_rgba(198,90,48,0.08)]">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-12 -right-10 h-40 w-40 rounded-full bg-orange-200/25 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-10 -left-8 h-32 w-32 rounded-full bg-cyan-200/15 blur-3xl"
        />

        <div className="relative px-5 sm:px-7 py-6">
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-1.5 rounded-full border border-orange-100 bg-white/80 px-3 py-1">
            <Sparkles className="w-3 h-3 text-[#c65a30]" />
            <span className="text-[11px] font-bold text-[#c65a30] tabular-nums">
              {stats.wordCount} 词 · {stats.sceneTarget} 场景
            </span>
          </div>

          {/* Focal headline */}
          <div className="mt-4 flex items-end gap-2">
            <span className="text-[3.25rem] sm:text-6xl font-black text-[#c65a30] tabular-nums leading-[0.85] tracking-tight">
              {dialogueLabel}
            </span>
            <span className="text-base font-black text-slate-700 pb-1.5">句生活口语</span>
          </div>
          <p className="mt-2.5 text-sm font-semibold text-slate-500 leading-relaxed text-pretty">
            最小词根 × 真实场景，练完今天就能张嘴说
          </p>

          {/* CTA */}
          {onStart && (
            <button
              type="button"
              onClick={onStart}
              className="group mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#c65a30] px-6 py-3.5 text-sm font-black text-white shadow-lg shadow-orange-500/20 transition-all hover:bg-[#b14f29] active:scale-[0.98] sm:w-auto"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>随便挑个场景开练</span>
              {recommendedSceneTitle && (
                <span className="font-bold text-white/80">· {recommendedSceneTitle}</span>
              )}
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </button>
          )}

          {/* Progress — framed for the user */}
          <div className="mt-5 border-t border-orange-100/70 pt-4">
            <div className="mb-1.5 flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 tabular-nums">
                已上线 {stats.dialogueReady.toLocaleString()} 句 · 持续更新中
              </span>
              <span className="text-[11px] font-black text-[#c65a30] tabular-nums">{dialoguePct}%</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-orange-100/70">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#faa144] to-[#c65a30] transition-all duration-500"
                style={{ width: `${dialoguePct}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
