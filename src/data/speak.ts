/** 发音：Sonia Neural 预录 MP3（本地 → CDN），无 Web Speech */
import { TTSService } from '../services/tts.service';

export function isAudioPlaybackSupported(): boolean {
  return TTSService.isSupported();
}

/** @deprecated 使用 isAudioPlaybackSupported */
export const isSpeechSupported = isAudioPlaybackSupported;

export function speak(word: string): Promise<void> {
  TTSService.playSpeech(word);
  return Promise.resolve();
}

export function speakText(text: string, sentenceId?: number): Promise<void> {
  TTSService.playSentence(text, sentenceId);
  return Promise.resolve();
}

/** 单词详情「绝佳搭配例句」— 同步栈内发音 */
export function speakGuideSentence(wordId: string, index: number, text: string): Promise<void> {
  TTSService.playGuideSentence(wordId, index, text);
  return Promise.resolve();
}

export const VOICE_ID = 'en-GB-SoniaNeural';
