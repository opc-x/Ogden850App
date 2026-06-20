/**
 * LLM 连贯性修复循环 — issue #8 第四轮 step 3
 * fail 场景整篇 regenerate → 再审计，直到全 pass 或达上限
 */
import * as dotenv from 'dotenv';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { runCoherenceAudit } from './audit-narrative-coherence-llm';

dotenv.config({ path: '.env.local' });

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPORT_PATH = path.join(__dirname, '../Designs/audit/coherence-fix-loop.json');

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(name);
  return i >= 0 ? process.argv[i + 1] : undefined;
}

function runMechanical(): { closing: string; duplicates: string } {
  const closing = execSync('npm run audit:closing 2>&1', { encoding: 'utf8', cwd: process.cwd() });
  const duplicates = execSync('npm run audit:duplicates 2>&1', { encoding: 'utf8', cwd: process.cwd() });
  const closingMatch = closing.match(/(\d+)\/(\d+)/);
  const dupMatch = duplicates.match(/(\d+)\/(\d+)/);
  return {
    closing: closingMatch ? `${50 - Number(closingMatch[1])}/50` : closing.trim().slice(-40),
    duplicates: dupMatch ? `${50 - Number(dupMatch[1])}/50` : duplicates.trim().slice(-40),
  };
}

async function regenerateScene(sceneKey: string, target: number): Promise<void> {
  console.log(`\n  ↻ 整篇重生: ${sceneKey}`);
  execSync(`npm run regenerate:dialogues -- --scene "${sceneKey}" --target ${target} --skip-sync`, {
    stdio: 'inherit',
    cwd: process.cwd(),
  });
}

async function main() {
  const maxOuter = Number(arg('--max-rounds') ?? '5');
  const target = Number(arg('--target') ?? '32');
  const sceneOnly = arg('--scene');
  const rounds: Array<{ round: number; passCount: number; failed: string[] }> = [];

  for (let round = 1; round <= maxOuter; round++) {
    console.log(`\n════════ 连贯性循环 第 ${round}/${maxOuter} 轮 ════════\n`);
    const { results, passCount, total } = await runCoherenceAudit({
      sceneFilter: sceneOnly,
      verbose: true,
    });

    const failed = results.filter((r) => !r.pass && !r.error).map((r) => r.sceneKey);
    const errored = results.filter((r) => r.error).map((r) => r.sceneKey);
    rounds.push({ round, passCount, failed: [...failed, ...errored] });

    if (failed.length === 0 && errored.length === 0) {
      console.log(`\n✅ 全部 ${total} 场景 LLM 审计通过`);
      break;
    }

    if (round >= maxOuter) {
      console.log(`\n⚠ 达上限，仍有 ${failed.length + errored.length} 场景未通过`);
      break;
    }

    for (const sceneKey of [...failed, ...errored]) {
      await regenerateScene(sceneKey, target);
    }
  }

  const mech = runMechanical();
  const finalAudit = JSON.parse(fs.readFileSync(path.join(__dirname, '../Designs/audit/coherence-llm-audit.json'), 'utf8'));
  const report = {
    completedAt: new Date().toISOString(),
    rounds,
    final: {
      coherencePass: finalAudit.passCount,
      total: finalAudit.total,
      closing: mech.closing,
      duplicates: mech.duplicates,
    },
  };
  fs.mkdirSync(path.dirname(REPORT_PATH), { recursive: true });
  fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2));
  console.log(`\n循环报告: ${REPORT_PATH}`);
  console.log(`LLM: ${finalAudit.passCount}/${finalAudit.total} | closing: ${mech.closing} | duplicates: ${mech.duplicates}`);

  const allPass =
    finalAudit.passCount === finalAudit.total &&
    mech.closing.startsWith('50/') &&
    mech.duplicates.startsWith('50/');
  process.exit(allPass ? 0 : 1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
