/**
 * 200 个 Picturable 词的动态 SVG — 与 DirectionGraphic / GrammarWordVisual 同源风格。
 * 存于 React 组件内，非 public/ 静态文件。
 */
import type { ReactNode } from 'react';
import { conceptVisualTokens } from './conceptVisualTokens';

export const PICTURABLE_WORDS = [
  'angle', 'ant', 'apple', 'arch', 'arm', 'army', 'baby', 'bag', 'ball', 'band', 'basin', 'basket', 'bath', 'bed',
  'bee', 'bell', 'berry', 'bird', 'blade', 'board', 'boat', 'bone', 'book', 'boot', 'bottle', 'box', 'boy', 'brain',
  'brake', 'branch', 'brick', 'bridge', 'brush', 'bucket', 'bulb', 'button', 'cake', 'camera', 'card', 'cart',
  'carriage', 'cat', 'chain', 'cheese', 'chest', 'chin', 'church', 'circle', 'clock', 'cloud', 'coat', 'collar',
  'comb', 'cord', 'cow', 'cup', 'curtain', 'cushion', 'dog', 'door', 'drain', 'drawer', 'dress', 'drop', 'ear', 'egg',
  'engine', 'eye', 'face', 'farm', 'feather', 'finger', 'fish', 'flag', 'floor', 'fly', 'foot', 'fork', 'fowl', 'frame',
  'garden', 'girl', 'glove', 'goat', 'gun', 'hair', 'hammer', 'hand', 'hat', 'head', 'heart', 'hook', 'horn', 'horse',
  'hospital', 'house', 'island', 'jewel', 'kettle', 'key', 'knee', 'knife', 'knot', 'leaf', 'leg', 'library', 'line',
  'lip', 'lock', 'map', 'match', 'monkey', 'moon', 'mouth', 'muscle', 'nail', 'neck', 'needle', 'nerve', 'net', 'nose',
  'nut', 'office', 'orange', 'oven', 'parcel', 'pen', 'pencil', 'picture', 'pig', 'pin', 'pipe', 'plane', 'plate',
  'plough', 'pocket', 'pot', 'potato', 'prison', 'pump', 'rail', 'rat', 'receipt', 'ring', 'rod', 'roof', 'root', 'sail',
  'school', 'scissors', 'screw', 'seed', 'sheep', 'shelf', 'ship', 'shirt', 'shoe', 'skin', 'skirt', 'snake', 'sock',
  'spade', 'sponge', 'spoon', 'spring', 'square', 'stamp', 'star', 'station', 'stem', 'stick', 'stocking', 'stomach',
  'store', 'street', 'sun', 'table', 'tail', 'thread', 'throat', 'thumb', 'ticket', 'toe', 'tongue', 'tooth', 'town',
  'train', 'tray', 'tree', 'trousers', 'umbrella', 'wall', 'watch', 'wheel', 'whip', 'whistle', 'window', 'wing', 'wire', 'worm',
] as const;

type Tokens = ReturnType<typeof conceptVisualTokens>;

function wrap(t: Tokens, children: ReactNode) {
  return (
    <svg {...t.baseSvgProps}>
      <style>{t.inlineStyles}</style>
      {children}
    </svg>
  );
}

function label(t: Tokens, text: string, y = 14) {
  return (
    <text x="50" y={y} fontSize="6.5px" fontFamily="var(--mono)" fill={t.strokeWarm} fontWeight="bold" textAnchor="middle">
      {text.toUpperCase()}
    </text>
  );
}

function geoAngle(t: Tokens) {
  return wrap(t, <>
    {label(t, 'angle')}
    <line x1="18" y1="78" x2="48" y2="28" stroke={t.mainColor} strokeWidth="3.5" strokeLinecap="round" />
    <line x1="48" y1="28" x2="82" y2="78" stroke={t.mainColor} strokeWidth="3.5" strokeLinecap="round" />
    <path d="M28 74 A22 22 0 0 1 68 74 Z" fill={t.fillSoft} fillOpacity="0.35" stroke={t.strokeColor} strokeWidth="2" className="cv-pulse" />
    <circle cx="48" cy="28" r="3.5" fill={t.strokeColor} />
  </>);
}

function geoCircle(t: Tokens, hollow = false) {
  return wrap(t, <>
    <circle cx="50" cy="54" r="24" stroke={t.mainColor} strokeWidth="3" fill={hollow ? 'none' : t.fillSoft} fillOpacity={hollow ? 0 : 0.2} className="cv-pulse" />
  </>);
}

function geoLine(t: Tokens) {
  return wrap(t, <>
    <line x1="15" y1="70" x2="85" y2="30" stroke={t.mainColor} strokeWidth="3.5" strokeLinecap="round" className="cv-flow" />
    <circle cx="15" cy="70" r="3" fill={t.strokeColor} />
    <circle cx="85" cy="30" r="3" fill={t.strokeColor} />
  </>);
}

function geoSquare(t: Tokens) {
  return wrap(t, <>
    <rect x="28" y="32" width="44" height="44" rx="2" stroke={t.mainColor} strokeWidth="3" fill={t.fillSoft} fillOpacity="0.15" className="cv-pulse" />
  </>);
}

function geoArch(t: Tokens) {
  return wrap(t, <>
    <path d="M20 72 H80" stroke={t.mainColor} strokeWidth="3" strokeLinecap="round" />
    <path d="M22 72 Q50 20 78 72" stroke={t.strokeColor} strokeWidth="3" fill="none" className="cv-pulse" />
  </>);
}

function animalQuad(t: Tokens, ears: 'point' | 'round' | 'floppy' = 'point') {
  const ear = ears === 'point'
    ? <><path d="M36 38 L32 28 L42 34 Z" fill={t.mainColor} /><path d="M64 38 L68 28 L58 34 Z" fill={t.mainColor} /></>
    : ears === 'floppy'
      ? <><ellipse cx="34" cy="36" rx="6" ry="10" fill={t.mainColor} /><ellipse cx="66" cy="36" rx="6" ry="10" fill={t.mainColor} /></>
      : <><circle cx="34" cy="32" r="5" fill={t.mainColor} /><circle cx="66" cy="32" r="5" fill={t.mainColor} /></>;
  return wrap(t, <>
    {ear}
    <ellipse cx="50" cy="56" rx="22" ry="18" fill={t.fillSoft} fillOpacity="0.25" stroke={t.mainColor} strokeWidth="2.5" />
    <circle cx="42" cy="52" r="2.5" fill={t.mainColor} />
    <circle cx="58" cy="52" r="2.5" fill={t.mainColor} />
    <path d="M46 60 Q50 64 54 60" stroke={t.mainColor} strokeWidth="1.5" fill="none" />
  </>);
}

