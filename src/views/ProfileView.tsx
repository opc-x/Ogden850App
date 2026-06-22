import { useState } from 'react';
import { LogOut, Calendar, Shield, Mail } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useProgress } from '../contexts/ProgressContext';
import { useScenePracticeStats } from '../hooks/useScenePracticeStats';
import { UserAuthForm } from '../components/auth/UserAuthForm';
import { CompactProgressStrip } from '../components/profile/CompactProgressStrip';
import { UserAvatar } from '../components/profile/UserAvatar';

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

interface ProfileViewProps {
  totalWords: number;
  setActiveTab: (tab: string) => void;
}

function providerLabel(provider: string) {
  if (provider === 'google') return 'Google 账号';
  if (provider === 'guest') return '访客账号';
  return '邮箱账号';
}

export function ProfileView({ totalWords, setActiveTab }: ProfileViewProps) {
  const auth = useAuth();
  const { masteredCount, learningCount, progressPercent } = useProgress();
  const sceneStats = useScenePracticeStats();
  const [showEmailAuth, setShowEmailAuth] = useState(false);
  const [authBusy, setAuthBusy] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const joinedLabel = auth.profile?.createdAt
    ? new Date(auth.profile.createdAt).toLocaleDateString('zh-CN')
    : null;

  return (
    <div className="space-y-4 pb-4 max-w-lg mx-auto">
      <header className="px-1">
        <h2 className="text-2xl font-black text-slate-800 tracking-tight">我的</h2>
        <p className="text-sm text-slate-500 font-medium mt-0.5">账号信息与学习概览</p>
      </header>

      {auth.isAuthenticated && auth.profile ? (
        <section className="bg-gradient-to-br from-[#2f7d4f] via-[#e07a3a] to-amber-400 rounded-3xl p-5 text-white shadow-lg shadow-emerald-200/40">
          <div className="flex items-start gap-4">
            <UserAvatar profile={auth.profile} size="md" />
            <div className="min-w-0 flex-1">
              <p className="text-lg font-black truncate">{auth.profile.displayName ?? '学习者'}</p>
              <p className="text-sm text-white/85 truncate mt-0.5">{auth.profile.email}</p>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {auth.profile.isGuest && (
                  <span className="text-[9px] font-black px-2 py-0.5 rounded-md bg-white/20 border border-white/25">
                    访客
                  </span>
                )}
                <span className="text-[9px] font-black px-2 py-0.5 rounded-md bg-white/15 border border-white/20">
                  {providerLabel(auth.profile.authProvider)}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-4 text-xs">
            {joinedLabel && (
              <div className="flex items-center gap-1.5 bg-white/10 rounded-xl px-3 py-2 border border-white/15">
                <Calendar className="w-3.5 h-3.5 opacity-80" />
                <span className="font-semibold opacity-90">加入 {joinedLabel}</span>
              </div>
            )}
            <div className="flex items-center gap-1.5 bg-white/10 rounded-xl px-3 py-2 border border-white/15">
              <Shield className="w-3.5 h-3.5 opacity-80" />
              <span className="font-semibold opacity-90">学习中 {learningCount + masteredCount} 词</span>
            </div>
          </div>

          {auth.profile.isGuest && (
            <p className="text-[11px] text-white/80 mt-3 leading-relaxed bg-white/10 rounded-xl px-3 py-2 border border-white/15">
              访客凭证已保存在本设备。建议注册邮箱，换机也能继续学。
            </p>
          )}

          <button
            type="button"
            onClick={() => void auth.signOut()}
            className="mt-4 w-full py-2.5 rounded-xl bg-white/15 hover:bg-white/25 border border-white/25 font-bold text-sm flex items-center justify-center gap-2 transition-colors"
          >
            <LogOut className="w-4 h-4" /> 退出登录
          </button>
        </section>
      ) : (
        <section className="bg-white rounded-3xl border border-slate-100 shadow-sm p-5">
          <div className="flex flex-col items-center text-center pt-2 pb-1">
            <UserAvatar placeholder size="lg" />
            <p className="mt-3 text-lg font-black text-slate-800">未登录</p>
            <p className="text-xs text-slate-500 mt-1 max-w-[240px] leading-relaxed">
              登录后在此查看昵称、邮箱与学习档案；进度仍保存在本设备
            </p>
          </div>

          {!showEmailAuth ? (
            <div className="mt-5 space-y-2">
              <button
                type="button"
                disabled={authBusy}
                onClick={async () => {
                  setAuthBusy(true);
                  setAuthError(null);
                  try {
                    await auth.signInWithGoogle();
                  } catch (e) {
                    setAuthError(e instanceof Error ? e.message : 'Google 登录失败');
                  } finally {
                    setAuthBusy(false);
                  }
                }}
                className="w-full py-3 rounded-xl border border-slate-200 bg-white font-bold text-sm flex items-center justify-center gap-2 hover:bg-slate-50 disabled:opacity-50"
              >
                <GoogleIcon />
                Google 登录
              </button>
              <button
                type="button"
                disabled={authBusy}
                onClick={async () => {
                  setAuthBusy(true);
                  setAuthError(null);
                  try {
                    await auth.signInAsGuest();
                  } catch (e) {
                    setAuthError(e instanceof Error ? e.message : '访客登录失败');
                  } finally {
                    setAuthBusy(false);
                  }
                }}
                className="w-full py-3 rounded-xl bg-slate-800 text-white font-bold text-sm disabled:opacity-50"
              >
                访客体验
              </button>
              <button
                type="button"
                disabled={authBusy}
                onClick={() => { setAuthError(null); setShowEmailAuth(true); }}
                className="w-full py-3 rounded-xl border border-slate-200 text-slate-600 font-bold text-sm flex items-center justify-center gap-2 hover:bg-slate-50 disabled:opacity-50"
              >
                <Mail className="w-4 h-4" />
                邮箱登录 / 注册
              </button>
              {authError && (
                <p className="text-xs text-rose-600 bg-rose-50 border border-rose-100 rounded-xl px-3 py-2">{authError}</p>
              )}
            </div>
          ) : (
            <div className="mt-5">
              <UserAuthForm compact onSuccess={() => setShowEmailAuth(false)} />
              <button
                type="button"
                onClick={() => setShowEmailAuth(false)}
                className="mt-3 w-full text-center text-xs font-bold text-slate-400 hover:text-slate-600"
              >
                收起
              </button>
            </div>
          )}
        </section>
      )}

      <CompactProgressStrip
        wordCurrent={masteredCount}
        wordTotal={totalWords}
        wordPercent={progressPercent}
        sceneCurrent={sceneStats.practicedSceneCount}
        sceneTotal={sceneStats.totalSceneCount || 0}
        scenePercent={sceneStats.scenePercent}
        onWordsClick={() => setActiveTab('browser')}
        onScenesClick={() => setActiveTab('assembler')}
      />

      <button
        type="button"
        onClick={() => setActiveTab('stats')}
        className="w-full text-center text-xs font-bold text-slate-400 hover:text-[#2f7d4f] py-2"
      >
        查看详细学习统计 →
      </button>
    </div>
  );
}
