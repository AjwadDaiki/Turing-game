import { Epreuve, EpreuveFamily } from '../types';
import { EPREUVES } from './epreuveData';

export type SelectedEpreuve = Epreuve & { resolvedPrompt: string };

const FAMILIES: EpreuveFamily[] = ['verbale', 'visuelle', 'dessin', 'numerique', 'chaotique'];

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function resolvePrompt(epreuve: Epreuve): string {
  const fill = pickRandom(epreuve.promptBanque);
  return epreuve.basePrompt.replace('[X]', fill);
}

/**
 * Picks exactly 5 épreuves — one per family — with randomized selection within each family.
 * Each returned épreuve has resolvedPrompt: basePrompt with [X] filled.
 */
export function selectEpreuves(): SelectedEpreuve[] {
  return FAMILIES.map((family) => {
    const pool = EPREUVES.filter((e) => e.family === family);
    const chosen = pickRandom(pool);
    return { ...chosen, resolvedPrompt: resolvePrompt(chosen) };
  });
}
