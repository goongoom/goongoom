/**
 * Detects the primary language of a text string using Unicode script analysis.
 * Supports Korean (ko), Japanese (ja), and English (en).
 *
 * Detection strategy:
 * - Hangul syllables/jamo → Korean
 * - Hiragana or Katakana → Japanese
 * - Otherwise → English (default)
 */
export function detectLanguage(text: string): 'ko' | 'en' | 'ja' {
  let hangulCount = 0
  let kanaCount = 0
  let letterCount = 0

  for (const char of text) {
    const code = char.codePointAt(0)
    if (code === undefined) continue

    // Hangul Syllables (AC00–D7AF), Jamo (1100–11FF), Compat Jamo (3130–318F)
    if (
      (code >= 0xac00 && code <= 0xd7af) ||
      (code >= 0x1100 && code <= 0x11ff) ||
      (code >= 0x3130 && code <= 0x318f)
    ) {
      hangulCount++
      letterCount++
      continue
    }

    // Hiragana (3040–309F), Katakana (30A0–30FF)
    if ((code >= 0x3040 && code <= 0x309f) || (code >= 0x30a0 && code <= 0x30ff)) {
      kanaCount++
      letterCount++
      continue
    }

    // Count Latin letters and CJK ideographs as general letters
    if (
      (code >= 0x41 && code <= 0x5a) ||
      (code >= 0x61 && code <= 0x7a) ||
      (code >= 0x4e00 && code <= 0x9fff)
    ) {
      letterCount++
    }
  }

  if (letterCount === 0) return 'en'
  if (hangulCount > kanaCount) return 'ko'
  if (kanaCount > 0) return 'ja'
  return 'en'
}
