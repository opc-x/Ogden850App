/**
 * POST /api/transcribe smoke test (needs `vercel dev --listen 3001` running).
 */
import dotenv from 'dotenv';
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

dotenv.config({ path: '.env.local' });

const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ogden-transcribe-api-'));
const wav = path.join(tmpDir, 'sample.wav');

execSync(`say -o "${path.join(tmpDir, 's.aiff')}" "Yes and a cold plate to start"`, { stdio: 'pipe' });
execSync(`afconvert -f WAVE -d LEI16@16000 -c 1 "${path.join(tmpDir, 's.aiff')}" "${wav}"`, { stdio: 'pipe' });

const audioBase64 = fs.readFileSync(wav).toString('base64');
const base = process.env.TRANSCRIBE_API_BASE || 'http://127.0.0.1:5173';

const res = await fetch(`${base}/api/transcribe`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ audioBase64 }),
});

const data = await res.json();
console.log('status', res.status);
console.log('body', data);

if (!res.ok || !data.transcript) {
  process.exit(1);
}
console.log('OK — /api/transcribe');
