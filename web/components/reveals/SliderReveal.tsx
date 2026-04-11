import { RevealedAnswer } from '@/lib/clientTypes';

interface Props {
  answer: RevealedAnswer;
  compact?: boolean;
}

export default function SliderReveal({ answer, compact }: Props) {
  const value = Number(answer.content) || 0;
  return compact ? (
    <p
      className="font-stamp"
      style={{ fontSize: '1.2rem', color: 'var(--ink-black)', letterSpacing: '0.05em' }}
    >
      {value}
      <span style={{ fontSize: '0.55rem', opacity: 0.5, marginLeft: 2 }}>/100</span>
    </p>
  ) : (
    <div className="flex flex-col gap-2">
      <p
        className="font-stamp"
        style={{ fontSize: '2rem', color: 'var(--ink-black)', letterSpacing: '0.05em' }}
      >
        {value}
      </p>
      <div
        style={{
          height: 8,
          background: 'rgba(26,22,18,0.12)',
          border: '1px solid rgba(26,22,18,0.2)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${value}%`,
            background: 'var(--ink-black)',
          }}
        />
      </div>
    </div>
  );
}
