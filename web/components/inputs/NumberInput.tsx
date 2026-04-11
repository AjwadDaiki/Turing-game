'use client';
import { useState } from 'react';

interface Props {
  prompt: string;
  onSubmit: (content: string) => void;
  onDraftChange?: (content: string) => void;
  disabled?: boolean;
}

export default function NumberInput({ onSubmit, onDraftChange, disabled }: Props) {
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
      <input
        type="number"
        className="field-line text-center"
        style={{ fontSize: '2rem', fontFamily: 'var(--font-typewriter)', letterSpacing: '0.1em' }}
        value={value}
        onChange={e => handleChange(e.target.value)}
        disabled={disabled}
        placeholder="____"
        autoFocus
      />
      <button type="submit" disabled={disabled || !value.trim()} className="btn-stamp w-full">
        VALIDER
      </button>
    </form>
  );
}
