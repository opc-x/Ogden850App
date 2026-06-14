import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BookOpen, Star, Zap, Award, Target, Brain, Package, HelpCircle } from 'lucide-react';
import { Word, wordsData, CATEGORY_LABELS } from '../data/wordsList';
import { useProgress } from '../contexts/ProgressContext';

interface StatsViewProps {
  totalWords: number;
  setActiveTab: (tab: string) => void;
  setBrowserCategory: (cat: string) => void;
  setBrowserStatus: (status: 'all' | 'starred' | 'learning' | 'mastered') => void;
}

export const StatsView: React.FC<StatsViewProps> = ({
  totalWords, setActiveTab, setBrowserCategory, setBrowserStatus
}) => {
  const { learningStatus, starredWords, masteredCount, learningCount, starredCount, progressPercent } = useProgress();

  return (
    <>
      {/* TAB 3: STATS & PRACTICE PANEL */}
        
          <div className="space-y-6">
            
            {/* Left Stats Circle & Category meters split */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full blur-3xl pointer-events-none"></div>
                <div className="relative z-10">
                  <h3 className="text-xl font-black text-slate-800 flex items-center gap-2 mb-1">
                    <Award className="w-5 h-5 text-indigo-500" />
                    系统评估
                  </h3>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Ogden English 经典分级标准</p>
                </div>

                <div className="my-10 flex justify-center relative z-10">
                  <div className="w-44 h-44 rounded-full border-[10px] border-slate-50 bg-white flex flex-col items-center justify-center shadow-inner relative">
                    <div className="absolute inset-[-10px] rounded-full border-[10px] border-indigo-100 border-t-indigo-500 border-r-indigo-400 rotate-45"></div>
                    <span className="text-5xl font-black text-slate-800 tracking-tighter">{masteredCount}</span>
                    <span className="text-[10px] text-slate-400 font-black uppercase mt-1 tracking-widest">/ 850 词掌握</span>
                    <div className="absolute inset-x-0 -bottom-4 text-center">
                      <span className="text-xs font-black text-indigo-700 bg-indigo-50 px-4 py-1.5 rounded-full border border-indigo-200 shadow-sm backdrop-blur-md">
                        词汇掌握：{progressPercent}%
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 border-t pt-5 border-slate-100 text-sm text-slate-500 font-medium relative z-10">
                  <div className="flex justify-between items-center">
                    <span>收藏重要单词</span>
                    <span className="font-black text-slate-700 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-md">{starredCount} 词</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>当前熟手级别</span>
                    <span className="font-black text-indigo-600">
                      {progressPercent < 10 && '🌱 菜鸟学步'}
                      {progressPercent >= 10 && progressPercent < 30 && '🍀 入门能手'}
                      {progressPercent >= 30 && progressPercent < 70 && '🍊 基本流畅'}
                      {progressPercent >= 70 && progressPercent < 95 && '🚀 驾轻就熟'}
                      {progressPercent >= 95 && '💎 Basic 完美掌控'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Categoric Completion Status */}
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm lg:col-span-2 space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h3 className="text-xl font-black text-slate-800">各分支覆盖率</h3>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">词性及功能性词汇分类达标指标</p>
                  </div>
                  <button 
                    onClick={generateQuiz}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:from-cyan-400 hover:to-blue-500 active:scale-95 transition-all text-xs font-black rounded-xl shadow-md cursor-pointer w-full sm:w-auto"
                  >
                    <Brain className="w-4 h-4" />
                    开启 5 词速测
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                  {Object.entries(CATEGORY_LABELS).map(([catKey, label]) => {
                    const countInCat = wordsData.filter(w => w.category === catKey).length;
                    const masteredInCat = wordsData.filter(w => w.category === catKey && learningStatus[w.id] === 'mastered').length;
                    const percent = Math.round((masteredInCat / countInCat) * 100) || 0;

                    return (
                      <div key={catKey} className="p-4 bg-slate-50 rounded-2xl space-y-3 border border-slate-200 hover:border-slate-300 transition-colors shadow-sm">
                        <div className="flex justify-between text-xs font-black">
                          <span className="text-slate-700">{label.zh} <span className="text-slate-400 text-[10px] ml-1 uppercase">{label.en}</span></span>
                          <span className="text-slate-500">{masteredInCat} / {countInCat}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-2.5 bg-slate-200 rounded-full overflow-hidden shadow-inner">
                            <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 shadow-sm transition-all duration-1000" style={{ width: `${percent}%` }} />
                          </div>
                          <span className="text-xs font-black text-cyan-600 w-9 text-right">{percent}%</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex justify-end gap-3 pt-3 text-xs">
                  <button 
                    onClick={resetProgressData}
                    className="text-slate-400 hover:text-rose-500 font-bold flex items-center gap-1.5 border border-slate-200 hover:bg-rose-50 hover:border-rose-200 px-4 py-2 rounded-xl active:scale-95 transition-all cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                    危险：重置所有学习记录
                  </button>
                </div>

              </div>

            </div>

            {/* Quick Multi-choice Quiz Interface */}
            {quizActive && (
              <motion.section 
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white/95 backdrop-blur-md p-6 sm:p-8 rounded-3xl border border-cyan-200 shadow-xl relative overflow-hidden"
              >
                <button 
                  onClick={() => setQuizActive(false)}
                  className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 bg-slate-100 p-1.5 rounded-full cursor-pointer transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>

                {!quizSubmitted ? (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                      <div className="flex items-center gap-2">
                        <Brain className="w-6 h-6 text-cyan-500 animate-pulse" />
                        <h3 className="text-lg font-black text-slate-800">Ogden English 挑战测试</h3>
                      </div>
                      <span className="text-[10px] font-black text-cyan-600 uppercase tracking-widest bg-cyan-50 px-3 py-1 rounded-full border border-cyan-100">
                        问题 {currentQuizIndex + 1} / 5
                      </span>
                    </div>

                    {/* Question presentation */}
                    <div className="text-center py-8 bg-slate-50 rounded-3xl border border-slate-200 shadow-sm max-w-md mx-auto">
                      <p className="text-[10px] text-cyan-600 font-black tracking-widest uppercase mb-2">请选择正确的中文释义</p>
                      <h4 className="text-5xl font-black text-slate-800 tracking-tight mb-3">
                        {quizQuestions[currentQuizIndex]?.word.word}
                      </h4>
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest bg-white px-3 py-1 rounded-lg border border-slate-200">
                        {CATEGORY_LABELS[quizQuestions[currentQuizIndex]?.word.category]?.zh}
                      </span>
                    </div>

                    {/* Multiple choices */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 max-w-xl mx-auto pt-2">
                      {quizQuestions[currentQuizIndex]?.options.map((option, idx) => {
                        const isSelected = quizQuestions[currentQuizIndex]?.selectedIndex === idx;
                        return (
                          <button
                            key={idx}
                            onClick={() => handleSelectQuizOption(idx)}
                            className={`p-5 rounded-2xl text-sm font-black text-left transition-all tracking-tight cursor-pointer ${
                              isSelected 
                              ? 'bg-cyan-50 text-cyan-700 shadow-sm border border-cyan-300' 
                              : 'bg-white border border-slate-200 hover:bg-slate-50 hover:border-cyan-200 text-slate-700'
                            }`}
                          >
                            <span className="inline-block mr-3 text-xs font-black opacity-60 bg-slate-100 px-2 py-1 rounded">
                              {['A', 'B', 'C', 'D'][idx]}
                            </span>
                            {option}
                          </button>
                        );
                      })}
                    </div>

                    <div className="flex justify-end pt-4 max-w-xl mx-auto">
                      <button
                        onClick={handleNextQuiz}
                        disabled={quizQuestions[currentQuizIndex]?.selectedIndex === null}
                        className={`flex items-center justify-center w-full sm:w-auto gap-2 px-8 py-4 rounded-2xl font-black text-sm shadow-md transition-all cursor-pointer ${
                          quizQuestions[currentQuizIndex]?.selectedIndex === null
                          ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed shadow-none'
                          : 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:opacity-90 active:scale-95 shadow-sm'
                        }`}
                      >
                        {currentQuizIndex < 4 ? '下一题 Next' : '完成测试 Finish'}
                        <ArrowRight className="w-5 h-5 ml-1" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 space-y-6 max-w-sm mx-auto">
                    <div className="w-24 h-24 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-500 mx-auto shadow-sm">
                      <Award className="w-12 h-12" />
                    </div>
                    <div>
                      <h4 className="text-2xl font-black text-slate-800">测试挑战完成！</h4>
                      <p className="text-3xl font-black text-cyan-500 mt-2">您答对了 {quizScore} / 5</p>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed font-medium bg-slate-50 p-4 rounded-2xl border border-slate-200">
                      凡是答对的词语已经被 <b className="text-emerald-500">自动标记为“已掌握”</b>。多做词汇评测是掌握 Ogden Basic 的最快途径！
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
                      <button
                        onClick={generateQuiz}
                        className="px-6 py-3.5 text-xs font-black border border-cyan-200 hover:bg-cyan-50 text-cyan-600 rounded-xl active:scale-95 transition-all flex justify-center items-center gap-2 cursor-pointer w-full sm:w-auto"
                      >
                        <RefreshCw className="w-4 h-4" /> 再试一次
                      </button>
                      <button
                        onClick={() => setQuizActive(false)}
                        className="px-6 py-3.5 text-xs font-black bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl shadow-sm active:scale-95 transition-all cursor-pointer w-full sm:w-auto"
                      >
                        返回统计
                      </button>
                    </div>
                  </div>
                )}
              </motion.section>
            )}

            {/* General Description Card */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm space-y-5">
              <h3 className="font-black text-slate-800 text-lg flex items-center gap-2">
                <Languages className="w-6 h-6 text-indigo-500 animate-pulse" />
                关于 Ogden 850 基础英语
              </h3>
              <p className="text-sm text-slate-500 leading-relaxed font-medium">
                <b className="text-slate-800 font-black">Ogden Basic English</b> (奥格登基本英语) 是由英国语言学家 Charles Kay Ogden 发明的简化英语系统。
                它仅仅挑选了 <b className="text-indigo-600 font-black">850 个核心词汇</b>，用来涵盖和表达几乎所有的日常场景。只要您熟练掌握这 850 个英文单词，
                您就已经拥有了在全世界流畅读写、自由表达的核心基石。
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50 p-5 rounded-2xl text-center text-sm border border-slate-200 shadow-sm">
                <div className="py-2">
                  <p className="font-black text-cyan-600 text-xl tracking-tight">18 核心动词</p>
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">沟通句子逻辑的核心枢纽</p>
                </div>
                <div className="border-t sm:border-t-0 sm:border-x border-slate-200 py-4 sm:py-2">
                  <p className="font-black text-emerald-600 text-xl tracking-tight">600 物与名词</p>
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">200个实体和400个一般概念</p>
                </div>
                <div className="py-2">
                  <p className="font-black text-amber-500 text-xl tracking-tight">150 描述品质</p>
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">100个普通性质和50个完美反义词</p>
                </div>
              </div>
            </div>

          </div>
        
    </>
  );
};
