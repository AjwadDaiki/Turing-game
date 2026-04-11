import { RevealedAnswer } from '@/lib/clientTypes';

interface Props {
  answer: RevealedAnswer;
  compact?: boolean;
}

export default function SliderReveal({ answer, compact }: Props) {
  const value = Number(answer.content) || 0;
  return (
    <div className="flex flex-col gap-1">
      <span className="text-gray-400 text-xs">{answer.pseudo}</span>
      {compact ? (
        <p className="font-bold text-sm">{value}/100</p>
      ) : (
        <div className="flex items-center gap-3">
          <div className="flex-1 h-3 bg-gray-700 rounded-full overflow-hidden">
            <div className="h-full bg-white rounded-full" style={{ width: `${value}%` }} />
          </div>
          <span className="font-bold text-xl w-10 text-right">{value}</span>
        </div>
      )}
    </div>
  );
}
