/**
 * Manual debug script — calls Groq for all 12 épreuves and displays:
 *   - The resolved prompt
 *   - Groq's raw answer
 *   - Real API response time
 *   - Token counts (prompt + completion)
 * Plus a summary table with averages.
 *
 * Run with:
 *   npx ts-node scripts/test-ai.ts
 *
 * Requires GROQ_API_KEY in server/.env
 */

import 'dotenv/config';
import { callGroq } from '../src/game/groqClient';
import { EPREUVES } from '../src/game/epreuveData';
import { Epreuve } from '../src/types';

type Result = {
  id: string;
  family: string;
  prompt: string;
  answer: string;
  elapsedMs: number;
  promptTokens: number;
  completionTokens: number;
  error?: string;
};

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function resolvePrompt(epreuve: Epreuve): string {
  const fill = pickRandom(epreuve.promptBanque);
  return epreuve.basePrompt.replace('[X]', fill);
}

function pad(str: string, len: number): string {
  return str.length >= len ? str.slice(0, len) : str + ' '.repeat(len - str.length);
}

async function main(): Promise<void> {
  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('  TURING — Test IA Groq (llama-3.1-8b-instant)');
  console.log('═══════════════════════════════════════════════════════════════\n');

  const results: Result[] = [];

  for (const epreuve of EPREUVES) {
    const resolvedPrompt = resolvePrompt(epreuve);
    const epreuveWithPrompt = { ...epreuve, resolvedPrompt };

    process.stdout.write(`[${pad(epreuve.id, 20)}] "${resolvedPrompt.slice(0, 50)}"...\n`);
    process.stdout.write(`  → `);

    const start = Date.now();
    try {
      const result = await callGroq(epreuveWithPrompt as any);
      const elapsed = Date.now() - start;

      process.stdout.write(`"${result.content}"  (${elapsed}ms, ${result.promptTokens}in/${result.completionTokens}out tokens)\n`);

      results.push({
        id: epreuve.id,
        family: epreuve.family,
        prompt: resolvedPrompt,
        answer: result.content,
        elapsedMs: elapsed,
        promptTokens: result.promptTokens,
        completionTokens: result.completionTokens,
      });
    } catch (err: any) {
      const elapsed = Date.now() - start;
      process.stdout.write(`[ERREUR] ${err.message}  (${elapsed}ms)\n`);
      results.push({
        id: epreuve.id,
        family: epreuve.family,
        prompt: resolvedPrompt,
        answer: '[FALLBACK]',
        elapsedMs: elapsed,
        promptTokens: 0,
        completionTokens: 0,
        error: err.message,
      });
    }

    // Small pause between calls to avoid rate limiting
    await new Promise((r) => setTimeout(r, 500));
  }

  // ─── Summary table ────────────────────────────────────────────────────────
  const successful = results.filter((r) => !r.error);
  const avgElapsed = successful.length
    ? Math.round(successful.reduce((s, r) => s + r.elapsedMs, 0) / successful.length)
    : 0;
  const avgPromptTokens = successful.length
    ? Math.round(successful.reduce((s, r) => s + r.promptTokens, 0) / successful.length)
    : 0;
  const avgCompletionTokens = successful.length
    ? Math.round(successful.reduce((s, r) => s + r.completionTokens, 0) / successful.length)
    : 0;
  const totalPromptTokens = results.reduce((s, r) => s + r.promptTokens, 0);
  const totalCompletionTokens = results.reduce((s, r) => s + r.completionTokens, 0);

  console.log('\n───────────────────────────────────────────────────────────────');
  console.log('  RÉSUMÉ');
  console.log('───────────────────────────────────────────────────────────────');
  console.log(`  Épreuves testées    : ${results.length}/12`);
  console.log(`  Succès Groq         : ${successful.length}/${results.length}`);
  console.log(`  Temps API moyen     : ${avgElapsed}ms`);
  console.log(`  Tokens input moy.   : ${avgPromptTokens} (estimé ~450 selon rules.md)`);
  console.log(`  Tokens output moy.  : ${avgCompletionTokens} (estimé ~20 selon rules.md)`);
  console.log(`  Tokens totaux input : ${totalPromptTokens}`);
  console.log(`  Tokens totaux output: ${totalCompletionTokens}`);
  console.log('\n  Tableau par famille :');

  const families = [...new Set(results.map((r) => r.family))];
  for (const family of families) {
    const fResults = results.filter((r) => r.family === family);
    const fAvg = Math.round(fResults.reduce((s, r) => s + r.elapsedMs, 0) / fResults.length);
    console.log(`    ${pad(family, 12)} → ${fResults.map((r) => `"${r.answer.slice(0, 15)}"`).join(' | ')}  (moy. ${fAvg}ms)`);
  }

  console.log('\n═══════════════════════════════════════════════════════════════\n');
}

main().catch((err) => {
  console.error('[FATAL]', err);
  process.exit(1);
});
