/**
 * 批量预生成 850 词 Gemini TTS 音频
 * 使用已有的 GEMINI_API_KEY（无需额外申请）
 * 音色：Aoede — 女声，舒缓柔和，音阶清晰
 *
 * 存至 Supabase Storage bucket: tts / words/{id}.wav
 * 回写 ogden_words.audio_url
 *
 * Usage:
 *   npm run tts:generate
 *   npm run tts:generate -- --word come        # 单词测试
 *   npm run tts:generate -- --force            # 强制覆盖已有
 *   npm run tts:generate -- --limit 10         # 只跑前 10
 */
import * as dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { GoogleGenAI } from '@google/genai';
import { resolveSupabaseEnv } from '../src/lib/supabaseConfig';

dotenv.config({ path: '.env.local' });

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
  console.error('Missing GEMINI_API_KEY in .env.local');
  process.exit(1);
}

const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

const BUCKET = 'tts';
const VOICE_NAME = 'Aoede';   // 女声，舒缓柔和，社区评分最高
const TTS_MODEL  = 'gemini-2.5-flash-preview-tts';

function parseArgs() {
  const argv = process.argv.slice(2);
  const get = (f: string) => { const i = argv.indexOf(f); return i >= 0 ? argv[i + 1] : undefined; };
  return {
    word:  get('--word'),
    force: argv.includes('--force'),
    limit: Number(get('--limit') ?? '0') || 0,
  };
}

/** Gemini TTS 返回 PCM；加 WAV header 使浏览器可播 */
function pcmToWav(pcm: Buffer, sampleRate = 24000, channels = 1, bitsPerSample = 16): Buffer {
  const byteRate = (sampleRate * channels * bitsPerSample) / 8;
  const blockAlign = (channels * bitsPerSample) / 8;
  const header = Buffer.alloc(44);
  header.write('RIFF', 0);
  header.writeUInt32LE(36 + pcm.length, 4);
  header.write('WAVE', 8);
  header.write('fmt ', 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);          // PCM
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

  const pcm = Buffer.from(part.inlineData.data, 'base64');
  // Gemini TTS 输出 24kHz 16-bit mono PCM
  return pcmToWav(pcm, 24000, 1, 16);
}

function sleep(ms: number) { return new Promise((r) => setTimeout(r, ms)); }

async function ensureBucket(supabase: ReturnType<typeof createClient>): Promise<void> {
  const { data: buckets, error } = await supabase.storage.listBuckets();
  if (error) throw new Error(`listBuckets: ${error.message}`);
  if (buckets?.some((b) => b.name === BUCKET)) return;
  const { error: createErr } = await supabase.storage.createBucket(BUCKET, { public: true });
  if (createErr) throw new Error(`createBucket: ${createErr.message}`);
  console.log(`Created public bucket: ${BUCKET}`);
}

async function main() {
  const opts = parseArgs();
  const { url, serviceRoleKey, anonKey } = resolveSupabaseEnv();
  if (!serviceRoleKey) {
    console.error('Missing SUPABASE_SERVICE_ROLE_KEY — 写入 Storage 和 audio_url 需要 service role');
    process.exit(1);
  }
  const supabase = createClient(url, serviceRoleKey || anonKey);

  await ensureBucket(supabase);

  let query = supabase.from('ogden_words').select('id, word, audio_url').order('sort_order');
  if (opts.word) query = query.eq('word', opts.word);
  const { data: words, error } = await query;
  if (error) { console.error(error); process.exit(1); }

  const targets = opts.limit ? words!.slice(0, opts.limit) : words!;
  console.log(`\nGenerating TTS for ${targets.length} words  [voice: ${VOICE_NAME}]\n`);

  let ok = 0, skip = 0, fail = 0;

  for (const w of targets) {
    const storagePath = `words/${w.id}.wav`;
    // 跳过已有有效 CDN URL（legacy /audio/*.mp3 视为无效，需重新生成）
    const hasValidUrl = w.audio_url && !w.audio_url.startsWith('/audio/');
    if (!opts.force && hasValidUrl) { skip++; process.stdout.write('.'); continue; }

    try {
      const wav = await generateTTS(w.word);

      const { error: upErr } = await supabase.storage
        .from(BUCKET)
        .upload(storagePath, wav, { contentType: 'audio/wav', upsert: true });
      if (upErr) throw upErr;

      const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(storagePath);

      const { error: dbErr } = await supabase
        .from('ogden_words')
        .update({ audio_url: urlData.publicUrl })
        .eq('id', w.id);
      if (dbErr) throw dbErr;

      console.log(`  ✓ ${w.word}`);
      ok++;
      await sleep(300);   // Gemini 速率限制（Flash 免费 15 RPM）
    } catch (e) {
      console.error(`\n  ✗ ${w.word}: ${e}`);
      fail++;
      await sleep(1000);
    }
  }

  console.log(`\nDone: ${ok} generated, ${skip} skipped, ${fail} failed`);
  if (fail > 0) process.exit(1);
}

main();
