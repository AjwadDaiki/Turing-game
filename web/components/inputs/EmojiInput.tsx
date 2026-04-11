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

export default function EmojiInput({ prompt, onSubmit, onDraftChange, disabled }: Props) {
  const [selected, setSelected] = useState('');

  function handleSelect(emoji: string) {
    if (disabled) return;
    setSelected(emoji);
    onDraftChange?.(emoji);
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-lg text-center font-medium">{prompt}</p>
      <div className="grid grid-cols-5 gap-2">
        {EMOJI_OPTIONS.map((emoji) => (
          <button
            key={emoji}
            onClick={() => handleSelect(emoji)}
            disabled={disabled}
            className={`text-3xl py-2 rounded transition ${
              selected === emoji
                ? 'bg-white/20 ring-2 ring-white'
                : 'hover:bg-white/10'
            }`}
          >
            {emoji}
          </button>
        ))}
      </div>
      <button
        onClick={() => selected && onSubmit(selected)}
        disabled={disabled || !selected}
        className="bg-white text-black font-bold py-3 rounded disabled:opacity-40"
      >
        Valider
      </button>
    </div>
  );
}
