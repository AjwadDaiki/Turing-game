import { RevealedAnswer } from '@/lib/clientTypes';

interface Props {
  answer: RevealedAnswer;
  compact?: boolean;
}

export default function TextReveal({ answer, compact }: Props) {
  return (
    <p
      className="font-typewriter break-words"
      style={{
        fontSize: compact ? '0.72rem' : '1.5rem',
        fontWeight: 700,
        color: 'var(--ink-black)',
        lineHeight: 1.3,
        wordBreak: 'break-word',
      }}
    >
      {answer.content ?? '—'}
    </p>
  );
}
