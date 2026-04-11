import { Room, Round, Answer } from '../types';

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
 * Records a player's answer for the current round.
 * Returns true if all active players have now answered (triggers phase transition).
 */
export function recordAnswer(room: Room, playerId: string, content: any): boolean {
  const round = currentRound(room);
  if (!round) return false;
  if (round.answers.has(playerId)) return false; // already answered

  const answer: Answer = { playerId, content, submittedAt: Date.now() };
  round.answers.set(playerId, answer);

  return allAnswered(room, round);
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
