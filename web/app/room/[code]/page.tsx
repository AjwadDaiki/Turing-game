'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useSocket } from '@/hooks/useSocket';
import { useGameState } from '@/hooks/useGameState';
import GameOrchestrator from '@/components/GameOrchestrator';
import DeskDecor from '@/components/DeskDecor';

export default function RoomPage() {
  const params = useParams();
  const code = (params.code as string).toUpperCase();
  const { socket, connected } = useSocket();
  const gameState = useGameState(socket);

  const [pseudo, setPseudo] = useState('');
  const [error, setError] = useState('');
  const [joining, setJoining] = useState(false);

  /* Écouter les erreurs serveur */
  useEffect(() => {
    function onError({ message }: { message: string }) {
      setError(message);
      setJoining(false);
    }
    socket.on('error', onError);
    return () => { socket.off('error', onError); };
  }, [socket]);

  function handleJoin(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    const trimmed = pseudo.trim();
    if (!trimmed) { setError('ENTREZ VOTRE ALIAS'); return; }
    setJoining(true);
    socket.emit('room:join', { pseudo: trimmed, code });
  }

  /* Si déjà dans la room → afficher le jeu */
  if (gameState.room) {
    return <GameOrchestrator socket={socket} gameState={gameState} />;
  }

  /* Sinon → formulaire de join direct */
  return (
    <main className="min-h-screen relative flex flex-col items-center justify-center p-4">
      <DeskDecor />

      <div className="relative z-20 w-full max-w-md flex flex-col items-center gap-6">

        {/* Titre + code */}
        <div className="text-center">
          <h1
            className="font-stamp"
            style={{
              fontSize: 'clamp(2rem, 7vw, 3rem)',
              color: 'var(--lamp-orange-glow)',
              letterSpacing: '0.25em',
              textShadow: '0 0 60px rgba(232,149,74,0.65), 0 0 100px rgba(232,149,74,0.25), 2px 2px 4px rgba(0,0,0,0.6)',
              animation: 'title-glow 4s ease-in-out infinite',
              lineHeight: 1,
            }}
          >
            TURING
          </h1>
          <p
            className="font-typewriter mt-1"
            style={{ color: 'var(--paper-cream)', opacity: 0.45, fontSize: '0.6rem', letterSpacing: '0.12em' }}
          >
            REJOINDRE UNE OPÉRATION
          </p>
        </div>

        {/* Fiche papier */}
        <div
          className="paper-surface w-full"
          style={{
            padding: '28px 28px 24px',
            transform: 'rotate(-0.3deg)',
          }}
        >
          {/* En-tête */}
          <div className="font-stamp text-center mb-4 pb-3" style={{ borderBottom: '1px solid rgba(26,22,18,0.2)' }}>
            <div style={{ fontSize: '0.5rem', color: 'rgba(26,22,18,0.4)', letterSpacing: '0.12em' }}>
              DOSSIER EN COURS — ACCÈS DEMANDÉ
            </div>
          </div>

          {/* Code de la salle — gros et visible */}
          <div className="text-center mb-5">
            <div
              className="font-stamp"
              style={{ fontSize: '0.5rem', color: 'rgba(26,22,18,0.4)', letterSpacing: '0.14em', marginBottom: 6 }}
            >
              CODE OPÉRATION
            </div>
            <div
              className="font-stamp inline-block px-5 py-2"
              style={{
                fontSize: '2.8rem',
                letterSpacing: '0.45em',
                color: 'var(--ink-black)',
                border: '2px dashed rgba(26,22,18,0.3)',
              }}
            >
              {code}
            </div>
          </div>

          <hr className="form-divider mb-5" />

          {/* Formulaire pseudo */}
          <form onSubmit={handleJoin} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label
                className="font-stamp text-xs uppercase tracking-widest"
                style={{ color: 'var(--ink-black)', opacity: 0.55, fontSize: '0.55rem' }}
              >
                Votre alias pour cette opération
              </label>
              <input
                className="field-line"
                style={{ fontSize: '1.2rem', letterSpacing: '0.08em', textAlign: 'center' }}
                value={pseudo}
                onChange={e => setPseudo(e.target.value)}
                placeholder="ex: AGENT-07"
                maxLength={20}
                autoFocus
                autoComplete="off"
                spellCheck={false}
                disabled={joining}
              />
            </div>

            {error && (
              <div style={{ animation: 'error-shake 0.4s ease-out' }}>
                <p
                  className="font-marker text-center"
                  style={{ color: 'var(--stamp-red)', fontSize: '0.75rem', transform: 'rotate(-1deg)' }}
                >
                  {error}
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={!connected || joining}
              className="btn-stamp w-full"
              style={{ fontSize: '0.9rem' }}
            >
              {!connected
                ? 'CONNEXION...'
                : joining
                ? 'ACCÈS EN COURS...'
                : 'REJOINDRE L\u0027OPÉRATION'}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
