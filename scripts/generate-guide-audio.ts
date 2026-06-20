/**
 * 预生成单词详情「绝佳搭配例句」MP3
 * 来源：Supabase ogden_word_guides.guide_sentences[].en
 * 音源：edge-tts en-GB-SoniaNeural（与 850 词 MP3 完全一致的声音）
 * 输出：public/assets/audio/guides/{wordId}-{idx}.mp3
 *
 * Usage:
 *   npm run audio:guides                    # 全量（跳过已有文件）
 *   npm run audio:guides -- --fix-broken    # 仅重生成 audit 失败项
 *   npm run audio:guides -- --word come     # 单词测试
 *   npm run audio:guides -- --limit 20      # 前 20 条
 *   npm run audio:guides -- --offset 500   # 跳过前 500 条
 *   npm run audio:guides -- --force         # 强制覆盖已有
 *   npm run audio:guides -- --stale         # 仅重生成 manifest 与文本不一致项
 *   npm run audio:guides -- --method "性质 100"  # 按 guide.method 过滤
 *   npm run audio:guides -- --workers 6     # 并行 edge-tts 进程数（默认 6）
 */
import * as fs from 'fs';
import * as path from 'path';
import { execFile } from 'child_process';
import { promisify } from 'util';
import * as dotenv from 'dotenv';
import {
  OUT_DIR,
  auditGuideAudioFromGuides,
  filterGuidesByMethod,
  guideEntryKey,
  guideMp3AbsPath,
  loadGuideAudioManifest,
  saveGuideAudioManifest,
  upsertManifestEntry,
} from './lib/guideAudioAudit';
import { loadGuidesRecordForScripts } from './lib/guideSupabase';

dotenv.config({ path: '.env.local' });

const execFileAsync = promisify(execFile);
const VOICE = 'en-GB-SoniaNeural';
const DEFAULT_WORKERS = 6;

function parseArgs() {
  const argv = process.argv.slice(2);
  const get = (flag: string) => {
    const i = argv.indexOf(flag);
    return i >= 0 ? argv[i + 1] : undefined;
  };
  return {
    word: get('--word'),
    method: get('--method'),
    limit: Number(get('--limit') ?? '0') || 0,
    offset: Number(get('--offset') ?? '0') || 0,
    force: argv.includes('--force'),
    fixBroken: argv.includes('--fix-broken'),
    stale: argv.includes('--stale'),
    workers: Math.min(8, Math.max(1, Number(get('--workers') ?? DEFAULT_WORKERS) || DEFAULT_WORKERS)),
  };
}

async function generateMp3(text: string, dest: string): Promise<void> {
  await execFileAsync('edge-tts', [
    '--voice', VOICE,
    '--text', text,
    '--write-media', dest,
  ]);
  const stat = fs.statSync(dest);
  if (stat.size === 0) throw new Error('edge-tts wrote empty file');
}

async function runPool<T>(
  items: T[],
  concurrency: number,
  fn: (item: T) => Promise<void>,
): Promise<{ ok: number; fail: number }> {
  let cursor = 0;
  let ok = 0;
  let fail = 0;

  async function worker() {
    while (cursor < items.length) {
      const i = cursor++;
      try {
        await fn(items[i]);
        ok++;
      } catch {
        fail++;
      }
    }
  }

  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, () => worker()));
  return { ok, fail };
}

async function main() {
  const opts = parseArgs();

  try {
    await execFileAsync('edge-tts', ['--version']);
  } catch {
    console.error('❌ edge-tts 未安装，请运行: pip3 install edge-tts --break-system-packages');
    process.exit(1);
  }

  if (!fs.existsSync(OUT_DIR)) {
    fs.mkdirSync(OUT_DIR, { recursive: true });
  } else {
    fs.mkdirSync(OUT_DIR, { recursive: true });
  }

  const guidesRaw = await loadGuidesRecordForScripts();
  const guides = filterGuidesByMethod(guidesRaw, opts.method);

  type Entry = { wordId: string; idx: number; text: string; dest: string };
  const todo: Entry[] = [];

  const brokenKeys = new Set<string>();
  if (opts.fixBroken) {
    const audit = auditGuideAudioFromGuides(guides, OUT_DIR, undefined, { method: opts.method });
    for (const f of audit.failures) {
      if (f.issue !== 'stale') brokenKeys.add(`${f.wordId}:${f.index}`);
    }
    console.log(`\n--fix-broken: 发现 ${brokenKeys.size} 个异常文件\n`);
  }

  const staleKeys = new Set<string>();
  if (opts.stale) {
    const audit = auditGuideAudioFromGuides(guides, OUT_DIR, undefined, { method: opts.method });
    for (const f of audit.failures) {
      if (f.issue === 'stale') staleKeys.add(`${f.wordId}:${f.index}`);
    }
    console.log(`\n--stale: 发现 ${staleKeys.size} 条文本/音频不一致\n`);
  }

  const manifest = loadGuideAudioManifest();

  for (const [wordId, guide] of Object.entries(guides)) {
    if (opts.word && wordId !== opts.word) continue;
    const sentences = guide.sentences ?? [];
    sentences.forEach((s, idx) => {
      const text = s.en?.trim();
      if (!text) return;
      const dest = guideMp3AbsPath(wordId, idx);
      const key = guideEntryKey(wordId, idx);
      const shouldGenerate =
        opts.force ||
        opts.fixBroken && brokenKeys.has(key) ||
        opts.stale && staleKeys.has(key) ||
        !fs.existsSync(dest);
      if (!shouldGenerate) return;
      todo.push({ wordId, idx, text, dest });
    });
  }

  if (opts.offset > 0) todo.splice(0, opts.offset);
  if (opts.limit > 0) todo.splice(opts.limit);

  if (todo.length === 0) {
    console.log('✅ 无需更新（所有文件已存在，可用 --force 或 --fix-broken）');
    return;
  }

  console.log(`\n生成 guide 音频：${todo.length} 条  [edge-tts ${VOICE}, workers=${opts.workers}]\n`);

  let done = 0;
  const { ok, fail } = await runPool(todo, opts.workers, async (entry) => {
    try {
      await generateMp3(entry.text, entry.dest);
      upsertManifestEntry(manifest, entry.wordId, entry.idx, entry.text);
      done++;
      console.log(`  ✓ [${done}/${todo.length}] ${entry.wordId}[${entry.idx}]  "${entry.text.slice(0, 40)}"`);
    } catch (err) {
      done++;
      console.error(`  ✗ [${done}/${todo.length}] ${entry.wordId}[${entry.idx}]  ${err}`);
      throw err;
    }
  });

  if (ok > 0) saveGuideAudioManifest(manifest);

  console.log(`\n完成：✓ ${ok}  ✗ ${fail}`);
  if (fail > 0) process.exit(1);
}

main().catch((e) => { console.error(e); process.exit(1); });
