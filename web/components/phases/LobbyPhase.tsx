'use client';
import { useState } from 'react';
import { Socket } from 'socket.io-client';
import { GameState } from '@/hooks/useGameState';

interface Props {
  socket: Socket;
  gameState: GameState;
}

const MIN_PLAYERS = 4;
const MAX_SLOTS = 8;

export default function LobbyPhase({ socket, gameState }: Props) {
  const { room, mySocketId } = gameState;
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  if (!room) return null;

  const isHost = room.hostSocketId === mySocketId;
  const connectedCount = room.players.filter(p => p.connected).length;
  const canStart = connectedCount >= MIN_PLAYERS;
  const emptySlots = Math.max(0, MIN_PLAYERS - room.players.length);

  const shareUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/room/${room.code}`
    : '';

  function handleCopyCode() {
    navigator.clipboard.writeText(room!.code).then(() => {
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    });
  }

  function handleCopyLink() {
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    });
  }

  function handleNativeShare() {
    if (navigator.share) {
      navigator.share({
        title: 'OPÉRATION TURING',
        text: `Rejoins l'opération ! Code : ${room!.code}`,
        url: shareUrl,
      }).catch(() => {});
    } else {
      handleCopyLink();
    }
  }

  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center p-4 z-20">
      <div
        className="paper-surface w-full"
        style={{
          maxWidth: 480,
          padding: '28px 28px 24px',
          transform: 'rotate(0.3deg)',
        }}
      >
        {/* ── En-tête officiel ──────────────────────────── */}
        <div className="text-center mb-2">
          <div
            className="font-stamp"
            style={{ fontSize: '0.48rem', color: 'rgba(26,22,18,0.4)', letterSpacing: '0.16em' }}
          >
            SALLE D&apos;OPÉRATIONS — TURING
          </div>
        </div>

        {/* ── Code de la salle ──────────────────────────── */}
        <div className="text-center mb-3">
          <div
            className="font-stamp inline-block px-6 py-2"
            style={{
              fontSize: 'clamp(2.2rem, 8vw, 3.5rem)',
              letterSpacing: '0.5em',
              color: 'var(--ink-black)',
              border: '2px dashed rgba(26,22,18,0.3)',
              cursor: 'pointer',
            }}
            onClick={handleCopyCode}
            title="Cliquer pour copier"
          >
            {room.code}
          </div>
        </div>

        {/* ── Boutons de partage ────────────────────────── */}
        <div className="flex gap-2 justify-center mb-5">
          <button
            onClick={handleCopyCode}
            className="font-stamp"
            style={{
              fontSize: '0.5rem',
              letterSpacing: '0.06em',
              color: copiedCode ? 'var(--accent-green)' : 'rgba(26,22,18,0.5)',
              border: `1px solid ${copiedCode ? 'var(--accent-green)' : 'rgba(26,22,18,0.2)'}`,
              background: 'transparent',
              padding: '5px 12px',
              cursor: 'pointer',
              transition: 'all 200ms cubic-bezier(0.34, 1.56, 0.64, 1)',
              transform: copiedCode ? 'scale(1.05)' : 'scale(1)',
            }}
          >
            {copiedCode ? 'CODE COPIÉ ✓' : 'COPIER CODE'}
          </button>
          <button
            onClick={handleNativeShare}
            className="font-stamp"
            style={{
              fontSize: '0.5rem',
              letterSpacing: '0.06em',
              color: copiedLink ? 'var(--accent-green)' : 'rgba(26,22,18,0.5)',
              border: `1px solid ${copiedLink ? 'var(--accent-green)' : 'rgba(26,22,18,0.2)'}`,
              background: 'transparent',
              padding: '5px 12px',
              cursor: 'pointer',
              transition: 'all 200ms cubic-bezier(0.34, 1.56, 0.64, 1)',
              transform: copiedLink ? 'scale(1.05)' : 'scale(1)',
            }}
          >
            {copiedLink ? 'LIEN COPIÉ ✓' : 'PARTAGER LIEN'}
          </button>
        </div>

        <hr className="form-divider mb-4" />

        {/* ── En-tête liste ────────────────────────────── */}
        <div
          className="font-stamp flex justify-between mb-3"
          style={{ fontSize: '0.5rem', color: 'rgba(26,22,18,0.45)', letterSpacing: '0.1em' }}
        >
          <span style={{ minWidth: 28 }}>N°</span>
          <span style={{ flex: 1, paddingLeft: 8 }}>AGENT</span>
          <span style={{ minWidth: 42, textAlign: 'right' }}>STATUT</span>
        </div>

        {/* ── Joueurs connectés ────────────────────────── */}
        <ul className="flex flex-col gap-0 mb-2">
          {room.players.map((p, i) => (
            <li
              key={p.socketId}
              className="font-typewriter flex items-center gap-3"
              style={{
                fontSize: '1rem',
                color: p.connected ? 'var(--ink-black)' : 'rgba(26,22,18,0.3)',
                padding: '8px 0',
                borderBottom: '1px solid rgba(26,22,18,0.08)',
                animation: 'paper-drop 0.4s ease-out both',
                animationDelay: `${i * 80}ms`,
              }}
            >
              {/* Numéro */}
              <span
                className="font-stamp"
                style={{ fontSize: '0.65rem', color: 'rgba(26,22,18,0.35)', minWidth: 28 }}
              >
                {String(i + 1).padStart(2, '0')}.
              </span>

              {/* Pseudo */}
              <span style={{ flex: 1, fontWeight: p.socketId === mySocketId ? 700 : 400 }}>
                {p.pseudo}
                {p.socketId === mySocketId && (
                  <span
                    className="font-stamp ml-2"
                    style={{ fontSize: '0.5rem', color: 'rgba(26,22,18,0.3)', fontWeight: 400 }}
                  >
                    (vous)
                  </span>
                )}
              </span>

              {/* Badge hôte */}
              {p.isHost && (
                <span
                  className="stamp-mark font-marker"
                  style={{
                    fontSize: '0.5rem',
                    padding: '1px 6px',
                    border: '1.5px solid var(--stamp-red)',
                    transform: 'rotate(-2deg)',
                  }}
                >
                  CHEF
                </span>
              )}

              {/* Voyant */}
              <span
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  background: p.connected ? 'var(--accent-green)' : 'rgba(26,22,18,0.15)',
                  boxShadow: p.connected
                    ? '0 0 8px var(--accent-green), 0 0 16px rgba(74,107,61,0.2)'
                    : 'none',
                  flexShrink: 0,
                  animation: p.connected ? 'connection-pulse 2s ease-in-out infinite' : 'none',
                }}
              />
            </li>
          ))}

          {/* ── Slots vides ────────────────────────────── */}
          {Array.from({ length: emptySlots }, (_, i) => (
            <li
              key={`empty-${i}`}
              className="font-typewriter flex items-center gap-3"
              style={{
                fontSize: '1rem',
                padding: '8px 0',
                borderBottom: '1px solid rgba(26,22,18,0.06)',
                opacity: 0.3,
              }}
            >
              <span
                className="font-stamp"
                style={{ fontSize: '0.65rem', color: 'rgba(26,22,18,0.3)', minWidth: 28 }}
              >
                {String(room.players.length + i + 1).padStart(2, '0')}.
              </span>
              <span style={{ flex: 1, color: 'rgba(26,22,18,0.2)' }}>
                ···············
              </span>
              <span
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  background: 'rgba(26,22,18,0.08)',
                  flexShrink: 0,
                }}
              />
            </li>
          ))}
        </ul>

        {/* ── Compteur ──────────────────────────────────── */}
        <div
          className="font-stamp text-center mb-4"
          style={{ fontSize: '0.5rem', color: 'rgba(26,22,18,0.4)', letterSpacing: '0.1em' }}
        >
          {connectedCount} / {MIN_PLAYERS} AGENTS MINIMUM
          {connectedCount > MIN_PLAYERS && ` — ${connectedCount} CONNECTÉS`}
        </div>

        <hr className="form-divider mb-4" />

        {/* ── Zone action ───────────────────────────────── */}
        {isHost ? (
          <div className="flex flex-col items-center gap-3">
            {!canStart && (
              <p
                className="font-typewriter text-center"
                style={{ fontSize: '0.75rem', color: 'rgba(26,22,18,0.5)', letterSpacing: '0.04em' }}
              >
                Encore {MIN_PLAYERS - connectedCount} agent{MIN_PLAYERS - connectedCount > 1 ? 's' : ''} requis
              </p>
            )}
            <button
              onClick={() => socket.emit('game:start')}
              disabled={!canStart}
              className="btn-stamp w-full"
              style={{
                fontSize: '0.9rem',
                padding: '14px 24px',
                ...(canStart ? {} : {
                  borderColor: 'rgba(26,22,18,0.2)',
                  color: 'rgba(26,22,18,0.25)',
                  boxShadow: 'none',
                }),
              }}
            >
              LANCER L&apos;OPÉRATION
            </button>
          </div>
        ) : (
          <div className="text-center">
            <p
              className="font-stamp text-xs uppercase tracking-widest"
              style={{ color: 'rgba(26,22,18,0.4)', letterSpacing: '0.1em' }}
            >
              En attente du chef d&apos;opération...
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
