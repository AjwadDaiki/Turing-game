'use client';
import { GameState } from '@/hooks/useGameState';
import { ScoreBreakdown } from '@/lib/clientTypes';

interface Props {
  gameState: GameState;
}

function ScoreRow({ pseudo, score }: { pseudo: string; score: ScoreBreakdown }) {
  return (
    <div className="bg-gray-800 rounded-xl p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="font-bold text-lg">{pseudo}</span>
        <span className="text-2xl font-bold text-yellow-400">{score.total} pts</span>
      </div>
      <div className="text-xs text-gray-400 space-y-0.5">
        {score.robotSuspicionPts > 0   && <p>Suspicions robot : +{score.robotSuspicionPts}</p>}
        {score.ninjaSuspicionPts > 0   && <p>Suspicions traître : +{score.ninjaSuspicionPts}</p>}
        {score.finalVotePts > 0        && <p>Vote final correct : +{score.finalVotePts}</p>}
        {score.doubleTrouvaillePts > 0 && <p>Double trouvaille : +{score.doubleTrouvaillePts}</p>}
        {score.traitorSurvivalPts > 0  && <p>Survie (Traître) : +{score.traitorSurvivalPts}</p>}
        {score.coveragePts > 0         && <p>Couverture parfaite : +{score.coveragePts}</p>}
        {score.confusionPts > 0        && <p>Confusion ennemie : +{score.confusionPts}</p>}
      </div>
    </div>
  );
}

export default function RevealPhase({ gameState }: Props) {
  const { scores, revealData, room } = gameState;

  return (
    <main className="min-h-screen bg-gray-900 text-white flex flex-col p-4">
      <h2 className="text-2xl font-bold text-center mb-6">Révélation</h2>

      {/* Identities — codenames en gros */}
      {revealData && (
        <div className="flex gap-3 mb-6 max-w-sm mx-auto w-full">
          <div className="flex-1 bg-blue-900/40 border border-blue-700 rounded-xl p-4 text-center">
            <p className="text-blue-400 text-xs uppercase tracking-wider mb-2">🤖 Robot</p>
            <p className="text-white/60 text-sm">{revealData.iaPseudo}</p>
            <p className="text-white font-black text-xl tracking-widest mt-1">
              {revealData.iaCodename?.toUpperCase()}
            </p>
          </div>
          <div className="flex-1 bg-yellow-900/40 border border-yellow-700 rounded-xl p-4 text-center">
            <p className="text-yellow-400 text-xs uppercase tracking-wider mb-2">🥷 Traître</p>
            <p className="text-white/60 text-sm">{revealData.traitorPseudo}</p>
            <p className="text-white font-black text-xl tracking-widest mt-1">
              {revealData.traitorCodename?.toUpperCase()}
            </p>
          </div>
        </div>
      )}

      {/* Scores */}
      {scores && room && (
        <div className="space-y-3 max-w-sm mx-auto w-full overflow-y-auto">
          <h3 className="text-gray-400 text-xs uppercase tracking-wider text-center">Scores finaux</h3>
          {room.players
            .filter((p) => scores[p.socketId])
            .sort((a, b) => (scores[b.socketId]?.total ?? 0) - (scores[a.socketId]?.total ?? 0))
            .map((p, i) => (
              <div key={p.socketId} className="relative">
                {i === 0 && <span className="absolute -top-2 -left-2 text-lg">🏆</span>}
                <ScoreRow pseudo={p.pseudo} score={scores[p.socketId]} />
              </div>
            ))}
        </div>
      )}
    </main>
  );
}
