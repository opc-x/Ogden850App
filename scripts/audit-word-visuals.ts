/**
 * 850 词 SVG 视觉语义全量质检
 * Usage: npm run audit:word-visuals
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { wordsData } from '../src/data/wordsList';
import { auditWordVisual, summarizeAudit } from './lib/wordVisualAudit';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_PATH = path.join(__dirname, '../Designs/audit/word-visual-quality.json');

function main() {
  const rows = wordsData.map(auditWordVisual);
  const summary = summarizeAudit(rows);

  const report = {
    generatedAt: new Date().toISOString(),
    summary,
    verdict: {
      oneToOneFeasible: false,
      note:
        '850 词逐词独立 SVG 在纯手写 React 组件模式下不可持续。operators/grammar/direction (~150) 已一对一；picturables 可逼近一对一；generals/qualities/opposites (~550) 当前为 motif 桶架构，本质不是一对一。',
      recommendedPath: [
        'P0: 修 picturable shared-bad 桶（衣物/家具/建筑构件/工具混用）',
        'P1: generals 高频词补专属图或恢复 word-img 静态资源',
        'P2: LLM 生成 SVG → 校验 → public/assets/word-img 入库（可扩展）',
      ],
    },
    flagged: summary.flagged.map((r) => ({
      word: r.word,
      category: r.category,
      visualKey: r.visualKey,
      fidelity: r.fidelity,
      issue: r.issue,
    })),
  };

  fs.mkdirSync(path.dirname(OUT_PATH), { recursive: true });
  fs.writeFileSync(OUT_PATH, JSON.stringify(report, null, 2));

  console.log('Word visual audit — 850 words');
  console.log('─'.repeat(40));
  console.log(`Total: ${summary.total}`);
  for (const [k, v] of Object.entries(summary.byFidelity)) {
    console.log(`  ${k}: ${v}`);
  }
  console.log(`\nFlagged (shared-bad + fallback): ${summary.flagged.length}`);
  console.log(`Report: ${OUT_PATH}`);
}

main();
