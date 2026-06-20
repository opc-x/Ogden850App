import type { Word } from '../../src/types/word';

export interface GuideSentenceDraft {
  en: string;
  cn: string;
  context: string;
}

export function buildGuideRepairPrompt(opts: {
  words: Array<{
    word: Word;
    hook?: string;
    issues: string[];
    current?: Array<{ en: string; cn?: string }>;
  }>;
  forbidden?: string[];
}): string {
  const forbiddenBlock = opts.forbidden?.length
    ? `\n## 上次违规词（绝对禁止再出现）\n${[...new Set(opts.forbidden)].join(', ')}\n`
    : '';

  const blocks = opts.words.map((w) => {
    const current = (w.current ?? [])
      .map((s, i) => `  ${i + 1}. EN: ${s.en}\n     CN: ${s.cn ?? '(无)'}`)
      .join('\n');
    return `### ${w.word.word} (${w.word.translation})
- category: ${w.word.category}
- id: ${w.word.id}
- hook: ${w.hook ?? '(无)'}
- 问题: ${w.issues.join('；') || '需重写三条例句'}
${current ? `- 当前例句（有问题的，勿照抄）:\n${current}` : ''}`;
  }).join('\n\n');

  return `你是 Ogden Basic English 850 词教学编剧。为下列单词各写 **恰好 3 条** 英中例句。

## 铁律
1. **英文每个实词必须在 Ogden 850 词表内**（约 850 个基础词）。禁止：bank, trip, into, can, could, happened 等超纲词，除非该词本身就在 850 表中。
2. 常用替代：用 money 代替 dollar；用 cart/train 代替 car；用 house/room 代替 kitchen；用 ill 代替 weak/sore；用 man 代替 men；用 wind and rain 代替 storm；用 give money 代替 pay；用 in 代替 into；用 meeting 代替 party；用 teaching 代替 teacher；数字用 one/two/ten；禁止 God/London 等地名宗教专名。
3. 必须包含目标词（或其 -s 变形）。
4. 三条例句 **语境不同**（陈述 / 疑问 / 祈使，或日常 / 工作 / 抽象），让学习者秒懂。
5. **严禁**模板病句：「I have N.」「Give N to him.」「This N is important.」
6. 可数名词加 a/an/the。
7. 中文自然口语，与英文严格对齐。
8. 每句 4–12 个英文词。

## 范例（account）
{
  "id": "account",
  "sentences": [
    { "en": "I put the money in my account.", "cn": "我把钱存进账户。", "context": "存钱" },
    { "en": "Give an account of this act.", "cn": "说一下这件事的经过。", "context": "说明" },
    { "en": "Is this account true?", "cn": "这个说法是真的吗？", "context": "核实" }
  ]
}
${forbiddenBlock}
## 输出 JSON（仅此结构）
{
  "words": [
    {
      "id": "account",
      "hook": "可选：一句中文秒懂 hook（≤30字，保留原 hook 精华可润色）",
      "sentences": [
        { "en": "...", "cn": "...", "context": "语境标签≤8字" },
        { "en": "...", "cn": "...", "context": "..." },
        { "en": "...", "cn": "...", "context": "..." }
      ]
    }
  ]
}

## 待修复单词

${blocks}`;
}

export function normalizeGuidePartsFromEn(en: string): [string, string][] {
  const tokens = en.match(/[\w']+|[.,!?;:'"]+/g) ?? [];
  return tokens.map((surface) => {
    const bare = surface.toLowerCase().replace(/^[^a-z0-9']+|[^a-z0-9']+$/gi, '');
    let role = 'misc';
    if (!bare) role = 'misc';
    else if (['i', 'you', 'he', 'she', 'it', 'we', 'they', 'who', 'me', 'him', 'her', 'us', 'them'].includes(bare)) role = 'pron';
    else if (['a', 'an', 'the', 'this', 'that', 'some', 'any', 'every', 'all', 'no'].includes(bare)) role = 'det';
    else if (['is', 'are', 'am', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'may', 'might', 'can', 'come', 'go', 'get', 'give', 'make', 'put', 'take', 'see', 'say', 'keep', 'let', 'send', 'seem'].includes(bare)) role = 'op';
    else if (['in', 'on', 'at', 'to', 'from', 'with', 'by', 'for', 'of', 'up', 'down', 'out', 'over', 'under', 'about', 'through', 'between', 'before', 'after'].includes(bare)) role = 'dir';
    else role = 'n';
    return [surface, role];
  });
}
