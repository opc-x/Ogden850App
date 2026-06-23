/**
 * Regenerate PWA icons from the original pwa-icon.svg design.
 * Fix: render full-bleed opaque square (old PNG had transparent corners → iOS white border).
 */
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const root = process.cwd();
const fontB64 = fs.readFileSync(path.join(root, 'public/fonts/Pacifico-Regular.ttf')).toString('base64');

const outputs: Array<{ file: string; size: number }> = [
  { file: 'public/ogden-192.png', size: 192 },
  { file: 'public/ogden-512.png', size: 512 },
  { file: 'public/apple-touch-icon.png', size: 180 },
];

/** Matches public/pwa-icon.svg — full opaque canvas, inner gradient stroke kept. */
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
      <stop offset="0%" stop-color="#ffffff" />
      <stop offset="40%" stop-color="#e6f4ea" />
      <stop offset="100%" stop-color="#bfe3cc" />
    </linearGradient>
    <linearGradient id="border" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#a7d9b8" />
      <stop offset="50%" stop-color="#5cb377" />
      <stop offset="100%" stop-color="#2f7d4f" />
    </linearGradient>
    <linearGradient id="text" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#2f7d4f" />
      <stop offset="100%" stop-color="#15412a" />
    </linearGradient>
    <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="8" stdDeviation="10" flood-color="#c65a30" flood-opacity="0.2" />
    </filter>
  </defs>
  <rect width="512" height="512" fill="url(#bg)" />
  <rect x="24" y="24" width="464" height="464" rx="100" fill="none" stroke="url(#border)" stroke-width="5" />
  <text
    x="256"
    y="250"
    font-family="Pacifico, cursive"
    font-size="180"
    fill="url(#text)"
    filter="url(#shadow)"
    text-anchor="middle"
    dominant-baseline="middle"
  >Ogden</text>
</svg>`;
}

async function renderIcon(size: number) {
  return sharp(Buffer.from(buildIconSvg()))
    .resize(size, size, { fit: 'cover' })
    .png({ compressionLevel: 9, palette: false })
    .toBuffer();
}

async function main() {
  for (const { file, size } of outputs) {
    await renderIcon(size).then((buf) => sharp(buf).toFile(path.join(root, file)));
    console.log(`wrote ${file} (${size}x${size})`);
  }

  const { data } = await renderIcon(512).then((buf) =>
    sharp(buf).raw().toBuffer({ resolveWithObject: true }),
  );
  let transp = 0;
  for (let i = 3; i < data.length; i += 4) if (data[i] < 255) transp++;
  console.log(`alpha pixels on 512: ${transp} (expect 0)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
