import { Epreuve, Round } from '../types';
import { callGroq, GroqResult } from './groqClient';
import { pickFallback } from './fallbackAnswers';
import { generateRandomDrawing } from './drawStub';

export type GroqFn = (epreuve: Epreuve) => Promise<GroqResult>;
export type DelayFn = (ms: number) => Promise<void>;

const defaultDelay: DelayFn = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Calls Groq for an AI answer, waits a human-like random delay (3–12s total),
 * then records the result in round.answers under socketId='ai'.
 *
 * On Groq error: falls back to a family-appropriate hardcoded answer.
 * If round.answers already has 'ai' (set by finalizeRound while IA was pending),
 * the late answer is silently discarded — existing data wins.
 *
 * @param epreuve   The current épreuve
 * @param round     The current round (mutated)
 * @param groqFn    Injectable Groq caller (default: real callGroq)
 * @param delayFn   Injectable delay function (default: setTimeout-based)
 */
export async function getAIAnswer(
  epreuve: Epreuve,
  round: Round,
  groqFn: GroqFn = callGroq,
  delayFn: DelayFn = defaultDelay
): Promise<void> {
  const startTime = Date.now();
  let content: string | null;

  try {
    const result = await groqFn(epreuve);
    const elapsed = Date.now() - startTime;
    const targetDelay = 3000 + Math.random() * 9000; // 3–12s human-like delay
    const remaining = Math.max(0, targetDelay - elapsed);
    await delayFn(remaining);
    // For draw épreuves, Groq returns a word — use the stub drawing instead
    content = epreuve.family === 'dessin'
      ? generateRandomDrawing() as any
      : result.content;
  } catch (_err) {
    // Even on error: wait a human-like delay so the AI doesn't "respond" instantly
    await delayFn(3000 + Math.random() * 9000);
    content = epreuve.family === 'dessin'
      ? generateRandomDrawing() as any
      : pickFallback(epreuve.family);
    console.warn(`[ai] Groq fallback used for family '${epreuve.family}'`);
  }

  // If finalizeRound already ran and set 'ai' (e.g., timer expired while we waited),
  // do NOT overwrite — the null answer from finalizeRound takes precedence.
  if (round.answers.has('ai')) {
    console.warn(`[ai] Answer arrived late for round ${round.roundNumber} — discarding`);
    return;
  }

  round.answers.set('ai', {
    playerId: 'ai',
    content,
    submittedAt: Date.now(),
  });
}
