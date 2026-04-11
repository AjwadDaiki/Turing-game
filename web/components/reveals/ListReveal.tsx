import { RevealedAnswer } from '@/lib/clientTypes';

interface Props {
  answer: RevealedAnswer;
  compact?: boolean;
}

export default function ListReveal({ answer, compact }: Props) {
  const raw = typeof answer.content === 'string' ? answer.content : '';
  const items = raw.split(',').map((s: string) => s.trim()).filter(Boolean);

  return compact ? (
    <p
      className="font-typewriter"
      style={{ fontSize: '0.65rem', color: 'var(--ink-black)', lineHeight: 1.4 }}
    >
      {items.slice(0, 3).join(', ')}
      {items.length > 3 ? '…' : ''}
    </p>
  ) : (
    <ol style={{ paddingLeft: 16, margin: 0, listStyle: 'decimal' }}>
      {items.map((item, i) => (
        <li
          key={i}
          className="font-typewriter"
          style={{ fontSize: '0.9rem', color: 'var(--ink-black)', marginBottom: 4 }}
        >
          {item}
        </li>
      ))}
    </ol>
  );
}
