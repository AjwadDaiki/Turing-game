'use client';
import { useEffect, useState, useMemo } from 'react';
import { GameState } from '@/hooks/useGameState';

interface Props {
  gameState: GameState;
}

/* Génère un matricule déterministe à partir du pseudo */
function matricule(pseudo: string): string {
  let n = 0;
  for (const c of pseudo) n = (n * 31 + c.charCodeAt(0)) & 0xffff;
  return 'MAT-' + String(n).padStart(4, '0');
}

/* Silhouette SVG générique pour la photo d'identité */
function SilhouetteCivil() {
  return (
    <svg viewBox="0 0 100 120" style={{ width: '100%', height: '100%', filter: 'blur(1.5px) grayscale(1)' }}>
      <rect width="100" height="120" fill="#A89878" opacity="0.3" />
      <ellipse cx="50" cy="38" rx="20" ry="22" fill="#6B5040" opacity="0.7" />
      <ellipse cx="50" cy="100" rx="35" ry="28" fill="#6B5040" opacity="0.6" />
    </svg>
  );
}

function SilhouetteTraitre() {
  return (
    <svg viewBox="0 0 100 120" style={{ width: '100%', height: '100%', filter: 'blur(1.5px) grayscale(1) contrast(1.3)' }}>
      <rect width="100" height="120" fill="#8B6050" opacity="0.35" />
      <ellipse cx="50" cy="38" rx="20" ry="22" fill="#4A2820" opacity="0.8" />
      {/* Barre noire sur les yeux */}
      <rect x="24" y="28" width="52" height="12" fill="#0A0806" opacity="0.95" />
      <ellipse cx="50" cy="100" rx="35" ry="28" fill="#4A2820" opacity="0.7" />
    </svg>
  );
}

