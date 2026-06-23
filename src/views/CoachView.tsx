import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Mic, Send, RefreshCw, Volume2, Keyboard,
  RotateCcw, Languages, Lightbulb, X,
} from 'lucide-react';
import { CoachSceneStrip } from '../components/coach/CoachSceneStrip';
import { CoachSceneHero } from '../components/coach/CoachSceneHero';
import { CoachAvatar } from '../components/coach/CoachAvatar';
import { CoachConfetti } from '../components/coach/CoachConfetti';
import { CoachFeedbackStrip } from '../components/coach/CoachFeedbackStrip';
import { useSceneCatalog } from '../hooks/useSceneCatalog';
import { useSceneDialogues } from '../hooks/useSceneDialogues';
import { useSceneCoach } from '../hooks/useSceneCoach';
import { useCoachFeedbackEnabled } from '../hooks/useCoachFeedbackEnabled';
import { useHoldToSpeak } from '../hooks/useHoldToSpeak';
import { speakText } from '../data/speak';
import { getOgdenLemmaHits } from '../lib/coachOgdenHits';
import { CharacterAvatar, fallbackCharacter } from '../components/scene/CharacterAvatar';
import { DialogueBubbleActions } from '../components/dialogue/DialogueBubbleActions';
import type { SceneCatalogItem, DialogueTurn, SceneCharacters } from '../types/scene';
import type { CoachThreadItem, UserRole } from '../types/coach';

const COACH_SCENE_KEY = 'ogden850_coach_scene';

function CoachRoleChip({
  role,
  character,
  isUser,
  isSpeaking,
  onSelect,
}: {
  role: UserRole;
  character: SceneCharacters[UserRole];
  isUser: boolean;
  isSpeaking: boolean;
  onSelect: (role: UserRole) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(role)}
      title={isUser ? `你扮演 ${character.name}` : `陪练 ${character.name}`}
      className={`inline-flex max-w-[46%] items-center gap-1 rounded-full border px-2 py-0.5 transition-all duration-300 active:scale-[0.97] ${
        isSpeaking
          ? 'border-amber-400 bg-amber-50/90 shadow-[0_0_0_3px_rgba(251,191,36,0.35),0_0_14px_rgba(251,191,36,0.25)] scale-[1.04] animate-pulse'
          : isUser
            ? 'border-[#2f7d4f]/30 bg-emerald-50/60'
            : 'border-slate-100 bg-white'
      }`}
    >
      <span className="text-sm leading-none">{character.emoji}</span>
      <span className="truncate text-[10px] font-bold text-slate-700">{character.name}</span>
      {isUser ? (
        <span className="shrink-0 text-[9px] font-black text-[#2f7d4f]">你</span>
      ) : (
        <span className="shrink-0 text-[9px] font-semibold text-slate-400">陪练</span>
      )}
    </button>
  );
}

function ChatDialogueBubble({
  en,
  zh,
  speaker,
  align,
  onSpeak,
  bubbleClass,
  hintMode = false,
  characters,
  speaking = false,
}: {
  en: string;
  zh?: string;
  speaker: 'A' | 'B';
  align: 'left' | 'right';
  onSpeak?: () => void;
  bubbleClass: string;
  hintMode?: boolean;
  characters: SceneCharacters;
  speaking?: boolean;
}) {
  const [cnVisible, setCnVisible] = useState(false);
  const isSelf = align === 'right' && !hintMode;
  const showTools = !isSelf || hintMode;

  return (
    <div className={`flex items-end gap-2 ${align === 'right' ? 'flex-row-reverse' : ''}`}>
      <CharacterAvatar
        speaker={speaker}
        character={characters[speaker]}
        isSelf={align === 'right'}
        speaking={speaking}
        size="sm"
      />
      <div
        className={`min-w-0 max-w-[78%] rounded-lg px-2.5 py-1.5 text-[13px] leading-[1.45] font-normal ${bubbleClass}`}
      >
        <div className="flex items-center">
          <p className={`min-w-0 flex-1 ${isSelf ? 'text-slate-900' : 'text-slate-800'}`}>{en}</p>
          {showTools && (
            <DialogueBubbleActions
              onSpeak={onSpeak}
              zh={zh}
              zhVisible={cnVisible}
              onToggleZh={() => setCnVisible((v) => !v)}
            />
          )}
        </div>
        {showTools && cnVisible && zh && (
          <p className="mt-1 text-[11px] text-slate-400 leading-relaxed border-t border-slate-100/80 pt-1">
            {zh}
          </p>
        )}
      </div>
    </div>
  );
}

