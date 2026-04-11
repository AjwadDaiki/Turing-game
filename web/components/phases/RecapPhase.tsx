'use client';
import { GameState } from '@/hooks/useGameState';
import { EpreuveInputType, RevealedAnswer } from '@/lib/clientTypes';
import RevealRouter from '../reveals/RevealRouter';

interface Props {
  gameState: GameState;
}

function groupByRound(answers: RevealedAnswer[]): Map<number, RevealedAnswer[]> {
  const map = new Map<number, RevealedAnswer[]>();
  for (const a of answers) {
    const arr = map.get(a.roundNumber) ?? [];
    arr.push(a);
    map.set(a.roundNumber, arr);
  }
  return map;
}

export default function RecapPhase({ gameState }: Props) {
  const { revealedAnswers, epreuveInfoByRound } = gameState;
  const grouped = groupByRound(revealedAnswers);

  return (
    <main className="min-h-screen bg-gray-900 text-white flex flex-col p-4">
      <h2 className="text-xl font-bold text-center mb-6">Récapitulatif</h2>

      {grouped.size === 0 ? (
        <p className="text-gray-500 text-center">Aucune réponse enregistrée.</p>
      ) : (
        <div className="space-y-6 overflow-y-auto pb-4">
          {Array.from(grouped.entries())
            .sort(([a], [b]) => a - b)
            .map(([roundNum, answers]) => {
              const info = epreuveInfoByRound[roundNum];
              const inputType: EpreuveInputType = info?.inputType ?? 'text';
              return (
                <div key={roundNum}>
                  <p className="text-gray-400 text-xs uppercase tracking-wider mb-2">
                    Manche {roundNum}
                    {info ? ` — ${info.prompt}` : ''}
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {answers.map((ans) => (
                      <div key={ans.playerId} className="bg-gray-800 rounded-lg p-3">
                        <RevealRouter answer={ans} inputType={inputType} compact />
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
        </div>
      )}

      <p className="text-center text-gray-500 text-sm mt-4">
        Le vote commence dans quelques instants…
      </p>
    </main>
  );
}
