import type { ReactNode } from 'react';
import { conceptVisualTokens } from './conceptVisualTokens';

export type ConceptTokens = ReturnType<typeof conceptVisualTokens>;

export function conceptWrap(t: ConceptTokens, children: ReactNode) {
  return (
    <svg {...t.baseSvgProps}>
      <style>{t.inlineStyles}</style>
      {children}
    </svg>
  );
}

export function conceptLabel(t: ConceptTokens, text: string, y = 14) {
  return (
    <text x="50" y={y} fontSize="6.5px" fontFamily="var(--mono)" fill={t.strokeWarm} fontWeight="bold" textAnchor="middle">
      {text.toUpperCase()}
    </text>
  );
}

export function conceptFallback(t: ConceptTokens, word: string) {
  return conceptWrap(t, <>
    <rect x="22" y="32" width="56" height="40" rx="8" fill={t.fillSoft} fillOpacity="0.1" stroke={t.faintColor} strokeWidth="1.5" />
    {conceptLabel(t, word, 52)}
    <circle cx="50" cy="48" r="12" stroke={t.strokeColor} strokeWidth="2" fill="none" className="cv-pulse" />
  </>);
}
