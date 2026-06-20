/**
 * 审计单词详情例句质量
 * Usage: npm run audit:guides
 */
import * as dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { wordsData } from '../src/data/wordsList';
import { auditWordGuide, guideNeedsRepair } from './lib/guideQuality';

dotenv.config({ path: '.env.local' });

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const GUIDES_PATH = path.join(__dirname, '../src/components/word-guides.json');
const OUT_PATH = path.join(__dirname, '../Designs/audit/guide-quality.json');

type GuideFile = Record<string, { hook?: string; sentences?: { en: string; cn?: string }[] }>;

function main() {
  const guides = JSON.parse(fs.readFileSync(GUIDES_PATH, 'utf8')) as GuideFile;
  const flagged: Array<{ id: string; issues: string[]; sentences: string[] }> = [];
  let ok = 0;

  for (const word of wordsData) {
    const guide = guides[word.id] ?? guides[word.word] ?? {};
    const issues = auditWordGuide(word.id, guide);
    if (guideNeedsRepair(issues)) {
      flagged.push({
        id: word.id,
        issues: issues.map((i) => i.message),
        sentences: (guide.sentences ?? []).map((s) => s.en),
      });
    } else {
      ok++;
    }
  }

  const report = {
    generatedAt: new Date().toISOString(),
    total: wordsData.length,
    ok,
    flagged: flagged.length,
    flaggedWords: flagged,
  };

  fs.mkdirSync(path.dirname(OUT_PATH), { recursive: true });
  fs.writeFileSync(OUT_PATH, JSON.stringify(report, null, 2));

  console.log(`审计完成: ${flagged.length}/${wordsData.length} 需修复, ${ok} 通过`);
  console.log(`报告: ${OUT_PATH}`);
  if (flagged.length) {
    console.log('样例:', flagged.slice(0, 5).map((f) => `${f.id}: ${f.issues[0]}`).join('\n  '));
  }
}

main();