function animalBird(t: Tokens) {
  return wrap(t, <>
    <path d="M25 55 Q50 25 75 55 Q50 48 25 55 Z" fill={t.fillSoft} fillOpacity="0.3" stroke={t.mainColor} strokeWidth="2.5" className="cv-bob" />
    <circle cx="62" cy="48" r="2.5" fill={t.mainColor} />
    <path d="M68 50 L78 48" stroke={t.strokeWarm} strokeWidth="2" strokeLinecap="round" />
  </>);
}

function animalFish(t: Tokens) {
  return wrap(t, <>
    <ellipse cx="48" cy="52" rx="22" ry="12" fill={t.fillSoft} fillOpacity="0.25" stroke={t.mainColor} strokeWidth="2.5" className="cv-bob" />
    <path d="M70 52 L82 42 V62 Z" fill={t.strokeColor} />
    <circle cx="38" cy="50" r="2" fill={t.mainColor} />
  </>);
}

function animalBug(t: Tokens, wings = false) {
  return wrap(t, <>
    <ellipse cx="50" cy="58" rx="16" ry="10" fill={t.fillSoft} fillOpacity="0.3" stroke={t.mainColor} strokeWidth="2" />
    <circle cx="50" cy="42" r="7" fill={t.mainColor} />
    {wings && <path d="M30 50 Q20 35 35 45 M70 50 Q80 35 65 45" stroke={t.strokeColor} strokeWidth="1.5" fill="none" className="cv-pulse" />}
    <line x1="42" y1="65" x2="38" y2="78" stroke={t.mainColor} strokeWidth="2" strokeLinecap="round" />
    <line x1="50" y1="66" x2="50" y2="80" stroke={t.mainColor} strokeWidth="2" strokeLinecap="round" />
    <line x1="58" y1="65" x2="62" y2="78" stroke={t.mainColor} strokeWidth="2" strokeLinecap="round" />
  </>);
}

function bodyPart(
  t: Tokens,
  kind: 'eye' | 'hand' | 'heart' | 'head' | 'foot' | 'arm' | 'ear' | 'chest' | 'stomach' | 'muscle' | 'brain' | 'nerve' | 'skin',
) {
  if (kind === 'eye') {
    return wrap(t, <>
      <ellipse cx="50" cy="52" rx="24" ry="16" stroke={t.mainColor} strokeWidth="2.5" fill="none" />
      <circle cx="50" cy="52" r="9" fill={t.strokeColor} className="cv-pulse" />
      <circle cx="53" cy="49" r="3" fill="white" fillOpacity="0.8" />
    </>);
  }
  if (kind === 'hand') {
    return wrap(t, <>
      <path d="M50 78 V48" stroke={t.mainColor} strokeWidth="3" strokeLinecap="round" />
      <path d="M38 52 V38 M44 50 V32 M50 48 V30 M56 50 V32 M62 52 V38" stroke={t.mainColor} strokeWidth="2.5" strokeLinecap="round" />
      <path d="M36 58 Q50 68 64 58" stroke={t.strokeColor} strokeWidth="2" fill="none" />
    </>);
  }
  if (kind === 'arm') {
    return wrap(t, <>
      <path d="M50 28 V46" stroke={t.mainColor} strokeWidth="3" strokeLinecap="round" />
      <path d="M50 46 H68" stroke={t.mainColor} strokeWidth="3.5" strokeLinecap="round" />
      <path d="M68 46 L74 68" stroke={t.mainColor} strokeWidth="3" strokeLinecap="round" />
      <circle cx="74" cy="71" r="4" fill={t.strokeColor} className="cv-pulse" />
    </>);
  }
  if (kind === 'heart') {
    return wrap(t, <>
      <path d="M50 72 C30 55 22 42 35 32 C44 25 50 34 50 34 C50 34 56 25 65 32 C78 42 70 55 50 72 Z" fill={t.strokeColor} fillOpacity="0.45" stroke={t.mainColor} strokeWidth="2" className="cv-pulse" />
    </>);
  }
  if (kind === 'head') {
    return wrap(t, <>
      <circle cx="50" cy="42" r="16" fill={t.fillSoft} fillOpacity="0.2" stroke={t.mainColor} strokeWidth="2.5" />
      <circle cx="44" cy="40" r="2" fill={t.mainColor} />
      <circle cx="56" cy="40" r="2" fill={t.mainColor} />
      <path d="M46 48 Q50 52 54 48" stroke={t.mainColor} strokeWidth="1.5" fill="none" />
      <path d="M50 58 V78" stroke={t.mainColor} strokeWidth="2.5" strokeLinecap="round" />
    </>);
  }
  if (kind === 'ear') {
    return wrap(t, <>
      <path d="M48 28 Q36 42 38 58 Q42 68 50 62 Q46 48 52 38 Q54 32 48 28 Z" fill={t.fillSoft} fillOpacity="0.25" stroke={t.mainColor} strokeWidth="2.5" />
      <path d="M44 48 Q42 56 46 60" stroke={t.strokeColor} strokeWidth="1.5" fill="none" />
    </>);
  }
  if (kind === 'chest') {
    return wrap(t, <>
      <path d="M38 28 V72" stroke={t.mainColor} strokeWidth="2.5" strokeLinecap="round" />
      <path d="M62 28 V72" stroke={t.mainColor} strokeWidth="2.5" strokeLinecap="round" />
      <path d="M38 32 H62" stroke={t.mainColor} strokeWidth="2.5" />
      <ellipse cx="50" cy="48" rx="12" ry="14" fill={t.fillSoft} fillOpacity="0.2" stroke={t.strokeColor} strokeWidth="2" className="cv-pulse" />
    </>);
  }
  if (kind === 'stomach') {
    return wrap(t, <>
      <path d="M40 30 V72" stroke={t.mainColor} strokeWidth="2" />
      <path d="M60 30 V72" stroke={t.mainColor} strokeWidth="2" />
      <ellipse cx="50" cy="58" rx="14" ry="16" fill={t.fillSoft} fillOpacity="0.25" stroke={t.strokeColor} strokeWidth="2" className="cv-pulse" />
    </>);
  }
  if (kind === 'muscle') {
    return wrap(t, <>
      <path d="M50 30 V45" stroke={t.mainColor} strokeWidth="3" strokeLinecap="round" />
      <path d="M50 45 H65" stroke={t.mainColor} strokeWidth="3.5" strokeLinecap="round" />
      <ellipse cx="62" cy="48" rx="10" ry="8" fill={t.strokeColor} fillOpacity="0.4" stroke={t.mainColor} strokeWidth="2" className="cv-pulse" />
      <path d="M65 52 L70 70" stroke={t.mainColor} strokeWidth="3" strokeLinecap="round" />
    </>);
  }
  if (kind === 'brain') {
    return wrap(t, <>
      <path d="M30 52 Q28 35 42 30 Q50 24 58 30 Q72 35 70 52 Q72 68 58 72 Q50 76 42 72 Q28 68 30 52 Z" fill={t.fillSoft} fillOpacity="0.25" stroke={t.mainColor} strokeWidth="2.5" />
      <path d="M42 38 Q50 48 58 38 M38 52 Q50 58 62 52 M42 62 Q50 54 58 62" stroke={t.strokeColor} strokeWidth="1.5" fill="none" />
    </>);
  }
  if (kind === 'nerve') {
    return wrap(t, <>
      <circle cx="50" cy="52" r="5" fill={t.strokeColor} />
      <path d="M50 47 V32 M50 57 V72 M50 52 H32 M50 52 H68" stroke={t.mainColor} strokeWidth="2" strokeLinecap="round" />
      <path d="M50 40 Q35 30 28 38 M50 40 Q65 30 72 38" stroke={t.strokeColor} strokeWidth="1.5" strokeLinecap="round" />
    </>);
  }
  if (kind === 'skin') {
    return wrap(t, <>
      <rect x="30" y="35" width="40" height="38" rx="6" fill={t.fillSoft} fillOpacity="0.15" stroke={t.mainColor} strokeWidth="2" />
      <path d="M36 44 H64 M36 52 H64 M36 60 H64" stroke={t.faintColor} strokeWidth="1" strokeLinecap="round" />
      <path d="M40 38 V70 M48 38 V70 M56 38 V70" stroke={t.faintColor} strokeWidth="1" strokeLinecap="round" />
    </>);
  }
  return wrap(t, <>
    <path d="M50 30 V62" stroke={t.mainColor} strokeWidth="3" strokeLinecap="round" />
    <path d="M34 68 Q50 58 66 68 L62 78 Q50 72 38 78 Z" fill={t.fillSoft} fillOpacity="0.25" stroke={t.mainColor} strokeWidth="2" />
  </>);
}

