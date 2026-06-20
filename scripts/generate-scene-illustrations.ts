/**
 * 为场景生成插画 PNG（2.5:1 横幅，适配 SceneCover）
 * Usage:
 *   npm run generate:illustrations -- --all --force
 *   npm run generate:illustrations -- --top 3
 *   npm run generate:illustrations -- --scene Shopping --force
 */
import * as dotenv from 'dotenv';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import {
  SCENE_STORY_SCRIPTS,
  slugifySceneKey,
  type SceneStoryScript,
} from '../src/data/sceneStoryScripts';
import { getStoryNarrative } from '../src/data/storyNarrative';
import { resolveGeminiApiKey } from './lib/geminiDialogue';

dotenv.config({ path: '.env.local' });

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.join(__dirname, '../public/assets/scenes');
const IMAGE_MODEL = 'gemini-3.1-flash-image';
const BANNER_ASPECT = 2.5; // width / height

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function buildPrompt(scene: SceneStoryScript): string {
  const n = getStoryNarrative(scene.sceneKey);
  const beats = scene.storyOutline.map((c) => `${c.beat}·${c.title}: ${c.goal}`).join(' → ');

  return `Modern flat vector illustration for a language-learning app scene card banner.
Scene: ${scene.titleZh} (${scene.titleEn})
When: ${n.when}
Where: ${n.where}
Who: ${n.who}
What happens: ${n.event}
How: ${n.method}
Story arc: ${beats}
Visual motifs: ${scene.illustration.motifs.join(', ')}
Color accent: ${scene.illustration.accent}

Style: warm, friendly, clean digital illustration like premium mobile app art. Soft gradients, cozy lighting, no photorealism.
Composition: ultra-wide 2.5:1 horizontal banner. ALL faces and heads in the LOWER 55% of frame (never near top). Upper 30% = ceiling, sky, or abstract background only.
Rules: no text, no letters, no numbers, no watermark, single clear scene, one focal action.`;
}

function cropToBanner(pngPath: string): void {
  const meta = execSync(`sips -g pixelWidth -g pixelHeight "${pngPath}"`, { encoding: 'utf8' });
  const w = Number(meta.match(/pixelWidth: (\d+)/)?.[1]);
  const h = Number(meta.match(/pixelHeight: (\d+)/)?.[1]);
  if (!w || !h) return;

  const targetH = Math.round(w / BANNER_ASPECT);
  if (targetH >= h) return; // already wide enough

  // 居中裁切，避免偏下裁切切掉人物头部
  const y = Math.round((h - targetH) / 2);
  const tmp = `${pngPath}.crop.tmp.png`;
  execSync(
    `ffmpeg -y -i "${pngPath}" -vf "crop=${w}:${targetH}:0:${y}" "${tmp}" 2>/dev/null`,
    { stdio: 'ignore' },
  );
  fs.renameSync(tmp, pngPath);
}

async function generateOne(
  ai: GoogleGenAI,
  scene: SceneStoryScript,
): Promise<Buffer | null> {
  const prompt = buildPrompt(scene);

  try {
    const response = await ai.models.generateContent({
      model: IMAGE_MODEL,
      contents: prompt,
      config: { responseModalities: ['TEXT', 'IMAGE'] },
    });

    const parts = response.candidates?.[0]?.content?.parts ?? [];
    for (const part of parts) {
      const inline = part.inlineData;
      if (inline?.data) {
        return Buffer.from(inline.data, 'base64');
      }
    }
    console.warn(`  No image in response for ${scene.sceneKey}`);
    return null;
  } catch (err) {
    console.warn(`  Image gen failed [${scene.sceneKey}]:`, err instanceof Error ? err.message : err);
    return null;
  }
}

async function main() {
  const apiKey = resolveGeminiApiKey();
  if (!apiKey) {
    console.error('GEMINI_API_KEY required in .env.local');
    process.exit(1);
  }

  const allFlag = process.argv.includes('--all');
  const force = process.argv.includes('--force');
  const topIdx = process.argv.indexOf('--top');
  const topN = topIdx >= 0 ? Number(process.argv[topIdx + 1]) : 3;
  const sceneFilter = process.argv.find((a, i) => process.argv[i - 1] === '--scene');

  let scenes = [...SCENE_STORY_SCRIPTS].sort((a, b) => a.freqRank - b.freqRank);
  if (sceneFilter) {
    scenes = scenes.filter((s) => s.sceneKey === sceneFilter);
  } else if (allFlag) {
    // all 50
  } else {
    scenes = scenes.slice(0, topN);
  }

  fs.mkdirSync(OUT_DIR, { recursive: true });
  const ai = new GoogleGenAI({ apiKey });

  console.log(`Generating ${scenes.length} illustration(s) → ${OUT_DIR}`);
  console.log(`Model: ${IMAGE_MODEL}`);

  let ok = 0;
  let fail = 0;
  let skip = 0;

  for (const scene of scenes) {
    const slug = slugifySceneKey(scene.sceneKey);
    const outPath = path.join(OUT_DIR, `${slug}.png`);
    if (fs.existsSync(outPath) && !force) {
      console.log(`  skip ${scene.sceneKey} (exists, use --force)`);
      skip++;
      continue;
    }
    process.stdout.write(`  [${scene.freqRank}/${scenes.length}] ${scene.sceneKey}…`);
    const buf = await generateOne(ai, scene);
    if (buf) {
      fs.writeFileSync(outPath, buf);
      try {
        cropToBanner(outPath);
      } catch {
        console.warn(' (crop skipped)');
      }
      console.log(` ✓ ${slug}.png`);
      ok++;
    } else {
      console.log(' ✗');
      fail++;
    }
    await sleep(2500);
  }

  console.log(`\nDone: ${ok} ok, ${fail} failed, ${skip} skipped`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
