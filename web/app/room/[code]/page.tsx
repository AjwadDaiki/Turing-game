'use client';
import { useParams } from 'next/navigation';
import { useSocket } from '@/hooks/useSocket';
import { useGameState } from '@/hooks/useGameState';
import GameOrchestrator from '@/components/GameOrchestrator';

export default function RoomPage() {
  const params = useParams();
  const code = params.code as string;
  const { socket } = useSocket();
  const gameState = useGameState(socket);

  if (!gameState.room) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        <p className="text-gray-400">Connexion à la salle {code}...</p>
      </main>
    );
  }

  return <GameOrchestrator socket={socket} gameState={gameState} />;
}
