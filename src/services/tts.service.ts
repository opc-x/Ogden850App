/**
 * 发音合成业务逻辑服务 (TTS Service)
 * 处理与发音相关的逻辑，完全与视图层解耦
 */
import { APP_CONFIG } from '../config';

export const TTSService = {
  /**
   * 播放给定文本的语音
   * @param text 需要朗读的英文文本
   */
  playSpeech(text: string): void {
    if (!text.trim()) return;

    try {
      // 使用全新 Google Translate 纯正免费神经网络发音
      const url = `${APP_CONFIG.TTS.GOOGLE_TTS_BASE_URL}?ie=UTF-8&q=${encodeURIComponent(text)}&tl=${APP_CONFIG.TTS.DEFAULT_LANG}&client=${APP_CONFIG.TTS.CLIENT_TYPE}`;
      const audio = new Audio(url);
      
      // 添加错误降级处理
      audio.onerror = () => {
        console.warn('Network TTS failed, falling back to window.speechSynthesis');
        this.fallbackToBrowserTTS(text);
      };

      audio.play().catch(e => {
        console.warn('Audio play error:', e);
        this.fallbackToBrowserTTS(text);
      });
    } catch (e) {
      this.fallbackToBrowserTTS(text);
    }
  },

  /**
   * 浏览器原生 TTS 降级方案
   */
  fallbackToBrowserTTS(text: string): void {
    if ('speechSynthesis' in window) {
      // 取消正在进行的播报
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 0.9; // 稍微放慢语速以适配学习场景
      utterance.pitch = 1.0;
      
      window.speechSynthesis.speak(utterance);
    } else {
      console.error('TTS is not supported in this browser environment.');
    }
  }
};
