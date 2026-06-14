/**
 * Ogden Basic English 850 词表数据。
 * 词与分类来自 02-vocabulary/words-ogden-order.md（Ogden 原序五类）。
 * 音标(ipa)/中文(cn)/知识链接(link) 为本站整理，分层逐步补全。
 * 发音：预生成 en-GB-SoniaNeural MP3（02-vocabulary/audio）。
 */

import ANNOTATIONS from "./word-annotations.json" with { type: "json" };

const SPELLING_ALIASES: Record<string, string> = {
  behavior: "behaviour",
  color: "colour",
  harbor: "harbour",
  humor: "humour",
};

const BRITISH_TO_AMERICAN = Object.fromEntries(
  Object.entries(SPELLING_ALIASES).map(([am, br]) => [br, am]),
) as Record<string, string>;

/** URL / 搜索用的词形 → 词表 canonical w */
export function normalizeWordKey(input: string): string {
  const w = decodeURIComponent(input).trim();
  if (w.toLowerCase() === "i") return "I";
  return BRITISH_TO_AMERICAN[w] ?? w;
}

function resolveAnnotationKey(word: string): string {
  return SPELLING_ALIASES[word] ?? word;
}

export type Tier = "ops" | "pic" | "things" | "qual" | "opp";

export type Word = {
  w: string;
  t: Tier;
  ipa?: string;
  cn?: string;
  img?: string;
  link?: string; // 相关知识页 slug
};

export const TIER_META: Record<
  Tier,
  { name: string; en: string; count: number; color: string; hint: string }
> = {
  ops:    { name: "运作词",    en: "Operations",     count: 100, color: "#b45309", hint: "造句骨架 · 最先学" },
  pic:    { name: "看得见的物", en: "Picturable",     count: 200, color: "#15803d", hint: "具体名词 · 最易记" },
  things: { name: "抽象的物",   en: "General things", count: 400, color: "#1d6fa5", hint: "抽象名词 · 最大块" },
  qual:   { name: "性质词",    en: "Qualities",      count: 100, color: "#7e22ce", hint: "形容词" },
  opp:    { name: "反义词",    en: "Opposites",      count: 50,  color: "#be123c", hint: "成对记" },
};

export const OPERATOR_WORDS = [
  "come", "get", "give", "go", "keep", "let", "make", "put", "seem", "take",
  "be", "do", "have", "say", "see", "send", "may", "will",
] as const;

const OPERATORS = new Set<string>(OPERATOR_WORDS);

export function isOperator(w: string): boolean {
  return OPERATORS.has(w);
}