function shapeFork(t: Tokens) {
  return wrap(t, <>
    <path d="M50 78 V42" stroke={t.mainColor} strokeWidth="3" strokeLinecap="round" />
    <path d="M50 48 L38 32 M50 48 L50 28 M50 48 L62 32" stroke={t.strokeColor} strokeWidth="2.5" strokeLinecap="round" />
  </>);
}

function shapeHook(t: Tokens) {
  return wrap(t, <>
    <path d="M62 28 V48 Q62 68 42 68 Q28 68 28 54" stroke={t.mainColor} strokeWidth="3" strokeLinecap="round" fill="none" className="cv-pulse" />
  </>);
}

function shapeBone(t: Tokens) {
  return wrap(t, <>
    <ellipse cx="28" cy="52" rx="10" ry="7" fill={t.fillSoft} fillOpacity="0.3" stroke={t.mainColor} strokeWidth="2" />
    <rect x="28" y="48" width="44" height="8" rx="2" fill={t.fillSoft} fillOpacity="0.25" stroke={t.mainColor} strokeWidth="2" />
    <ellipse cx="72" cy="52" rx="10" ry="7" fill={t.fillSoft} fillOpacity="0.3" stroke={t.mainColor} strokeWidth="2" />
  </>);
}

function shapeBrick(t: Tokens) {
  return wrap(t, <>
    <rect x="26" y="38" width="48" height="24" rx="2" fill={t.fillSoft} fillOpacity="0.2" stroke={t.mainColor} strokeWidth="2.5" />
    <line x1="26" y1="50" x2="74" y2="50" stroke={t.strokeColor} strokeWidth="1.5" />
    <line x1="50" y1="38" x2="50" y2="62" stroke={t.strokeColor} strokeWidth="1.5" />
  </>);
}

function shapeWheel(t: Tokens) {
  return wrap(t, <>
    <circle cx="50" cy="52" r="22" stroke={t.mainColor} strokeWidth="2.5" fill="none" />
    {[0, 45, 90, 135].map((deg) => {
      const r = (deg * Math.PI) / 180;
      return <line key={deg} x1={50 + Math.cos(r) * 6} y1={52 + Math.sin(r) * 6} x2={50 + Math.cos(r) * 20} y2={52 + Math.sin(r) * 20} stroke={t.strokeColor} strokeWidth="2" />;
    })}
    <circle cx="50" cy="52" r="4" fill={t.mainColor} />
  </>);
}

function shapeDrop(t: Tokens) {
  return wrap(t, <>
    <path d="M50 28 C38 48 32 58 32 62 A18 18 0 0 0 68 62 C68 58 62 48 50 28 Z" fill={t.fillSoft} fillOpacity="0.35" stroke={t.strokeColor} strokeWidth="2" className="cv-bob" />
  </>);
}

function shapeFlag(t: Tokens) {
  return wrap(t, <>
    <path d="M32 28 V78" stroke={t.mainColor} strokeWidth="2.5" strokeLinecap="round" />
    <path d="M32 32 H68 L62 46 L68 60 H32 Z" fill={t.strokeColor} fillOpacity="0.35" stroke={t.mainColor} strokeWidth="2" className="cv-bob" />
  </>);
}

function shapeFrame(t: Tokens) {
  return wrap(t, <>
    <rect x="24" y="28" width="52" height="48" rx="2" stroke={t.mainColor} strokeWidth="3" fill="none" />
    <rect x="32" y="36" width="36" height="32" stroke={t.strokeColor} strokeWidth="1.5" fill={t.fillSoft} fillOpacity="0.1" />
  </>);
}

function shapeChain(t: Tokens) {
  return wrap(t, <>
    {[35, 50, 65].map((x) => (
      <ellipse key={x} cx={x} cy="52" rx="7" ry="10" stroke={t.mainColor} strokeWidth="2" fill="none" />
    ))}
  </>);
}

function shapeNail(t: Tokens) {
  return wrap(t, <>
    <circle cx="50" cy="32" r="8" stroke={t.mainColor} strokeWidth="2" fill={t.fillSoft} fillOpacity="0.15" />
    <path d="M50 40 V75" stroke={t.strokeColor} strokeWidth="2.5" strokeLinecap="round" />
    <path d="M46 75 L50 80 L54 75" stroke={t.strokeColor} strokeWidth="2" fill="none" strokeLinecap="round" />
  </>);
}

function shapeNet(t: Tokens) {
  return wrap(t, <>
    <path d="M20 35 L80 35 L68 72 L32 72 Z" stroke={t.mainColor} strokeWidth="2" fill="none" />
    {[38, 50, 62].map((x) => <line key={`v${x}`} x1={x} y1="35" x2={x + (x < 50 ? 4 : -4)} y2="72" stroke={t.faintColor} strokeWidth="1.2" />)}
    {[44, 54, 64].map((y) => <line key={`h${y}`} x1="26" y1={y} x2="74" y2={y} stroke={t.faintColor} strokeWidth="1.2" />)}
  </>);
}

