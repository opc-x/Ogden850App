/**
 * 重复收尾语检测 — issue #8 T1
 */
import { loadDialogues } from './lib/pilotRunner';
import { validateDuplicateClosingPhrases } from './lib/dialogueQuality';
import { listTop50SceneKeys } from '../src/data/sceneStoryScripts';

function main() {
  const records = loadDialogues();
  const scenes = listTop50SceneKeys();
  let bad = 0;

  for (const sceneKey of scenes) {
    const rows = records.filter((r) => r.scene === sceneKey).sort((a, b) => a.seq - b.seq);
    const issues = validateDuplicateClosingPhrases(rows.map((r) => ({ en: r.sentence })));
    if (issues.length > 0) {
      bad++;
      console.log(`❌ ${sceneKey}: ${issues.map((i) => i.message).join(' | ')}`);
    }
  }

  console.log(`\n收尾语违规场景: ${bad}/${scenes.length}`);
  process.exit(bad > 0 ? 1 : 0);
}

main();
