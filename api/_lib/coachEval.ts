import { evaluateCoachLocally } from './coachLocalEval.js';
import { buildPerfectScriptResult, isExactScriptMatch } from './coachScriptMatch.js';
import { evaluateWithDeepSeek } from './deepseekCoach.js';
import { evaluateWithGemini } from './geminiCoach.js';
import { evaluateWithOpenRouter } from './openrouterCoach.js';
import type { CoachEvalInput, CoachEvalResult } from './coachTypes.js';

type EvalFn = (input: CoachEvalInput) => Promise<CoachEvalResult>;

const CHAIN: Array<{ name: CoachEvalResult['provider']; run: EvalFn; available: () => boolean }> = [
  {
    name: 'deepseek',
    run: evaluateWithDeepSeek,
    available: () => Boolean(process.env.DEEPSEEK_API_KEY?.trim() || process.env.VITE_DEEPSEEK_API_KEY?.trim()),
  },
  {
    name: 'gemini',
    run: evaluateWithGemini,
    available: () => Boolean(process.env.GEMINI_API_KEY?.trim() || process.env.VITE_GEMINI_API_KEY?.trim()),
  },
  {
    name: 'openrouter',
    run: evaluateWithOpenRouter,
    available: () => Boolean(process.env.OPENROUTER_API_KEY?.trim()),
  },
];

/** DeepSeek 主路 → Gemini → OpenRouter → 本地算法兜底 */
export async function evaluateCoachAttempt(input: CoachEvalInput): Promise<CoachEvalResult> {
  if (isExactScriptMatch(input.userAttempt, input.expectedLine.en)) {
    return buildPerfectScriptResult({ provider: 'local', offlineFallback: false });
  }

  const errors: string[] = [];

  for (const step of CHAIN) {
    if (!step.available()) continue;
    try {
      return await step.run(input);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      errors.push(`${step.name}: ${msg}`);
      console.warn(`[coach] ${step.name} failed, trying next…`, msg);
    }
  }

  if (errors.length) {
    console.warn('[coach] all LLM providers failed, using local eval', errors.join(' | '));
  }

  return evaluateCoachLocally(input);
}
