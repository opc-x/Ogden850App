/** 发音：预生成 MP3 优先；句子用有道英音真人声；最后才回退浏览器 TTS */
import { WORDS } from "./words850";
import { APP_CONFIG } from "../config";

const AUDIO_BASE = "/audio";
const VOICE_ID = "en-GB-SoniaNeural";
const YOUDAO_BRITISH = 1;

const CORE_WORDS = new Set(WORDS.map((w) => w.w.toLowerCase()));

let currentAudio: HTMLAudioElement | null = null;

function slug(word: string): string {
  const s = word.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return s.slice(0, 60) || "word";
}

export function audioUrl(word: string): string {
  return `${AUDIO_BASE}/${slug(word)}.mp3`;
}

function stop(): void {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio = null;
  }
  if (typeof window !== "undefined" && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
}

// Pre-trigger voice loading at bundle load time to avoid async delay on Safari
if (typeof window !== "undefined" && window.speechSynthesis) {
  window.speechSynthesis.getVoices();
  window.speechSynthesis.onvoiceschanged = () => {
    window.speechSynthesis.getVoices();
    window.speechSynthesis.onvoiceschanged = null;
  };
}

function pickBritishVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | undefined {
  const gb = voices.filter((v) => /^en-GB/i.test(v.lang));
  return (
    gb.find((v) => /sonia/i.test(v.name)) ??
    gb.find((v) => /kate|serena|martha|fiona|female/i.test(v.name)) ??
    gb[0] ??
    voices.find((v) => /^en-GB/i.test(v.lang))
  );
}

function youdaoUrl(text: string, type = YOUDAO_BRITISH): string {
  return `${APP_CONFIG.TTS.YOUDAO_TTS_BASE_URL}?audio=${encodeURIComponent(text)}&type=${type}`;
}

function speakWithYoudao(text: string): Promise<void> {
  return playMp3(youdaoUrl(text)).catch(() => {
    speakWithBrowser(text);
  });
}
function speakWithBrowser(text: string): void {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "en-GB";
  u.rate = 0.92;
  const voices = window.speechSynthesis.getVoices();
  const voice = pickBritishVoice(voices);
  if (voice) u.voice = voice;
  window.speechSynthesis.speak(u);
}

function playMp3(url: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const audio = new Audio(url);
    currentAudio = audio;
    audio.preload = "auto";
    const done = () => {
      audio.removeEventListener("ended", done);
      resolve();
    };
    audio.addEventListener("ended", done);
    audio.onerror = () => reject(new Error("audio error"));
    audio.play().catch(reject);
  });
}

export function isSpeechSupported(): boolean {
  return typeof window !== "undefined" && ("Audio" in window || "speechSynthesis" in window);
}

export function hasSoniaAudio(word: string): Promise<boolean> {
  const normalized = word.trim().toLowerCase();
  return Promise.resolve(CORE_WORDS.has(normalized));
}

export function speak(word: string): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  stop();
  const normalized = word.trim().toLowerCase();
  if (CORE_WORDS.has(normalized)) {
    return playMp3(audioUrl(normalized)).catch(() => {
      speakWithBrowser(word);
    });
  }
  speakWithBrowser(word);
  return Promise.resolve();
}

export function hasSentenceAudio(text: string, sentenceId?: number): Promise<boolean> {
  return Promise.resolve(!!sentenceId);
}

export function speakText(text: string, sentenceId?: number): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  stop();
  
  if (sentenceId) {
    return playMp3(`/audio/sentences/${sentenceId}.mp3`).catch(() => speakWithYoudao(text));
  }

  const trimmed = text.trim();
  const words = trimmed.split(/\s+/).filter(Boolean);
  if (words.length === 1) {
    const normalized = words[0].toLowerCase().replace(/^[("'[]+|[)"'\],.!?;:]+$/g, "");
    if (CORE_WORDS.has(normalized)) {
      return playMp3(audioUrl(normalized)).catch(() => speakWithYoudao(trimmed));
    }
  }

  return speakWithYoudao(trimmed);
}

export { VOICE_ID };
