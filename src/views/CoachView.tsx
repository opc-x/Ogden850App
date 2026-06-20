import { useCallback, useEffect, useRef, useState, memo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles, ChevronLeft, Mic, MicOff, Send, RefreshCw, Volume2,
  MessageCircle, Target, Heart, Star, CheckCircle2, Keyboard,
} from 'lucide-react';
import { SceneCard } from '../components/assembler/SceneCard';
import { SceneCover } from '../components/assembler/SceneCover';
import { useSceneCatalog } from '../hooks/useSceneCatalog';
import { useSceneDialogues } from '../hooks/useSceneDialogues';
import { useSceneCoach } from '../hooks/useSceneCoach';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { speakText } from '../data/speak';
import type { SceneCatalogItem } from '../types/scene';
import type { CoachThreadItem, UserRole } from '../types/coach';

function MoodBadge({ mood, score }: { mood: string; score: number }) {
  const styles =
    mood === 'great'
      ? 'bg-amber-50 text-amber-700 border-amber-200'
      : mood === 'good'
        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
        : 'bg-orange-50 text-[#c65a30] border-orange-200';
  return (
    <span className={`text-[10px] font-black px-2 py-0.5 rounded-lg border ${styles}`}>
      {score} 分
    </span>
  );
}

function ThreadBubble({ item }: { item: CoachThreadItem }) {
  if (item.kind === 'system') {
    return (
      <p className="text-center text-[11px] text-slate-500 font-semibold px-4 py-1">
        {item.zh}
      </p>
    );
  }

  if (item.kind === 'partner') {
    return (
      <div className="flex justify-start">
        <div className="max-w-[88%] bg-white border border-slate-200 rounded-2xl rounded-tl-md px-4 py-3 shadow-sm">
          <p className="text-[10px] font-black text-cyan-600 mb-1">
            陪练 · {item.speaker === 'A' ? '甲' : '乙'}
          </p>
          <p className="text-sm font-bold text-slate-800 leading-relaxed">{item.en}</p>
          {item.zh && (
            <p className="text-xs text-slate-500 mt-2 pt-2 border-t border-slate-100">{item.zh}</p>
          )}
          {item.en && (
            <button
              type="button"
              onClick={() => speakText(item.en!, item.dialogueTurnId)}
              className="mt-2 text-[10px] font-bold text-cyan-600 flex items-center gap-1"
            >
              <Volume2 className="w-3 h-3" /> 再听一遍
            </button>
          )}
        </div>
      </div>
    );
  }

  if (item.kind === 'user') {
    return (
      <div className="flex justify-end">
        <div className="max-w-[88%] bg-gradient-to-br from-[#c65a30] to-[#e07a3a] text-white rounded-2xl rounded-tr-md px-4 py-3 shadow-md">
          <p className="text-[10px] font-black text-white/80 mb-1">你的尝试</p>
          <p className="text-sm font-bold leading-relaxed">{item.en}</p>
        </div>
      </div>
    );
  }

  const ev = item.eval!;
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex justify-center"
    >
      <div className="max-w-[95%] bg-gradient-to-br from-indigo-50 via-white to-orange-50 border border-indigo-100 rounded-2xl px-4 py-3.5 shadow-sm space-y-2">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[10px] font-black text-indigo-600 flex items-center gap-1">
            <Heart className="w-3.5 h-3.5" /> AI 陪练点评
          </span>
          <MoodBadge mood={ev.mood} score={ev.score} />
        </div>
        <p className="text-sm font-bold text-slate-800 leading-relaxed">{ev.encouragement}</p>
        {ev.correction && (
          <p className="text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2">
            更佳表达：{ev.correction}
          </p>
        )}
        <p className="text-[11px] text-slate-600 leading-relaxed">{ev.analysis}</p>
        <p className="text-[11px] text-indigo-700 font-semibold">💡 {ev.tip}</p>
        {!ev.passed && (
          <p className="text-[10px] text-[#c65a30] font-black">未达 70 分，再试一次这句吧～</p>
        )}
      </div>
    </motion.div>
  );
}

function CoachSceneCard({
  scene,
  onSelect,
}: {
  scene: SceneCatalogItem;
  onSelect: (s: SceneCatalogItem) => void;
}) {
  const handleClick = useCallback(() => onSelect(scene), [onSelect, scene]);
  return (
    <div>
      <SceneCard scene={scene} compact onClick={handleClick} />
    </div>
  );
}

const MemoCoachSceneCard = memo(CoachSceneCard);

