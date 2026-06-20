import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import {
  Volume2,
  Star,
  X,
  BookMarked,
  RefreshCw,
  CheckCircle2,
  GraduationCap,
  Languages,
} from 'lucide-react';
import { Word, CATEGORY_LABELS } from '../../types/word';
import type { GuideSentence } from '../../types/vocab';
import WordCardVisual from './WordCardVisual';
import { speakGuideSentence } from '../../data/speak';

function guideSentences(guide: { guide_sentences?: GuideSentence[]; sentences?: GuideSentence[] }): GuideSentence[] {
  return guide.guide_sentences ?? guide.sentences ?? [];
}

function partSurface(p: GuideSentence['parts'][number] | [string, string]): string {
  if (Array.isArray(p)) return String(p[0]);
  return p.surface ?? (p as { chunk?: string }).chunk ?? '';
}

function partRole(p: GuideSentence['parts'][number] | [string, string]): string {
  if (Array.isArray(p)) return String(p[1] ?? 'misc');
  return String(p.role ?? 'misc');
}

function WordHeroStage({ word }: { word: Word }) {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-slate-50 via-white to-white border border-slate-100/80 px-6 py-7 sm:py-8">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-cyan-50/40 to-transparent" />
      <div className="relative mx-auto w-full max-w-[13.5rem] sm:max-w-[15rem] aspect-square flex items-center justify-center">
        <WordCardVisual word={word} size="detail" />
      </div>
    </div>
  );
}

function HookAside({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50/60 px-4 py-3.5">
      <p className="text-[10px] font-bold text-slate-400 tracking-wide mb-1.5">一秒秒懂</p>
      {children}
    </div>
  );
}

