'use client';
import { useState } from 'react';

const EMOJI_OPTIONS = [
  '😀','😭','😍','🤔','💀','🔥','💯','🎉','🤡','👀',
  '🫠','😤','🥴','😎','🙃','😱','🤩','😴','🥶','🤮',
];

interface Props {
  prompt: string;
  onSubmit: (content: string) => void;
  onDraftChange?: (content: string) => void;
  disabled?: boolean;
}

export default function EmojiInput({ onSubmit, onDraftChange, disabled }: Props) {
  const [selected, setSelected] = useState('');

  function handleSelect(emoji: string) {
    if (disabled) return;
    setSelected(emoji);
    onDraftChange?.(emoji);
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Grille d'émojis style tampons circulaires */}
      <div className="grid grid-cols-5 gap-2">
        {EMOJI_OPTIONS.map(emoji => (
          <button
            key={emoji}
            onClick={() => handleSelect(emoji)}
            disabled={disabled}
            style={{
              fontSize: '1.6rem',
              padding: '6px',
              background: selected === emoji ? 'rgba(26,22,18,0.1)' : 'transparent',
              border: selected === emoji ? '2px solid rgba(26,22,18,0.4)' : '2px solid transparent',
              cursor: disabled ? 'default' : 'pointer',
              transition: 'all 80ms ease',
              borderRadius: 2,
            }}
          >
            {emoji}
          </button>
        ))}
      </div>
      <button
        onClick={() => selected && onSubmit(selected)}
        disabled={disabled || !selected}
        className="btn-stamp w-full"
      >
        VALIDER
      </button>
    </div>
  );
}
