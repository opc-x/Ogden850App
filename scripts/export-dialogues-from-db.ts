/**
 * 从 Supabase 导出对话 → sceneDialogues.json
 */
import * as dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { createSupabaseAdmin } from './lib/syncDialoguesToDb';
import { SCENE_STORY_SCRIPTS } from '../src/data/sceneStoryScripts';
import type { SceneDialogueRecord } from '../src/types/sceneDialogue';

dotenv.config({ path: '.env.local' });

const OUT = path.join(process.cwd(), 'src/data/sceneDialogues.json');

const TITLE_TO_KEY = new Map(SCENE_STORY_SCRIPTS.map((s) => [s.titleEn, s.sceneKey]));

async function main() {
  const sb = createSupabaseAdmin();
  const { data: scenes } = await sb.from('scenes').select('id, title_en');
  if (!scenes?.length) throw new Error('No scenes in DB');

  const records: SceneDialogueRecord[] = [];
  let id = 300_000;

  for (const scene of scenes) {
    const sceneKey = TITLE_TO_KEY.get(scene.title_en as string) ?? (scene.title_en as string);

    const { data: dialogues } = await sb
      .from('dialogues')
      .select('id')
      .eq('scene_id', scene.id)
      .order('created_at', { ascending: false })
      .limit(1);
    const dialogueId = dialogues?.[0]?.id as string | undefined;
    if (!dialogueId) continue;

    const { data: turns } = await sb
      .from('dialogue_turns')
      .select('seq, speaker, en, zh, speech_act')
      .eq('dialogue_id', dialogueId)
      .order('seq', { ascending: true });

    for (const t of turns ?? []) {
      records.push({
        id: id++,
        scene: sceneKey,
        seq: t.seq as number,
        speaker: t.speaker as string,
        sentence: t.en as string,
        zh: (t.zh as string) ?? '',
        beat: (t.speech_act as string) ?? '进行',
        source: 'generated',
      });
    }
  }

  records.sort((a, b) => (a.scene === b.scene ? a.seq - b.seq : a.scene.localeCompare(b.scene)));
  fs.writeFileSync(OUT, JSON.stringify(records, null, 0));
  const byScene = new Map<string, number>();
  for (const r of records) byScene.set(r.scene, (byScene.get(r.scene) ?? 0) + 1);
  console.log(`Exported ${records.length} lines / ${byScene.size} scenes → ${OUT}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
