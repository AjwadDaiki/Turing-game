'use client';
import { useState } from 'react';

interface Props {
  prompt: string;
  onSubmit: (content: string) => void;
  onDraftChange?: (content: string) => void;
  disabled?: boolean;
}

export default function NumberInput({ prompt, onSubmit, onDraftChange, disabled }: Props) {
  const [value, setValue] = useState('');

  function handleChange(v: string) {
    setValue(v);
    onDraftChange?.(v);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!value.trim()) return;
    onSubmit(value.trim());
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <p className="text-lg text-center font-medium">{prompt}</p>
      <input
        type="number"
        className="bg-gray-800 border border-gray-600 rounded px-4 py-4 text-white text-center text-3xl font-bold focus:outline-none focus:border-white"
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        disabled={disabled}
        placeholder="0"
        autoFocus
      />
      <button
        type="submit"
        disabled={disabled || !value.trim()}
        className="bg-white text-black font-bold py-3 rounded disabled:opacity-40"
      >
        Valider
      </button>
    </form>
  );
}