function shapePlantPart(t: Tokens, kind: 'stem' | 'branch' | 'root' | 'stick') {
  if (kind === 'branch') {
    return wrap(t, <>
      <path d="M50 28 V60" stroke={t.mainColor} strokeWidth="3" strokeLinecap="round" />
      <path d="M50 42 L30 28 M50 52 L70 38" stroke={t.strokeColor} strokeWidth="2.5" strokeLinecap="round" />
    </>);
  }
  if (kind === 'root') {
    return wrap(t, <>
      <path d="M50 28 V60" stroke={t.mainColor} strokeWidth="3" strokeLinecap="round" />
      <path d="M50 60 L32 72 M50 60 L68 72" stroke={t.strokeColor} strokeWidth="2.5" strokeLinecap="round" />
    </>);
  }
  return wrap(t, <>
    <path d="M50 72 V35" stroke={t.mainColor} strokeWidth="3" strokeLinecap="round" />
    <ellipse cx="50" cy="32" rx="8" ry="5" fill={t.strokeColor} fillOpacity="0.35" />
  </>);
}

function shapeFeather(t: Tokens) {
  return wrap(t, <>
    <path d="M50 78 V32" stroke={t.mainColor} strokeWidth="2" strokeLinecap="round" />
    <path d="M50 38 L30 48 M50 48 L28 58 M50 58 L32 66 M50 68 L38 74" stroke={t.strokeColor} strokeWidth="1.5" strokeLinecap="round" />
    <path d="M50 38 L70 48 M50 48 L72 58 M50 58 L68 66" stroke={t.faintColor} strokeWidth="1.2" strokeLinecap="round" />
  </>);
}

function shapeWing(t: Tokens) {
  return wrap(t, <>
    <path d="M30 58 Q50 30 75 48 Q55 55 62 72 Q40 62 30 58 Z" fill={t.fillSoft} fillOpacity="0.25" stroke={t.mainColor} strokeWidth="2" className="cv-bob" />
  </>);
}

function shapeTail(t: Tokens) {
  return wrap(t, <>
    <ellipse cx="42" cy="55" rx="14" ry="12" fill={t.fillSoft} fillOpacity="0.2" stroke={t.mainColor} strokeWidth="2" />
    <path d="M52 55 Q72 45 78 62 Q65 68 52 62 Z" fill={t.strokeColor} fillOpacity="0.3" stroke={t.mainColor} strokeWidth="2" className="cv-bob" />
  </>);
}

function shapeHair(t: Tokens) {
  return wrap(t, <>
    <path d="M32 65 Q38 35 50 32 Q62 35 68 65" stroke={t.mainColor} strokeWidth="2.5" fill="none" />
    <path d="M36 58 Q42 42 50 40 Q58 42 64 58" stroke={t.strokeColor} strokeWidth="2" fill="none" className="cv-pulse" />
  </>);
}

function shapeSpring(t: Tokens) {
  return wrap(t, <>
    <path d="M30 35 H70 M32 45 H68 M34 55 H66 M36 65 H64" stroke={t.strokeColor} strokeWidth="2.5" strokeLinecap="round" className="cv-pulse" />
    <line x1="50" y1="28" x2="50" y2="35" stroke={t.mainColor} strokeWidth="2" />
    <line x1="50" y1="65" x2="50" y2="72" stroke={t.mainColor} strokeWidth="2" />
  </>);
}

function shapeScrew(t: Tokens) {
  return wrap(t, <>
    <path d="M50 25 V75" stroke={t.mainColor} strokeWidth="3" strokeLinecap="round" />
    <path d="M42 35 H58 M40 45 H60 M42 55 H58 M40 65 H60" stroke={t.strokeColor} strokeWidth="2" strokeLinecap="round" />
    <circle cx="50" cy="22" r="5" fill={t.strokeColor} fillOpacity="0.4" />
  </>);
}

function shapeKnot(t: Tokens) {
  return wrap(t, <>
    <path d="M28 55 Q50 25 72 55 Q50 75 28 55" stroke={t.mainColor} strokeWidth="3" fill="none" />
    <path d="M38 50 Q50 40 62 50" stroke={t.strokeColor} strokeWidth="2" fill="none" />
  </>);
}

function shapeBlade(t: Tokens) {
  return wrap(t, <>
    <path d="M35 68 L50 28 L65 68 Z" fill={t.fillSoft} fillOpacity="0.25" stroke={t.mainColor} strokeWidth="2.5" />
    <rect x="44" y="64" width="12" height="10" rx="2" fill={t.strokeWarm} fillOpacity="0.5" />
  </>);
}

function shapeSpoon(t: Tokens) {
  return wrap(t, <>
    <ellipse cx="50" cy="38" rx="14" ry="10" fill={t.fillSoft} fillOpacity="0.25" stroke={t.mainColor} strokeWidth="2" />
    <path d="M50 48 V75" stroke={t.strokeWarm} strokeWidth="3" strokeLinecap="round" />
  </>);
}

function shapeGun(t: Tokens) {
  return wrap(t, <>
    <rect x="22" y="46" width="48" height="10" rx="2" fill={t.mainColor} fillOpacity="0.35" />
    <rect x="58" y="40" width="18" height="8" rx="1" fill={t.strokeColor} fillOpacity="0.4" />
    <path d="M34 56 V68 H42 V56" stroke={t.mainColor} strokeWidth="2" fill={t.fillSoft} fillOpacity="0.15" />
  </>);
}

function shapeEngine(t: Tokens) {
  return wrap(t, <>
    <rect x="28" y="38" width="44" height="28" rx="4" stroke={t.mainColor} strokeWidth="2.5" fill={t.fillSoft} fillOpacity="0.12" />
    <circle cx="38" cy="68" r="6" stroke={t.mainColor} strokeWidth="2" fill="none" />
    <circle cx="62" cy="68" r="6" stroke={t.mainColor} strokeWidth="2" fill="none" />
    <path d="M36 48 H64 M36 56 H58" stroke={t.strokeColor} strokeWidth="1.5" strokeLinecap="round" />
  </>);
}

function shapePump(t: Tokens) {
  return wrap(t, <>
    <rect x="38" y="48" width="24" height="28" rx="3" stroke={t.mainColor} strokeWidth="2.5" fill={t.fillSoft} fillOpacity="0.15" />
    <path d="M50 48 V32" stroke={t.mainColor} strokeWidth="2.5" strokeLinecap="round" />
    <path d="M42 32 H58" stroke={t.strokeColor} strokeWidth="2.5" strokeLinecap="round" />
    <path d="M50 32 V24" stroke={t.strokeWarm} strokeWidth="2" strokeLinecap="round" className="cv-flow" />
  </>);
}

