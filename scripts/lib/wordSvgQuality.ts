/** 单词 SVG 质量门禁 — 只读校验，不修改内容 */

export interface WordSvgValidation {
  ok: boolean;
  issues: string[];
}

const FORBIDDEN = /<script|javascript:|on\w+\s*=|<foreignObject|xlink:href\s*=\s*["']http/i;
const REQUIRED_ATTRS = /viewBox\s*=\s*["']0\s+0\s+100\s+100["']/i;
const HAS_SHAPE = /<(path|circle|ellipse|rect|line|polyline|polygon)\b/i;

const GENERIC_OK = new Set(['ball', 'circle', 'ring', 'line', 'dot', 'round', 'spot']);

function looksGenericIcon(svg: string, word: string): string | null {
  if (GENERIC_OK.has(word.toLowerCase())) return null;
  const body = svg.replace(/<style[\s\S]*?<\/style>/gi, '');
  const paths = (body.match(/<path\b/gi) ?? []).length;
  const circles = (body.match(/<circle\b/gi) ?? []).length;
  const rects = (body.match(/<rect\b/gi) ?? []).length;
  const lines = (body.match(/<line\b/gi) ?? []).length;
  const total = paths + circles + rects + lines;
  if (total <= 1 && circles === 1) {
    return '仅单一圆圈，疑似通用占位图';
  }
  if (total <= 2 && lines === 1 && paths === 0) {
    return '仅斜线，疑似通用占位图';
  }
  if (total <= 1 && rects === 1) {
    return '仅单一矩形，疑似通用占位图';
  }
  return null;
}

export function validateWordSvgAnimation(svg: string): string | null {
  const hasKeyframes = /@keyframes\s+[\w-]+/i.test(svg);
  const hasAnimation = /animation\s*:\s*[\w-]+/i.test(svg);
  if (!hasKeyframes) return '缺少 @keyframes 动效定义';
  if (!hasAnimation) return '有 @keyframes 但未应用到任何元素（animation:）';
  return null;
}

export function validateWordSvg(svg: string, word: string): WordSvgValidation {
  const issues: string[] = [];
  const trimmed = svg.trim();

  if (!trimmed.startsWith('<svg')) {
    issues.push('必须以 <svg> 根元素开头');
  }
  if (!trimmed.includes('</svg>')) {
    issues.push('缺少闭合 </svg>');
  }
  if (!REQUIRED_ATTRS.test(trimmed)) {
    issues.push('必须 viewBox="0 0 100 100"');
  }
  if (!/class\s*=\s*["'][^"']*vector-svg/.test(trimmed)) {
    issues.push('根 svg 必须 class 含 vector-svg');
  }
  if (FORBIDDEN.test(trimmed)) {
    issues.push('含禁止内容（script/外链/事件处理器）');
  }
  if (!HAS_SHAPE.test(trimmed)) {
    issues.push('缺少可见图形元素');
  }
  if (trimmed.length > 6000) {
    issues.push('SVG 过长（>6KB）');
  }
  if (/<text\b/i.test(trimmed)) {
    issues.push('不应包含 <text> 文字标签');
  }

  const lower = trimmed.toLowerCase();
  if (word.length > 2 && lower.includes(`>${word.toLowerCase()}<`)) {
    issues.push('不应把英文单词当文字画进图里');
  }

  const animIssue = validateWordSvgAnimation(trimmed);
  if (animIssue) issues.push(animIssue);

  const genericIssue = looksGenericIcon(trimmed, word);
  if (genericIssue) issues.push(genericIssue);

  return { ok: issues.length === 0, issues };
}

export function extractSvgFromLlmPayload(raw: string): string | null {
  const t = raw.trim();
  if (t.startsWith('<svg')) return t;
  try {
    const parsed = JSON.parse(t) as { svg?: string };
    if (parsed.svg?.trim().startsWith('<svg')) return parsed.svg.trim();
  } catch {
    const m = t.match(/<svg[\s\S]*<\/svg>/i);
    if (m) return m[0];
  }
  return null;
}
