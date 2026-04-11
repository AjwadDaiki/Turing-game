import { RevealedAnswer } from '@/lib/clientTypes';

interface Props {
  answer: RevealedAnswer;
  compact?: boolean;
}

export default function EmojiReveal({ answer, compact }: Props) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-gray-400 text-xs">{answer.pseudo}</span>
      <p className={compact ? 'text-2xl' : 'text-6xl'}>{answer.content ?? '—'}</p>
    </div>
  );
}
