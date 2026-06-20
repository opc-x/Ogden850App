import React, { useCallback } from 'react';
import { Volume2, Star, Circle } from 'lucide-react';
import type { Word } from '../../types/word';
import WordCardVisual from './WordCardVisual';

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
      e.preventDefault();
      e.stopPropagation();
      onPlaySpeech(word.word);
    },
    [onPlaySpeech, word.word],
  );

  return (
    <div
      onClick={handleSelect}
      className={`rounded-2xl border transition-all cursor-pointer select-none group overflow-hidden hover:shadow-[0_4px_16px_rgba(15,23,42,0.07)] flex items-center ${
        isSelected
          ? 'border-cyan-300 bg-cyan-50/80 shadow-sm'
          : 'border-slate-200/80 bg-white hover:border-slate-300 shadow-sm'
      }`}
    >
      <div className="flex flex-1 min-w-0 items-center gap-3 px-3 py-2.5 sm:px-3.5 sm:py-3">
        <div className="browser-word-card__stage shrink-0">
          <WordCardVisual word={word} size="thumb" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            <h3 className="text-base sm:text-lg font-black text-slate-800 tracking-tight leading-none truncate">
              {word.word}
            </h3>
            {word.ipa && (
              <span className="font-ipa ipa-badge text-[13px] sm:text-sm leading-none shrink-0">
                /{word.ipa}/
              </span>
            )}
            <button
              type="button"
              onClick={handlePlaySpeech}
              className="relative z-20 p-1.5 -m-0.5 text-cyan-600/45 hover:text-white hover:bg-cyan-500 rounded-full transition-colors cursor-pointer shrink-0"
              title="发音"
              aria-label={`朗读 ${word.word}`}
            >
              <Volume2 className="w-3.5 h-3.5" />
            </button>
          </div>

          <p className="text-[11px] sm:text-xs font-semibold text-slate-500 leading-snug line-clamp-2">
            {word.translation}
          </p>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-1.5 pr-3 sm:pr-3.5">
        <div className="flex h-5 w-5 items-center justify-center">
          {isStarred ? (
            <Star
              className="h-5 w-5 text-amber-400 fill-amber-400 drop-shadow-sm"
              strokeWidth={1.75}
            />
          ) : (
            <Star className="h-5 w-5 text-slate-300 fill-slate-50/60" strokeWidth={2.25} />
          )}
        </div>
        <div className="flex h-5 w-5 items-center justify-center">
          {status ? (
            <div
              className={`h-3 w-3 rounded-full ${
                status === 'mastered' ? 'bg-emerald-400' : 'bg-cyan-400'
              } ring-1 ring-white shadow-sm`}
            />
          ) : (
            <Circle className="h-3.5 w-3.5 text-slate-200 fill-white/80" strokeWidth={1.75} />
          )}
        </div>
      </div>
    </div>
  );
});
