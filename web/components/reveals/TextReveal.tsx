import { RevealedAnswer } from '@/lib/clientTypes';

interface Props {
  answer: RevealedAnswer;
  compact?: boolean;
}

export default function TextReveal({ answer, compact }: Props) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-gray-400 text-xs">{answer.pseudo}</span>
      <p className={`font-bold ${compact ? 'text-sm' : 'text-2xl'} break-words`}>
        {answer.content ?? '—'}
      </p>
    </div>
  );
}
