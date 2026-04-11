'use client';
import { useRef, useState, useEffect } from 'react';
import { Drawing, Stroke, Point } from '@/lib/clientTypes';

interface Props {
  prompt: string;
  onSubmit: (content: Drawing) => void;
  disabled?: boolean;
}

export default function DrawInput({ prompt, onSubmit, disabled }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawingRef = useRef<Drawing>([]);
  const isDrawingRef = useRef(false);
  const currentStrokeRef = useRef<Stroke>([]);
  const [submitted, setSubmitted] = useState(false);
  const [hasStrokes, setHasStrokes] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#1f2937';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, []);

  function getPoint(e: React.MouseEvent | React.TouchEvent): Point {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    if ('touches' in e) {
      const touch = e.touches[0];
      return {
        x: (touch.clientX - rect.left) / rect.width,
        y: (touch.clientY - rect.top) / rect.height,
      };
    }
    return {
      x: (e.clientX - rect.left) / rect.width,
      y: (e.clientY - rect.top) / rect.height,
    };
  }

  function drawSegment(a: Point, b: Point) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    ctx.beginPath();
    ctx.moveTo(a.x * canvas.width, a.y * canvas.height);
    ctx.lineTo(b.x * canvas.width, b.y * canvas.height);
    ctx.stroke();
  }

  function onPointerDown(e: React.MouseEvent | React.TouchEvent) {
    if (disabled || submitted) return;
    e.preventDefault();
    isDrawingRef.current = true;
    currentStrokeRef.current = [getPoint(e)];
  }

  function onPointerMove(e: React.MouseEvent | React.TouchEvent) {
    if (!isDrawingRef.current || disabled || submitted) return;
    e.preventDefault();
    const pt = getPoint(e);
    const stroke = currentStrokeRef.current;
    if (stroke.length > 0) drawSegment(stroke[stroke.length - 1], pt);
    stroke.push(pt);
  }

  function onPointerUp() {
    if (!isDrawingRef.current) return;
    isDrawingRef.current = false;
    const stroke = currentStrokeRef.current;
    if (stroke.length > 1) {
      drawingRef.current.push([...stroke]);
      setHasStrokes(true);
    }
    currentStrokeRef.current = [];
  }

  function clearCanvas() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#1f2937';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    drawingRef.current = [];
    setHasStrokes(false);
  }

  function handleSubmit() {
    if (submitted || disabled) return;
    setSubmitted(true);
    onSubmit(drawingRef.current);
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-lg text-center font-medium">{prompt}</p>
      <canvas
        ref={canvasRef}
        width={400}
        height={280}
        className="rounded-xl w-full touch-none"
        style={{ cursor: submitted ? 'default' : 'crosshair' }}
        onMouseDown={onPointerDown}
        onMouseMove={onPointerMove}
        onMouseUp={onPointerUp}
        onMouseLeave={onPointerUp}
        onTouchStart={onPointerDown}
        onTouchMove={onPointerMove}
        onTouchEnd={onPointerUp}
      />
      <div className="flex gap-2">
        <button
          onClick={clearCanvas}
          disabled={disabled || submitted || !hasStrokes}
          className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 rounded disabled:opacity-40 transition"
        >
          Effacer
        </button>
        <button
          onClick={handleSubmit}
          disabled={disabled || submitted}
          className="flex-1 bg-white text-black font-bold py-2 rounded disabled:opacity-40"
        >
          Valider
        </button>
      </div>
    </div>
  );
}
