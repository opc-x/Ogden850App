import { GoogleGenAI, Type } from '@google/genai';
import { buildCoachSystemPrompt, buildCoachUserPrompt } from './coachPrompt.js';
import type { CoachEvalInput, CoachEvalResult } from './coachTypes.js';
import { normalizeCoachResult } from './coachTypes.js';

export function resolveGeminiApiKey(): string | null {
  return (
    process.env.GEMINI_API_KEY?.trim() ||
    process.env.VITE_GEMINI_API_KEY?.trim() ||
    null
  );
}

export async function evaluateWithGemini(input: CoachEvalInput): Promise<CoachEvalResult> {
  const apiKey = resolveGeminiApiKey();
  if (!apiKey) throw new Error('GEMINI_API_KEY not configured');

  const ai = new GoogleGenAI({ apiKey });
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: buildCoachUserPrompt(input),
    config: {
      systemInstruction: buildCoachSystemPrompt(input.userRole),
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          score: { type: Type.NUMBER },
          passed: { type: Type.BOOLEAN },
          semantic: { type: Type.NUMBER },
          vocabulary: { type: Type.NUMBER },
          fluency: { type: Type.NUMBER },
          encouragement: { type: Type.STRING },
          correction: { type: Type.STRING, nullable: true },
          analysis: { type: Type.STRING },
          tip: { type: Type.STRING },
          mood: { type: Type.STRING },
        },
        required: ['score', 'passed', 'encouragement', 'analysis', 'tip', 'mood'],
      },
      temperature: 0.4,
      maxOutputTokens: 280,
    },
  });

  const raw = response.text ?? '{}';
  return normalizeCoachResult(JSON.parse(raw), 'gemini');
}
