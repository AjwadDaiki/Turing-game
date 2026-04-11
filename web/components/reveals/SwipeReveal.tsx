import { RevealedAnswer, SwipeContent } from '@/lib/clientTypes';

interface Props {
  answer: RevealedAnswer;
  compact?: boolean;
}

export default function SwipeReveal({ answer, compact }: Props) {
  const content: SwipeContent | null =
    answer.content && typeof answer.content === 'object' ? answer.content : null;

  return (
    <div className="flex flex-col gap-1">
      <span className="text-gray-400 text-xs">{answer.pseudo}</span>
      {!content ? (
        <p className="text-gray-500">—</p>
      ) : compact ? (
        <p className="font-mono text-xs tracking-widest">{content.votes}</p>
      ) : (
        <div className="flex gap-1 flex-wrap mt-1">
          {content.images.map((url, i) => {
            const vote = content.votes.split(' ')[i];
            return (
              <div key={i} className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt="" className="w-14 h-14 object-cover rounded" />
                <span
                  className={`absolute bottom-0 right-0 text-xs font-bold px-1 rounded-tl ${
                    vote === 'L' ? 'bg-red-600' : 'bg-green-600'
                  }`}
                >
                  {vote}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
