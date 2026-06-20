/**
 * 850 词 SVG 视觉语义质检 — 判定每词走哪条渲染路径及语义匹配度。
 *
 * fidelity 定义：
 * - dedicated: 每词独立图形或词内分支（operators / grammar / direction / 专属 picturable）
 * - shared-ok: 同桶词语义高度相近（line / rod / wire）
 * - shared-weak: 同域但辨识度低（generals motif、容器类、衣物类）
 * - shared-bad: 图形与词义明显脱节
 * - fallback: 仅文字占位
 */
import { GRAMMAR_WORDS } from '../../src/components/GrammarWordVisual';
import { SUPPORTED_DIRECTION_WORDS } from '../../src/components/DirectionsVisual';
import { PICTURABLE_WORDS } from '../../src/components/concept/PicturableWordVisual';
import { isOperator } from '../../src/data/words850Legacy';
import { getGeneralMotif } from '../../src/data/generalWordMotifs';
import { getQualityMotif } from '../../src/data/qualityWordMotifs';
import { getOppositeMotif } from '../../src/data/oppositeWordMotifs';
import type { Word } from '../../src/types/word';

export type VisualFidelity = 'dedicated' | 'shared-ok' | 'shared-weak' | 'shared-bad' | 'fallback';

export interface WordVisualAuditRow {
  id: string;
  word: string;
  category: Word['category'];
  component: string;
  visualKey: string;
  fidelity: VisualFidelity;
  issue?: string;
}

/** picturable 词 → 视觉键 + 语义评级（与 PicturableWordVisual switch 同步） */
const PICTURABLE_META: Record<string, { key: string; fidelity: VisualFidelity; issue?: string }> = {};

function reg(words: string[], key: string, fidelity: VisualFidelity, issue?: string) {
  for (const w of words) {
    PICTURABLE_META[w] = { key, fidelity, issue };
  }
}

// dedicated / 专属
reg(['angle'], 'geoAngle', 'dedicated');
reg(['circle', 'ring'], 'geoCircle', 'dedicated');
reg(['square'], 'geoSquare', 'dedicated');
reg(['arch'], 'geoArch', 'dedicated');
reg(['bridge'], 'building:bridge', 'dedicated');
reg(['blade', 'fork', 'hook', 'knot', 'screw', 'spring', 'wheel', 'drop', 'flag', 'frame', 'bone', 'brick', 'chain', 'nail', 'pin', 'net'], 'shape:*', 'dedicated');
reg(['stem', 'stick', 'root', 'branch', 'feather', 'wing', 'tail', 'hair'], 'plant/animal-part', 'dedicated');
reg(['snake'], 'snake', 'dedicated');
reg(['cat', 'dog'], 'animalQuad:variant', 'dedicated');
reg(['bird', 'fowl'], 'animalBird', 'shared-ok');
reg(['fish'], 'animalFish', 'dedicated');
reg(['ant', 'worm', 'bee', 'fly'], 'animalBug', 'shared-ok');
reg(['eye', 'hand', 'finger', 'thumb', 'heart', 'arm', 'chest', 'stomach', 'muscle', 'brain', 'nerve', 'skin', 'ear'], 'bodyPart:*', 'dedicated');
reg(['baby', 'boy', 'girl', 'army'], 'person:*', 'dedicated');
reg(['boat', 'ship', 'sail'], 'vehicle:boat', 'shared-ok', '船/帆同图');
reg(['plane'], 'vehicle:plane', 'dedicated');
reg(['cart', 'carriage'], 'vehicle:cart', 'shared-ok');
reg(['train'], 'vehicle:train', 'dedicated');
reg(['sun', 'moon', 'cloud', 'tree', 'leaf', 'seed'], 'nature:*', 'dedicated');
reg(['cup'], 'cup', 'dedicated');
reg(['hammer', 'knife', 'needle', 'scissors'], 'tool:*', 'dedicated');
reg(['apple', 'orange', 'berry', 'nut', 'egg', 'cake'], 'food:*', 'dedicated');
reg(['umbrella', 'book', 'key', 'lock', 'camera'], 'object:*', 'dedicated');
reg(['ball'], 'geoCircle', 'shared-ok', '球体用圆合理');
reg(['bell', 'button', 'bulb', 'jewel', 'star'], 'shape:object', 'dedicated');
reg(['board', 'band', 'brake', 'engine', 'gun', 'pump', 'horn', 'whistle', 'sponge', 'spoon', 'roof'], 'shape:*', 'dedicated');

// shared-ok 线状物
reg(['line', 'rod', 'rail', 'wire', 'thread', 'cord'], 'geoLine', 'shared-ok');

