import React, { useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, BookOpen, PenTool, BarChart3, HelpCircle, ArrowRight, X, ChevronRight, Brain, Sparkles, Move, Eye, Package, Palette, Blend, Star } from 'lucide-react';
import { Word, wordsData, CATEGORY_LABELS } from '../data/wordsList';
import { useProgress } from '../contexts/ProgressContext';
import WordCardVisual from '../components/word/WordCardVisual';

interface HomeViewProps {
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  filteredWords: Word[];
  selectedWord: Word | null;
  setSelectedWord: (word: Word | null) => void;
  startOperatorsRoutine: () => void;
  setActiveTab: (tab: string) => void;
  loadWordAiContext: (word: Word) => void;
  totalWords: number;
  setBrowserCategory: (val: string) => void;
  setBrowserStatus: (val: string) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  searchQuery, setSearchQuery, filteredWords,
  selectedWord, setSelectedWord, startOperatorsRoutine,
  setActiveTab, loadWordAiContext, totalWords,
  setBrowserCategory, setBrowserStatus
}) => {
  const { starredWords, learningStatus, masteredCount, learningCount, starredCount, progressPercent } = useProgress();

  const handleCategoryClick = useCallback((categoryKey: string) => {
    setBrowserCategory(categoryKey);
    setBrowserStatus('all');
    setActiveTab('browser');
  }, [setBrowserCategory, setBrowserStatus, setActiveTab]);

  const handleClearSearch = useCallback(() => setSearchQuery(''), [setSearchQuery]);

  const handleBrowseAllFromSearch = useCallback(() => {
    setBrowserCategory('all');
    setBrowserStatus('all');
    setActiveTab('browser');
  }, [setBrowserCategory, setBrowserStatus, setActiveTab]);

  return (
    <>
      {/* TAB 1: HOME PANEL */}
        
          <div className="space-y-6">
            
            {/* Search Section */}
            <div className="relative">
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-cyan-400 transition-colors w-5 h-5" />
                <input 
                  type="text"
                  placeholder="搜索 850 个核心词汇 (如: hand, warm, build)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white backdrop-blur-md border border-slate-200 rounded-2xl py-4 pl-12 pr-4 shadow-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all text-base placeholder-slate-400 text-slate-800 font-medium"
                />
                
                {searchQuery && (
                  <button 
                    onClick={handleClearSearch}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-orange-400 hover:text-orange-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>

              {/* Instant Search Results Dropdown */}
              <AnimatePresence>
                {searchQuery.trim().length > 0 && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-slate-100 z-50 overflow-hidden"
                  >
                    <div className="p-3 border-b border-orange-50/50 flex justify-between items-center bg-orange-50/20">
                      <span className="text-xs font-bold text-orange-850/80">匹配结果 ({filteredWords.length})</span>
                      <button 
                        onClick={handleBrowseAllFromSearch}
                        className="text-xs font-bold text-[#c65a30] hover:underline"
                      >
                        浏览全部
                      </button>
                    </div>
                    {filteredWords.length === 0 ? (
                      <div className="p-8 text-center text-orange-900/40 text-sm font-medium">
                        未找到与 “{searchQuery}” 相关的词汇
                      </div>
                    ) : (
                      <div className="divide-y divide-orange-100/30 max-h-60 overflow-y-auto">
                        {filteredWords.map(word => (
                          <div 
                            key={word.id}
                            onClick={() => {
                              setSelectedWord(word);
                              loadWordAiContext(word);
                              setSearchQuery('');
                            }}
                            className="p-3.5 hover:bg-orange-500/5 flex items-center justify-between cursor-pointer group transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <WordCardVisual word={word} size="inline" />
                              <span className="font-extrabold text-orange-950 text-base">{word.word}</span>
                              <span className="text-xs text-orange-700/80 font-bold px-2.5 py-0.5 bg-orange-100/45 rounded-full">
                                {CATEGORY_LABELS[word.category]?.zh}
                              </span>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-sm text-orange-900/60 font-medium">{word.translation}</span>
                              <ChevronRight className="w-4 h-4 text-orange-300 group-hover:text-[#c65a30] transition-transform group-hover:translate-x-0.5" />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Smart Learning Progress Card */}
            <section className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full blur-3xl"></div>
              <div className="space-y-2 flex-1 relative z-10">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full tracking-wider uppercase border border-emerald-100">学习进度</span>
                  <p className="text-xs text-slate-400 font-bold tracking-widest uppercase">Ogden 850</p>
                </div>
                <h3 className="text-2xl font-black text-slate-800 mt-2">
                  已掌握 <span className="text-emerald-600 text-3xl">{masteredCount}</span> <span className="text-slate-400">/ {totalWords}</span>
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-1">
                  正在学 <span className="text-emerald-500 font-bold">{learningCount}</span> 词 · 
                  已收藏 <span className="text-amber-500 font-bold">{starredCount}</span> 词
                </p>
              </div>
              
              <div className="md:w-64 space-y-2">
                <div className="flex justify-between items-baseline">
                  <span className="text-xs text-orange-900/50 font-semibold">词汇覆盖率</span>
                  <span className="text-3xl font-black text-[#c65a30]">{progressPercent}%</span>
                </div>
                <div className="w-full h-3 bg-orange-100/30 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercent}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    className="h-full bg-gradient-to-r from-[#c65a30] to-[#faa144] rounded-full"
                  />
                </div>
              </div>
            </section>

            {/* Core Operators Section */}
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-orange-950 flex items-center gap-2">
                  <Brain className="w-5 h-5 text-orange-500" />
                  核心动词 <span className="text-xs text-orange-900/50 font-normal">Operators</span>
                </h2>
                <span className="text-xs font-semibold bg-orange-100 text-orange-800 px-3 py-1 rounded-full">
                  18 个关键
                </span>
              </div>
              
              <div 
                onClick={startOperatorsRoutine}
                className="relative w-full h-36 sm:h-52 rounded-2xl overflow-hidden shadow-sm group active:scale-[0.99] hover:shadow-md transition-all duration-300 cursor-pointer border border-orange-150/55"
              >
                <img 
                  alt="Minimal digital workspace learning zen"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuA67Z_foag2kUgf83Cki6FUcrkpIy1uxkVg5KKhduemzlJKdZaVVBnknU6ttRReZHcSdPmgjUxJ0-Hlh8Ob9LwsLnMhuEWghK6m-Nz3nmdVSGR_Z_bqXl41yTfdyG-kXNzY90SD95b6nIL9-rvi9yZFHtfS9GHVLCq3wPWi7t6cfWzgm9CcShrewK756MNR6ifoe3g1VVx4iLJJ8FXJ-iBjP5DcQvB_Qz1_dPf6WoDw-LWuu0bhjsfT5KkAxnWl6Siod6DuFgvvDrws"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-orange-950/80 via-orange-900/40 to-transparent flex flex-col justify-end p-6">
                  <p className="text-white font-extrabold text-xl sm:text-2xl mb-1 flex items-center gap-2">
                    掌握语言的引擎 <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
                  </p>
                  <p className="text-white/90 text-xs sm:text-sm leading-relaxed max-w-xl font-medium">
                    点击强化演练这 18 个决定 Basic English 句式结构的核心动词（如 come, get, give, let 等），松弛掌控句法灵魂。
                  </p>
                </div>
              </div>
            </section>

            {/* Categorized Bento Grid */}
            <section className="space-y-4">
              <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
                核心词汇分类
                <div className="h-px bg-slate-200 flex-1 ml-2"></div>
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                
                {/* 动作词 */}
                <div 
                  onClick={() => handleCategoryClick('actions')}
                  className="bg-white p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-100 hover:border-cyan-200 transition-all cursor-pointer flex flex-col gap-3 sm:gap-4 active:scale-95 group shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_20px_rgba(6,182,212,0.1)]"
                >
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-cyan-50 flex items-center justify-center text-cyan-500 border border-cyan-100">
                    <Move className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-800 text-sm sm:text-base group-hover:text-cyan-600 transition-colors">动作与方向</h3>
                    <p className="text-[10px] text-cyan-600/60 font-black uppercase mt-0.5 sm:mt-1 tracking-widest">100 Words</p>
                  </div>
                </div>

                {/* 可见物 */}
                <div 
                  onClick={() => handleCategoryClick('picturables')}
                  className="bg-white p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-100 hover:border-amber-200 transition-all cursor-pointer flex flex-col gap-3 sm:gap-4 active:scale-95 group shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_20px_rgba(245,158,11,0.1)]"
                >
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-amber-50 flex items-center justify-center text-amber-500 border border-amber-100">
                    <Eye className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-800 text-sm sm:text-base group-hover:text-amber-600 transition-colors">可见物/实物</h3>
                    <p className="text-[10px] text-amber-600/60 font-black uppercase mt-0.5 sm:mt-1 tracking-widest">200 Words</p>
                  </div>
                </div>

                {/* 普通名词 */}
                <div 
                  onClick={() => handleCategoryClick('generals')}
                  className="col-span-2 md:col-span-1 bg-white p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-100 hover:border-rose-200 transition-all cursor-pointer flex items-center md:flex-col md:items-start justify-between md:justify-center gap-3 sm:gap-4 active:scale-95 group shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_20px_rgba(244,63,94,0.1)]"
                >
                  <div className="flex items-center md:flex-col md:items-start gap-3 sm:gap-4">
                    <div className="w-12 h-12 md:w-10 md:h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-rose-50 flex items-center justify-center text-rose-500 border border-rose-100">
                      <Package className="w-6 h-6 md:w-5 md:h-5 sm:w-6 sm:h-6" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-slate-800 text-base sm:text-lg md:text-base group-hover:text-rose-600 transition-colors">普通名词</h3>
                      <p className="text-[10px] text-rose-600/60 font-black uppercase mt-0.5 sm:mt-1 tracking-widest">400 Words</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-slate-300 group-hover:text-rose-400 group-hover:translate-x-1 transition-all md:hidden" />
                </div>

                {/* 性质词 */}
                <div 
                  onClick={() => handleCategoryClick('qualities')}
                  className="bg-white p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-100 hover:border-purple-200 transition-all cursor-pointer flex flex-col gap-3 sm:gap-4 active:scale-95 group shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_20px_rgba(168,85,247,0.1)]"
                >
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-purple-50 flex items-center justify-center text-purple-500 border border-purple-100">
                    <Palette className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-800 text-sm sm:text-base group-hover:text-purple-600 transition-colors">性质词</h3>
                    <p className="text-[10px] text-purple-600/60 font-black uppercase mt-0.5 sm:mt-1 tracking-widest">100 Words</p>
                  </div>
                </div>

                {/* 反义词 */}
                <div 
                  onClick={() => handleCategoryClick('opposites')}
                  className="bg-white p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-100 hover:border-red-200 transition-all cursor-pointer flex flex-col gap-3 sm:gap-4 active:scale-95 group shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_20px_rgba(239,68,68,0.1)]"
                >
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-red-50 flex items-center justify-center text-red-500 border border-red-100">
                    <Blend className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-800 text-sm sm:text-base group-hover:text-red-600 transition-colors">反义词</h3>
                    <p className="text-[10px] text-red-600/60 font-black uppercase mt-0.5 sm:mt-1 tracking-widest">50 Words</p>
                  </div>
                </div>

                {/* 拼词练习 */}
                <div
                  onClick={() => setActiveTab('practice')}
                  className="bg-white p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-100 hover:border-emerald-200 transition-all cursor-pointer flex flex-col gap-3 sm:gap-4 active:scale-95 group shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_20px_rgba(16,185,129,0.1)]"
                >
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-500 border border-emerald-100">
                    <PenTool className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-800 text-sm sm:text-base group-hover:text-emerald-600 transition-colors">拼词练习</h3>
                    <p className="text-[10px] text-emerald-600/60 font-black uppercase mt-0.5 sm:mt-1 tracking-widest">DAILY DRILL</p>
                  </div>
                </div>

                {/* Navigation quick start card */}
                <div
                  onClick={() => {
                    setBrowserCategory('all');
                    setBrowserStatus('starred');
                    setActiveTab('browser');
                  }}
                  className="bg-amber-50 p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-amber-100 hover:bg-amber-100 transition-all cursor-pointer flex items-center justify-between active:scale-95 group shadow-sm"
                >
                  <div>
                    <h3 className="font-extrabold text-amber-700 text-sm sm:text-base">收藏夹词汇</h3>
                    <p className="text-[10px] text-amber-700/60 font-black uppercase mt-0.5 sm:mt-1 tracking-widest">{starredCount} WORDS</p>
                  </div>
                  <Star className="w-6 h-6 sm:w-7 sm:h-7 text-amber-500 drop-shadow-sm" />
                </div>

              </div>
            </section>

          </div>
        
    </>
  );
};
