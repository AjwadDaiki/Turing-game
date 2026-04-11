import { RevealedAnswer } from '@/lib/clientTypes';

interface Props {
  answer: RevealedAnswer;
  compact?: boolean;
}

export default function NumberReveal({ answer, compact }: Props) {
  return (
    <p
      className="font-typewriter font-bold"
      style={{
        fontSize: compact ? '1.1rem' : '2.5rem',
        color: 'var(--ink-black)',
        letterSpacing: '0.05em',
      }}
    >
      {answer.content ?? '—'}
    </p>
  );
}
