import { RevealedAnswer } from '@/lib/clientTypes';

interface Props {
  answer: RevealedAnswer;
  compact?: boolean;
}

export default function ColorReveal({ answer, compact }: Props) {
  const color = typeof answer.content === 'string' ? answer.content : '#333333';
  return (
    <div className="flex flex-col gap-1">
      <span className="text-gray-400 text-xs">{answer.pseudo}</span>
      <div
        style={{ backgroundColor: color }}
        className={`rounded ${compact ? 'h-8 w-14' : 'h-16 w-28'}`}
      />
      {!compact && <span className="text-xs text-gray-400 font-mono">{color}</span>}
    </div>
  );
}
