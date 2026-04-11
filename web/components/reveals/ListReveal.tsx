import { RevealedAnswer } from '@/lib/clientTypes';

interface Props {
  answer: RevealedAnswer;
  compact?: boolean;
}

export default function ListReveal({ answer, compact }: Props) {
  const raw = typeof answer.content === 'string' ? answer.content : '';
  const items = raw
    .split(',')
    .map((s: string) => s.trim())
    .filter(Boolean);

  return (
    <div className="flex flex-col gap-1">
      <span className="text-gray-400 text-xs">{answer.pseudo}</span>
      {compact ? (
        <p className="text-sm">
          {items.slice(0, 3).join(', ')}
          {items.length > 3 ? '…' : ''}
        </p>
      ) : (
        <ul className="list-disc list-inside space-y-1">
          {items.map((item, i) => (
            <li key={i} className="text-white text-sm">
              {item}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
