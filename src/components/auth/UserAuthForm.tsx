import { useState } from 'react';
import {
  Mail, Lock, User, Sparkles, RefreshCw, Copy, Check,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import type { GuestCredentials } from '../../types/auth';

type AuthTab = 'login' | 'register';

function GoogleIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden>
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}

interface UserAuthFormProps {
  compact?: boolean;
  onSuccess?: () => void;
}

export function UserAuthForm({ compact, onSuccess }: UserAuthFormProps) {
  const auth = useAuth();
  const [tab, setTab] = useState<AuthTab>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [guestCreds, setGuestCreds] = useState<GuestCredentials | null>(null);
  const [copied, setCopied] = useState(false);

  const run = async (fn: () => Promise<void>) => {
    setBusy(true);
    setError(null);
    try {
      await fn();
      onSuccess?.();
    } catch (e) {
      setError(e instanceof Error ? e.message : '操作失败');
    } finally {
      setBusy(false);
    }
  };

  if (guestCreds) {
    return (
      <div className="space-y-3">
        <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3">
          <p className="text-sm font-black text-emerald-800">访客账号已创建</p>
          <p className="text-xs text-emerald-700 mt-1">凭证已落库，本设备会自动记住。</p>
        </div>
        <div className="bg-slate-50 rounded-xl p-3 space-y-1 text-xs font-mono">
          <p><span className="text-slate-400">账号 </span>{guestCreds.email}</p>
          <p><span className="text-slate-400">密码 </span>{guestCreds.password}</p>
        </div>
        <button
          type="button"
          onClick={async () => {
            const text = `账号：${guestCreds.email}\n密码：${guestCreds.password}`;
            await navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          }}
          className="w-full py-2.5 rounded-xl border border-slate-200 font-bold text-xs flex items-center justify-center gap-2"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? '已复制' : '复制凭证'}
        </button>
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${compact ? '' : 'bg-white rounded-2xl border border-slate-100 p-4 shadow-sm'}`}>
      {!compact && (
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">登录 / 注册</p>
      )}

      <button
        type="button"
        disabled={busy}
        onClick={() => run(auth.signInWithGoogle)}
        className="w-full py-3 rounded-xl border border-slate-200 bg-white font-bold text-sm flex items-center justify-center gap-3 hover:bg-slate-50 disabled:opacity-50"
      >
        <GoogleIcon />
        Google 登录
      </button>

      <button
        type="button"
        disabled={busy}
        onClick={async () => {
          setBusy(true);
          setError(null);
          try {
            const creds = await auth.signInAsGuest();
            setGuestCreds(creds);
            onSuccess?.();
          } catch (e) {
            setError(e instanceof Error ? e.message : '访客登录失败');
          } finally {
            setBusy(false);
          }
        }}
        className="w-full py-3 rounded-xl bg-slate-800 text-white font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50"
      >
        <Sparkles className="w-4 h-4" />
        访客体验
      </button>

      <div className="flex gap-1 p-1 bg-slate-100 rounded-xl">
        {(['login', 'register'] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => { setTab(t); setError(null); }}
            className={`flex-1 py-2 rounded-lg text-xs font-black ${
              tab === t ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'
            }`}
          >
            {t === 'login' ? '邮箱登录' : '注册'}
          </button>
        ))}
      </div>

      {tab === 'register' && (
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="昵称（可选）"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-3 text-sm outline-none focus:ring-2 focus:ring-emerald-500/30"
          />
        </div>
      )}

      <div className="relative">
        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="email"
          placeholder="邮箱"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-3 text-sm outline-none focus:ring-2 focus:ring-emerald-500/30"
        />
      </div>

      <div className="relative">
        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="password"
          placeholder="密码（至少 6 位）"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-3 text-sm outline-none focus:ring-2 focus:ring-emerald-500/30"
        />
      </div>

      {error && (
        <p className="text-xs text-rose-600 bg-rose-50 border border-rose-100 rounded-xl px-3 py-2">{error}</p>
      )}

      <button
        type="button"
        disabled={busy || !email.trim() || password.length < 6}
        onClick={() =>
          run(() =>
            tab === 'login'
              ? auth.signInWithEmail(email, password)
              : auth.signUpWithEmail(email, password, displayName),
          )
        }
        className="w-full py-3 rounded-xl bg-gradient-to-r from-[#2f7d4f] to-[#e07a3a] text-white font-black text-sm disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {busy ? <RefreshCw className="w-4 h-4 animate-spin" /> : null}
        {tab === 'login' ? '登录' : '注册并登录'}
      </button>
    </div>
  );
}
