import type { CoachEvalResult } from './coachTypes.js';

export function normalizeCoachText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s']/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function isExactScriptMatch(attempt: string, expected: string): boolean {
  const a = normalizeCoachText(attempt);
  const b = normalizeCoachText(expected);
  return Boolean(a && b && a === b);
}

export function buildPerfectScriptResult(
  partial?: Partial<Pick<CoachEvalResult, 'provider' | 'offlineFallback'>>,
): CoachEvalResult {
  return {
    score: 100,
    passed: true,
    semantic: 100,
    vocabulary: 100,
    fluency: 100,
    encouragement: '满分！和台词提示一模一样，太标准了！',
    correction: null,
    analysis: '与参考台词完全一致，可以直接推进下一句。',
    tip: '保持这个节奏，继续练下一句。',
    mood: 'great',
    provider: partial?.provider ?? 'local',
    offlineFallback: partial?.offlineFallback ?? false,
  };
}
