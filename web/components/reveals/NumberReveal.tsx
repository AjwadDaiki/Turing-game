import { RevealedAnswer } from '@/lib/clientTypes';

interface Props {
  answer: RevealedAnswer;
  compact?: boolean;
}

export default function NumberReveal({ answer, compact }: Props) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-gray-400 text-xs">{answer.pseudo}</span>
      <p className={`font-bold font-mono ${compact ? 'text-base' : 'text-3xl'}`}>
        {answer.content ?? '—'}
      </p>
    </div>
  );
}
