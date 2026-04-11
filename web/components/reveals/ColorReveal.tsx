import { RevealedAnswer } from '@/lib/clientTypes';

interface Props {
  answer: RevealedAnswer;
  compact?: boolean;
}

export default function ColorReveal({ answer, compact }: Props) {
  const color = typeof answer.content === 'string' ? answer.content : '#333333';
  return (
    <div className="flex flex-col gap-1">
      <div
        style={{
          backgroundColor: color,
          height: compact ? 32 : 64,
          width: compact ? 56 : 112,
          border: '1px solid rgba(26,22,18,0.2)',
        }}
      />
      {!compact && (
        <span
          className="font-typewriter"
          style={{ fontSize: '0.65rem', color: 'rgba(26,22,18,0.55)' }}
        >
          {color}
        </span>
      )}
    </div>
  );
}
