'use client';
import { useState } from 'react';
import { Socket } from 'socket.io-client';
import { GameState } from '@/hooks/useGameState';

interface Props {
  socket: Socket;
  gameState: GameState;
}

export default function LobbyPhase({ socket, gameState }: Props) {
  const { room, mySocketId } = gameState;
  const [copied, setCopied] = useState(false);

  if (!room) return null;

  const isHost = room.hostSocketId === mySocketId;
  const connectedCount = room.players.filter(p => p.connected).length;
  const canStart = connectedCount >= 4;

  function handleCopy() {
    navigator.clipboard.writeText(room!.code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center p-4 z-20">

      <div
        className="paper-surface w-full"
        style={{
          maxWidth: 440,
          padding: '28px 28px 24px',
          transform: 'rotate(0.4deg)',
        }}
      >
        {/* En-tête formulaire */}
        <div
          className="font-stamp text-center mb-1"
          style={{ fontSize: '0.6rem', color: 'rgba(26,22,18,0.45)', letterSpacing: '0.14em' }}
        >
          LISTE D&apos;ACCÈS — DOSSIER CLASSIFIÉ
        </div>

        {/* Code de la salle — immense */}
        <div className="text-center mb-4">
          <div
            className="font-stamp inline-block px-5 py-2 mt-1"
            style={{
              fontSize: '3.5rem',
              letterSpacing: '0.5em',
              color: 'var(--ink-black)',
              border: '2px dashed rgba(26,22,18,0.3)',
            }}
          >
            {room.code}
          </div>

          {/* Bouton copier */}
          <div className="mt-2 flex items-center justify-center gap-2">
            <button
              onClick={handleCopy}
              className="font-stamp"
              style={{
                fontSize: '0.55rem',
                letterSpacing: '0.08em',
                color: copied ? 'var(--accent-green)' : 'rgba(26,22,18,0.5)',
                border: `1px solid ${copied ? 'var(--accent-green)' : 'rgba(26,22,18,0.25)'}`,
                background: 'transparent',
                padding: '6px 14px',
                cursor: 'pointer',
                transition: 'all 200ms cubic-bezier(0.34, 1.56, 0.64, 1)',
                transform: copied ? 'scale(1.06)' : 'scale(1)',
                boxShadow: copied ? '0 0 8px rgba(74,107,61,0.3)' : 'none',
              }}
            >
              {copied ? 'COPIÉ ✓' : 'COPIER LE CODE'}
            </button>
          </div>

          <div
            className="font-typewriter mt-1"
            style={{ fontSize: '0.6rem', color: 'rgba(26,22,18,0.4)', letterSpacing: '0.1em' }}
          >
            COMMUNIQUER AUX AGENTS
          </div>
        </div>

        <hr className="form-divider mb-4" />

        {/* En-tête liste */}
        <div
          className="font-stamp flex justify-between mb-3 text-xs uppercase tracking-widest"
          style={{ color: 'rgba(26,22,18,0.5)' }}
        >
          <span>N°</span>
          <span style={{ flex: 1, paddingLeft: 12 }}>Alias</span>
          <span>Statut</span>
        </div>

        {/* Liste des joueurs — paper-drop animé */}
        <ul className="flex flex-col gap-2 mb-5">
          {room.players.map((p, i) => (
            <li
              key={p.socketId}
              className="font-typewriter flex items-center gap-3"
              style={{
                fontSize: '0.95rem',
                color: p.connected ? 'var(--ink-black)' : 'rgba(26,22,18,0.35)',
                paddingBottom: 6,
                borderBottom: '1px solid rgba(26,22,18,0.08)',
                animation: 'paper-drop 0.4s ease-out both',
                animationDelay: `${i * 100}ms`,
              }}
            >
              {/* Numéro */}
              <span
                className="font-stamp"
                style={{ fontSize: '0.7rem', color: 'rgba(26,22,18,0.4)', minWidth: 22 }}
              >
                {String(i + 1).padStart(2, '0')}.
              </span>

              {/* Pseudo */}
              <span style={{ flex: 1 }}>
                {p.pseudo}
                {p.socketId === mySocketId && (
                  <span className="font-stamp ml-2" style={{ fontSize: '0.6rem', color: 'rgba(26,22,18,0.35)' }}>(vous)</span>
                )}
              </span>

              {/* Badge hôte */}
              {p.isHost && (
                <span
                  className="font-marker"
                  style={{ fontSize: '0.65rem', color: 'var(--stamp-red)', transform: 'rotate(-2deg)', display: 'inline-block', opacity: 0.8 }}
                >
                  RESP.
                </span>
              )}

              {/* Voyant de connexion avec pulse */}
              <span
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  background: p.connected ? 'var(--accent-green)' : 'rgba(26,22,18,0.2)',
                  boxShadow: p.connected
                    ? '0 0 8px var(--accent-green), 0 0 16px rgba(74,107,61,0.2)'
                    : '0 0 0 2px rgba(26,22,18,0.08)',
                  flexShrink: 0,
                  animation: p.connected ? 'connection-pulse 2s ease-in-out infinite' : 'none',
                }}
              />
            </li>
          ))}
        </ul>

        <hr className="form-divider mb-4" />

        {/* Zone action */}
        {isHost ? (
          <div className="flex flex-col items-center gap-2">
            {!canStart && (
              <p
                className="font-typewriter text-center"
                style={{ fontSize: '0.75rem', color: 'rgba(26,22,18,0.5)', letterSpacing: '0.05em' }}
              >
                {4 - connectedCount} agent{4 - connectedCount > 1 ? 's' : ''} manquant{4 - connectedCount > 1 ? 's' : ''}
              </p>
            )}
            <button
              onClick={() => socket.emit('game:start')}
              disabled={!canStart}
              className="btn-stamp w-full"
              style={{
                fontSize: '0.85rem',
                ...(canStart ? {} : {
                  borderColor: 'rgba(26,22,18,0.25)',
                  color: 'rgba(26,22,18,0.3)',
                  boxShadow: 'none',
                }),
              }}
            >
              LANCER L&apos;OPÉRATION
            </button>
          </div>
        ) : (
          <p
            className="font-stamp text-center text-xs uppercase tracking-widest"
            style={{ color: 'rgba(26,22,18,0.4)' }}
          >
            En attente du responsable...
          </p>
        )}
      </div>
    </main>
  );
}
