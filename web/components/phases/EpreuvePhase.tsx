'use client';
import { useEffect, useRef, useState, useMemo } from 'react';
import { Socket } from 'socket.io-client';
import { GameState } from '@/hooks/useGameState';
import { EpreuveInputType, Drawing, SwipeContent } from '@/lib/clientTypes';
import TextInput from '../inputs/TextInput';
import EmojiInput from '../inputs/EmojiInput';
import ColorInput from '../inputs/ColorInput';
import SwipeInput from '../inputs/SwipeInput';
import DrawInput from '../inputs/DrawInput';
import SliderInput from '../inputs/SliderInput';
import NumberInput from '../inputs/NumberInput';
import ListInput from '../inputs/ListInput';

interface Props {
  socket: Socket;
  gameState: GameState;
}

/* ─── Timer circulaire analogique (96px, tremblement <10s) ───────────────── */
function AnalogTimer({ totalSeconds, onTimeUp }: { totalSeconds: number; onTimeUp?: () => void }) {
  const [elapsed, setElapsed] = useState(0);
  const calledRef = useRef(false);

  useEffect(() => {
    setElapsed(0);
    calledRef.current = false;
    const start = Date.now();
    const iv = setInterval(() => {
      const e = (Date.now() - start) / 1000;
      const clamped = Math.min(e, totalSeconds);
      setElapsed(clamped);
      if (clamped >= totalSeconds && !calledRef.current) {
        calledRef.current = true;
        onTimeUp?.();
      }
    }, 100);
    return () => clearInterval(iv);
  }, [totalSeconds, onTimeUp]);

  const pct = elapsed / totalSeconds;
  const SIZE = 96;
  const r = 38;
  const cx = SIZE / 2;
  const cy = SIZE / 2;
  const circumference = 2 * Math.PI * r;
  const dashOffset = circumference * (1 - pct);

  const remaining = 1 - pct;
  const arcColor = remaining > 0.5
    ? '#4A6B3D'
    : remaining > 0.2
    ? '#D4A040'
    : '#B0261C';

  const angle = pct * 360 - 90;
  const rad = (angle * Math.PI) / 180;
  const needleX = cx + r * 0.72 * Math.cos(rad);
  const needleY = cy + r * 0.72 * Math.sin(rad);

  const isUrgent = remaining < 0.17;
  const remainSec = Math.max(0, Math.ceil(totalSeconds - elapsed));

  return (
    <div
      style={{
        animation: isUrgent ? 'timer-shake 0.15s ease-in-out infinite' : 'none',
      }}
    >
      <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
        {/* Fond cercle */}
        <circle cx={cx} cy={cy} r={r} fill="rgba(26,22,18,0.06)" stroke="rgba(26,22,18,0.12)" strokeWidth="1.5" />
        {/* 12 tick marks */}
        {Array.from({ length: 12 }, (_, i) => {
          const a = ((i * 30 - 90) * Math.PI) / 180;
          const isMajor = i % 3 === 0;
          return (
            <line
              key={i}
              x1={cx + (r - (isMajor ? 8 : 5)) * Math.cos(a)}
              y1={cy + (r - (isMajor ? 8 : 5)) * Math.sin(a)}
              x2={cx + (r - 2) * Math.cos(a)}
              y2={cy + (r - 2) * Math.sin(a)}
              stroke="rgba(26,22,18,0.3)"
              strokeWidth={isMajor ? 1.5 : 0.8}
            />
          );
        })}
        {/* Arc restant */}
        <circle
          cx={cx} cy={cy} r={r}
          fill="none"
          stroke={arcColor}
          strokeWidth="5"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${cx} ${cy})`}
          style={{ transition: 'stroke-dashoffset 0.1s linear, stroke 0.5s ease' }}
        />
        {/* Aiguille */}
        <line
          x1={cx} y1={cy}
          x2={needleX} y2={needleY}
          stroke="var(--ink-black)"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <circle cx={cx} cy={cy} r={3.5} fill="var(--ink-black)" />
        {/* Secondes restantes au centre */}
        <text
          x={cx} y={cy + 14}
          textAnchor="middle"
          fontFamily="var(--font-stamp)"
          fontSize="11"
          fill={arcColor}
          opacity={0.8}
        >
          {remainSec}s
        </text>
      </svg>
    </div>
  );
}

/* ─── Wrapper input vintage sur papier ────────────────────────────────────── */
function FormPaper({
  children, roundNumber, prompt, dossier,
}: {
  children: React.ReactNode;
  roundNumber: number;
  prompt: string;
  dossier: string;
}) {
  const rot = useMemo(() => {
    const offsets = [-1.2, 0.8, -0.5, 1.5, -0.3];
    return offsets[(roundNumber - 1) % offsets.length];
  }, [roundNumber]);

  return (
    <div
      className="paper-surface w-full relative"
      style={{
        maxWidth: 460,
        margin: '0 auto',
        transform: `rotate(${rot}deg)`,
        padding: '20px 24px 24px',
      }}
    >
      {/* En-tête */}
      <div className="font-stamp flex justify-between items-start mb-2" style={{ fontSize: '0.6rem', color: 'rgba(26,22,18,0.45)', letterSpacing: '0.1em' }}>
        <span>DOSSIER N° {dossier}</span>
        <span>MANCHE {String(roundNumber).padStart(2, '0')}/05</span>
      </div>

      <hr className="form-divider mb-3" />

      {/* Prompt */}
      <div className="text-center mb-4">
        <div className="font-stamp" style={{ fontSize: '0.6rem', color: 'rgba(26,22,18,0.4)', letterSpacing: '0.12em', marginBottom: 4 }}>
          QUESTION D&apos;INTERROGATOIRE
        </div>
        <div
          className="font-stamp"
          style={{
            fontSize: 'clamp(1rem, 3vw, 1.25rem)',
            color: 'var(--ink-black)',
            lineHeight: 1.3,
            letterSpacing: '0.04em',
          }}
        >
          &ldquo;{prompt}&rdquo;
        </div>
      </div>

      <hr className="form-divider mb-4" />

      <div className="font-stamp mb-3" style={{ fontSize: '0.6rem', color: 'rgba(26,22,18,0.45)', letterSpacing: '0.1em' }}>
        RÉPONSE DU SUJET :
      </div>

      {children}
    </div>
  );
}

/* ─── EpreuvePhase ─────────────────────────────────────────────────────────── */
export default function EpreuvePhase({ socket, gameState }: Props) {
  const { epreuveInfo, answeredPlayerIds, mySocketId, room } = gameState;
  const draftRef = useRef<unknown>(null);
  const submittedRef = useRef(false);

  const dossier = useMemo(() => {
    if (!epreuveInfo) return '0000';
    const n = ((epreuveInfo.roundNumber * 1847) + 2847) % 9000 + 1000;
    return String(n);
  }, [epreuveInfo]);

  /* Reset refs quand une nouvelle épreuve démarre */
  useEffect(() => {
    draftRef.current = null;
    submittedRef.current = false;
  }, [epreuveInfo?.roundNumber]);

  if (!epreuveInfo) return null;

  const hasAnswered = mySocketId ? answeredPlayerIds.has(mySocketId) : false;
  const totalPlayers = room?.players.length ?? 0;
  const answeredCount = answeredPlayerIds.size;

  /* Soumission explicite uniquement (VALIDER ou timer=0) */
  function emit(content: unknown) {
    if (submittedRef.current) return;
    submittedRef.current = true;
    socket.emit('epreuve:answer', { content });
  }

  /* Draft local : PAS d'envoi au serveur, juste sauvegarde locale */
  function onDraftChange(content: string) {
    if (hasAnswered) return;
    draftRef.current = content;
  }

  /* Auto-submit quand le timer local atteint 0 */
  const handleTimeUp = useMemo(() => () => {
    if (submittedRef.current || hasAnswered) return;
    if (draftRef.current) {
      emit(draftRef.current);
    }
  }, [hasAnswered]); // eslint-disable-line react-hooks/exhaustive-deps

  function renderInput(type: EpreuveInputType) {
    const prompt = epreuveInfo!.prompt;
    const dis = hasAnswered;
    switch (type) {
      case 'text':   return <TextInput   prompt={prompt} onSubmit={emit} onDraftChange={onDraftChange} disabled={dis} />;
      case 'emoji':  return <EmojiInput  prompt={prompt} onSubmit={emit} onDraftChange={onDraftChange} disabled={dis} />;
      case 'color':  return <ColorInput  prompt={prompt} onSubmit={emit} onDraftChange={onDraftChange} disabled={dis} />;
      case 'slider': return <SliderInput prompt={prompt} onSubmit={emit} onDraftChange={onDraftChange} disabled={dis} />;
      case 'number': return <NumberInput prompt={prompt} onSubmit={emit} onDraftChange={onDraftChange} disabled={dis} />;
      case 'list':   return <ListInput   prompt={prompt} onSubmit={emit} onDraftChange={onDraftChange} disabled={dis} />;
      case 'draw':   return <DrawInput   prompt={prompt} onSubmit={(d: Drawing) => emit(d)}            disabled={dis} />;
      case 'swipe':  return <SwipeInput  prompt={prompt} onSubmit={(c: SwipeContent) => emit(c)}       disabled={dis} />;
      default:       return <TextInput   prompt={prompt} onSubmit={emit} onDraftChange={onDraftChange} disabled={dis} />;
    }
  }

  return (
    <main className="relative min-h-screen flex flex-col z-20">

      {/* Barre du haut : timer + compteur */}
      <div
        className="flex items-center justify-between px-4 py-2 font-stamp"
        style={{
          fontSize: '0.65rem',
          color: 'var(--paper-cream)',
          opacity: 0.6,
          letterSpacing: '0.1em',
          borderBottom: '1px solid rgba(232,220,192,0.08)',
        }}
      >
        <span>MANCHE {String(epreuveInfo.roundNumber).padStart(2, '0')}/05</span>
        <span>{answeredCount}/{totalPlayers} RÉPONSES</span>
      </div>

      {/* Timer circulaire — position fixed haut-droite */}
      {!hasAnswered && (
        <div
          className="fixed z-30"
          style={{ top: 48, right: 12, opacity: 0.9 }}
        >
          <AnalogTimer totalSeconds={epreuveInfo.timeLimit} onTimeUp={handleTimeUp} />
        </div>
      )}

      {hasAnswered ? (
        /* État : réponse envoyée */
        <div className="flex-1 flex flex-col items-center justify-center gap-6 p-6">
          <div
            className="paper-surface text-center"
            style={{ padding: '24px 32px', transform: 'rotate(1deg)', maxWidth: 320 }}
          >
            <div
              className="stamp-mark stamp-mark--green font-marker"
              style={{
                fontSize: '1.6rem',
                transform: 'rotate(-2deg)',
                animation: 'stamp-drop 0.35s cubic-bezier(0.34,1.56,0.64,1)',
              }}
            >
              ENREGISTRÉ
            </div>
            <div className="font-stamp mt-4" style={{ fontSize: '0.65rem', color: 'rgba(26,22,18,0.5)', letterSpacing: '0.1em' }}>
              EN ATTENTE DES AUTRES SUJETS...
            </div>
            {/* Points de statut */}
            <div className="flex gap-2 justify-center mt-4 flex-wrap">
              {room?.players.map(p => (
                <div
                  key={p.socketId}
                  title={p.pseudo}
                  style={{
                    width: 8, height: 8, borderRadius: '50%',
                    background: answeredPlayerIds.has(p.socketId)
                      ? 'var(--accent-green)'
                      : 'rgba(26,22,18,0.2)',
                    boxShadow: answeredPlayerIds.has(p.socketId)
                      ? '0 0 5px var(--accent-green)'
                      : 'none',
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Formulaire d'épreuve */
        <div className="flex-1 flex items-center justify-center p-4 pt-8">
          <FormPaper
            roundNumber={epreuveInfo.roundNumber}
            prompt={epreuveInfo.prompt}
            dossier={dossier}
          >
            {renderInput(epreuveInfo.inputType)}
          </FormPaper>
        </div>
      )}

      {/* Colonne suspects — desktop uniquement */}
      {!hasAnswered && room && (
        <div
          className="fixed right-0 top-1/2 -translate-y-1/2 hidden lg:flex flex-col gap-2 z-20"
          style={{ padding: '12px 8px', borderLeft: '1px solid rgba(232,220,192,0.08)' }}
        >
          {room.players.map(p => (
            <div
              key={p.socketId}
              className="font-typewriter flex items-center gap-2"
              style={{ fontSize: '0.65rem', color: 'var(--paper-cream)', opacity: 0.5, whiteSpace: 'nowrap' }}
            >
              <div
                style={{
                  width: 6, height: 6, borderRadius: '50%', flexShrink: 0,
                  background: answeredPlayerIds.has(p.socketId) ? 'var(--accent-green)' : 'rgba(232,220,192,0.2)',
                }}
              />
              {p.pseudo.slice(0, 8)}
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
