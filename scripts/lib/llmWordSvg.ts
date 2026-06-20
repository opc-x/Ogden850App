/**
 * LLM 生成单词语义 SVG — DeepSeek / Gemini，失败重试，禁止程序 fallback 造图。
 */
import OpenAI from 'openai';
import { GoogleGenAI } from '@google/genai';
import {
  DEEPSEEK_API_BASE,
  DEEPSEEK_DIALOGUE_MODEL,
  resolveDeepSeekApiKey,
} from './deepseekDialogue';
import { resolveGeminiApiKey } from './geminiDialogue';
import {
  buildWordSvgPrompt,
  buildWordSvgRepairPrompt,
  type WordSvgPromptInput,
} from './wordSvgPrompt';
import { extractSvgFromLlmPayload, validateWordSvg } from './wordSvgQuality';
import { reviewWordSvgSemantics } from './wordSvgSemantic';

export type WordSvgProvider = 'auto' | 'deepseek' | 'gemini';

export function pickWordSvgProvider(preferred: WordSvgProvider): 'deepseek' | 'gemini' | null {
  if (preferred === 'deepseek') return resolveDeepSeekApiKey() ? 'deepseek' : null;
  if (preferred === 'gemini') return resolveGeminiApiKey() ? 'gemini' : null;
  if (resolveDeepSeekApiKey()) return 'deepseek';
  if (resolveGeminiApiKey()) return 'gemini';
  return null;
}

async function callDeepSeekSvg(prompt: string): Promise<string> {
  const apiKey = resolveDeepSeekApiKey();
  if (!apiKey) throw new Error('DEEPSEEK_API_KEY not set');

  const client = new OpenAI({ apiKey, baseURL: DEEPSEEK_API_BASE });
  const response = await client.chat.completions.create({
    model: DEEPSEEK_DIALOGUE_MODEL,
    thinking: { type: 'disabled' },
    messages: [
      {
        role: 'system',
        content:
          'You are an expert SVG icon designer for language-learning apps. Return valid JSON with a single semantic pictogram SVG. Never use templates or generic circles for unrelated words.',
      },
      { role: 'user', content: prompt },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.4,
  } as Parameters<typeof client.chat.completions.create>[0]);

  return response.choices[0]?.message?.content ?? '{}';
}

async function callGeminiSvg(prompt: string): Promise<string> {
  const apiKey = resolveGeminiApiKey();
  if (!apiKey) throw new Error('GEMINI_API_KEY not set');

  const ai = new GoogleGenAI({ apiKey });
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      temperature: 0.4,
      responseMimeType: 'application/json',
      systemInstruction:
        'You design minimal semantic SVG pictograms for English vocabulary cards. JSON only: { "svg": "...", "rationale": "..." }',
    },
  });
  return response.text ?? '{}';
}

export interface GenerateWordSvgResult {
  svg: string;
  provider: 'deepseek' | 'gemini';
  attempts: number;
  semanticScore: number;
}

export async function generateWordSvgWithLlm(opts: {
  input: WordSvgPromptInput;
  provider?: WordSvgProvider;
  maxAttempts?: number;
}): Promise<GenerateWordSvgResult> {
  const engine = pickWordSvgProvider(opts.provider ?? 'auto');
  if (!engine) throw new Error('No LLM API key (DEEPSEEK_API_KEY or GEMINI_API_KEY)');

  const maxAttempts = opts.maxAttempts ?? 5;
  let lastIssues: string[] = [];
  let lastSvg = '';

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const prompt =
      attempt === 0 || !lastSvg
        ? buildWordSvgPrompt({ ...opts.input, repairIssues: lastIssues })
        : buildWordSvgRepairPrompt(opts.input, lastSvg, lastIssues);

    const raw =
      engine === 'deepseek' ? await callDeepSeekSvg(prompt) : await callGeminiSvg(prompt);
    const svg = extractSvgFromLlmPayload(raw);
    if (!svg) {
      lastIssues = ['LLM 未返回有效 <svg>'];
      continue;
    }

    const validation = validateWordSvg(svg, opts.input.word);
    if (!validation.ok) {
      lastSvg = svg;
      lastIssues = validation.issues;
      await new Promise((r) => setTimeout(r, 600 + attempt * 400));
      continue;
    }

    const semantic = await reviewWordSvgSemantics({
      word: opts.input.word,
      translation: opts.input.translation,
      category: opts.input.category,
      svg,
      provider: opts.provider ?? 'auto',
    });

    if (semantic.pass) {
      return {
        svg,
        provider: engine,
        attempts: attempt + 1,
        semanticScore: semantic.score,
      };
    }

    lastSvg = svg;
    lastIssues = semantic.issues;
    await new Promise((r) => setTimeout(r, 800 + attempt * 400));
  }

  throw new Error(
    `LLM SVG failed for "${opts.input.word}" after ${maxAttempts} attempts: ${lastIssues.join('; ')}`,
  );
}
