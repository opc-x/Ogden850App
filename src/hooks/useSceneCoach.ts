import { useCallback, useMemo, useState } from 'react';
import type { CoachPhase, CoachThreadItem, UserRole } from '../types/coach';
import type { DialogueTurn, SceneCatalogItem } from '../types/scene';
import { CoachService } from '../services/coach.service';
import { speakText } from '../data/speak';

function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function countUserTurns(turns: DialogueTurn[], role: UserRole) {
  return turns.filter((t) => t.speaker === role).length;
}

function nextUserTurnIndex(turns: DialogueTurn[], role: UserRole, from: number) {
  for (let i = from; i < turns.length; i++) {
    if (turns[i].speaker === role) return i;
  }
  return -1;
}

export function useSceneCoach(feedbackEnabled = true, autoSpeak = false) {
  const [phase, setPhase] = useState<CoachPhase>('practice');
  const [scene, setScene] = useState<SceneCatalogItem | null>(null);
  const [turns, setTurns] = useState<DialogueTurn[]>([]);
  const [userRole, setUserRole] = useState<UserRole>('B');
  const [playhead, setPlayhead] = useState(0);
  const [thread, setThread] = useState<CoachThreadItem[]>([]);
  const [input, setInput] = useState('');
  const [evaluating, setEvaluating] = useState(false);
  const [completedUserTurns, setCompletedUserTurns] = useState(0);
  const [sessionKey, setSessionKey] = useState(0);

  const totalUserTurns = useMemo(
    () => (turns.length ? countUserTurns(turns, userRole) : 0),
    [turns, userRole],
  );

  const currentTurn = playhead >= 0 && playhead < turns.length ? turns[playhead] : null;
  const isUserTurn = currentTurn?.speaker === userRole;
  const isComplete = phase === 'complete';

  const appendThread = useCallback((items: CoachThreadItem[]) => {
    setThread((prev) => [...prev, ...items]);
  }, []);

  const pushPartnerLinesUntilUser = useCallback(
    async (startIdx: number, allTurns: DialogueTurn[], role: UserRole) => {
      let idx = startIdx;
      const additions: CoachThreadItem[] = [];

      while (idx < allTurns.length && allTurns[idx].speaker !== role) {
        const t = allTurns[idx];
        additions.push({
          id: uid(),
          kind: 'partner',
          en: t.en,
          zh: t.zh,
          speaker: t.speaker,
          dialogueTurnId: t.id,
        });
        idx++;
      }

      if (additions.length) {
        appendThread(additions);
        const last = additions[additions.length - 1];
        if (autoSpeak && last.en) await speakText(last.en, last.dialogueTurnId);
      }

      setPlayhead(idx);
      return idx;
    },
    [appendThread, autoSpeak],
  );

  const beginPractice = useCallback(
    async (selected: SceneCatalogItem, dialogueTurns: DialogueTurn[], role: UserRole) => {
      setScene(selected);
      setTurns(dialogueTurns);
      setUserRole(role);
      setCompletedUserTurns(0);
      setInput('');
      setEvaluating(false);
      setPlayhead(0);
      setPhase('practice');
      setSessionKey((k) => k + 1);
      setThread([]);

      const firstUserIdx = nextUserTurnIndex(dialogueTurns, role, 0);
      if (firstUserIdx === -1) {
        setPhase('complete');
        appendThread([
          { id: uid(), kind: 'system', zh: '本场景没有你的台词回合，请换场景或换角色。' },
        ]);
        return;
      }
      await pushPartnerLinesUntilUser(0, dialogueTurns, role);
    },
    [pushPartnerLinesUntilUser, appendThread],
  );

  const submitAttempt = useCallback(async (overrideAttempt?: string) => {
    const attempt = (overrideAttempt ?? input).trim();
    if (!scene || !currentTurn || !isUserTurn || !attempt || evaluating || isComplete) return;

    setInput('');

    appendThread([
      { id: uid(), kind: 'user', en: attempt, speaker: userRole, userRaw: attempt },
    ]);

    const advanceAfterAttempt = async () => {
      const done = completedUserTurns + 1;
      setCompletedUserTurns(done);

      const nextIdx = playhead + 1;
      if (nextIdx >= turns.length || done >= totalUserTurns) {
        setPhase('complete');
        setPlayhead(turns.length);
      } else {
        await pushPartnerLinesUntilUser(nextIdx, turns, userRole);
      }
    };

    if (!feedbackEnabled) {
      await advanceAfterAttempt();
      return;
    }

    setEvaluating(true);
    try {
      const priorContext = turns
        .slice(0, playhead)
        .map((t) => ({ speaker: t.speaker, en: t.en }));

      const snippetStart = Math.max(0, playhead - 2);
      const referenceSnippet = turns
        .slice(snippetStart, Math.min(turns.length, playhead + 3))
        .map((t) => ({ speaker: t.speaker, en: t.en }));

      const evalResult = await CoachService.evaluateAttempt({
        sceneTitleZh: scene.titleZh,
        sceneTitleEn: scene.titleEn,
        storyHook: scene.storyHook,
        userRole,
        expectedLine: {
          en: currentTurn.en,
          zh: currentTurn.zh,
          storyBeat: currentTurn.storyBeat,
        },
        userAttempt: attempt,
        priorContext,
        referenceSnippet,
      });

      appendThread([
        {
          id: uid(),
          kind: 'feedback',
          eval: evalResult,
        },
      ]);

      if (evalResult.passed) {
        await advanceAfterAttempt();
      }
    } catch (e) {
      appendThread([
        {
          id: uid(),
          kind: 'system',
          zh: e instanceof Error ? e.message : '评判暂时不可用，请稍后重试。',
        },
      ]);
    } finally {
      setEvaluating(false);
    }
  }, [
    scene,
    currentTurn,
    isUserTurn,
    input,
    evaluating,
    isComplete,
    appendThread,
    turns,
    playhead,
    userRole,
    completedUserTurns,
    totalUserTurns,
    pushPartnerLinesUntilUser,
    feedbackEnabled,
  ]);

  const progressPct =
    totalUserTurns > 0 ? Math.round((completedUserTurns / totalUserTurns) * 100) : 0;

  return {
    phase,
    scene,
    turns,
    userRole,
    setUserRole,
    thread,
    input,
    setInput,
    evaluating,
    currentTurn,
    isUserTurn,
    isComplete,
    completedUserTurns,
    totalUserTurns,
    progressPct,
    sessionKey,
    beginPractice,
    submitAttempt,
  };
};