function ScenePicker({
  scenes,
  loading,
  error,
  onSelect,
}: {
  scenes: SceneCatalogItem[];
  loading: boolean;
  error: string | null;
  onSelect: (s: SceneCatalogItem) => void;
}) {
  const ready = scenes.filter((s) => s.status === 'ready' && s.sentenceCount > 0);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <RefreshCw className="w-6 h-6 animate-spin text-orange-400" />
      </div>
    );
  }
  if (error) return <p className="text-sm text-rose-600 text-center py-8">{error}</p>;

  return (
    <div className="space-y-4">
      <header className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-violet-600 to-[#c65a30] p-5 shadow-lg">
        <div className="absolute -right-6 -top-6 w-28 h-28 bg-white/10 rounded-full blur-2xl" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-5 h-5 text-amber-200" />
            <span className="text-[10px] font-black text-white/80 uppercase tracking-widest">
              场景限定 · DeepSeek 陪练
            </span>
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">AI 场景陪练</h2>
          <p className="text-sm text-white/90 font-medium mt-2 leading-relaxed">
            从场景口语选场景，只练该剧情里的台词。可语音可说字，AI 暖心纠错打分。
          </p>
        </div>
      </header>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {ready.map((scene) => (
          <MemoCoachSceneCard key={scene.slug} scene={scene} onSelect={onSelect} />
        ))}
      </div>
      {ready.length === 0 && (
        <p className="text-sm text-slate-500 text-center py-8">暂无可用场景对话，请先在场景口语生成内容。</p>
      )}
    </div>
  );
}

