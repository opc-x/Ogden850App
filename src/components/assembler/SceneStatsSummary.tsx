import type { SceneCatalogItem } from '../../types/scene';
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

  if (!stats) return null;

  const dialogueLabel =
    stats.dialogueReady >= stats.dialogueTarget
      ? `${stats.dialogueReady.toLocaleString()}+`
      : stats.dialogueReady.toLocaleString();

  return (
    <section className="mb-4">
      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
        <div className="px-4 pt-4 pb-0 text-center sm:px-5 sm:pt-5">
          <div className="flex flex-wrap items-baseline justify-center gap-x-1.5 gap-y-0.5">
            <FormulaTerm label="核心词根" value={stats.wordCount} />
            <FormulaOp>×</FormulaOp>
            <FormulaTerm label="真实场景" value={stats.sceneTarget} />
            <FormulaOp>≈</FormulaOp>
            <FormulaTerm label="句生活口语" value={dialogueLabel} accent />
          </div>
        </div>

        <ScenePreviewCarousel scenes={scenes} onSelect={onSceneSelect} />
      </div>
    </section>
  );
}
