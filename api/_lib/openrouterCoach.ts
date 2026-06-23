import { buildCoachSystemPrompt, buildCoachUserPrompt } from './coachPrompt.js';
import type { CoachEvalInput, CoachEvalResult } from './coachTypes.js';
import { normalizeCoachResult } from './coachTypes.js';

const OPENROUTER_BASE = 'https://openrouter.ai/api/v1';
const OPENROUTER_MODEL = 'google/gemini-2.5-flash';

export function resolveOpenRouterApiKey(): string | null {
  return process.env.OPENROUTER_API_KEY?.trim() || null;
}

export async function evaluateWithOpenRouter(input: CoachEvalInput): Promise<CoachEvalResult> {
  const apiKey = resolveOpenRouterApiKey();
  if (!apiKey) throw new Error('OPENROUTER_API_KEY not configured');

  const response = await fetch(`${OPENROUTER_BASE}/chat/completions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://ogden850.app',
      'X-Title': 'Ogden850 Coach',
    },
    body: JSON.stringify({
      model: OPENROUTER_MODEL,
      temperature: 0.4,
      max_tokens: 280,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: buildCoachSystemPrompt(input.userRole) },
        { role: 'user', content: buildCoachUserPrompt(input) },
      ],
    }),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => '');
    throw new Error(`OpenRouter ${response.status}: ${detail.slice(0, 120)}`);
  }

  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const raw = data.choices?.[0]?.message?.content ?? '{}';
  return normalizeCoachResult(JSON.parse(raw), 'openrouter');
}