function ThreadBubble({
  item,
  userRole,
  onReplayReference,
  characters,
  speakingRole,
  onQueueSpeaker,
}: {
  item: CoachThreadItem;
  userRole: UserRole;
  onReplayReference?: (en: string, turnId?: number) => void;
  characters: SceneCharacters;
  speakingRole: UserRole | null;
  onQueueSpeaker: (speaker: UserRole) => void;
}) {
  if (item.kind === 'system') {
    return (
      <p className="text-center text-[10px] text-rose-500 font-medium px-4 py-1">
        {item.zh}
      </p>
    );
  }

  if (item.kind === 'partner') {
    const speaker = item.speaker ?? 'A';
    return (
      <ChatDialogueBubble
        en={item.en!}
        zh={item.zh}
        speaker={speaker}
        align="left"
        characters={characters}
        speaking={speakingRole === speaker}
        onSpeak={() => {
          onQueueSpeaker(speaker);
          speakText(item.en!, item.dialogueTurnId);
        }}
        bubbleClass="bg-white text-slate-800 shadow-sm"
      />
    );
  }

  if (item.kind === 'user') {
    const speaker = item.speaker ?? userRole;
    return (
      <ChatDialogueBubble
        en={item.en!}
        speaker={speaker}
        align="right"
        characters={characters}
        speaking={speakingRole === speaker}
        bubbleClass="bg-[#95ec69] text-slate-900"
      />
    );
  }

  if (item.kind === 'feedback' && item.eval) {
    return <CoachFeedbackStrip ev={item.eval} />;
  }

  return null;
}

