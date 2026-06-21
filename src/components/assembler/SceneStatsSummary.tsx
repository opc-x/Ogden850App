import { SCENE_PROGRESS_GRADIENT } from '../../data/marketing';
import { useProgressStats } from '../../contexts/ProgressContext';
import { useSceneCatalog } from '../../hooks/useSceneCatalog';

function FormulaTerm({
  label,
  value,
  accent,
}: {
  label: string;
  value: string | number;
  accent?: boolean;
}) {
  return (
    <span className="inline-flex items-baseline gap-1">
      <span
        className={`text-2xl font-black tabular-nums leading-none sm:text-[1.65rem] ${
          accent ? 'text-[#2f7d4f]' : 'text-slate-800'
        }`}
      >
        {value}
      </span>
      <span className="text-[11px] font-medium text-slate-500">{label}</span>
    </span>
  );
}

function FormulaOp({ children }: { children: string }) {
  return (
    <span aria-hidden className="select-none text-xl font-medium leading-none text-slate-300">
      {children}
    </span>
  );
}

export function SceneStatsSummary() {
  const { scenes, stats } = useSceneCatalog();
  const { practicedSceneCount } = useProgressStats();

  if (!stats) return null;

  const dialogueLabel =
    stats.dialogueReady >= stats.dialogueTarget
      ? `${stats.dialogueReady.toLocaleString()}+`
      : stats.dialogueReady.toLocaleString();

  const totalScenes = scenes.length || stats.sceneTarget;
  const learnedScenes = practicedSceneCount;
  const sceneProgressPct =
    totalScenes > 0 ? Math.min(100, Math.round((learnedScenes / totalScenes) * 100)) : 0;

  return (
    <section className="mb-6">
      <div
        className="relative overflow-hidden rounded-3xl border border-slate-200/50 bg-gradient-to-b from-white via-white to-slate-50/80 px-5 py-5 sm:px-6 sm:py-6
          shadow-[0_12px_36px_-10px_rgba(15,23,42,0.14),0_4px_10px_-4px_rgba(15,23,42,0.06),inset_0_1px_0_rgba(255,255,255,0.95),inset_0_-1px_0_rgba(15,23,42,0.04)]"
      >
        {/* 顶光高光 — 模拟光从上方打下来 */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-[55%] bg-gradient-to-b from-white via-white/40 to-transparent"
        />

        <div className="relative">
          <div className="flex flex-wrap items-baseline justify-center gap-x-2 gap-y-1.5 sm:gap-x-2.5">
            <FormulaTerm label="核心词根" value={stats.wordCount} />
            <FormulaOp>×</FormulaOp>
            <FormulaTerm label="真实场景" value={stats.sceneTarget} />
            <FormulaOp>≈</FormulaOp>
            <FormulaTerm label="句生活口语" value={dialogueLabel} accent />
          </div>

          <div className="mt-4">
            <div className="mb-1.5 flex justify-end">
              <span className="text-[11px] font-semibold tabular-nums text-slate-500">
                <span className="text-amber-700">{learnedScenes}</span>
                <span className="mx-0.5 font-normal text-slate-400">/</span>
                {totalScenes}
              </span>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full border border-slate-200/90 bg-slate-100/90 shadow-[inset_0_1px_2px_rgba(15,23,42,0.06)]">
              <div
                className="h-full min-w-[0.5rem] rounded-full shadow-[0_1px_2px_rgba(180,83,9,0.3)] transition-all duration-500"
                style={{ width: `${sceneProgressPct}%`, background: SCENE_PROGRESS_GRADIENT }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
