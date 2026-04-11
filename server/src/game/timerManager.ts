/**
 * Creates a cancellable timer.
 * `onExpire` is called after `durationMs` unless `cancel()` is called first.
 */
export function createTimer(durationMs: number, onExpire: () => void): { cancel: () => void } {
  const handle = setTimeout(onExpire, durationMs);
  return {
    cancel: () => clearTimeout(handle),
  };
}
