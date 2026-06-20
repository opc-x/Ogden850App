/** 导出 issue #8 执行报告用 10 场景完整台词 */
import { loadDialogues } from './lib/pilotRunner';

const SCENES = [
  'Asking Directions',
  'Gas Station',
  'Password',
  'Moving House',
  'WiFi',
  'Shopping',
  'Restaurant',
  'Transport',
  'Health',
  'Emergency',
];

function main() {
  const all = loadDialogues();
  for (const scene of SCENES) {
    const rows = all.filter((d) => d.scene === scene).sort((a, b) => a.seq - b.seq);
    console.log(`\n### ${scene} (${rows.length} 句)\n`);
    for (const r of rows) {
      console.log(`${r.seq}. [${r.beat}] ${r.speaker}: ${r.sentence}`);
      console.log(`   ZH: ${r.zh}`);
    }
  }
}

main();
