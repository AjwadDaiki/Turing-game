'use client';
import { useState } from 'react';
import { Socket } from 'socket.io-client';
import { GameState } from '@/hooks/useGameState';
import { EpreuveInputType, RevealedAnswer } from '@/lib/clientTypes';
import RevealRouter from '../reveals/RevealRouter';

interface Props {
  socket: Socket;
  gameState: GameState;
}

function groupByRound(answers: RevealedAnswer[]): Map<number, RevealedAnswer[]> {
  const map = new Map<number, RevealedAnswer[]>();
  for (const a of answers) {
    const arr = map.get(a.roundNumber) ?? [];
    arr.push(a);
    map.set(a.roundNumber, arr);
  }
  return map;
}

/* Pseudo radio button avec coché Permanent Marker */
function VoteOption({
  pseudo,
  selected,
  onSelect,
  accentColor,
}: {
  pseudo: string;
  selected: boolean;
  onSelect: () => void;
  accentColor: string;
}) {
  return (
    <button
      onClick={onSelect}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '8px 12px',
        background: selected ? `${accentColor}15` : 'transparent',
        border: `1.5px solid ${selected ? accentColor : 'rgba(26,22,18,0.2)'}`,
        boxShadow: selected ? `inset 0 1px 3px ${accentColor}18` : 'none',
        width: '100%',
        cursor: 'pointer',
        transition: 'all 80ms ease',
        marginBottom: 6,
        textAlign: 'left',
      }}
    >
      {/* Case à cocher */}
      <div
        style={{
          width: 22,
          height: 22,
          border: `2px solid ${selected ? accentColor : 'rgba(26,22,18,0.3)'}`,
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'transparent',
          transition: 'border-color 80ms ease',
        }}
      >
        {selected && (
          <span
            className="font-marker"
            style={{
              fontSize: '1.1rem',
              color: accentColor,
              lineHeight: 1,
              animation: 'stamp-drop 0.25s cubic-bezier(0.34,1.56,0.64,1)',
              display: 'block',
            }}
          >
            ✗
          </span>
        )}
      </div>
      <span
        className="font-typewriter"
        style={{
          fontSize: '0.85rem',
          color: selected ? 'var(--ink-black)' : 'rgba(26,22,18,0.65)',
          letterSpacing: '0.04em',
          fontWeight: selected ? 700 : 400,
          transition: 'all 80ms ease',
        }}
      >
        {pseudo}
      </span>
    </button>
  );
}

