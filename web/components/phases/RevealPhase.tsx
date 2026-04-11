'use client';
import { useEffect, useState } from 'react';
import { GameState } from '@/hooks/useGameState';
import { ScoreBreakdown } from '@/lib/clientTypes';

interface Props {
  gameState: GameState;
}

type Stage = 'black' | 'robot' | 'pause' | 'traitor' | 'scores';

/* ─── Carte identité mini ────────────────────────────────────────────────── */
function IdentityCard({
  label, pseudo, codename, accentColor,
}: {
  label: string; pseudo: string; codename: string; accentColor: string;
}) {
  return (
    <div
      style={{
        background: 'var(--paper-white)',
        border: `2.5px solid ${accentColor}`,
        padding: '12px 18px',
        textAlign: 'center',
        minWidth: 140,
        animation: 'paper-drop 0.4s ease-out',
      }}
    >
      <div
        className="font-stamp mb-2"
        style={{ fontSize: '0.5rem', color: accentColor, letterSpacing: '0.12em' }}
      >
        {label}
      </div>
      <div
        className="font-typewriter"
        style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--ink-black)', marginBottom: 4 }}
      >
        {pseudo}
      </div>
      <div
        className="font-marker"
        style={{ fontSize: '1.1rem', color: accentColor, letterSpacing: '0.04em' }}
      >
        {codename.toUpperCase()}
      </div>
    </div>
  );
}

/* ─── Ligne de score avec apparition décalée ─────────────────────────────── */
function ScoreRow({
  pseudo, score, delay, isWinner,
}: {
  pseudo: string; score: ScoreBreakdown; delay: number; isWinner: boolean;
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  const details = [
    score.robotSuspicionPts > 0   && `+${score.robotSuspicionPts} suspicions robot`,
    score.ninjaSuspicionPts > 0   && `+${score.ninjaSuspicionPts} suspicions complice`,
    score.finalVotePts > 0        && `+${score.finalVotePts} vote final`,
    score.doubleTrouvaillePts > 0 && `+${score.doubleTrouvaillePts} double trouvaille`,
    score.traitorSurvivalPts > 0  && `+${score.traitorSurvivalPts} survie traître`,
    score.coveragePts > 0         && `+${score.coveragePts} couverture`,
    score.confusionPts > 0        && `+${score.confusionPts} confusion`,
  ].filter(Boolean) as string[];

  return (
    <div
      style={{
        background: 'var(--paper-white)',
        border: isWinner ? '2px solid var(--lamp-orange)' : '1px solid rgba(26,22,18,0.2)',
        padding: '12px 16px',
        marginBottom: 8,
        opacity: visible ? 1 : 0,
        transform: visible ? 'none' : 'translateY(10px)',
        transition: 'opacity 0.35s ease, transform 0.35s ease',
        position: 'relative',
      }}
    >
      {isWinner && (
        <span
          className="font-marker"
          style={{
            position: 'absolute',
            top: -11,
            right: 12,
            fontSize: '0.75rem',
            color: 'var(--lamp-orange)',
            background: 'var(--paper-white)',
            padding: '0 5px',
            border: '1.5px solid var(--lamp-orange)',
            transform: 'rotate(-2deg)',
          }}
        >
          GAGNANT
        </span>
      )}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          marginBottom: details.length ? 6 : 0,
        }}
      >
        <span
          className="font-typewriter"
          style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--ink-black)' }}
        >
          {pseudo}
        </span>
        <span
          className="font-stamp"
          style={{ fontSize: '1.6rem', color: 'var(--ink-black)', letterSpacing: '0.03em' }}
        >
          {score.total}
        </span>
      </div>
      {details.length > 0 && (
        <div
          className="font-typewriter"
          style={{ fontSize: '0.54rem', color: 'rgba(26,22,18,0.45)', lineHeight: 1.8 }}
        >
          {details.join(' · ')}
        </div>
      )}
    </div>
  );
}

