import React from 'react';
import { motion } from 'motion/react';
import { 
  Volume2, 
  Star, 
  X, 
  Sparkles, 
  BookMarked,
  RefreshCw,
  CheckCircle,
  Activity
} from 'lucide-react';
import { Word, CATEGORY_LABELS } from '../../data/wordsList';
import type { GuideSentence } from '../../types/vocab';
import WordCardVisual from './WordCardVisual';

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
  onLoadContext
}) => {
  const isLearning = learningStatus[selectedWord.id] === 'learning';
  const isMastered = learningStatus[selectedWord.id] === 'mastered';

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 select-none">
      {/* Backdrop cover */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs"
      />
      
      {/* Modal Box */}
      <motion.div 
        initial={{ y: '100%', scale: 0.95, opacity: 0 }}
        animate={{ y: 0, scale: 1, opacity: 1 }}
        exit={{ y: '100dvh', scale: 0.95, opacity: 0 }}
        transition={{ type: 'spring', damping: 28, stiffness: 300, mass: 0.8 }}
        className="relative w-full sm:max-w-xl bg-white sm:rounded-3xl rounded-t-[2.5rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] border border-slate-100 overflow-hidden max-h-[85vh] sm:max-h-[90vh] flex flex-col"
      >
        {/* Drag handle */}
        <div className="w-full flex justify-center pt-3 pb-1">
          <div className="w-12 h-1.5 bg-slate-300 rounded-full"></div>
        </div>
        
        {/* Cover/Splash area */}
        <div className="bg-white px-6 sm:px-8 pt-6 sm:pt-8 pb-2 flex justify-between items-start">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-[10px] sm:text-xs font-black text-cyan-600 uppercase tracking-wider bg-cyan-50 px-2.5 py-0.5 rounded-full border border-cyan-200">
                {CATEGORY_LABELS[selectedWord.category]?.zh}
              </span>
            </div>
            
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-4xl sm:text-5xl font-black text-slate-800 tracking-tight">{selectedWord.word}</h2>
              {selectedWord.ipa && (
                <span className="text-lg sm:text-xl font-semibold text-slate-400 font-mono tracking-tight self-end mb-1 sm:mb-1.5">
                  /{selectedWord.ipa}/
                </span>
              )}
              <button 
                onClick={() => onPlaySpeech(selectedWord.word)}
                className="p-2 bg-cyan-50 text-cyan-600 hover:text-white hover:bg-cyan-500 transition-all rounded-full shadow-sm active:scale-90 cursor-pointer border border-cyan-200 ml-1"
                title="朗读发音"
              >
                <Volume2 className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>

            <p className="text-xl sm:text-2xl font-black text-slate-600 tracking-tight pt-1">{selectedWord.translation}</p>
          </div>

          <div className="flex gap-2 shrink-0">
            {/* Star toggle button */}
            <button 
              onClick={(e) => onToggleStar(selectedWord.id, e)}
              className="p-2 bg-white text-slate-500 hover:text-amber-500 hover:bg-slate-50 rounded-full shadow-sm active:scale-90 transition-all border border-slate-200 cursor-pointer"
            >
              <Star className={`w-5 h-5 ${starredWords[selectedWord.id] ? 'fill-amber-400 text-amber-400' : ''}`} />
            </button>
            {/* Close button */}
            <button 
              onClick={onClose}
              className="p-2 bg-white text-slate-500 hover:text-rose-500 hover:bg-slate-50 rounded-full shadow-sm active:scale-90 transition-all border border-slate-200 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Main definitions & scrollable content */}
        <div className="px-6 sm:px-8 pb-32 sm:pb-8 overflow-y-auto space-y-6 sm:space-y-8 flex-1 bg-white overscroll-y-contain">

          {/* SVG Visual Focus */}
          <div className="w-full flex justify-center py-6 sm:py-8 relative min-h-[140px] items-center">
            <div className="absolute inset-0 bg-slate-50/60 rounded-3xl -z-10" />
            <WordCardVisual word={selectedWord} size="detail" />
          </div>

          {/* AI Guide Block */}
          <div className="border-t pt-5 sm:pt-6 border-slate-100 space-y-4">
            {dynamicGuide ? (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-5 sm:space-y-6"
              >
                {/* Hook */}
                <div className="p-4 sm:p-5 bg-gradient-to-br from-indigo-50 to-white border border-indigo-100 rounded-2xl sm:rounded-3xl space-y-2 sm:space-y-3 shadow-sm">
                  <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                    一秒秒懂
                  </span>
                  <div className="text-sm font-medium text-slate-700 leading-relaxed space-y-1 sm:space-y-2">
                    {(dynamicGuide.hook ?? '')
                      .split('\n')
                      .filter((line) => line.trim())
                      .map((line: string, i: number) => (
                      <p key={i}>{line}</p>
                    ))}
                  </div>
                </div>

                {/* Sentences */}
                <div className="space-y-2 sm:space-y-3">
                  <span className="text-[10px] font-black text-cyan-500 uppercase tracking-widest flex items-center gap-1">
                    <BookMarked className="w-3.5 h-3.5" />
                    绝佳搭配例句
                  </span>
                  <div className="grid gap-2 sm:gap-3">
                    {guideSentences(dynamicGuide).map((item, idx) => (
                      <motion.div 
                        whileHover={{ scale: 1.015, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        key={idx} 
                        className="p-3 sm:p-4 bg-white rounded-xl sm:rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-cyan-300 transition-all group cursor-pointer"
                        onClick={() => onPlaySpeech(item.en)}
                      >
                        <div className="flex justify-between items-start mb-2 gap-2 sm:gap-4">
                          <p className="text-sm sm:text-base font-extrabold text-slate-800 leading-snug">
                            {item.parts?.length ? item.parts.map((p, i) => {
                              const role = partRole(p as GuideSentence['parts'][number] | [string, string]);
                              return (
                              <span key={i} className={role === 'op' ? 'text-[#c65a30]' : role === 'dir' ? 'text-cyan-600' : ''}>
                                {partSurface(p as GuideSentence['parts'][number] | [string, string])}{' '}
                              </span>
                            );}) : item.en}
                          </p>
                          <button 
                            onClick={(e) => { e.stopPropagation(); onPlaySpeech(item.en); }}
                            className="p-1.5 sm:p-2 -mt-1 -mr-1 rounded-full text-cyan-500 hover:text-white hover:bg-cyan-500 cursor-pointer transition-colors shrink-0 bg-cyan-50 shadow-sm"
                            title="原汁原味发音"
                          >
                            <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          </button>
                        </div>
                        <p className="text-[11px] sm:text-xs text-slate-500 font-semibold">{item.cn}</p>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ) : generatingForId === selectedWord.id ? (
              <div className="space-y-4 p-5 sm:p-6 bg-slate-50 rounded-2xl sm:rounded-3xl border border-slate-100 animate-pulse">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-cyan-200/50 animate-bounce"></div>
                  <span className="text-xs font-bold text-cyan-600">正在从云端提取完美解析...</span>
                </div>
                <div className="space-y-2">
                  <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                  <div className="h-4 bg-slate-200 rounded w-1/2"></div>
                </div>
              </div>
            ) : (
              <div className="text-center p-6 sm:p-8 bg-slate-50 rounded-2xl sm:rounded-3xl border border-dashed border-slate-200">
                <p className="text-xs sm:text-sm text-slate-500 font-medium mb-4">
                  当前词汇尚未加载完毕或网络断开。
                </p>
                <button 
                  onClick={() => onLoadContext(selectedWord)}
                  className="px-5 py-2.5 bg-gradient-to-tr from-[#c65a30] to-[#faa144] text-white font-bold text-xs sm:text-sm rounded-full hover:shadow-lg hover:-translate-y-0.5 active:scale-95 transition-all cursor-pointer flex items-center gap-2 mx-auto"
                >
                  <RefreshCw className="w-4 h-4" />
                  立刻加载
                </button>
              </div>
            )}
          </div>
          
          {/* Footer Action Cards: Learning / Mastered */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4 border-t pt-5 sm:pt-6 border-slate-100 mt-6 pb-8">
            <button
              onClick={(e) => onSetStatus(selectedWord.id, isLearning ? null : 'learning', e)}
              className={`flex flex-col items-center justify-center p-4 rounded-2xl sm:rounded-3xl border-2 transition-all group ${
                isLearning 
                ? 'bg-cyan-50 border-cyan-400 text-cyan-700 shadow-md shadow-cyan-500/10' 
                : 'bg-white border-slate-100 text-slate-400 hover:border-cyan-200 hover:bg-cyan-50/50'
              }`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${isLearning ? 'bg-cyan-100 text-cyan-600' : 'bg-slate-50 text-slate-300 group-hover:bg-cyan-100/50 group-hover:text-cyan-500'}`}>
                <Activity className="w-5 h-5" />
              </div>
              <span className="font-extrabold text-sm tracking-wide">学习中</span>
            </button>
            
            <button
              onClick={(e) => onSetStatus(selectedWord.id, isMastered ? null : 'mastered', e)}
              className={`flex flex-col items-center justify-center p-4 rounded-2xl sm:rounded-3xl border-2 transition-all group ${
                isMastered 
                ? 'bg-emerald-50 border-emerald-400 text-emerald-700 shadow-md shadow-emerald-500/10' 
                : 'bg-white border-slate-100 text-slate-400 hover:border-emerald-200 hover:bg-emerald-50/50'
              }`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${isMastered ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-50 text-slate-300 group-hover:bg-emerald-100/50 group-hover:text-emerald-500'}`}>
                <CheckCircle className="w-5 h-5" />
              </div>
              <span className="font-extrabold text-sm tracking-wide">已掌握</span>
            </button>
          </div>

        </div>
      </motion.div>
    </div>
  );
};