/** 第 1 类 · Operations（音标+中文已配齐） */
const OPS_RAW: { w: string; ipa: string; cn: string }[] = [
  { w: "come", ipa: "kʌm", cn: "来 (移向观察点)" },
  { w: "get", ipa: "ɡet", cn: "得 (获取/进入状态)" },
  { w: "give", ipa: "ɡɪv", cn: "给 (向外传递所有权)" },
  { w: "go", ipa: "ɡəʊ", cn: "去 (移离观察点)" },
  { w: "keep", ipa: "kiːp", cn: "保持 (留在空间/状态边界内)" },
  { w: "let", ipa: "let", cn: "让 (撤销屏障放行)" },
  { w: "make", ipa: "meɪk", cn: "做/造 (塑造原材料产出新物)" },
  { w: "put", ipa: "pʊt", cn: "放 (松手放下并安置)" },
  { w: "seem", ipa: "siːm", cn: "似乎 (呈现虚像/看似)" },
  { w: "take", ipa: "teɪk", cn: "拿 (伸手抓取并移位)" },
  { w: "be", ipa: "biː", cn: "是/在 (处于静止原点)" },
  { w: "do", ipa: "duː", cn: "做/执行 (关注过程的动作)" },
  { w: "have", ipa: "hæv", cn: "有/持有 (占有并包含在线框内)" },
  { w: "say", ipa: "seɪ", cn: "说 (单向发声传播)" },
  { w: "see", ipa: "siː", cn: "看/明白 (接收光线进入眼睛)" },
  { w: "send", ipa: "send", cn: "送 (借助外力远程传递)" },
  { w: "may", ipa: "meɪ", cn: "可以/也许 (可能性分支/许可)" },
  { w: "will", ipa: "wɪl", cn: "将/愿意 (指向未来的主观推力)" },
  { w: "about", ipa: "əˈbaʊt", cn: "在……周围/围绕；关于 (抽象)" },
  { w: "across", ipa: "əˈkrɒs", cn: "横过/跨越表面" },
  { w: "after", ipa: "ˈæftə", cn: "在……后面 (空间/时间)；在……之后" },
  { w: "against", ipa: "əˈɡenst", cn: "靠着/逆着 (物理力学)；反对" },
  { w: "among", ipa: "əˈmʌŋ", cn: "在……群中/环绕之中 (三者及以上)" },
  { w: "at", ipa: "æt", cn: "在点上 / 在 (特定时空点)" },
  { w: "before", ipa: "bɪˈfɔː", cn: "在……前面 (空间/时间)；在……之前" },
  { w: "between", ipa: "bɪˈtwiːn", cn: "在 (两者) 之间 / 处于间隔中" },
  { w: "by", ipa: "baɪ", cn: "靠近 / 沿旁 (物理位置)；由 / 通过 (手段/施动者)" },
  { w: "down", ipa: "daʊn", cn: "向下 (空间位移)" },
  { w: "from", ipa: "frɒm", cn: "来自/起点 (空间/时间源头)" },
  { w: "in", ipa: "ɪn", cn: "在……里/处于容器中 (空间/状态)" },
  { w: "off", ipa: "ɒf", cn: "离开/脱离接触 (物理脱离)" },
  { w: "on", ipa: "ɒn", cn: "在……上/接触表面 (物理支撑)" },
  { w: "over", ipa: "ˈəʊvə", cn: "在……正上方/越过上方 (无接触空间)" },
  { w: "through", ipa: "θruː", cn: "穿过/通过通道 (三维穿透)" },
  { w: "to", ipa: "tuː", cn: "向/到 (指向目标点)" },
  { w: "under", ipa: "ˈʌndə", cn: "在……正下方 (空间)" },
  { w: "up", ipa: "ʌp", cn: "向上 (空间位移)" },
  { w: "with", ipa: "wɪð", cn: "和……一起 / 伴随 (物理/状态)；用 / 带有" },
  { w: "as", ipa: "æz", cn: "作为；像 / 如同" },
  { w: "for", ipa: "fɔː", cn: "为了；换取" },
  { w: "of", ipa: "ɒv", cn: "的 / 属于；关联" },
  { w: "till", ipa: "tɪl", cn: "直到 (时间点)" },
  { w: "than", ipa: "ðæn", cn: "比 / 相比于" },
  { w: "a", ipa: "ə", cn: "一个 (非特指)" },
  { w: "the", ipa: "ðə", cn: "这/那 (定冠词特指)" },
  { w: "all", ipa: "ɔːl", cn: "全部/所有" },
  { w: "any", ipa: "ˈeni", cn: "任何" },
  { w: "every", ipa: "ˈevri", cn: "每个" },
  { w: "little", ipa: "ˈlɪtl", cn: "少/小" },
  { w: "much", ipa: "mʌtʃ", cn: "多" },
  { w: "no", ipa: "nəʊ", cn: "没有/不" },
  { w: "other", ipa: "ˈʌðə", cn: "其他的/另外的" },
  { w: "some", ipa: "sʌm", cn: "一些" },
  { w: "such", ipa: "sʌtʃ", cn: "这样的/如此的" },
  { w: "that", ipa: "ðæt", cn: "那个/那" },
  { w: "this", ipa: "ðɪs", cn: "这个/这" },
  { w: "I", ipa: "aɪ", cn: "我" },
  { w: "he", ipa: "hiː", cn: "他" },
  { w: "you", ipa: "juː", cn: "你/你们" },
  { w: "who", ipa: "huː", cn: "谁" },
  { w: "and", ipa: "ænd", cn: "和/并且" },
  { w: "because", ipa: "bɪˈkɒz", cn: "因为" },
  { w: "but", ipa: "bʌt", cn: "但是" },
  { w: "or", ipa: "ɔː", cn: "或者" },
  { w: "if", ipa: "ɪf", cn: "如果" },
  { w: "though", ipa: "ðəʊ", cn: "虽然/尽管" },
  { w: "while", ipa: "waɪl", cn: "当……时 / 在……期间" },
  { w: "how", ipa: "haʊ", cn: "如何/怎样" },
  { w: "when", ipa: "wen", cn: "何时/当……时" },
  { w: "where", ipa: "weə", cn: "哪里" },
  { w: "why", ipa: "waɪ", cn: "为什么" },
  { w: "again", ipa: "əˈɡen", cn: "再次/重新" },
  { w: "ever", ipa: "ˈevə", cn: "曾经/任何时候" },
  { w: "far", ipa: "fɑː", cn: "远/遥远" },
  { w: "forward", ipa: "ˈfɔːwəd", cn: "向前" },
  { w: "here", ipa: "hɪə", cn: "这里" },
  { w: "near", ipa: "nɪə", cn: "近/靠近" },
  { w: "now", ipa: "naʊ", cn: "现在" },
  { w: "out", ipa: "aʊt", cn: "向外/外面" },
  { w: "still", ipa: "stɪl", cn: "仍然/静止的" },
  { w: "then", ipa: "ðen", cn: "那时/然后" },
  { w: "there", ipa: "ðeə", cn: "那里" },
  { w: "together", ipa: "təˈɡeðə", cn: "一起/共同" },
  { w: "well", ipa: "wel", cn: "好/井" },
  { w: "almost", ipa: "ˈɔːlməʊst", cn: "几乎/差不多" },
  { w: "enough", ipa: "ɪˈnʌf", cn: "足够" },
  { w: "even", ipa: "ˈiːvn", cn: "甚至/平坦的" },
  { w: "not", ipa: "nɒt", cn: "不/非" },
  { w: "only", ipa: "ˈəʊnli", cn: "仅仅/只有" },
  { w: "quite", ipa: "kwaɪt", cn: "相当/完全" },
  { w: "so", ipa: "səʊ", cn: "如此/所以" },
  { w: "very", ipa: "ˈveri", cn: "非常/正是" },
  { w: "tomorrow", ipa: "təˈmɒrəʊ", cn: "明天" },
  { w: "yesterday", ipa: "ˈjestədeɪ", cn: "昨天" },
  { w: "north", ipa: "nɔːθ", cn: "北" },
  { w: "south", ipa: "saʊθ", cn: "南" },
  { w: "east", ipa: "iːst", cn: "东" },
  { w: "west", ipa: "west", cn: "西" },
  { w: "please", ipa: "pliːz", cn: "请/使高兴" },
  { w: "yes", ipa: "jes", cn: "是的/是" },
];

