/**
 * PWA icons from master: resize, then fill transparent corners
 * via nearest-opaque-pixel color bleed (BFS propagation).
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

/** Pixels below this are treated as empty and filled by bleed. */
const FILL_ALPHA = 200;

function dist2(x1: number, y1: number, x2: number, y2: number) {
  const dx = x1 - x2;
  const dy = y1 - y2;
  return dx * dx + dy * dy;
}

function jfaSteps(size: number): number[] {
  const steps: number[] = [];
  let step = Math.ceil(size / 2);
  while (step >= 1) {
    steps.push(step);
    step = Math.floor(step / 2);
  }
  if (steps.at(-1) !== 1) steps.push(1);
  return steps;
}

/** Fill transparent pixels with RGB from the nearest opaque pixel (Euclidean, via JFA). */
function bleedNearestOpaque(data: Buffer, width: number, height: number): Buffer {
  const out = Buffer.from(data);
  const pixelCount = width * height;
  const seedX = new Int32Array(pixelCount).fill(-1);
  const seedY = new Int32Array(pixelCount).fill(-1);
  const nextX = new Int32Array(pixelCount);
  const nextY = new Int32Array(pixelCount);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const p = y * width + x;
      if (data[p * 4 + 3] >= FILL_ALPHA) {
        seedX[p] = x;
        seedY[p] = y;
      }
    }
  }

  for (const step of jfaSteps(Math.max(width, height))) {
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const p = y * width + x;
        let bestX = seedX[p];
        let bestY = seedY[p];
        let bestDist = bestX >= 0 ? dist2(x, y, bestX, bestY) : Number.POSITIVE_INFINITY;

        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            const nx = x + dx * step;
            const ny = y + dy * step;
            if (nx < 0 || nx >= width || ny < 0 || ny >= height) continue;
            const np = ny * width + nx;
            const sx = seedX[np];
            const sy = seedY[np];
            if (sx < 0) continue;
            const d = dist2(x, y, sx, sy);
            if (d < bestDist) {
              bestDist = d;
              bestX = sx;
              bestY = sy;
            }
          }
        }

        nextX[p] = bestX;
        nextY[p] = bestY;
      }
    }
    seedX.set(nextX);
    seedY.set(nextY);
  }

  for (let p = 0; p < pixelCount; p++) {
    const sx = seedX[p];
    const sy = seedY[p];
    if (sx < 0) continue;

    const dst = p * 4;
    if (data[dst + 3] < FILL_ALPHA) {
      const src = (sy * width + sx) * 4;
      out[dst] = data[src];
      out[dst + 1] = data[src + 1];
      out[dst + 2] = data[src + 2];
    }
    out[dst + 3] = 255;
  }

  return out;
}

async function renderIcon(size: number): Promise<Buffer> {
  const { data, info } = await sharp(masterPath)
    .resize(size, size, { fit: 'fill' })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const bled = bleedNearestOpaque(data, info.width, info.height);

  return sharp(bled, { raw: { width: info.width, height: info.height, channels: 4 } })
    .png({ compressionLevel: 9, palette: false })
    .toBuffer();
}

async function main() {
  if (!fs.existsSync(masterPath)) {
    throw new Error(`Missing master icon at ${masterPath}`);
  }

  for (const { file, size } of outputs) {
    await renderIcon(size).then((buf) => sharp(buf).toFile(path.join(root, file)));
    console.log(`wrote ${file} (${size}x${size})`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
