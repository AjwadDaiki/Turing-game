'use client';
import { useState } from 'react';
import { Socket } from 'socket.io-client';
import { GameState } from '@/hooks/useGameState';
import { EpreuveInputType, RevealedAnswer } from '@/lib/clientTypes';
import RevealRouter from '../reveals/RevealRouter';

interface Props {
  socket: Socket;
  gameState: GameState;
}

// Group revealed answers by round for the mini-recap grid
function groupByRound(answers: RevealedAnswer[]): Map<number, RevealedAnswer[]> {
  const map = new Map<number, RevealedAnswer[]>();
  for (const a of answers) {
    const arr = map.get(a.roundNumber) ?? [];
    arr.push(a);
    map.set(a.roundNumber, arr);
  }
  return map;
}

export default function VotePhase({ socket, gameState }: Props) {
  const { room, mySocketId, votedPlayerIds, revealedAnswers, epreuveInfoByRound } = gameState;
  if (!room) return null;

  const hasVoted = mySocketId ? votedPlayerIds.has(mySocketId) : false;
  const candidates = room.players.filter((p) => p.socketId !== mySocketId);
  const [robotTarget, setRobotTarget] = useState('');
  const [ninjaTarget, setNinjaTarget] = useState('');

  const grouped = groupByRound(revealedAnswers);
  const votedCount = votedPlayerIds.size;
  const totalVoters = room.players.length;

  function handleVote() {
    if (!robotTarget || !ninjaTarget || hasVoted) return;
    socket.emit('vote:final', { robotTargetId: robotTarget, ninjaTargetId: ninjaTarget });
  }

  if (hasVoted) {
    return (
      <main className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-6 gap-6">
        <p className="text-green-400 font-bold text-lg">Vote envoyé ✓</p>
        <p className="text-gray-400 text-sm">{votedCount}/{totalVoters} joueurs ont voté</p>
        <div className="flex gap-2">
          {room.players.map((p) => (
            <div
              key={p.socketId}
              title={p.pseudo}
              className={`w-3 h-3 rounded-full ${
                votedPlayerIds.has(p.socketId) ? 'bg-green-400' : 'bg-gray-600'
              }`}
            />
          ))}
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-900 text-white flex flex-col overflow-y-auto">
      {/* Mini recap grid */}
      {grouped.size > 0 && (
        <div className="border-b border-gray-800 p-4">
          <p className="text-gray-500 text-xs uppercase tracking-wider mb-3">Rappel des réponses</p>
          <div className="space-y-3">
            {Array.from(grouped.entries())
              .sort(([a], [b]) => a - b)
              .map(([roundNum, answers]) => {
                const info = epreuveInfoByRound[roundNum];
                const inputType: EpreuveInputType = info?.inputType ?? 'text';
                return (
                  <div key={roundNum}>
                    <p className="text-gray-600 text-xs mb-1">Manche {roundNum}</p>
                    <div className="grid grid-cols-3 gap-1.5">
                      {answers.map((ans) => (
                        <div key={ans.playerId} className="bg-gray-800 rounded p-2 min-w-0">
                          <RevealRouter answer={ans} inputType={inputType} compact />
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Vote form */}
      <div className="p-4 space-y-5 max-w-sm mx-auto w-full">
        <div className="pt-2">
          <h2 className="text-xl font-bold text-center">Vote final</h2>
          <p className="text-gray-400 text-xs text-center mt-1">Qui est le Robot ? Qui est le Traître ?</p>
        </div>

        {/* Robot */}
        <div>
          <p className="text-blue-400 font-bold mb-2">🤖 Le Robot, c&apos;est…</p>
          <div className="space-y-2">
            {candidates.map((p) => (
              <button
                key={p.socketId}
                onClick={() => setRobotTarget(p.socketId)}
                className={`w-full text-left px-4 py-3 rounded-lg border transition ${
                  robotTarget === p.socketId
                    ? 'border-blue-400 bg-blue-400/10 text-white font-bold'
                    : 'border-gray-700 bg-gray-800 text-gray-300 hover:border-gray-500'
                }`}
              >
                {p.pseudo}
              </button>
            ))}
          </div>
        </div>

        {/* Ninja */}
        <div>
          <p className="text-yellow-400 font-bold mb-2">🥷 Le Traître, c&apos;est…</p>
          <div className="space-y-2">
            {candidates.map((p) => (
              <button
                key={p.socketId}
                onClick={() => setNinjaTarget(p.socketId)}
                className={`w-full text-left px-4 py-3 rounded-lg border transition ${
                  ninjaTarget === p.socketId
                    ? 'border-yellow-400 bg-yellow-400/10 text-white font-bold'
                    : 'border-gray-700 bg-gray-800 text-gray-300 hover:border-gray-500'
                }`}
              >
                {p.pseudo}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleVote}
          disabled={!robotTarget || !ninjaTarget}
          className="w-full bg-white text-black font-bold py-4 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-200 transition"
        >
          Confirmer le vote
        </button>
      </div>
    </main>
  );
}
