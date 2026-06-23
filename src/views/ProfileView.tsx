import { useState } from 'react';
import { LogOut, Mail } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useProgress } from '../contexts/ProgressContext';
import { useScenePracticeStats } from '../hooks/useScenePracticeStats';
import { UserAuthForm } from '../components/auth/UserAuthForm';
import { CompactProgressStrip } from '../components/profile/CompactProgressStrip';
import { EditableProfileIdentity } from '../components/profile/EditableProfileIdentity';
import { UserAvatar } from '../components/profile/UserAvatar';
import { LANDING_SURFACE_BG } from '../data/marketing';

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
  if (provider === 'google') return 'Google';
  if (provider === 'email') return '邮箱';
  return '';
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
    <div className="space-y-4 pb-4">
      <header className="px-1">
        <h2 className="text-2xl font-black text-slate-800 tracking-tight">我的</h2>
        <p className="text-sm text-slate-500 font-medium mt-0.5">账号信息与学习概览</p>
      </header>

      {auth.isAuthenticated && auth.profile ? (
        <section
          className="overflow-hidden rounded-3xl border border-emerald-100/80 shadow-sm"
          style={{ background: `linear-gradient(165deg, ${LANDING_SURFACE_BG} 0%, #ffffff 70%)` }}
        >
          <div className="px-5 pb-5 pt-6">
            <EditableProfileIdentity
              profile={auth.profile}
              onSave={async (patch) => auth.updateProfile(patch)}
              meta={
                <>
                  <div className="flex flex-wrap items-center justify-center gap-2">
                    {auth.profile.isGuest ? (
                      <span
                        data-testid="profile-guest-badge"
                        className="text-[10px] font-black px-2.5 py-1 rounded-full bg-emerald-50 text-[#2f7d4f] border border-emerald-100"
                      >
                        访客
                      </span>
                    ) : auth.profile.email ? (
                      <span
                        data-testid="profile-email"
                        className="max-w-[min(100%,18rem)] truncate text-xs font-semibold text-slate-500 px-2.5 py-1 rounded-full bg-white border border-slate-200"
                      >
                        {auth.profile.email}
                      </span>
                    ) : providerLabel(auth.profile.authProvider) ? (
                      <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-white text-slate-500 border border-slate-200">
                        {providerLabel(auth.profile.authProvider)}
                      </span>
                    ) : null}
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <div className="rounded-2xl border border-white/80 bg-white/70 px-3 py-2.5 text-center shadow-sm">
                      <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">加入</p>
                      <p className="mt-0.5 text-sm font-black tabular-nums text-slate-700">
                        {joinedLabel ?? '—'}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-white/80 bg-white/70 px-3 py-2.5 text-center shadow-sm">
                      <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">学习中</p>
                      <p className="mt-0.5 text-sm font-black tabular-nums text-[#2f7d4f]">
                        {learningCount + masteredCount} 词
                      </p>
                    </div>
                  </div>
                </>
              }
            />
          </div>

          <div className="border-t border-emerald-100/70 bg-white/50 px-5 py-3">
            <button
              type="button"
              data-testid="profile-sign-out"
              onClick={() => void auth.signOut()}
              className="flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-bold text-slate-500 transition-colors hover:bg-white hover:text-rose-600"
            >
              <LogOut className="h-4 w-4" />
              退出登录
            </button>
          </div>
        </section>
      ) : (
        <section className="bg-white rounded-3xl border border-slate-100 shadow-sm p-5">
          <div className="flex flex-col items-center text-center pt-2 pb-1">
            <UserAvatar placeholder size="lg" />
            <p className="mt-3 text-lg font-black text-slate-800">未登录</p>
            <p className="text-xs text-slate-500 mt-1 max-w-[240px] leading-relaxed">
              登录后在此查看学习档案；也可直接开始体验
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
                    await auth.ensureGuestSession();
                  } catch (e) {
                    setAuthError(e instanceof Error ? e.message : '进入失败，请重试');
                  } finally {
                    setAuthBusy(false);
                  }
                }}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-[#1f6b3f] to-[#5cb377] text-white font-bold text-sm flex items-center justify-center disabled:opacity-50"
              >
                开始体验
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
