/**
 * 850 词 PNG 插画 pipeline：覆盖率 → 启发式审计 → 生成队列 → 报告
 *
 * 插画生成统一用 Cursor GenerateImage + install-word-pngs.sh（见 generate:word-pngs）。
 *
 * Usage:
 *   npm run pipeline:word-png
 *   npm run pipeline:word-png -- --audit-only
 *   npm run pipeline:word-png -- --print-queue --limit 30
 */
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { wordsData } from '../src/data/wordsList';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const IMG_DIR = path.join(ROOT, 'public/assets/word-img');
const OUT_DIR = path.join(ROOT, 'Designs/audit');
const REPORT_MD = path.join(OUT_DIR, 'word-png-pipeline-report.md');

function parseArgs() {
  const args = process.argv.slice(2);
  const getNum = (flag: string, fallback: number) => {
    const idx = args.indexOf(flag);
    return idx >= 0 ? Number(args[idx + 1]) : fallback;
  };
  return {
    auditOnly: args.includes('--audit-only'),
    printQueue: args.includes('--print-queue'),
    queueLimit: getNum('--limit', 30),
  };
}

function run(cmd: string) {
  console.log(`\n▶ ${cmd}`);
  execSync(cmd, { cwd: ROOT, stdio: 'inherit', env: process.env });
}

function pngCoverage() {
  const pngs = new Set(
    fs.readdirSync(IMG_DIR).filter((f) => f.endsWith('.png')).map((f) => f.replace(/\.png$/, '')),
  );
  const svgs = fs.readdirSync(IMG_DIR).filter((f) => f.endsWith('.svg'));
  const missing = wordsData.filter((w) => !pngs.has(w.id)).map((w) => w.id);
  return { total: wordsData.length, pngCount: pngs.size, missing, svgCount: svgs.length };
}

function loadHeuristicSummary() {
  const p = path.join(OUT_DIR, 'word-png-heuristic.json');
  if (!fs.existsSync(p)) return null;
  return JSON.parse(fs.readFileSync(p, 'utf8')) as {
    summary?: { keep: number; review: number; regenerate: number; total: number };
    regenerate?: { word: string; issue?: string }[];
    review?: { word: string; issue?: string }[];
  };
}

function writeReport(opts: {
  startedAt: number;
  coverage: ReturnType<typeof pngCoverage>;
  heuristic: ReturnType<typeof loadHeuristicSummary>;
  phases: string[];
}) {
  const elapsedSec = ((Date.now() - opts.startedAt) / 1000).toFixed(1);
  const h = opts.heuristic?.summary;
  const regen = opts.heuristic?.regenerate ?? [];
  const review = opts.heuristic?.review ?? [];

  const md = `### 850 词 PNG 审计结果

- **总耗时**: ${elapsedSec}s
- **PNG 覆盖**: ${opts.coverage.pngCount}/${opts.coverage.total}${opts.coverage.missing.length ? `（缺失: ${opts.coverage.missing.join(', ')}）` : ''}
- **SVG 残留**: ${opts.coverage.svgCount} 个

#### 启发式审计（本地，无 API）
- **保留**: ${h?.keep ?? '—'} | **待人工 review**: ${h?.review ?? '—'} | **需重生成**: ${h?.regenerate ?? '—'}

#### 需重生成（前 20）
${regen
  .slice(0, 20)
  .map((r) => `- \`${r.word}\`: ${r.issue ?? ''}`)
  .join('\n') || '- 无'}

#### 待人工 review（前 20）
${review
  .slice(0, 20)
  .map((r) => `- \`${r.word}\`: ${r.issue ?? ''}`)
  .join('\n') || '- 无'}

#### 执行阶段
${opts.phases.map((p) => `- ${p}`).join('\n')}

#### 插画生成（Cursor GenerateImage）
\`\`\`bash
# 输出待生成/重生成词的 GenerateImage 提示词
npm run generate:word-pngs -- --from-heuristic --limit 50

# 或指定 slug
npm run generate:word-pngs -- flat general

# Agent 生成后安装 + 同步
./scripts/install-word-pngs.sh flat general
npm run sync:word-png-manifest && npm run normalize:word-pngs

# 并行多 agent 分批
./scripts/batch-word-png-parallel.sh 4 picturables 30
\`\`\`

#### 人工视觉审计
更新 \`Designs/audit/word-png-manual-audit.json\` 记录 agent 截图审计结果。
`;
  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.writeFileSync(REPORT_MD, md);
  console.log(`\n📄 Report: ${REPORT_MD}`);
  return md;
}

async function main() {
  const startedAt = Date.now();
  const { auditOnly, printQueue, queueLimit } = parseArgs();
  const phases: string[] = [];

  const svgs = fs.readdirSync(IMG_DIR).filter((f) => f.endsWith('.svg'));
  if (svgs.length) {
    for (const f of svgs) fs.unlinkSync(path.join(IMG_DIR, f));
    phases.push(`删除 ${svgs.length} 个 SVG`);
  } else {
    phases.push('SVG 已清空（跳过）');
  }

  run('npm run sync:word-png-manifest');
  phases.push('sync word-png manifest');

  const coverage = pngCoverage();
  console.log(`\nPNG coverage: ${coverage.pngCount}/${coverage.total}`);
  if (coverage.missing.length) console.log(`Missing: ${coverage.missing.join(', ')}`);

  run('npm run audit:word-png');
  phases.push('覆盖率审计');

  run('npm run audit:word-png-heuristic');
  phases.push('启发式审计（本地）');

  if (printQueue && !auditOnly) {
    run(`npm run generate:word-pngs -- --from-heuristic --limit ${queueLimit}`);
    phases.push(`打印 GenerateImage 队列 limit=${queueLimit}`);
  }

  const heuristic = loadHeuristicSummary();
  const md = writeReport({
    startedAt,
    coverage: pngCoverage(),
    heuristic,
    phases,
  });
  console.log('\n' + md);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
