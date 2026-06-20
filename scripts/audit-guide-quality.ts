/**
 * 审计单词详情例句质量（模板病句）— 数据源 Supabase ogden_word_guides
 * Usage: npm run audit:guides
 */
import * as dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { wordsData } from '../src/data/wordsList';
import { auditWordGuide, guideNeedsTemplateRepair } from './lib/guideQuality';
import { loadAllGuidesFromSupabase } from './lib/guideSupabase';

dotenv.config({ path: '.env.local' });

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_PATH = path.join(__dirname, '../Designs/audit/guide-quality.json');

async function main() {
  const guides = await loadAllGuidesFromSupabase();
  const flagged: Array<{ id: string; issues: string[]; sentences: string[] }> = [];
  let ok = 0;
  let templateCount = 0;

  for (const word of wordsData) {
    const guide = guides.get(word.id) ?? {};
    const issues = auditWordGuide(word.id, guide);
    const templateIssues = issues.filter((i) => i.kind === 'template');
    if (templateIssues.length) {
      templateCount += templateIssues.length;
      flagged.push({
        id: word.id,
        issues: templateIssues.map((i) => i.message),
        sentences: (guide.sentences ?? []).map((s) => s.en),
      });
    } else {
      ok++;
    }
  }

  const report = {
    generatedAt: new Date().toISOString(),
    source: 'supabase:ogden_word_guides',
    total: wordsData.length,
    ok,
    flagged: flagged.length,
    templateSentenceCount: templateCount,
    flaggedWords: flagged,
  };

  fs.mkdirSync(path.dirname(OUT_PATH), { recursive: true });
  fs.writeFileSync(OUT_PATH, JSON.stringify(report, null, 2));

  console.log(`审计完成: 模板病句 ${templateCount} 条, ${flagged.length}/${wordsData.length} 词需修复, ${ok} 通过`);
  console.log(`报告: ${OUT_PATH}`);
  if (flagged.length) {
    console.log('样例:', flagged.slice(0, 5).map((f) => `${f.id}: ${f.issues[0]}`).join('\n  '));
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
