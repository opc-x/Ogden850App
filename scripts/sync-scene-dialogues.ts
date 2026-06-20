/**
 * Push sceneDialogues.json → Supabase (scenes + dialogues + turns + tokens)
 *
 * Usage:
 *   npm run sync:dialogues
 *   npm run sync:dialogues -- --scene Shopping
 *   npm run sync:dialogues -- --scenes-only
 */
import * as dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { loadDialogues } from './lib/pilotRunner';
import {
  syncAllScenesFromRecords,
  syncSceneDialoguesToDb,
  upsertAllSceneCatalog,
} from './lib/syncDialoguesToDb';

dotenv.config({ path: '.env.local' });

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPORT_PATH = path.join(__dirname, '../Designs/pilot/db-sync-report.json');

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(name);
  return i >= 0 ? process.argv[i + 1] : undefined;
}

async function main() {
  const sceneKey = arg('--scene');
  const scenesOnly = process.argv.includes('--scenes-only');

  if (scenesOnly) {
    const n = await upsertAllSceneCatalog();
    console.log(`✅ Upserted ${n} scene catalog rows`);
    return;
  }

  const records = loadDialogues();
  if (!records.length) {
    console.error('❌ sceneDialogues.json 为空');
    process.exit(1);
  }

  console.log(`\n══ 对话入库 Supabase ══`);
  console.log(`JSON 共 ${records.length} 句 / ${new Set(records.map((r) => r.scene)).size} 场景\n`);

  let results;
  if (sceneKey) {
    const sceneRows = records.filter((r) => r.scene === sceneKey);
    if (!sceneRows.length) {
      console.error(`❌ JSON 中无场景: ${sceneKey}`);
      process.exit(1);
    }
    results = [await syncSceneDialoguesToDb(sceneKey, sceneRows, { verbose: true })];
  } else {
    results = await syncAllScenesFromRecords(records, { verbose: true });
  }

  const report = {
    completedAt: new Date().toISOString(),
    scenes: results.length,
    turns: results.reduce((s, r) => s + r.turns, 0),
    tokens: results.reduce((s, r) => s + r.tokens, 0),
    details: results,
  };

  fs.mkdirSync(path.dirname(REPORT_PATH), { recursive: true });
  fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2));

  console.log(`\n── 入库完成 ──`);
  console.log(`场景: ${report.scenes} | 台词: ${report.turns} | 词元: ${report.tokens}`);
  console.log(`审计: ${REPORT_PATH}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
