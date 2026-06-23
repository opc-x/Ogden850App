/**
 * Flatten the original Ogden icon master onto an opaque gradient plate.
 * Master art: white Pacifico "Ogden" + "850" on green (scripts/assets/ogden-icon-master.png).
 * Old exports had transparent rounded corners → iOS painted a white rim; we only fix that.
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

function gradientPlate(size: number): Buffer {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#4db88a" />
        <stop offset="55%" stop-color="#3a9b72" />
        <stop offset="100%" stop-color="#266b50" />
      </linearGradient>
    </defs>
    <rect width="${size}" height="${size}" fill="url(#g)" />
  </svg>`;
  return Buffer.from(svg);
}

async function renderIcon(size: number) {
  const bg = await sharp(gradientPlate(size)).png().toBuffer();
  const art = await sharp(masterPath).resize(size, size, { fit: 'fill' }).png().toBuffer();
  return sharp(bg)
    .composite([{ input: art, blend: 'over' }])
    .png({ compressionLevel: 9, palette: false })
    .toBuffer();
}

async function main() {
  if (!fs.existsSync(masterPath)) {
    throw new Error(`Missing master icon at ${masterPath}`);
  }

  for (const { file, size } of outputs) {
    const buf = await renderIcon(size);
    await sharp(buf).toFile(path.join(root, file));
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
