import { RevealedAnswer } from '@/lib/clientTypes';

interface Props {
  answer: RevealedAnswer;
  compact?: boolean;
}

export default function EmojiReveal({ answer, compact }: Props) {
  return (
    <p style={{ fontSize: compact ? '1.8rem' : '4rem', lineHeight: 1 }}>
      {answer.content ?? '—'}
    </p>
  );
}
