import { describe, expect, it } from 'vitest';
import { extractPcmFromWav } from '../../api/_lib/nvidiaParakeet';

function makeWavPcm16(samples: number[], sampleRate = 16000): Buffer {
  const dataSize = samples.length * 2;
  const buf = Buffer.alloc(44 + dataSize);
  buf.write('RIFF', 0);
  buf.writeUInt32LE(36 + dataSize, 4);
  buf.write('WAVE', 8);
  buf.write('fmt ', 12);
  buf.writeUInt32LE(16, 16);
  buf.writeUInt16LE(1, 20);
  buf.writeUInt16LE(1, 22);
  buf.writeUInt32LE(sampleRate, 24);
  buf.writeUInt32LE(sampleRate * 2, 28);
  buf.writeUInt16LE(2, 32);
  buf.writeUInt16LE(16, 34);
  buf.write('data', 36);
  buf.writeUInt32LE(dataSize, 40);
  for (let i = 0; i < samples.length; i++) {
    buf.writeInt16LE(samples[i], 44 + i * 2);
  }
  return buf;
}

describe('extractPcmFromWav', () => {
  it('strips 44-byte header and reads sample rate', () => {
    const wav = makeWavPcm16([100, -100, 200], 16000);
    const { pcm, sampleRate } = extractPcmFromWav(wav);
    expect(sampleRate).toBe(16000);
    expect(pcm.length).toBe(6);
    expect(pcm.readInt16LE(0)).toBe(100);
  });
});
