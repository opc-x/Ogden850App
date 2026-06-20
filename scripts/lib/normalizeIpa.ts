/**
 * Normalize IPA strings for reliable rendering in Charis SIL / typical IPA fonts.
 * Strips combining characters that commonly render as tofu (missing glyph boxes).
 */
export function normalizeIpa(ipa: string): string {
  return ipa
    // Affricate tie bars (U+0361, U+035C) — use plain tʃ / dʒ
    .replace(/t[\u0361\u035C]ʃ/g, 'tʃ')
    .replace(/d[\u0361\u035C]ʒ/g, 'dʒ')
    // Syllabic consonants (U+0329) — e.g. n̩ → n
    .replace(/([nlmb])[\u0329]/g, '$1')
    // Non-syllabic / diphthong linker (U+032F) — e.g. aɪ̯ → aɪ
    .replace(/[\u032F]/g, '')
    // Articulatory diacritics rarely supported in web IPA fonts
    .replace(/[\u0308\u030A\u031F\u0320\u032A]/g, '')
    // Normalize long vowel marker to MODIFIER LETTER TRIANGULAR COLON (U+02D0)
    .replace(/[\u003A\u0589\uFF1A\uFE55\u05C3]/g, 'ː')
    .trim();
}

/** Returns true if normalization would change the string. */
export function ipaNeedsNormalization(ipa: string): boolean {
  return normalizeIpa(ipa) !== ipa.trim();
}
