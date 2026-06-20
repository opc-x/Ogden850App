/** 清掉 v1 烂图批准，只保留非 picturable legacy + 显式 v2 批准的 picturable */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { PICTURABLE_WORDS } from '../src/components/concept/PicturableWordVisual';
import { writeWordSvgManifest } from './lib/wordSvgManifest';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.join(__dirname, '../public/assets/word-img');
const pic = new Set<string>(PICTURABLE_WORDS as readonly string[]);
const V2_PICTURABLE_OK = new Set(['bulb']);

const ids = fs.readdirSync(OUT_DIR).filter((f) => f.endsWith('.svg')).map((f) => f.replace(/\.svg$/, ''));
const approved = ids.filter((id) => !pic.has(id) || V2_PICTURABLE_OK.has(id)).sort();

writeWordSvgManifest(OUT_DIR, approved);
console.log(`Approved ${approved.length} / ${ids.length} (picturable v2: ${approved.filter((id) => pic.has(id)).join(', ')})`);
