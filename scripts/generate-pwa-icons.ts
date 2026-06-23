/**
 * Full-bleed Ogden icon: keep only text+shadow from master, redraw background gradient edge-to-edge.
 */
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const root = process.cwd();
const masterPath = path.join(root, 'scripts/assets/ogden-icon-master.png');

const outputs: Array<{ file: string; size: number }> = [
  { file: 'public/ogden-192.png', size: 192 },
  { file: 'public/ogden-512.png', size: 512 },
  { file: 'public/apple-touch-icon.png', size: 180 },
];

const GRADIENT_TOP = { r: 77, g: 184, b: 138 };
const GRADIENT_MID = { r: 58, g: 155, b: 114 };
const GRADIENT_BOTTOM = { r: 38, g: 107, b: 80 };

function lerp(a: number, b: number, t: number) {
  return Math.round(a + (b - a) * t);
}

function gradientAtY(y: number, height: number) {
  const t = height <= 1 ? 0 : y / (height - 1);
  if (t <= 0.55) {
    const u = t / 0.55;
    return {
      r: lerp(GRADIENT_TOP.r, GRADIENT_MID.r, u),
      g: lerp(GRADIENT_TOP.g, GRADIENT_MID.g, u),
      b: lerp(GRADIENT_TOP.b, GRADIENT_MID.b, u),
    };
  }
  const u = (t - 0.55) / 0.45;
  return {
    r: lerp(GRADIENT_MID.r, GRADIENT_BOTTOM.r, u),
    g: lerp(GRADIENT_MID.g, GRADIENT_BOTTOM.g, u),
    b: lerp(GRADIENT_MID.b, GRADIENT_BOTTOM.b, u),
  };
}

/** Keep white Ogden / 850 lettering only; redraw all background pixels. */
function isForegroundText(r: number, g: number, b: number, a: number) {
  if (a < 24) return false;
  const lum = 0.299 * r + 0.587 * g + 0.114 * b;
  return lum > 168;
}

async function flattenMaster(size: number): Promise<Buffer> {
  const { data, info } = await sharp(masterPath)
    .resize(size, size, { fit: 'fill' })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const out = Buffer.alloc(data.length);
  const { width: w, height: h } = info;

  for (let y = 0; y < h; y++) {
    const bg = gradientAtY(y, h);
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const a = data[i + 3];

      if (isForegroundText(r, g, b, a)) {
        out[i] = r;
        out[i + 1] = g;
        out[i + 2] = b;
        out[i + 3] = 255;
        continue;
      }

      out[i] = bg.r;
      out[i + 1] = bg.g;
      out[i + 2] = bg.b;
      out[i + 3] = 255;
    }
  }

  return sharp(out, { raw: { width: w, height: h, channels: 4 } })
    .png({ compressionLevel: 9, palette: false })
    .toBuffer();
}

async function main() {
  if (!fs.existsSync(masterPath)) {
    throw new Error(`Missing master icon at ${masterPath}`);
  }

  for (const { file, size } of outputs) {
    await flattenMaster(size).then((buf) => sharp(buf).toFile(path.join(root, file)));
    console.log(`wrote ${file} (${size}x${size})`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
