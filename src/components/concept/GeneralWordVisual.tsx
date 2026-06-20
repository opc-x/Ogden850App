/**
 * 400 个 General（普通名词）动态 SVG — 按语义 motif 分组，风格与 PicturableWordVisual 统一。
 */
import type { ReactNode } from 'react';
import { getGeneralMotif, type GeneralMotif } from '../../data/generalWordMotifs';
import { conceptVisualTokens } from './conceptVisualTokens';
import { conceptWrap, conceptLabel, conceptFallback, type ConceptTokens } from './conceptSvgShell';

export { GENERAL_WORDS, isGeneralWord } from '../../data/generalWordMotifs';

function renderMotif(t: ConceptTokens, motif: GeneralMotif, word: string): ReactNode {
  switch (motif) {
    case 'finance':
      return conceptWrap(t, <>
        {conceptLabel(t, word)}
        <rect x="28" y="30" width="44" height="52" rx="4" stroke={t.mainColor} strokeWidth="2.5" fill={t.fillSoft} fillOpacity="0.12" />
        <line x1="34" y1="42" x2="66" y2="42" stroke={t.strokeColor} strokeWidth="2" strokeLinecap="round" />
        <line x1="34" y1="52" x2="58" y2="52" stroke={t.faintColor} strokeWidth="1.5" strokeLinecap="round" />
        <line x1="34" y1="60" x2="62" y2="60" stroke={t.faintColor} strokeWidth="1.5" strokeLinecap="round" />
        <text x="58" y="74" fontSize="11px" fontFamily="var(--mono)" fill={t.strokeColor} fontWeight="bold" textAnchor="middle" className="cv-pulse">±</text>
        <path d="M66 68 L74 74 L66 80" stroke={t.strokeWarm} strokeWidth="2" fill="none" strokeLinecap="round" className="cv-flow" />
      </>);

    case 'time':
      return conceptWrap(t, <>
        <circle cx="50" cy="52" r="22" stroke={t.mainColor} strokeWidth="2.5" fill="none" />
        <path d="M50 52 V36 M50 52 H62" stroke={t.strokeColor} strokeWidth="2.5" strokeLinecap="round" />
        <rect x="62" y="24" width="18" height="14" rx="2" stroke={t.strokeWarm} strokeWidth="1.5" fill={t.fillSoft} fillOpacity="0.15" />
      </>);

    case 'family':
      return conceptWrap(t, <>
        <circle cx="38" cy="38" r="7" fill={t.mainColor} />
        <circle cx="62" cy="38" r="7" fill={t.mainColor} />
        <circle cx="50" cy="58" r="6" fill={t.strokeColor} />
        <path d="M38 46 V68 M62 46 V68 M50 64 V76" stroke={t.mainColor} strokeWidth="2.5" strokeLinecap="round" />
        <path d="M30 68 H70" stroke={t.faintColor} strokeWidth="2" strokeLinecap="round" />
      </>);

    case 'emotion':
      return conceptWrap(t, <>
        <path d="M50 72 C28 55 28 35 50 30 C72 35 72 55 50 72 Z" fill={t.fillSoft} fillOpacity="0.25" stroke={t.strokeColor} strokeWidth="2.5" className="cv-pulse" />
        <circle cx="42" cy="48" r="2.5" fill={t.mainColor} />
        <circle cx="58" cy="48" r="2.5" fill={t.mainColor} />
        <path d="M44 58 Q50 64 56 58" stroke={t.mainColor} strokeWidth="1.5" fill="none" />
      </>);

    case 'communication':
      return conceptWrap(t, <>
        <path d="M22 38 H62 V58 H38 L28 68 V58 H22 Z" stroke={t.mainColor} strokeWidth="2.5" fill={t.fillSoft} fillOpacity="0.12" />
        <path d="M30 46 H54 M30 52 H48" stroke={t.strokeColor} strokeWidth="1.5" strokeLinecap="round" className="cv-flow" />
        <circle cx="72" cy="48" r="10" stroke={t.strokeWarm} strokeWidth="2" fill="none" className="cv-pulse" />
      </>);

    case 'society':
      return conceptWrap(t, <>
        <rect x="32" y="35" width="36" height="40" stroke={t.mainColor} strokeWidth="2.5" fill={t.fillSoft} fillOpacity="0.1" />
        <path d="M28 35 L50 22 L72 35" stroke={t.strokeColor} strokeWidth="2.5" fill="none" />
        <path d="M50 22 V30" stroke={t.strokeWarm} strokeWidth="2" strokeLinecap="round" />
        <rect x="42" y="48" width="16" height="18" fill={t.strokeColor} fillOpacity="0.25" />
      </>);

    case 'business':
      return conceptWrap(t, <>
        <rect x="24" y="58" width="12" height="18" fill={t.strokeColor} fillOpacity="0.35" />
        <rect x="40" y="48" width="12" height="28" fill={t.strokeColor} fillOpacity="0.5" />
        <rect x="56" y="38" width="12" height="38" fill={t.strokeColor} fillOpacity="0.7" className="cv-pulse" />
        <path d="M22 76 H74" stroke={t.mainColor} strokeWidth="2" strokeLinecap="round" />
      </>);

    case 'weather':
      return conceptWrap(t, <>
        <circle cx="68" cy="36" r="10" fill={t.strokeWarm} fillOpacity="0.45" className="cv-pulse" />
        <ellipse cx="42" cy="52" rx="18" ry="12" fill={t.fillSoft} fillOpacity="0.35" stroke={t.mainColor} strokeWidth="2" className="cv-bob" />
        <path d="M30 68 Q50 58 70 68" stroke={t.strokeColor} strokeWidth="2.5" fill="none" />
      </>);

    case 'water':
      return conceptWrap(t, <>
        <path d="M15 58 Q30 42 45 58 T75 58 T90 58" stroke={t.strokeColor} strokeWidth="2.5" fill="none" className="cv-flow" />
        <path d="M15 72 Q35 56 55 72 T90 72" stroke={t.mainColor} strokeWidth="2" fill="none" className="cv-flow" style={{ animationDelay: '0.5s' }} />
      </>);

    case 'land':
      return conceptWrap(t, <>
        <path d="M15 70 Q35 45 55 60 T90 50 V70 H15 Z" fill={t.fillSoft} fillOpacity="0.2" stroke={t.mainColor} strokeWidth="2" />
        <path d="M62 48 L68 32 L74 48" fill={t.strokeColor} fillOpacity="0.35" stroke={t.mainColor} strokeWidth="1.5" />
        <circle cx="30" cy="52" r="8" fill={t.strokeColor} fillOpacity="0.25" stroke={t.mainColor} strokeWidth="1.5" />
      </>);

    case 'body':
      return conceptWrap(t, <>
        <circle cx="50" cy="32" r="10" stroke={t.mainColor} strokeWidth="2.5" fill={t.fillSoft} fillOpacity="0.15" />
        <path d="M50 42 V68" stroke={t.mainColor} strokeWidth="3" strokeLinecap="round" />
        <path d="M36 52 H64" stroke={t.mainColor} strokeWidth="2.5" strokeLinecap="round" />
        <ellipse cx="50" cy="58" rx="12" ry="14" stroke={t.strokeColor} strokeWidth="1.5" fill={t.fillSoft} fillOpacity="0.1" className="cv-pulse" />
      </>);

    case 'science':
      return conceptWrap(t, <>
        <circle cx="50" cy="52" r="8" fill={t.strokeColor} />
        <ellipse cx="50" cy="52" rx="26" ry="10" stroke={t.mainColor} strokeWidth="2" fill="none" className="cv-pulse" />
        <ellipse cx="50" cy="52" rx="10" ry="26" stroke={t.mainColor} strokeWidth="2" fill="none" className="cv-pulse" style={{ animationDelay: '0.4s' }} />
      </>);

    case 'action':
      return conceptWrap(t, <>
        <circle cx="28" cy="55" r="8" fill={t.mainColor} />
        <path d="M38 55 H72" stroke={t.strokeColor} strokeWidth="3" strokeLinecap="round" className="cv-flow" />
        <path d="M64 47 L74 55 L64 63" stroke={t.strokeColor} strokeWidth="3" fill="none" strokeLinecap="round" />
      </>);

    case 'place':
      return conceptWrap(t, <>
        <path d="M22 72 H78 V48 L50 28 Z" fill={t.fillSoft} fillOpacity="0.18" stroke={t.mainColor} strokeWidth="2.5" />
        <rect x="42" y="54" width="16" height="18" fill={t.strokeWarm} fillOpacity="0.35" />
        <path d="M15 72 H85" stroke={t.faintColor} strokeWidth="2" strokeLinecap="round" />
      </>);

    case 'document':
      return conceptWrap(t, <>
        <rect x="30" y="26" width="40" height="54" rx="3" stroke={t.mainColor} strokeWidth="2.5" fill={t.fillSoft} fillOpacity="0.1" />
        <path d="M36 38 H64 M36 48 H58 M36 58 H52" stroke={t.strokeColor} strokeWidth="1.5" strokeLinecap="round" />
        <path d="M58 62 L66 70 L58 78" stroke={t.strokeWarm} strokeWidth="2" fill="none" strokeLinecap="round" className="cv-pulse" />
      </>);

    case 'animal':
      return conceptWrap(t, <>
        <ellipse cx="50" cy="58" rx="22" ry="14" fill={t.fillSoft} fillOpacity="0.25" stroke={t.mainColor} strokeWidth="2.5" className="cv-bob" />
        <circle cx="62" cy="46" r="8" fill={t.mainColor} />
        <circle cx="65" cy="44" r="1.5" fill={t.strokeColor} />
        <path d="M70 46 L76 44" stroke={t.strokeWarm} strokeWidth="1.5" strokeLinecap="round" />
      </>);

    case 'art':
      return conceptWrap(t, <>
        <circle cx="38" cy="42" r="8" fill={t.strokeColor} fillOpacity="0.5" />
        <circle cx="52" cy="36" r="8" fill={t.strokeWarm} fillOpacity="0.45" />
        <circle cx="62" cy="48" r="8" fill={t.mainColor} fillOpacity="0.35" />
        <path d="M28 68 Q50 52 72 68" stroke={t.mainColor} strokeWidth="2.5" fill="none" />
      </>);

    case 'conflict':
      return conceptWrap(t, <>
        <path d="M30 35 L45 65 M45 35 L30 65" stroke={t.strokeColor} strokeWidth="3" strokeLinecap="round" />
        <path d="M55 35 L70 65 M70 35 L55 65" stroke={t.mainColor} strokeWidth="3" strokeLinecap="round" className="cv-pulse" />
      </>);

    case 'growth':
      return conceptWrap(t, <>
        <path d="M20 72 H80" stroke={t.faintColor} strokeWidth="2" strokeLinecap="round" />
        <path d="M25 68 Q40 55 50 40 T75 28" stroke={t.strokeColor} strokeWidth="3" fill="none" strokeLinecap="round" className="cv-flow" />
        <circle cx="75" cy="28" r="4" fill={t.strokeColor} className="cv-pulse" />
      </>);

    case 'abstract':
    default:
      return conceptFallback(t, word);
  }
}

export default function GeneralWordVisual({ type }: { type: string }) {
  const t = conceptVisualTokens();
  return <>{renderMotif(t, getGeneralMotif(type), type)}</>;
}
