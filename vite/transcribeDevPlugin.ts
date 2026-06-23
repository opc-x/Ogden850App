import type { IncomingMessage, ServerResponse } from 'node:http';
import type { Plugin } from 'vite';
import dotenv from 'dotenv';

function readJsonBody(req: IncomingMessage): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', (c) => chunks.push(Buffer.from(c)));
    req.on('end', () => {
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}'));
      } catch (e) {
        reject(e);
      }
    });
    req.on('error', reject);
  });
}

function sendJson(res: ServerResponse, status: number, payload: unknown) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(payload));
}

/** Local dev: serve POST /api/transcribe without `vercel dev`. Production uses api/transcribe.ts. */
export function transcribeDevApi(): Plugin {
  return {
    name: 'ogden-transcribe-dev-api',
    configureServer(server) {
      dotenv.config({ path: '.env.local' });
      dotenv.config();

      server.middlewares.use(async (req, res, next) => {
        const pathname = req.url?.split('?')[0];
        if (pathname !== '/api/transcribe') return next();

        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

        if (req.method === 'OPTIONS') {
          res.statusCode = 200;
          res.end();
          return;
        }
        if (req.method !== 'POST') {
          sendJson(res, 405, { error: 'Method not allowed' });
          return;
        }

        try {
          const body = (await readJsonBody(req)) as { audioBase64?: string };
          const { resolveNvidiaApiKey, transcribeWavWithParakeet } = await import('../api/_lib/nvidiaParakeet');

          if (!resolveNvidiaApiKey()) {
            sendJson(res, 503, { error: 'NVIDIA_API_KEY not configured' });
            return;
          }
          if (!body.audioBase64) {
            sendJson(res, 400, { error: 'audioBase64 is required' });
            return;
          }

          const wav = Buffer.from(body.audioBase64, 'base64');
          const transcript = await transcribeWavWithParakeet(wav);
          sendJson(res, 200, { transcript, provider: 'nvidia-parakeet-0.6b-v2' });
        } catch (e) {
          sendJson(res, 502, {
            error: e instanceof Error ? e.message : 'Transcription failed',
          });
        }
      });
    },
  };
}