const OPS: Word[] = OPS_RAW.map((x) => ({
  ...x,
  t: "ops",
  link: OPERATORS.has(x.w) ? "operators" : "directions",
}));

/** 第 3 类 · Picturable（200）— 词表，音标/中文后续补全 */
const PIC_WORDS =
  "angle, ant, apple, arch, arm, army, baby, bag, ball, band, basin, basket, bath, bed, bee, bell, berry, bird, blade, board, boat, bone, book, boot, bottle, box, boy, brain, brake, branch, brick, bridge, brush, bucket, bulb, button, cake, camera, card, cart, carriage, cat, chain, cheese, chest, chin, church, circle, clock, cloud, coat, collar, comb, cord, cow, cup, curtain, cushion, dog, door, drain, drawer, dress, drop, ear, egg, engine, eye, face, farm, feather, finger, fish, flag, floor, fly, foot, fork, fowl, frame, garden, girl, glove, goat, gun, hair, hammer, hand, hat, head, heart, hook, horn, horse, hospital, house, island, jewel, kettle, key, knee, knife, knot, leaf, leg, library, line, lip, lock, map, match, monkey, moon, mouth, muscle, nail, neck, needle, nerve, net, nose, nut, office, orange, oven, parcel, pen, pencil, picture, pig, pin, pipe, plane, plate, plough, pocket, pot, potato, prison, pump, rail, rat, receipt, ring, rod, roof, root, sail, school, scissors, screw, seed, sheep, shelf, ship, shirt, shoe, skin, skirt, snake, sock, spade, sponge, spoon, spring, square, stamp, star, station, stem, stick, stocking, stomach, store, street, sun, table, tail, thread, throat, thumb, ticket, toe, tongue, tooth, town, train, tray, tree, trousers, umbrella, wall, watch, wheel, whip, whistle, window, wing, wire, worm";

