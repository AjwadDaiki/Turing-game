'use client';
import { useState } from 'react';
import { Socket } from 'socket.io-client';
import { GameState } from '@/hooks/useGameState';
import { RevealedAnswer } from '@/lib/clientTypes';
import RevealRouter from '../reveals/RevealRouter';

interface Props {
  socket: Socket;
  gameState: GameState;
}

/* Rotation déterministe par position */
const ROTATIONS = [-2.5, 1.8, -1.2, 3.1, -2.8, 1.4, -3.2, 2.0, -0.8, 2.6, -1.6, 3.4];
const STAMP_ROTS = [-8, 7, -12, 9, -6, 11, -9, 8];

/* ─── Polaroid individuel ──────────────────────────────────────────────────── */
function Polaroid({
  answer,
  inputType,
  index,
  mySocketId,
  onSuspect,
  suspicionState,
}: {
  answer: RevealedAnswer;
  inputType: string;
  index: number;
  mySocketId: string | null;
  onSuspect: (targetId: string, type: 'robot' | 'ninja') => void;
  suspicionState: { robot: boolean; ninja: boolean };
}) {
  const rot = ROTATIONS[index % ROTATIONS.length];
  const isOwnAnswer = answer.playerId === mySocketId;

  const robotStampRot = STAMP_ROTS[(index * 3) % STAMP_ROTS.length];
  const ninjaStampRot = STAMP_ROTS[(index * 3 + 1) % STAMP_ROTS.length];

  return (
    <div
      className="relative flex-shrink-0"
      style={{
        transform: `rotate(${rot}deg)`,
        transition: 'transform 0.2s ease',
        animation: 'paper-drop 0.4s ease-out both',
        animationDelay: `${index * 60}ms`,
      }}
    >
      {/* Corps du polaroid */}
      <div
        style={{
          background: 'var(--paper-white)',
          padding: '14px 14px 44px',
          boxShadow:
            '0 1px 2px rgba(0,0,0,0.2), 0 4px 10px rgba(0,0,0,0.3), 0 12px 28px rgba(0,0,0,0.35)',
          width: 200,
          minHeight: 220,
          position: 'relative',
        }}
      >
        {/* Zone contenu */}
        <div
          style={{
            background: '#D4C8A8',
            minHeight: 140,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            padding: 8,
          }}
        >
          <RevealRouter answer={answer} inputType={inputType as any} compact />
        </div>

        {/* Pseudo masqué — affiche ??? */}
        <div
          className="font-typewriter text-center"
          style={{
            position: 'absolute',
            bottom: 12,
            left: 0,
            right: 0,
            fontSize: '0.7rem',
            color: 'rgba(26,22,18,0.35)',
            letterSpacing: '0.08em',
          }}
        >
          SUJET N°{String(index + 1).padStart(2, '0')}
        </div>

        {/* Tampon ROBOT posé */}
        {suspicionState.robot && (
          <div
            className="stamp-mark stamp-mark--blue font-marker"
            style={{
              position: 'absolute',
              top: '28%',
              left: '50%',
              transform: `translate(-50%, -50%) rotate(${robotStampRot}deg)`,
              fontSize: '0.9rem',
              whiteSpace: 'nowrap',
              lineHeight: 1,
              animation: 'stamp-drop 0.35s cubic-bezier(0.34,1.56,0.64,1)',
              pointerEvents: 'none',
            }}
          >
            ROBOT ?
          </div>
        )}

        {/* Tampon COMPLICE posé */}
        {suspicionState.ninja && (
          <div
            className="stamp-mark font-marker"
            style={{
              position: 'absolute',
              top: '58%',
              left: '50%',
              transform: `translate(-50%, -50%) rotate(${ninjaStampRot}deg)`,
              fontSize: '0.9rem',
              whiteSpace: 'nowrap',
              lineHeight: 1,
              animation: 'stamp-drop 0.35s cubic-bezier(0.34,1.56,0.64,1)',
              pointerEvents: 'none',
            }}
          >
            COMPLICE ?
          </div>
        )}
      </div>

      {/* Boutons de suspicion — sous le polaroid, avec labels */}
      {!isOwnAnswer && (
        <div
          className="flex justify-center gap-3 mt-2"
        >
          <button
            onClick={() => onSuspect(answer.playerId, 'robot')}
            disabled={suspicionState.robot}
            className="font-stamp"
            style={{
              padding: '4px 10px',
              fontSize: '0.55rem',
              letterSpacing: '0.08em',
              background: suspicionState.robot ? 'rgba(26,58,122,0.15)' : 'rgba(26,58,122,0.85)',
              border: '1.5px solid #1A3A7A',
              color: suspicionState.robot ? '#1A3A7A' : 'var(--paper-cream)',
              cursor: suspicionState.robot ? 'default' : 'pointer',
              transition: 'all 80ms ease',
            }}
          >
            ROBOT
          </button>
          <button
            onClick={() => onSuspect(answer.playerId, 'ninja')}
            disabled={suspicionState.ninja}
            className="font-stamp"
            style={{
              padding: '4px 10px',
              fontSize: '0.55rem',
              letterSpacing: '0.08em',
              background: suspicionState.ninja ? 'rgba(176,38,28,0.15)' : 'rgba(176,38,28,0.85)',
              border: '1.5px solid var(--stamp-red)',
              color: suspicionState.ninja ? 'var(--stamp-red)' : 'var(--paper-cream)',
              cursor: suspicionState.ninja ? 'default' : 'pointer',
              transition: 'all 80ms ease',
            }}
          >
            COMPLICE
          </button>
        </div>
      )}
    </div>
  );
}

