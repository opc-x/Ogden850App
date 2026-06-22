import type { SceneCatalogItem } from '../../types/scene';
import { SCENE_PROGRESS_GRADIENT } from '../../data/marketing';
import { useProgressStats } from '../../contexts/ProgressContext';
import { useSceneCatalog } from '../../hooks/useSceneCatalog';
import { ScenePreviewCarousel } from './ScenePreviewCarousel';

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
    <span className="inline-flex items-baseline gap-0.5">
      <span
        className={`text-lg font-black tabular-nums leading-none sm:text-xl ${
          accent ? 'text-[#2f7d4f]' : 'text-slate-800'
        }`}
      >
        {value}
      </span>
      <span className="text-[10px] font-medium text-slate-500">{label}</span>
    </span>
  );
}

function FormulaOp({ children }: { children: string }) {
  return (
    <span aria-hidden className="select-none text-base font-medium leading-none text-slate-300">
      {children}
    </span>
  );
}

export function SceneStatsSummary({ onSceneSelect }: { onSceneSelect?: (scene: SceneCatalogItem) => void }) {
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

  const previewScenes = scenes;

  return (
    <section className="mb-3">
      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
        <div className="border-b border-slate-100/90 px-3.5 py-2.5 sm:px-4">
          <div className="flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5">
            <FormulaTerm label="核心词根" value={stats.wordCount} />
            <FormulaOp>×</FormulaOp>
            <FormulaTerm label="真实场景" value={stats.sceneTarget} />
            <FormulaOp>≈</FormulaOp>
            <FormulaTerm label="句生活口语" value={dialogueLabel} accent />
          </div>
          <div className="mt-1.5 flex items-center gap-2">
            <div className="h-1 min-w-0 flex-1 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full min-w-[0.25rem] rounded-full transition-all duration-500"
                style={{ width: `${sceneProgressPct}%`, background: SCENE_PROGRESS_GRADIENT }}
              />
            </div>
            <span className="shrink-0 text-[10px] font-semibold tabular-nums text-slate-500">
              <span className="text-amber-700">{learnedScenes}</span>
              <span className="mx-0.5 font-normal text-slate-400">/</span>
              {totalScenes}
            </span>
          </div>
        </div>

        <ScenePreviewCarousel scenes={previewScenes} onSelect={onSceneSelect} />
      </div>
    </section>
  );
}
