import React, { useState, useMemo, useCallback, useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { Search, Star } from 'lucide-react';
import { Word, wordsData, CATEGORY_LABELS } from '../data/wordsList';
import { useLearningStatus, useStarredWords } from '../contexts/ProgressContext';
import { BrowserWordCard } from '../components/word/BrowserWordCard';
import { useGridColumnCount } from '../hooks/useGridColumnCount';

const ROW_HEIGHT = 118;
const ROW_GAP = 14;

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
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-black text-slate-800 tracking-tight">850 核心词典</h2>
        <p className="text-sm text-slate-500 font-medium mt-1">按奥格登原生分类，精准过滤与检索</p>
      </div>

      <div className="flex flex-col gap-4">
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-slate-400 group-focus-within:text-cyan-500 transition-colors" />
          </div>
          <input
            type="text"
            className="block w-full pl-11 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl text-sm font-bold placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all shadow-sm"
            placeholder="搜索英文词汇或中文含义..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 overflow-x-auto pb-1 hide-scrollbar">
            <div className="flex gap-2 min-w-max">
              {['all', 'operators', 'actions', 'picturables', 'generals', 'qualities', 'opposites'].map(
                (cat) => (
                  <button
                    key={cat}
                    onClick={() => setBrowserCategory(cat)}
                    className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer border flex items-center gap-1.5 ${
                      browserCategory === cat
                        ? 'bg-cyan-50 text-cyan-600 border-cyan-200 shadow-sm'
                        : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <span>{cat === 'all' ? '全部分类' : CATEGORY_LABELS[cat]?.zh}</span>
                    {cat === 'all' && (
                      <span
                        className={`text-[10px] ${browserCategory === cat ? 'text-cyan-600/60' : 'text-slate-400'}`}
                      >
                        850
                      </span>
                    )}
                  </button>
                ),
              )}
            </div>
          </div>
          <div className="flex gap-2 sm:shrink-0 overflow-x-auto pb-1 hide-scrollbar">
            {(['all', 'starred', 'learning', 'mastered'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setBrowserStatus(status)}
                className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer border flex items-center gap-1.5 ${
                  browserStatus === status
                    ? 'bg-cyan-50 text-cyan-600 border-cyan-200 shadow-sm'
                    : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
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
      </div>

      <div
        ref={listAnchorRef}
        className="bg-slate-50 border border-slate-100 rounded-3xl p-4 sm:p-6 min-h-[500px]"
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
    </div>
  );
};