function shapeHorn(t: Tokens) {
  return wrap(t, <>
    <path d="M30 62 Q50 28 72 48 L68 58 Q50 42 36 68 Z" fill={t.strokeWarm} fillOpacity="0.35" stroke={t.mainColor} strokeWidth="2" />
    <circle cx="32" cy="62" r="4" fill={t.mainColor} />
  </>);
}

function shapeWhistle(t: Tokens) {
  return wrap(t, <>
    <circle cx="38" cy="52" r="10" stroke={t.mainColor} strokeWidth="2.5" fill={t.fillSoft} fillOpacity="0.15" />
    <path d="M48 52 H72" stroke={t.mainColor} strokeWidth="3" strokeLinecap="round" />
    <circle cx="68" cy="52" r="3" fill={t.strokeColor} className="cv-pulse" />
  </>);
}

function shapeSponge(t: Tokens) {
  return wrap(t, <>
    <rect x="30" y="38" width="40" height="32" rx="6" fill={t.strokeWarm} fillOpacity="0.3" stroke={t.mainColor} strokeWidth="2" />
    {[38, 48, 58, 68].map((y) => <circle key={y} cx={36 + (y % 3) * 8} cy={y} r="2" fill={t.mainColor} fillOpacity="0.25" />)}
  </>);
}

function shapeRoof(t: Tokens) {
  return wrap(t, <>
    <path d="M18 58 H82 V72 H18 Z" fill={t.fillSoft} fillOpacity="0.15" stroke={t.mainColor} strokeWidth="2" />
    <path d="M12 58 L50 28 L88 58" stroke={t.strokeColor} strokeWidth="3" fill="none" />
  </>);
}

function shapeBoard(t: Tokens) {
  return wrap(t, <>
    <rect x="22" y="32" width="56" height="36" rx="2" fill={t.strokeWarm} fillOpacity="0.25" stroke={t.mainColor} strokeWidth="2.5" />
    <path d="M28 42 H72 M28 52 H72 M28 62 H58" stroke={t.faintColor} strokeWidth="1.5" strokeLinecap="round" />
  </>);
}

function shapeBand(t: Tokens) {
  return wrap(t, <>
    <ellipse cx="50" cy="52" rx="28" ry="10" stroke={t.mainColor} strokeWidth="2.5" fill="none" />
    <ellipse cx="50" cy="52" rx="18" ry="6" stroke={t.strokeColor} strokeWidth="2" fill={t.fillSoft} fillOpacity="0.15" className="cv-pulse" />
  </>);
}

function shapeBrake(t: Tokens) {
  return wrap(t, <>
    <circle cx="50" cy="52" r="20" stroke={t.mainColor} strokeWidth="2.5" fill="none" />
    <path d="M50 32 V72 M32 52 H68" stroke={t.strokeColor} strokeWidth="2" />
    <rect x="62" y="42" width="12" height="20" rx="2" fill={t.strokeWarm} fillOpacity="0.45" stroke={t.mainColor} strokeWidth="1.5" />
  </>);
}

function shapeBulb(t: Tokens) {
  return wrap(t, <>
    <ellipse cx="50" cy="44" rx="18" ry="22" fill={t.fillSoft} fillOpacity="0.3" stroke={t.mainColor} strokeWidth="2.5" className="cv-pulse" />
    {[0, 60, 120, 180, 240, 300].map((deg) => {
      const r = (deg * Math.PI) / 180;
      return <line key={deg} x1={50 + Math.cos(r) * 22} y1={44 + Math.sin(r) * 22} x2={50 + Math.cos(r) * 30} y2={44 + Math.sin(r) * 30} stroke={t.strokeWarm} strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />;
    })}
    <rect x="42" y="62" width="16" height="10" rx="2" fill={t.strokeColor} fillOpacity="0.4" />
    <path d="M40 72 H60" stroke={t.mainColor} strokeWidth="2" strokeLinecap="round" />
    <path d="M41 76 H59" stroke={t.mainColor} strokeWidth="1.5" strokeLinecap="round" />
  </>);
}

function shapeBell(t: Tokens) {
  return wrap(t, <>
    <path d="M32 42 H68 L62 68 Q50 76 38 68 Z" fill={t.fillSoft} fillOpacity="0.25" stroke={t.mainColor} strokeWidth="2.5" className="cv-bob" />
    <circle cx="50" cy="72" r="4" fill={t.strokeColor} />
    <path d="M46 32 H54 V42" stroke={t.mainColor} strokeWidth="2" strokeLinecap="round" />
  </>);
}

function shapeButton(t: Tokens) {
  return wrap(t, <>
    <circle cx="50" cy="52" r="18" fill={t.strokeColor} fillOpacity="0.35" stroke={t.mainColor} strokeWidth="2.5" />
    <circle cx="50" cy="52" r="6" fill={t.fillSoft} fillOpacity="0.4" stroke={t.strokeWarm} strokeWidth="1.5" className="cv-pulse" />
  </>);
}

function shapeStar(t: Tokens) {
  return wrap(t, <>
    <path d="M50 24 L56 42 H76 L60 54 L66 72 L50 60 L34 72 L40 54 L24 42 H44 Z" fill={t.strokeWarm} fillOpacity="0.4" stroke={t.mainColor} strokeWidth="2" className="cv-pulse" />
  </>);
}

function shapeJewel(t: Tokens) {
  return wrap(t, <>
    <path d="M50 28 L68 48 L50 74 L32 48 Z" fill={t.strokeColor} fillOpacity="0.35" stroke={t.mainColor} strokeWidth="2.5" className="cv-pulse" />
    <path d="M32 48 H68 M50 28 V74" stroke={t.strokeWarm} strokeWidth="1" opacity="0.5" />
  </>);
}

function building(t: Tokens, kind: 'house' | 'tower' | 'bridge' | 'bars') {
  if (kind === 'bridge') {
    return wrap(t, <>
      <path d="M15 65 H85" stroke={t.faintColor} strokeWidth="3" />
      <path d="M20 65 Q50 25 80 65" stroke={t.strokeColor} strokeWidth="3" fill="none" />
    </>);
  }
  if (kind === 'bars') {
    return wrap(t, <>
      <rect x="30" y="25" width="40" height="55" stroke={t.mainColor} strokeWidth="2.5" fill="none" />
      {[38, 50, 62].map((x) => <line key={x} x1={x} y1="30" x2={x} y2="75" stroke={t.strokeColor} strokeWidth="2" />)}
    </>);
  }
  if (kind === 'tower') {
    return wrap(t, <>
      <rect x="38" y="22" width="24" height="58" stroke={t.mainColor} strokeWidth="2.5" fill={t.fillSoft} fillOpacity="0.12" />
      <path d="M34 22 L50 10 L66 22 Z" fill={t.strokeColor} fillOpacity="0.35" />
      <rect x="44" y="55" width="12" height="18" fill={t.strokeWarm} fillOpacity="0.4" />
    </>);
  }
  return wrap(t, <>
    <path d="M22 72 H78 V48 L50 28 Z" fill={t.fillSoft} fillOpacity="0.2" stroke={t.mainColor} strokeWidth="2.5" />
    <rect x="42" y="52" width="16" height="20" fill={t.strokeWarm} fillOpacity="0.35" />
  </>);
}

