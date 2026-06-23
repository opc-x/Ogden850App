import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const PARAKEET_FUNCTION_ID = 'd3fe9151-442b-4204-a70d-5fcc597fd610';
const GRPC_HOST = 'grpc.nvcf.nvidia.com:443';
const DEFAULT_SAMPLE_RATE = 16_000;

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function resolveProtoRoot(): string {
  const candidates = [
    path.join(__dirname, 'rivaProtos'),
    path.join(process.cwd(), 'api/_lib/rivaProtos'),
  ];
  for (const root of candidates) {
    const proto = path.join(root, 'riva/proto/riva_asr.proto');
    if (fs.existsSync(proto)) return root;
  }
  throw new Error('Riva proto files not found in deployment bundle');
}

const PROTO_ROOT = resolveProtoRoot();
const PROTO_PATH = path.join(PROTO_ROOT, 'riva/proto/riva_asr.proto');

type RivaAsrClient = {
  Recognize: (
    request: {
      config: {
        encoding: number;
        sampleRateHertz: number;
        languageCode: string;
        maxAlternatives: number;
        enableAutomaticPunctuation: boolean;
      };
      audio: Buffer;
    },
    metadata: grpc.Metadata,
    callback: (err: grpc.ServiceError | null, response?: RecognizeResponse) => void,
  ) => void;
};

type RecognizeResponse = {
  results?: Array<{
    alternatives?: Array<{ transcript?: string }>;
  }>;
};

let clientPromise: Promise<RivaAsrClient> | null = null;

function loadClient(): Promise<RivaAsrClient> {
  if (!clientPromise) {
    clientPromise = Promise.resolve().then(() => {
      const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
        keepCase: false,
        longs: String,
        enums: Number,
        defaults: true,
        oneofs: true,
        includeDirs: [PROTO_ROOT],
      });
      const loaded = grpc.loadPackageDefinition(packageDefinition) as unknown as {
        nvidia: { riva: { asr: { RivaSpeechRecognition: new (...args: unknown[]) => RivaAsrClient } } };
      };
      const Ctor = loaded.nvidia.riva.asr.RivaSpeechRecognition;
      return new Ctor(GRPC_HOST, grpc.credentials.createSsl()) as RivaAsrClient;
    });
  }
  return clientPromise;
}

export function resolveNvidiaApiKey(): string | null {
  return process.env.NVIDIA_API_KEY?.trim() || null;
}

/** Strip standard 44-byte PCM WAV header when present. */
export function extractPcmFromWav(wav: Buffer): { pcm: Buffer; sampleRate: number } {
  if (wav.length < 44 || wav.toString('ascii', 0, 4) !== 'RIFF') {
    return { pcm: wav, sampleRate: DEFAULT_SAMPLE_RATE };
  }

  let offset = 12;
  let sampleRate = DEFAULT_SAMPLE_RATE;
  let dataOffset = -1;
  let dataSize = 0;

  while (offset + 8 <= wav.length) {
    const chunkId = wav.toString('ascii', offset, offset + 4);
    const chunkSize = wav.readUInt32LE(offset + 4);
    const chunkStart = offset + 8;

    if (chunkId === 'fmt ') {
      if (chunkStart + 16 <= wav.length) {
        sampleRate = wav.readUInt32LE(chunkStart + 4);
      }
    } else if (chunkId === 'data') {
      dataOffset = chunkStart;
      dataSize = chunkSize;
      break;
    }

    offset = chunkStart + chunkSize + (chunkSize % 2);
  }

  if (dataOffset < 0 || dataOffset + dataSize > wav.length) {
    return { pcm: wav, sampleRate: DEFAULT_SAMPLE_RATE };
  }

  return { pcm: wav.subarray(dataOffset, dataOffset + dataSize), sampleRate };
}

export async function transcribePcmWithParakeet(
  pcm: Buffer,
  sampleRate = DEFAULT_SAMPLE_RATE,
): Promise<string> {
  const apiKey = resolveNvidiaApiKey();
  if (!apiKey) {
    throw new Error('NVIDIA_API_KEY not configured');
  }

  const client = await loadClient();
  const metadata = new grpc.Metadata();
  metadata.add('function-id', PARAKEET_FUNCTION_ID);
  metadata.add('authorization', `Bearer ${apiKey}`);

  const response = await new Promise<RecognizeResponse>((resolve, reject) => {
    client.Recognize(
      {
        config: {
          encoding: 1, // LINEAR_PCM
          sampleRateHertz: sampleRate,
          languageCode: 'en-US',
          maxAlternatives: 1,
          enableAutomaticPunctuation: true,
        },
        audio: pcm,
      },
      metadata,
      (err, res) => {
        if (err) reject(err);
        else resolve(res ?? {});
      },
    );
  });

  const transcript = response.results?.[0]?.alternatives?.[0]?.transcript?.trim() ?? '';
  if (!transcript) {
    throw new Error('No speech detected');
  }
  return transcript;
}

export async function transcribeWavWithParakeet(wav: Buffer): Promise<string> {
  const { pcm, sampleRate } = extractPcmFromWav(wav);
  return transcribePcmWithParakeet(pcm, sampleRate);
}
