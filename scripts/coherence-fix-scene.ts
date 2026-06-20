/**
 * 单场景三检门禁 — LLM连贯 + closing + duplicates 全过才停
 */
import * as dotenv from 'dotenv';
import { execSync } from 'child_process';
import { runCoherenceAudit, type SceneCoherenceResult } from './audit-narrative-coherence-llm';

dotenv.config({ path: '.env.local' });

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(name);
  return i >= 0 ? process.argv[i + 1] : undefined;
}

function mechanicalOk(sceneKey: string): { closing: boolean; duplicates: boolean; closingMsg: string; dupMsg: string } {
  let closingOut = '';
  let dupOut = '';
  try {
    closingOut = execSync('npm run audit:closing 2>&1', { encoding: 'utf8' });
  } catch (e) {
    closingOut = (e as { stdout?: string }).stdout ?? '';
  }
  try {
    dupOut = execSync('npm run audit:duplicates 2>&1', { encoding: 'utf8' });
  } catch (e) {
    dupOut = (e as { stdout?: string }).stdout ?? '';
  }
  if (closingOut.includes('ERR_MODULE_NOT_FOUND') || closingOut.includes('Cannot find module')) {
    throw new Error(`audit:closing 脚本异常:\n${closingOut.slice(-400)}`);
  }
  if (dupOut.includes('ERR_MODULE_NOT_FOUND') || dupOut.includes('Cannot find module')) {
    throw new Error(`audit:duplicates 脚本异常:\n${dupOut.slice(-400)}`);
  }
  const closingBad = closingOut.includes(`❌ ${sceneKey}`);
  const dupBad = dupOut.includes(`❌ ${sceneKey}`);
  return {
    closing: !closingBad,
    duplicates: !dupBad,
    closingMsg: closingBad ? closingOut.split('\n').find((l) => l.includes(sceneKey)) ?? '' : 'ok',
    dupMsg: dupBad ? dupOut.split('\n').find((l) => l.includes(sceneKey)) ?? '' : 'ok',
  };
}

async function main() {
  const sceneKey = arg('--scene');
  if (!sceneKey) {
    console.error('Usage: npm run coherence:fix-scene -- --scene "Tech Support"');
    process.exit(1);
  }
  const target = Number(arg('--target') ?? '32');
  const maxRounds = Number(arg('--max-rounds') ?? '10');

  for (let round = 1; round <= maxRounds; round++) {
    console.log(`\n── ${sceneKey} 第 ${round}/${maxRounds} 轮检测 ──`);
    const { results } = await runCoherenceAudit({ sceneFilter: sceneKey, verbose: true });
    const coh: SceneCoherenceResult | undefined = results[0];
    const mech = mechanicalOk(sceneKey);

    const allPass = coh?.pass && !coh?.error && mech.closing && mech.duplicates;
    if (allPass) {
      console.log(`\n✅ ${sceneKey} 三检全部通过`);
      process.exit(0);
    }

    console.log(`  coherence: ${coh?.pass ? 'pass' : 'fail'}`);
    if (!mech.closing) console.log(`  closing: ${mech.closingMsg}`);
    if (!mech.duplicates) console.log(`  duplicates: ${mech.dupMsg}`);

    if (round >= maxRounds) {
      console.error(`\n❌ ${sceneKey} 达上限仍未三检通过`);
      process.exit(1);
    }

    console.log(`  ↻ 整篇重生…`);
    execSync(`npm run regenerate:dialogues -- --scene "${sceneKey}" --target ${target} --skip-sync`, {
      stdio: 'inherit',
    });
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