function vehicle(t: Tokens, kind: 'boat' | 'train' | 'plane' | 'cart') {
  if (kind === 'boat') {
    return wrap(t, <>
      <path d="M20 58 Q50 78 80 58 L72 68 H28 Z" fill={t.fillSoft} fillOpacity="0.3" stroke={t.mainColor} strokeWidth="2.5" className="cv-bob" />
      <path d="M50 58 V32" stroke={t.mainColor} strokeWidth="2" />
      <path d="M50 32 L68 42" stroke={t.strokeColor} strokeWidth="2" />
    </>);
  }
  if (kind === 'plane') {
    return wrap(t, <>
      <path d="M15 52 H85" stroke={t.mainColor} strokeWidth="3" strokeLinecap="round" />
      <path d="M40 52 L50 32 L60 52" stroke={t.strokeColor} strokeWidth="2.5" fill="none" />
      <path d="M48 52 L42 68 M52 52 L58 68" stroke={t.mainColor} strokeWidth="2" />
    </>);
  }
  if (kind === 'cart') {
    return wrap(t, <>
      <rect x="25" y="45" width="40" height="22" rx="3" stroke={t.mainColor} strokeWidth="2.5" fill={t.fillSoft} fillOpacity="0.15" />
      <circle cx="35" cy="72" r="6" stroke={t.mainColor} strokeWidth="2" fill="none" />
      <circle cx="60" cy="72" r="6" stroke={t.mainColor} strokeWidth="2" fill="none" />
    </>);
  }
  return wrap(t, <>
    <rect x="20" y="42" width="55" height="22" rx="4" fill={t.fillSoft} fillOpacity="0.2" stroke={t.mainColor} strokeWidth="2.5" />
    <circle cx="32" cy="70" r="7" fill={t.mainColor} />
    <circle cx="58" cy="70" r="7" fill={t.mainColor} />
  </>);
}

function nature(t: Tokens, kind: 'sun' | 'moon' | 'cloud' | 'tree' | 'leaf') {
  if (kind === 'sun') {
    return wrap(t, <>
      <circle cx="50" cy="50" r="14" fill={t.strokeWarm} fillOpacity="0.5" className="cv-pulse" />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => {
        const r = (deg * Math.PI) / 180;
        return <line key={deg} x1={50 + Math.cos(r) * 18} y1={50 + Math.sin(r) * 18} x2={50 + Math.cos(r) * 28} y2={50 + Math.sin(r) * 28} stroke={t.strokeWarm} strokeWidth="2" strokeLinecap="round" />;
      })}
    </>);
  }
  if (kind === 'moon') {
    return wrap(t, <>
      <path d="M58 28 A22 22 0 1 1 58 72 A16 16 0 1 0 58 28 Z" fill={t.fillSoft} fillOpacity="0.35" stroke={t.mainColor} strokeWidth="2" className="cv-pulse" />
    </>);
  }
  if (kind === 'cloud') {
    return wrap(t, <>
      <ellipse cx="40" cy="55" rx="14" ry="10" fill={t.fillSoft} fillOpacity="0.35" stroke={t.mainColor} strokeWidth="2" className="cv-bob" />
      <ellipse cx="58" cy="52" rx="16" ry="12" fill={t.fillSoft} fillOpacity="0.35" stroke={t.mainColor} strokeWidth="2" className="cv-bob" />
    </>);
  }
  if (kind === 'tree') {
    return wrap(t, <>
      <rect x="46" y="58" width="8" height="22" fill={t.mainColor} />
      <circle cx="50" cy="42" r="20" fill={t.strokeColor} fillOpacity="0.3" stroke={t.mainColor} strokeWidth="2" />
    </>);
  }
  return wrap(t, <>
    <path d="M62 30 Q35 45 40 70 Q55 55 62 30 Z" fill={t.strokeColor} fillOpacity="0.35" stroke={t.mainColor} strokeWidth="2" className="cv-bob" />
  </>);
}

function container(t: Tokens, tall = false) {
  return wrap(t, <>
    <rect x={tall ? 36 : 28} y={tall ? 28 : 35} width={tall ? 28 : 44} height={tall ? 48 : 35} rx="4" stroke={t.mainColor} strokeWidth="2.5" fill={t.fillSoft} fillOpacity="0.15" />
    {tall && <rect x="42" y="22" width="16" height="8" rx="2" fill={t.strokeColor} fillOpacity="0.4" />}
  </>);
}

function tool(t: Tokens, kind: 'hammer' | 'knife' | 'scissors' | 'brush') {
  if (kind === 'hammer') {
    return wrap(t, <>
      <rect x="44" y="22" width="18" height="12" rx="2" fill={t.mainColor} />
      <path d="M50 34 V78" stroke={t.strokeWarm} strokeWidth="3" strokeLinecap="round" className="cv-bob" />
    </>);
  }
  if (kind === 'knife') {
    return wrap(t, <>
      <path d="M30 68 L55 32 L62 38 L37 74 Z" fill={t.fillSoft} fillOpacity="0.3" stroke={t.mainColor} strokeWidth="2" />
      <rect x="28" y="64" width="14" height="8" rx="2" fill={t.strokeWarm} fillOpacity="0.5" />
    </>);
  }
  if (kind === 'scissors') {
    return wrap(t, <>
      <circle cx="35" cy="38" r="8" stroke={t.mainColor} strokeWidth="2" fill="none" />
      <circle cx="65" cy="38" r="8" stroke={t.mainColor} strokeWidth="2" fill="none" />
      <path d="M42 44 L58 72 M58 44 L42 72" stroke={t.strokeColor} strokeWidth="2.5" strokeLinecap="round" />
    </>);
  }
  return wrap(t, <>
    <rect x="46" y="55" width="8" height="22" fill={t.strokeWarm} fillOpacity="0.5" />
    <path d="M38 55 Q50 25 62 55" fill={t.strokeColor} fillOpacity="0.35" stroke={t.mainColor} strokeWidth="2" />
  </>);
}