/** 第 2 类 · General things（400） */
const THINGS_WORDS =
  "account, act, addition, adjustment, advertisement, agreement, air, amount, amusement, animal, answer, apparatus, approval, argument, art, attack, attempt, attention, attraction, authority, back, balance, base, behavior, belief, birth, bit, bite, blood, blow, body, brass, bread, breath, brother, building, burn, burst, business, butter, canvas, care, cause, chalk, chance, change, cloth, coal, color, comfort, committee, company, comparison, competition, condition, connection, control, cook, copper, copy, cork, cotton, cough, country, cover, crack, credit, crime, crush, cry, current, curve, damage, danger, daughter, day, death, debt, decision, degree, design, desire, destruction, detail, development, digestion, direction, discovery, discussion, disease, disgust, distance, distribution, division, doubt, drink, driving, dust, earth, edge, education, effect, end, error, event, example, exchange, existence, expansion, experience, expert, fact, fall, family, father, fear, feeling, fiction, field, fight, fire, flame, flight, flower, fold, food, force, form, friend, front, fruit, glass, gold, government, grain, grass, grip, group, growth, guide, harbor, harmony, hate, hearing, heat, help, history, hole, hope, hour, humor, ice, idea, impulse, increase, industry, ink, insect, instrument, insurance, interest, invention, iron, jelly, join, journey, judge, jump, kick, kiss, knowledge, land, language, laugh, law, lead, learning, leather, letter, level, lift, light, limit, linen, liquid, list, look, loss, love, machine, man, manager, mark, market, mass, meal, measure, meat, meeting, memory, metal, middle, milk, mind, mine, minute, mist, money, month, morning, mother, motion, mountain, move, music, name, nation, need, news, night, noise, note, number, observation, offer, oil, operation, opinion, order, organization, ornament, owner, page, pain, paint, paper, part, paste, payment, peace, person, place, plant, play, pleasure, point, poison, polish, porter, position, powder, power, price, print, process, produce, profit, property, prose, protest, pull, punishment, purpose, push, quality, question, rain, range, rate, ray, reaction, reading, reason, record, regret, relation, religion, representative, request, respect, rest, reward, rhythm, rice, river, road, roll, room, rub, rule, run, salt, sand, scale, science, sea, seat, secretary, selection, self, sense, servant, sex, shade, shake, shame, shock, side, sign, silk, silver, sister, size, sky, sleep, slip, slope, smash, smell, smile, smoke, sneeze, snow, soap, society, son, song, sort, sound, soup, space, stage, start, statement, steam, steel, step, stitch, stone, stop, story, stretch, structure, substance, sugar, suggestion, summer, support, surprise, swim, system, talk, taste, tax, teaching, tendency, test, theory, thing, thought, thunder, time, tin, top, touch, trade, transport, trick, trouble, turn, twist, unit, use, value, verse, vessel, view, voice, walk, war, wash, waste, water, wave, wax, way, weather, week, weight, wind, wine, winter, woman, wood, wool, word, work, wound, writing, year";

/** 第 4 类 · Qualities（100） */
const QUAL_WORDS =
  "able, acid, angry, automatic, beautiful, black, boiling, bright, broken, brown, cheap, chemical, chief, clean, clear, common, complex, conscious, cut, deep, dependent, early, elastic, electric, equal, fat, fertile, first, fixed, flat, free, frequent, full, general, good, great, grey, hanging, happy, hard, healthy, high, hollow, important, kind, like, living, long, male, married, material, medical, military, natural, necessary, new, normal, open, parallel, past, physical, political, poor, possible, present, private, probable, quick, quiet, ready, red, regular, responsible, right, round, same, second, separate, serious, sharp, smooth, sticky, stiff, straight, strong, sudden, sweet, tall, thick, tight, tired, true, violent, waiting, warm, wet, wide, wise, yellow, young";

/** 第 5 类 · Opposites（50） */
const OPP_WORDS =
  "awake, bad, bent, bitter, blue, certain, cold, complete, cruel, dark, dead, dear, delicate, different, dirty, dry, false, feeble, female, foolish, future, green, ill, last, late, left, loose, loud, low, mixed, narrow, old, opposite, public, rough, sad, safe, secret, short, shut, simple, slow, small, soft, solid, special, strange, thin, white, wrong";

const split = (s: string, t: Tier): Word[] =>
  s.split(",").map((w) => ({ w: w.trim(), t }));

const BASE_WORDS: Word[] = [
  ...OPS,
  ...split(PIC_WORDS, "pic"),
  ...split(THINGS_WORDS, "things"),
  ...split(QUAL_WORDS, "qual"),
  ...split(OPP_WORDS, "opp"),
];

const ANNOTATIONS_DATA = ANNOTATIONS as Record<string, { ipa?: string; cn?: string; img?: string }>;

function mergeAnnotation(word: Word): Word {
  const extra = ANNOTATIONS_DATA[resolveAnnotationKey(word.w)];
  if (!extra) return word;
  return {
    ...word,
    ipa: word.ipa ?? extra.ipa,
    cn: word.cn ?? extra.cn,
    img: word.img ?? extra.img,
  };
}

export const WORDS: Word[] = BASE_WORDS.map(mergeAnnotation);

const WORD_MAP = new Map(WORDS.map((w) => [w.w, w]));

export function getWord(w: string): Word | undefined {
  return WORD_MAP.get(normalizeWordKey(w));
}

/** 已配齐音标（英式 IPA）的词数 */
export const ANNOTATED_COUNT = WORDS.filter((w) => w.ipa).length;
