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

  return `你是英语基础词教学编剧。为下列单词各写 **恰好 3 条** 英中例句。

## 铁律
1. **句子质量优先**：可用基础常用英语词（the, can, into, people 等），不必严格限定 Ogden 850 词表；避免生僻词与专有地名。
2. 必须包含目标词（或其常见变形，如 -s / -ed）。
3. 三条例句 **语境不同**（陈述 / 疑问 / 祈使，或日常 / 工作 / 抽象），让学习者秒懂。
4. **严禁**以下机械模板病句：
   - 「I see a/an X.」「This is a/an X.」「The X is on the table.」（Picturable 填空病句）
   - 「This is a/an X book.」「He is a/an X man.」「It is very X.」
   - 「This side is X.」「It is X, not Y.」「I have N.」「Give N to…」
   - 「This N is important.」「I take N.」「Make N.」
   - 建筑/机构/抽象词（prison, hospital, church 等）禁止「在桌子上」类荒谬搭配
5. 可数名词加 a/an/the；中文自然口语，与英文严格对齐。
6. 每句 4–12 个英文词。

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