export default function IntroPhase({ gameState }: Props) {
  const { role, codename, room, mySocketId } = gameState;
  const [flipped, setFlipped] = useState(false);
  const [flyAway, setFlyAway] = useState(false);

  const myPseudo = useMemo(
    () => room?.players.find(p => p.socketId === mySocketId)?.pseudo ?? 'AGENT',
    [room, mySocketId]
  );

  /* Rotation déterministe de la carte */
  const cardRot = useMemo(() => {
    const s = myPseudo.charCodeAt(0) % 5;
    return (s - 2) * 0.8; // -1.6° à +1.6°
  }, [myPseudo]);

  useEffect(() => {
    const t1 = setTimeout(() => setFlipped(true), 400);
    const t2 = setTimeout(() => setFlyAway(true), 4400); // 4s visibles après flip
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  const isCivil = role === 'civil' || role === null;

  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center p-4 z-20">

      {/* Indicateur Traître discret — fixed, visible toute la partie */}
      {role === 'traitre' && (
        <div
          className="fixed bottom-4 left-4 z-50 font-stamp text-xs uppercase tracking-widest"
          style={{
            color: 'var(--stamp-red)',
            opacity: 0.65,
            userSelect: 'none',
            letterSpacing: '0.08em',
          }}
          title="Votre rôle secret"
        >
          🥷 INFILTRÉ
        </div>
      )}

      {/* Titre de contexte */}
      <div
        className="font-stamp text-center mb-8"
        style={{ color: 'var(--paper-cream)', opacity: 0.5, fontSize: '0.7rem', letterSpacing: '0.18em' }}
      >
        ATTRIBUTION DES RÔLES — CONFIDENTIEL
      </div>

      {/* Carte 3D */}
      <div
        style={{
          perspective: 1000,
          width: 280,
          height: 400,
          transform: flyAway
            ? `translateY(-110vh) rotate(${cardRot - 5}deg)`
            : 'none',
          transition: flyAway
            ? 'transform 0.5s ease-in'
            : 'none',
        }}
      >
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: '100%',
            transformStyle: 'preserve-3d',
            transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
            transition: 'transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          {/* ── Recto : dos de la carte ── */}
          <div
            className="paper-surface"
            style={{
              position: 'absolute', inset: 0,
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              transform: 'rotateY(0deg)',
              border: '4px solid #6B4A2A',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 12,
            }}
          >
            <div
              className="font-stamp text-center"
              style={{ fontSize: '1.1rem', color: 'var(--ink-black)', letterSpacing: '0.2em', opacity: 0.6 }}
            >
              OPÉRATION<br />TURING
            </div>
            <div
              className="font-marker"
              style={{ fontSize: '2rem', color: 'var(--stamp-red)', opacity: 0.8, transform: 'rotate(-5deg)' }}
            >
              CONFIDENTIEL
            </div>
            <div
              style={{
                width: 60, height: 60, border: '2px solid rgba(26,22,18,0.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 32,
              }}
            >
              🔒
            </div>
          </div>

          {/* ── Verso : carte d'identité ── */}
          <div
            style={{
              position: 'absolute', inset: 0,
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
              backgroundColor: 'var(--paper-cream)',
              backgroundImage: `
                repeating-linear-gradient(93deg, transparent, transparent 8px, rgba(160,130,80,0.04) 8px, rgba(160,130,80,0.04) 9px),
                repeating-linear-gradient(0deg, transparent, transparent 22px, rgba(160,130,80,0.06) 22px, rgba(160,130,80,0.06) 23px)
              `,
              boxShadow: '0 8px 32px rgba(0,0,0,0.55), inset 0 0 0 1px rgba(160,130,80,0.15)',
              border: `5px solid ${isCivil ? '#2A3A6A' : 'var(--stamp-red)'}`,
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* En-tête */}
            <div
              className="font-stamp px-3 py-2 text-center"
              style={{
                background: isCivil ? '#2A3A6A' : 'var(--stamp-red)',
                color: 'var(--paper-cream)',
                fontSize: '0.62rem',
                letterSpacing: '0.12em',
              }}
            >
              {isCivil ? 'CARTE D\'AGENT — ENQUÊTEUR' : 'CARTE D\'INFILTRÉ — CLASSIFIÉE'}
            </div>

            {/* Zone photo */}
            <div style={{ margin: '12px auto', width: 90, height: 108, border: '2px solid rgba(26,22,18,0.2)', overflow: 'hidden', flexShrink: 0 }}>
              {isCivil ? <SilhouetteCivil /> : <SilhouetteTraitre />}
            </div>

            {/* Infos */}
            <div style={{ padding: '0 14px', flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div>
                <div className="font-stamp" style={{ fontSize: '0.55rem', color: 'rgba(26,22,18,0.5)', letterSpacing: '0.1em' }}>ALIAS OPÉRATIONNEL</div>
                <div className="font-typewriter font-bold" style={{ fontSize: '1.1rem', color: 'var(--ink-black)' }}>{myPseudo}</div>
              </div>

              <div>
                <div className="font-stamp" style={{ fontSize: '0.55rem', color: 'rgba(26,22,18,0.5)', letterSpacing: '0.1em' }}>MATRICULE</div>
                <div className="font-typewriter" style={{ fontSize: '0.8rem', color: 'var(--ink-black)' }}>{matricule(myPseudo)}</div>
              </div>

              {!isCivil && codename && (
                <div style={{ borderTop: '1px solid rgba(26,22,18,0.15)', paddingTop: 8 }}>
                  <div className="font-stamp" style={{ fontSize: '0.55rem', color: 'var(--stamp-red)', letterSpacing: '0.1em' }}>NOM DE CODE SECRET</div>
                  <div className="font-typewriter font-bold" style={{ fontSize: '1.2rem', color: 'var(--ink-black)', letterSpacing: '0.05em' }}>{codename}</div>
                  <div className="font-typewriter" style={{ fontSize: '0.6rem', color: 'rgba(26,22,18,0.5)', marginTop: 4 }}>
                    Mission : te faire passer pour l&apos;IA
                  </div>
                </div>
              )}

              {isCivil && (
                <div style={{ borderTop: '1px solid rgba(26,22,18,0.15)', paddingTop: 8 }}>
                  <div className="font-stamp" style={{ fontSize: '0.55rem', color: 'rgba(26,22,18,0.5)', letterSpacing: '0.1em' }}>MISSION</div>
                  <div className="font-typewriter" style={{ fontSize: '0.75rem', color: 'var(--ink-black)' }}>
                    Débusquer le Robot et l&apos;Infiltré
                  </div>
                </div>
              )}
            </div>

            {/* Tampon diagonal */}
            {!isCivil && (
              <div
                className="font-marker"
                style={{
                  position: 'absolute',
                  bottom: 40, right: -10,
                  transform: 'rotate(-35deg)',
                  color: 'var(--stamp-red)',
                  fontSize: '1.6rem',
                  opacity: 0.75,
                  border: '3px solid var(--stamp-red)',
                  padding: '2px 8px',
                  whiteSpace: 'nowrap',
                  lineHeight: 1,
                }}
              >
                INFILTRÉ
              </div>
            )}

            {/* Bas de carte */}
            <div
              className="font-stamp text-center py-1.5"
              style={{ fontSize: '0.5rem', color: 'rgba(26,22,18,0.35)', letterSpacing: '0.12em', borderTop: '1px solid rgba(26,22,18,0.1)' }}
            >
              OPÉRATION TURING — USAGE UNIQUE — NE PAS DIVULGUER
            </div>
          </div>
        </div>
      </div>

      <p
        className="font-stamp text-center mt-8"
        style={{ fontSize: '0.65rem', color: 'var(--paper-cream)', opacity: 0.4, letterSpacing: '0.12em' }}
      >
        Mémorisez votre rôle — la carte sera détruite
      </p>
    </main>
  );
}
