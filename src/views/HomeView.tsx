import React, { useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search,
  X,
  ChevronRight,
  Brain,
  Sparkles,
  Move,
  Eye,
  Package,
  Palette,
  Blend,
  Star,
  type LucideIcon,
} from 'lucide-react';
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

type CategoryTile = {
  key: string;
  label: string;
  icon: LucideIcon;
  hoverBorder: string;
  iconBg: string;
  iconText: string;
  countTone: string;
};

const CATEGORY_TILES: CategoryTile[] = [
  {
    key: 'actions',
    label: '动作与方向',
    icon: Move,
    hoverBorder: 'hover:border-cyan-200/80',
    iconBg: 'bg-cyan-50',
    iconText: 'text-cyan-500',
    countTone: 'text-cyan-600/60',
  },
  {
    key: 'picturables',
    label: '可见物/实物',
    icon: Eye,
    hoverBorder: 'hover:border-amber-200/80',
    iconBg: 'bg-amber-50',
    iconText: 'text-amber-500',
    countTone: 'text-amber-600/60',
  },
  {
    key: 'generals',
    label: '普通名词',
    icon: Package,
    hoverBorder: 'hover:border-rose-200/80',
    iconBg: 'bg-rose-50',
    iconText: 'text-rose-500',
    countTone: 'text-rose-600/60',
  },
  {
    key: 'qualities',
    label: '性质词',
    icon: Palette,
    hoverBorder: 'hover:border-purple-200/80',
    iconBg: 'bg-purple-50',
    iconText: 'text-purple-500',
    countTone: 'text-purple-600/60',
  },
  {
    key: 'opposites',
    label: '反义词',
    icon: Blend,
    hoverBorder: 'hover:border-red-200/80',
    iconBg: 'bg-red-50',
    iconText: 'text-red-500',
    countTone: 'text-red-600/60',
  },
];

function SectionTitle({ children, trailing }: { children: React.ReactNode; trailing?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 px-0.5">
      <h2 className="text-[15px] font-black text-slate-800 tracking-tight">{children}</h2>
      {trailing}
    </div>
  );
}

