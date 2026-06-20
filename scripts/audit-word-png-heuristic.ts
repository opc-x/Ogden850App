/**
 * PNG 词插画启发式审计 — 基于 prompt 质量 + 文件存在性 + 程序化 SVG 已知错配清单（无外部 API）。
 * review 项需 agent 人工读图，结果写入 Designs/audit/word-png-manual-audit.json。
 * Usage: npx tsx scripts/audit-word-png-heuristic.ts [--json]
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { wordsData } from '../src/data/wordsList';
import { auditWordVisual } from './lib/wordVisualAudit';
import { ALL_WORD_PNG_PROMPTS } from './word-png-prompts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const IMG_DIR = path.join(__dirname, '../public/assets/word-img');
const OUT_PATH = path.join(__dirname, '../Designs/audit/word-png-heuristic.json');

const WEAK_PROMPT_RE = /^Visual metaphor for /;
const PLACEHOLDER_RE = /放在名词前面/;

/** 已知 PNG 错配（人工确认 / 历史 bug）— 已修复的移除此表 */
const KNOWN_MISMATCH: Record<string, { score: number; issue: string }> = {};

function heuristicScore(word: string, category: string): { score: number; verdict: 'keep' | 'regenerate' | 'review'; issue?: string } {
  const slug = word.toLowerCase();
  if (KNOWN_MISMATCH[slug]) {
    return { score: KNOWN_MISMATCH[slug].score, verdict: 'regenerate', issue: KNOWN_MISMATCH[slug].issue };
  }

  const pngPath = path.join(IMG_DIR, `${slug}.png`);
  if (!fs.existsSync(pngPath)) {
    return { score: 0, verdict: 'regenerate', issue: 'PNG 缺失' };
  }

  const prompt = ALL_WORD_PNG_PROMPTS[slug];
  if (!prompt) {
    return { score: 40, verdict: 'review', issue: '无专用 prompt，需人工看图' };
  }
  if (WEAK_PROMPT_RE.test(prompt) || PLACEHOLDER_RE.test(prompt)) {
    return { score: 55, verdict: 'review', issue: 'prompt 为占位符，需视觉确认' };
  }

  const svgAudit = auditWordVisual(wordsData.find((w) => w.id === slug)!);
  if (svgAudit.fidelity === 'shared-bad') {
    return { score: 50, verdict: 'review', issue: `程序化 SVG 曾标记 shared-bad: ${svgAudit.issue}` };
  }

  return { score: 85, verdict: 'keep' };
}

function main() {
  const jsonMode = process.argv.includes('--json');
  const rows = wordsData.map((w) => {
    const h = heuristicScore(w.word, w.category);
    return {
      word: w.word,
      category: w.category,
      score: h.score,
      verdict: h.verdict,
      issue: h.issue,
    };
  });

  const regenerate = rows.filter((r) => r.verdict === 'regenerate');
  const review = rows.filter((r) => r.verdict === 'review');
  const keep = rows.filter((r) => r.verdict === 'keep');

  const report = {
    generatedAt: new Date().toISOString(),
    mode: 'heuristic',
    note: '启发式审计（无 Vision API）；review 项需 agent 读图并更新 word-png-manual-audit.json；重生成用 npm run generate:word-pngs + Cursor GenerateImage',
    summary: { total: rows.length, keep: keep.length, review: review.length, regenerate: regenerate.length },
    regenerate,
    review,
    rows,
  };

  fs.mkdirSync(path.dirname(OUT_PATH), { recursive: true });
  fs.writeFileSync(OUT_PATH, JSON.stringify(report, null, 2));

  if (jsonMode) {
    console.log(JSON.stringify(report.summary, null, 2));
  } else {
    console.log(`Heuristic PNG audit — ${rows.length} words`);
    console.log(`  keep: ${keep.length} | review: ${review.length} | regenerate: ${regenerate.length}`);
    console.log(`\nRegenerate (${regenerate.length}):`);
    for (const r of regenerate) console.log(`  ${r.word} (${r.score}) — ${r.issue}`);
    console.log(`\nReview sample (${Math.min(15, review.length)}/${review.length}):`);
    for (const r of review.slice(0, 15)) console.log(`  ${r.word} (${r.score}) — ${r.issue}`);
    console.log(`\nReport: ${OUT_PATH}`);
  }
}

main();
