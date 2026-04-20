'use client';
import { useState } from 'react';
import { SwipeContent } from '@/lib/clientTypes';

function generateImages(): string[] {
  return Array.from(
    { length: 6 },
    (_, i) =>
      `https://picsum.photos/seed/${Math.floor(Math.random() * 900) + 100 + i}/300/300`
  );
}

interface Props {
  prompt: string;
  onSubmit: (content: SwipeContent) => void;
  disabled?: boolean;
}

export default function SwipeInput({ prompt, onSubmit, disabled }: Props) {
  const [images] = useState<string[]>(() => generateImages());
  const [votes, setVotes] = useState<string[]>([]);
  const current = votes.length;

  function vote(direction: 'L' | 'D') {
    if (disabled || current >= 6) return;
    const next = [...votes, direction];
    setVotes(next);
    if (next.length === 6) {
      onSubmit({ votes: next.join(' '), images });
    }
  }

  if (current >= 6) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-8">
        <div
          className="font-marker"
          style={{
            fontSize: '1.4rem',
            color: 'var(--accent-green)',
            border: '2.5px solid var(--accent-green)',
            padding: '6px 18px',
            transform: 'rotate(-2deg)',
            animation: 'stamp-drop 0.35s cubic-bezier(0.34,1.56,0.64,1)',
            opacity: 0.85,
          }}
        >
          ENREGISTRÉ
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Compteur */}
      <div
        className="font-stamp text-center"
        style={{ fontSize: '0.55rem', color: 'rgba(26,22,18,0.4)', letterSpacing: '0.12em' }}
      >
        IMAGE {current + 1} / 6
      </div>

      {/* Photo */}
      <div className="flex justify-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={images[current]}
          alt={`Image ${current + 1}`}
          className="w-64 h-64 object-cover"
          style={{ border: '4px solid var(--paper-white)', boxShadow: '3px 4px 16px rgba(0,0,0,0.5)' }}
          draggable={false}
        />
      </div>

      {/* Boutons directionnels */}
      <div className="flex gap-3">
        <button
          onClick={() => vote('L')}
          disabled={disabled}
          className="flex-1 btn-stamp"
          style={{
            background: 'rgba(176,38,28,0.12)',
            borderColor: 'var(--stamp-red)',
            color: 'var(--stamp-red)',
            fontSize: '1rem',
            padding: '14px 0',
          }}
        >
          ← L
        </button>
        <button
          onClick={() => vote('D')}
          disabled={disabled}
          className="flex-1 btn-stamp"
          style={{
            background: 'rgba(74,107,61,0.12)',
            borderColor: 'var(--accent-green)',
            color: 'var(--accent-green)',
            fontSize: '1rem',
            padding: '14px 0',
          }}
        >
          D →
        </button>
      </div>

      {/* Pastilles progression */}
      <div className="flex gap-1.5 justify-center">
        {Array.from({ length: 6 }, (_, i) => (
          <div
            key={i}
            style={{
              height: 6,
              width: 22,
              borderRadius: 3,
              background:
                i < current
                  ? 'var(--paper-cream)'
                  : i === current
                  ? 'rgba(232,220,192,0.45)'
                  : 'rgba(232,220,192,0.15)',
              transition: 'all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
              boxShadow: i < current ? '0 1px 3px rgba(0,0,0,0.2)' : 'none',
            }}
          />
        ))}
      </div>
    </div>
  );
}
