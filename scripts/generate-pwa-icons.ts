/**
 * PWA icons from master: resize, then fill transparent corners
 * by diffusing squircle-edge colors outward (smooth, no radial or Voronoi stripes).
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

/** Pixels below this are treated as empty and filled by edge diffusion. */
const FILL_ALPHA = 200;

function isOpaque(data: Buffer, idx: number): boolean {
  return data[idx + 3] >= FILL_ALPHA;
}

function needsFill(data: Buffer, idx: number): boolean {
  return data[idx + 3] < FILL_ALPHA;
}

/**
 * Fill transparent pixels by repeatedly averaging colors from already-set neighbors.
 * Opaque squircle pixels stay fixed; exterior corners inherit a smooth green gradient.
 */
function diffuseEdgeFill(data: Buffer, width: number, height: number): Buffer {
  const pixelCount = width * height;
  const out = Buffer.from(data);
  const known = new Uint8Array(pixelCount);
  const r = new Float32Array(pixelCount);
  const g = new Float32Array(pixelCount);
  const b = new Float32Array(pixelCount);

  for (let p = 0; p < pixelCount; p++) {
    const idx = p * 4;
    if (!needsFill(data, idx)) {
      known[p] = 1;
      r[p] = data[idx];
      g[p] = data[idx + 1];
      b[p] = data[idx + 2];
      out[idx + 3] = 255;
    }
  }

  const queue: number[] = [];
  for (let p = 0; p < pixelCount; p++) {
    if (known[p]) continue;
    if (hasKnownNeighbor(p, width, height, known)) queue.push(p);
  }

  let head = 0;
  while (head < queue.length) {
    const p = queue[head++];
    if (known[p]) continue;

    const x = p % width;
    const y = (p - x) / width;
    let sr = 0;
    let sg = 0;
    let sb = 0;
    let count = 0;

    for (const [nx, ny] of neighborCoords(x, y, width, height)) {
      const np = ny * width + nx;
      if (!known[np]) continue;
      sr += r[np];
      sg += g[np];
      sb += b[np];
      count++;
    }

    if (count === 0) continue;

    r[p] = sr / count;
    g[p] = sg / count;
    b[p] = sb / count;
    known[p] = 1;

    const idx = p * 4;
    out[idx] = Math.round(r[p]);
    out[idx + 1] = Math.round(g[p]);
    out[idx + 2] = Math.round(b[p]);
    out[idx + 3] = 255;

    for (const [nx, ny] of neighborCoords(x, y, width, height)) {
      const np = ny * width + nx;
      if (!known[np] && hasKnownNeighbor(np, width, height, known)) queue.push(np);
    }
  }

  for (let p = 0; p < pixelCount; p++) {
    const idx = p * 4;
    if (!known[p]) {
      out[idx] = data[idx];
      out[idx + 1] = data[idx + 1];
      out[idx + 2] = data[idx + 2];
    }
    out[idx + 3] = 255;
  }

  return out;
}

function neighborCoords(
  x: number,
  y: number,
  width: number,
  height: number,
): Array<[number, number]> {
  const coords: Array<[number, number]> = [];
  if (x > 0) coords.push([x - 1, y]);
  if (x + 1 < width) coords.push([x + 1, y]);
  if (y > 0) coords.push([x, y - 1]);
  if (y + 1 < height) coords.push([x, y + 1]);
  return coords;
}

function hasKnownNeighbor(
  p: number,
  width: number,
  height: number,
  known: Uint8Array,
): boolean {
  const x = p % width;
  const y = (p - x) / width;
  for (const [nx, ny] of neighborCoords(x, y, width, height)) {
    if (known[ny * width + nx]) return true;
  }
  return false;
}

async function renderIcon(size: number): Promise<Buffer> {
  const { data, info } = await sharp(masterPath)
    .resize(size, size, { fit: 'fill' })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const filled = diffuseEdgeFill(data, info.width, info.height);

  return sharp(filled, { raw: { width: info.width, height: info.height, channels: 4 } })
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
