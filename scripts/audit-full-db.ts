/**
 * 全库全表扫描 — 场景 / 对话 / 故事匹配 / 中文 / 条数
 *
 * Usage:
 *   npm run audit:full-db
 *   npm run audit:full-db -- --json-only
 */
import * as dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createSupabaseAdmin } from './lib/syncDialoguesToDb';
import { runFullDbAudit, type FullDbAuditReport } from './lib/auditDbContent';

dotenv.config({ path: '.env.local' });

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPORT_PATH = path.join(__dirname, '../Designs/audit/full-db-audit.json');

function printSummary(report: FullDbAuditReport) {
  console.log(`\n══ 全库合法性审计 ══`);
  console.log(`场景: ${report.sceneCount} | 有对话: ${report.scenesWithTurns} | 台词: ${report.totalTurns}`);
  console.log(`✅ 通过: ${report.scenesOk} | ❌ 有问题: ${report.scenesFail}`);
  console.log(`病句行: ${report.flaggedLines} | 分类: ${JSON.stringify(report.issuesByKind)}`);

  const worst = [...report.scenes]
    .filter((s) => !s.ok)
    .sort((a, b) => {
      const sa = a.sceneIssues.length + a.dialogueIssues.length + a.flaggedLineCount;
      const sb = b.sceneIssues.length + b.dialogueIssues.length + b.flaggedLineCount;
      return sb - sa;
    })
    .slice(0, 10);

  if (worst.length) {
    console.log(`\n── TOP 问题场景 ──`);
    for (const s of worst) {
      const msgs = [
        ...s.sceneIssues.slice(0, 2).map((i) => i.message),
        ...s.dialogueIssues.slice(0, 2).map((i) => i.message),
      ];
      console.log(`  TOP${s.freqRank} ${s.titleZh} (${s.turnCount}句): ${msgs.join(' · ') || '行级问题'}`);
    }
    console.log(`\n修复: npm run repair:dialogues -- --scene <SceneKey>`);
  }
  console.log(`\n完整报告: ${REPORT_PATH}`);
}

async function main() {
  const supabase = createSupabaseAdmin();
  const report = await runFullDbAudit(supabase);

  fs.mkdirSync(path.dirname(REPORT_PATH), { recursive: true });
  fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2));

  if (!process.argv.includes('--json-only')) {
    printSummary(report);
  }

  process.exit(report.scenesFail > 0 ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
