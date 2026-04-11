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

export default function ColorInput({ onSubmit, onDraftChange, disabled }: Props) {
  const [selected, setSelected] = useState('');

  function handleSelect(c: string) {
    if (disabled) return;
    setSelected(c);
    onDraftChange?.(c.toUpperCase());
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Échantillons de couleur style peinture collée */}
      <div className="grid grid-cols-6 gap-1.5">
        {PRESET_COLORS.map(c => (
          <button
            key={c}
            onClick={() => handleSelect(c)}
            disabled={disabled}
            style={{
              height: 36,
              background: c,
              border: selected === c
                ? '3px solid var(--ink-black)'
                : '1.5px solid rgba(26,22,18,0.25)',
              cursor: disabled ? 'default' : 'pointer',
              transform: selected === c ? 'scale(1.1)' : 'none',
              transition: 'transform 80ms ease',
              boxShadow: selected === c ? '2px 2px 0 rgba(26,22,18,0.3)' : 'none',
            }}
          />
        ))}
      </div>
      {/* Couleur libre */}
      <div className="flex items-center gap-3">
        <input
          type="color"
          onChange={e => handleSelect(e.target.value)}
          disabled={disabled}
          style={{ width: 36, height: 36, cursor: 'pointer', border: '1px solid rgba(26,22,18,0.3)', background: 'transparent' }}
          title="Couleur libre"
        />
        <span
          className="font-stamp"
          style={{ fontSize: '0.6rem', color: 'rgba(26,22,18,0.5)', letterSpacing: '0.1em' }}
        >
          TEINTE LIBRE
        </span>
        {selected && (
          <span
            className="font-typewriter ml-auto"
            style={{ fontSize: '0.75rem', color: 'rgba(26,22,18,0.7)' }}
          >
            {selected.toUpperCase()}
          </span>
        )}
      </div>
      <button
        onClick={() => selected && onSubmit(selected.toUpperCase())}
        disabled={disabled || !selected}
        className="btn-stamp w-full"
      >
        VALIDER
      </button>
    </div>
  );
}
