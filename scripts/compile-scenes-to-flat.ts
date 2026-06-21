import fs from 'fs';
import path from 'path';
import type { SceneDialogueRecord } from '../src/types/sceneDialogue';

const SCENES_DIR = path.join(process.cwd(), 'src/data/scenes');
const OUT_FILE = path.join(process.cwd(), 'src/data/sceneDialogues.json');

interface ScenePackage {
  slug: string;
  sceneKey: string;
  titleZh: string;
  titleEn: string;
  turns: Array<{
    seq: number;
    speaker: 'A' | 'B';
    en: string;
    zh: string;
    beat: '开场' | '进行' | '收束';
  }>;
}

function main() {
  if (!fs.existsSync(SCENES_DIR)) {
    console.error(`❌ Directory not found: ${SCENES_DIR}`);
    process.exit(1);
  }

  const files = fs.readdirSync(SCENES_DIR).filter((f) => f.endsWith('.json'));
  console.log(`Found ${files.length} scene files in ${SCENES_DIR}`);

  const allRecords: SceneDialogueRecord[] = [];
  let nextId = 400000;

  for (const file of files) {
    const filePath = path.join(SCENES_DIR, file);
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const scenePkg = JSON.parse(content) as ScenePackage;

      if (!scenePkg.sceneKey || !Array.isArray(scenePkg.turns)) {
        console.warn(`⚠️ Skip invalid file: ${file}`);
        continue;
      }

      for (const turn of scenePkg.turns) {
        allRecords.push({
          id: nextId++,
          scene: scenePkg.sceneKey,
          seq: turn.seq,
          speaker: turn.speaker,
          sentence: turn.en,
          zh: turn.zh ?? '',
          beat: turn.beat ?? '进行',
          source: 'generated',
        });
      }
    } catch (err) {
      console.error(`❌ Error parsing ${file}:`, err);
    }
  }

  // Sort by sceneKey, then seq
  allRecords.sort((a, b) => {
    if (a.scene !== b.scene) {
      return a.scene.localeCompare(b.scene);
    }
    return a.seq - b.seq;
  });

  // Write flat records back to sceneDialogues.json
  fs.writeFileSync(OUT_FILE, JSON.stringify(allRecords, null, 2) + '\n');
  console.log(`✅ Success: Merged ${allRecords.length} turns into ${OUT_FILE}`);
}

main();
