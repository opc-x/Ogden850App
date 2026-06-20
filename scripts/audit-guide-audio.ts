/**
 * 审计单词详情例句 guide MP3 覆盖率与文件健康度。
 *
 * Usage:
 *   npm run audio:audit-guides
 *   npm run audio:audit-guides -- --json
 */
import * as dotenv from 'dotenv';
import { auditGuideAudioFromGuides, MIN_VALID_BYTES } from './lib/guideAudioAudit';
import { loadGuidesRecordForScripts } from './lib/guideSupabase';

dotenv.config({ path: '.env.local' });

async function main() {
  const jsonMode = process.argv.includes('--json');
  const methodFlagIdx = process.argv.indexOf('--method');
  const methodFilter = methodFlagIdx >= 0 ? process.argv[methodFlagIdx + 1] : undefined;
  const guides = await loadGuidesRecordForScripts();
  const { total, ok, failures } = auditGuideAudioFromGuides(guides, undefined, undefined, { method: methodFilter });

  const byIssue = (issue: string) => failures.filter((f) => f.issue === issue);

  if (jsonMode) {
    console.log(JSON.stringify({ total, ok, failureCount: failures.length, failures }, null, 2));
    process.exit(failures.length > 0 ? 1 : 0);
  }

  console.log(`\nGuide 音频审计（阈值 ${MIN_VALID_BYTES} bytes）\n`);
  console.log(`总计: ${total}  正常: ${ok}  异常: ${failures.length}\n`);

  if (failures.length === 0) {
    console.log('✅ 全部 guide MP3 正常');
    process.exit(0);
  }

  const groups: Array<[string, ReturnType<typeof byIssue>]> = [
    ['stale', byIssue('stale')],
    ['missing', byIssue('missing')],
    ['zero-byte', byIssue('zero-byte')],
    ['too-small', byIssue('too-small')],
    ['corrupt', byIssue('corrupt')],
  ];

  for (const [label, items] of groups) {
    if (items.length === 0) continue;
    console.log(`${label}: ${items.length}`);
    for (const f of items.slice(0, 50)) {
      console.log(`  ${f.wordId}[${f.index}]  ${f.relPath}  (${f.size} B)  "${f.en.slice(0, 50)}"`);
    }
    if (items.length > 50) console.log(`  ... +${items.length - 50} more`);
    console.log('');
  }

  process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
