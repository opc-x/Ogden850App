import OpenAI from 'openai';
import type { ChatCompletionCreateParamsNonStreaming } from 'openai/resources/chat/completions';
import { buildCoachSystemPrompt, buildCoachUserPrompt } from './coachPrompt.js';
import type { CoachEvalInput, CoachEvalResult } from './coachTypes.js';
import { normalizeCoachResult } from './coachTypes.js';

export const DEEPSEEK_COACH_MODEL = 'deepseek-v4-flash';
export const DEEPSEEK_API_BASE = 'https://api.deepseek.com';

export function resolveDeepSeekApiKey(): string | null {
  return (
    process.env.DEEPSEEK_API_KEY?.trim() ||
    process.env.VITE_DEEPSEEK_API_KEY?.trim() ||
    null
  );
}

function deepSeekRequest(
  params: Omit<ChatCompletionCreateParamsNonStreaming, 'model'>,
): ChatCompletionCreateParamsNonStreaming & { thinking?: { type: 'disabled' | 'enabled' } } {
  return {
    model: DEEPSEEK_COACH_MODEL,
    thinking: { type: 'disabled' },
    ...params,
  };
}

export async function evaluateWithDeepSeek(input: CoachEvalInput): Promise<CoachEvalResult> {
  const apiKey = resolveDeepSeekApiKey();
  if (!apiKey) throw new Error('DEEPSEEK_API_KEY not configured');

  const client = new OpenAI({ apiKey, baseURL: DEEPSEEK_API_BASE });
  const response = await client.chat.completions.create(
    deepSeekRequest({
      messages: [
        { role: 'system', content: buildCoachSystemPrompt(input.userRole) },
        { role: 'user', content: buildCoachUserPrompt(input) },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.4,
      max_tokens: 280,
    }) as ChatCompletionCreateParamsNonStreaming,
  );

  const raw = response.choices[0]?.message?.content ?? '{}';
  return normalizeCoachResult(JSON.parse(raw), 'deepseek');
}

/** @deprecated use evaluateWithDeepSeek */
export const evaluateSceneAttempt = evaluateWithDeepSeek;