// shared-weak 同形复用
reg(['head', 'face', 'chin', 'mouth', 'lip', 'nose', 'neck', 'throat', 'tongue', 'tooth'], 'bodyPart:head', 'shared-weak', '面部词共用人头');
reg(['foot', 'toe', 'knee', 'leg'], 'bodyPart:foot', 'shared-weak', '下肢词共用');
reg(['cow', 'pig', 'sheep', 'goat', 'horse', 'rat', 'monkey'], 'animalQuad:round', 'shared-weak', '多种动物同形');
reg(['house', 'farm', 'garden', 'island', 'store', 'office', 'school', 'library'], 'building:house', 'shared-weak', '场所共用小房子');
reg(['church', 'hospital', 'station', 'town'], 'building:tower', 'shared-weak', '场所共用塔楼');
reg(['prison'], 'building:bars', 'dedicated');
reg(['wall', 'door', 'window', 'floor', 'drain', 'street'], 'building:house', 'shared-bad', '建筑构件不应是小房子');
reg(['bag', 'box', 'basket', 'basin', 'bucket', 'drawer', 'shelf', 'tray', 'pocket', 'parcel', 'pot', 'plate'], 'container', 'shared-weak', '容器同形');
reg(['bottle', 'kettle', 'pipe', 'oven'], 'container:tall', 'shared-weak', '高容器同形');
reg(['brush', 'comb', 'whip', 'plough', 'spade'], 'tool:brush', 'shared-bad', '工具不应共用刷子');
reg(['cheese'], 'food:cheese', 'dedicated');
reg(['potato'], 'food:cheese', 'shared-bad', '土豆不应是奶酪三角');
reg(['hat', 'coat', 'shirt', 'dress', 'skirt', 'sock', 'stocking', 'trousers', 'collar', 'glove', 'shoe', 'boot'], 'clothing:trapezoid', 'shared-bad', '衣物仅 hat 有区分');
reg(['clock', 'watch'], 'clock', 'shared-weak', '钟表同形');
reg(['map', 'card', 'picture', 'receipt', 'ticket', 'stamp', 'match', 'pen', 'pencil'], 'document', 'shared-weak', '纸质物同形');
reg(['bed', 'bath', 'table', 'cushion', 'curtain'], 'furniture:rect', 'shared-bad', '家具不应同矩形');

// 校验 picturable 列表完整
for (const w of PICTURABLE_WORDS) {
  if (!PICTURABLE_META[w]) {
    PICTURABLE_META[w] = { key: 'objectGlyph', fidelity: 'shared-bad', issue: '未登记，走默认标签圈' };
  }
}

const QUALITY_DEDICATED_BRANCH = new Set([
  'red', 'yellow', 'brown', 'grey', 'black',
  'angry', 'happy',
  'boiling', 'wet',
  'round', 'flat', 'hollow', 'straight', 'parallel', 'open',
  'quick',
  'past', 'present', 'future',
]);

const OPPOSITE_DEDICATED_BRANCH = new Set([
  'red', 'yellow', 'brown', 'grey', 'black', 'blue', 'green', 'white',
  'past', 'present', 'future',
  'left', 'right',
  'hot', 'cold',
]);

export function auditWordVisual(word: Word): WordVisualAuditRow {
  const w = word.word;
  const cat = word.category;

  if (cat === 'operators') {
    return { id: word.id, word: w, category: cat, component: 'OperatorVisual', visualKey: w.toLowerCase(), fidelity: 'dedicated' };
  }

  if (cat === 'actions') {
    if (SUPPORTED_DIRECTION_WORDS.includes(w)) {
      return { id: word.id, word: w, category: cat, component: 'DirectionGraphic', visualKey: w.toLowerCase(), fidelity: 'dedicated' };
    }
    if ((GRAMMAR_WORDS as readonly string[]).includes(w) || !isOperator(w)) {
      return { id: word.id, word: w, category: cat, component: 'GrammarWordVisual', visualKey: w, fidelity: 'dedicated' };
    }
  }

  if (cat === 'picturables') {
    const meta = PICTURABLE_META[w] ?? { key: 'objectGlyph', fidelity: 'shared-bad' as const, issue: '未登记' };
    return {
      id: word.id,
      word: w,
      category: cat,
      component: 'PicturableWordVisual',
      visualKey: meta.key,
      fidelity: meta.fidelity,
      issue: meta.issue,
    };
  }

  if (cat === 'generals') {
    const motif = getGeneralMotif(w);
    return {
      id: word.id,
      word: w,
      category: cat,
      component: 'GeneralWordVisual',
      visualKey: `motif:${motif}`,
      fidelity: motif === 'abstract' ? 'shared-bad' : 'shared-weak',
      issue: motif === 'abstract' ? '抽象兜底标签圈' : `与同属 ${motif} 的其它 general 词同图`,
    };
  }

  if (cat === 'qualities') {
    const motif = getQualityMotif(w);
    const dedicated = QUALITY_DEDICATED_BRANCH.has(w);
    return {
      id: word.id,
      word: w,
      category: cat,
      component: 'QualityWordVisual',
      visualKey: `motif:${motif}`,
      fidelity: dedicated ? 'dedicated' : motif === 'default' ? 'shared-bad' : 'shared-weak',
      issue: dedicated ? undefined : `性质词 motif:${motif} 桶`,
    };
  }

  if (cat === 'opposites') {
    const motif = getOppositeMotif(w);
    const dedicated = OPPOSITE_DEDICATED_BRANCH.has(w);
    return {
      id: word.id,
      word: w,
      category: cat,
      component: 'OppositeWordVisual',
      visualKey: `motif:${motif}`,
      fidelity: dedicated ? 'dedicated' : motif === 'default' ? 'shared-bad' : 'shared-weak',
      issue: dedicated ? undefined : `反义词 motif:${motif} 桶`,
    };
  }

  return {
    id: word.id,
    word: w,
    category: cat,
    component: 'text-fallback',
    visualKey: 'text',
    fidelity: 'fallback',
    issue: '无 SVG 组件',
  };
}

export function summarizeAudit(rows: WordVisualAuditRow[]) {
  const byFidelity: Record<VisualFidelity, number> = {
    dedicated: 0,
    'shared-ok': 0,
    'shared-weak': 0,
    'shared-bad': 0,
    fallback: 0,
  };
  const byCategory: Record<string, Record<VisualFidelity, number>> = {};

  for (const r of rows) {
    byFidelity[r.fidelity]++;
    if (!byCategory[r.category]) {
      byCategory[r.category] = { dedicated: 0, 'shared-ok': 0, 'shared-weak': 0, 'shared-bad': 0, fallback: 0 };
    }
    byCategory[r.category][r.fidelity]++;
  }

  const flagged = rows.filter((r) => r.fidelity === 'shared-bad' || r.fidelity === 'fallback');

  return { total: rows.length, byFidelity, byCategory, flagged };
}