function StatusActionButton({
  active,
  activeClass,
  inactiveClass,
  icon,
  label,
  onClick,
}: {
  active: boolean;
  activeClass: string;
  inactiveClass: string;
  icon: React.ReactNode;
  label: string;
  onClick: (e: React.MouseEvent) => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 h-12 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-[0.98] ${
        active ? activeClass : inactiveClass
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

interface WordDetailModalProps {
  selectedWord: Word;
  dynamicGuide: any;
  generatingForId: string | null;
  starredWords: Record<string, boolean>;
  learningStatus: Record<string, 'learning' | 'mastered'>;
  onClose: () => void;
  onToggleStar: (id: string, e?: React.MouseEvent) => void;
  onSetStatus: (id: string, status: 'learning' | 'mastered' | null, e?: React.MouseEvent) => void;
  onPlaySpeech: (text: string) => void;
  onLoadContext: (word: Word) => void;
}

export const WordDetailModal: React.FC<WordDetailModalProps> = ({
  selectedWord,
  dynamicGuide,
  generatingForId,
  starredWords,
  learningStatus,
  onClose,
  onToggleStar,
  onSetStatus,
  onPlaySpeech,
  onLoadContext,
}) => {
  const isLearning = learningStatus[selectedWord.id] === 'learning';
  const isMastered = learningStatus[selectedWord.id] === 'mastered';
  const [revealedCn, setRevealedCn] = useState<Set<number>>(() => new Set());

  useEffect(() => {
    setRevealedCn(new Set());
  }, [selectedWord.id]);

  const toggleCnReveal = (idx: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setRevealedCn((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 select-none">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/55 backdrop-blur-[2px]"
      />

      <motion.div
        initial={{ y: '100%', scale: 0.98, opacity: 0 }}
        animate={{ y: 0, scale: 1, opacity: 1 }}
        exit={{ y: '100dvh', scale: 0.98, opacity: 0 }}
        transition={{ type: 'spring', damping: 28, stiffness: 300, mass: 0.8 }}
        className="relative w-full sm:max-w-xl bg-white sm:rounded-[1.75rem] rounded-t-[1.75rem] shadow-[0_24px_64px_-20px_rgba(15,23,42,0.35)] border border-slate-200/80 overflow-hidden max-h-[88vh] sm:max-h-[90vh] flex flex-col"
      >
        <div className="w-full flex justify-center pt-3 pb-1 shrink-0">
          <div className="w-10 h-1 rounded-full bg-slate-200" />
        </div>

        <header className="shrink-0 px-5 sm:px-7 pb-4 flex justify-between items-start gap-4 border-b border-slate-100">
          <div className="min-w-0 space-y-2.5">
            <span className="inline-flex text-[10px] font-bold text-cyan-700 bg-cyan-50 px-2 py-0.5 rounded-md border border-cyan-100">
              {CATEGORY_LABELS[selectedWord.category]?.zh}
            </span>

            <div className="flex flex-wrap items-end gap-x-2.5 gap-y-1">
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-none">
                {selectedWord.word}
              </h2>
              {selectedWord.ipa && (
                <span className="font-ipa ipa-badge text-base sm:text-lg pb-0.5">
                  /{selectedWord.ipa}/
                </span>
              )}
              <button
                type="button"
                onClick={() => onPlaySpeech(selectedWord.word)}
                className="p-2 bg-cyan-500 text-white hover:bg-cyan-600 transition-colors rounded-xl shadow-sm shadow-cyan-500/25 active:scale-95 cursor-pointer"
                title="朗读发音"
              >
                <Volume2 className="w-4 h-4" />
              </button>
            </div>

            <p className="text-base sm:text-lg font-semibold text-slate-500 leading-snug">{selectedWord.translation}</p>
          </div>

          <div className="flex gap-1.5 shrink-0">
            <button
              type="button"
              onClick={(e) => onToggleStar(selectedWord.id, e)}
              className="p-2 text-slate-400 hover:text-amber-500 hover:bg-amber-50 rounded-xl transition-colors cursor-pointer"
            >
              <Star className={`w-5 h-5 ${starredWords[selectedWord.id] ? 'fill-amber-400 text-amber-400' : ''}`} />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </header>

        <div className="flex-1 min-h-0 overflow-y-auto overscroll-y-contain px-5 sm:px-7 py-5 space-y-5">
          {dynamicGuide ? (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              <WordHeroStage word={selectedWord} />
              <HookAside>
                <div className="text-[13px] sm:text-sm text-slate-600 leading-relaxed font-medium space-y-1.5">
                  {(dynamicGuide.hook ?? '')
                    .split('\n')
                    .filter((line) => line.trim())
                    .map((line: string, i: number) => (
                      <p key={i}>{line}</p>
                    ))}
                </div>
              </HookAside>
            </motion.div>
          ) : generatingForId === selectedWord.id ? (
            <div className="space-y-4">
              <WordHeroStage word={selectedWord} />
              <div className="rounded-2xl border border-slate-100 bg-slate-50/60 px-4 py-3.5 animate-pulse space-y-2">
                <div className="h-3 bg-slate-200 rounded w-16" />
                <div className="h-3 bg-slate-100 rounded w-full" />
                <div className="h-3 bg-slate-100 rounded w-4/5" />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <WordHeroStage word={selectedWord} />
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 px-4 py-4 text-center space-y-3">
                <p className="text-sm text-slate-500 font-medium">解析尚未加载，或网络已断开</p>
                <button
                  type="button"
                  onClick={() => onLoadContext(selectedWord)}
                  className="px-5 py-2.5 bg-[#c65a30] text-white font-bold text-sm rounded-xl hover:bg-[#b5522c] active:scale-95 transition-all cursor-pointer inline-flex items-center gap-2 shadow-sm shadow-orange-500/20"
                >
                  <RefreshCw className="w-4 h-4" />
                  立刻加载
                </button>
              </div>
            </div>
          )}

          {dynamicGuide && (
            <section className="space-y-3 pt-1">
              <h3 className="text-[11px] font-bold text-slate-400 tracking-wide flex items-center gap-1.5">
                <BookMarked className="w-3.5 h-3.5 text-cyan-500" />
                绝佳搭配例句
              </h3>
              <div className="space-y-2.5">
                {guideSentences(dynamicGuide).map((item, idx) => {
                  const cnVisible = revealedCn.has(idx);
                  return (
                    <div
                      key={idx}
                      className="w-full text-left p-4 rounded-2xl bg-white border border-slate-200/90 hover:border-slate-300/80 transition-colors"
                    >
                      <div className="flex items-start gap-2.5">
                        <p className="flex-1 min-w-0 text-[15px] font-bold text-slate-800 leading-snug">
                          {item.parts?.length
                            ? item.parts.map((p, i) => {
                                const surface = partSurface(p as GuideSentence['parts'][number] | [string, string]);
                                const words = surface.replace(/[^a-zA-Z\s]/g, '').toLowerCase().split(/\s+/);
                                const isTarget = words.includes(selectedWord.word.toLowerCase());
                                return (
                                  <span
                                    key={i}
                                    className={isTarget ? 'text-[#c65a30]' : ''}
                                  >
                                    {surface}{' '}
                                  </span>
                                );
                              })
                            : item.en}
                        </p>
                        <div className="flex items-center gap-0.5 shrink-0 pt-0.5">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              speakGuideSentence(selectedWord.id, idx, item.en);
                            }}
                            className="p-1.5 rounded-lg text-slate-300 hover:text-slate-500 hover:bg-slate-50 transition-colors cursor-pointer active:scale-95"
                            title="朗读例句"
                          >
                            <Volume2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => toggleCnReveal(idx, e)}
                            className={`p-1.5 rounded-lg transition-colors cursor-pointer active:scale-95 ${
                              cnVisible
                                ? 'text-slate-400 bg-slate-50'
                                : 'text-slate-300 hover:text-slate-400 hover:bg-slate-50'
                            }`}
                            title={cnVisible ? '隐藏中文' : '看中文'}
                            aria-pressed={cnVisible}
                          >
                            <Languages
                              className={`w-3.5 h-3.5 ${cnVisible ? 'fill-slate-200/80' : ''}`}
                            />
                          </button>
                        </div>
                      </div>
                      {cnVisible && (
                        <p className="mt-2 text-xs text-slate-400 leading-relaxed">{item.cn}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          )}
        </div>

        <footer className="shrink-0 px-5 sm:px-7 py-4 border-t border-slate-100 bg-white/95 backdrop-blur-sm flex gap-3 pb-safe">
          <StatusActionButton
            active={isLearning}
            label={isLearning ? '学习中 ✓' : '标记学习中'}
            icon={<GraduationCap className="w-4 h-4" />}
            onClick={(e) => onSetStatus(selectedWord.id, isLearning ? null : 'learning', e)}
            activeClass="bg-cyan-500 text-white shadow-md shadow-cyan-500/30 ring-2 ring-cyan-100"
            inactiveClass="bg-slate-100 text-slate-700 border border-slate-200 hover:bg-cyan-50 hover:text-cyan-700 hover:border-cyan-200"
          />
          <StatusActionButton
            active={isMastered}
            label={isMastered ? '已掌握 ✓' : '标记已掌握'}
            icon={<CheckCircle2 className="w-4 h-4" />}
            onClick={(e) => onSetStatus(selectedWord.id, isMastered ? null : 'mastered', e)}
            activeClass="bg-emerald-500 text-white shadow-md shadow-emerald-500/30 ring-2 ring-emerald-100"
            inactiveClass="bg-slate-100 text-slate-700 border border-slate-200 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200"
          />
        </footer>
      </motion.div>
    </div>
  );
};
