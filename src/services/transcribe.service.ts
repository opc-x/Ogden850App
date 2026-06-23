import { API_ROUTES } from '../router/api';

export type TranscribeResult = {
  transcript: string;
  provider?: string;
};

export const TranscribeService = {
  async transcribeAudioBase64(audioBase64: string): Promise<TranscribeResult> {
    const response = await fetch(API_ROUTES.AI.TRANSCRIBE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ audioBase64 }),
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.error || `转写失败 (${response.status})`);
    }
    if (!data.transcript?.trim()) {
      throw new Error('未识别到语音内容');
    }
    return { transcript: data.transcript.trim(), provider: data.provider };
  },
};
