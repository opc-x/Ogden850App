import React from 'react';
import type { SceneCatalogItem } from '../../types/scene';
import { usePracticedScenes } from '../../contexts/ProgressContext';
import { SceneCover, SCENE_COVER_ASPECT_CLASS } from './SceneCover';

interface SceneCardProps {
  scene: SceneCatalogItem;
  onClick: () => void;
  compact?: boolean;
}

/** 场景卡片 — 仅场景图 + 标题 + 句数 */
export const SceneCard = React.memo(function SceneCard({ scene, onClick }: SceneCardProps) {
  const practicedScenes = usePracticedScenes();
  const building = scene.status === 'building' || scene.sentenceCount === 0;
  const practiced = !building && Boolean(practicedScenes[scene.sceneKey]);

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={building}
      className={`text-left w-full bg-white border rounded-2xl overflow-hidden shadow-sm transition-all group ${
        building
          ? 'border-slate-100 opacity-60 cursor-not-allowed'
          : practiced
            ? 'border-emerald-200 hover:border-emerald-300 hover:shadow-md cursor-pointer active:scale-[0.98]'
            : 'border-slate-100 hover:border-emerald-300 hover:shadow-md cursor-pointer active:scale-[0.98]'
      }`}
    >
      <SceneCover
        slug={scene.slug}
        gradient={scene.gradient}
        titleZh={scene.titleZh}
        tone="soft"
        className={`${SCENE_COVER_ASPECT_CLASS} w-full`}
      />
      <div className="flex items-center justify-between gap-2 px-2 py-1.5">
        <p className="text-xs font-bold text-slate-700 truncate group-hover:text-[#2f7d4f] transition-colors min-w-0">
          {scene.titleZh}
        </p>
        <span
          className={`shrink-0 text-[9px] font-black px-1.5 py-0.5 rounded-md border ${
            building
              ? 'text-slate-400 bg-slate-50 border-slate-100'
              : 'text-emerald-600/85 bg-emerald-50/70 border-emerald-100/80'
          }`}
        >
          {building ? '生成中' : `${scene.sentenceCount}句`}
        </span>
      </div>
    </button>
  );
});
