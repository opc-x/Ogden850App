/**
 * Smoke test: NVIDIA Parakeet 0.6B via gRPC (requires NVIDIA_API_KEY in .env.local).
 * Usage: npx tsx scripts/test-parakeet-transcribe.ts
 */
import dotenv from 'dotenv';
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { transcribeWavWithParakeet } from '../api/_lib/nvidiaParakeet';

dotenv.config({ path: '.env.local' });
dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ogden-parakeet-'));

async function main() {
  if (!process.env.NVIDIA_API_KEY?.trim()) {
    console.error('NVIDIA_API_KEY missing in .env.local');
    process.exit(1);
  }

  const aiff = path.join(tmpDir, 'sample.aiff');
  const wav = path.join(tmpDir, 'sample.wav');
  const phrase = 'That is what friends are for';

  console.log(`Generating speech: "${phrase}"`);
  execSync(`say -o "${aiff}" "${phrase}"`, { stdio: 'inherit' });
  execSync(
    `afconvert -f WAVE -d LEI16@16000 -c 1 "${aiff}" "${wav}"`,
    { stdio: 'inherit' },
  );

  const buf = fs.readFileSync(wav);
  console.log(`WAV size: ${buf.length} bytes`);
  console.log('Calling NVIDIA Parakeet…');

  const transcript = await transcribeWavWithParakeet(buf);
  console.log('Transcript:', transcript);

  const normalized = transcript.toLowerCase().replace(/[^a-z\s]/g, '');
  if (!normalized.includes('friends')) {
    console.warn('Warning: expected "friends" in transcript — check audio or API');
    process.exit(2);
  }

  console.log('OK — Parakeet STT reachable');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