function food(t: Tokens, kind: 'fruit' | 'egg' | 'cheese' | 'cake') {
  if (kind === 'fruit') {
    return wrap(t, <>
      <circle cx="50" cy="56" r="18" fill={t.strokeColor} fillOpacity="0.35" stroke={t.mainColor} strokeWidth="2" className="cv-pulse" />
      <path d="M50 38 V30" stroke={t.strokeWarm} strokeWidth="2" strokeLinecap="round" />
      <path d="M50 30 Q56 24 60 28" stroke={t.strokeColor} strokeWidth="1.5" fill="none" />
    </>);
  }
  if (kind === 'egg') {
    return wrap(t, <>
      <ellipse cx="50" cy="56" rx="16" ry="22" fill={t.fillSoft} fillOpacity="0.3" stroke={t.mainColor} strokeWidth="2.5" className="cv-bob" />
    </>);
  }
  if (kind === 'cheese') {
    return wrap(t, <>
      <path d="M25 68 L45 35 L78 68 Z" fill={t.strokeWarm} fillOpacity="0.4" stroke={t.mainColor} strokeWidth="2" />
      <circle cx="48" cy="55" r="3" fill={t.mainColor} fillOpacity="0.3" />
      <circle cx="58" cy="62" r="2.5" fill={t.mainColor} fillOpacity="0.3" />
    </>);
  }
  return wrap(t, <>
    <rect x="28" y="48" width="44" height="24" rx="4" fill={t.strokeWarm} fillOpacity="0.35" stroke={t.mainColor} strokeWidth="2" />
    <path d="M28 52 H72" stroke={t.mainColor} strokeWidth="1.5" />
  </>);
}

function person(t: Tokens, kind: 'baby' | 'child' | 'army') {
  if (kind === 'baby') {
    return wrap(t, <>
      <circle cx="50" cy="38" r="12" fill={t.fillSoft} fillOpacity="0.3" stroke={t.mainColor} strokeWidth="2" />
      <ellipse cx="50" cy="62" rx="14" ry="16" fill={t.fillSoft} fillOpacity="0.25" stroke={t.mainColor} strokeWidth="2" />
    </>);
  }
  if (kind === 'army') {
    return wrap(t, <>
      {[32, 50, 68].map((x) => (
        <g key={x}>
          <circle cx={x} cy="38" r="6" fill={t.mainColor} />
          <path d={`M${x} 44 V68`} stroke={t.mainColor} strokeWidth="2.5" strokeLinecap="round" />
        </g>
      ))}
    </>);
  }
  return wrap(t, <>
    <circle cx="50" cy="36" r="10" fill={t.mainColor} />
    <path d="M50 46 V72" stroke={t.mainColor} strokeWidth="3" strokeLinecap="round" />
    <path d="M38 56 H62" stroke={t.mainColor} strokeWidth="2.5" strokeLinecap="round" />
  </>);
}

function objectGlyph(t: Tokens, word: string) {
  return wrap(t, <>
    <rect x="22" y="32" width="56" height="40" rx="8" fill={t.fillSoft} fillOpacity="0.1" stroke={t.faintColor} strokeWidth="1.5" />
    {label(t, word, 52)}
    <circle cx="50" cy="48" r="12" stroke={t.strokeColor} strokeWidth="2" fill="none" className="cv-pulse" />
  </>);
}

