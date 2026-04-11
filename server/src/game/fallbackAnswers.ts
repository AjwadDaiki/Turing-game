import { EpreuveFamily } from '../types';

/**
 * Hardcoded fallback answers used when Groq is unavailable.
 *
 * Dessin:    null — client displays "dessin indisponible" placeholder instead of crashing.
 * Chaotique: comma-separated strings — client must parse with .split(',').map(s => s.trim())
 *            to match the format Groq returns for list prompts.
 */
export const FALLBACKS: Record<EpreuveFamily, (string | null)[]> = {
  verbale: ['chelou', 'bof', 'relou', 'mdr', 'wsh', 'ptdr', 'grv', 'pcq'],
  visuelle: ['💀', '🫠', '😭', '🗿', '🤙', '😤', '💤', '🙃'],
  dessin: [null], // client renders a "dessin indisponible" placeholder
  numerique: ['42', '1337', '666', '99', '0', '404', '7', '69'],
  chaotique: [
    'rien, les gens, la pluie, les lundis',
    'café, boulot, dodo, repeat',
    'tout et rien, surtout rien',
    'le bruit, la foule, les mails, les open-space',
    'rester au lit, netflix, grasse mat, silence',
  ],
};

export function pickFallback(family: EpreuveFamily): string | null {
  const pool = FALLBACKS[family];
  return pool[Math.floor(Math.random() * pool.length)];
}
