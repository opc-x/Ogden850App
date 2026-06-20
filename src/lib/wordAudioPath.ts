/** 与 ogden-basic-english-omega 生产站一致的 MP3 路径规则 */
const PROD_AUDIO_BASE = '/assets/audio';

/** 美式 → 英式（生产站 MP3 用英式文件名） */
const AMERICAN_TO_BRITISH: Record<string, string> = {
  behavior: 'behaviour',
  color: 'colour',
  harbor: 'harbour',
  humor: 'humour',
};

export function wordToAudioSlug(word: string): string {
  const w = AMERICAN_TO_BRITISH[word.toLowerCase()] ?? word;
  return w
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60) || 'word';
}

export function wordToAudioPath(word: string): string {
  return `${PROD_AUDIO_BASE}/${wordToAudioSlug(word)}.mp3`;
}

/** 场景对话 / 拼词造句 — 与生产站一致 */
export function sentenceAudioPath(sentenceId: number | string): string {
  return `/audio/sentences/${sentenceId}.mp3`;
}

/** 单词详情「绝佳搭配例句」— 与生产站 ogden-basic-english-omega 一致 */
export function guideAudioPath(wordId: string, index: number): string {
  const slug = wordId.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  return `${PROD_AUDIO_BASE}/guides/${slug}-${index}.mp3`;
}

export const PROD_AUDIO_ORIGIN = 'https://ogden-basic-english-omega.vercel.app';

export function prodAudioUrl(word: string): string {
  return `${PROD_AUDIO_ORIGIN}${wordToAudioPath(word)}`;
}

export function prodGuideAudioUrl(wordId: string, index: number): string {
  return `${PROD_AUDIO_ORIGIN}${guideAudioPath(wordId, index)}`;
}

export function prodSentenceAudioUrl(sentenceId: number | string): string {
  return `${PROD_AUDIO_ORIGIN}${sentenceAudioPath(sentenceId)}`;
}
