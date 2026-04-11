/**
 * Generates a random abstract drawing for the AI player.
 * Format matches the client's Drawing type: Stroke[] where Stroke = {x,y}[]
 * All coordinates are normalized 0–1.
 */

interface Point { x: number; y: number }
type Stroke = Point[];
type Drawing = Stroke[];

function rand(): number {
  return Math.random();
}

function clamp(v: number): number {
  return Math.max(0.05, Math.min(0.95, v));
}

/** Zigzag stroke across the canvas */
function zigzag(steps: number): Stroke {
  const stroke: Stroke = [];
  const y0 = 0.2 + rand() * 0.6;
  for (let i = 0; i < steps; i++) {
    const x = clamp(0.1 + (i / (steps - 1)) * 0.8);
    const y = clamp(y0 + (i % 2 === 0 ? 0.1 : -0.1) * (0.5 + rand() * 0.5));
    stroke.push({ x, y });
  }
  return stroke;
}

/** Rough circle / spiral approximation */
function spiral(points: number): Stroke {
  const stroke: Stroke = [];
  const cx = 0.3 + rand() * 0.4;
  const cy = 0.3 + rand() * 0.4;
  for (let i = 0; i < points; i++) {
    const t = (i / points) * Math.PI * 3;
    const r = 0.05 + (i / points) * 0.2;
    stroke.push({
      x: clamp(cx + Math.cos(t) * r),
      y: clamp(cy + Math.sin(t) * r),
    });
  }
  return stroke;
}

/** Random scribble — small dense cluster */
function scribble(points: number): Stroke {
  const stroke: Stroke = [];
  let x = 0.2 + rand() * 0.6;
  let y = 0.2 + rand() * 0.6;
  for (let i = 0; i < points; i++) {
    x = clamp(x + (rand() - 0.5) * 0.12);
    y = clamp(y + (rand() - 0.5) * 0.12);
    stroke.push({ x, y });
  }
  return stroke;
}

/** Diagonal line */
function diagonal(): Stroke {
  const x0 = 0.05 + rand() * 0.3;
  const y0 = 0.05 + rand() * 0.3;
  const x1 = 0.6 + rand() * 0.3;
  const y1 = 0.6 + rand() * 0.3;
  const steps = 8 + Math.floor(rand() * 5);
  const stroke: Stroke = [];
  for (let i = 0; i < steps; i++) {
    const t = i / (steps - 1);
    stroke.push({ x: clamp(x0 + t * (x1 - x0)), y: clamp(y0 + t * (y1 - y0)) });
  }
  return stroke;
}

const GENERATORS = [
  () => zigzag(7 + Math.floor(rand() * 8)),
  () => spiral(10 + Math.floor(rand() * 6)),
  () => scribble(8 + Math.floor(rand() * 7)),
  () => diagonal(),
];

export function generateRandomDrawing(): Drawing {
  const numStrokes = 2 + Math.floor(rand() * 3); // 2–4 strokes
  const drawing: Drawing = [];
  for (let i = 0; i < numStrokes; i++) {
    const gen = GENERATORS[Math.floor(rand() * GENERATORS.length)];
    drawing.push(gen());
  }
  return drawing;
}
