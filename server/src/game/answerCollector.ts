import { Room, Round } from '../types';

/** Fisher-Yates shuffle */
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Records (or updates) a player's answer for the current round.
 * Returns true only on the FIRST answer submission (triggers allAnswered check).
 * Subsequent calls overwrite the content silently — used by debounced auto-save.
 */
export function recordAnswer(room: Room, playerId: string, content: any): boolean {
  const round = currentRound(room);
  if (!round) return false;

  const isFirst = !round.answers.has(playerId);
  round.answers.set(playerId, { playerId, content, submittedAt: Date.now() });

  // Only check allAnswered on first submission (to trigger early phase transition)
  return isFirst ? allAnswered(room, round) : false;
}

/**
 * Fills empty answers for players who did not respond before timer expiry.
 * Generates the random revealOrder for the defilement phase.
 */
export function finalizeRound(room: Room): void {
  const round = currentRound(room);
  if (!round) return;

  // All active players (including AI) should have an answer slot
  for (const player of room.players.values()) {
    if (!round.answers.has(player.socketId)) {
      round.answers.set(player.socketId, {
        playerId: player.socketId,
        content: null,
        submittedAt: Date.now(),
      });
    }
  }

  // Generate randomized reveal order
  const playerIds = Array.from(round.answers.keys());
  round.revealOrder = shuffle(playerIds);
  round.revealIndex = 0;
}

function currentRound(room: Room): Round | undefined {
  return room.rounds[room.currentRound - 1];
}

function allAnswered(room: Room, round: Round): boolean {
  const activePlayers = Array.from(room.players.values()).filter((p) => p.connected);
  return activePlayers.every((p) => round.answers.has(p.socketId));
}
