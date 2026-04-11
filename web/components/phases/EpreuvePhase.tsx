'use client';
import { useEffect, useRef, useState } from 'react';
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

// ─── Timer bar ────────────────────────────────────────────────────────────────

function TimerBar({ totalSeconds }: { totalSeconds: number }) {
  const [secondsLeft, setSecondsLeft] = useState(totalSeconds);

  useEffect(() => {
    setSecondsLeft(totalSeconds);
    const interval = setInterval(() => {
      setSecondsLeft((s) => Math.max(0, s - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [totalSeconds]);

  const pct = (secondsLeft / totalSeconds) * 100;
  const isRed = pct <= 20;
  const isYellow = pct > 20 && pct <= 50;

  const barColor = isRed
    ? 'bg-red-500'
    : isYellow
    ? 'bg-yellow-400'
    : 'bg-green-500';

  return (
    <div className="w-full h-1.5 bg-gray-700 rounded-full overflow-hidden">
      <div
        className={`h-full rounded-full transition-all duration-1000 ease-linear ${barColor} ${
          isRed && secondsLeft <= 5 ? 'animate-pulse' : ''
        }`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

// ─── EpreuvePhase ─────────────────────────────────────────────────────────────

export default function EpreuvePhase({ socket, gameState }: Props) {
  const { epreuveInfo, answeredPlayerIds, mySocketId, room } = gameState;
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  if (!epreuveInfo) return null;

  const hasAnswered = mySocketId ? answeredPlayerIds.has(mySocketId) : false;
  const totalPlayers = room?.players.length ?? 0;
  const answeredCount = answeredPlayerIds.size;

  // Immediate submit (Valider button clicked)
  function emit(content: unknown) {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    socket.emit('epreuve:answer', { content });
  }

  // Debounced draft auto-save (500ms after last keystroke)
  function onDraftChange(content: string) {
    if (hasAnswered) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      socket.emit('epreuve:answer', { content });
    }, 500);
  }

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
    <main className="min-h-screen bg-gray-900 text-white flex flex-col">
      {/* Timer bar — full width at very top */}
      {!hasAnswered && (
        <TimerBar totalSeconds={epreuveInfo.timeLimit} />
      )}

      <div className="flex items-center justify-between px-4 pt-3 pb-2">
        <span className="text-gray-400 text-sm">Manche {epreuveInfo.roundNumber}/5</span>
        <span className="text-gray-400 text-sm">
          {answeredCount}/{totalPlayers} ont répondu
        </span>
      </div>

      {hasAnswered ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-6 p-4">
          <p className="text-green-400 font-bold text-lg">Réponse envoyée ✓</p>
          <p className="text-gray-400 text-sm">En attente des autres joueurs…</p>
          <div className="flex gap-2 flex-wrap justify-center">
            {room?.players.map((p) => (
              <div
                key={p.socketId}
                title={p.pseudo}
                className={`w-3 h-3 rounded-full ${
                  answeredPlayerIds.has(p.socketId) ? 'bg-green-400' : 'bg-gray-600'
                }`}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full p-4">
          {renderInput(epreuveInfo.inputType)}
        </div>
      )}
    </main>
  );
}
