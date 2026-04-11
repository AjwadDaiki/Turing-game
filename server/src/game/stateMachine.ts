import { Room, GamePhase } from '../types';

type PhaseTarget = GamePhase | 'finished';

/**
 * Validates and applies a phase transition to a room.
 *
 * Valid transitions:
 *   lobby     → intro        (sets status=playing)
 *   intro     → epreuve
 *   epreuve   → defilement
 *   defilement → epreuve     (rounds 1–4, increments currentRound)
 *   defilement → recap       (round 5 only)
 *   recap     → vote
 *   vote      → reveal
 *   reveal    → finished     (sets status=finished)
 *
 * All other paths throw.
 */
export function transition(room: Room, to: PhaseTarget): void {
  if (room.status === 'finished') {
    throw new Error(`Transition invalide : partie terminée`);
  }

  const from = room.currentPhase;

  switch (`${from}→${to}`) {
    case 'lobby→intro':
      room.currentPhase = 'intro';
      room.status = 'playing';  // ← CRITIQUE : bloque les nouveaux joueurs
      return;

    case 'intro→epreuve':
      room.currentPhase = 'epreuve';
      return;

    case 'epreuve→defilement':
      room.currentPhase = 'defilement';
      return;

    case 'defilement→epreuve':
      if (room.currentRound >= 5) {
        throw new Error('Transition invalide : round 5 doit aller en recap');
      }
      room.currentRound += 1;
      room.currentPhase = 'epreuve';
      return;

    case 'defilement→vote':
      if (room.currentRound < 5) {
        throw new Error(`Transition invalide : vote trop tôt (round ${room.currentRound})`);
      }
      room.currentPhase = 'vote';
      return;

    case 'vote→reveal':
      room.currentPhase = 'reveal';
      return;

    case 'reveal→finished':
      room.status = 'finished';
      return;

    default:
      throw new Error(`Transition invalide : ${from} → ${to}`);
  }
}
