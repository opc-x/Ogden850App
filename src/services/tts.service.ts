/**
 * 词典 / 对话发音
 *
 *  Level 1: 预生成 Sonia Neural MP3（/assets/audio/{word}.mp3）— 跨设备 100% 一致
 *  Level 2: Web Speech API 降级（MP3 缺失时）
 */
import { APP_CONFIG } from '../config';
import { getPreferredVoiceUri } from '../config/ttsVoices';
import { wordToAudioPath, sentenceAudioPath, guideAudioPath } from '../lib/wordAudioPath';

let cachedVoices: SpeechSynthesisVoice[] = [];
let voicesListenerAttached = false;
let iosAudioUnlocked = false;
let currentAudio: HTMLAudioElement | null = null;

const VOICE_PRIORITY: RegExp[] = [
  /microsoft sonia.*natural/i,
  /microsoft sonia/i,
  /\bsonia\b/i,
  /^Google UK English Female$/i,
  /google uk english female/i,
  /libby/i,
  /grandma.*english \(united kingdom\)/i,
  /shelley.*english \(united kingdom\)/i,
  /flo.*english \(united kingdom\)/i,
  /sandy.*english \(united kingdom\)/i,
  /\bkate\b/i,
  /\bserena\b/i,
  /\bmartha\b/i,
  /\bfiona\b/i,
  /\bmoira\b/i,
  /\bsamantha\b/i,
  /\bkaren\b/i,
];

function isMale(name: string): boolean {
  const n = name.toLowerCase();
  if (n.includes('female')) return false;
  if (/\bmale\b/.test(n)) return true;
  return [
    'alex', 'daniel', 'fred', 'david', 'mark', 'james', 'aaron', 'tom',
    'lee', 'ralph', 'bruce', 'rishi', 'nathan', 'guy', 'ryan', 'andrew',
    'gordon', 'arthur', 'eddy', 'grandpa', 'reed', 'rocko', 'albert',
  ].some((m) => n.includes(m));
}

function refreshVoices(): SpeechSynthesisVoice[] {
  if (typeof window === 'undefined' || !window.speechSynthesis) return cachedVoices;
  const v = window.speechSynthesis.getVoices();
  if (v.length > 0) cachedVoices = v;
  return cachedVoices;
}

function ensureVoicesListener(): void {
  if (voicesListenerAttached || typeof window === 'undefined' || !window.speechSynthesis) return;
  voicesListenerAttached = true;
  refreshVoices();
  window.speechSynthesis.addEventListener('voiceschanged', refreshVoices);
}

export function pickSoniaBritishVoice(
  voices: SpeechSynthesisVoice[],
): SpeechSynthesisVoice | undefined {
  const preferredUri = getPreferredVoiceUri();
  if (preferredUri) {
    const preferred = voices.find((v) => v.voiceURI === preferredUri);
    if (preferred) return preferred;
  }

  const pool = voices.filter((v) => !isMale(v.name));
  for (const pattern of VOICE_PRIORITY) {
    const match = pool.find((v) => pattern.test(v.name));
    if (match) return match;
  }
  const enGb = pool.filter((v) => v.lang.toLowerCase().startsWith('en-gb'));
  return enGb[0];
}

function isIOSDevice(): boolean {
  if (typeof navigator === 'undefined') return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as Window & { MSStream?: unknown }).MSStream;
}

/** 须在用户点击的同步调用栈内执行 */
function speakBrowserSync(text: string): void {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;
  ensureVoicesListener();
  const synth = window.speechSynthesis;

  // iOS 首次需静音 unlock；勿 cancel，否则后续 speak 会被吞
  if (isIOSDevice() && !iosAudioUnlocked) {
    iosAudioUnlocked = true;
    const unlock = new SpeechSynthesisUtterance('\u00a0');
    unlock.volume = 0.01;
    synth.speak(unlock);
  }

  if (synth.paused) synth.resume();
  if (synth.speaking) synth.cancel();

  const voices = refreshVoices();
  const u = new SpeechSynthesisUtterance(text);
  const voice = pickSoniaBritishVoice(voices);
  if (voice) {
    u.voice = voice;
    u.lang = voice.lang;
  } else {
    u.lang = 'en-GB';
  }
  u.rate = APP_CONFIG.TTS.SPEECH_RATE;
  u.volume = 1;
  synth.speak(u);
}

function stopAudio(): void {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio = null;
  }
}

/** 播放 Sonia Neural MP3；失败则 Web Speech 降级（须在用户手势内发起 play） */
function playMp3(url: string, fallbackText: string): void {
  stopAudio();
  if (typeof window !== 'undefined' && window.speechSynthesis?.speaking) {
    window.speechSynthesis.cancel();
  }

  const audio = new Audio(url);
  audio.preload = 'auto';
  currentAudio = audio;
  audio.play().catch(() => speakBrowserSync(fallbackText));
}

/**
 * 单词详情例句：播放预生成本地 MP3（public/assets/audio/guides/{wordId}-{idx}.mp3）。
 * 与词卡 playSpeech 模式完全一致；文件缺失时 Web Speech 降级。
 * 须在用户点击的同步调用栈内调用。
 */
function playGuideSentenceAudio(wordId: string, index: number, text: string): void {
  const t = text.trim();
  if (!t) return;
  playMp3(guideAudioPath(wordId, index), t);
}

export const TTSService = {
  isSupported(): boolean {
    return typeof window !== 'undefined' && ('Audio' in window || 'speechSynthesis' in window);
  },

  warmupVoices(): void {
    ensureVoicesListener();
  },

  resolvedVoiceName(): string {
    return 'en-GB-SoniaNeural (MP3)';
  },

  stop(): void {
    stopAudio();
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  },

  /** 850 词：优先本地 Sonia MP3；须在用户点击同步栈内调用 */
  playSpeech(text: string): void {
    const t = text.trim();
    if (!t) return;
    playMp3(wordToAudioPath(t), t);
  },

  /** 句子：/audio/sentences/{id}.mp3，无 id 则 Web Speech */
  playSentence(text: string, sentenceId?: number | string): void {
    const t = text.trim();
    if (!t) return;
    if (sentenceId != null) {
      playMp3(sentenceAudioPath(sentenceId), t);
    } else {
      speakBrowserSync(t);
    }
  },

  /**
   * 单词详情例句：本地预生成 MP3（scripts/generate-guide-audio.ts 产物），
   * 文件不存在时 Web Speech 降级。
   */
  playGuideSentence(wordId: string, index: number, text: string): void {
    playGuideSentenceAudio(wordId, index, text);
  },

  playSpeechAsync(text: string): Promise<void> {
    this.playSpeech(text);
    return Promise.resolve();
  },

  fallbackToBrowserTTS(text: string): void {
    speakBrowserSync(text);
  },
};

export const pickCrossPlatformFemaleVoice = pickSoniaBritishVoice;
export const pickDictionaryVoice = pickSoniaBritishVoice;
