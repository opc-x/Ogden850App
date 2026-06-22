import { CheckCircle2, ChevronRight } from 'lucide-react';
import type { SceneCatalogItem } from '../../types/scene';
import { usePracticedScenes } from '../../contexts/ProgressContext';
import { SceneCover, SCENE_COVER_ASPECT_CLASS } from './SceneCover';

/** 全部场景 — 竖向缩略图列表，5:2 等比展示插画全貌 */
export function SceneThumbnailList({
  scenes,
  onSelect,
}: {
  scenes: SceneCatalogItem[];
  onSelect: (scene: SceneCatalogItem) => void;
}) {
  const practicedScenes = usePracticedScenes();

  return (
    <ul className="space-y-2">
      {scenes.map((scene) => {
        const building = scene.status === 'building' || scene.sentenceCount === 0;
        const practiced = !building && Boolean(practicedScenes[scene.sceneKey]);

        return (
          <li key={scene.slug}>
            <button
              type="button"
              onClick={() => onSelect(scene)}
              disabled={building}
              className={`flex w-full items-center gap-3 rounded-2xl border p-2.5 text-left transition-all active:scale-[0.995] ${
                building
                  ? 'cursor-not-allowed border-slate-100 bg-slate-50/50 opacity-60'
                  : practiced
                    ? 'cursor-pointer border-emerald-200/80 bg-emerald-50/20 hover:border-emerald-300 hover:shadow-sm'
                    : 'cursor-pointer border-slate-100 bg-white hover:border-emerald-200 hover:shadow-sm'
              }`}
            >
              <div
                className={`shrink-0 rounded-xl p-[2px] ${
                  practiced
                    ? 'bg-gradient-to-br from-[#2f7d4f]/45 via-white/95 to-emerald-100/70'
                    : 'bg-gradient-to-br from-slate-200/50 via-white to-slate-100/80'
                }`}
              >
                <div className="overflow-hidden rounded-[10px] bg-slate-50 ring-1 ring-inset ring-white/50">
                  <SceneCover
                    slug={scene.slug}
                    gradient={scene.gradient}
                    titleZh={scene.titleZh}
                    fit="contain"
                    tone={practiced ? 'default' : 'soft'}
                    className={`w-[6.75rem] shrink-0 self-center rounded-xl border border-slate-100/90 sm:w-[7.5rem] ${SCENE_COVER_ASPECT_CLASS}`}
                  />
                </div>
              </div>
              <div className="flex min-w-0 flex-1 items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-slate-800">{scene.titleZh}</p>
                  {(building || practiced) && (
                    <p className="mt-0.5 text-[11px] font-medium text-slate-400">
                      {building ? '生成中' : '已练完'}
                    </p>
                  )}
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  {!building && (
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold tabular-nums text-slate-600">
                      {scene.sentenceCount} 句
                    </span>
                  )}
                  {practiced && (
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" strokeWidth={2.25} />
                  )}
                  <ChevronRight className="h-4 w-4 text-slate-300" strokeWidth={2.25} />
                </div>
              </div>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
