'use client';
import { useState } from 'react';

interface Props {
  prompt: string;
  onSubmit: (content: string) => void;
  onDraftChange?: (content: string) => void;
  disabled?: boolean;
}

export default function ListInput({ onSubmit, onDraftChange, disabled }: Props) {
  const [items, setItems] = useState(['', '', '']);

  function updateItem(i: number, val: string) {
    const next = [...items];
    next[i] = val;
    setItems(next);
    const draft = next.map(s => s.trim()).filter(Boolean).join(', ');
    onDraftChange?.(draft);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const valid = items.map(s => s.trim()).filter(Boolean);
    if (!valid.length) return;
    onSubmit(valid.join(', '));
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-2">
          <span
            className="font-stamp"
            style={{ fontSize: '0.7rem', color: 'rgba(26,22,18,0.4)', minWidth: 20 }}
          >
            {i + 1}.
          </span>
          <input
            className="field-line flex-1"
            value={item}
            onChange={e => updateItem(i, e.target.value)}
            disabled={disabled}
            placeholder={`élément ${i + 1}`}
            autoFocus={i === 0}
            spellCheck={false}
          />
        </div>
      ))}
      <button
        type="submit"
        disabled={disabled || !items.some(s => s.trim())}
        className="btn-stamp w-full mt-1"
      >
        VALIDER
      </button>
    </form>
  );
}