export default function VotePhase({ socket, gameState }: Props) {
  const { room, mySocketId, votedPlayerIds, revealedAnswers, epreuveInfoByRound } = gameState;

  const [robotTarget, setRobotTarget] = useState('');
  const [ninjaTarget, setNinjaTarget] = useState('');

  if (!room) return null;

  const hasVoted = mySocketId ? votedPlayerIds.has(mySocketId) : false;
  const candidates = room.players.filter((p) => p.socketId !== mySocketId);
  const grouped = groupByRound(revealedAnswers);
  const votedCount = votedPlayerIds.size;
  const totalVoters = room.players.length;

  function handleVote() {
    if (!robotTarget || !ninjaTarget || hasVoted) return;
    socket.emit('vote:final', { robotTargetId: robotTarget, ninjaTargetId: ninjaTarget });
  }

  return (
    <main className="relative min-h-screen flex flex-col z-20 overflow-hidden">
      {/* ── Barre top ──────────────────────────────────────────────────────── */}
      <div
        className="flex items-center justify-between px-4 py-2 font-stamp flex-shrink-0"
        style={{
          fontSize: '0.65rem',
          color: 'var(--paper-cream)',
          opacity: 0.55,
          letterSpacing: '0.1em',
          borderBottom: '1px solid rgba(232,220,192,0.08)',
        }}
      >
        <span>VOTE FINAL</span>
        <span>{votedCount}/{totalVoters} VOTANTS</span>
      </div>

      <div className="flex-1 flex flex-col overflow-y-auto px-4 pt-4 pb-28">

        {/* ── Mini rappel par manche ─────────────────────────────────────── */}
        {grouped.size > 0 && (
          <div
            style={{
              maxHeight: '40vh',
              overflowY: 'auto',
              marginBottom: 20,
              borderBottom: '1px dashed rgba(26,22,18,0.2)',
              paddingBottom: 16,
            }}
          >
            <div
              className="font-stamp mb-2"
              style={{ fontSize: '0.52rem', color: 'rgba(26,22,18,0.4)', letterSpacing: '0.14em' }}
            >
              RAPPEL — DOSSIERS D'ENQUÊTE
            </div>

            {Array.from(grouped.entries())
              .sort(([a], [b]) => a - b)
              .map(([roundNum, answers]) => {
                const info = epreuveInfoByRound[roundNum];
                const inputType: EpreuveInputType = info?.inputType ?? 'text';
                return (
                  <div key={roundNum} style={{ marginBottom: 10 }}>
                    <div
                      className="font-stamp mb-1"
                      style={{ fontSize: '0.5rem', color: 'rgba(26,22,18,0.45)', letterSpacing: '0.1em' }}
                    >
                      MANCHE {String(roundNum).padStart(2, '0')}
                    </div>
                    {/* Défilement horizontal */}
                    <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
                      {answers.map((ans) => (
                        <div
                          key={ans.playerId}
                          style={{
                            flexShrink: 0,
                            background: 'var(--paper-white)',
                            border: '1px solid rgba(26,22,18,0.15)',
                            padding: '6px 8px',
                            minWidth: 90,
                            maxWidth: 120,
                          }}
                        >
                          <RevealRouter answer={ans} inputType={inputType} compact />
                          <div
                            className="font-stamp text-center mt-1"
                            style={{ fontSize: '0.48rem', color: 'rgba(26,22,18,0.4)', letterSpacing: '0.05em' }}
                          >
                            {ans.pseudo ?? '???'}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
          </div>
        )}

        {/* ── Fiche de vote ──────────────────────────────────────────────── */}
        {hasVoted ? (
          /* État voté */
          <div className="flex flex-col items-center justify-center flex-1 gap-6 py-12">
            <div
              className="stamp-mark stamp-mark--green font-marker"
              style={{
                fontSize: '1.8rem',
                padding: '8px 24px',
                transform: 'rotate(-2deg)',
                animation: 'stamp-drop 0.35s cubic-bezier(0.34,1.56,0.64,1)',
              }}
            >
              VOTE ENREGISTRÉ
            </div>
            <div className="flex gap-2 mt-2">
              {room.players.map((p) => (
                <div
                  key={p.socketId}
                  title={p.pseudo}
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    background: votedPlayerIds.has(p.socketId)
                      ? 'var(--accent-green)'
                      : 'rgba(232,220,192,0.2)',
                    boxShadow: votedPlayerIds.has(p.socketId)
                      ? '0 0 5px var(--accent-green)'
                      : 'none',
                    transition: 'all 0.3s ease',
                  }}
                />
              ))}
            </div>
            <p
              className="font-stamp"
              style={{ fontSize: '0.58rem', color: 'rgba(232,220,192,0.35)', letterSpacing: '0.12em' }}
            >
              {totalVoters - votedCount > 0
                ? `EN ATTENTE DE ${totalVoters - votedCount} AGENT(S)`
                : 'DÉCOMPTE EN COURS...'}
            </p>
          </div>
        ) : (
          /* Formulaire d'accusation */
          <div
            className="paper-surface mx-auto w-full"
            style={{ maxWidth: 480, padding: '20px 24px', position: 'relative' }}
          >
            {/* En-tête officiel */}
            <div
              className="text-center mb-5"
              style={{ borderBottom: '1px dashed rgba(26,22,18,0.25)', paddingBottom: 12 }}
            >
              <div
                className="font-stamp"
                style={{ fontSize: '0.48rem', color: 'rgba(26,22,18,0.4)', letterSpacing: '0.16em' }}
              >
                OPÉRATION TURING — FORMULAIRE D'ACCUSATION
              </div>
              <div
                className="font-typewriter mt-1"
                style={{ fontSize: '0.62rem', color: 'rgba(26,22,18,0.45)' }}
              >
                Confidentiel. À remplir avec discernement.
              </div>
            </div>

            {/* Section Robot */}
            <div style={{ marginBottom: 20 }}>
              <div
                className="font-stamp mb-2"
                style={{ fontSize: '0.58rem', color: '#1A3A7A', letterSpacing: '0.1em' }}
              >
                🤖 SUJET IDENTIFIÉ COMME ROBOT
              </div>
              {candidates.map((p) => (
                <VoteOption
                  key={p.socketId}
                  pseudo={p.pseudo}
                  selected={robotTarget === p.socketId}
                  onSelect={() => setRobotTarget(p.socketId)}
                  accentColor="#1A3A7A"
                />
              ))}
            </div>

            <div style={{ borderTop: '1px dashed rgba(26,22,18,0.2)', marginBottom: 20 }} />

            {/* Section Traître */}
            <div style={{ marginBottom: 24 }}>
              <div
                className="font-stamp mb-2"
                style={{ fontSize: '0.58rem', color: 'var(--stamp-red)', letterSpacing: '0.1em' }}
              >
                🥷 SUJET IDENTIFIÉ COMME COMPLICE
              </div>
              {candidates.map((p) => (
                <VoteOption
                  key={p.socketId}
                  pseudo={p.pseudo}
                  selected={ninjaTarget === p.socketId}
                  onSelect={() => setNinjaTarget(p.socketId)}
                  accentColor="var(--stamp-red)"
                />
              ))}
            </div>

            <button
              onClick={handleVote}
              disabled={!robotTarget || !ninjaTarget}
              className="btn-stamp w-full"
              style={{ opacity: !robotTarget || !ninjaTarget ? 0.4 : 1 }}
            >
              SCELLER LE VERDICT
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
