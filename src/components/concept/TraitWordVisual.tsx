/**
 * 性质词 (100) + 反义词 (50) 动态 SVG — 与全库词图风格统一。
 */
import type { ReactNode } from 'react';
import { getQualityMotif, type QualityMotif } from '../../data/qualityWordMotifs';
import { getOppositeMotif, type OppositeMotif } from '../../data/oppositeWordMotifs';
import { conceptVisualTokens } from './conceptVisualTokens';
import { conceptWrap, conceptFallback, type ConceptTokens } from './conceptSvgShell';

export { QUALITY_WORDS, isQualityWord } from '../../data/qualityWordMotifs';
export { OPPOSITE_WORDS, isOppositeWord } from '../../data/oppositeWordMotifs';

function renderQualityMotif(t: ConceptTokens, motif: QualityMotif, word: string): ReactNode {
  switch (motif) {
    case 'color':
      return conceptWrap(t, <>
        <circle cx="50" cy="52" r="22" fill={word === 'red' ? '#e11d48' : word === 'yellow' ? '#eab308' : word === 'brown' ? '#92400e' : word === 'grey' ? '#94a3b8' : t.mainColor} fillOpacity="0.55" stroke={t.mainColor} strokeWidth="2" className="cv-pulse" />
      </>);
    case 'temperature':
      return conceptWrap(t, <>
        <path d="M46 28 V62" stroke={t.mainColor} strokeWidth="3" strokeLinecap="round" />
        <circle cx="46" cy="66" r="8" stroke={t.strokeColor} strokeWidth="2.5" fill={t.fillSoft} fillOpacity="0.3" className="cv-pulse" />
        {word === 'boiling' && <path d="M58 40 Q62 32 66 40 Q70 48 74 40" stroke={t.strokeWarm} strokeWidth="2" fill="none" className="cv-flow" />}
        {word === 'wet' && <path d="M20 72 Q35 58 50 72 T80 72" stroke={t.strokeColor} strokeWidth="2" fill="none" />}
      </>);
    case 'emotion':
      return conceptWrap(t, <>
        <circle cx="50" cy="50" r="20" stroke={t.strokeColor} strokeWidth="2.5" fill={t.fillSoft} fillOpacity="0.15" className="cv-pulse" />
        <path d={word === 'angry' ? 'M40 56 L46 50 L52 56 M48 50 L54 56 L60 50' : word === 'happy' ? 'M40 52 Q50 62 60 52' : 'M42 54 H58'} stroke={t.mainColor} strokeWidth="2" fill="none" strokeLinecap="round" />
      </>);
    case 'texture':
      return conceptWrap(t, <>
        <rect x="28" y="38" width="44" height="28" rx="4" stroke={t.mainColor} strokeWidth="2.5" fill={t.fillSoft} fillOpacity="0.12" />
        {word === 'smooth' || word === 'elastic'
          ? <path d="M32 52 H68" stroke={t.strokeColor} strokeWidth="2" className="cv-flow" />
          : <path d="M32 48 L68 58 M32 58 L68 48" stroke={t.strokeColor} strokeWidth="1.5" />}
      </>);
    case 'magnitude':
      return conceptWrap(t, <>
        <rect x="30" y="62" width="10" height="12" fill={t.faintColor} fillOpacity="0.4" />
        <rect x="44" y="50" width="10" height="24" fill={t.strokeColor} fillOpacity="0.35" />
        <rect x="58" y="34" width="10" height="40" fill={t.strokeColor} fillOpacity="0.65" className="cv-pulse" />
      </>);
    case 'shape':
      return conceptWrap(t, <>
        {word === 'round' && <circle cx="50" cy="52" r="22" stroke={t.mainColor} strokeWidth="2.5" fill={t.fillSoft} fillOpacity="0.15" />}
        {word === 'flat' && <line x1="20" y1="55" x2="80" y2="55" stroke={t.mainColor} strokeWidth="4" strokeLinecap="round" />}
        {word === 'hollow' && <><circle cx="50" cy="52" r="22" stroke={t.mainColor} strokeWidth="2.5" fill="none" /><circle cx="50" cy="52" r="12" stroke={t.strokeColor} strokeWidth="1.5" fill={t.fillSoft} fillOpacity="0.1" /></>}
        {word === 'straight' && <line x1="20" y1="52" x2="80" y2="52" stroke={t.strokeColor} strokeWidth="3" strokeLinecap="round" />}
        {word === 'parallel' && <><line x1="25" y1="44" x2="75" y2="44" stroke={t.mainColor} strokeWidth="2.5" /><line x1="25" y1="60" x2="75" y2="60" stroke={t.mainColor} strokeWidth="2.5" /></>}
        {!['round', 'flat', 'hollow', 'straight', 'parallel'].includes(word) && (
          <rect x="32" y="40" width="36" height="24" rx={word === 'open' ? 6 : 2} stroke={t.mainColor} strokeWidth="2.5" fill="none" />
        )}
      </>);
    case 'speed':
      return conceptWrap(t, <>
        {word === 'quick'
          ? <><path d="M25 55 H70" stroke={t.strokeColor} strokeWidth="3" strokeLinecap="round" className="cv-flow" /><path d="M62 47 L74 55 L62 63" stroke={t.strokeColor} strokeWidth="3" fill="none" /></>
          : <><line x1="30" y1="50" x2="70" y2="50" stroke={t.faintColor} strokeWidth="2" /><text x="50" y="58" fontSize="8px" fill={t.strokeWarm} textAnchor="middle">···</text></>}
      </>);
    case 'time':
      return conceptWrap(t, <>
        <path d="M15 65 H85" stroke={t.faintColor} strokeWidth="2" strokeLinecap="round" />
        <circle cx={word === 'past' ? 30 : word === 'present' ? 50 : 70} cy="65" r="5" fill={t.strokeColor} className="cv-pulse" />
        <text x="50" y="40" fontSize="7px" fontFamily="var(--mono)" fill={t.strokeWarm} textAnchor="middle">{word.toUpperCase()}</text>
      </>);
    case 'positive':
      return conceptWrap(t, <>
        <circle cx="50" cy="52" r="22" stroke={t.strokeColor} strokeWidth="2" fill={t.fillSoft} fillOpacity="0.15" />
        <path d="M38 52 L46 60 L64 42" stroke={t.strokeColor} strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </>);
    case 'negative':
      return conceptWrap(t, <>
        <rect x="30" y="38" width="40" height="30" rx="4" stroke={t.mainColor} strokeWidth="2.5" fill="none" />
        <path d="M36 44 L64 62 M64 44 L36 62" stroke={t.strokeColor} strokeWidth="3" strokeLinecap="round" />
      </>);
    case 'social':
      return conceptWrap(t, <>
        <circle cx="38" cy="48" r="8" stroke={t.mainColor} strokeWidth="2" fill="none" />
        <circle cx="62" cy="48" r="8" stroke={t.mainColor} strokeWidth="2" fill="none" />
        <path d="M30 68 Q50 56 70 68" stroke={t.strokeColor} strokeWidth="2" fill="none" className="cv-pulse" />
      </>);
    case 'default':
    default:
      return conceptFallback(t, word);
  }
}