/* ─── DefilementPhase ─────────────────────────────────────────────────────── */
export default function DefilementPhase({ socket, gameState }: Props) {
  const { revealedAnswers, epreuveInfo, room, mySocketId } = gameState;
  if (!epreuveInfo || !room) return null;

  const isHost = room.hostSocketId === mySocketId;
  const totalAnswers = room.players.length;

  const [suspicions, setSuspicions] = useState<Record<string, { robot: boolean; ninja: boolean }>>({});

  function addSuspicion(targetPlayerId: string, type: 'robot' | 'ninja') {
    setSuspicions(prev => ({
      ...prev,
      [targetPlayerId]: { ...(prev[targetPlayerId] ?? { robot: false, ninja: false }), [type]: true },
    }));
    socket.emit('suspicion:add', { targetPlayerId, type });
  }

  const isAllRevealed = revealedAnswers.length >= totalAnswers;

  function handleHostClick() {
    if (!isHost) return;
    socket.emit('defilement:next');
  }

  return (
    <main
      className="relative min-h-screen flex flex-col z-20 overflow-hidden"
      onClick={handleHostClick}
      onKeyDown={e => { if (isHost && (e.key === 'Enter' || e.key === ' ')) handleHostClick(); }}
      role={isHost ? 'button' : undefined}
      tabIndex={isHost ? 0 : undefined}
      style={{ cursor: isHost ? 'pointer' : 'default' }}
    >
      {/* Barre top */}
      <div
        className="flex items-center justify-between px-4 py-2 font-stamp"
        style={{
          fontSize: '0.65rem',
          color: 'var(--paper-cream)',
          opacity: 0.55,
          letterSpacing: '0.1em',
          borderBottom: '1px solid rgba(232,220,192,0.08)',
          flexShrink: 0,
        }}
      >
        <span>MANCHE {String(epreuveInfo.roundNumber).padStart(2, '0')}/05 — PIÈCES À CONVICTION</span>
        <span>{revealedAnswers.length}/{totalAnswers}</span>
      </div>

      {/* Zone polaroids */}
      <div className="flex-1 flex items-center justify-center p-4 pb-20">
        {revealedAnswers.length === 0 ? (
          <div className="text-center">
            {/* Pile de polaroids vierges */}
            <div
              className="relative inline-block mb-8"
              style={{ width: 200, height: 240, animation: 'polaroid-breathe 3s ease-in-out infinite' }}
            >
              {[3, 2, 1, 0].map(i => (
                <div
                  key={i}
                  style={{
                    position: i === 0 ? 'relative' : 'absolute',
                    top: i * 3,
                    left: i * 2,
                    width: 200,
                    height: 240,
                    background: 'var(--paper-white)',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.3), 0 8px 24px rgba(0,0,0,0.25)',
                    transform: `rotate(${(i - 2) * 1.5}deg)`,
                    padding: '14px 14px 50px',
                  }}
                >
                  <div style={{ height: '100%', background: '#D4C8A8', opacity: 0.4 }} />
                </div>
              ))}
            </div>
            <p
              className="font-stamp"
              style={{ fontSize: '0.7rem', color: 'var(--paper-cream)', opacity: 0.5, letterSpacing: '0.1em' }}
            >
              {isHost ? 'CLIQUEZ POUR RÉVÉLER LES PIÈCES' : "EN ATTENTE DE L'ENQUÊTEUR EN CHEF..."}
            </p>
          </div>
        ) : (
          /* Grille lâche de polaroids */
          <div
            className="flex flex-wrap justify-center"
            style={{ gap: '2.5rem', maxWidth: 800 }}
            onClick={e => e.stopPropagation()} /* empêche le click-anywhere sur les polaroids */
          >
            {revealedAnswers.map((answer, i) => (
              <Polaroid
                key={answer.playerId}
                answer={answer}
                inputType={epreuveInfo.inputType}
                index={i}
                mySocketId={mySocketId}
                onSuspect={addSuspicion}
                suspicionState={suspicions[answer.playerId] ?? { robot: false, ninja: false }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Hint cliquable pour l'hôte — sticky bottom */}
      {isHost && (
        <div
          className="fixed bottom-0 left-0 right-0 z-30 text-center py-4 font-stamp"
          style={{
            fontSize: '0.6rem',
            color: 'var(--paper-cream)',
            opacity: 0.3,
            letterSpacing: '0.15em',
            background: 'linear-gradient(transparent, rgba(28,32,29,0.6))',
            pointerEvents: 'none',
          }}
        >
          {isAllRevealed ? 'CLIQUER POUR CONTINUER ▸' : 'CLIQUER POUR RÉVÉLER ▸'}
        </div>
      )}
    </main>
  );
}
