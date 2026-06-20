/**
 * 实时 TTS — 句子/对话朗读（Gemini 2.5 Flash TTS）
 * GET /api/tts?text=Hello+world
 *
 * 流程：
 *  1. 检查 Supabase Storage tts/sentences/{hash}.wav 是否已缓存
 *  2. 若有 → 302 重定向到 CDN 公共 URL
 *  3. 若无 → 调用 Gemini TTS → 转 WAV → 上传 Storage → 302 重定向
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { GoogleGenAI } from '@google/genai';
import { resolveSupabaseEnv } from '../src/lib/supabaseConfig';
import { createHash } from 'crypto';

const BUCKET     = 'tts';
const VOICE_NAME = 'Aoede';
const TTS_MODEL  = 'gemini-2.5-flash-preview-tts';

function getAi() {
  return new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
}
function getSupabase() {
  const { url, serviceRoleKey, anonKey } = resolveSupabaseEnv();
  return createClient(url, serviceRoleKey || anonKey);
}

function textToPath(text: string): string {
  const hash = createHash('sha256').update(text.trim().toLowerCase()).digest('hex').slice(0, 16);
  return `sentences/${hash}.wav`;
}

function pcmToWav(pcm: Buffer, sampleRate = 24000, channels = 1, bitsPerSample = 16): Buffer {
  const byteRate = (sampleRate * channels * bitsPerSample) / 8;
  const blockAlign = (channels * bitsPerSample) / 8;
  const header = Buffer.alloc(44);
  header.write('RIFF', 0);
  header.writeUInt32LE(36 + pcm.length, 4);
  header.write('WAVE', 8);
  header.write('fmt ', 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(channels, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(byteRate, 28);
  header.writeUInt16LE(blockAlign, 32);
  header.writeUInt16LE(bitsPerSample, 34);
  header.write('data', 36);
  header.writeUInt32LE(pcm.length, 40);
  return Buffer.concat([header, pcm]);
}

async function generateTTS(text: string): Promise<Buffer> {
  const ai = getAi();
  const response = await ai.models.generateContent({
    model: TTS_MODEL,
    contents: [{ role: 'user', parts: [{ text }] }],
    config: {
      responseModalities: ['AUDIO'],
      speechConfig: {
        voiceConfig: { prebuiltVoiceConfig: { voiceName: VOICE_NAME } },
      },
    },
  });

  const part = response.candidates?.[0]?.content?.parts?.[0];
  if (!part?.inlineData?.data) throw new Error('No audio data in Gemini response');

  return pcmToWav(Buffer.from(part.inlineData.data, 'base64'));
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') { res.status(200).end(); return; }
  if (req.method !== 'GET') { res.status(405).json({ error: 'Method not allowed' }); return; }

  const text = typeof req.query.text === 'string' ? req.query.text.trim() : '';
  if (!text || text.length > 500) {
    res.status(400).json({ error: 'text required, ≤ 500 chars' });
    return;
  }
  if (!process.env.GEMINI_API_KEY) {
    res.status(503).json({ error: 'GEMINI_API_KEY not configured' });
    return;
  }

  try {
    const supabase = getSupabase();
    const storagePath = textToPath(text);

    // 1. 检查缓存
    const { data: existing } = await supabase.storage
      .from(BUCKET)
      .list('sentences', { search: storagePath.replace('sentences/', '') });
    if (existing && existing.length > 0) {
      const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(storagePath);
      res.redirect(302, urlData.publicUrl);
      return;
    }

    // 2. 生成
    const wav = await generateTTS(text);

    // 3. 缓存到 Storage
    const { error: upErr } = await supabase.storage
      .from(BUCKET)
      .upload(storagePath, wav, { contentType: 'audio/wav', upsert: false });
    if (upErr && upErr.message !== 'The resource already exists') {
      console.error('[TTS] upload error:', upErr.message);
    }

    // 4. 重定向到公共 URL
    const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(storagePath);
    res.redirect(302, urlData.publicUrl);
  } catch (e) {
    console.error('[TTS handler]', e);
    res.status(500).json({ error: 'Internal error', detail: String(e) });
  }
}
