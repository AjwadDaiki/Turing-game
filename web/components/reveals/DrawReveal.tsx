'use client';
import { useEffect, useRef } from 'react';
import { RevealedAnswer, Drawing } from '@/lib/clientTypes';

interface Props {
  answer: RevealedAnswer;
  compact?: boolean;
}

export default function DrawReveal({ answer, compact }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const W = compact ? 90 : 280;
  const H = compact ? 68 : 210;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;

    /* Fond papier crème en mode compact, sombre sinon */
    ctx.fillStyle = compact ? '#D4C8A8' : '#1f2937';
    ctx.fillRect(0, 0, W, H);

    const drawing: Drawing = Array.isArray(answer.content) ? answer.content : [];
    if (!drawing.length) return;

    ctx.strokeStyle = compact ? '#1A1612' : '#ffffff';
    ctx.lineWidth = compact ? 1.2 : 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    for (const stroke of drawing) {
      if (stroke.length < 2) continue;
      ctx.beginPath();
      ctx.moveTo(stroke[0].x * W, stroke[0].y * H);
      for (let i = 1; i < stroke.length; i++) {
        ctx.lineTo(stroke[i].x * W, stroke[i].y * H);
      }
      ctx.stroke();
    }
  }, [answer.content, W, H, compact]);

  const hasDrawing = Array.isArray(answer.content) && answer.content.length > 0;

  if (!hasDrawing) {
    return (
      <span
        className="font-typewriter"
        style={{ fontSize: '0.65rem', color: 'rgba(26,22,18,0.35)', fontStyle: 'italic' }}
      >
        pas de dessin
      </span>
    );
  }

  return <canvas ref={canvasRef} width={W} height={H} style={{ display: 'block' }} />;
}
