import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Headphones, Mic, BrainCircuit } from 'lucide-react';
import {
  WORD_COUNT,
  SCENE_TARGET_COUNT,
  DIALOGUE_MARKETING_LABEL,
} from '../../data/marketing';

const fadeUp = {
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
};

const FEATURES = [
  {
    icon: Headphones,
    accent: 'text-[#2f7d4f]',
    bg: 'bg-emerald-100',
    title: '场景里学，不背词表',
    desc: '50 个高频生活场景，看图听原声，句子记在情境里。',
  },
  {
    icon: Mic,
    accent: 'text-[#2f7d4f]',
    bg: 'bg-emerald-100',
    title: '跟读模仿，张嘴就练',
    desc: '点一下听发音，逐句跟读模仿，把句子练到脱口而出。',
  },
  {
    icon: BrainCircuit,
    accent: 'text-indigo-600',
    bg: 'bg-indigo-100',
    title: 'AI 实战陪练',
    desc: '随时呼叫 AI 陪练，仅用这 850 词与你畅聊，建立纯正英语思维。',
  },
];

export const LandingPage: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  return (
    <div className="relative w-full h-full overflow-hidden bg-gradient-to-b from-[#e6f4ea] via-[#f0f9f2] to-[#f8f9fa] flex flex-col pt-safe pb-safe">
      {/* 柔和光晕背景 */}
      <div className="pointer-events-none absolute -top-24 -right-16 h-64 w-64 rounded-full bg-emerald-200/40 blur-3xl" />
      <div className="pointer-events-none absolute top-1/3 -left-20 h-56 w-56 rounded-full bg-emerald-300/20 blur-3xl" />

      <div className="relative flex-1 w-full flex flex-col px-6 pt-10 overflow-y-auto">
        {/* 品牌 */}
        <motion.div {...fadeUp} transition={{ duration: 0.5 }}>
          <span
            style={{
              fontFamily: "'Pacifico', cursive",
              backgroundImage: 'linear-gradient(120deg, #1f6b3f 0%, #2f7d4f 45%, #5cb377 100%)',
            }}
            className="bg-clip-text text-transparent text-2xl font-extrabold tracking-tight"
          >
            Ogden 850
          </span>
        </motion.div>

        {/* 主标题 */}
        <motion.h1
          {...fadeUp}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mt-8 text-[2rem] leading-[1.2] font-black text-slate-800 text-balance"
        >
          用最小的词，
          <br />
          说
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1f6b3f] to-[#5cb377]">
            最多的话
          </span>
        </motion.h1>

        <motion.p
          {...fadeUp}
          transition={{ duration: 0.5, delay: 0.18 }}
          className="mt-3 text-[15px] leading-relaxed font-medium text-slate-500 max-w-[300px] text-pretty"
        >
          只学 {WORD_COUNT} 个核心词根，就能听懂、跟读 {SCENE_TARGET_COUNT} 个高频场景里的每一句话。
        </motion.p>

        {/* 价值公式徽章 */}
        <motion.div
          {...fadeUp}
          transition={{ duration: 0.5, delay: 0.26 }}
          className="mt-7 rounded-2xl border border-emerald-100 bg-white/70 backdrop-blur p-4 shadow-sm"
        >
          <div className="flex items-end justify-between">
            <div className="flex flex-col items-center">
              <span className="text-2xl font-black text-slate-800 tabular-nums leading-none">{WORD_COUNT}</span>
              <span className="mt-1 text-[11px] font-medium text-slate-400">核心词根</span>
            </div>
            <span className="pb-4 text-lg font-light text-emerald-300">×</span>
            <div className="flex flex-col items-center">
              <span className="text-2xl font-black text-slate-800 tabular-nums leading-none">{SCENE_TARGET_COUNT}</span>
              <span className="mt-1 text-[11px] font-medium text-slate-400">真实场景</span>
            </div>
            <span className="pb-4 text-lg font-light text-emerald-300">=</span>
            <div className="flex flex-col items-center">
              <span className="text-3xl font-black text-[#2f7d4f] tabular-nums leading-none tracking-tight">
                {DIALOGUE_MARKETING_LABEL}
              </span>
              <span className="mt-1 text-[11px] font-bold text-[#2f7d4f]">句生活口语</span>
            </div>
          </div>
        </motion.div>

        {/* 卖点 */}
        <div className="mt-5 space-y-3">
          {FEATURES.map((f, i) => {
            const Icon = f.icon;
            return (
              <motion.div
                key={f.title}
                {...fadeUp}
                transition={{ duration: 0.5, delay: 0.34 + i * 0.08 }}
                className="flex items-start gap-3.5 rounded-2xl border border-emerald-100/60 bg-white/80 backdrop-blur p-3.5 shadow-sm"
              >
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${f.bg}`}>
                  <Icon className={`h-5 w-5 ${f.accent}`} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800">{f.title}</h3>
                  <p className="mt-0.5 text-xs leading-relaxed text-slate-400">{f.desc}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* CTA */}
      <motion.div
        {...fadeUp}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="relative w-full px-6 pt-4 pb-6"
      >
        <button
          onClick={onComplete}
          className="group w-full bg-gradient-to-r from-[#1f6b3f] to-[#5cb377] hover:from-[#185532] hover:to-[#4da369] text-white font-black py-4 rounded-2xl flex justify-center items-center gap-2 shadow-xl shadow-emerald-500/25 active:scale-[0.97] transition-all text-lg"
        >
          开启极简英语之旅
          <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
        </button>
        <p className="mt-3 text-center text-[11px] font-medium text-slate-400">
          已上线 {DIALOGUE_MARKETING_LABEL} 句真实场景对话 · 持续更新
        </p>
      </motion.div>
    </div>
  );
};
