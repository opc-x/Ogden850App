import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';

export const GUIDES_PATH = path.join(process.cwd(), 'src/data/word-guides.json');
export const OUT_DIR = path.join(process.cwd(), 'public/assets/audio/guides');
export const MANIFEST_PATH = path.join(process.cwd(), 'src/data/guide-audio-manifest.json');
export const MIN_VALID_BYTES = 2048;

export type GuideAudioIssue = 'missing' | 'zero-byte' | 'too-small' | 'corrupt' | 'stale';

export interface GuideAudioManifestEntry {
  en: string;
  hash: string;
  updatedAt: string;
}

export interface GuideAudioManifest {
  version: 1;
  entries: Record<string, GuideAudioManifestEntry>;
}

export function guideEntryKey(wordId: string, index: number): string {
  return `${wordId}:${index}`;
}

export function hashGuideText(en: string): string {
  return crypto.createHash('sha256').update(en.trim()).digest('hex').slice(0, 16);
}

export function loadGuideAudioManifest(manifestPath = MANIFEST_PATH): GuideAudioManifest {
  if (!fs.existsSync(manifestPath)) {
    return { version: 1, entries: {} };
  }
  return JSON.parse(fs.readFileSync(manifestPath, 'utf8')) as GuideAudioManifest;
}

export function saveGuideAudioManifest(
  manifest: GuideAudioManifest,
  manifestPath = MANIFEST_PATH,
): void {
  fs.mkdirSync(path.dirname(manifestPath), { recursive: true });
  fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
}

export function upsertManifestEntry(
  manifest: GuideAudioManifest,
  wordId: string,
  index: number,
  en: string,
): void {
  const text = en.trim();
  manifest.entries[guideEntryKey(wordId, index)] = {
    en: text,
    hash: hashGuideText(text),
    updatedAt: new Date().toISOString(),
  };
}

export interface GuideAudioFailure {
  wordId: string;
  index: number;
  en: string;
  relPath: string;
  absPath: string;
  issue: GuideAudioIssue;
  size: number;
}

export function wordIdToSlug(wordId: string): string {
  return wordId.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export function guideMp3RelPath(wordId: string, index: number): string {
  return `public/assets/audio/guides/${wordIdToSlug(wordId)}-${index}.mp3`;
}

export function guideMp3AbsPath(wordId: string, index: number): string {
  return path.join(OUT_DIR, `${wordIdToSlug(wordId)}-${index}.mp3`);
}

function isLikelyMp3(buf: Buffer): boolean {
  if (buf.length < 4) return false;
  if (buf[0] === 0x49 && buf[1] === 0x44 && buf[2] === 0x33) return true;
  if (buf[0] === 0xff && (buf[1] & 0xe0) === 0xe0) return true;
  return false;
}

function classifyFile(absPath: string): { issue: GuideAudioIssue | null; size: number } {
  if (!fs.existsSync(absPath)) return { issue: 'missing', size: 0 };
  const stat = fs.statSync(absPath);
  if (stat.size === 0) return { issue: 'zero-byte', size: 0 };
  if (stat.size < MIN_VALID_BYTES) return { issue: 'too-small', size: stat.size };
  const head = fs.readFileSync(absPath).subarray(0, 16);
  if (!isLikelyMp3(head)) return { issue: 'corrupt', size: stat.size };
  return { issue: null, size: stat.size };
}

export function filterGuidesByMethod(
  guides: Record<string, { method?: string; sentences?: Array<{ en: string }> }>,
  methodSubstr?: string,
): Record<string, { method?: string; sentences?: Array<{ en: string }> }> {
  if (!methodSubstr) return guides;
  return Object.fromEntries(
    Object.entries(guides).filter(([, guide]) => guide.method?.includes(methodSubstr)),
  );
}

export function auditGuideAudioFromGuides(
  guides: Record<string, { method?: string; sentences?: Array<{ en: string }> }>,
  outDir = OUT_DIR,
  manifestPath = MANIFEST_PATH,
  opts?: { method?: string },
): {
  total: number;
  ok: number;
  failures: GuideAudioFailure[];
} {
  const filtered = filterGuidesByMethod(guides, opts?.method);
  const manifest = loadGuideAudioManifest(manifestPath);

  const failures: GuideAudioFailure[] = [];
  let total = 0;

  for (const [wordId, guide] of Object.entries(filtered)) {
    const sentences = guide.sentences ?? [];
    sentences.forEach((s, index) => {
      const en = s.en?.trim();
      if (!en) return;
      total++;
      const absPath = path.join(outDir, `${wordIdToSlug(wordId)}-${index}.mp3`);
      const { issue, size } = classifyFile(absPath);
      const manifestEntry = manifest.entries[guideEntryKey(wordId, index)];
      const currentHash = hashGuideText(en);
      const stale =
        !issue &&
        manifestEntry != null &&
        (manifestEntry.hash !== currentHash || manifestEntry.en !== en);

      if (issue || stale) {
        failures.push({
          wordId,
          index,
          en,
          relPath: guideMp3RelPath(wordId, index),
          absPath,
          issue: issue ?? 'stale',
          size,
        });
      }
    });
  }

  return { total, ok: total - failures.length, failures };
}

/** @deprecated 使用 auditGuideAudioFromGuides + Supabase 数据源 */
export function auditGuideAudio(
  guidesPath = GUIDES_PATH,
  outDir = OUT_DIR,
  manifestPath = MANIFEST_PATH,
  opts?: { method?: string },
): {
  total: number;
  ok: number;
  failures: GuideAudioFailure[];
} {
  const guides = filterGuidesByMethod(
    JSON.parse(fs.readFileSync(guidesPath, 'utf8')) as Record<
      string,
      { method?: string; sentences?: Array<{ en: string }> }
    >,
    opts?.method,
  );
  return auditGuideAudioFromGuides(guides, outDir, manifestPath, opts);
}
