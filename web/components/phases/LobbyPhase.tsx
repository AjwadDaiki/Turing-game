'use client';
import { Socket } from 'socket.io-client';
import { GameState } from '@/hooks/useGameState';

interface Props {
  socket: Socket;
  gameState: GameState;
}

export default function LobbyPhase({ socket, gameState }: Props) {
  const { room, mySocketId } = gameState;
  if (!room) return null;

  const isHost = room.hostSocketId === mySocketId;
  const connectedCount = room.players.filter((p) => p.connected).length;
  const canStart = connectedCount >= 4;

  return (
    <main className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-6">
      <h1 className="text-5xl font-bold tracking-widest mb-2">TURING</h1>
      <p className="text-gray-400 mb-1 text-sm">Salle</p>
      <p className="font-mono font-bold text-3xl tracking-widest mb-8">{room.code}</p>

      <div className="w-full max-w-xs bg-gray-800 rounded-xl p-4 mb-8">
        <h2 className="text-gray-400 text-xs uppercase tracking-wider mb-3">
          Joueurs ({connectedCount})
        </h2>
        <ul className="space-y-2">
          {room.players.map((p) => (
            <li key={p.socketId} className="flex items-center gap-2">
              <span
                className={`w-2 h-2 rounded-full flex-shrink-0 ${
                  p.connected ? 'bg-green-400' : 'bg-gray-600'
                }`}
              />
              <span className={p.connected ? 'text-white' : 'text-gray-500'}>{p.pseudo}</span>
              {p.socketId === mySocketId && (
                <span className="text-gray-500 text-xs">(moi)</span>
              )}
              {p.isHost && (
                <span className="ml-auto text-yellow-400 text-xs">Hôte</span>
              )}
            </li>
          ))}
        </ul>
        {connectedCount < 4 && (
          <p className="text-gray-500 text-xs mt-3 text-center">
            Il faut {4 - connectedCount} joueur{4 - connectedCount > 1 ? 's' : ''} de plus
          </p>
        )}
      </div>

      {isHost ? (
        <button
          onClick={() => socket.emit('game:start')}
          disabled={!canStart}
          className="bg-white text-black font-bold px-10 py-3 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-200 transition"
        >
          {canStart ? 'Lancer la partie' : `Attente de joueurs...`}
        </button>
      ) : (
        <p className="text-gray-500 text-sm">En attente que l&apos;hôte lance la partie…</p>
      )}
    </main>
  );
}
