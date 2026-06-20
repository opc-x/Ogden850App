/**
 * TTS 音色配置 — 浏览器 Web Speech API
 *
 * CHROME_MAC_CATALOG：2026-06 Mac + Chrome 实测可用列表（静态参考）
 * 运行时以 speechSynthesis.getVoices() 为准；试听页 /voice-audit 可逐个点播对比
 */

export const TTS_VOICE_STORAGE_KEY = 'ogden_preferred_voice_uri';

/** 试听对比用长句（含 come / look / word 等 Ogden 常用词） */
export const TTS_SAMPLE_SENTENCE =
  'Please come here and look at this word carefully. ' +
  'I want you to hear every sound clearly, from the first syllable to the last, ' +
  'spoken slowly and with gentle stress on each important part.';

export type VoiceCatalogEntry = {
  name: string;
  lang: string;
  isDefault?: boolean;
  gender?: 'female' | 'male' | 'neutral' | 'unknown';
  note?: string;
};

/** Mac Chrome 实测音色（用户 2026-06-20 导出） */
export const CHROME_MAC_CATALOG: VoiceCatalogEntry[] = [
  { name: 'Samantha', lang: 'en-US', isDefault: true, gender: 'female' },
  { name: 'Albert', lang: 'en-US', gender: 'male' },
  { name: 'Daniel', lang: 'en-GB', gender: 'male', note: '⚠️ 仅设 lang=en-GB 时 Mac 常默认此男声' },
  { name: 'Karen', lang: 'en-AU', gender: 'female' },
  { name: 'Moira', lang: 'en-IE', gender: 'female' },
  { name: 'Tessa', lang: 'en-ZA', gender: 'female' },
  { name: 'Google US English', lang: 'en-US', gender: 'neutral' },
  { name: 'Google UK English Female', lang: 'en-GB', gender: 'female', note: '★ Mac Chrome 推荐英式女声' },
  { name: 'Google UK English Male', lang: 'en-GB', gender: 'male' },
  { name: 'Flo (English (United Kingdom))', lang: 'en-GB', gender: 'female' },
  { name: 'Grandma (English (United Kingdom))', lang: 'en-GB', gender: 'female' },
  { name: 'Shelley (English (United Kingdom))', lang: 'en-GB', gender: 'female' },
  { name: 'Sandy (English (United Kingdom))', lang: 'en-GB', gender: 'female' },
  { name: 'Eddy (English (United Kingdom))', lang: 'en-GB', gender: 'male' },
  { name: 'Grandpa (English (United Kingdom))', lang: 'en-GB', gender: 'male' },
  { name: 'Reed (English (United Kingdom))', lang: 'en-GB', gender: 'male' },
  { name: 'Rocko (English (United Kingdom))', lang: 'en-GB', gender: 'male' },
];

export function getPreferredVoiceUri(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TTS_VOICE_STORAGE_KEY);
}

export function setPreferredVoiceUri(voiceURI: string): void {
  localStorage.setItem(TTS_VOICE_STORAGE_KEY, voiceURI);
}

export function clearPreferredVoiceUri(): void {
  localStorage.removeItem(TTS_VOICE_STORAGE_KEY);
}

export function findCatalogEntry(name: string): VoiceCatalogEntry | undefined {
  return CHROME_MAC_CATALOG.find((e) => e.name === name);
}