function renderOppositeMotif(t: ConceptTokens, motif: OppositeMotif, word: string): ReactNode {
  switch (motif) {
    case 'temperature':
      return conceptWrap(t, <>
        <circle cx="50" cy="40" r="8" fill={t.strokeColor} fillOpacity="0.4" />
        <path d="M35 55 Q50 70 65 55" stroke={t.strokeColor} strokeWidth="2.5" fill={t.fillSoft} fillOpacity="0.2" />
        <text x="50" y="78" fontSize="7px" fontFamily="var(--mono)" fill={t.strokeWarm} textAnchor="middle">COLD</text>
      </>);
    case 'light':
      return conceptWrap(t, <>
        <rect x="22" y="28" width="56" height="44" rx="4" fill={t.mainColor} fillOpacity="0.75" />
        <circle cx="72" cy="32" r="10" fill={t.strokeWarm} fillOpacity="0.35" className="cv-pulse" />
      </>);
    case 'size':
      return conceptWrap(t, <>
        <rect x="55" y="40" width="22" height="22" stroke={t.faintColor} strokeWidth="2" fill="none" opacity="0.4" />
        <rect x={word === 'low' ? 38 : 42} y={word === 'thin' ? 44 : 48} width={word === 'small' ? 10 : 14} height={word === 'short' ? 10 : 14} fill={t.strokeColor} fillOpacity="0.5" className="cv-pulse" />
        <path d="M30 68 H70" stroke={t.faintColor} strokeWidth="2" strokeLinecap="round" />
      </>);
    case 'truth':
      return conceptWrap(t, <>
        {word === 'false' || word === 'wrong'
          ? <path d="M35 35 L65 65 M65 35 L35 65" stroke={t.strokeColor} strokeWidth="4" strokeLinecap="round" />
          : <path d="M35 50 L45 60 L65 40" stroke={t.strokeColor} strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round" />}
      </>);
    case 'safety':
      return conceptWrap(t, <>
        <path d="M50 24 L68 34 V52 Q68 68 50 76 Q32 68 32 52 V34 Z" stroke={t.strokeColor} strokeWidth="2.5" fill={t.fillSoft} fillOpacity="0.2" />
        <path d="M42 52 L48 58 L60 44" stroke={t.strokeColor} strokeWidth="2.5" fill="none" strokeLinecap="round" />
      </>);
    case 'texture':
      return conceptWrap(t, <>
        <rect x="30" y="42" width="40" height="24" rx="3" stroke={t.mainColor} strokeWidth="2" fill={t.fillSoft} fillOpacity="0.1" />
        {word === 'rough'
          ? <path d="M34 48 L66 58 M34 58 L66 48" stroke={t.strokeColor} strokeWidth="1.5" />
          : <ellipse cx="50" cy="54" rx="14" ry="8" fill={t.strokeColor} fillOpacity="0.25" />}
      </>);
    case 'sound':
      return conceptWrap(t, <>
        {[0, 1, 2].map((i) => (
          <path key={i} d={`M${38 + i * 8} 62 Q${42 + i * 8} ${44 - i * 4} ${46 + i * 8} 62`} stroke={t.strokeColor} strokeWidth="2" fill="none" className="cv-pulse" style={{ animationDelay: `${i * 0.2}s` }} />
        ))}
      </>);
    case 'position':
      return conceptWrap(t, <>
        <path d="M50 30 V70" stroke={t.faintColor} strokeWidth="2" />
        {word === 'left' && <path d="M30 50 H60" stroke={t.strokeColor} strokeWidth="3" strokeLinecap="round" className="cv-flow" />}
        {word === 'shut' && <><rect x="36" y="40" width="28" height="28" rx="2" stroke={t.mainColor} strokeWidth="2.5" fill="none" /><line x1="36" y1="40" x2="64" y2="68" stroke={t.strokeColor} strokeWidth="2.5" /></>}
        {word === 'bent' && <path d="M30 65 Q50 35 70 55" stroke={t.strokeColor} strokeWidth="3" fill="none" />}
        {word === 'loose' && <circle cx="50" cy="52" r="16" stroke={t.strokeColor} strokeWidth="2" strokeDasharray="4 3" fill="none" className="cv-pulse" />}
      </>);
    case 'time':
      return conceptWrap(t, <>
        <path d="M15 58 H85" stroke={t.faintColor} strokeWidth="2" strokeLinecap="round" />
        <circle cx={word === 'old' || word === 'last' || word === 'dead' ? 28 : 72} cy="58" r="5" fill={t.strokeColor} className="cv-pulse" />
        {word === 'awake' && <circle cx="50" cy="36" r="8" fill={t.strokeWarm} fillOpacity="0.5" className="cv-pulse" />}
      </>);
    case 'color':
      return conceptWrap(t, <>
        <circle cx="50" cy="52" r="22" fill={word === 'blue' ? '#3b82f6' : word === 'green' ? '#22c55e' : '#f8fafc'} fillOpacity="0.6" stroke={t.mainColor} strokeWidth="2" className="cv-pulse" />
      </>);
    case 'state':
      return conceptWrap(t, <>
        <rect x="28" y="36" width="44" height="32" rx="6" stroke={t.mainColor} strokeWidth="2" fill={t.fillSoft} fillOpacity="0.1" />
        {['bad', 'sad', 'ill', 'cruel'].includes(word)
          ? <path d="M40 54 L48 46 L56 54" stroke={t.strokeColor} strokeWidth="2" fill="none" />
          : <path d="M40 50 L48 58 L56 50" stroke={t.strokeColor} strokeWidth="2" fill="none" />}
        {word === 'opposite' && <><path d="M30 52 H70" stroke={t.faintColor} strokeWidth="1.5" /><circle cx="38" cy="52" r="4" fill={t.strokeColor} /><circle cx="62" cy="52" r="4" fill={t.mainColor} /></>}
        {word === 'different' && <><rect x="34" y="44" width="10" height="10" fill={t.strokeColor} fillOpacity="0.4" /><circle cx="58" cy="52" r="6" stroke={t.mainColor} strokeWidth="2" fill="none" /></>}
      </>);
    default:
      return conceptFallback(t, word);
  }
}

export function QualityWordVisual({ type }: { type: string }) {
  const t = conceptVisualTokens();
  return <>{renderQualityMotif(t, getQualityMotif(type), type)}</>;
}

export function OppositeWordVisual({ type }: { type: string }) {
  const t = conceptVisualTokens();
  return <>{renderOppositeMotif(t, getOppositeMotif(type), type)}</>;
}

export default QualityWordVisual;
