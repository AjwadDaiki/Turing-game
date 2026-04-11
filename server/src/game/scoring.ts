import { Room, ScoreBreakdown } from '../types';

function emptyBreakdown(): ScoreBreakdown {
  return {
    robotSuspicionCount: 0,
    ninjaSuspicionCount: 0,
    robotSuspicionPts: 0,
    ninjaSuspicionPts: 0,
    finalVoteRobot: false,
    finalVoteNinja: false,
    finalVotePts: 0,
    doubleTrouvaille: false,
    doubleTrouvaillePts: 0,
    traitorSurvivalPts: 0,
    coveragePts: 0,
    confusionPts: 0,
    total: 0,
  };
}

/**
 * Computes the score breakdown for each human player.
 * The AI player (socketId='ai') is excluded from the result.
 */
export function computeScores(room: Room): Map<string, ScoreBreakdown> {
  const scores = new Map<string, ScoreBreakdown>();

  // Identify key players
  const iaPlayer = Array.from(room.players.values()).find((p) => p.isAI);
  const traitrePlayer = Array.from(room.players.values()).find((p) => p.role === 'traitre');
  const iaId = iaPlayer?.socketId ?? 'ai';
  const traitreId = traitrePlayer?.socketId;

  // Init score entries for all human players only
  for (const player of room.players.values()) {
    if (!player.isAI) {
      scores.set(player.socketId, emptyBreakdown());
    }
  }

  // ─── Suspicions (rounds) ──────────────────────────────────────────────────
  for (const round of room.rounds) {
    for (const suspicion of round.suspicions) {
      const { voterPlayerId, targetPlayerId, type } = suspicion;
      const breakdown = scores.get(voterPlayerId);

      if (type === 'robot') {
        // +5 to Traître when someone clicks robot on Traître (confusion bonus)
        if (targetPlayerId === traitreId && traitreId) {
          const traitreBreakdown = scores.get(traitreId);
          if (traitreBreakdown) {
            traitreBreakdown.confusionPts += 5;
          }
        }

        // +10 to voter for correct robot suspicion
        if (breakdown && targetPlayerId === iaId) {
          breakdown.robotSuspicionCount += 1;
          breakdown.robotSuspicionPts += 10;
        }
      }

      if (type === 'ninja') {
        // +15 to voter for correct ninja suspicion
        if (breakdown && traitreId && targetPlayerId === traitreId) {
          breakdown.ninjaSuspicionCount += 1;
          breakdown.ninjaSuspicionPts += 15;
        }
      }
    }
  }

  // ─── Final votes ──────────────────────────────────────────────────────────
  let iaFound = false;
  let traitreFound = false;

  for (const vote of room.finalVotes.values()) {
    const { voterPlayerId, robotTargetId, ninjaTargetId } = vote;

    // Defense in depth: ignore self-votes
    if (robotTargetId === voterPlayerId || ninjaTargetId === voterPlayerId) {
      const breakdown = scores.get(voterPlayerId);
      if (breakdown) {
        // Check correctness ignoring the self-targeted field
        const robotCorrect = robotTargetId !== voterPlayerId && robotTargetId === iaId;
        const ninjaCorrect = ninjaTargetId !== voterPlayerId && traitreId && ninjaTargetId === traitreId;
        if (robotCorrect) iaFound = true;
        if (ninjaCorrect) traitreFound = true;
        // No points awarded for the self-vote field itself
      }
      continue;
    }

    const breakdown = scores.get(voterPlayerId);
    let votePts = 0;

    const robotCorrect = robotTargetId === iaId;
    const ninjaCorrect = traitreId !== undefined && ninjaTargetId === traitreId;

    if (robotCorrect) {
      iaFound = true;
      if (breakdown) {
        breakdown.finalVoteRobot = true;
        votePts += 50;
      }
    }

    if (ninjaCorrect) {
      traitreFound = true;
      if (breakdown) {
        breakdown.finalVoteNinja = true;
        votePts += 75;
      }
    }

    if (breakdown) {
      breakdown.finalVotePts = votePts;  // only robot(+50) + ninja(+75), not doubleTrouvaille
      if (robotCorrect && ninjaCorrect) {
        breakdown.doubleTrouvaille = true;
        breakdown.doubleTrouvaillePts = 50;
      }
    }
  }

  // ─── Traître survival bonuses ─────────────────────────────────────────────
  if (traitreId) {
    const traitreBreakdown = scores.get(traitreId);
    if (traitreBreakdown) {
      if (!traitreFound) {
        traitreBreakdown.traitorSurvivalPts = 100;
        if (!iaFound) {
          traitreBreakdown.coveragePts = 50; // couverture parfaite
        }
      }
    }
  }

  // ─── Compute totals ───────────────────────────────────────────────────────
  for (const breakdown of scores.values()) {
    breakdown.total =
      breakdown.robotSuspicionPts +
      breakdown.ninjaSuspicionPts +
      breakdown.finalVotePts +
      breakdown.doubleTrouvaillePts +
      breakdown.traitorSurvivalPts +
      breakdown.coveragePts +
      breakdown.confusionPts;
  }

  return scores;
}
