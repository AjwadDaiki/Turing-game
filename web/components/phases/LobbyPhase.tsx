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
  const connectedCount = room.players.filter(p => p.connected).length;
  const canStart = connectedCount >= 4;

  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center p-4 z-20">

      {/* Fiche principale sur papier */}
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

        {/* Code de la salle */}
        <div className="text-center mb-4">
          <div
            className="font-stamp inline-block px-4 py-1 mt-1"
            style={{
              fontSize: '2rem',
              letterSpacing: '0.35em',
              color: 'var(--ink-black)',
              border: '1.5px dashed rgba(26,22,18,0.35)',
            }}
          >
            {room.code}
          </div>
          <div
            className="font-typewriter mt-1"
            style={{ fontSize: '0.6rem', color: 'rgba(26,22,18,0.4)', letterSpacing: '0.1em' }}
          >
            CODE D&apos;ACCÈS — COMMUNIQUER AUX AGENTS
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

        {/* Liste des joueurs */}
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

              {/* Voyant de connexion */}
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: p.connected ? 'var(--accent-green)' : 'rgba(26,22,18,0.2)',
                  boxShadow: p.connected ? '0 0 6px var(--accent-green)' : 'none',
                  flexShrink: 0,
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
