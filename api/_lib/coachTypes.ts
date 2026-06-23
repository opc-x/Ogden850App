import { COACH_GOOD_THRESHOLD, COACH_GREAT_THRESHOLD, COACH_PASS_THRESHOLD } from './coachConstants.js';

export interface CoachEvalInput {
  sceneTitleZh: string;
  sceneTitleEn: string;
  storyHook?: string;
  userRole: 'A' | 'B';
  expectedLine: { en: string; zh?: string; storyBeat: string };
  userAttempt: string;
  priorContext: Array<{ speaker: 'A' | 'B'; en: string }>;
  referenceSnippet: Array<{ speaker: 'A' | 'B'; en: string }>;
}

export interface CoachEvalDimensions {
  semantic: number;
  vocabulary: number;
  fluency: number;
}

export interface CoachEvalResult {
  score: number;
  passed: boolean;
  semantic: number;
  vocabulary: number;
  fluency: number;
  encouragement: string;
  correction: string | null;
  analysis: string;
  tip: string;
  mood: 'great' | 'good' | 'retry';
  provider?: 'deepseek' | 'gemini' | 'openrouter' | 'local';
  offlineFallback?: boolean;
}

export type CoachEvalProvider = NonNullable<CoachEvalResult['provider']>;

interface RawCoachJson {
  score?: number;
  passed?: boolean;
  semantic?: number;
  vocabulary?: number;
  fluency?: number;
  encouragement?: string;
  correction?: string | null;
  analysis?: string;
  tip?: string;
  mood?: string;
}

export function normalizeCoachResult(
  parsed: RawCoachJson,
  provider: CoachEvalProvider,
  offlineFallback = false,
): CoachEvalResult {
  const semantic = clampScore(parsed.semantic ?? parsed.score);
  const vocabulary = clampScore(parsed.vocabulary ?? parsed.score);
  const fluency = clampScore(parsed.fluency ?? parsed.score);
  const score = clampScore(
    parsed.score ?? Math.round(semantic * 0.5 + vocabulary * 0.25 + fluency * 0.25),
  );

  const mood =
    parsed.mood === 'great' || parsed.mood === 'good' || parsed.mood === 'retry'
      ? parsed.mood
      : score >= COACH_GREAT_THRESHOLD
        ? 'great'
        : score >= COACH_GOOD_THRESHOLD
          ? 'good'
          : 'retry';

  const passed = parsed.passed ?? score >= COACH_PASS_THRESHOLD;

  return {
    score,
    passed,
    semantic,
    vocabulary,
    fluency,
    encouragement: parsed.encouragement?.trim() || '很棒，继续加油！',
    correction: passed ? null : parsed.correction?.trim() || null,
    analysis: parsed.analysis?.trim() || '表达基本到位，可以再练几遍更流利。',
    tip: parsed.tip?.trim() || '不必一字不差，抓住核心意思再说一遍。',
    mood,
    provider,
    offlineFallback,
  };
}

function clampScore(n: unknown): number {
  return Math.min(100, Math.max(0, Math.round(Number(n) || 0)));
}
