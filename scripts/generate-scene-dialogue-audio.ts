/**
 * 预生成场景对话句 MP3
 * 来源：src/data/sceneDialogues.json
 * 音源：edge-tts en-GB-SoniaNeural（与词典例句 / 850 词一致）
 * 输出：public/audio/sentences/{id}.mp3
 *
 * Usage:
 *   npm run audio:scenes
 *   npm run audio:scenes -- --scene "Going to the Store"
 *   npm run audio:scenes -- --limit 20
 *   npm run audio:scenes -- --force
 *   npm run audio:scenes -- --workers 6
 */
import * as fs from 'fs';
import * as path from 'path';
import { execFile } from 'child_process';
import { promisify } from 'util';
import sceneDialogues from '../src/data/sceneDialogues.json';
import type { SceneDialogueRow } from '../src/data/loadSceneDialogues';

const execFileAsync = promisify(execFile);
const VOICE = 'en-GB-SoniaNeural';
const OUT_DIR = path.join(process.cwd(), 'public/audio/sentences');
const DEFAULT_WORKERS = 6;
const MIN_VALID_BYTES = 2048;

const rows = sceneDialogues as SceneDialogueRow[];

function parseArgs() {
  const argv = process.argv.slice(2);
  const get = (flag: string) => {
    const i = argv.indexOf(flag);
    return i >= 0 ? argv[i + 1] : undefined;
  };
  return {
    scene: get('--scene'),
    limit: Number(get('--limit') ?? '0') || 0,
    offset: Number(get('--offset') ?? '0') || 0,
    force: argv.includes('--force'),
    workers: Math.min(8, Math.max(1, Number(get('--workers') ?? DEFAULT_WORKERS) || DEFAULT_WORKERS)),
  };
}

function outPath(id: number): string {
  return path.join(OUT_DIR, `${id}.mp3`);
}

async function generateMp3(text: string, dest: string): Promise<void> {
  await execFileAsync('edge-tts', ['--voice', VOICE, '--text', text, '--write-media', dest]);
  const stat = fs.statSync(dest);
  if (stat.size < MIN_VALID_BYTES) throw new Error(`file too small (${stat.size} bytes)`);
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

  fs.mkdirSync(OUT_DIR, { recursive: true });

  type Entry = { id: number; scene: string; text: string; dest: string };
  const todo: Entry[] = [];

  for (const row of rows) {
    if (opts.scene && row.scene !== opts.scene) continue;
    const text = row.sentence?.trim();
    if (!text) continue;
    const dest = outPath(row.id);
    if (!opts.force && fs.existsSync(dest)) {
      const stat = fs.statSync(dest);
      if (stat.size >= MIN_VALID_BYTES) continue;
    }
    todo.push({ id: row.id, scene: row.scene, text, dest });
  }

  if (opts.offset > 0) todo.splice(0, opts.offset);
  if (opts.limit > 0) todo.splice(opts.limit);

  if (todo.length === 0) {
    console.log('✅ 无需更新（已有 MP3，可用 --force 重生成）');
    return;
  }

  console.log(`\n生成场景对话音频：${todo.length} 条  [edge-tts ${VOICE}, workers=${opts.workers}]\n`);

  let done = 0;
  const { ok, fail } = await runPool(todo, opts.workers, async (entry) => {
    try {
      await generateMp3(entry.text, entry.dest);
      done++;
      if (done <= 5 || done % 100 === 0 || done === todo.length) {
        console.log(`  ✓ [${done}/${todo.length}] #${entry.id}  "${entry.text.slice(0, 48)}"`);
      }
    } catch (err) {
      done++;
      console.error(`  ✗ [${done}/${todo.length}] #${entry.id}  ${err}`);
      throw err;
    }
  });

  console.log(`\n完成：✓ ${ok}  ✗ ${fail}  → ${OUT_DIR}`);
  if (fail > 0) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
