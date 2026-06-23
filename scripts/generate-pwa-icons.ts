/**
 * Regenerate PWA / apple-touch icons from public/ogden-icon-app.svg
 * Full-bleed gradient, opaque edges — iOS applies its own rounded mask.
 */
import path from 'node:path';
import sharp from 'sharp';

const root = process.cwd();
const source = path.join(root, 'public/ogden-icon-app.svg');

const outputs: Array<{ file: string; size: number }> = [
  { file: 'public/ogden-192.png', size: 192 },
  { file: 'public/ogden-512.png', size: 512 },
  { file: 'public/apple-touch-icon.png', size: 180 },
];

async function renderIcon(size: number) {
  return sharp(source)
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
