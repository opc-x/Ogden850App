import { useState, useEffect, type MouseEvent } from 'react';
import { Volume2, ChevronLeft, BookOpen, RefreshCw, CheckCircle2, Circle, Languages } from 'lucide-react';
import type { SceneCatalogItem } from '../../types/scene';
import { useSceneCatalog } from '../../hooks/useSceneCatalog';
import { useSceneDialogues } from '../../hooks/useSceneDialogues';
import { usePracticedScenes, useProgressActions } from '../../contexts/ProgressContext';
import { ClickableSentence } from '../word/ClickableSentence';
import { OgdenCategoryLegend } from '../word/OgdenCategoryLegend';
import { speakText, isSpeechSupported } from '../../data/speak';
import { SceneCover } from './SceneCover';
import { SceneCard } from './SceneCard';
import { SceneStatsSummary } from './SceneStatsSummary';
import { SCENE_LIST_TITLE } from '../../data/marketing';

interface SceneDialoguePanelProps {
  onWordClick?: (wordId: string) => void;
  onSceneDetailChange?: (open: boolean) => void;
}

export function SceneDialoguePanel({ onWordClick, onSceneDetailChange }: SceneDialoguePanelProps) {
  const { scenes: allScenes, stats, loading: catalogLoading, error: catalogError } = useSceneCatalog();
  const practicedScenes = usePracticedScenes();
  const { toggleScenePracticed } = useProgressActions();
  const [active, setActive] = useState<SceneCatalogItem | null>(null);
  const { turns, loading: turnsLoading, error: turnsError } = useSceneDialogues(active?.sceneKey ?? null);
  const [revealedZh, setRevealedZh] = useState<Set<string>>(() => new Set());

  useEffect(() => {
    onSceneDetailChange?.(active !== null);
  }, [active, onSceneDetailChange]);

  useEffect(() => {
    setRevealedZh(new Set());
  }, [active?.sceneKey]);

  const toggleZhReveal = (turnId: string, e: MouseEvent) => {
    e.stopPropagation();
    setRevealedZh((prev) => {
      const next = new Set(prev);
      if (next.has(turnId)) next.delete(turnId);
      else next.add(turnId);
      return next;
    });
  };

  if (catalogLoading) {
    return (
      <div className="flex justify-center py-16">
        <RefreshCw className="w-6 h-6 animate-spin text-emerald-400" />
      </div>
    );
  }

  if (catalogError) {
    return <p className="text-sm text-rose-600 text-center py-8">{catalogError}</p>;
  }

  if (active) {
    const practiced = Boolean(practicedScenes[active.sceneKey]);
    return (
      <div className="flex flex-col gap-3 flex-1 min-h-0">
        <button
          type="button"
          onClick={() => setActive(null)}
          className="shrink-0 flex items-center gap-1.5 text-sm font-bold text-[#2f7d4f] cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
          返回全部 {allScenes.length} 场景
        </button>

        <div className="flex flex-col flex-1 min-h-0 bg-white border border-emerald-100 rounded-3xl overflow-hidden shadow-sm">
          <SceneCover
            slug={active.slug}
            gradient={active.gradient}
            titleZh={active.titleZh}
            overlayTitle={active.titleZh}
            overlayMeta={turnsLoading ? '…' : `${turns.length} 句`}
            className="aspect-[5/2] w-full shrink-0 rounded-none"
          />

          <div className="shrink-0 border-b border-slate-100/80 px-4 py-2">
            <div className="flex items-center justify-between gap-2">
              <p className="text-[10px] text-slate-400 flex items-center gap-1.5 min-w-0">
                <BookOpen className="w-3 h-3 shrink-0" />
                点词查释义 · 支持朗读跟读
              </p>
              <OgdenCategoryLegend variant="inline" />
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain px-4 py-3">
            {turnsError && (
              <p className="text-xs text-rose-500 mb-2">{turnsError}</p>
            )}

            {turnsLoading ? (
              <div className="space-y-2.5 animate-pulse">
                {[0, 1, 2].map((i) => (
                  <div key={i} className={`flex gap-2 ${i % 2 ? 'flex-row-reverse' : ''}`}>
                    <div className="h-7 w-7 shrink-0 rounded-full bg-slate-100" />
                    <div className={`h-12 rounded-xl bg-slate-100 ${i % 2 ? 'w-[58%]' : 'w-[72%]'}`} />
                  </div>
                ))}
              </div>
            ) : (
            <ul className="space-y-2.5">
              {turns.map((t) => {
                const zhVisible = revealedZh.has(t.id);
                const speechBtn =
                  'inline-flex items-center justify-center p-0 min-w-[18px] min-h-[18px] rounded transition-colors cursor-pointer active:scale-95 align-middle';
                const hintBtn =
                  'inline-flex items-center justify-center p-0 min-w-[16px] min-h-[16px] rounded transition-colors cursor-pointer active:scale-95 align-middle';
                return (
                  <li key={t.id}>
                    <div className={`flex items-center gap-2.5 ${t.speaker === 'A' ? '' : 'flex-row-reverse'}`}>
                      <div
                        className={`shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-[11px] font-black ${
                          t.speaker === 'A' ? 'bg-cyan-100 text-cyan-700' : 'bg-emerald-100 text-[#2f7d4f]'
                        }`}
                      >
                        {t.speakerZh}
                      </div>
                      <div
                        className={`min-w-0 max-w-[calc(100%-3rem)] rounded-xl border px-2.5 py-1.5 ${
                          t.speaker === 'A'
                            ? 'bg-slate-50 border-slate-200 rounded-tl-sm'
                            : 'bg-[#fff8f5] border-emerald-100 rounded-tr-sm'
                        }`}
                      >
                        <p className="text-[11px] font-medium text-slate-800 leading-[1.45]">
                          <ClickableSentence sentence={t.en} onWordClick={onWordClick} />
                          <span className="inline-flex items-center gap-0.5 ml-2 align-middle whitespace-nowrap">
                            {isSpeechSupported() && (
                              <button
                                type="button"
                                className={`${speechBtn} text-cyan-600/65 hover:text-cyan-600 hover:bg-cyan-50/60`}
                                onClick={() => void speakText(t.en, t.id)}
                                aria-label="朗读"
                                title="朗读"
                              >
                                <Volume2 className="w-3.5 h-3.5" strokeWidth={2} />
                              </button>
                            )}
                            {t.zh ? (
                              <button
                                type="button"
                                onClick={(e) => toggleZhReveal(t.id, e)}
                                className={`${hintBtn} ${
                                  zhVisible
                                    ? 'text-slate-400 bg-slate-100/70'
                                    : 'text-slate-300 hover:text-slate-400 hover:bg-slate-100/50'
                                }`}
                                title={zhVisible ? '隐藏中文' : '看中文'}
                                aria-pressed={zhVisible}
                                aria-label={zhVisible ? '隐藏中文' : '看中文'}
                              >
                                <Languages className={`w-3 h-3 ${zhVisible ? 'fill-slate-200/80' : ''}`} />
                              </button>
                            ) : null}
                          </span>
                        </p>
                        {zhVisible && t.zh ? (
                          <p className="mt-1.5 text-[11px] text-slate-400 leading-relaxed">{t.zh}</p>
                        ) : null}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
            )}

            {!turnsLoading && (
            <button
              type="button"
              onClick={(e) => toggleScenePracticed(active.sceneKey, e)}
              className={`mt-6 w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm font-black transition-all cursor-pointer border ${
                practiced
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-emerald-200 hover:text-[#2f7d4f]'
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
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <section>
      <SceneStatsSummary />
      <div className="flex items-baseline justify-between gap-2 mb-3">
        <h2 className="text-base font-black text-slate-800">{SCENE_LIST_TITLE}</h2>
        <span className="text-[10px] text-slate-400 font-medium shrink-0 tabular-nums">
          共 {allScenes.length} 场景
          {stats ? ` · ${stats.dialogueReady.toLocaleString()} 句` : ''} · 按频率排序
        </span>
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
