import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Headphones, Mic, BrainCircuit, RefreshCw, Mail, Lock, X } from 'lucide-react';
import {
  WORD_COUNT,
  SCENE_TARGET_COUNT,
  DIALOGUE_MARKETING_LABEL,
} from '../../data/marketing';
import { useAuth } from '../../contexts/AuthContext';

const fadeUp = {
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
};

function GoogleIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" aria-hidden>
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}

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
  const auth = useAuth();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 邮箱注册 / 登录抽屉
  const [emailSheet, setEmailSheet] = useState(false);
  const [emailMode, setEmailMode] = useState<'register' | 'login'>('register');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleGoogle = async () => {
    setBusy(true);
    setError(null);
    try {
      // 记下已看过引导，OAuth 回跳后直接进首页
      localStorage.setItem('ogden850_has_seen_onboarding', 'true');
      await auth.signInWithGoogle();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Google 登录失败，请重试');
      setBusy(false);
    }
  };

  const handleEmail = async () => {
    setBusy(true);
    setError(null);
    try {
      localStorage.setItem('ogden850_has_seen_onboarding', 'true');
      if (emailMode === 'register') {
        await auth.signUpWithEmail(email, password, '');
      } else {
        await auth.signInWithEmail(email, password);
      }
      onComplete();
    } catch (e) {
      setError(e instanceof Error ? e.message : '操作失败，请重试');
    } finally {
      setBusy(false);
    }
  };

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
          disabled={busy}
          className="group w-full bg-gradient-to-r from-[#1f6b3f] to-[#5cb377] hover:from-[#185532] hover:to-[#4da369] text-white font-black py-4 rounded-2xl flex justify-center items-center gap-2 shadow-xl shadow-emerald-500/25 active:scale-[0.97] transition-all text-lg disabled:opacity-60"
        >
          开始体验
          <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
        </button>

        {error && !emailSheet && (
          <p className="mt-2 text-center text-xs text-rose-600">{error}</p>
        )}

        <div className="mt-3 grid grid-cols-2 gap-3">
          <button
            onClick={handleGoogle}
            disabled={busy}
            className="bg-white border border-slate-200 text-slate-600 font-bold py-3 rounded-2xl flex justify-center items-center gap-2 active:scale-[0.97] transition-all text-sm disabled:opacity-60"
          >
            {busy ? <RefreshCw className="w-4 h-4 animate-spin" /> : <GoogleIcon />}
            谷歌登录
          </button>
          <button
            onClick={() => { setError(null); setEmailMode('register'); setEmailSheet(true); }}
            disabled={busy}
            className="bg-white border border-slate-200 text-slate-600 font-bold py-3 rounded-2xl flex justify-center items-center gap-2 active:scale-[0.97] transition-all text-sm disabled:opacity-60"
          >
            <Mail className="w-4 h-4" />
            邮箱登录
          </button>
        </div>

        <p className="mt-3 text-center text-[11px] font-medium text-slate-400">
          已上线 {DIALOGUE_MARKETING_LABEL} 句真实场景对话 · 持续更新
        </p>
      </motion.div>

      {/* 邮箱注册 / 登录抽屉 */}
      {emailSheet && (
        <div className="absolute inset-0 z-50 flex items-end justify-center">
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={() => !busy && setEmailSheet(false)}
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            className="relative w-full max-w-md bg-white rounded-t-3xl px-6 pt-5 pb-8 shadow-2xl"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black text-slate-800">
                {emailMode === 'register' ? '邮箱注册' : '邮箱登录'}
              </h2>
              <button
                onClick={() => !busy && setEmailSheet(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
                aria-label="关闭"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-5 space-y-3">
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  placeholder="邮箱地址"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 pl-11 pr-3 text-sm outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-300"
                />
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  autoComplete={emailMode === 'register' ? 'new-password' : 'current-password'}
                  placeholder="密码（至少 6 位）"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 pl-11 pr-3 text-sm outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-300"
                />
              </div>

              {error && (
                <p className="text-xs text-rose-600 bg-rose-50 border border-rose-100 rounded-xl px-3 py-2">{error}</p>
              )}

              <button
                onClick={handleEmail}
                disabled={busy || !email.trim() || password.length < 6}
                className="w-full bg-gradient-to-r from-[#1f6b3f] to-[#5cb377] text-white font-black py-3.5 rounded-2xl flex justify-center items-center gap-2 shadow-lg shadow-emerald-500/25 active:scale-[0.97] transition-all disabled:opacity-50"
              >
                {busy ? <RefreshCw className="w-4 h-4 animate-spin" /> : null}
                {emailMode === 'register' ? '注册并登录' : '登录'}
              </button>

              <button
                onClick={() => { setError(null); setEmailMode(emailMode === 'register' ? 'login' : 'register'); }}
                disabled={busy}
                className="w-full text-center text-[13px] font-bold text-slate-400 hover:text-slate-600 transition-colors pt-1 disabled:opacity-60"
              >
                {emailMode === 'register' ? '已有账号？去登录' : '没有账号？去注册'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};
