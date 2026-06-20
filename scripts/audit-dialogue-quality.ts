/**
 * 全库对话质量审计 — JSON + 可选 DB
 *
 * Usage:
 *   npm run audit:dialogues
 *   npm run audit:dialogues -- --scene Shopping
 */
import * as dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { loadDialogues } from './lib/pilotRunner';
import {
  auditDialogueLines,
  validateDialogueBatch,
  type QualityIssue,
} from './lib/dialogueQuality';
import { getSceneStory } from '../src/data/sceneStoryScripts';

dotenv.config({ path: '.env.local' });

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPORT_PATH = path.join(__dirname, '../Designs/pilot/quality-audit.json');

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(name);
  return i >= 0 ? process.argv[i + 1] : undefined;
}

async function main() {
  const sceneFilter = arg('--scene');
  const records = loadDialogues();
  const byScene = new Map<string, typeof records>();

  for (const r of records) {
    if (sceneFilter && r.scene !== sceneFilter) continue;
    if (!byScene.has(r.scene)) byScene.set(r.scene, []);
    byScene.get(r.scene)!.push(r);
  }

  const sceneReports: Array<{
    sceneKey: string;
    titleZh: string;
    total: number;
    flagged: number;
    batchIssues: QualityIssue[];
    lines: ReturnType<typeof auditDialogueLines>;
  }> = [];

  let totalFlagged = 0;

  for (const [sceneKey, rows] of [...byScene.entries()].sort((a, b) => {
    const ra = getSceneStory(a[0])?.freqRank ?? 999;
    const rb = getSceneStory(b[0])?.freqRank ?? 999;
    return ra - rb;
  })) {
    const sorted = [...rows].sort((a, b) => a.seq - b.seq);
    const mapped = sorted.map((r) => ({
      seq: r.seq,
      speaker: r.speaker,
      en: r.sentence,
      zh: r.zh,
      beat: r.beat,
    }));
    const audited = auditDialogueLines(sceneKey, mapped);
    const batchIssues = validateDialogueBatch(
      sceneKey,
      mapped.map((l) => ({ en: l.en, zh: l.zh, speaker: l.speaker, beat: l.beat })),
    );
    const flagged = audited.filter((l) => l.issues.length > 0);
    totalFlagged += batchIssues.length;
    sceneReports.push({
      sceneKey,
      titleZh: getSceneStory(sceneKey)?.titleZh ?? sceneKey,
      total: sorted.length,
      flagged: batchIssues.length,
      batchIssues,
      lines: flagged,
    });
  }

  const report = {
    completedAt: new Date().toISOString(),
    sceneCount: sceneReports.length,
    totalLines: [...byScene.values()].reduce((s, r) => s + r.length, 0),
    flaggedLines: totalFlagged,
    byKind: summarize(sceneReports),
    scenes: sceneReports,
  };

  fs.mkdirSync(path.dirname(REPORT_PATH), { recursive: true });
  fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2));

  console.log(`\n══ 对话质量审计 ══`);
  console.log(`场景: ${report.sceneCount} | 台词: ${report.totalLines} | 病句: ${totalFlagged}`);
  console.log(`分类: ${JSON.stringify(report.byKind)}`);
  console.log(`\nTOP 问题（前 15）:`);
  const top = sceneReports
    .flatMap((s) => s.lines.map((l) => ({ scene: s.sceneKey, ...l })))
    .slice(0, 15);
  for (const row of top) {
    console.log(`  [${row.scene} #${row.seq}] ${row.issues.map((i) => i.message).join(' | ')}`);
    console.log(`    EN: ${row.en}`);
    console.log(`    ZH: ${row.zh}`);
  }
  console.log(`\n完整报告: ${REPORT_PATH}`);
}

function summarize(
  scenes: Array<{ batchIssues: QualityIssue[] }>,
): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const s of scenes) {
    for (const issue of s.batchIssues) {
      counts[issue.kind] = (counts[issue.kind] ?? 0) + 1;
    }
  }
  return counts;
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
