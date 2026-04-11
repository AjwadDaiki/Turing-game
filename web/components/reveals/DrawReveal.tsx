'use client';
import { useEffect, useRef } from 'react';
import { RevealedAnswer, Drawing } from '@/lib/clientTypes';

interface Props {
  answer: RevealedAnswer;
  compact?: boolean;
}

export default function DrawReveal({ answer, compact }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const W = compact ? 100 : 280;
  const H = compact ? 75 : 210;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;

    ctx.fillStyle = '#1f2937';
    ctx.fillRect(0, 0, W, H);

    const drawing: Drawing = Array.isArray(answer.content) ? answer.content : [];
    if (!drawing.length) return;

    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = compact ? 1.5 : 3;
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

  return (
    <div className="flex flex-col gap-1">
      <span className="text-gray-400 text-xs">{answer.pseudo}</span>
      {hasDrawing ? (
        <canvas ref={canvasRef} width={W} height={H} className="rounded block" />
      ) : (
        <p className="text-gray-500 italic text-sm">Pas de dessin</p>
      )}
    </div>
  );
}
