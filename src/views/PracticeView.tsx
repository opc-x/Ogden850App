import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  RefreshCw, Search, PenTool, CheckCircle, HelpCircle, AlertCircle, ArrowRight, X,
  BookMarked, Volume2, Sparkles, Palette, Eye, Star, Award, Trash2,
} from 'lucide-react';
import type { Word } from '../types/word';
import { CATEGORY_LABELS } from '../types/word';
import { useWords } from '../contexts/WordsContext';
import { useProgress } from '../contexts/ProgressContext';
import { usePractice } from '../hooks/usePractice';
import { TTSService } from '../services/tts.service';

export const PracticeView: React.FC = () => {
  const { words } = useWords();
  const { learningStatus } = useProgress();
  const {
    practiceHistory, setPracticeHistory,
    practiceWords, practiceSentence, setPracticeSentence,
    practiceEvaluating, practiceResult, setPracticeResult,
    spelledRevealed, setSpelledRevealed,
    showPracticeSearch, setShowPracticeSearch,
    practiceSearchQuery, setPracticeSearchQuery,
    addPracticeWord, removePracticeWord, randomizePracticeWords,
    evaluatePracticeSentence, savePracticeToHistory, deletePracticeHistoryItem,
  } = usePractice();

  const playSpeech = (text: string) => TTSService.playSpeech(text);

  useEffect(() => {
    if (practiceWords.length === 0) randomizePracticeWords();
  }, []);

  return (
    <>
      {/* TAB: PRACTICE WORKSPACE FOR SPELLING & SENTENCE BUILDING (拼词造句) */}
        
          <div className="space-y-6">
            
            {/* Top Workspace Header Card */}
            <div className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden">
              <div className="absolute right-0 top-0 h-full w-1/3 opacity-5 pointer-events-none">
                <BookMarked className="w-full h-full text-indigo-400" />
              </div>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
                <div className="relative z-10">
                  <h2 className="text-xl sm:text-2xl font-black text-slate-800 flex items-center gap-2">
                    <BookMarked className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-500" />
                    拼词造句超级工坊 <span className="text-[10px] font-black px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-md border border-indigo-100">EFFECTS LAB</span>
                  </h2>
                  <p className="text-xs text-slate-500 font-medium mt-1 max-w-xl">
                    在词典中挑选想要挑战的 1-3 个 Ogden 核心词。练习拼写，用简单的词汇写一句完整的句子。见证 AI 即时为你评估、翻译、发音与视觉效果呈现！
                  </p>
                </div>
                
                <div className="flex gap-2 shrink-0 relative z-10">
                  <button
                    onClick={randomizePracticeWords}
                    className="px-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-600 font-bold text-xs border border-slate-200 rounded-xl transition-all shadow-sm flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> 随机挑战
                  </button>
                  <button
                    onClick={() => setShowPracticeSearch(true)}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl transition-all shadow-lg shadow-indigo-900/30 flex items-center gap-1 cursor-pointer border border-indigo-500/50"
                  >
                    <Search className="w-3.5 h-3.5" /> 词典搜词
                  </button>
                </div>
              </div>
            </div>

            {/* Dictionary Selection Drawer/Modal overlay */}
            <AnimatePresence>
              {showPracticeSearch && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white rounded-2xl sm:rounded-3xl w-full max-w-lg border border-slate-100 p-4 sm:p-5 shadow-2xl space-y-3 sm:space-y-4"
                  >
                    <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                      <h4 className="font-extrabold text-slate-800 text-sm sm:text-base">从 850 核心词中选择挑战词汇</h4>
                      <button 
                        onClick={() => {
                          setShowPracticeSearch(false);
                          setPracticeSearchQuery('');
                        }}
                        className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                    
                    <div className="relative">
                      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                      <input 
                        type="text"
                        placeholder="输入英文、中文检索单词..."
                        value={practiceSearchQuery}
                        onChange={(e) => setPracticeSearchQuery(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 sm:py-3 pl-10 pr-4 text-[13px] sm:text-sm focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 outline-none text-slate-800 placeholder-slate-400"
                      />
                    </div>

                    <div className="max-h-60 overflow-y-auto divide-y divide-slate-100 pr-1">
                      {words.filter(w => {
                        if (!practiceSearchQuery.trim()) return true;
                        const q = practiceSearchQuery.toLowerCase();
                        return w.word.toLowerCase().includes(q) || w.translation.includes(q);
                      }).slice(0, 15).map(word => {
                        const isAdded = practiceWords.some(pw => pw.id === word.id);
                        return (
                          <div 
                            key={word.id}
                            onClick={() => {
                              if (isAdded) {
                                removePracticeWord(word.id);
                              } else {
                                if (practiceWords.length >= 3) {
                                  alert('一次最多只能选择 3 个挑战词汇哦！');
                                  return;
                                }
                                addPracticeWord(word);
                              }
                            }}
                            className={`p-3 hover:bg-slate-50 flex items-center justify-between cursor-pointer rounded-xl transition-colors mt-0.5 ${
                              isAdded ? 'bg-indigo-50 border border-indigo-200' : 'border border-transparent'
                            }`}
                          >
                            <div>
                              <span className="font-black text-slate-800 text-sm">{word.word}</span>
                              <span className="text-[9px] ml-2 text-slate-500 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded uppercase font-black">
                                {CATEGORY_LABELS[word.category]?.zh}
                              </span>
                            </div>
                            <span className="text-xs text-slate-500 font-semibold flex items-center gap-1.5">
                              {word.translation}
                              {isAdded ? (
                                <span className="text-xs text-indigo-600 font-black px-2 py-0.5 rounded-full bg-indigo-100 border border-indigo-200">已选</span>
                              ) : (
                                <span className="text-xs text-slate-400 font-bold px-2 py-0.5">未选</span>
                              )}
                            </span>
                          </div>
                        );
                      }).concat(words.filter(w => {
                        if (!practiceSearchQuery.trim()) return true;
                        const q = practiceSearchQuery.toLowerCase();
                        return w.word.toLowerCase().includes(q) || w.translation.includes(q);
                      }).slice(0, 15).map(word => {
                        const isAdded = practiceWords.some(pw => pw.id === word.id);
                        return null; // safety
                      }).filter(Boolean) as any)}
                    </div>
                    
                    <div className="pt-2 text-right">
                      <button
                        onClick={() => {
                          setShowPracticeSearch(false);
                          setPracticeSearchQuery('');
                        }}
                        className="px-6 py-3 bg-indigo-600 text-white font-black text-xs rounded-xl shadow-lg shadow-indigo-900/30 hover:bg-indigo-500 active:scale-95 cursor-pointer transition-all"
                      >
                        完成选词 ({practiceWords.length})
                      </button>
                    </div>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>

            {/* Main Interactive Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Left Column: Challenge list and Spelling (takes 5 cols) */}
              <div className="lg:col-span-5 space-y-4">
                <div className="flex justify-between items-baseline px-1">
                  <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                    当前挑战词 ({practiceWords.length}/3)
                  </h3>
                  <p className="text-[10px] text-slate-600 font-bold">点击卡片可移出挑战</p>
                </div>

                {practiceWords.length === 0 ? (
                  <div className="bg-white rounded-3xl p-8 text-center text-slate-500 border border-dashed border-slate-200 shadow-sm">
                    <HelpCircle className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                    <p className="text-xs font-bold text-slate-600">没有活跃的挑战词汇</p>
                    <p className="text-[10px] text-slate-400 mt-1">请点击右上角【词典搜词】或【随机挑战】</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {practiceWords.map(word => {
                      const isComplete = !!spelledRevealed[word.id];
                      const letters = word.word.split('');
                      return (
                        <div 
                          key={word.id} 
                          className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm space-y-3 relative overflow-hidden group"
                        >
                          <button 
                            onClick={() => removePracticeWord(word.id)}
                            className="absolute top-3 right-3 p-1.5 rounded-full bg-slate-50 text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-colors cursor-pointer opacity-0 group-hover:opacity-100"
                            title="移出挑战"
                          >
                            <X className="w-4 h-4" />
                          </button>

                          <div className="flex justify-between items-start pr-6">
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="text-xl font-black text-slate-800 tracking-tight">{word.word}</h4>
                                <button 
                                  onClick={() => playSpeech(word.word)}
                                  className="text-slate-400 hover:text-indigo-500 transition-colors p-1"
                                >
                                  <Volume2 className="w-4 h-4" />
                                </button>
                              </div>
                              <p className="text-xs text-slate-500 font-semibold">{word.translation}</p>
                            </div>
                            <span className="text-[9px] px-2 py-1 rounded-lg text-slate-500 bg-slate-50 border border-slate-100 uppercase tracking-wider font-black font-mono shrink-0">
                              {CATEGORY_LABELS[word.category]?.zh}
                            </span>
                          </div>

                          {/* Mini Game: Spelling click-to-tile helper */}
                          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 text-xs">
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider flex items-center gap-1">
                                <Sparkles className="w-3 h-3 text-indigo-400" /> 拼字挑战
                              </span>
                              {isComplete ? (
                                <span className="text-[10px] font-black text-emerald-400 flex items-center gap-1">
                                  <CheckCircle className="w-3.5 h-3.5 fill-emerald-500/20 text-emerald-400" /> 还原成功
                                </span>
                              ) : (
                                <button 
                                  onClick={() => {
                                    setSpelledRevealed(prev => ({ ...prev, [word.id]: true }));
                                    playSpeech(word.word);
                                  }}
                                  className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 transition-colors"
                                >
                                  直接揭晓
                                </button>
                              )}
                            </div>

                            {isComplete ? (
                              <div className="flex gap-1.5 justify-center py-1 flex-wrap">
                                {word.word.split('').map((char, index) => (
                                  <span 
                                    key={index} 
                                    className="w-8 h-8 bg-emerald-50 text-emerald-600 font-black text-sm flex items-center justify-center rounded-xl shadow-sm border border-emerald-100"
                                  >
                                    {char}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <div className="space-y-3">
                                <div className="text-center py-2.5 bg-white rounded-xl border border-slate-200 flex flex-wrap justify-center gap-2 shadow-inner">
                                  {letters.map((_, idx) => (
                                    <span 
                                      key={idx} 
                                      className="w-6 h-6 border-b-2 border-slate-300 text-transparent font-extrabold flex items-center justify-center text-xs"
                                    >
                                      ?
                                    </span>
                                  ))}
                                </div>
                                <button
                                  onClick={() => {
                                    setSpelledRevealed(prev => ({ ...prev, [word.id]: true }));
                                    playSpeech(word.word);
                                  }}
                                  className="w-full text-center py-2 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-xl text-[10px] text-indigo-600 font-black transition-all cursor-pointer uppercase tracking-wider"
                                >
                                  点击解锁拼写
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Right Column: Lined Compose Notebook and Result Render (takes 7 cols) */}
              <div className="lg:col-span-7 space-y-5">
                
                {/* Lined Notebook Writing Card */}
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                  <div className="flex justify-between items-baseline">
                    <h3 className="text-sm font-black text-slate-800 flex items-center gap-2">
                      <Palette className="w-5 h-5 text-indigo-500" />
                      极客写作终端 <span className="text-[9px] text-slate-400 uppercase tracking-widest font-mono">Ogden Compose Terminal</span>
                    </h3>
                    <span className="text-[10px] text-slate-400 font-bold hidden sm:block">由 AI 实时辅导评估</span>
                  </div>

                  {/* Progressive target completion checklist badges */}
                  <div className="flex flex-wrap gap-2 text-xs">
                    {practiceWords.map(w => {
                      const isIncluded = practiceSentence.toLowerCase().includes(w.word.toLowerCase());
                      return (
                        <span 
                          key={w.id} 
                          className={`px-3 py-1.5 rounded-xl font-black transition-all flex items-center gap-1.5 ${
                            isIncluded 
                            ? 'bg-emerald-500/20 text-emerald-600 border border-emerald-500/50 shadow-sm' 
                            : 'bg-slate-50 text-slate-500 border border-slate-200'
                          }`}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-current" />
                          {w.word}
                        </span>
                      );
                    })}
                  </div>

                  {/* Terminal Mockup Textarea */}
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-2xl blur-md pointer-events-none group-focus-within:opacity-100 opacity-0 transition-opacity"></div>
                    <textarea
                      rows={5}
                      value={practiceSentence}
                      onChange={(e) => setPracticeSentence(e.target.value)}
                      placeholder={'> 请在此输入包含挑战词汇的完整英文句子\n> 例: The sun is good.'}
                      className="w-full relative z-10 bg-slate-50 border border-slate-200 rounded-2xl p-5 text-indigo-900 text-sm font-mono leading-relaxed outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 placeholder-slate-400 resize-none shadow-inner"
                    />
                    {practiceSentence && (
                      <button 
                        onClick={() => setPracticeSentence('')}
                        className="absolute right-4 bottom-4 p-2 rounded-xl bg-white text-slate-400 hover:text-rose-500 hover:bg-rose-50 border border-slate-200 shadow-sm cursor-pointer z-20 transition-colors"
                        title="清空文本"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* Composition controls bar */}
                  <div className="flex flex-col sm:flex-row justify-between items-center pt-2 gap-3">
                    <span className="text-[10px] text-slate-500 font-medium">
                      使用越精简的基础词汇，越能展现语言的架构之美。
                    </span>
                    
                    <button
                      onClick={evaluatePracticeSentence}
                      disabled={practiceWords.length === 0 || !practiceSentence.trim() || practiceEvaluating}
                      className={`w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl font-black text-xs shadow-sm transition-all cursor-pointer ${
                        (practiceWords.length === 0 || !practiceSentence.trim() || practiceEvaluating)
                        ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed shadow-none'
                        : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-900/50 active:scale-95 border border-indigo-400/50'
                      }`}
                    >
                      {practiceEvaluating ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          正在进行智能分析...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          一键评估造句效果
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* VISUAL COMPOSITION EFFECT RENDERING CARD ("效果展示" - user core focus) */}
                <AnimatePresence>
                  {practiceResult && (
                    <motion.div
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 15 }}
                      className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-xl relative"
                    >
                      {/* Top plaque banner */}
                      <div className="bg-indigo-600/20 border-b border-indigo-500/30 px-5 py-3.5 text-indigo-400 flex justify-between items-center">
                        <span className="text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5">
                          <Eye className="w-4 h-4" /> COMPOSITION EFFECT POSTER · 效果展板
                        </span>
                        
                        <div className="flex items-center gap-1">
                          {Array.from({ length: 5 }).map((_, i) => {
                            const starScore = practiceResult.score;
                            const rating = starScore >= 95 ? 5 : starScore >= 85 ? 4 : starScore >= 70 ? 3 : 2;
                            return (
                              <Star 
                                key={i} 
                                className={`w-3.5 h-3.5 ${
                                  i < rating 
                                  ? 'fill-amber-400 text-amber-400 drop-shadow-[0_0_5px_rgba(251,191,36,0.5)]' 
                                  : 'text-slate-700'
                                }`} 
                              />
                            );
                          })}
                        </div>
                      </div>

                      {/* Poster Content Area */}
                      <div className="p-6 sm:p-8 space-y-6 text-center bg-gradient-to-b from-indigo-50/50 to-white">
                        
                        {/* Word score emblem */}
                        <div className="inline-block mx-auto mb-2 bg-white border border-indigo-100 px-5 py-2 rounded-2xl shadow-sm relative overflow-hidden">
                          <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 to-transparent pointer-events-none"></div>
                          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">AI 语法分项评级</p>
                          <p className="text-2xl font-black text-indigo-600 tracking-tight mt-1">{practiceResult.score} / 100 分</p>
                        </div>

                        {/* Large Quote Composition Display */}
                        <div className="max-w-md mx-auto space-y-3 py-6 border-y border-slate-100 relative font-serif">
                          <span className="absolute -top-4 left-2 text-5xl text-indigo-500/10 font-sans">"</span>
                          
                          <p className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight leading-relaxed italic px-4 relative z-10">
                            {practiceSentence}
                          </p>
                          
                          <div className="text-[10px] font-black text-slate-500 font-mono uppercase tracking-widest pt-2">
                            Composition by Learner (Ogden standard)
                          </div>
                        </div>

                        {/* Speech read-out effect player */}
                        <div className="flex justify-center">
                          <button
                            onClick={() => playSpeech(practiceResult.correctedSentence || practiceSentence)}
                            className="px-6 py-3 bg-cyan-500/10 border border-cyan-500/30 hover:bg-cyan-500/20 text-cyan-400 font-black text-xs rounded-xl flex items-center gap-2 active:scale-95 transition-all shadow-[0_0_15px_rgba(6,182,212,0.15)] cursor-pointer"
                          >
                            <Volume2 className="w-4 h-4 text-cyan-400" />
                            听真人标准发声朗读展示
                          </button>
                        </div>

                        {/* Chinese translation plate */}
                        <div className="max-w-md mx-auto p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                          <span className="text-[9px] uppercase font-black tracking-widest text-slate-400 block mb-1.5">Chinese Translation · 译文释义</span>
                          <p className="text-sm font-bold text-slate-600 leading-relaxed">
                            {practiceResult.translation}
                          </p>
                        </div>

                        {/* Tutor Evaluation Section */}
                        <div className="text-left bg-slate-50 p-5 rounded-3xl border border-slate-100 shadow-sm space-y-4 max-w-lg mx-auto">
                          
                          <div>
                            <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest block mb-2">智能精修批改</span>
                            {practiceResult.correctedSentence ? (
                              <p className="text-sm font-black text-amber-600 bg-amber-50 p-3 rounded-xl border border-amber-100 leading-relaxed">
                                {practiceResult.correctedSentence} <span className="text-xs text-amber-500 font-semibold block mt-1">(推荐修正表达)</span>
                              </p>
                            ) : (
                              <p className="text-sm font-black text-emerald-600 bg-emerald-50 p-3 rounded-xl border border-emerald-100 leading-relaxed flex items-center gap-2">
                                <CheckCircle className="w-5 h-5 shrink-0" /> 句子拼写精进，语法准确性极高，不需要任何修正。
                              </p>
                            )}
                          </div>
                          
                          <div className="space-y-2 text-xs font-semibold text-slate-600 leading-relaxed pt-2 border-t border-slate-200">
                            <p className="bg-white p-3 rounded-xl border border-slate-100"><b className="text-slate-800 font-black block mb-1">🔍 分析评价:</b> {practiceResult.analysis}</p>
                            <p className="bg-indigo-50 p-3 rounded-xl border border-indigo-100"><b className="text-indigo-700 font-black block mb-1">💡 启发建议:</b> {practiceResult.recommendedUsage}</p>
                          </div>

                        </div>

                        {/* Save block */}
                        <div className="pt-2 flex flex-col sm:flex-row justify-center gap-3">
                          <button
                            onClick={savePracticeToHistory}
                            className="px-6 py-3.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-black text-xs rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.3)] active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer border border-emerald-400/50"
                          >
                            <Award className="w-4 h-4" /> 💾 保存至【造句成就书】
                          </button>
                          
                          <button
                            onClick={() => setPracticeResult(null)}
                            className="px-6 py-3.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 font-black text-xs rounded-xl active:scale-95 transition-all cursor-pointer shadow-sm"
                          >
                            重写这一句
                          </button>
                        </div>

                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

              </div>

            </div>

            {/* Achievements Log: 造句成就本 */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-black text-slate-800 text-lg flex items-center gap-2">
                    <Award className="w-6 h-6 text-emerald-500" />
                    我的造句成就书 ({practiceHistory.length})
                  </h3>
                  <p className="text-xs text-slate-500 font-bold mt-1">收集您写过的所有得到 AI 批改盖章的优秀英语造句作品</p>
                </div>
                
                {practiceHistory.length > 0 && (
                  <button
                    onClick={() => {
                      if (confirm('确定要清空您写过的所有造句成就历史吗？')) {
                        setPracticeHistory([]);
                      }
                    }}
                    className="text-xs font-black text-rose-500 hover:text-rose-600 transition-colors flex items-center gap-1 cursor-pointer bg-rose-50 hover:bg-rose-100 p-2 rounded-xl"
                  >
                    <Trash2 className="w-4 h-4" /> <span className="hidden sm:inline">清空记录</span>
                  </button>
                )}
              </div>

              {practiceHistory.length === 0 ? (
                <div className="p-16 text-center text-slate-500 border border-dashed border-slate-200 rounded-3xl space-y-3 bg-slate-50">
                  <BookMarked className="w-12 h-12 mx-auto text-slate-300" />
                  <p className="text-sm font-black text-slate-600">你的造句成就本目前尚无收藏</p>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">创作并提交你的英文句子，通过 AI 评估后点击保存，你的成功表达将在这本属于你自己的成就书里生根发芽！</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {practiceHistory.map((item) => (
                    <div 
                      key={item.id} 
                      className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-indigo-300 shadow-sm hover:shadow-md transition-all relative flex flex-col justify-between gap-4 group"
                    >
                      <button 
                        onClick={(e) => deletePracticeHistoryItem(item.id, e)}
                        className="absolute top-3 right-3 p-1.5 rounded-full text-slate-400 hover:text-rose-500 hover:bg-rose-50 opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                        title="删除该条记录"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      <div className="space-y-3">
                        {/* Rating and date */}
                        <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold border-b border-slate-100 pb-2">
                          <span>{new Date(item.timestamp).toLocaleDateString()}</span>
                          <span className="font-black text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded-md border border-indigo-500/20">
                            {item.score}分
                          </span>
                        </div>

                        {/* Words used */}
                        <div className="flex flex-wrap gap-1.5">
                          {item.targetWords.map((tw, idx) => (
                            <span key={idx} className="text-[9px] bg-slate-800 text-emerald-400 font-black rounded-md px-2 py-0.5 border border-slate-700/50">
                              {tw.word}
                            </span>
                          ))}
                        </div>

                        {/* Sentence */}
                        <p className="text-base font-black text-slate-200 tracking-tight leading-relaxed font-serif italic pt-1">
                          "{item.userSentence}"
                        </p>

                        {/* Translation */}
                        <p className="text-xs text-slate-400 font-medium line-clamp-2 leading-relaxed">
                          {item.translation}
                        </p>
                      </div>

                      {/* Bottom Quick Play */}
                      <div className="pt-3 border-t border-slate-800/50 flex justify-between items-center">
                        <button
                          onClick={() => playSpeech(item.correctedSentence || item.userSentence)}
                          className="text-[10px] font-black text-cyan-500 hover:text-cyan-400 transition-colors flex items-center gap-1 cursor-pointer bg-cyan-500/10 px-2.5 py-1.5 rounded-lg border border-cyan-500/20"
                        >
                          <Volume2 className="w-3.5 h-3.5" /> 听标准发音
                        </button>
                        
                        <span className="text-[10px] text-emerald-500/70 font-black uppercase tracking-widest">已掌握</span>
                      </div>

                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        
    </>
  );
};
