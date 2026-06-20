import { API_ROUTES } from '../router/api';
import type { CoachEvalResult, UserRole } from '../types/coach';
import type { DialogueTurn } from '../types/scene';

export interface CoachEvaluatePayload {
  sceneTitleZh: string;
  sceneTitleEn: string;
  storyHook?: string;
  userRole: UserRole;
  expectedLine: Pick<DialogueTurn, 'en' | 'zh' | 'storyBeat'>;
  userAttempt: string;
  priorContext: Array<{ speaker: 'A' | 'B'; en: string }>;
  referenceSnippet: Array<{ speaker: 'A' | 'B'; en: string }>;
}

export const CoachService = {
  async evaluateAttempt(payload: CoachEvaluatePayload): Promise<CoachEvalResult> {
    const response = await fetch(API_ROUTES.AI.SCENE_COACH, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`陪练评判失败 (${response.status})`);
    }

    const data = await response.json();
    if (data.error) throw new Error(data.error);

    return {
      score: data.score ?? 0,
      passed: data.passed ?? false,
      encouragement: data.encouragement ?? '',
      correction: data.correction ?? null,
      analysis: data.analysis ?? '',
      tip: data.tip ?? '',
      mood: data.mood ?? 'retry',
      offlineFallback: data.offlineFallback,
    };
  },
};