export const HomeView: React.FC<HomeViewProps> = ({
  searchQuery,
  setSearchQuery,
  filteredWords,
  setSelectedWord,
  startOperatorsRoutine,
  setActiveTab,
  loadWordAiContext,
  totalWords,
  setBrowserCategory,
  setBrowserStatus,
}) => {
  const { starredCount, masteredCount, learningCount, progressPercent } = useProgress();

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const w of wordsData) counts[w.category] = (counts[w.category] ?? 0) + 1;
    return counts;
  }, []);

  const handleCategoryClick = useCallback(
    (categoryKey: string) => {
      setBrowserCategory(categoryKey);
      setBrowserStatus('all');
      setActiveTab('browser');
    },
    [setBrowserCategory, setBrowserStatus, setActiveTab],
  );

  const handleClearSearch = useCallback(() => setSearchQuery(''), [setSearchQuery]);

  const handleBrowseAllFromSearch = useCallback(() => {
    setBrowserCategory('all');
    setBrowserStatus('all');
    setActiveTab('browser');
  }, [setBrowserCategory, setBrowserStatus, setActiveTab]);

  const openStarred = useCallback(() => {
    setBrowserCategory('all');
    setBrowserStatus('starred');
    setActiveTab('browser');
  }, [setBrowserCategory, setBrowserStatus, setActiveTab]);

  return (
    <div className="space-y-6 pb-3">
      <header className="px-0.5 pt-0.5">
        <h1 className="text-2xl font-black text-slate-800 tracking-tight">学习中心</h1>
        <p className="text-sm font-normal mt-1.5 tracking-wide bg-gradient-to-r from-slate-400 via-slate-500/75 to-slate-400/55 bg-clip-text text-transparent">
          850 词根 · 场景对话 · 精准检索
        </p>
      </header>

      {/* Search */}
      <div className="relative">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-cyan-400 transition-colors w-[18px] h-[18px]" />
          <input
            type="text"
            placeholder="搜索 850 个核心词汇 (如: hand, warm, build)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-slate-200/90 rounded-2xl py-3.5 pl-11 pr-4 text-sm text-slate-800 font-medium shadow-sm placeholder:font-normal placeholder:text-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15 outline-none transition-all"
          />
          {searchQuery && (
            <button
              onClick={handleClearSearch}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <AnimatePresence>
          {searchQuery.trim().length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-[0_8px_30px_rgba(15,23,42,0.08)] border border-slate-100 z-50 overflow-hidden"
            >
              <div className="px-4 py-2.5 border-b border-slate-50 flex justify-between items-center">
                <span className="text-xs font-semibold text-slate-500">匹配 {filteredWords.length} 词</span>
                <button
                  onClick={handleBrowseAllFromSearch}
                  className="text-xs font-semibold text-[#2f7d4f] hover:underline"
                >
                  浏览全部
                </button>
              </div>
              {filteredWords.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-sm">未找到与 “{searchQuery}” 相关的词汇</div>
              ) : (
                <div className="divide-y divide-slate-50 max-h-56 overflow-y-auto">
                  {filteredWords.map((word) => (
                    <div
                      key={word.id}
                      onClick={() => {
                        setSelectedWord(word);
                        loadWordAiContext(word);
                        setSearchQuery('');
                      }}
                      className="px-4 py-3 hover:bg-slate-50/80 flex items-center justify-between cursor-pointer group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <WordCardVisual word={word} size="inline" />
                        <span className="font-bold text-slate-800 text-sm">{word.word}</span>
                        <span className="text-[10px] text-slate-500 font-medium px-2 py-0.5 bg-slate-100 rounded-full shrink-0">
                          {CATEGORY_LABELS[word.category]?.zh}
                        </span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-[#2f7d4f] shrink-0" />
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Progress */}
      <section className="bg-white rounded-3xl px-5 py-4 border border-slate-200/80 shadow-[0_2px_14px_rgba(15,23,42,0.04)]">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 space-y-1">
            <p className="text-[11px] font-semibold text-emerald-600/85 uppercase tracking-[0.12em]">学习进度</p>
            <p className="text-xl font-black text-slate-800 leading-tight">
              已掌握 <span className="text-emerald-600">{masteredCount}</span>
              <span className="text-slate-400 font-bold text-base"> / {totalWords}</span>
            </p>
            <p className="text-xs text-slate-400 font-medium">
              正在学 {learningCount} · 收藏 {starredCount}
            </p>
          </div>
          <div className="text-right shrink-0 pt-0.5">
            <span className="text-3xl font-black text-[#2f7d4f] tabular-nums leading-none">{progressPercent}%</span>
            <p className="text-[10px] text-slate-400 font-medium mt-1">词汇覆盖率</p>
          </div>
        </div>
        <div className="w-full h-2 bg-emerald-100/40 rounded-full overflow-hidden mt-4">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="h-full bg-gradient-to-r from-[#2f7d4f] to-[#5cb377] rounded-full"
          />
        </div>
      </section>

      {/* Core operators */}
      <section className="space-y-3">
        <SectionTitle
          trailing={
            <span className="text-[11px] font-semibold text-emerald-700/75 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100/80">
              18 词
            </span>
          }
        >
          <span className="inline-flex items-center gap-2">
            <Brain className="w-[18px] h-[18px] text-emerald-500" />
            核心动词
          </span>
        </SectionTitle>
        <button
          type="button"
          onClick={startOperatorsRoutine}
          className="relative w-full h-[7.75rem] sm:h-[8.75rem] rounded-2xl overflow-hidden border border-emerald-100/90 text-left group active:scale-[0.99] transition-transform shadow-sm"
        >
          <img
            alt=""
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuA67Z_foag2kUgf83Cki6FUcrkpIy1uxkVg5KKhduemzlJKdZaVVBnknU6ttRReZHcSdPmgjUxJ0-Hlh8Ob9LwsLnMhuEWghK6m-Nz3nmdVSGR_Z_bqXl41yTfdyG-kXNzY90SD95b6nIL9-rvi9yZFHtfS9GHVLCq3wPWi7t6cfWzgm9CcShrewK756MNR6ifoe3g1VVx4iLJJ8FXJ-iBjP5DcQvB_Qz1_dPf6WoDw-LWuu0bhjsfT5KkAxnWl6Siod6DuFgvvDrws"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/78 via-emerald-900/20 to-transparent flex flex-col justify-end p-5">
            <p className="text-white font-bold text-[17px] flex items-center gap-1.5 leading-tight">
              掌握语言的引擎 <Sparkles className="w-4 h-4 text-amber-300" />
            </p>
            <p className="text-white/88 text-xs leading-relaxed mt-1.5 max-w-[92%]">
              come, get, give, let… 18 个决定 Basic English 句式的核心动词
            </p>
          </div>
        </button>
      </section>

      {/* Categories + starred — grouped panel */}
      <section className="bg-white rounded-3xl border border-slate-200/80 shadow-[0_2px_14px_rgba(15,23,42,0.04)] overflow-hidden">
        <div className="px-5 pt-5 pb-1">
          <SectionTitle>核心词汇分类</SectionTitle>
        </div>

        <div className="grid grid-cols-2 gap-3 p-5 pt-3">
          {CATEGORY_TILES.map(({ key, label, icon: Icon, hoverBorder, iconBg, iconText, countTone }) => (
            <button
              key={key}
              type="button"
              onClick={() => handleCategoryClick(key)}
              className={`bg-slate-50/60 p-4 rounded-2xl border border-slate-100/90 ${hoverBorder} hover:bg-white transition-all cursor-pointer flex flex-col gap-3 active:scale-[0.98] text-left min-h-[5.5rem]`}
            >
              <div className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center ${iconText}`}>
                <Icon className="w-[18px] h-[18px]" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-sm leading-snug">{label}</h3>
                <p className={`text-xs font-semibold tabular-nums mt-1 ${countTone}`}>
                  {categoryCounts[key] ?? 0} 词
                </p>
              </div>
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={openStarred}
          className="w-full flex items-center gap-3 px-5 py-3.5 border-t border-slate-100 bg-amber-50/25 hover:bg-amber-50/45 transition-colors text-left active:scale-[0.995]"
        >
          <div className="w-9 h-9 rounded-xl bg-amber-100/70 flex items-center justify-center shrink-0">
            <Star className="w-4 h-4 text-amber-500 fill-amber-400/35" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-amber-950/90">收藏夹词汇</p>
            <p className="text-xs text-amber-700/55 font-medium mt-0.5">快速进入已标记的词</p>
          </div>
          <span className="text-xs font-semibold text-amber-700/65 tabular-nums shrink-0">{starredCount} 词</span>
          <ChevronRight className="w-4 h-4 text-amber-400/75 shrink-0" />
        </button>
      </section>
    </div>
  );
};
