'use client';
import { useState } from 'react';

const PRESET_COLORS = [
  '#FF0000','#FF6600','#FFCC00','#00CC00','#0066FF','#9900CC',
  '#FF99CC','#66FFFF','#FFFFFF','#999999','#333333','#000000',
];

interface Props {
  prompt: string;
  onSubmit: (content: string) => void;
  onDraftChange?: (content: string) => void;
  disabled?: boolean;
}

export default function ColorInput({ prompt, onSubmit, onDraftChange, disabled }: Props) {
  const [selected, setSelected] = useState('');

  function handleSelect(c: string) {
    if (disabled) return;
    setSelected(c);
    onDraftChange?.(c.toUpperCase());
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-lg text-center font-medium">{prompt}</p>
      <div className="grid grid-cols-6 gap-2">
        {PRESET_COLORS.map((c) => (
          <button
            key={c}
            onClick={() => handleSelect(c)}
            disabled={disabled}
            style={{ backgroundColor: c }}
            className={`h-12 rounded transition ${
              selected === c ? 'ring-4 ring-white ring-offset-2 ring-offset-gray-900' : ''
            }`}
          />
        ))}
      </div>
      <div className="flex gap-3 items-center">
        <input
          type="color"
          onChange={(e) => handleSelect(e.target.value)}
          disabled={disabled}
          className="h-10 w-14 rounded cursor-pointer bg-transparent border-0"
          title="Couleur libre"
        />
        <span className="text-gray-400 text-sm">Couleur libre</span>
        {selected && (
          <span className="ml-auto font-mono text-xs text-gray-300">{selected.toUpperCase()}</span>
        )}
      </div>
      <button
        onClick={() => selected && onSubmit(selected.toUpperCase())}
        disabled={disabled || !selected}
        className="bg-white text-black font-bold py-3 rounded disabled:opacity-40"
      >
        Valider
      </button>
    </div>
  );
}
