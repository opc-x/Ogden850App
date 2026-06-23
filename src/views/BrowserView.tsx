import React, { useState, useMemo, useCallback } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { Search, Star } from 'lucide-react';
import { Word, wordsData, CATEGORY_LABELS } from '../data/wordsList';
import { useLearningStatus, useStarredWords } from '../contexts/ProgressContext';
import { BrowserWordCard } from '../components/word/BrowserWordCard';
import { useGridColumnCount } from '../hooks/useGridColumnCount';

const ROW_HEIGHT = 100;
const ROW_GAP = 6;

const BROWSER_CATEGORIES = [
  'all',
  'operators',
  'actions',
  'picturables',
  'generals',
  'qualities',
  'opposites',
] as const;

interface BrowserViewProps {
  browserCategory: string;
  setBrowserCategory: (val: string) => void;
  browserStatus: 'all' | 'starred' | 'learning' | 'mastered';
  setBrowserStatus: (val: 'all' | 'starred' | 'learning' | 'mastered') => void;
  selectedWord: Word | null;
  setSelectedWord: (word: Word | null) => void;
  playSpeech: (text: string) => void;
  loadWordAiContext: (word: Word) => void;
}

export const BrowserView: React.FC<BrowserViewProps> = ({
  browserCategory,
  setBrowserCategory,
  browserStatus,
  setBrowserStatus,
  selectedWord,
  setSelectedWord,
  playSpeech,
  loadWordAiContext,
}) => {
  const starredWords = useStarredWords();
  const learningStatus = useLearningStatus();
  const [searchQuery, setSearchQuery] = useState('');
  const columnCount = useGridColumnCount();
  const [scrollElement, setScrollElement] = useState<HTMLElement | null>(null);
  const listAnchorRef = useCallback((node: HTMLDivElement | null) => {
    if (!node) return;
    let el: HTMLElement | null = node.parentElement;
    while (el) {
      const { overflowY } = getComputedStyle(el);
      if (overflowY === 'auto' || overflowY === 'scroll') {
        setScrollElement(el);
        return;
      }
      el = el.parentElement;
    }
    setScrollElement(document.documentElement);
  }, []);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const w of wordsData) {
      counts[w.category] = (counts[w.category] ?? 0) + 1;
    }
    return counts;
  }, []);

  const browserList = useMemo(() => {
    return wordsData.filter((w) => {
      if (
        searchQuery &&
        !w.word.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !w.translation.includes(searchQuery)
      ) {
        return false;
      }
      if (browserCategory !== 'all' && w.category !== browserCategory) return false;
      if (browserStatus === 'starred' && !starredWords[w.id]) return false;
      if (browserStatus === 'learning' && learningStatus[w.id] !== 'learning') return false;
      if (browserStatus === 'mastered' && learningStatus[w.id] !== 'mastered') return false;
      return true;
    });
  }, [searchQuery, browserCategory, browserStatus, starredWords, learningStatus]);

  const rowCount = Math.ceil(browserList.length / columnCount) || 0;

  const virtualizer = useVirtualizer({
    count: rowCount,
    getScrollElement: () => scrollElement,
    estimateSize: () => ROW_HEIGHT + ROW_GAP,
    overscan: 4,
  });

  const handleSelectWord = useCallback(
    (word: Word) => {
      setSelectedWord(word);
      loadWordAiContext(word);
    },
    [setSelectedWord, loadWordAiContext],
  );

  const handlePlaySpeech = useCallback((text: string) => playSpeech(text), [playSpeech]);

  const selectedWordId = selectedWord?.id;

  return (
    <div className="space-y-5">
      <header className="px-0.5">
        <h2 className="text-3xl font-black text-slate-800 tracking-tight">850 核心词典</h2>
      </header>

      {/* 筛选控制区 — 与词表分层 */}
      <section
        aria-label="词典筛选"
        className="bg-white rounded-3xl border border-slate-200/90 shadow-[0_2px_14px_rgba(15,23,42,0.06)] p-4 sm:p-5"
      >
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-slate-300 group-focus-within:text-cyan-400 transition-colors" />
          </div>
          <input
            type="text"
            className="block w-full pl-11 pr-4 py-3.5 bg-slate-50/80 border border-slate-200 rounded-2xl text-sm font-medium text-slate-700 placeholder:font-normal placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 focus:bg-white transition-all"
            placeholder="搜索英文词汇或中文含义..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="space-y-3 mt-2.5 pt-3 border-t border-slate-100">
          <div className="overflow-x-auto pb-0.5 hide-scrollbar -mx-0.5 px-0.5">
            <div className="flex gap-2 min-w-max">
              {BROWSER_CATEGORIES.map((cat) => {
                const selected = browserCategory === cat;
                const chipClass =
                  cat === 'all'
                    ? selected
                      ? 'bg-cyan-50 text-cyan-600 border-cyan-200 shadow-sm'
                      : 'bg-slate-50/70 text-slate-500 border-slate-200/80 hover:bg-slate-100/80'
                    : selected
                      ? CATEGORY_LABELS[cat].filterActive
                      : CATEGORY_LABELS[cat].filterIdle;
                return (
                  <button
                    key={cat}
                    onClick={() => setBrowserCategory(cat)}
                    className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer border flex items-center gap-1.5 ${chipClass}`}
                  >
                    {cat !== 'all' ? (
                      <span
                        className={`h-2 w-2 shrink-0 rounded-[2px] ${CATEGORY_LABELS[cat].dot}`}
                        aria-hidden
                      />
                    ) : null}
                    <span>{cat === 'all' ? '全部分类' : CATEGORY_LABELS[cat]?.zh}</span>
                    <span
                      className={`text-[10px] tabular-nums ${
                        selected ? 'opacity-60' : 'text-slate-400'
                      }`}
                    >
                      {cat === 'all' ? wordsData.length : categoryCounts[cat]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-0.5 hide-scrollbar -mx-0.5 px-0.5">
            {(['all', 'starred', 'learning', 'mastered'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setBrowserStatus(status)}
                className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer border flex items-center gap-1.5 shrink-0 ${
                  browserStatus === status
                    ? 'bg-cyan-50 text-cyan-600 border-cyan-200 shadow-sm'
                    : 'bg-slate-50/70 text-slate-500 border-slate-200/80 hover:bg-slate-100/80'
                }`}
              >
                  {status === 'all' && '全状态'}
                  {status === 'starred' && (
                    <>
                      <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                      已收藏
                    </>
                  )}
                  {status === 'learning' && (
                    <>
                      <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-sm" />
                      正在学
                    </>
                  )}
                  {status === 'mastered' && (
                    <>
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-sm" />
                      已掌握
                    </>
                  )}
                </button>
              ))}
          </div>
        </div>
      </section>

      {/* 词表内容区 */}
      <section aria-label="词汇列表" className="space-y-3">
        <div className="flex items-baseline justify-between px-1">
          <h3 className="text-sm font-black text-slate-700">词汇列表</h3>
          <span className="text-xs font-bold text-slate-400 tabular-nums">{browserList.length} 词</span>
        </div>

        <div
          ref={listAnchorRef}
          className="bg-slate-50/90 rounded-3xl border border-slate-200/90 shadow-[0_2px_14px_rgba(15,23,42,0.04)] p-3 sm:p-4 min-h-[min(500px,55vh)] md:min-h-[420px]"
        >
        {browserList.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <Search className="w-12 h-12 mb-4 opacity-20" />
            <p className="font-bold">未找到匹配的词汇</p>
          </div>
        ) : (
          <div
            style={{
              height: `${virtualizer.getTotalSize()}px`,
              width: '100%',
              position: 'relative',
            }}
          >
            {virtualizer.getVirtualItems().map((virtualRow) => {
              const startIdx = virtualRow.index * columnCount;
              const rowWords = browserList.slice(startIdx, startIdx + columnCount);

              return (
                <div
                  key={virtualRow.key}
                  data-index={virtualRow.index}
                  ref={virtualizer.measureElement}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    transform: `translateY(${virtualRow.start}px)`,
                    display: 'grid',
                    gridTemplateColumns: `repeat(${columnCount}, minmax(0, 1fr))`,
                    gap: `${ROW_GAP}px`,
                    paddingBottom: `${ROW_GAP}px`,
                    boxSizing: 'border-box',
                  }}
                >
                  {rowWords.map((word) => (
                    <BrowserWordCard
                      key={word.id}
                      word={word}
                      isStarred={!!starredWords[word.id]}
                      status={learningStatus[word.id]}
                      isSelected={selectedWordId === word.id}
                      onSelect={handleSelectWord}
                      onPlaySpeech={handlePlaySpeech}
                    />
                  ))}
                </div>
              );
            })}
          </div>
        )}
        </div>
      </section>
    </div>
  );
};
