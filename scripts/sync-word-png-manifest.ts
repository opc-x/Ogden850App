/**
 * 扫描 public/assets/word-img/*.png 并写入 manifest，供审计与批量脚本使用。
 * Usage: npx tsx scripts/sync-word-png-manifest.ts
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const IMG_DIR = path.join(__dirname, '../public/assets/word-img');
const OUT = path.join(__dirname, '../public/word-png-list.json');

const pngs = fs
  .readdirSync(IMG_DIR)
  .filter((f) => f.endsWith('.png'))
  .map((f) => f.replace(/\.png$/, ''))
  .sort();

fs.writeFileSync(OUT, JSON.stringify(pngs, null, 2) + '\n');
console.log(`word-png-list.json: ${pngs.length} PNG illustrations`);
