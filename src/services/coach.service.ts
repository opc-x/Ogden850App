import { API_ROUTES } from '../router/api';
import { evaluateCoachLocally } from '../lib/coachLocalEval';
import type { CoachEvalResult, CoachEvaluatePayload } from '../types/coach';

/** 默认本地评判，零 API 费用；仅 VITE_COACH_USE_API=true 时走 DeepSeek */
function useRemoteCoachApi(): boolean {
  return import.meta.env.VITE_COACH_USE_API === 'true';
}

export const CoachService = {
  async evaluateAttempt(payload: CoachEvaluatePayload): Promise<CoachEvalResult> {
    if (!useRemoteCoachApi()) {
      return evaluateCoachLocally(payload);
    }

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
