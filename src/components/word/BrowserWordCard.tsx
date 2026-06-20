import React, { useCallback } from 'react';
import { Volume2, Star } from 'lucide-react';
import type { Word } from '../../types/word';
import WordCardVisual, { WORD_THUMB_INNER, WORD_THUMB_OUTER } from './WordCardVisual';

export interface BrowserWordCardProps {
  word: Word;
  isStarred: boolean;
  status: 'learning' | 'mastered' | undefined;
  isSelected: boolean;
  onSelect: (word: Word) => void;
  onPlaySpeech: (text: string) => void;
}

export const BrowserWordCard = React.memo(function BrowserWordCard({
  word,
  isStarred,
  status,
  isSelected,
  onSelect,
  onPlaySpeech,
}: BrowserWordCardProps) {
  const handleSelect = useCallback(() => onSelect(word), [onSelect, word]);
  const handlePlaySpeech = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onPlaySpeech(word.word);
    },
    [onPlaySpeech, word.word],
  );

  return (
    <div
      onClick={handleSelect}
      className={`bg-white rounded-2xl sm:rounded-3xl border transition-all cursor-pointer select-none relative group overflow-hidden hover:shadow-[0_4px_20px_rgba(0,0,0,0.05)] ${
        isSelected
          ? 'border-cyan-300 bg-cyan-50 shadow-sm'
          : 'border-slate-100 hover:border-slate-200 shadow-sm'
      }`}
    >
      <div className="flex w-full p-4 sm:p-5 items-center">
        <div className={WORD_THUMB_OUTER}>
          <div className={WORD_THUMB_INNER}>
            <WordCardVisual word={word} size="thumb" />
          </div>
        </div>

        <div className="flex-1 min-w-0 flex flex-col justify-center py-1">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2 pr-2">
              <div className="flex items-baseline gap-2">
                <h3 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">{word.word}</h3>
                {word.ipa && (
                  <span className="text-sm sm:text-base font-semibold text-slate-400 font-mono tracking-tight">
                    /{word.ipa}/
                  </span>
                )}
              </div>
              <button
                onClick={handlePlaySpeech}
                className="p-1 sm:p-1.5 text-cyan-600/50 hover:text-white hover:bg-cyan-500 rounded-full transition-colors cursor-pointer shrink-0"
                title="发音"
              >
                <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            </div>

            <div className="flex items-center gap-2 shrink-0 self-start mt-1">
              {isStarred ? (
                <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
              ) : (
                <Star className="w-4 h-4 text-slate-200" />
              )}
              {status ? (
                <div
                  className={`w-2.5 h-2.5 rounded-full ${
                    status === 'mastered' ? 'bg-emerald-400' : 'bg-cyan-400'
                  } shadow-sm ring-2 ring-white`}
                />
              ) : (
                <div className="w-2.5 h-2.5 rounded-full border-[2px] border-slate-200 bg-transparent" />
              )}
            </div>
          </div>

          <p className="text-[11px] sm:text-xs font-bold text-slate-500 mt-1 line-clamp-2">{word.translation}</p>
        </div>
      </div>
    </div>
  );
});
