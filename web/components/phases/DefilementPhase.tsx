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

/* Rotation déterministe par position pour éviter les flashes */
const ROTATIONS = [-2.5, 1.8, -1.2, 3.1, -2.8, 1.4, -3.2, 2.0, -0.8, 2.6, -1.6, 3.4];
const STAMP_ROTS  = [-8, 7, -12, 9, -6, 11, -9, 8];

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

  /* Tampons déjà posés */
  const robotStampRot = STAMP_ROTS[(index * 3) % STAMP_ROTS.length];
  const ninjaStampRot = STAMP_ROTS[(index * 3 + 1) % STAMP_ROTS.length];

  return (
    <div
      className="relative flex-shrink-0"
      style={{
        transform: `rotate(${rot}deg)`,
        transition: 'transform 0.2s ease',
        animation: 'paper-drop 0.4s ease-out',
      }}
    >
      {/* Corps du polaroid */}
      <div
        style={{
          background: 'var(--paper-white)',
          padding: '10px 10px 32px',
          boxShadow: '4px 6px 20px rgba(0,0,0,0.5), 0 1px 3px rgba(0,0,0,0.3)',
          width: 160,
          minHeight: 180,
          position: 'relative',
        }}
      >
        {/* Zone contenu */}
        <div
          style={{
            background: '#D4C8A8',
            minHeight: 110,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            padding: 6,
          }}
        >
          <RevealRouter answer={answer} inputType={inputType as any} compact />
        </div>

        {/* Étiquette pseudo */}
        <div
          className="font-typewriter text-center"
          style={{
            position: 'absolute',
            bottom: 8,
            left: 0, right: 0,
            fontSize: '0.62rem',
            color: 'rgba(26,22,18,0.7)',
            letterSpacing: '0.06em',
          }}
        >
          {answer.pseudo ?? 'SUJET'}
        </div>

        {/* Tampon ROBOT posé */}
        {suspicionState.robot && (
          <div
            className="font-marker"
            style={{
              position: 'absolute',
              top: '30%', left: '50%',
              transform: `translate(-50%, -50%) rotate(${robotStampRot}deg)`,
              color: '#1A3A7A',
              fontSize: '1rem',
              border: '2.5px solid #1A3A7A',
              padding: '2px 6px',
              opacity: 0.82,
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
            className="font-marker"
            style={{
              position: 'absolute',
              top: '60%', left: '50%',
              transform: `translate(-50%, -50%) rotate(${ninjaStampRot}deg)`,
              color: 'var(--stamp-red)',
              fontSize: '1rem',
              border: '2.5px solid var(--stamp-red)',
              padding: '2px 6px',
              opacity: 0.82,
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

      {/* Boutons de suspicion — en coin du polaroid, visible sur mobile, hover sur desktop */}
      {!isOwnAnswer && (
        <div
          className="absolute -bottom-7 left-0 right-0 flex justify-center gap-2"
          style={{ opacity: 1 }}
        >
          <button
            onClick={() => onSuspect(answer.playerId, 'robot')}
            disabled={suspicionState.robot}
            title="Suspecter Robot"
            style={{
              width: 26, height: 26,
              borderRadius: '50%',
              background: suspicionState.robot ? 'rgba(26,58,122,0.2)' : 'rgba(26,58,122,0.85)',
              border: '1.5px solid #1A3A7A',
              color: 'var(--paper-cream)',
              fontSize: '0.65rem',
              cursor: suspicionState.robot ? 'default' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 80ms ease',
            }}
          >
            🤖
          </button>
          <button
            onClick={() => onSuspect(answer.playerId, 'ninja')}
            disabled={suspicionState.ninja}
            title="Suspecter Complice"
            style={{
              width: 26, height: 26,
              borderRadius: '50%',
              background: suspicionState.ninja ? 'rgba(176,38,28,0.2)' : 'rgba(176,38,28,0.85)',
              border: '1.5px solid var(--stamp-red)',
              color: 'var(--paper-cream)',
              fontSize: '0.65rem',
              cursor: suspicionState.ninja ? 'default' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 80ms ease',
            }}
          >
            🥷
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

  /* Suspicions locales par playerId : {robot, ninja} */
  const [suspicions, setSuspicions] = useState<Record<string, { robot: boolean; ninja: boolean }>>({});

  function addSuspicion(targetPlayerId: string, type: 'robot' | 'ninja') {
    setSuspicions(prev => ({
      ...prev,
      [targetPlayerId]: { ...( prev[targetPlayerId] ?? { robot: false, ninja: false }), [type]: true },
    }));
    socket.emit('suspicion:add', { targetPlayerId, type });
  }

  const isAllRevealed = revealedAnswers.length >= totalAnswers;

  return (
    <main className="relative min-h-screen flex flex-col z-20 overflow-hidden">
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
        <span>MANCHE {String(epreuveInfo.roundNumber).padStart(2, '0')}/05 — DÉFILEMENT</span>
        <span>{revealedAnswers.length}/{totalAnswers}</span>
      </div>

      {/* Zone polaroids */}
      <div className="flex-1 flex items-center justify-center p-4 pb-20">
        {revealedAnswers.length === 0 ? (
          <div className="text-center">
            {/* Pile de polaroids vierges */}
            <div className="relative inline-block mb-8" style={{ width: 160, height: 200 }}>
              {[3, 2, 1, 0].map(i => (
                <div
                  key={i}
                  style={{
                    position: i === 0 ? 'relative' : 'absolute',
                    top: i * 3, left: i * 2,
                    width: 160, height: 200,
                    background: 'var(--paper-white)',
                    boxShadow: '2px 3px 12px rgba(0,0,0,0.4)',
                    transform: `rotate(${(i - 2) * 1.5}deg)`,
                    padding: '10px 10px 40px',
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
              {isHost ? 'APPUYEZ SUR LE TAMPON POUR RÉVÉLER' : "EN ATTENTE DE L'ENQUÊTEUR EN CHEF..."}
            </p>
          </div>
        ) : (
          /* Grille lâche de polaroids */
          <div
            className="flex flex-wrap justify-center"
            style={{ gap: '2.5rem', maxWidth: 700 }}
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

      {/* Bouton hôte : tampon rouge en bas */}
      {isHost && (
        <div
          className="fixed bottom-6 right-6 z-30"
        >
          <button
            onClick={() => socket.emit('defilement:next')}
            style={{
              width: 80, height: 80,
              borderRadius: '50%',
              background: 'var(--stamp-red)',
              border: '3px solid var(--stamp-red-dark)',
              color: 'var(--paper-cream)',
              fontFamily: 'var(--font-marker)',
              fontSize: '0.7rem',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              cursor: 'pointer',
              boxShadow: '3px 4px 0 var(--stamp-red-dark), 0 8px 20px rgba(176,38,28,0.4)',
              lineHeight: 1.2,
              transition: 'transform 80ms ease, box-shadow 80ms ease',
              textAlign: 'center',
            }}
            onMouseDown={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'translate(2px,3px)'; (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 0 0 var(--stamp-red-dark)'; }}
            onMouseUp={e => { (e.currentTarget as HTMLButtonElement).style.transform = ''; (e.currentTarget as HTMLButtonElement).style.boxShadow = ''; }}
          >
            {isAllRevealed ? 'SUITE →' : 'SUIVANT'}
          </button>
        </div>
      )}
    </main>
  );
}