export function CoachView({ compactChrome = false }: { compactChrome?: boolean } = {}) {
  const { scenes, loading: scenesLoading, error: scenesError } = useSceneCatalog();
  const { feedbackEnabled, setFeedbackEnabled } = useCoachFeedbackEnabled();
  const [inputMode, setInputMode] = useState<'voice' | 'type'>('type');
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const coach = useSceneCoach(feedbackEnabled, inputMode === 'voice');
  const threadEndRef = useRef<HTMLDivElement>(null);
  const bootRef = useRef<string | null>(null);
  const pendingSpeakerRef = useRef<UserRole | null>(null);

  const [speakingRole, setSpeakingRole] = useState<UserRole | null>(null);

  const [scriptHintOpen, setScriptHintOpen] = useState(false);
  const [sceneExpanded, setSceneExpanded] = useState(false);
  const [hintZhVisible, setHintZhVisible] = useState(false);
  const [confettiBurst, setConfettiBurst] = useState(0);
  const [confettiHits, setConfettiHits] = useState<string[]>([]);
  const [selectedSlug, setSelectedSlug] = useState<string | null>(() => {
    try {
      return localStorage.getItem(COACH_SCENE_KEY);
    } catch {
      return null;
    }
  });

  const readyScenes = useMemo(
    () => scenes.filter((s) => s.status === 'ready' && s.sentenceCount > 0),
    [scenes],
  );

  const activeScene: SceneCatalogItem | null = useMemo(() => {
    if (!readyScenes.length) return null;
    return readyScenes.find((s) => s.slug === selectedSlug) ?? readyScenes[0];
  }, [readyScenes, selectedSlug]);

  const { turns, loading: turnsLoading, error: turnsError } = useSceneDialogues(
    activeScene?.sceneKey ?? null,
  );

  const sceneCharacters = useMemo((): SceneCharacters => {
    const a = turns.find((t) => t.speaker === 'A');
    const b = turns.find((t) => t.speaker === 'B');
    return {
      A: a ? { name: a.speakerZh, emoji: a.speakerEmoji } : fallbackCharacter('A'),
      B: b ? { name: b.speakerZh, emoji: b.speakerEmoji } : fallbackCharacter('B'),
    };
  }, [turns]);

  const handleReplayReference = useCallback((en: string, turnId?: number) => {
    void speakText(en, turnId);
  }, []);

  const queueSpeakerHighlight = useCallback((speaker: UserRole) => {
    pendingSpeakerRef.current = speaker;
    setSpeakingRole(speaker);
  }, []);

  useEffect(() => {
    const last = coach.thread[coach.thread.length - 1];
    if (!last?.speaker) return;
    if (last.kind !== 'partner' && last.kind !== 'user') return;
    pendingSpeakerRef.current = last.speaker;
    setSpeakingRole(last.speaker);
    const fallback = window.setTimeout(() => {
      setSpeakingRole((current) => (current === last.speaker ? null : current));
    }, 4500);
    return () => clearTimeout(fallback);
  }, [coach.thread]);

  useEffect(() => {
    const onStart = () => {
      if (pendingSpeakerRef.current) {
        setSpeakingRole(pendingSpeakerRef.current);
      }
    };
    const onEnd = () => setSpeakingRole(null);
    window.addEventListener('ogden:audio-start', onStart);
    window.addEventListener('ogden:audio-end', onEnd);
    return () => {
      window.removeEventListener('ogden:audio-start', onStart);
      window.removeEventListener('ogden:audio-end', onEnd);
    };
  }, []);

  const startSession = useCallback(
    (scene: SceneCatalogItem, dialogueTurns: DialogueTurn[], role: UserRole) => {
      void coach.beginPractice(scene, dialogueTurns, role);
    },
    [coach.beginPractice],
  );

  useEffect(() => {
    if (!activeScene || turnsLoading || !turns.length) return;
    const bootId = `${activeScene.slug}:${coach.userRole}`;
    if (bootRef.current === bootId && coach.scene?.slug === activeScene.slug) return;
    bootRef.current = bootId;
    startSession(activeScene, turns, coach.userRole);
  }, [activeScene, turns, turnsLoading, coach.userRole, coach.scene?.slug, startSession]);

  useEffect(() => {
    threadEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [coach.thread, coach.evaluating]);

  useEffect(() => {
    setVoiceError(null);
  }, [coach.currentTurn?.id, inputMode]);

  const handleSceneChange = (slug: string) => {
    setSelectedSlug(slug);
    bootRef.current = null;
    try {
      localStorage.setItem(COACH_SCENE_KEY, slug);
    } catch {
      /* ignore */
    }
  };

  const handleRoleChange = (role: UserRole) => {
    if (role === coach.userRole) return;
    coach.setUserRole(role);
    bootRef.current = null;
    if (activeScene && turns.length) {
      startSession(activeScene, turns, role);
    }
  };

  const handleRestart = () => {
    bootRef.current = null;
    if (activeScene && turns.length) {
      startSession(activeScene, turns, coach.userRole);
    }
  };

  useEffect(() => {
    setSceneExpanded(false);
  }, [activeScene?.slug]);

  useEffect(() => {
    setScriptHintOpen(false);
    setHintZhVisible(false);
  }, [coach.currentTurn?.id]);

  const inputDisabled = !coach.isUserTurn || coach.evaluating || coach.isComplete;

  const handleSubmitAttempt = useCallback(
    (attemptOverride?: string) => {
      const attempt = (attemptOverride ?? coach.input).trim();
      if (!attempt || inputDisabled) return;
      const hits = getOgdenLemmaHits(attempt);
      if (hits.length > 0) {
        setConfettiHits(hits);
        setConfettiBurst((k) => k + 1);
      }
      void coach.submitAttempt(attemptOverride);
    },
    [coach.input, coach.submitAttempt, inputDisabled],
  );

  const holdSpeak = useHoldToSpeak({
    disabled: inputDisabled,
    onTranscript: async (text) => {
      setVoiceError(null);
      coach.setInput(text);
      handleSubmitAttempt(text);
    },
    onError: (message) => setVoiceError(message),
  });

  return (
    <div className="flex flex-col flex-1 min-h-0 w-full">
      {/* 场景 hero + 控制条 */}
      <div className="shrink-0 pb-2.5 border-b border-slate-100 px-3 space-y-2">
        <div className="relative">
          <CoachSceneHero
            scene={activeScene}
            loading={scenesLoading}
            expanded={sceneExpanded}
            onExpand={() => setSceneExpanded(true)}
            onCollapse={() => setSceneExpanded(false)}
            compact={compactChrome}
          />
          {confettiBurst > 0 ? (
            <CoachConfetti burstKey={confettiBurst} hits={confettiHits} />
          ) : null}
        </div>

        <CoachSceneStrip
          scenes={readyScenes}
          activeSlug={activeScene?.slug ?? null}
          loading={scenesLoading}
          onSelect={handleSceneChange}
          compact={compactChrome}
        />

        <div className="flex items-center gap-1 px-0.5">
          <CoachRoleChip
            role="A"
            character={sceneCharacters.A}
            isUser={coach.userRole === 'A'}
            isSpeaking={speakingRole === 'A'}
            onSelect={handleRoleChange}
          />
          <span className="text-[10px] font-medium text-slate-300 shrink-0">对</span>
          <CoachRoleChip
            role="B"
            character={sceneCharacters.B}
            isUser={coach.userRole === 'B'}
            isSpeaking={speakingRole === 'B'}
            onSelect={handleRoleChange}
          />
          <button
            type="button"
            role="switch"
            aria-checked={feedbackEnabled}
            onClick={() => setFeedbackEnabled(!feedbackEnabled)}
            className={`ml-auto inline-flex shrink-0 items-center gap-1 rounded-full border px-1.5 py-0.5 transition-colors active:scale-[0.97] ${
              feedbackEnabled
                ? 'border-amber-200 bg-amber-50/80'
                : 'border-slate-100 bg-white'
            }`}
            title={feedbackEnabled ? '关闭教练' : '开启教练'}
          >
            <CoachAvatar size="xs" />
            <span className="text-[10px] font-semibold text-slate-600">教练</span>
            <span
              className={`relative h-3.5 w-6 shrink-0 rounded-full transition-colors ${
                feedbackEnabled ? 'bg-amber-400' : 'bg-slate-200'
              }`}
            >
              <span
                className={`absolute top-0.5 h-2.5 w-2.5 rounded-full bg-white shadow transition-transform ${
                  feedbackEnabled ? 'left-3' : 'left-0.5'
                }`}
              />
            </span>
          </button>
          <span className="text-[10px] font-bold text-slate-400 tabular-nums shrink-0">
            {coach.completedUserTurns}/{coach.totalUserTurns || '—'}
          </span>
        </div>

        <div className="flex items-center gap-2 px-0.5">
          <div className="flex-1 h-1 bg-slate-100 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-[#2f7d4f] rounded-full"
              animate={{ width: `${coach.progressPct}%` }}
              transition={{ duration: 0.35 }}
            />
          </div>
          <span className="sr-only tabular-nums">
            {coach.completedUserTurns}/{coach.totalUserTurns || '—'}
          </span>
          {coach.isComplete && (
            <button
              type="button"
              onClick={handleRestart}
              className="text-[10px] font-bold text-[#2f7d4f] flex items-center gap-0.5"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {(scenesError || turnsError) && (
        <p className="text-xs text-rose-600 text-center py-1 shrink-0">{scenesError || turnsError}</p>
      )}

      {/* 对话主区 — 从上往下排列，新消息在底部并自动滚到底 */}
      <div
        className={`flex-1 min-h-0 overflow-y-auto w-full bg-[#ededed]${compactChrome ? ' min-h-[14rem]' : ''}`}
      >
        <div className="w-full flex flex-col py-2 px-3 space-y-3">
          {(scenesLoading || turnsLoading) && coach.thread.length === 0 && (
            <div className="flex justify-center py-8">
              <RefreshCw className="w-5 h-5 animate-spin text-emerald-400" />
            </div>
          )}

          <AnimatePresence>
            {coach.thread
              .filter((item) => feedbackEnabled || item.kind !== 'feedback')
              .map((item) => (
              <div key={item.id}>
                <ThreadBubble
                  item={item}
                  userRole={coach.userRole}
                  characters={sceneCharacters}
                  speakingRole={speakingRole}
                  onQueueSpeaker={queueSpeakerHighlight}
                  onReplayReference={(en, turnId) => {
                    queueSpeakerHighlight(coach.userRole);
                    handleReplayReference(en, turnId);
                  }}
                />
              </div>
            ))}
          </AnimatePresence>

          {coach.evaluating && feedbackEnabled && (
            <div className="flex items-end gap-2 pl-1 py-1">
              <CoachAvatar size="sm" />
              <span className="text-[12px] italic text-slate-400 flex items-center gap-1.5">
                <RefreshCw className="w-3 h-3 animate-spin opacity-60" />
                点评中…
              </span>
            </div>
          )}
          <div ref={threadEndRef} className="h-1" />
        </div>
      </div>

      {/* 底部输入坞 */}
      <div className="shrink-0 w-full border-t border-slate-200/80 bg-[#f7f7f7] px-3 pt-2.5 pb-3 space-y-2.5">
        {coach.isUserTurn && coach.currentTurn && !coach.isComplete && (
          scriptHintOpen ? (
            <div className="rounded-xl border border-amber-200/80 bg-amber-50/40 px-3 py-2.5">
              <div className="flex items-start gap-2 min-w-0">
                <span className="shrink-0 text-[10px] font-bold text-amber-700 bg-amber-100/80 px-1.5 py-0.5 rounded">
                  台词提示
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] text-slate-800 leading-snug">{coach.currentTurn.en}</p>
                  {hintZhVisible && coach.currentTurn.zh ? (
                    <p className="mt-1 text-[11px] text-slate-500 leading-relaxed">{coach.currentTurn.zh}</p>
                  ) : null}
                </div>
                <div className="shrink-0 flex items-center gap-0.5">
                  <button
                    type="button"
                    onClick={() => {
                      queueSpeakerHighlight(coach.userRole);
                      void speakText(coach.currentTurn!.en, coach.currentTurn!.id);
                    }}
                    className="p-1 rounded text-slate-400 hover:text-slate-600 active:scale-95"
                    title="朗读"
                  >
                    <Volume2 className="w-3.5 h-3.5" strokeWidth={2} />
                  </button>
                  {coach.currentTurn.zh ? (
                    <button
                      type="button"
                      onClick={() => setHintZhVisible((v) => !v)}
                      className={`p-1 rounded active:scale-95 ${
                        hintZhVisible ? 'text-slate-500' : 'text-slate-300 hover:text-slate-500'
                      }`}
                      title={hintZhVisible ? '隐藏中文' : '看中文'}
                      aria-pressed={hintZhVisible}
                    >
                      <Languages className={`w-3 h-3 ${hintZhVisible ? 'fill-slate-200/80' : ''}`} />
                    </button>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => setScriptHintOpen(false)}
                    className="p-1 rounded text-slate-400 hover:text-slate-600 active:scale-95"
                    title="收起提示"
                  >
                    <X className="w-3.5 h-3.5" strokeWidth={2} />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setScriptHintOpen(true)}
              className="flex w-full items-center justify-center gap-1.5 rounded-full border border-dashed border-slate-200/70 bg-white/55 py-1.5 text-[11px] font-normal italic text-slate-400 active:scale-[0.99] transition-transform"
            >
              <Lightbulb className="w-3 h-3 text-amber-400/75" strokeWidth={1.75} />
              不知道说什么？看台词提示
            </button>
          )
        )}

        {voiceError ? (
          <p className="text-[11px] text-rose-600 text-center">{voiceError}</p>
        ) : null}

        <div className="flex items-center gap-2">
          <div className="flex shrink-0 rounded-full bg-white border border-slate-200 p-0.5">
            <button
              type="button"
              onClick={() => setInputMode('type')}
              className={`p-2 rounded-full transition-colors ${
                inputMode === 'type' ? 'bg-slate-100 text-slate-700' : 'text-slate-400'
              }`}
              title="打字"
            >
              <Keyboard className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setInputMode('voice')}
              disabled={!holdSpeak.supported}
              className={`p-2 rounded-full transition-colors ${
                inputMode === 'voice' ? 'bg-slate-100 text-slate-700' : 'text-slate-400'
              } disabled:opacity-30`}
              title="语音"
            >
              <Mic className="w-4 h-4" />
            </button>
          </div>

          {inputMode === 'voice' ? (
            <button
              type="button"
              disabled={inputDisabled || holdSpeak.processing}
              className={`flex-1 h-10 rounded-full font-semibold text-sm flex items-center justify-center gap-2 select-none touch-none ${
                holdSpeak.holding
                  ? 'bg-rose-500 text-white scale-[0.98]'
                  : holdSpeak.processing
                    ? 'bg-slate-200 text-slate-500'
                    : 'bg-white text-slate-700 border border-slate-200'
              } disabled:opacity-40`}
              style={{ touchAction: 'none' }}
              {...holdSpeak.holdHandlers}
            >
              {holdSpeak.processing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" /> 识别中…
                </>
              ) : holdSpeak.holding ? (
                <>
                  <Mic className="w-4 h-4" /> 松开发送
                </>
              ) : (
                <>
                  <Mic className="w-4 h-4" /> 按住说话
                </>
              )}
            </button>
          ) : (
            <>
              <input
                type="text"
                value={coach.input}
                onChange={(e) => coach.setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmitAttempt()}
                disabled={inputDisabled}
                placeholder={
                  coach.isComplete
                    ? '练完啦，左右滑换场景'
                    : coach.isUserTurn
                      ? '说出台词…'
                      : '等陪练…'
                }
                className="flex-1 min-w-0 h-10 bg-white border border-slate-200 rounded-full px-4 text-sm font-medium outline-none focus:border-[#2f7d4f]/40 focus:ring-2 focus:ring-[#2f7d4f]/10 disabled:opacity-50"
              />
              <button
                type="button"
                onClick={() => handleSubmitAttempt()}
                disabled={inputDisabled || !coach.input.trim()}
                className="shrink-0 w-10 h-10 flex items-center justify-center rounded-full bg-[#2f7d4f] text-white disabled:opacity-35 active:scale-95 transition-transform"
              >
                <Send className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
