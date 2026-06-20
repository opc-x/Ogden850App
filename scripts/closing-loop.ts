/**
 * 违规场景 fix-first → regenerate → fix 循环 — issue #8 续跑
 */
import { execSync } from 'child_process';
import { loadDialogues } from './lib/pilotRunner';
import { validateDuplicateClosingPhrases } from './lib/dialogueQuality';
import { listTop50SceneKeys } from '../src/data/sceneStoryScripts';

const MAX_CYCLES = 5;

function failingScenes(): string[] {
  const records = loadDialogues();
  return listTop50SceneKeys().filter((sceneKey) => {
    const rows = records.filter((r) => r.scene === sceneKey).sort((a, b) => a.seq - b.seq);
    return validateDuplicateClosingPhrases(rows.map((r) => ({ en: r.sentence }))).length > 0;
  });
}

function run(cmd: string) {
  console.log(`\n$ ${cmd}\n`);
  execSync(cmd, { stdio: 'inherit', cwd: process.cwd(), env: process.env });
}

function main() {
  for (let cycle = 1; cycle <= MAX_CYCLES; cycle++) {
    let failing = failingScenes();
    console.log(`\n══ Cycle ${cycle}/${MAX_CYCLES} — 违规 ${failing.length}/50 ══\n`);
    if (failing.length === 0) break;

    for (const sceneKey of failing) {
      console.log(`\n── fix: ${sceneKey} ──`);
      run(`npm run fix:closing -- --scene "${sceneKey}"`);
    }

    failing = failingScenes();
    if (failing.length === 0) break;

    for (const sceneKey of failing) {
      console.log(`\n── regenerate+fix: ${sceneKey} ──`);
      run(`npm run regenerate:dialogues -- --scene "${sceneKey}" --skip-sync`);
      run(`npm run fix:closing -- --scene "${sceneKey}"`);
    }
  }

  const left = failingScenes().length;
  console.log(`\n══ 结束 ══ 剩余违规: ${left}/50`);
  process.exit(left > 0 ? 1 : 0);
}

main();
