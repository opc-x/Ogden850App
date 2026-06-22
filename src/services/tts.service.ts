/**
 * 词典 / 对话发音 — 仅 Sonia Neural 预录 MP3（本地 → CDN），无 Web Speech 降级。
 */
import {
  guideAudioPath,
  prodAudioUrl,
  prodGuideAudioUrl,
  prodSentenceAudioUrl,
  sentenceAudioPath,
  wordToAudioPath,
} from '../lib/wordAudioPath';

let currentAudio: HTMLAudioElement | null = null;

function dispatchAudioLifecycle(phase: 'start' | 'end'): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(`ogden:audio-${phase}`));
}

export type AudioMissingKind = 'word' | 'guide' | 'sentence';

export interface AudioMissingDetail {
  kind: AudioMissingKind;
  text: string;
  urls: string[];
  wordId?: string;
  index?: number;
  sentenceId?: number | string;
}

function stopAudio(): void {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.onplaying = null;
    currentAudio.onended = null;
    currentAudio = null;
    dispatchAudioLifecycle('end');
  }
}

function isPlayableAudioDuration(duration: number): boolean {
  return Number.isFinite(duration) && duration > 0;
}

function reportMissingAudio(detail: AudioMissingDetail): void {
  console.warn('[TTS] Sonia MP3 not found — no Web Speech fallback:', detail);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('ogden:audio-missing', { detail }));
  }
}

/** 播放 Sonia MP3 链（须在用户手势内发起 play） */
function playMp3(
  urls: string[],
  missing: Omit<AudioMissingDetail, 'urls'>,
): void {
  if (!urls.length) {
    reportMissingAudio({ ...missing, urls: [] });
    return;
  }

  stopAudio();

  let cursor = 0;

  const tryNext = (): void => {
    if (cursor >= urls.length) {
      reportMissingAudio({ ...missing, urls });
      return;
    }

    const url = urls[cursor++];
    const audio = new Audio(url);
    audio.preload = 'auto';
    currentAudio = audio;

    let settled = false;
    const fail = (): void => {
      if (settled) return;
      settled = true;
      audio.onerror = null;
      audio.onloadedmetadata = null;
      audio.pause();
      tryNext();
    };

    audio.onerror = fail;
    audio.onplaying = () => {
      if (currentAudio !== audio) return;
      dispatchAudioLifecycle('start');
    };
    audio.onended = () => {
      if (currentAudio !== audio) return;
      currentAudio = null;
      dispatchAudioLifecycle('end');
    };
    // 生产站 SPA 对缺失 MP3 会 200 返回 HTML，onerror 不触发
    audio.onloadedmetadata = () => {
      if (!isPlayableAudioDuration(audio.duration)) fail();
    };
    audio.play().catch(fail);
  };

  tryNext();
}

function playGuideSentenceAudio(wordId: string, index: number, text: string): void {
  const t = text.trim();
  if (!t) return;
  playMp3(
    [guideAudioPath(wordId, index), prodGuideAudioUrl(wordId, index)],
    { kind: 'guide', text: t, wordId, index },
  );
}

export const TTSService = {
  isSupported(): boolean {
    return typeof window !== 'undefined' && 'Audio' in window;
  },

  resolvedVoiceName(): string {
    return 'en-GB-SoniaNeural (MP3)';
  },

  stop(): void {
    stopAudio();
  },

  /** 850 词：本地 Sonia MP3 → CDN；须在用户点击同步栈内调用 */
  playSpeech(text: string): void {
    const t = text.trim();
    if (!t) return;
    playMp3([wordToAudioPath(t), prodAudioUrl(t)], { kind: 'word', text: t });
  },

  /** 场景对话句：/audio/sentences/{id}.mp3 → CDN；与 guide 例句同为 Sonia Neural 预录 */
  playSentence(text: string, sentenceId?: number | string): void {
    const t = text.trim();
    if (!t) return;
    if (sentenceId == null) {
      reportMissingAudio({ kind: 'sentence', text: t, urls: [] });
      return;
    }
    playMp3(
      [sentenceAudioPath(sentenceId), prodSentenceAudioUrl(sentenceId)],
      { kind: 'sentence', text: t, sentenceId },
    );
  },

  /** 单词详情例句：guides/{wordId}-{idx}.mp3 → CDN */
  playGuideSentence(wordId: string, index: number, text: string): void {
    playGuideSentenceAudio(wordId, index, text);
  },

  playSpeechAsync(text: string): Promise<void> {
    this.playSpeech(text);
    return Promise.resolve();
  },
};
