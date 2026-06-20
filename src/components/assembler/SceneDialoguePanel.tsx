import { useState } from 'react';
import { Volume2, ChevronLeft, BookOpen, RefreshCw, CheckCircle2, Circle } from 'lucide-react';
import type { SceneCatalogItem } from '../../types/scene';
import { useSceneCatalog } from '../../hooks/useSceneCatalog';
import { useSceneDialogues } from '../../hooks/useSceneDialogues';
import { usePracticedScenes, useProgressActions } from '../../contexts/ProgressContext';
import { ClickableSentence } from '../word/ClickableSentence';
import { speakText, isSpeechSupported } from '../../data/speak';
import { SceneCover } from './SceneCover';
import { SceneCard } from './SceneCard';
import { SceneNarrativeCard } from './SceneNarrativeCard';
import { SCENE_LIST_TITLE } from '../../data/marketing';

interface SceneDialoguePanelProps {
  onWordClick?: (wordId: string) => void;
}

export function SceneDialoguePanel({ onWordClick }: SceneDialoguePanelProps) {
  const { scenes: allScenes, loading: catalogLoading, error: catalogError } = useSceneCatalog();
  const practicedScenes = usePracticedScenes();
  const { toggleScenePracticed } = useProgressActions();
  const [active, setActive] = useState<SceneCatalogItem | null>(null);
  const { turns, loading: turnsLoading, error: turnsError } = useSceneDialogues(active?.sceneKey ?? null);

  if (catalogLoading) {
    return (
      <div className="flex justify-center py-16">
        <RefreshCw className="w-6 h-6 animate-spin text-orange-400" />
      </div>
    );
  }

  if (catalogError) {
    return <p className="text-sm text-rose-600 text-center py-8">{catalogError}</p>;
  }

  let lastBeat: string | null = null;

  if (active) {
    const practiced = Boolean(practicedScenes[active.sceneKey]);
    return (
      <div className="space-y-4">
        <button
          type="button"
          onClick={() => setActive(null)}
          className="flex items-center gap-1.5 text-sm font-bold text-[#c65a30] cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
          返回全部 {allScenes.length} 场景
        </button>

        <div className="bg-white border border-orange-100 rounded-3xl overflow-hidden shadow-sm">
          <SceneCover
            slug={active.slug}
            gradient={active.gradient}
            titleZh={active.titleZh}
            className="aspect-[5/2] w-full rounded-none"
          />

          <div className="p-5">
            <div className="flex items-start justify-between gap-3 mb-2">
              <div>
                <p className="text-[10px] font-black text-[#c65a30] uppercase tracking-wider">
                  {active.freqRank <= 10
                    ? `生活场景 TOP ${active.freqRank}`
                    : `生活场景第 ${active.freqRank} 名`}
                </p>
                <h3 className="text-xl font-black text-slate-800">{active.titleZh}</h3>
                <p className="text-[11px] text-slate-500 font-medium mt-1">{active.storyHook}</p>
              </div>
              <span className="text-xs font-bold text-slate-400 shrink-0">
                {turnsLoading ? '…' : `${turns.length} 句`}
              </span>
            </div>

            <p className="text-[11px] text-slate-400 mb-3 flex items-center gap-1">
              <BookOpen className="w-3 h-3" />
              连续对话 · 点词查释义 · 支持朗读跟读
            </p>

            <SceneNarrativeCard sceneKey={active.sceneKey} />

            {active.storyOutline.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-4">
                {active.storyOutline.map((ch) => (
                  <span
                    key={ch.title}
                    className="text-[9px] font-bold px-2 py-1 rounded-full bg-slate-50 text-slate-500 border border-slate-100"
                  >
                    {ch.beat}·{ch.title}
                  </span>
                ))}
              </div>
            )}

            {turnsError && (
              <p className="text-xs text-rose-500 mb-3">{turnsError}</p>
            )}

            <ul className="space-y-3">
              {turns.map((t) => {
                const showBeat = t.storyBeat !== lastBeat;
                lastBeat = t.storyBeat;
                return (
                  <li key={t.id}>
                    {showBeat && (
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 text-center">
                        — {t.storyBeat} —
                      </p>
                    )}
                    <div className={`flex gap-3 ${t.speaker === 'A' ? '' : 'flex-row-reverse text-right'}`}>
                      <div
                        className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-black ${
                          t.speaker === 'A' ? 'bg-cyan-100 text-cyan-700' : 'bg-orange-100 text-[#c65a30]'
                        }`}
                      >
                        {t.speakerZh}
                      </div>
                      <div
                        className={`max-w-[85%] rounded-2xl px-4 py-3 border ${
                          t.speaker === 'A'
                            ? 'bg-slate-50 border-slate-200 rounded-tl-sm'
                            : 'bg-[#fff8f5] border-orange-100 rounded-tr-sm'
                        }`}
                      >
                        <p className="text-sm font-semibold text-slate-800 leading-relaxed">
                          <ClickableSentence sentence={t.en} onWordClick={onWordClick} />
                          {isSpeechSupported() && (
                            <button
                              type="button"
                              className="inline-flex ml-1 align-middle text-cyan-600/60 hover:text-cyan-600 cursor-pointer"
                              onClick={() => void speakText(t.en, t.id)}
                              aria-label="朗读"
                            >
                              <Volume2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </p>
                        {t.zh && (
                          <p className="text-xs text-slate-500 mt-1.5 font-medium">{t.zh}</p>
                        )}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>

            <button
              type="button"
              onClick={(e) => toggleScenePracticed(active.sceneKey, e)}
              className={`mt-6 w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm font-black transition-all cursor-pointer border ${
                practiced
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-orange-200 hover:text-[#c65a30]'
              }`}
            >
              {practiced ? (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  已标记练完 · 点击取消
                </>
              ) : (
                <>
                  <Circle className="w-5 h-5" />
                  标记本场景已练完（{turnsLoading ? '…' : `${turns.length} 句`}）
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <section>
      <div className="flex items-baseline justify-between gap-2 mb-3">
        <h2 className="text-sm font-black text-slate-800">{SCENE_LIST_TITLE}</h2>
        <span className="text-[10px] text-slate-400 font-medium shrink-0">共 {allScenes.length} 个 · 按频率排序</span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {allScenes.map((scene) => (
          <div key={scene.slug}>
            <SceneCard scene={scene} onClick={() => setActive(scene)} />
          </div>
        ))}
      </div>
    </section>
  );
}
