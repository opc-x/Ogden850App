/**
 * Audit authoritative IPA coverage and quality for Ogden 850.
 * Usage: node --experimental-strip-types scripts/audit-ipa-authority.ts
 */
import annotations from '../src/data/word-annotations.json' with { type: 'json' };
import { WORDS } from '../src/data/words850Legacy.ts';

type AnnotationEntry = { ipa?: string; cn?: string; img?: string };

const SPELLING_ALIASES: Record<string, string> = {
  behavior: 'behaviour',
  color: 'colour',
  harbor: 'harbour',
  humor: 'humour',
};

const AUTH = annotations as Record<string, AnnotationEntry>;

function keyForWord(word: string): string {
  return SPELLING_ALIASES[word] ?? word;
}

function isAsciiOnlyIpa(ipa: string): boolean {
  return /^[A-Za-z .'-]+$/.test(ipa);
}

function hasObviouslyInvalidChars(ipa: string): boolean {
  return /[0-9[\]{}<>]/.test(ipa);
}

function printList(title: string, values: string[]): void {
  if (values.length === 0) return;
  console.error(`${title} (${values.length})`);
  for (const value of values.slice(0, 30)) console.error(`  - ${value}`);
  if (values.length > 30) console.error(`  ... +${values.length - 30} more`);
}

const missingIpa: string[] = [];
const sameAsWord: string[] = [];
const asciiOnlyIpa: string[] = [];
const invalidCharIpa: string[] = [];

for (const item of WORDS) {
  const authority = AUTH[keyForWord(item.w)];
  const ipa = authority?.ipa?.trim() ?? '';
  if (!ipa) {
    missingIpa.push(item.w);
    continue;
  }
  if (ipa.toLowerCase() === item.w.toLowerCase()) {
    sameAsWord.push(`${item.w} -> ${ipa}`);
  }
  if (isAsciiOnlyIpa(ipa)) {
    asciiOnlyIpa.push(`${item.w} -> ${ipa}`);
  }
  if (hasObviouslyInvalidChars(ipa)) {
    invalidCharIpa.push(`${item.w} -> ${ipa}`);
  }
}

console.log(`Audited ${WORDS.length} words.`);
console.log(
  `missing=${missingIpa.length}, sameAsWord=${sameAsWord.length}, asciiOnly=${asciiOnlyIpa.length}, invalidChars=${invalidCharIpa.length}`,
);

if (WORDS.length !== 850) {
  console.error(`Expected 850 words, got ${WORDS.length}.`);
  process.exit(1);
}

const hasIssues =
  missingIpa.length > 0 ||
  sameAsWord.length > 0 ||
  asciiOnlyIpa.length > 0 ||
  invalidCharIpa.length > 0;

if (hasIssues) {
  printList('Missing IPA', missingIpa);
  printList('IPA equals word', sameAsWord);
  printList('ASCII-only IPA (high risk)', asciiOnlyIpa);
  printList('IPA with invalid chars', invalidCharIpa);
  process.exit(1);
}

console.log('IPA audit passed.');
