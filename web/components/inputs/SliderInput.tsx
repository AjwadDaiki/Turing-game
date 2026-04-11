'use client';
import { useState } from 'react';

interface Props {
  prompt: string;
  onSubmit: (content: string) => void;
  onDraftChange?: (content: string) => void;
  disabled?: boolean;
}

export default function SliderInput({ prompt, onSubmit, onDraftChange, disabled }: Props) {
  const [value, setValue] = useState(50);
  const [submitted, setSubmitted] = useState(false);

  function handleChange(v: number) {
    setValue(v);
    onDraftChange?.(String(v));
  }

  function handleSubmit() {
    if (submitted || disabled) return;
    setSubmitted(true);
    onSubmit(String(value));
  }

  return (
    <div className="flex flex-col gap-6">
      <p className="text-lg text-center font-medium">{prompt}</p>
      <div className="flex flex-col items-center gap-3">
        <span className="text-5xl font-bold">{value}</span>
        <input
          type="range"
          min={0}
          max={100}
          value={value}
          onChange={(e) => handleChange(Number(e.target.value))}
          disabled={disabled || submitted}
          className="w-full accent-white"
        />
        <div className="flex justify-between w-full text-gray-400 text-xs">
          <span>0</span>
          <span>100</span>
        </div>
      </div>
      <button
        onClick={handleSubmit}
        disabled={disabled || submitted}
        className="bg-white text-black font-bold py-3 rounded disabled:opacity-40"
      >
        Valider
      </button>
    </div>
  );
}
