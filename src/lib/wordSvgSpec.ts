/** LLM 输出的受限图元 JSON → 统一风格 SVG（前后端共用） */

export type SpecColor = 'main' | 'accent' | 'warm' | 'soft' | 'faint' | 'none';
export type SpecAnim = 'cv-pulse' | 'cv-bob' | 'cv-flow';

export type SpecElement =
  | { type: 'circle'; cx: number; cy: number; r: number; fill?: SpecColor; stroke?: SpecColor; sw?: number; anim?: SpecAnim }
  | { type: 'ellipse'; cx: number; cy: number; rx: number; ry: number; fill?: SpecColor; stroke?: SpecColor; sw?: number; anim?: SpecAnim }
  | { type: 'rect'; x: number; y: number; width: number; height: number; rx?: number; fill?: SpecColor; stroke?: SpecColor; sw?: number; anim?: SpecAnim }
  | { type: 'line'; x1: number; y1: number; x2: number; y2: number; stroke?: SpecColor; sw?: number; anim?: SpecAnim }
  | { type: 'path'; d: string; fill?: SpecColor; stroke?: SpecColor; sw?: number; anim?: SpecAnim };

export interface WordSvgSpec {
  elements: SpecElement[];
}

const COLORS: Record<SpecColor, string> = {
  main: '#1e293b',
  accent: '#0891b2',
  warm: '#d97706',
  soft: '#ecfeff',
  faint: '#e2e8f0',
  none: 'none',
};

const STYLE = `
@keyframes cv-pulse { 0%,100% { opacity:0.5; transform:scale(1); } 50% { opacity:1; transform:scale(1.06); } }
@keyframes cv-bob { 0%,100% { transform:translateY(0); } 50% { transform:translateY(-3px); } }
@keyframes cv-flow { to { stroke-dashoffset:-18; } }
.cv-pulse { transform-origin:50px 50px; animation:cv-pulse 2.5s infinite ease-in-out; }
.cv-bob { animation:cv-bob 2.2s infinite ease-in-out; }
.cv-flow { stroke-dasharray:5 3; animation:cv-flow 1.2s infinite linear; }
`.trim();

export const SPEC_EXAMPLE_BULB: WordSvgSpec = {
  elements: [
    { type: 'path', d: 'M50 72 C32 58 32 38 50 28 C68 38 68 58 50 72 Z', fill: 'soft', stroke: 'main', sw: 2.5, anim: 'cv-pulse' },
    { type: 'rect', x: 42, y: 72, width: 16, height: 8, rx: 2, fill: 'accent', stroke: 'main', sw: 2 },
    { type: 'line', x1: 44, y1: 82, x2: 56, y2: 82, stroke: 'main', sw: 2 },
    { type: 'line', x1: 50, y1: 24, x2: 50, y2: 18, stroke: 'warm', sw: 2 },
    { type: 'circle', cx: 50, cy: 16, r: 3, fill: 'warm', stroke: 'none' },
  ],
};

export const MAX_SPEC_ELEMENTS = 5;

function fillAttr(c?: SpecColor) {
  if (!c || c === 'none') return 'fill="none"';
  return `fill="${COLORS[c]}"`;
}

function strokeAttr(c?: SpecColor, sw = 2.5) {
  if (!c || c === 'none') return '';
  return `stroke="${COLORS[c]}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round"`;
}

function animClass(anim?: SpecAnim) {
  return anim ? ` class="${anim}"` : '';
}

function renderElement(el: SpecElement): string {
  const sw = 'sw' in el && el.sw != null ? el.sw : 2.5;
  switch (el.type) {
    case 'circle':
      return `<circle cx="${el.cx}" cy="${el.cy}" r="${el.r}" ${fillAttr(el.fill)} ${strokeAttr(el.stroke, sw)}${animClass(el.anim)}/>`;
    case 'ellipse':
      return `<ellipse cx="${el.cx}" cy="${el.cy}" rx="${el.rx}" ry="${el.ry}" ${fillAttr(el.fill)} ${strokeAttr(el.stroke, sw)}${animClass(el.anim)}/>`;
    case 'rect':
      return `<rect x="${el.x}" y="${el.y}" width="${el.width}" height="${el.height}"${el.rx != null ? ` rx="${el.rx}"` : ''} ${fillAttr(el.fill)} ${strokeAttr(el.stroke, sw)}${animClass(el.anim)}/>`;
    case 'line':
      return `<line x1="${el.x1}" y1="${el.y1}" x2="${el.x2}" y2="${el.y2}" ${strokeAttr(el.stroke ?? 'main', sw)}${animClass(el.anim)}/>`;
    case 'path':
      return `<path d="${el.d}" ${fillAttr(el.fill)} ${strokeAttr(el.stroke, sw)}${animClass(el.anim)}/>`;
    default:
      return '';
  }
}

export function renderSpecToSvg(spec: WordSvgSpec): string {
  const body = spec.elements.map(renderElement).join('');
  return `<svg class="vector-svg" aria-hidden="true" viewBox="0 0 100 100" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg"><style>${STYLE}</style>${body}</svg>`;
}

export function validateWordSvgSpec(spec: WordSvgSpec, word: string): { ok: boolean; issues: string[] } {
  const issues: string[] = [];
  if (!Array.isArray(spec.elements) || spec.elements.length === 0) {
    issues.push('elements 为空');
  }
  if (spec.elements.length > MAX_SPEC_ELEMENTS) {
    issues.push(`元素超过 ${MAX_SPEC_ELEMENTS} 个（小卡片上会糊）`);
  }
  for (const el of spec.elements ?? []) {
    if (el.type === 'path' && el.d.length > 120) issues.push('path 过长');
    if (el.type === 'path' && /Q.*Q.*Q/i.test(el.d)) issues.push('path 过于复杂');
  }
  const json = JSON.stringify(spec).toLowerCase();
  if (/\beye\b|\"cx\":4[0-9].*\"cy\":4[0-9].*\"r\":[12]/.test(json) && !['eye', 'face', 'happy', 'angry'].includes(word)) {
    issues.push('非表情词不应画眼睛');
  }
  if (json.includes('stroke-dasharray')) issues.push('禁止虚线');
  return { ok: issues.length === 0, issues };
}

export function parseWordSvgSpec(raw: string): WordSvgSpec | null {
  try {
    const p = JSON.parse(raw) as { spec?: WordSvgSpec; elements?: SpecElement[] };
    if (p.spec?.elements) return p.spec;
    if (p.elements) return { elements: p.elements };
    return null;
  } catch {
    return null;
  }
}
