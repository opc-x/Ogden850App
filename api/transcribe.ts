import type { VercelRequest, VercelResponse } from '@vercel/node';
import { resolveNvidiaApiKey, transcribeWavWithParakeet } from './_lib/nvidiaParakeet.js';

function cors(res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Content-Type',
  );
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  cors(res);
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!resolveNvidiaApiKey()) {
    return res.status(503).json({ error: 'NVIDIA_API_KEY not configured' });
  }

  try {
    const { audioBase64 } = req.body ?? {};
    if (!audioBase64 || typeof audioBase64 !== 'string') {
      return res.status(400).json({ error: 'audioBase64 is required' });
    }

    const wav = Buffer.from(audioBase64, 'base64');
    if (wav.length < 1000) {
      return res.status(400).json({ error: 'Audio too short' });
    }
    if (wav.length > 5 * 1024 * 1024) {
      return res.status(400).json({ error: 'Audio too large (max 5MB)' });
    }

    const transcript = await transcribeWavWithParakeet(wav);
    return res.status(200).json({ transcript, provider: 'nvidia-parakeet-0.6b-v2' });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Transcription failed';
    console.error('[api/transcribe]', e);
    return res.status(502).json({ error: message });
  }
}
