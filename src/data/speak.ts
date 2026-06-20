/** 发音：Sonia Neural 预生成 MP3（与生产站一致）+ Web Speech 降级 */
import { TTSService } from '../services/tts.service';

export function isSpeechSupported(): boolean {
  return TTSService.isSupported();
}

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

export function hasSoniaAudio(_word: string): Promise<boolean> {
  return Promise.resolve(true);
}

export function hasSentenceAudio(_text: string, sentenceId?: number): Promise<boolean> {
  return Promise.resolve(sentenceId != null);
}

export const VOICE_ID = 'en-GB-SoniaNeural';
