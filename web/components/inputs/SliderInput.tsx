'use client';
import { useState } from 'react';

interface Props {
  prompt: string;
  onSubmit: (content: string) => void;
  onDraftChange?: (content: string) => void;
  disabled?: boolean;
}

export default function SliderInput({ onSubmit, onDraftChange, disabled }: Props) {
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
    <div className="flex flex-col gap-5">
      <div className="flex flex-col items-center gap-2">
        <span
          className="font-stamp"
          style={{ fontSize: '3rem', color: 'var(--ink-black)', letterSpacing: '0.05em', lineHeight: 1 }}
        >
          {value}
        </span>
        <div
          className="font-stamp"
          style={{ fontSize: '0.55rem', color: 'rgba(26,22,18,0.4)', letterSpacing: '0.1em' }}
        >
          VALEUR ESTIMÉE / 100
        </div>
      </div>
      {/* Rail style métal brossé */}
      <div className="flex flex-col gap-1">
        <input
          type="range" min={0} max={100} value={value}
          onChange={e => handleChange(Number(e.target.value))}
          disabled={disabled || submitted}
          className="w-full"
          style={{ accentColor: 'var(--ink-black)' }}
        />
        <div
          className="font-stamp flex justify-between"
          style={{ fontSize: '0.55rem', color: 'rgba(26,22,18,0.4)', letterSpacing: '0.08em' }}
        >
          <span>0</span><span>50</span><span>100</span>
        </div>
      </div>
      <button onClick={handleSubmit} disabled={disabled || submitted} className="btn-stamp w-full">
        VALIDER
      </button>
    </div>
  );
}
