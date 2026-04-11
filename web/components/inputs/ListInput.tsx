'use client';
import { useState } from 'react';

interface Props {
  prompt: string;
  onSubmit: (content: string) => void;
  onDraftChange?: (content: string) => void;
  disabled?: boolean;
}

export default function ListInput({ prompt, onSubmit, onDraftChange, disabled }: Props) {
  const [items, setItems] = useState(['', '', '']);

  function updateItem(i: number, val: string) {
    const next = [...items];
    next[i] = val;
    setItems(next);
    const draft = next.map((s) => s.trim()).filter(Boolean).join(', ');
    onDraftChange?.(draft);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const valid = items.map((s) => s.trim()).filter(Boolean);
    if (!valid.length) return;
    onSubmit(valid.join(', '));
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <p className="text-lg text-center font-medium">{prompt}</p>
      {items.map((item, i) => (
        <input
          key={i}
          className="bg-gray-800 border border-gray-600 rounded px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-white"
          value={item}
          onChange={(e) => updateItem(i, e.target.value)}
          disabled={disabled}
          placeholder={`Élément ${i + 1}`}
          autoFocus={i === 0}
        />
      ))}
      <button
        type="submit"
        disabled={disabled || !items.some((s) => s.trim())}
        className="bg-white text-black font-bold py-3 rounded disabled:opacity-40 mt-1"
      >
        Valider
      </button>
    </form>
  );
}
