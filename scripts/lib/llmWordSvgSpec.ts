/**
 * v2：LLM 只输出受限 JSON 图元 → 统一渲染器出 SVG
 * 禁止 LLM 直接写 SVG 字符串（太乱、自评放水）
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
  parseWordSvgSpec,
  renderSpecToSvg,
  validateWordSvgSpec,
  type WordSvgSpec,
} from '../../src/lib/wordSvgSpec';
import { buildWordSvgSpecPrompt } from './wordSvgSpecPrompt';
import { validateWordSvg } from './wordSvgQuality';
import type { WordSvgProvider } from './llmWordSvg';

export function pickSpecProvider(preferred: WordSvgProvider): 'deepseek' | 'gemini' | null {
  if (preferred === 'deepseek') return resolveDeepSeekApiKey() ? 'deepseek' : null;
  if (preferred === 'gemini') return resolveGeminiApiKey() ? 'gemini' : null;
  if (resolveGeminiApiKey()) return 'gemini';
  if (resolveDeepSeekApiKey()) return 'deepseek';
  return null;
}

async function callDeepSeek(prompt: string): Promise<string> {
  const apiKey = resolveDeepSeekApiKey();
  if (!apiKey) throw new Error('DEEPSEEK_API_KEY not set');
  const client = new OpenAI({ apiKey, baseURL: DEEPSEEK_API_BASE });
  const res = await client.chat.completions.create({
    model: DEEPSEEK_DIALOGUE_MODEL,
    thinking: { type: 'disabled' },
    messages: [
      {
        role: 'system',
        content: 'You output minimal JSON shape specs for tiny vocabulary icons. Never exceed 5 elements.',
      },
      { role: 'user', content: prompt },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.35,
  } as Parameters<typeof client.chat.completions.create>[0]);
  return res.choices[0]?.message?.content ?? '{}';
}

async function callGemini(prompt: string): Promise<string> {
  const apiKey = resolveGeminiApiKey();
  if (!apiKey) throw new Error('GEMINI_API_KEY not set');
  const ai = new GoogleGenAI({ apiKey });
  const res = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      temperature: 0.35,
      responseMimeType: 'application/json',
      systemInstruction: 'Minimal JSON icon specs only. Max 5 elements.',
    },
  });
  return res.text ?? '{}';
}

export async function generateWordSvgSpecWithLlm(opts: {
  word: string;
  translation: string;
  category: string;
  provider?: WordSvgProvider;
  maxAttempts?: number;
}): Promise<{ svg: string; spec: WordSvgSpec; provider: 'deepseek' | 'gemini'; attempts: number }> {
  const engine = pickSpecProvider(opts.provider ?? 'auto');
  if (!engine) throw new Error('No LLM API key');

  const maxAttempts = opts.maxAttempts ?? 5;
  let lastIssues: string[] = [];

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const prompt = buildWordSvgSpecPrompt({
      word: opts.word,
      translation: opts.translation,
      category: opts.category,
      repairIssues: lastIssues,
    });

    const raw = engine === 'gemini' ? await callGemini(prompt) : await callDeepSeek(prompt);
    const spec = parseWordSvgSpec(raw);
    if (!spec) {
      lastIssues = ['JSON spec 解析失败'];
      continue;
    }

    const specVal = validateWordSvgSpec(spec, opts.word);
    if (!specVal.ok) {
      lastIssues = specVal.issues;
      continue;
    }

    const svg = renderSpecToSvg(spec);
    const svgVal = validateWordSvg(svg, opts.word);
    if (!svgVal.ok) {
      lastIssues = svgVal.issues;
      continue;
    }

    return { svg, spec, provider: engine, attempts: attempt + 1 };
  }

  throw new Error(`spec v2 failed for "${opts.word}": ${lastIssues.join('; ')}`);
}
