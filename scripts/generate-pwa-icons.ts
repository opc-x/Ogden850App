/**
 * Regenerate PWA / apple-touch icons with Pacifico "Ogden" on full-bleed gradient.
 * iOS applies its own rounded mask — no baked border or transparency at edges.
 */
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const root = process.cwd();
const fontPath = path.join(root, 'public/fonts/Pacifico-Regular.ttf');
const fontB64 = fs.readFileSync(fontPath).toString('base64');

const outputs: Array<{ file: string; size: number }> = [
  { file: 'public/ogden-192.png', size: 192 },
  { file: 'public/ogden-512.png', size: 512 },
  { file: 'public/apple-touch-icon.png', size: 180 },
];

function buildIconSvg(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <defs>
    <style>
      @font-face {
        font-family: 'Pacifico';
        src: url('data:font/ttf;base64,${fontB64}') format('truetype');
        font-weight: normal;
        font-style: normal;
      }
    </style>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#e8f5ec" />
      <stop offset="38%" stop-color="#b8e0c8" />
      <stop offset="100%" stop-color="#2f7d4f" />
    </linearGradient>
    <linearGradient id="word" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffffff" />
      <stop offset="55%" stop-color="#f4fff7" />
      <stop offset="100%" stop-color="#dff5e6" />
    </linearGradient>
    <filter id="txtShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="4" stdDeviation="5" flood-color="#15412a" flood-opacity="0.22" />
    </filter>
  </defs>
  <rect width="512" height="512" fill="url(#bg)" />
  <text
    x="256"
    y="268"
    font-family="Pacifico, cursive"
    font-size="188"
    fill="url(#word)"
    filter="url(#txtShadow)"
    text-anchor="middle"
    dominant-baseline="middle"
  >Ogden</text>
</svg>`;
}

async function renderIcon(size: number) {
  const svg = Buffer.from(buildIconSvg());
  return sharp(svg)
    .resize(size, size, { fit: 'cover' })
    .png({ compressionLevel: 9, palette: false })
    .toBuffer();
}

async function main() {
  for (const { file, size } of outputs) {
    const out = path.join(root, file);
    await renderIcon(size).then((buf) => sharp(buf).toFile(out));
    console.log(`wrote ${file} (${size}x${size})`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
