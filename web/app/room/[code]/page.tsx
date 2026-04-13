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

  /* Skeleton immédiat avec le code (connu depuis l'URL) pendant connexion socket */
  if (!gameState.room) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center p-4">
        <div
          className="paper-surface w-full"
          style={{
            maxWidth: 440,
            padding: '28px 28px 24px',
            transform: 'rotate(0.4deg)',
          }}
        >
          {/* En-tête */}
          <div
            className="font-stamp text-center mb-1"
            style={{ fontSize: '0.6rem', color: 'rgba(26,22,18,0.45)', letterSpacing: '0.14em' }}
          >
            LISTE D&apos;ACCÈS — DOSSIER CLASSIFIÉ
          </div>

          {/* Code de salle affiché immédiatement */}
          <div className="text-center mb-4">
            <div
              className="font-stamp inline-block px-4 py-1 mt-1"
              style={{
                fontSize: '3.5rem',
                letterSpacing: '0.5em',
                color: 'var(--ink-black)',
                border: '2px dashed rgba(26,22,18,0.3)',
              }}
            >
              {code.toUpperCase()}
            </div>
          </div>

          <hr className="form-divider mb-4" />

          {/* Slots vides en attente */}
          <div className="flex flex-col gap-3 mb-4">
            {[1, 2, 3, 4].map(i => (
              <div
                key={i}
                className="flex items-center gap-3"
                style={{
                  paddingBottom: 6,
                  borderBottom: '1px dashed rgba(26,22,18,0.12)',
                  opacity: 0.35,
                }}
              >
                <span
                  className="font-stamp"
                  style={{ fontSize: '0.7rem', color: 'rgba(26,22,18,0.4)', minWidth: 22 }}
                >
                  {String(i).padStart(2, '0')}.
                </span>
                <span
                  className="font-typewriter"
                  style={{ flex: 1, fontSize: '0.85rem', color: 'rgba(26,22,18,0.25)' }}
                >
                  ···············
                </span>
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: 'rgba(26,22,18,0.12)',
                    flexShrink: 0,
                  }}
                />
              </div>
            ))}
          </div>

          <div
            className="font-stamp text-center"
            style={{
              fontSize: '0.55rem',
              color: 'rgba(26,22,18,0.4)',
              letterSpacing: '0.12em',
              animation: 'blink 1.5s step-end infinite',
            }}
          >
            CONNEXION AU DOSSIER EN COURS...
          </div>
        </div>
      </main>
    );
  }

  return <GameOrchestrator socket={socket} gameState={gameState} />;
}
