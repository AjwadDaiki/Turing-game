import { getAIAnswer, GroqFn, DelayFn } from '../game/aiPlayer';
import { Epreuve, Round, EpreuveFamily } from '../types';
import { GroqResult } from '../game/groqClient';
import { FALLBACKS } from '../game/fallbackAnswers';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function mockEpreuve(family: EpreuveFamily, inputType = 'text'): Epreuve {
  return {
    id: `test_${family}`,
    family,
    inputType: inputType as any,
    basePrompt: 'Un mot pour décrire [X]',
    promptBanque: ['lundi'],
    timeLimit: 15,
    resolvedPrompt: 'Un mot pour décrire lundi',
  } as Epreuve & { resolvedPrompt: string };
}

function makeRound(): Round {
  return {
    roundNumber: 1,
    epreuve: {} as any,
    resolvedPrompt: 'test',
    answers: new Map(),
    suspicions: [],
    revealOrder: [],
    revealIndex: 0,
  };
}

const instantGroq: GroqFn = () =>
  Promise.resolve({ content: 'ptdr', promptTokens: 10, completionTokens: 3 });

const failingGroq: GroqFn = () => Promise.reject(new Error('Groq 500'));

const instantDelay: DelayFn = () => Promise.resolve();

// Records the ms argument passed to delayFn
function capturingDelay(): { fn: DelayFn; captured: number[] } {
  const captured: number[] = [];
  const fn: DelayFn = (ms) => { captured.push(ms); return Promise.resolve(); };
  return { fn, captured };
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('getAIAnswer', () => {
  // Test 1: delay arg ≥ 3000ms when groq resolves instantly
  it('delay is always ≥ 3000ms when groqFn resolves instantly', async () => {
    const { fn: delayFn, captured } = capturingDelay();
    await getAIAnswer(mockEpreuve('verbale'), makeRound(), instantGroq, delayFn);
    expect(captured[0]).toBeGreaterThanOrEqual(3000);
  });

  // Test 2: delay arg ≤ 12000ms — uses injectable delayFn, no Math.random mock
  it('delay is always ≤ 12000ms across 20 calls', async () => {
    for (let i = 0; i < 20; i++) {
      const { fn: delayFn, captured } = capturingDelay();
      await getAIAnswer(mockEpreuve('verbale'), makeRound(), instantGroq, delayFn);
      expect(captured[0]).toBeLessThanOrEqual(12000);
    }
  });

  // Test 3: Groq error → fallback, no crash, resolves cleanly
  it('Groq error triggers fallback without throwing', async () => {
    const round = makeRound();
    await expect(
      getAIAnswer(mockEpreuve('verbale'), round, failingGroq, instantDelay)
    ).resolves.toBeUndefined();
    expect(round.answers.has('ai')).toBe(true);
  });

  // Test 4: fallback is appropriate for the epreuve family
  it('fallback values match the expected pool for each family', async () => {
    // numerique fallback → digit-only string
    const numRound = makeRound();
    await getAIAnswer(mockEpreuve('numerique'), numRound, failingGroq, instantDelay);
    const numAnswer = numRound.answers.get('ai')!.content;
    expect(FALLBACKS.numerique).toContain(numAnswer);

    // dessin fallback → null
    const drawRound = makeRound();
    await getAIAnswer(mockEpreuve('dessin', 'draw'), drawRound, failingGroq, instantDelay);
    expect(drawRound.answers.get('ai')!.content).toBeNull();

    // verbale fallback → in pool
    const verbaleRound = makeRound();
    await getAIAnswer(mockEpreuve('verbale'), verbaleRound, failingGroq, instantDelay);
    expect(FALLBACKS.verbale).toContain(verbaleRound.answers.get('ai')!.content);
  });

  // Test 5: response is correctly recorded in round.answers with playerId='ai'
  it('records answer in round.answers with playerId=ai and correct content', async () => {
    const round = makeRound();
    const groqFn: GroqFn = () =>
      Promise.resolve({ content: 'bof', promptTokens: 8, completionTokens: 1 });

    await getAIAnswer(mockEpreuve('verbale'), round, groqFn, instantDelay);

    expect(round.answers.has('ai')).toBe(true);
    const answer = round.answers.get('ai')!;
    expect(answer.content).toBe('bof');
    expect(answer.playerId).toBe('ai');
    expect(typeof answer.submittedAt).toBe('number');
  });

  // Test 6: AI arriving late does NOT overwrite an existing answer (set by finalizeRound)
  it('late AI answer does not overwrite existing answer from finalizeRound', async () => {
    let resolveGroq!: (result: GroqResult) => void;
    const slowGroq: GroqFn = () =>
      new Promise<GroqResult>((resolve) => { resolveGroq = resolve; });

    const round = makeRound();

    // Start the AI (don't await — it's waiting for groq)
    const promise = getAIAnswer(mockEpreuve('verbale'), round, slowGroq, instantDelay);

    // Simulate finalizeRound running while IA is still waiting
    round.answers.set('ai', { playerId: 'ai', content: null, submittedAt: Date.now() });

    // Now Groq comes back
    resolveGroq({ content: 'ptdr', promptTokens: 5, completionTokens: 2 });
    await promise;

    // The null set by finalizeRound must NOT be overwritten
    expect(round.answers.get('ai')!.content).toBeNull();
  });
});
