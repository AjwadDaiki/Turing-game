'use client';
import { GameState } from '@/hooks/useGameState';

interface Props {
  gameState: GameState;
}

export default function IntroPhase({ gameState }: Props) {
  const { role, codename } = gameState;

  return (
    <main className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-6 text-center">
      <p className="text-gray-400 text-sm uppercase tracking-wider mb-6">Votre rôle</p>
      {role === 'traitre' ? (
        <div className="space-y-4">
          <div className="text-7xl">🥷</div>
          <p className="text-3xl font-bold text-yellow-400 tracking-widest">TRAÎTRE</p>
          <p className="text-gray-400">
            Votre alias :{' '}
            <span className="text-white font-bold">{codename}</span>
          </p>
          <p className="text-sm text-gray-500 max-w-xs mt-4">
            Répondez de façon légèrement décalée pour brouiller les pistes.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="text-7xl">👤</div>
          <p className="text-3xl font-bold text-blue-400 tracking-widest">CIVIL</p>
          <p className="text-sm text-gray-500 max-w-xs mt-4">
            Répondez honnêtement. Débusquez le Robot et le Traître parmi vous.
          </p>
        </div>
      )}
    </main>
  );
}
