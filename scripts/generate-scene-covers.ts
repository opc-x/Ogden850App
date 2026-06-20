/**
 * 按故事脚本生成 50 张场景插画 SVG（矢量插画风格）
 * Usage: npx tsx scripts/generate-scene-covers.ts
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  SCENE_STORY_SCRIPTS,
  slugifySceneKey,
} from '../src/data/sceneStoryScripts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.join(__dirname, '../public/assets/scenes');

function motifSvg(motif: string, cx: number, cy: number, accent: string, scale = 1): string {
  const s = scale;
  const shapes: Record<string, string> = {
    cart: `<rect x="${cx - 28 * s}" y="${cy - 8 * s}" width="${36 * s}" height="${24 * s}" rx="4" fill="#fff" opacity="0.9"/><circle cx="${cx - 18 * s}" cy="${cy + 20 * s}" r="${6 * s}" fill="#334155"/><circle cx="${cx + 8 * s}" cy="${cy + 20 * s}" r="${6 * s}" fill="#334155"/><path d="M${cx - 28 * s} ${cy - 8 * s} L${cx - 20 * s} ${cy - 24 * s} L${cx + 12 * s} ${cy - 24 * s} L${cx + 16 * s} ${cy - 8 * s}Z" fill="${accent}" opacity="0.7"/>`,
    shelf: `<rect x="${cx - 40 * s}" y="${cy - 30 * s}" width="${80 * s}" height="${60 * s}" rx="6" fill="#fff" opacity="0.25"/><rect x="${cx - 32 * s}" y="${cy - 20 * s}" width="${20 * s}" height="${14 * s}" rx="2" fill="${accent}" opacity="0.5"/><rect x="${cx - 6 * s}" y="${cy - 20 * s}" width="${20 * s}" height="${14 * s}" rx="2" fill="#86efac" opacity="0.7"/><rect x="${cx + 14 * s}" y="${cy - 20 * s}" width="${14 * s}" height="${14 * s}" rx="2" fill="#fde047" opacity="0.8"/>`,
    bag: `<path d="M${cx - 16 * s} ${cy - 20 * s} Q${cx} ${cy - 32 * s} ${cx + 16 * s} ${cy - 20 * s} L${cx + 20 * s} ${cy + 16 * s} Q${cx} ${cy + 24 * s} ${cx - 20 * s} ${cy + 16 * s}Z" fill="#fff" opacity="0.85"/><path d="M${cx - 8 * s} ${cy - 20 * s} Q${cx} ${cy - 28 * s} ${cx + 8 * s} ${cy - 20 * s}" fill="none" stroke="${accent}" stroke-width="2"/>`,
    table: `<ellipse cx="${cx}" cy="${cy + 20 * s}" rx="${50 * s}" ry="${12 * s}" fill="#000" opacity="0.08"/><rect x="${cx - 40 * s}" y="${cy - 8 * s}" width="${80 * s}" height="${8 * s}" rx="4" fill="#fff" opacity="0.7"/><rect x="${cx - 6 * s}" y="${cy}" width="${4 * s}" height="${24 * s}" fill="#fff" opacity="0.5"/><rect x="${cx + 2 * s}" y="${cy}" width="${4 * s}" height="${24 * s}" fill="#fff" opacity="0.5"/>`,
    plate: `<circle cx="${cx}" cy="${cy}" r="${18 * s}" fill="#fff" opacity="0.9"/><circle cx="${cx}" cy="${cy}" r="${12 * s}" fill="${accent}" opacity="0.35"/>`,
    menu: `<rect x="${cx - 14 * s}" y="${cy - 20 * s}" width="${28 * s}" height="${36 * s}" rx="3" fill="#fff" opacity="0.9"/><line x1="${cx - 8 * s}" y1="${cy - 12 * s}" x2="${cx + 8 * s}" y2="${cy - 12 * s}" stroke="${accent}" stroke-width="2" opacity="0.6"/><line x1="${cx - 8 * s}" y1="${cy - 4 * s}" x2="${cx + 6 * s}" y2="${cy - 4 * s}" stroke="${accent}" stroke-width="2" opacity="0.4"/><line x1="${cx - 8 * s}" y1="${cy + 4 * s}" x2="${cx + 8 * s}" y2="${cy + 4 * s}" stroke="${accent}" stroke-width="2" opacity="0.4"/>`,
    phone: `<rect x="${cx - 14 * s}" y="${cy - 24 * s}" width="${28 * s}" height="${48 * s}" rx="6" fill="#fff" opacity="0.9"/><rect x="${cx - 10 * s}" y="${cy - 18 * s}" width="${20 * s}" height="${32 * s}" rx="2" fill="${accent}" opacity="0.25"/><circle cx="${cx}" cy="${cy + 18 * s}" r="${3 * s}" fill="#334155" opacity="0.5"/>`,
    clock: `<circle cx="${cx}" cy="${cy}" r="${22 * s}" fill="#fff" opacity="0.9"/><circle cx="${cx}" cy="${cy}" r="${18 * s}" fill="none" stroke="${accent}" stroke-width="2" opacity="0.6"/><line x1="${cx}" y1="${cy}" x2="${cx}" y2="${cy - 12 * s}" stroke="#334155" stroke-width="2"/><line x1="${cx}" y1="${cy}" x2="${cx + 8 * s}" y2="${cy + 4 * s}" stroke="#334155" stroke-width="2"/>`,
    bus: `<rect x="${cx - 36 * s}" y="${cy - 16 * s}" width="${72 * s}" height="${32 * s}" rx="8" fill="#fff" opacity="0.9"/><rect x="${cx - 28 * s}" y="${cy - 10 * s}" width="${20 * s}" height="${14 * s}" rx="2" fill="${accent}" opacity="0.4"/><rect x="${cx - 4 * s}" y="${cy - 10 * s}" width="${20 * s}" height="${14 * s}" rx="2" fill="${accent}" opacity="0.4"/><circle cx="${cx - 22 * s}" cy="${cy + 18 * s}" r="${7 * s}" fill="#334155"/><circle cx="${cx + 22 * s}" cy="${cy + 18 * s}" r="${7 * s}" fill="#334155"/>`,
    train: `<rect x="${cx - 44 * s}" y="${cy - 14 * s}" width="${88 * s}" height="${28 * s}" rx="6" fill="#fff" opacity="0.9"/><rect x="${cx - 36 * s}" y="${cy - 8 * s}" width="${16 * s}" height="${12 * s}" rx="2" fill="${accent}" opacity="0.45"/><rect x="${cx - 14 * s}" y="${cy - 8 * s}" width="${16 * s}" height="${12 * s}" rx="2" fill="${accent}" opacity="0.45"/><rect x="${cx + 8 * s}" y="${cy - 8 * s}" width="${16 * s}" height="${12 * s}" rx="2" fill="${accent}" opacity="0.45"/><circle cx="${cx - 30 * s}" cy="${cy + 16 * s}" r="${6 * s}" fill="#334155"/><circle cx="${cx + 30 * s}" cy="${cy + 16 * s}" r="${6 * s}" fill="#334155"/>`,
    desk: `<rect x="${cx - 36 * s}" y="${cy - 4 * s}" width="${72 * s}" height="${8 * s}" rx="3" fill="#fff" opacity="0.75"/><rect x="${cx - 30 * s}" y="${cy - 20 * s}" width="${24 * s}" height="${16 * s}" rx="2" fill="${accent}" opacity="0.35"/><rect x="${cx + 6 * s}" y="${cy - 16 * s}" width="${18 * s}" height="${12 * s}" rx="2" fill="#fff" opacity="0.6"/>`,
    house: `<path d="M${cx} ${cy - 28 * s} L${cx + 32 * s} ${cy + 4 * s} L${cx + 28 * s} ${cy + 4 * s} L${cx + 28 * s} ${cy + 24 * s} L${cx - 28 * s} ${cy + 24 * s} L${cx - 28 * s} ${cy + 4 * s} L${cx - 32 * s} ${cy + 4 * s}Z" fill="#fff" opacity="0.85"/><rect x="${cx - 8 * s}" y="${cy + 8 * s}" width="${16 * s}" height="${16 * s}" rx="2" fill="${accent}" opacity="0.5"/>`,
    heart: `<path d="M${cx} ${cy + 10 * s} C${cx - 24 * s} ${cy - 8 * s} ${cx - 24 * s} ${cy - 28 * s} ${cx} ${cy - 14 * s} C${cx + 24 * s} ${cy - 28 * s} ${cx + 24 * s} ${cy - 8 * s} ${cx} ${cy + 10 * s}Z" fill="#fff" opacity="0.85"/>`,
    sun: `<circle cx="${cx}" cy="${cy}" r="${20 * s}" fill="#fde047" opacity="0.9"/><line x1="${cx}" y1="${cy - 30 * s}" x2="${cx}" y2="${cy - 24 * s}" stroke="#fde047" stroke-width="3"/><line x1="${cx + 22 * s}" y1="${cy - 22 * s}" x2="${cx + 17 * s}" y2="${cy - 17 * s}" stroke="#fde047" stroke-width="3"/><line x1="${cx - 22 * s}" y1="${cy - 22 * s}" x2="${cx - 17 * s}" y2="${cy - 17 * s}" stroke="#fde047" stroke-width="3"/>`,
    cloud: `<ellipse cx="${cx - 12 * s}" cy="${cy}" rx="${16 * s}" ry="${12 * s}" fill="#fff" opacity="0.85"/><ellipse cx="${cx + 8 * s}" cy="${cy - 4 * s}" rx="${18 * s}" ry="${14 * s}" fill="#fff" opacity="0.85"/><ellipse cx="${cx + 20 * s}" cy="${cy + 2 * s}" rx="${12 * s}" ry="${10 * s}" fill="#fff" opacity="0.85"/>`,
    box: `<rect x="${cx - 20 * s}" y="${cy - 16 * s}" width="${40 * s}" height="${32 * s}" rx="4" fill="#fff" opacity="0.85"/><line x1="${cx - 20 * s}" y1="${cy - 4 * s}" x2="${cx + 20 * s}" y2="${cy - 4 * s}" stroke="${accent}" stroke-width="2" opacity="0.5"/><line x1="${cx}" y1="${cy - 16 * s}" x2="${cx}" y2="${cy + 16 * s}" stroke="${accent}" stroke-width="2" opacity="0.5"/>`,
    car: `<rect x="${cx - 32 * s}" y="${cy - 10 * s}" width="${64 * s}" height="${24 * s}" rx="8" fill="#fff" opacity="0.9"/><rect x="${cx - 20 * s}" y="${cy - 18 * s}" width="${28 * s}" height="${12 * s}" rx="4" fill="${accent}" opacity="0.35"/><circle cx="${cx - 18 * s}" cy="${cy + 16 * s}" r="${7 * s}" fill="#334155"/><circle cx="${cx + 18 * s}" cy="${cy + 16 * s}" r="${7 * s}" fill="#334155"/>`,
    tree: `<rect x="${cx - 4 * s}" y="${cy}" width="${8 * s}" height="${24 * s}" fill="#92400e" opacity="0.6"/><circle cx="${cx}" cy="${cy - 8 * s}" r="${22 * s}" fill="#86efac" opacity="0.8"/><circle cx="${cx - 14 * s}" cy="${cy + 2 * s}" r="${16 * s}" fill="#4ade80" opacity="0.6"/><circle cx="${cx + 14 * s}" cy="${cy + 2 * s}" r="${16 * s}" fill="#4ade80" opacity="0.6"/>`,
    screen: `<rect x="${cx - 30 * s}" y="${cy - 22 * s}" width="${60 * s}" height="${40 * s}" rx="4" fill="#fff" opacity="0.9"/><rect x="${cx - 24 * s}" y="${cy - 16 * s}" width="${48 * s}" height="${28 * s}" rx="2" fill="${accent}" opacity="0.3"/><rect x="${cx - 6 * s}" y="${cy + 20 * s}" width="${12 * s}" height="${4 * s}" fill="#fff" opacity="0.6"/>`,
    ball: `<circle cx="${cx}" cy="${cy}" r="${18 * s}" fill="#fff" opacity="0.9"/><path d="M${cx} ${cy - 18 * s} Q${cx + 12 * s} ${cy} ${cx} ${cy + 18 * s} Q${cx - 12 * s} ${cy} ${cx} ${cy - 18 * s}" fill="none" stroke="${accent}" stroke-width="2" opacity="0.5"/><path d="M${cx - 18 * s} ${cy} Q${cx} ${cy - 8 * s} ${cx + 18 * s} ${cy}" fill="none" stroke="${accent}" stroke-width="2" opacity="0.5"/>`,
    lock: `<rect x="${cx - 14 * s}" y="${cy - 4 * s}" width="${28 * s}" height="${22 * s}" rx="4" fill="#fff" opacity="0.9"/><path d="M${cx - 10 * s} ${cy - 4 * s} V${cy - 16 * s} A10 ${10 * s} 0 0 1 ${cx + 10 * s} ${cy - 16 * s} V${cy - 4 * s}" fill="none" stroke="${accent}" stroke-width="3" opacity="0.7"/><circle cx="${cx}" cy="${cy + 6 * s}" r="${4 * s}" fill="${accent}" opacity="0.6"/>`,
    globe: `<circle cx="${cx}" cy="${cy}" r="${22 * s}" fill="#fff" opacity="0.85"/><ellipse cx="${cx}" cy="${cy}" rx="${22 * s}" ry="${10 * s}" fill="none" stroke="${accent}" stroke-width="2" opacity="0.5"/><ellipse cx="${cx}" cy="${cy}" rx="${10 * s}" ry="${22 * s}" fill="none" stroke="${accent}" stroke-width="2" opacity="0.5"/>`,
    smile: `<circle cx="${cx}" cy="${cy}" r="${22 * s}" fill="#fde047" opacity="0.9"/><circle cx="${cx - 8 * s}" cy="${cy - 4 * s}" r="${3 * s}" fill="#334155"/><circle cx="${cx + 8 * s}" cy="${cy - 4 * s}" r="${3 * s}" fill="#334155"/><path d="M${cx - 10 * s} ${cy + 8 * s} Q${cx} ${cy + 16 * s} ${cx + 10 * s} ${cy + 8 * s}" fill="none" stroke="#334155" stroke-width="2"/>`,
    dog: `<ellipse cx="${cx}" cy="${cy + 8 * s}" rx="${24 * s}" ry="${14 * s}" fill="#fff" opacity="0.85"/><circle cx="${cx + 16 * s}" cy="${cy - 8 * s}" r="${12 * s}" fill="#fff" opacity="0.85"/><circle cx="${cx + 20 * s}" cy="${cy - 10 * s}" r="${2 * s}" fill="#334155"/><path d="M${cx - 8 * s} ${cy - 16 * s} L${cx - 16 * s} ${cy - 28 * s} L${cx - 4 * s} ${cy - 18 * s}Z" fill="${accent}" opacity="0.5"/><path d="M${cx + 8 * s} ${cy - 16 * s} L${cx + 16 * s} ${cy - 28 * s} L${cx + 4 * s} ${cy - 18 * s}Z" fill="${accent}" opacity="0.5"/>`,
    music: `<circle cx="${cx - 10 * s}" cy="${cy + 8 * s}" r="${10 * s}" fill="#fff" opacity="0.85"/><circle cx="${cx + 12 * s}" cy="${cy + 4 * s}" r="${10 * s}" fill="#fff" opacity="0.85"/><rect x="${cx - 2 * s}" y="${cy - 24 * s}" width="${3 * s}" height="${32 * s}" fill="${accent}" opacity="0.7"/><rect x="${cx + 20 * s}" y="${cy - 28 * s}" width="${3 * s}" height="${32 * s}" fill="${accent}" opacity="0.7"/>`,
  };
  return shapes[motif] ?? `<circle cx="${cx}" cy="${cy}" r="${14 * s}" fill="#fff" opacity="0.5"/><circle cx="${cx}" cy="${cy}" r="${8 * s}" fill="${accent}" opacity="0.4"/>`;
}

function sceneArt(motifs: string[], accent: string): string {
  const positions = [
    { x: 200, y: 130, scale: 1.2 },
    { x: 120, y: 150, scale: 0.85 },
    { x: 290, y: 145, scale: 0.8 },
  ];
  return motifs
    .slice(0, 3)
    .map((m, i) => motifSvg(m, positions[i].x, positions[i].y, accent, positions[i].scale))
    .join('\n  ');
}

function svgForScene(s: (typeof SCENE_STORY_SCRIPTS)[0]): string {
  const accent = s.illustration.accent;
  const label = s.illustration.label;
  const slug = slugifySceneKey(s.sceneKey);
  const art = sceneArt(s.illustration.motifs, accent);

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 240" role="img" aria-label="${label}">
  <defs>
    <linearGradient id="bg-${slug}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#fffbf5"/>
      <stop offset="55%" stop-color="${accent}" stop-opacity="0.35"/>
      <stop offset="100%" stop-color="${accent}"/>
    </linearGradient>
    <radialGradient id="glow-${slug}" cx="50%" cy="40%" r="60%">
      <stop offset="0%" stop-color="#fff" stop-opacity="0.5"/>
      <stop offset="100%" stop-color="#fff" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="400" height="240" fill="url(#bg-${slug})"/>
  <rect width="400" height="240" fill="url(#glow-${slug})"/>
  <circle cx="340" cy="40" r="48" fill="${accent}" opacity="0.12"/>
  <circle cx="60" cy="200" r="56" fill="${accent}" opacity="0.08"/>
  <circle cx="200" cy="120" r="70" fill="#fff" opacity="0.15"/>
  ${art}
  <text x="200" y="44" text-anchor="middle" font-size="40">${s.emoji}</text>
</svg>`;
}

fs.mkdirSync(OUT_DIR, { recursive: true });
for (const s of SCENE_STORY_SCRIPTS) {
  const slug = slugifySceneKey(s.sceneKey);
  fs.writeFileSync(path.join(OUT_DIR, `${slug}.svg`), svgForScene(s));
}
console.log(`Wrote ${SCENE_STORY_SCRIPTS.length} story covers → ${OUT_DIR}`);
