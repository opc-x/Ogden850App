import { API_ROUTES } from '../router/api';
import { evaluateCoachLocally } from '../lib/coachLocalEval';
import { buildPerfectScriptResult, isExactScriptMatch } from '../lib/coachScriptMatch';
import type { CoachEvalResult, CoachEvaluatePayload } from '../types/coach';

export const CoachService = {
  /** 优先服务端 LLM（DeepSeek→Gemini→OpenRouter），失败则本地兜底 */
  async evaluateAttempt(payload: CoachEvaluatePayload): Promise<CoachEvalResult> {
    if (isExactScriptMatch(payload.userAttempt, payload.expectedLine.en)) {
      return buildPerfectScriptResult({ provider: 'local', offlineFallback: false });
    }

    try {
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
        semantic: data.semantic,
        vocabulary: data.vocabulary,
        fluency: data.fluency,
        encouragement: data.encouragement ?? '',
        correction: data.correction ?? null,
        analysis: data.analysis ?? '',
        tip: data.tip ?? '',
        mood: data.mood ?? 'retry',
        provider: data.provider,
        offlineFallback: data.offlineFallback,
      };
    } catch (e) {
      console.warn('[CoachService] API unavailable, local fallback', e);
      return evaluateCoachLocally(payload);
    }
  },
};
