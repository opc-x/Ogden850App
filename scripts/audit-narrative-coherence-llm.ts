/**
 * LLM 叙事连贯性语义审计 — issue #8 第四轮
 * 判断：提前告别 / 语义重复 / 动作反复重启
 */
import * as dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import OpenAI from 'openai';
import type { ChatCompletionCreateParamsNonStreaming } from 'openai/resources/chat/completions';
import { GoogleGenAI, Type } from '@google/genai';
import { listTop50SceneKeys } from '../src/data/sceneStoryScripts';
import { loadDialogues } from './lib/pilotRunner';
import {
  DEEPSEEK_API_BASE,
  DEEPSEEK_DIALOGUE_MODEL,
  resolveDeepSeekApiKey,
} from './lib/deepseekDialogue';
import { GEMINI_DIALOGUE_MODEL, resolveGeminiApiKey } from './lib/geminiDialogue';
import { pickProvider, resolveDialogueProvider } from './lib/llmDialogue';

dotenv.config({ path: '.env.local' });

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPORT_PATH = path.join(__dirname, '../Designs/audit/coherence-llm-audit.json');

export type CoherenceIssueType = 'early_farewell' | 'semantic_repetition' | 'action_restart';

export interface CoherenceEvidence {
  seq: number;
  quote: string;
}

export interface CoherenceIssue {
  type: CoherenceIssueType;
  description: string;
  evidence: CoherenceEvidence[];
}

export interface SceneCoherenceResult {
  sceneKey: string;
  pass: boolean;
  lineCount: number;
  issues: CoherenceIssue[];
  error?: string;
}

const SYSTEM_PROMPT = `You audit short English dialogue scenes for narrative coherence. Be strict on real problems, but do NOT fail healthy scenes.

FAIL only when clearly violated:

1. EARLY FAREWELL: A clear farewell/closing that ends the social interaction appears BEFORE the last 3 lines, AND dialogue continues afterward as if the scene is still active.
   Farewell signals: goodbye, bye, see you, good night, sleep well, rest well, have a good day, talk later, until tomorrow, take care (as closing), catch you later.
   NOT farewell: "I will go now" while still doing the task, "thank you" alone, "have a good meeting" as encouragement mid-journey, medical advice like "rest now" from a doctor.
   The scene may have exactly ONE farewell in the last 1-3 lines.

2. SEMANTIC REPETITION: Two or more lines express the SAME completed fact or SAME redundant beat with NO new story information between them.
   FAIL examples: thanking for the same help 3+ times with nothing new between; saying payment is processing twice without progress; repeating an identical instruction already acted on.
   PASS examples: normal back-and-forth ("Good." "Yes."); asking then confirming; progressive steps that mention the same topic but advance (price question → answer → next step); similar short replies in different sub-beats.

3. ACTION RESTART: A concrete action is explicitly started ("I am sending…", "Now open it", "Send the payment"), then later the SAME action is started again from scratch without finishing the first attempt.
   NOT restart: retry after failure, correction (change amount then resend), natural multi-step workflow.

Short lines under 10 characters ("Good.", "Yes.", "I will.", "Thanks.") are never semantic repetition alone.

Return JSON only:
{"pass":boolean,"issues":[{"type":"early_farewell"|"semantic_repetition"|"action_restart","description":"...","evidence":[{"seq":12,"quote":"exact English line"}]}]}

If pass=true, issues must be []. Only report high-confidence violations with 2+ evidence lines when possible.`;

function buildUserPrompt(sceneKey: string, lines: Array<{ seq: number; speaker: string; en: string; zh: string }>): string {
  const body = lines.map((l) => `${l.seq}. [${l.speaker}] ${l.en} / ${l.zh}`).join('\n');
  return `Scene: ${sceneKey}
Total lines: ${lines.length}

Dialogue (seq. [speaker] English / Chinese):
${body}

Audit this scene against all three criteria. Cite seq numbers and exact English quotes as evidence.`;
}

function parseResult(raw: string): { pass: boolean; issues: CoherenceIssue[] } {
  try {
    const parsed = JSON.parse(raw) as { pass?: boolean; issues?: CoherenceIssue[] };
    const issues = (parsed.issues ?? []).filter(
      (i) => i.type && i.description && Array.isArray(i.evidence) && i.evidence.length > 0,
    );
    return { pass: parsed.pass === true && issues.length === 0, issues };
  } catch {
    return { pass: false, issues: [{ type: 'semantic_repetition', description: 'LLM 返回无效 JSON', evidence: [{ seq: 0, quote: raw.slice(0, 120) }] }] };
  }
}

function deepSeekRequest(
  params: Omit<ChatCompletionCreateParamsNonStreaming, 'model'>,
): ChatCompletionCreateParamsNonStreaming & { thinking?: { type: 'disabled' | 'enabled' } } {
  return { model: DEEPSEEK_DIALOGUE_MODEL, thinking: { type: 'disabled' }, ...params };
}

async function auditWithDeepSeek(prompt: string): Promise<{ pass: boolean; issues: CoherenceIssue[] }> {
  const apiKey = resolveDeepSeekApiKey();
  if (!apiKey) throw new Error('DEEPSEEK_API_KEY not set');
  const client = new OpenAI({ apiKey, baseURL: DEEPSEEK_API_BASE });
  const response = await client.chat.completions.create(
    deepSeekRequest({
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: prompt },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.2,
      max_tokens: 2048,
    }) as ChatCompletionCreateParamsNonStreaming,
  );
  return parseResult(response.choices[0]?.message?.content ?? '{"pass":false,"issues":[]}');
}

