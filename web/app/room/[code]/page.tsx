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
      <main className="min-h-screen flex items-center justify-center">
        <p
          className="font-stamp"
          style={{ fontSize: '0.65rem', color: 'rgba(232,220,192,0.4)', letterSpacing: '0.15em' }}
        >
          CONNEXION À LA SALLE {code}...
        </p>
      </main>
    );
  }

  return <GameOrchestrator socket={socket} gameState={gameState} />;
}
