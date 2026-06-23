import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Image, Headphones, Mic, BrainCircuit, RefreshCw, Mail, Lock, X } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import {
  WORD_COUNT,
  SCENE_TARGET_COUNT,
  DIALOGUE_MARKETING_LABEL,
  COVERAGE_MARKETING_LABEL,
  MARKETING_SUBHEADLINE,
  MARKETING_BEFORE_AFTER,
  MARKETING_HERO_BADGE,
  LANDING_FEATURES,
  BRAND_GRADIENT,
  BRAND_GRADIENT_HOVER,
  LANDING_SURFACE_BG,
  LANDING_BORDER_GRADIENT,
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

const FEATURE_ICONS: LucideIcon[] = [BrainCircuit, Image, Headphones, Mic];

const PAIN_HIGHLIGHT = 'English words';

function PainHook() {
  const text = MARKETING_BEFORE_AFTER.before;
  const idx = text.indexOf(PAIN_HIGHLIGHT);
  if (idx < 0) return <>{text}？</>;
  return (
    <>
      {text.slice(0, idx)}
      <span
        style={{ backgroundImage: BRAND_GRADIENT }}
        className="bg-clip-text text-transparent"
      >
        {PAIN_HIGHLIGHT}
      </span>
      {text.slice(idx + PAIN_HIGHLIGHT.length)}？
    </>
  );
}

export const LandingPage: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const auth = useAuth();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 邮箱注册 / 登录抽屉
  const [emailSheet, setEmailSheet] = useState(false);
  const [emailMode, setEmailMode] = useState<'register' | 'login'>('register');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const ensureIdentity = async () => {
    await auth.ensureGuestSession();
  };

  const handleStart = async () => {
    setBusy(true);
    setError(null);
    try {
      localStorage.setItem('ogden850_has_seen_onboarding', 'true');
      await ensureIdentity();
      onComplete();
    } catch (e) {
      setError(e instanceof Error ? e.message : '进入失败，请重试');
    } finally {
      setBusy(false);
    }
  };

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
    <div className="relative w-full h-full overflow-hidden bg-gradient-to-b from-[#e8f5ec] via-[#f3faf5] to-white flex flex-col pt-safe pb-safe">
      {/* 柔和光晕背景 */}
      <div className="pointer-events-none absolute -top-24 -right-16 h-64 w-64 rounded-full bg-[#a8d5b8]/35 blur-3xl" />
      <div className="pointer-events-none absolute top-1/3 -left-20 h-56 w-56 rounded-full bg-[#c5e6d0]/25 blur-3xl" />

      <div className="relative flex-1 w-full flex flex-col px-6 pt-10 overflow-y-auto">
        {/* 品牌 */}
        <motion.div {...fadeUp} transition={{ duration: 0.5 }}>
          <span
            style={{
              fontFamily: "'Pacifico', cursive",
              backgroundImage: BRAND_GRADIENT,
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
          用最少的词，
          <br />
          说
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1f6b3f] to-[#5cb377]">
            最多的话
          </span>
        </motion.h1>

        <motion.p
          {...fadeUp}
          transition={{ duration: 0.5, delay: 0.16 }}
          className="mt-6 text-[15px] font-bold text-slate-700 text-pretty"
        >
          <PainHook />
        </motion.p>

        <motion.p
          {...fadeUp}
          transition={{ duration: 0.5, delay: 0.22 }}
          className="mt-2 text-[15px] leading-relaxed font-semibold max-w-[320px] text-pretty"
        >
          <span
            style={{ backgroundImage: 'linear-gradient(105deg, #64748b 0%, #4a7c62 52%, #2f7d4f 100%)' }}
            className="bg-clip-text text-transparent"
          >
            {MARKETING_SUBHEADLINE}
          </span>
        </motion.p>

        {/* 一行价值锚点 */}
        <motion.div
          {...fadeUp}
          transition={{ duration: 0.5, delay: 0.28 }}
          className="mt-5 w-fit max-w-full rounded-full p-px"
          style={{ background: LANDING_BORDER_GRADIENT }}
        >
          <div
            className="inline-flex flex-wrap items-center gap-x-1.5 gap-y-1 rounded-full px-3.5 py-2 text-[11px] font-semibold text-slate-600"
            style={{ background: LANDING_SURFACE_BG }}
          >
            <span className="tabular-nums text-[#2f7d4f]">{WORD_COUNT}</span>
            <span>核心词根</span>
            <span aria-hidden className="text-slate-300">×</span>
            <span className="tabular-nums text-[#2f7d4f]">{SCENE_TARGET_COUNT}</span>
            <span>场景</span>
            <span aria-hidden className="text-slate-300">≈</span>
            <span className="tabular-nums text-[#2f7d4f]">{DIALOGUE_MARKETING_LABEL}</span>
            <span>句</span>
            <span aria-hidden className="text-slate-300">·</span>
            <span className="text-[#2f7d4f]">{COVERAGE_MARKETING_LABEL} 生活口语</span>
          </div>
        </motion.div>

        {/* 卖点 — 竖排 */}
        <div className="mt-5 space-y-2.5">
          {LANDING_FEATURES.map((f, i) => {
            const Icon = FEATURE_ICONS[i];
            return (
              <motion.div
                key={f.title}
                {...fadeUp}
                transition={{ duration: 0.5, delay: 0.36 + i * 0.06 }}
                className="rounded-xl p-px"
                style={{ background: LANDING_BORDER_GRADIENT }}
              >
                <div
                  className="flex items-center gap-3.5 rounded-[11px] px-3.5 py-3"
                  style={{ background: LANDING_SURFACE_BG }}
                >
                  <Icon className="h-5 w-5 shrink-0 text-[#3d6b52]" />
                  <div>
                    <h3 className="text-sm font-bold text-slate-800">{f.title}</h3>
                    <p className="mt-0.5 text-xs leading-relaxed text-slate-500">{f.desc}</p>
                  </div>
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
        className="relative w-full px-6 pt-4 pb-6 shrink-0"
      >
        <button
          type="button"
          data-testid="landing-start"
          onClick={() => void handleStart()}
          disabled={busy}
          style={{ backgroundImage: BRAND_GRADIENT }}
          onMouseEnter={(e) => { if (!busy) e.currentTarget.style.backgroundImage = BRAND_GRADIENT_HOVER; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundImage = BRAND_GRADIENT; }}
          className="group w-full text-white font-black py-4 rounded-2xl flex justify-center items-center gap-2 shadow-md shadow-[#2f7d4f]/20 active:scale-[0.97] transition-all text-lg disabled:opacity-60"
        >
          开始体验
          <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
        </button>

        {error && !emailSheet && (
          <p className="mt-2 text-center text-xs text-rose-600">{error}</p>
        )}

        <div className="mt-3 grid grid-cols-2 gap-3">
          <button
            type="button"
            data-testid="landing-google"
            onClick={() => void handleGoogle()}
            disabled={busy}
            className="bg-white/90 border border-[#d4eadc] text-slate-600 font-bold py-3 rounded-2xl flex justify-center items-center gap-2 active:scale-[0.97] transition-all text-sm disabled:opacity-60"
          >
            {busy ? <RefreshCw className="w-4 h-4 animate-spin" /> : <GoogleIcon />}
            谷歌登录
          </button>
          <button
            type="button"
            data-testid="landing-email"
            onClick={() => { setError(null); setEmailMode('register'); setEmailSheet(true); }}
            disabled={busy}
            className="bg-white/90 border border-[#d4eadc] text-slate-600 font-bold py-3 rounded-2xl flex justify-center items-center gap-2 active:scale-[0.97] transition-all text-sm disabled:opacity-60"
          >
            <Mail className="w-4 h-4" />
            邮箱登录
          </button>
        </div>

        <p className="mt-3 text-center text-[11px] font-semibold text-slate-500">
          {MARKETING_HERO_BADGE}
        </p>
        <p className="mt-1 text-center text-[10px] font-medium text-slate-400/90">
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
                type="button"
                data-testid="email-submit"
                onClick={() => void handleEmail()}
                disabled={busy || !email.trim() || password.length < 6}
                style={{ backgroundImage: BRAND_GRADIENT }}
                className="w-full text-white font-black py-3.5 rounded-2xl flex justify-center items-center gap-2 shadow-md shadow-[#2f7d4f]/20 active:scale-[0.97] transition-all disabled:opacity-50"
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