/* ─── RevealPhase ────────────────────────────────────────────────────────── */
export default function RevealPhase({ gameState }: Props) {
  const { scores, revealData, room } = gameState;

  const [stage, setStage]               = useState<Stage>('black');
  const [robotText, setRobotText]       = useState('');
  const [traitorText, setTraitorText]   = useState('');
  const [showRobotCard, setShowRobotCard]     = useState(false);
  const [showTraitorCard, setShowTraitorCard] = useState(false);

  /* ── Séquence cinématique async ─────────────────────────────────────────── */
  useEffect(() => {
    if (!revealData) return;
    let cancelled = false;
    const delay = (ms: number) => new Promise<void>(r => setTimeout(r, ms));

    const robotFull   = `${revealData.iaPseudo} · ${revealData.iaCodename}`;
    const traitorFull = `${revealData.traitorPseudo} · ${revealData.traitorCodename}`;

    async function run() {
      await delay(500);
      if (cancelled) return;
      setStage('robot');

      /* Frappe Robot */
      for (let i = 1; i <= robotFull.length; i++) {
        await delay(40);
        if (cancelled) return;
        setRobotText(robotFull.slice(0, i));
      }
      await delay(150);
      if (cancelled) return;
      setShowRobotCard(true);
      await delay(400); // chute de la carte

      setStage('pause');
      await delay(1000);
      if (cancelled) return;

      setStage('traitor');

      /* Frappe Traître */
      for (let i = 1; i <= traitorFull.length; i++) {
        await delay(40);
        if (cancelled) return;
        setTraitorText(traitorFull.slice(0, i));
      }
      await delay(150);
      if (cancelled) return;
      setShowTraitorCard(true);
      await delay(400); // chute de la carte

      await delay(900);
      if (cancelled) return;
      setStage('scores');
    }

    run();
    return () => { cancelled = true; };
  }, [revealData]);

  const sorted = room && scores
    ? room.players
        .filter((p) => scores[p.socketId])
        .sort((a, b) => (scores[b.socketId]?.total ?? 0) - (scores[a.socketId]?.total ?? 0))
    : [];

  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center z-20 overflow-hidden">

      {/* ── Noir initial ─────────────────────────────────────────────────── */}
      {stage === 'black' && (
        <div
          className="font-stamp text-center"
          style={{
            fontSize: '0.68rem',
            color: 'rgba(232,220,192,0.3)',
            letterSpacing: '0.22em',
            animation: 'blink 1s step-end infinite',
          }}
        >
          RÉVÉLATION EN COURS...
        </div>
      )}

      {/* ── Cinématique identités ─────────────────────────────────────────── */}
      {(stage === 'robot' || stage === 'pause' || stage === 'traitor') && (
        <div className="flex flex-col items-center gap-10 px-6 w-full max-w-lg">
          <div
            className="font-stamp"
            style={{ fontSize: '0.58rem', color: 'rgba(232,220,192,0.28)', letterSpacing: '0.22em' }}
          >
            IDENTITÉS RÉVÉLÉES
          </div>

          <div style={{ display: 'flex', gap: 40, flexWrap: 'wrap', justifyContent: 'center' }}>
            {/* ── Robot ── */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
              <div
                className="font-stamp"
                style={{ fontSize: '0.52rem', color: '#4A72B5', letterSpacing: '0.15em' }}
              >
                🤖 ROBOT
              </div>
              {!showRobotCard && stage === 'robot' && (
                <div
                  className="font-typewriter"
                  style={{
                    fontSize: '0.85rem',
                    color: 'var(--paper-cream)',
                    letterSpacing: '0.06em',
                    minHeight: 24,
                  }}
                >
                  {robotText}
                  <span style={{ animation: 'blink 0.6s step-end infinite' }}>|</span>
                </div>
              )}
              {showRobotCard && revealData && (
                <IdentityCard
                  label="🤖 ROBOT"
                  pseudo={revealData.iaPseudo}
                  codename={revealData.iaCodename}
                  accentColor="#1A3A7A"
                />
              )}
            </div>

            {/* ── Traître (apparaît après la pause) ── */}
            {stage === 'traitor' && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
                <div
                  className="font-stamp"
                  style={{ fontSize: '0.52rem', color: 'var(--stamp-red)', letterSpacing: '0.15em' }}
                >
                  🥷 COMPLICE
                </div>
                {!showTraitorCard && (
                  <div
                    className="font-typewriter"
                    style={{
                      fontSize: '0.85rem',
                      color: 'var(--paper-cream)',
                      letterSpacing: '0.06em',
                      minHeight: 24,
                    }}
                  >
                    {traitorText}
                    <span style={{ animation: 'blink 0.6s step-end infinite' }}>|</span>
                  </div>
                )}
                {showTraitorCard && revealData && (
                  <IdentityCard
                    label="🥷 COMPLICE"
                    pseudo={revealData.traitorPseudo}
                    codename={revealData.traitorCodename}
                    accentColor="var(--stamp-red)"
                  />
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Scores ───────────────────────────────────────────────────────── */}
      {stage === 'scores' && (
        <div
          className="w-full flex flex-col overflow-y-auto"
          style={{ maxHeight: '100vh', padding: '20px 16px' }}
        >
          {/* Résumé identités */}
          {revealData && (
            <div
              style={{
                display: 'flex',
                gap: 10,
                justifyContent: 'center',
                marginBottom: 24,
                flexWrap: 'wrap',
              }}
            >
              <IdentityCard
                label="🤖 ROBOT"
                pseudo={revealData.iaPseudo}
                codename={revealData.iaCodename}
                accentColor="#1A3A7A"
              />
              <IdentityCard
                label="🥷 COMPLICE"
                pseudo={revealData.traitorPseudo}
                codename={revealData.traitorCodename}
                accentColor="var(--stamp-red)"
              />
            </div>
          )}

          {/* Titre classement */}
          <div
            className="font-stamp text-center mb-4"
            style={{
              fontSize: '0.62rem',
              color: 'rgba(232,220,192,0.38)',
              letterSpacing: '0.16em',
            }}
          >
            CLASSEMENT FINAL
          </div>

          {/* Lignes de score */}
          <div style={{ maxWidth: 480, margin: '0 auto', width: '100%' }}>
            {sorted.map((p, i) => (
              <ScoreRow
                key={p.socketId}
                pseudo={p.pseudo}
                score={scores![p.socketId]}
                delay={i * 280}
                isWinner={i === 0}
              />
            ))}
          </div>
        </div>
      )}
    </main>
  );
}
