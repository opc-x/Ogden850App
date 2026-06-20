import { LogOut, User as UserIcon, Calendar, Shield } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useProgress } from '../contexts/ProgressContext';
import { useScenePracticeStats } from '../hooks/useScenePracticeStats';
import { UserAuthForm } from '../components/auth/UserAuthForm';
import { CompactProgressStrip } from '../components/profile/CompactProgressStrip';

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
        <section className="bg-gradient-to-br from-[#c65a30] via-[#e07a3a] to-amber-400 rounded-3xl p-5 text-white shadow-lg shadow-orange-200/40">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center text-2xl font-black overflow-hidden shrink-0">
              {auth.profile.avatarUrl ? (
                <img src={auth.profile.avatarUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                (auth.profile.displayName ?? 'U').slice(0, 1).toUpperCase()
              )}
            </div>
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
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400">
              <UserIcon className="w-7 h-7" />
            </div>
            <div>
              <p className="font-black text-slate-800">尚未登录</p>
              <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                登录后可同步账号，访客也能一键体验
              </p>
            </div>
          </div>
          <UserAuthForm />
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
        className="w-full text-center text-xs font-bold text-slate-400 hover:text-[#c65a30] py-2"
      >
        查看详细学习统计 →
      </button>
    </div>
  );
}
