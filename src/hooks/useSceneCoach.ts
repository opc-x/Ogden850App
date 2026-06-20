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

export function useSceneCoach() {
  const [phase, setPhase] = useState<CoachPhase>('pick');
  const [scene, setScene] = useState<SceneCatalogItem | null>(null);
  const [turns, setTurns] = useState<DialogueTurn[]>([]);
  const [userRole, setUserRole] = useState<UserRole>('B');
  const [playhead, setPlayhead] = useState(0);
  const [thread, setThread] = useState<CoachThreadItem[]>([]);
  const [input, setInput] = useState('');
  const [evaluating, setEvaluating] = useState(false);
  const [completedUserTurns, setCompletedUserTurns] = useState(0);

  const totalUserTurns = useMemo(
    () => (turns.length ? countUserTurns(turns, userRole) : 0),
    [turns, userRole],
  );

  const currentTurn = playhead >= 0 && playhead < turns.length ? turns[playhead] : null;
  const isUserTurn = currentTurn?.speaker === userRole;

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
        });
        idx++;
      }

      if (additions.length) {
        appendThread(additions);
        const last = additions[additions.length - 1];
        if (last.en) await speakText(last.en);
      }

      setPlayhead(idx);
      return idx;
    },
    [appendThread],
  );

  const beginPractice = useCallback(
    async (selected: SceneCatalogItem, dialogueTurns: DialogueTurn[], role: UserRole) => {
      setScene(selected);
      setTurns(dialogueTurns);
      setUserRole(role);
      setCompletedUserTurns(0);
      setInput('');
      setThread([
        {
          id: uid(),
          kind: 'system',
          zh: `已锁定「${selected.titleZh}」场景台词，陪练范围仅限本剧 ${dialogueTurns.length} 句对话。你扮演${role === 'A' ? '甲' : '乙'}，对方由陪练朗读。`,
        },
      ]);
      setPhase('practice');
      const firstUserIdx = nextUserTurnIndex(dialogueTurns, role, 0);
      if (firstUserIdx === -1) {
        setPhase('complete');
        return;
      }
      await pushPartnerLinesUntilUser(0, dialogueTurns, role);
    },
    [pushPartnerLinesUntilUser],
  );

  const selectScene = useCallback((selected: SceneCatalogItem) => {
    setScene(selected);
    setPhase('briefing');
  }, []);

  const reset = useCallback(() => {
    setPhase('pick');
    setScene(null);
    setTurns([]);
    setPlayhead(0);
    setThread([]);
    setInput('');
    setEvaluating(false);
    setCompletedUserTurns(0);
  }, []);

  const submitAttempt = useCallback(async () => {
    if (!scene || !currentTurn || !isUserTurn || !input.trim() || evaluating) return;

    const attempt = input.trim();
    setInput('');
    setEvaluating(true);

    appendThread([
      { id: uid(), kind: 'user', en: attempt, speaker: userRole, userRaw: attempt },
    ]);

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

      appendThread([{ id: uid(), kind: 'feedback', eval: evalResult }]);

      if (evalResult.passed) {
        const done = completedUserTurns + 1;
        setCompletedUserTurns(done);

        const nextIdx = playhead + 1;
        if (nextIdx >= turns.length || done >= totalUserTurns) {
          setPhase('complete');
          setPlayhead(turns.length);
          appendThread([
            {
              id: uid(),
              kind: 'system',
              zh: '🎉 本场景台词练完啦！你今天已经能在真实情境里说出这些句子了。',
            },
          ]);
        } else {
          await pushPartnerLinesUntilUser(nextIdx, turns, userRole);
        }
      }
    } catch (e) {
      appendThread([
        {
          id: uid(),
          kind: 'system',
          zh: e instanceof Error ? e.message : '评判服务暂时不可用，请稍后重试。',
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
    appendThread,
    turns,
    playhead,
    userRole,
    completedUserTurns,
    totalUserTurns,
    pushPartnerLinesUntilUser,
  ]);

  const progressPct =
    totalUserTurns > 0 ? Math.round((completedUserTurns / totalUserTurns) * 100) : 0;

  return {
    phase,
    setPhase,
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
    completedUserTurns,
    totalUserTurns,
    progressPct,
    selectScene,
    beginPractice,
    submitAttempt,
    reset,
  };
}
