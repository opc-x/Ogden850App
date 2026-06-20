import { NARRATIVE_LABELS, useSceneNarrative } from '../../hooks/useSceneNarrative';

export function SceneNarrativeCard({ sceneKey }: { sceneKey: string }) {
  const { narrative, loading } = useSceneNarrative(sceneKey);

  if (loading) {
    return (
      <div className="mb-4 rounded-2xl border border-amber-100 bg-amber-50/50 p-4 text-xs text-slate-400">
        加载故事背景…
      </div>
    );
  }

  if (!narrative) return null;

  return (
    <div className="mb-4 rounded-2xl border border-amber-100 bg-gradient-to-br from-amber-50/80 to-orange-50/50 p-4">
      <p className="text-[10px] font-black text-amber-800/80 uppercase tracking-wider mb-2">
        入戏背景 · 六要素带你进入剧情
      </p>
      <dl className="grid gap-2 sm:grid-cols-2">
        {NARRATIVE_LABELS.map(({ key, label }) => (
          <div key={key} className="min-w-0">
            <dt className="text-[10px] font-bold text-amber-700/90">{label}</dt>
            <dd className="text-xs text-slate-700 leading-snug font-medium">{narrative[key]}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
