'use client';
import { Socket } from 'socket.io-client';
import { GameState } from '@/hooks/useGameState';
import RevealRouter from '../reveals/RevealRouter';

interface Props {
  socket: Socket;
  gameState: GameState;
}

export default function DefilementPhase({ socket, gameState }: Props) {
  const { revealedAnswers, epreuveInfo, room, mySocketId } = gameState;
  if (!epreuveInfo || !room) return null;

  const isHost = room.hostSocketId === mySocketId;
  const current = revealedAnswers[revealedAnswers.length - 1] ?? null;

  function addSuspicion(targetPlayerId: string, type: 'robot' | 'ninja') {
    socket.emit('suspicion:add', { targetPlayerId, type });
  }

  return (
    <main className="min-h-screen bg-gray-900 text-white flex flex-col p-4">
      <div className="flex items-center justify-between mb-4">
        <span className="text-gray-400 text-sm">Manche {epreuveInfo.roundNumber}/5 — Défilement</span>
        <span className="text-gray-400 text-sm">
          {revealedAnswers.length}/{room.players.length}
        </span>
      </div>

      {/* Current revealed answer */}
      <div className="flex-1 flex flex-col items-center justify-center">
        {!current ? (
          <p className="text-gray-500 text-sm">
            {isHost
              ? 'Appuyez sur "Suivant" pour révéler la première réponse'
              : "En attente de l'hôte…"}
          </p>
        ) : (
          <div className="w-full max-w-sm bg-gray-800 rounded-xl p-6">
            <RevealRouter
              answer={current}
              inputType={epreuveInfo.inputType}
              compact={false}
            />
            {/* Suspicion buttons — everyone can suspect, except own answer */}
            {current.playerId !== mySocketId && (
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => addSuspicion(current.playerId, 'robot')}
                  className="flex-1 bg-blue-700 hover:bg-blue-600 text-white text-sm py-2 rounded transition"
                >
                  🤖 Suspecter Robot
                </button>
                <button
                  onClick={() => addSuspicion(current.playerId, 'ninja')}
                  className="flex-1 bg-yellow-700 hover:bg-yellow-600 text-white text-sm py-2 rounded transition"
                >
                  🥷 Suspecter Traître
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Host navigation */}
      {isHost && (
        <button
          onClick={() => socket.emit('defilement:next')}
          className="w-full bg-white text-black font-bold py-4 rounded-xl text-lg mt-4 hover:bg-gray-200 transition"
        >
          {revealedAnswers.length === 0
            ? 'Révéler la première réponse'
            : revealedAnswers.length < room.players.length
            ? 'Réponse suivante →'
            : 'Terminer le défilement →'}
        </button>
      )}
    </main>
  );
}
