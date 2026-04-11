import { RevealedAnswer, SwipeContent } from '@/lib/clientTypes';

interface Props {
  answer: RevealedAnswer;
  compact?: boolean;
}

export default function SwipeReveal({ answer, compact }: Props) {
  const content: SwipeContent | null =
    answer.content && typeof answer.content === 'object' ? answer.content : null;

  if (!content) {
    return (
      <span className="font-typewriter" style={{ fontSize: '0.7rem', color: 'rgba(26,22,18,0.4)' }}>
        —
      </span>
    );
  }

  if (compact) {
    return (
      <p
        className="font-typewriter"
        style={{ fontSize: '0.6rem', color: 'var(--ink-black)', letterSpacing: '0.12em', wordBreak: 'break-all' }}
      >
        {content.votes}
      </p>
    );
  }

  return (
    <div className="flex gap-1.5 flex-wrap mt-1">
      {content.images.map((url, i) => {
        const vote = content.votes.split(' ')[i];
        return (
          <div key={i} className="relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt="" className="w-14 h-14 object-cover" style={{ display: 'block' }} />
            <span
              className="font-stamp"
              style={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                fontSize: '0.5rem',
                padding: '1px 3px',
                background: vote === 'L' ? 'var(--stamp-red)' : 'var(--accent-green)',
                color: 'var(--paper-cream)',
                letterSpacing: '0.05em',
              }}
            >
              {vote}
            </span>
          </div>
        );
      })}
    </div>
  );
}
