/**
 * LLM 修复对话数据 — 审计 → 模型修 → 入库
 *
 * Usage:
 *   npm run repair:dialogues              # 修所有未通过 audit 的场景
 *   npm run repair:dialogues -- --scene Restaurant
 *   npm run repair:dialogues -- --tier P0 --target 48
 */
import * as dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getSceneStory } from '../src/data/sceneStoryScripts';
import { createSupabaseAdmin } from './lib/syncDialoguesToDb';
import { runFullDbAudit } from './lib/auditDbContent';
import { repairSceneWithLlm } from './lib/llmRepairDialogue';
import { pickProvider, resolveDialogueProvider } from './lib/llmDialogue';
import { loadDialogues, saveDialogues } from './lib/pilotRunner';
import { syncSceneDialoguesToDb } from './lib/syncDialoguesToDb';

dotenv.config({ path: '.env.local' });

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const AUDIT_PATH = path.join(__dirname, '../Designs/audit/full-db-audit.json');

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(name);
  return i >= 0 ? process.argv[i + 1] : undefined;
}

async function fetchTurnsForScene(
  supabase: ReturnType<typeof createSupabaseAdmin>,
  sceneId: string,
): Promise<Array<{ seq: number; speaker: string; en: string; zh: string; beat?: string }>> {
  const { data: dialogues } = await supabase
    .from('dialogues')
    .select('id')
    .eq('scene_id', sceneId)
    .order('created_at', { ascending: false })
    .limit(1);
  const dialogueId = dialogues?.[0]?.id as string | undefined;
  if (!dialogueId) return [];

  const { data: turns } = await supabase
    .from('dialogue_turns')
    .select('seq, speaker, en, zh, speech_act')
    .eq('dialogue_id', dialogueId)
    .order('seq', { ascending: true });
  return (turns ?? []).map((t) => ({
    seq: t.seq as number,
    speaker: t.speaker as string,
    en: t.en as string,
    zh: (t.zh as string) ?? '',
    beat: (t.speech_act as string) ?? '进行',
  }));
}

async function main() {
  const providerPref = resolveDialogueProvider();
  const engine = pickProvider(providerPref === 'auto' ? 'deepseek' : providerPref);
  if (!engine) {
    console.error('❌ repair 需要 DEEPSEEK_API_KEY 或 GEMINI_API_KEY');
    process.exit(1);
  }

  const sceneFilter = arg('--scene');
  const tierFilter = arg('--tier');
  const target = Number(arg('--target') ?? '48');
  const skipAudit = process.argv.includes('--skip-audit');

  console.log(`\n══ LLM 对话修复 ══ Provider: ${engine} | 目标: ${target} 句\n`);

  const supabase = createSupabaseAdmin();
  let audit = skipAudit && fs.existsSync(AUDIT_PATH)
    ? (JSON.parse(fs.readFileSync(AUDIT_PATH, 'utf8')) as Awaited<ReturnType<typeof runFullDbAudit>>)
    : await runFullDbAudit(supabase);

  fs.mkdirSync(path.dirname(AUDIT_PATH), { recursive: true });
  fs.writeFileSync(AUDIT_PATH, JSON.stringify(audit, null, 2));

  let failing = audit.scenes.filter((s) => !s.ok);
  if (sceneFilter) failing = failing.filter((s) => s.sceneKey === sceneFilter);
  if (tierFilter) failing = failing.filter((s) => s.tier === tierFilter);

  if (failing.length === 0) {
    console.log('✅ 无待修复场景');
    return;
  }

  console.log(`待修复: ${failing.length} 个场景\n`);

  let dialogues = loadDialogues();
  const results: Array<{ sceneKey: string; mode: string; total: number; issues: string[] }> = [];

  for (const scene of failing) {
    const script = getSceneStory(scene.sceneKey);
    if (!script) continue;

    console.log(`══ TOP ${scene.freqRank} ${scene.titleZh} (${scene.sceneKey}) ══`);

    const turns = await fetchTurnsForScene(supabase, scene.sceneId);
    const allIssues = [...scene.sceneIssues, ...scene.dialogueIssues];
    const maxId = dialogues.reduce((m, r) => Math.max(m, r.id), 299_999);

    const { records, mode, issues } = await repairSceneWithLlm({
      sceneKey: scene.sceneKey,
      lines: turns,
      issues: allIssues,
      target,
      provider: engine,
      startId: maxId + 1,
      verbose: true,
    });

    dialogues = [
      ...dialogues.filter((d) => d.scene !== scene.sceneKey),
      ...records,
    ].sort((a, b) => (a.scene === b.scene ? a.seq - b.seq : a.scene.localeCompare(b.scene)));
    saveDialogues(dialogues);

    const sceneRows = dialogues.filter((d) => d.scene === scene.sceneKey);
    try {
      await syncSceneDialoguesToDb(scene.sceneKey, sceneRows, { status: 'published', verbose: true });
    } catch (err) {
      console.warn(`  ⚠ DB 同步失败: ${err instanceof Error ? err.message : err}`);
    }

    results.push({ sceneKey: scene.sceneKey, mode, total: records.length, issues });
    console.log(`  → ${records.length} 句 (${mode}) ${issues.length ? '⚠ ' + issues[0] : '✅'}\n`);
    await new Promise((r) => setTimeout(r, 1200));
  }

  console.log('── 再审计 ──');
  const after = await runFullDbAudit(supabase);
  fs.writeFileSync(AUDIT_PATH, JSON.stringify(after, null, 2));
  console.log(`修复后: ✅ ${after.scenesOk} | ❌ ${after.scenesFail}`);

  const reportPath = path.join(__dirname, '../Designs/audit/repair-report.json');
  fs.writeFileSync(
    reportPath,
    JSON.stringify({ completedAt: new Date().toISOString(), repaired: results, after }, null, 2),
  );
  console.log(`报告: ${reportPath}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
