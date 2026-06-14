import React, { useState, useMemo } from 'react';
import { Search, Volume2, Package, Palette, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Word, wordsData, CATEGORY_LABELS } from '../data/wordsList';
import wordAnnotations from '../data/word-annotations.json';
import { useProgress } from '../contexts/ProgressContext';
import OperatorVisual from '../components/OperatorVisual';
import { DirectionGraphic } from '../components/DirectionsVisual';

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
  browserCategory, setBrowserCategory,
  browserStatus, setBrowserStatus,
  selectedWord, setSelectedWord,
  playSpeech, loadWordAiContext
}) => {
  const { starredWords, learningStatus } = useProgress();
  const [searchQuery, setSearchQuery] = useState('');

  const browserList = useMemo(() => {
    return wordsData.filter(w => {
      if (searchQuery && !w.word.toLowerCase().includes(searchQuery.toLowerCase()) && !w.translation.includes(searchQuery)) {
        return false;
      }
      if (browserCategory !== 'all' && w.category !== browserCategory) return false;
      if (browserStatus === 'starred' && !starredWords[w.id]) return false;
      if (browserStatus === 'learning' && learningStatus[w.id] !== 'learning') return false;
      if (browserStatus === 'mastered' && learningStatus[w.id] !== 'mastered') return false;
      return true;
    });
  }, [searchQuery, browserCategory, browserStatus, starredWords, learningStatus]);

  return (
    <div className="space-y-6">
      {/* Dictionary Header */}
      <div>
        <h2 className="text-3xl font-black text-slate-800 tracking-tight">850 核心词典</h2>
        <p className="text-sm text-slate-500 font-medium mt-1">按奥格登原生分类，精准过滤与检索</p>
      </div>

      <div className="flex flex-col gap-4">
        {/* Search */}
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

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 overflow-x-auto pb-1 hide-scrollbar">
            <div className="flex gap-2 min-w-max">
              {['all', 'operators', 'actions', 'things', 'picturables', 'generals', 'qualities', 'opposites'].map(cat => (
                <button
                  key={cat}
                  onClick={() => setBrowserCategory(cat)}
                  className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer border ${
                    browserCategory === cat 
                    ? 'bg-slate-800 text-white border-slate-800 shadow-md' 
                    : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {cat === 'all' ? '全部分类' : CATEGORY_LABELS[cat]?.zh}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-2 sm:shrink-0 overflow-x-auto pb-1 hide-scrollbar">
            {(['all', 'starred', 'learning', 'mastered'] as const).map(status => (
              <button
                key={status}
                onClick={() => setBrowserStatus(status)}
                className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer border ${
                  browserStatus === status
                  ? 'bg-cyan-50 text-cyan-600 border-cyan-200 shadow-sm'
                  : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {status === 'all' && '全状态'}
                {status === 'starred' && '已收藏'}
                {status === 'learning' && '正在学'}
                {status === 'mastered' && '已掌握'}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-slate-50 border border-slate-100 rounded-3xl p-4 sm:p-6 min-h-[500px]">
        {browserList.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <Search className="w-12 h-12 mb-4 opacity-20" />
            <p className="font-bold">未找到匹配的词汇</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5">
            {browserList.map(word => {
              const isStarred = !!starredWords[word.id];
              const status = learningStatus[word.id];

              return (
                <motion.div
                  layout
                  key={word.id}
                  onClick={() => {
                    setSelectedWord(word);
                    loadWordAiContext(word);
                  }}
                  className={`bg-white rounded-2xl sm:rounded-3xl border transition-all cursor-pointer select-none relative group overflow-hidden hover:shadow-[0_4px_20px_rgba(0,0,0,0.05)] ${
                    selectedWord?.id === word.id 
                    ? 'border-cyan-300 bg-cyan-50 shadow-sm' 
                    : 'border-slate-100 hover:border-slate-200 shadow-sm'
                  }`}
                >
                  <div className="p-4 sm:p-5">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100">
                        {CATEGORY_LABELS[word.category]?.zh}
                      </span>
                      {isStarred && <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400 fill-amber-400" />}
                    </div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">{word.word}</h3>
                      <button 
                        onClick={(e) => { e.stopPropagation(); playSpeech(word.word); }}
                        className="p-1 sm:p-1.5 text-cyan-600/50 hover:text-white hover:bg-cyan-500 rounded-full transition-colors cursor-pointer"
                        title="发音"
                      >
                        <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      </button>
                    </div>
                    <p className="text-[11px] sm:text-xs font-bold text-slate-500 truncate">{word.translation}</p>
                    
                    {/* Status Badge */}
                    {status && (
                      <div className="absolute bottom-0 right-0 p-2 sm:p-3">
                        <div className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full ${
                          status === 'mastered' ? 'bg-emerald-400' : 'bg-cyan-400'
                        } shadow-sm ring-2 ring-white`} />
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