function BriefingPanel({
  scene,
  turnsLoading,
  turnsError,
  turnCount,
  userRole,
  onRoleChange,
  onStart,
  onBack,
}: {
  scene: SceneCatalogItem;
  turnsLoading: boolean;
  turnsError: string | null;
  turnCount: number;
  userRole: UserRole;
  onRoleChange: (r: UserRole) => void;
  onStart: () => void;
  onBack: () => void;
}) {
  return (
    <div className="space-y-4">
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-1.5 text-sm font-bold text-[#c65a30]"
      >
        <ChevronLeft className="w-4 h-4" /> 换场景
      </button>

      <div className="bg-white border border-orange-100 rounded-3xl overflow-hidden shadow-sm">
        <SceneCover
          slug={scene.slug}
          gradient={scene.gradient}
          titleZh={scene.titleZh}
          className="aspect-[5/2] w-full rounded-none"
        />
        <div className="p-5 space-y-4">
          <div>
            <h3 className="text-xl font-black text-slate-800">{scene.titleZh}</h3>
            <p className="text-xs text-slate-500 mt-1">{scene.storyHook}</p>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-600 bg-slate-50 rounded-xl px-3 py-2 border border-slate-100">
            <Target className="w-4 h-4 text-[#c65a30] shrink-0" />
            <span>
              陪练范围锁定本场景
              {turnsLoading ? '…' : ` ${turnCount} 句`}台词，不跑题、不闲聊。
            </span>
          </div>

          {turnsError && <p className="text-xs text-rose-500">{turnsError}</p>}

          <div>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider mb-2">
              你要扮演
            </p>
            <div className="flex gap-2">
              {(['A', 'B'] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => onRoleChange(r)}
                  className={`flex-1 py-3 rounded-xl text-sm font-black border transition-all ${
                    userRole === r
                      ? 'bg-[#c65a30] text-white border-[#c65a30] shadow-md'
                      : 'bg-white text-slate-600 border-slate-200'
                  }`}
                >
                  {r === 'A' ? '甲（A）' : '乙（B）'}
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            disabled={turnsLoading || !!turnsError || turnCount === 0}
            onClick={onStart}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-black text-sm shadow-lg disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            <MessageCircle className="w-5 h-5" />
            开始情景陪练
          </button>
        </div>
      </div>
    </div>
  );
}

export function CoachView() {
  const { scenes, loading, error } = useSceneCatalog();
  const coach = useSceneCoach();
  const { turns, loading: turnsLoading, error: turnsError } = useSceneDialogues(
    coach.phase === 'briefing' || coach.phase === 'practice' ? coach.scene?.sceneKey ?? null : null,
  );
  const speech = useSpeechRecognition();
  const threadEndRef = useRef<HTMLDivElement>(null);
  const [inputMode, setInputMode] = useState<'voice' | 'type'>('type');

  useEffect(() => {
    threadEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [coach.thread, coach.evaluating]);

  useEffect(() => {
    if (speech.transcript) coach.setInput(speech.transcript);
  }, [speech.transcript]);

  const handleStart = () => {
    if (!coach.scene || !turns.length) return;
    void coach.beginPractice(coach.scene, turns, coach.userRole);
  };

  if (coach.phase === 'complete' && coach.scene) {
    return (
      <div className="max-w-lg mx-auto space-y-5 py-4">
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-3xl border border-emerald-200 p-8 text-center shadow-lg"
        >
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-50 flex items-center justify-center">
            <CheckCircle2 className="w-9 h-9 text-emerald-500" />
          </div>
          <h3 className="text-xl font-black text-slate-800">场景练完啦！</h3>
          <p className="text-sm text-slate-600 mt-2 leading-relaxed">
            「{coach.scene.titleZh}」{coach.totalUserTurns} 句台词你都练到了。
            真实生活里说出来会更有底气。
          </p>
          <div className="flex justify-center gap-1 mt-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
            ))}
          </div>
          <button
            type="button"
            onClick={coach.reset}
            className="mt-6 w-full py-3.5 rounded-xl bg-[#c65a30] text-white font-black text-sm"
          >
            再选一个场景
          </button>
        </motion.div>
      </div>
    );
  }

  if (coach.phase === 'practice') {
    return (
      <div className="max-w-2xl mx-auto flex flex-col h-[calc(100vh-14rem)] md:h-[72vh] gap-3">
        <div className="bg-white rounded-2xl border border-orange-100 px-4 py-3 shadow-sm flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={coach.reset}
            className="text-[#c65a30] font-bold text-xs flex items-center gap-0.5 shrink-0"
          >
            <ChevronLeft className="w-4 h-4" /> 退出
          </button>
          <div className="min-w-0 flex-1 text-center">
            <p className="text-xs font-black text-slate-800 truncate">{coach.scene?.titleZh}</p>
            <p className="text-[10px] text-slate-500">
              你扮{coach.userRole === 'A' ? '甲' : '乙'} · {coach.completedUserTurns}/{coach.totalUserTurns} 句
            </p>
          </div>
          <span className="text-[10px] font-black text-indigo-600 shrink-0">{coach.progressPct}%</span>
        </div>

        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-indigo-500 to-[#c65a30]"
            animate={{ width: `${coach.progressPct}%` }}
          />
        </div>

        <div className="flex-1 overflow-y-auto rounded-3xl bg-slate-50/80 border border-slate-200 p-4 space-y-4">
          <AnimatePresence>
            {coach.thread.map((item) => (
              <div key={item.id}>
                <ThreadBubble item={item} />
              </div>
            ))}
          </AnimatePresence>
          {coach.evaluating && (
            <div className="flex justify-center">
              <span className="text-xs font-bold text-indigo-600 flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-indigo-100">
                <RefreshCw className="w-4 h-4 animate-spin" /> DeepSeek 陪练正在点评…
              </span>
            </div>
          )}
          <div ref={threadEndRef} />
        </div>

        {coach.isUserTurn && coach.currentTurn && (
          <div className="bg-amber-50 border border-amber-100 rounded-xl px-3 py-2 text-[11px] text-amber-900 font-semibold">
            提示：{coach.currentTurn.zh || '试着用英文说出你的台词'}
          </div>
        )}

        <div className="bg-white rounded-2xl border border-slate-100 p-2 shadow-sm space-y-2">
          <div className="flex gap-1 px-1">
            <button
              type="button"
              onClick={() => setInputMode('type')}
              className={`flex-1 py-1.5 rounded-lg text-[10px] font-black flex items-center justify-center gap-1 ${
                inputMode === 'type' ? 'bg-slate-100 text-slate-800' : 'text-slate-400'
              }`}
            >
              <Keyboard className="w-3.5 h-3.5" /> 打字
            </button>
            <button
              type="button"
              onClick={() => setInputMode('voice')}
              disabled={!speech.supported}
              className={`flex-1 py-1.5 rounded-lg text-[10px] font-black flex items-center justify-center gap-1 ${
                inputMode === 'voice' ? 'bg-slate-100 text-slate-800' : 'text-slate-400'
              } ${!speech.supported ? 'opacity-40' : ''}`}
            >
              <Mic className="w-3.5 h-3.5" /> 语音
            </button>
          </div>

          <div className="flex gap-2">
            {inputMode === 'voice' ? (
              <button
                type="button"
                onClick={() => (speech.listening ? speech.stop() : speech.start())}
                disabled={!coach.isUserTurn || coach.evaluating}
                className={`flex-1 py-4 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-all ${
                  speech.listening
                    ? 'bg-rose-500 text-white animate-pulse'
                    : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                } disabled:opacity-40`}
              >
                {speech.listening ? (
                  <>
                    <MicOff className="w-5 h-5" /> 停止录音
                  </>
                ) : (
                  <>
                    <Mic className="w-5 h-5" /> 按住说话
                  </>
                )}
              </button>
            ) : (
              <input
                type="text"
                value={coach.input}
                onChange={(e) => coach.setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && void coach.submitAttempt()}
                disabled={!coach.isUserTurn || coach.evaluating}
                placeholder={
                  coach.isUserTurn ? '输入你的英文台词…' : '等陪练说完你的回合…'
                }
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold outline-none focus:ring-2 focus:ring-indigo-500/30 disabled:opacity-50"
              />
            )}
            <button
              type="button"
              onClick={() => void coach.submitAttempt()}
              disabled={!coach.isUserTurn || !coach.input.trim() || coach.evaluating}
              className="px-5 rounded-xl bg-[#c65a30] text-white disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 transition-all"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (coach.phase === 'briefing' && coach.scene) {
    return (
      <BriefingPanel
        scene={coach.scene}
        turnsLoading={turnsLoading}
        turnsError={turnsError}
        turnCount={turns.length}
        userRole={coach.userRole}
        onRoleChange={coach.setUserRole}
        onStart={handleStart}
        onBack={coach.reset}
      />
    );
  }

  return (
    <ScenePicker
      scenes={scenes}
      loading={loading}
      error={error}
      onSelect={coach.selectScene}
    />
  );
}
