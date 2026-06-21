import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight, BookOpen, Compass, Sparkles, BrainCircuit } from 'lucide-react';

export const LandingPage: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  return (
    <div className="w-full h-full bg-gradient-to-b from-[#e6f4ea] to-[#f8f9fa] flex flex-col items-center justify-between overflow-hidden pt-safe pb-safe">
      
      <div className="flex-1 w-full flex flex-col items-center justify-center px-6 py-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-24 h-24 bg-white rounded-3xl shadow-xl flex items-center justify-center mb-8 border border-emerald-100"
        >
          <BookOpen className="w-12 h-12 text-[#2f7d4f]" />
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-3xl sm:text-4xl font-black text-slate-800 text-center mb-4 leading-tight"
        >
          掌握语言的 <br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2f7d4f] to-[#5cb377]">核心引擎</span>
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-base sm:text-lg text-slate-600 text-center max-w-[280px] mb-10 font-medium"
        >
          只学 850 个核心词，搭配 18 个基础动词，足以表达 90% 的日常英语。
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="w-full space-y-4"
        >
          <div className="bg-white/80 backdrop-blur rounded-2xl p-4 shadow-sm border border-emerald-100/50 flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
              <Compass className="w-5 h-5 text-[#2f7d4f]" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-sm">每天学一点</h3>
              <p className="text-xs text-slate-500 mt-1">主页浏览核心分类，利用方向词和动词推演万物。</p>
            </div>
          </div>
          
          <div className="bg-white/80 backdrop-blur rounded-2xl p-4 shadow-sm border border-emerald-100/50 flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center shrink-0">
              <BrainCircuit className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-sm">AI 实战陪练</h3>
              <p className="text-xs text-slate-500 mt-1">随时呼叫 AI 陪练，仅用这 850 词与你畅聊，建立纯正英语思维。</p>
            </div>
          </div>
        </motion.div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.7 }}
        className="w-full p-6"
      >
        <button 
          onClick={onComplete}
          className="w-full bg-gradient-to-r from-[#2f7d4f] to-[#e6754b] hover:from-[#b54a20] hover:to-[#d6653b] text-white font-black py-4 rounded-2xl flex justify-center items-center gap-2 shadow-xl shadow-emerald-500/20 active:scale-95 transition-all text-lg"
        >
          开启极简英语之旅 <ArrowRight className="w-5 h-5" />
        </button>
      </motion.div>
    </div>
  );
};