async function auditWithGemini(prompt: string): Promise<{ pass: boolean; issues: CoherenceIssue[] }> {
  const apiKey = resolveGeminiApiKey();
  if (!apiKey) throw new Error('GEMINI_API_KEY not set');
  const ai = new GoogleGenAI({ apiKey });
  const response = await ai.models.generateContent({
    model: GEMINI_DIALOGUE_MODEL,
    contents: prompt,
    config: {
      temperature: 0.2,
      systemInstruction: SYSTEM_PROMPT,
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          pass: { type: Type.BOOLEAN },
          issues: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                type: { type: Type.STRING },
                description: { type: Type.STRING },
                evidence: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      seq: { type: Type.NUMBER },
                      quote: { type: Type.STRING },
                    },
                    required: ['seq', 'quote'],
                  },
                },
              },
              required: ['type', 'description', 'evidence'],
            },
          },
        },
        required: ['pass', 'issues'],
      },
    },
  });
  return parseResult(response.text ?? '{"pass":false,"issues":[]}');
}

async function auditScene(
  sceneKey: string,
  engine: 'gemini' | 'deepseek',
): Promise<SceneCoherenceResult> {
  const records = loadDialogues();
  const rows = records.filter((r) => r.scene === sceneKey).sort((a, b) => a.seq - b.seq);
  if (rows.length === 0) {
    return { sceneKey, pass: false, lineCount: 0, issues: [], error: '无台词' };
  }

  const lines = rows.map((r) => ({ seq: r.seq, speaker: r.speaker, en: r.sentence, zh: r.zh }));
  const prompt = buildUserPrompt(sceneKey, lines);

  try {
    let result =
      engine === 'deepseek' ? await auditWithDeepSeek(prompt) : await auditWithGemini(prompt);
    if (!result.pass && result.issues.length === 0) {
      result = { pass: false, issues: [{ type: 'semantic_repetition', description: 'LLM 判 fail 但未给出证据', evidence: [{ seq: 0, quote: '(none)' }] }] };
    }
    return { sceneKey, pass: result.pass, lineCount: rows.length, issues: result.issues };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (engine === 'deepseek' && resolveGeminiApiKey()) {
      try {
        const fallback = await auditWithGemini(prompt);
        return { sceneKey, pass: fallback.pass, lineCount: rows.length, issues: fallback.issues };
      } catch {
        /* fall through */
      }
    }
    return { sceneKey, pass: false, lineCount: rows.length, issues: [], error: msg };
  }
}

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(name);
  return i >= 0 ? process.argv[i + 1] : undefined;
}

function formatIssue(i: CoherenceIssue): string {
  const cites = i.evidence.map((e) => `#${e.seq} "${e.quote}"`).join('; ');
  return `[${i.type}] ${i.description} → ${cites}`;
}

export async function runCoherenceAudit(opts?: {
  sceneFilter?: string;
  engine?: 'gemini' | 'deepseek';
  verbose?: boolean;
}): Promise<{ results: SceneCoherenceResult[]; passCount: number; total: number }> {
  const providerPref = resolveDialogueProvider();
  const engine = opts?.engine ?? pickProvider(providerPref === 'auto' ? 'deepseek' : providerPref);
  if (!engine) throw new Error('需要 DEEPSEEK_API_KEY 或 GEMINI_API_KEY');

  let scenes = listTop50SceneKeys();
  const sceneFilter = opts?.sceneFilter ?? arg('--scene');
  if (sceneFilter) scenes = scenes.filter((k) => k === sceneFilter);

  const results: SceneCoherenceResult[] = [];
  const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

  for (const sceneKey of scenes) {
    if (opts?.verbose !== false) process.stdout.write(`  审计 ${sceneKey}…`);
    const result = await auditScene(sceneKey, engine);
    results.push(result);
    if (opts?.verbose !== false) {
      if (result.pass) console.log(' ✅');
      else if (result.error) console.log(` ❌ (${result.error})`);
      else {
        console.log(' ❌');
        for (const issue of result.issues) console.log(`    ${formatIssue(issue)}`);
      }
    }
    await sleep(400);
  }

  const passCount = results.filter((r) => r.pass && !r.error).length;
  return { results, passCount, total: scenes.length };
}

async function main() {
  const jsonOnly = process.argv.includes('--json');

  console.log(`\n══ LLM 叙事连贯性审计 ══\n`);
  const { results, passCount, total } = await runCoherenceAudit({ verbose: !jsonOnly });

  fs.mkdirSync(path.dirname(REPORT_PATH), { recursive: true });
  const report = {
    completedAt: new Date().toISOString(),
    passCount,
    total,
    failCount: total - passCount,
    results,
  };
  fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2));

  if (jsonOnly) {
    console.log(JSON.stringify(report, null, 2));
  } else {
    console.log(`\nLLM 语义审计: ${passCount}/${total} pass`);
    const failed = results.filter((r) => !r.pass);
    if (failed.length > 0) {
      console.log('\n未通过:');
      for (const f of failed) {
        console.log(`  ❌ ${f.sceneKey}${f.error ? ` (${f.error})` : ''}`);
        for (const issue of f.issues) console.log(`     ${formatIssue(issue)}`);
      }
    }
    console.log(`\n报告: ${REPORT_PATH}`);
  }

  const hasError = results.some((r) => r.error);
  process.exit(passCount === total && !hasError ? 0 : 1);
}

if (process.argv[1]?.includes('audit-narrative-coherence-llm')) {
  main().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