function renderPicturable(t: Tokens, word: string): ReactNode {
  switch (word) {
    case 'angle': return geoAngle(t);
    case 'circle':
    case 'ring': return geoCircle(t, word === 'ring');
    case 'line':
    case 'rod':
    case 'rail':
    case 'wire':
    case 'thread':
    case 'cord': return geoLine(t);
    case 'square': return geoSquare(t);
    case 'arch': return geoArch(t);
    case 'bridge': return building(t, 'bridge');
    case 'blade': return shapeBlade(t);
    case 'fork': return shapeFork(t);
    case 'hook': return shapeHook(t);
    case 'knot': return shapeKnot(t);
    case 'screw': return shapeScrew(t);
    case 'spring': return shapeSpring(t);
    case 'wheel': return shapeWheel(t);
    case 'drop': return shapeDrop(t);
    case 'flag': return shapeFlag(t);
    case 'frame': return shapeFrame(t);
    case 'bone': return shapeBone(t);
    case 'brick': return shapeBrick(t);
    case 'chain': return shapeChain(t);
    case 'nail':
    case 'pin': return shapeNail(t);
    case 'net': return shapeNet(t);
    case 'stem': return shapePlantPart(t, 'stem');
    case 'stick': return shapePlantPart(t, 'stick');
    case 'root': return shapePlantPart(t, 'root');
    case 'branch': return shapePlantPart(t, 'branch');
    case 'feather': return shapeFeather(t);
    case 'wing': return shapeWing(t);
    case 'tail': return shapeTail(t);
    case 'hair': return shapeHair(t);

    case 'cat':
    case 'dog': return animalQuad(t, word === 'dog' ? 'floppy' : 'point');
    case 'cow':
    case 'pig':
    case 'sheep':
    case 'goat':
    case 'horse':
    case 'rat':
    case 'monkey': return animalQuad(t, 'round');
    case 'bird':
    case 'fowl': return animalBird(t);
    case 'fish': return animalFish(t);
    case 'ant':
    case 'worm': return animalBug(t);
    case 'bee':
    case 'fly': return animalBug(t, true);
    case 'snake': return wrap(t, <path d="M20 60 Q35 35 50 55 T80 45" stroke={t.strokeColor} strokeWidth="3" fill="none" className="cv-flow" />);

    case 'eye': return bodyPart(t, 'eye');
    case 'hand':
    case 'finger':
    case 'thumb': return bodyPart(t, 'hand');
    case 'heart': return bodyPart(t, 'heart');
    case 'head':
    case 'face':
    case 'chin':
    case 'mouth':
    case 'lip':
    case 'nose':
    case 'neck':
    case 'throat':
    case 'tongue':
    case 'tooth': return bodyPart(t, 'head');
    case 'foot':
    case 'toe':
    case 'knee':
    case 'leg': return bodyPart(t, 'foot');
    case 'arm': return bodyPart(t, 'arm');
    case 'chest': return bodyPart(t, 'chest');
    case 'stomach': return bodyPart(t, 'stomach');
    case 'muscle': return bodyPart(t, 'muscle');
    case 'brain': return bodyPart(t, 'brain');
    case 'nerve': return bodyPart(t, 'nerve');
    case 'skin': return bodyPart(t, 'skin');
    case 'ear': return bodyPart(t, 'ear');

    case 'house':
    case 'farm':
    case 'garden':
    case 'island':
    case 'store':
    case 'office':
    case 'school':
    case 'library': return building(t, 'house');
    case 'church':
    case 'hospital':
    case 'station':
    case 'town': return building(t, 'tower');
    case 'prison': return building(t, 'bars');
    case 'wall':
    case 'door':
    case 'window':
    case 'floor':
    case 'drain':
    case 'street': return building(t, 'house');

    case 'boat':
    case 'ship':
    case 'sail': return vehicle(t, 'boat');
    case 'plane': return vehicle(t, 'plane');
    case 'cart':
    case 'carriage': return vehicle(t, 'cart');
    case 'train': return vehicle(t, 'train');

    case 'sun': return nature(t, 'sun');
    case 'moon': return nature(t, 'moon');
    case 'cloud': return nature(t, 'cloud');
    case 'tree': return nature(t, 'tree');
    case 'leaf':
    case 'seed': return nature(t, 'leaf');

    case 'bag':
    case 'box':
    case 'basket':
    case 'basin':
    case 'bucket':
    case 'drawer':
    case 'shelf':
    case 'tray':
    case 'pocket':
    case 'parcel':
    case 'pot':
    case 'plate': return container(t);
    case 'bottle':
    case 'kettle':
    case 'pipe':
    case 'oven': return container(t, true);
    case 'cup': return wrap(t, <>
      <path d="M32 42 H68 V68 Q50 78 32 68 Z" stroke={t.mainColor} strokeWidth="2.5" fill={t.fillSoft} fillOpacity="0.2" />
      <path d="M68 50 H76 Q82 55 76 62 H68" stroke={t.strokeColor} strokeWidth="2" fill="none" />
    </>);

    case 'hammer': return tool(t, 'hammer');
    case 'knife':
    case 'needle': return tool(t, 'knife');
    case 'scissors': return tool(t, 'scissors');
    case 'brush':
    case 'comb':
    case 'whip':
    case 'plough':
    case 'spade': return tool(t, 'brush');

    case 'apple':
    case 'orange':
    case 'berry':
    case 'nut': return food(t, 'fruit');
    case 'egg': return food(t, 'egg');
    case 'cheese':
    case 'potato': return food(t, 'cheese');
    case 'cake': return food(t, 'cake');

    case 'baby': return person(t, 'baby');
    case 'boy':
    case 'girl': return person(t, 'child');
    case 'army': return person(t, 'army');

    case 'hat':
    case 'coat':
    case 'shirt':
    case 'dress':
    case 'skirt':
    case 'sock':
    case 'stocking':
    case 'trousers':
    case 'collar':
    case 'glove':
    case 'shoe':
    case 'boot': return wrap(t, <>
      <path d="M30 62 H70 L64 42 H36 Z" fill={t.fillSoft} fillOpacity="0.2" stroke={t.mainColor} strokeWidth="2.5" />
      {word === 'hat' && <ellipse cx="50" cy="42" rx="22" ry="6" fill={t.strokeColor} fillOpacity="0.35" />}
    </>);

    case 'umbrella': return wrap(t, <>
      <path d="M25 55 Q50 25 75 55" stroke={t.strokeColor} strokeWidth="2.5" fill={t.fillSoft} fillOpacity="0.2" />
      <path d="M50 55 V78" stroke={t.mainColor} strokeWidth="2.5" strokeLinecap="round" />
    </>);

    case 'ball': return geoCircle(t, false);
    case 'bell': return shapeBell(t);
    case 'button': return shapeButton(t);
    case 'bulb': return shapeBulb(t);
    case 'jewel': return shapeJewel(t);
    case 'star': return shapeStar(t);
    case 'book': return wrap(t, <>
      <rect x="30" y="30" width="40" height="48" rx="3" fill={t.fillSoft} fillOpacity="0.2" stroke={t.mainColor} strokeWidth="2.5" />
      <line x1="50" y1="30" x2="50" y2="78" stroke={t.strokeColor} strokeWidth="1.5" />
    </>);
    case 'key': return wrap(t, <>
      <circle cx="38" cy="42" r="10" stroke={t.strokeColor} strokeWidth="2.5" fill="none" />
      <path d="M46 42 H72 M68 38 V46 M62 40 V44" stroke={t.mainColor} strokeWidth="2.5" strokeLinecap="round" />
    </>);
    case 'lock': return wrap(t, <>
      <rect x="34" y="48" width="32" height="28" rx="4" stroke={t.mainColor} strokeWidth="2.5" fill={t.fillSoft} fillOpacity="0.15" />
      <path d="M40 48 V38 A10 10 0 0 1 60 38 V48" stroke={t.mainColor} strokeWidth="2.5" fill="none" />
    </>);
    case 'clock':
    case 'watch': return wrap(t, <>
      <circle cx="50" cy="52" r="22" stroke={t.mainColor} strokeWidth="2.5" fill="none" />
      <path d="M50 52 V38 M50 52 H62" stroke={t.strokeColor} strokeWidth="2" strokeLinecap="round" />
    </>);
    case 'camera': return wrap(t, <>
      <rect x="28" y="40" width="44" height="30" rx="4" stroke={t.mainColor} strokeWidth="2.5" fill={t.fillSoft} fillOpacity="0.15" />
      <circle cx="50" cy="55" r="9" stroke={t.strokeColor} strokeWidth="2" fill="none" />
    </>);
    case 'map':
    case 'card':
    case 'picture':
    case 'receipt':
    case 'ticket':
    case 'stamp':
    case 'match':
    case 'pen':
    case 'pencil': return wrap(t, <>
      <rect x="28" y="32" width="44" height="52" rx="3" stroke={t.mainColor} strokeWidth="2" fill={t.fillSoft} fillOpacity="0.12" />
      <path d="M34 42 H66 M34 52 H58 M34 62 H50" stroke={t.strokeColor} strokeWidth="1.5" strokeLinecap="round" />
    </>);
    case 'bed':
    case 'bath':
    case 'table':
    case 'cushion':
    case 'curtain': return wrap(t, <>
      <rect x="22" y="48" width="56" height="22" rx="3" stroke={t.mainColor} strokeWidth="2.5" fill={t.fillSoft} fillOpacity="0.15" />
      <path d="M22 58 H78" stroke={t.strokeColor} strokeWidth="1.5" />
    </>);
    case 'board': return shapeBoard(t);
    case 'band': return shapeBand(t);
    case 'brake': return shapeBrake(t);
    case 'engine': return shapeEngine(t);
    case 'gun': return shapeGun(t);
    case 'pump': return shapePump(t);
    case 'horn': return shapeHorn(t);
    case 'whistle': return shapeWhistle(t);
    case 'sponge': return shapeSponge(t);
    case 'spoon': return shapeSpoon(t);
    case 'roof': return shapeRoof(t);
    default:
      return objectGlyph(t, word);
  }
}

export function isPicturableWord(word: string): boolean {
  return (PICTURABLE_WORDS as readonly string[]).includes(word);
}

export default function PicturableWordVisual({ type }: { type: string }) {
  const t = conceptVisualTokens();
  return <>{renderPicturable(t, type)}</>;
}
