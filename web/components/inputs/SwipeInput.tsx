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
  const [images] = useState<string[]>(generateImages);
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
      <div className="flex flex-col items-center justify-center gap-3 py-12">
        <p className="text-green-400 font-bold text-lg">Réponse envoyée ✓</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-lg text-center font-medium">{prompt}</p>
      <p className="text-gray-400 text-sm text-center">Image {current + 1} / 6</p>
      <div className="flex justify-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={images[current]}
          alt={`Image ${current + 1}`}
          className="w-64 h-64 object-cover rounded-xl"
          draggable={false}
        />
      </div>
      <div className="flex gap-3">
        <button
          onClick={() => vote('L')}
          disabled={disabled}
          className="flex-1 bg-red-600 hover:bg-red-500 active:bg-red-700 text-white font-bold py-4 rounded-xl text-xl disabled:opacity-40 transition"
        >
          ← Gauche
        </button>
        <button
          onClick={() => vote('D')}
          disabled={disabled}
          className="flex-1 bg-green-600 hover:bg-green-500 active:bg-green-700 text-white font-bold py-4 rounded-xl text-xl disabled:opacity-40 transition"
        >
          Droite →
        </button>
      </div>
      <div className="flex gap-1 justify-center">
        {Array.from({ length: 6 }, (_, i) => (
          <div
            key={i}
            className={`h-1.5 w-6 rounded-full ${
              i < current ? 'bg-white' : i === current ? 'bg-gray-400' : 'bg-gray-700'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
