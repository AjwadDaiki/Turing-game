'use client';
import { useState } from 'react';

interface Props {
  prompt: string;
  onSubmit: (content: string) => void;
  onDraftChange?: (content: string) => void;
  disabled?: boolean;
}

export default function TextInput({ onSubmit, onDraftChange, disabled }: Props) {
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
        className="field-line"
        style={{ fontSize: '1.1rem', letterSpacing: '0.04em' }}
        value={value}
        onChange={e => handleChange(e.target.value)}
        disabled={disabled}
        placeholder="_______________________________"
        maxLength={100}
        autoFocus
        spellCheck={false}
      />
      <button type="submit" disabled={disabled || !value.trim()} className="btn-stamp w-full">
        VALIDER
      </button>
    </form>
  );
}
