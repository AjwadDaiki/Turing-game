import { Server, Socket } from 'socket.io';
import { Room, Round } from '../types';
import { sanitizeRoom, getRoomByPlayerId } from '../rooms/roomManager';
import { assignRoles } from '../game/roleMachine';
import { selectEpreuves } from '../game/epreuveSelector';
import { transition } from '../game/stateMachine';
import { recordAnswer, finalizeRound } from '../game/answerCollector';
import { computeScores } from '../game/scoring';
import { createTimer } from '../game/timerManager';
import { getAIAnswer } from '../game/aiPlayer';

const INTRO_DURATION_MS = 3000;
const VOTE_DURATION_MS = 45000;
const DEFILEMENT_AUTO_MS = 30000;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ─── Game loop ────────────────────────────────────────────────────────────────

/**
 * Main async game loop. All phase transitions happen here.
 * runEpreuve/runDefilement only handle async waiting, no transitions.
 */
async function runGame(io: Server, room: Room): Promise<void> {
  // ── Intro ──
  transition(room, 'intro'); // lobby → intro, status=playing
  io.to(room.code).emit('phase:changed', { phase: 'intro', roundNumber: 0 });
  io.to(room.code).emit('room:state', sanitizeRoom(room));
  await delay(INTRO_DURATION_MS);

  // ── Round 1: intro → epreuve ──
  room.currentRound = 1;
  transition(room, 'epreuve'); // intro → epreuve
  emitEpreuveStarted(io, room);

  for (let roundIdx = 0; roundIdx < 5; roundIdx++) {
    // Collect answers (timer or all-answered)
    await waitForAnswers(room);
    finalizeRound(room);

    // epreuve → defilement
    transition(room, 'defilement');
    io.to(room.code).emit('phase:changed', { phase: 'defilement', roundNumber: room.currentRound });
    io.to(room.code).emit('room:state', sanitizeRoom(room));

    await waitForDefilement(io, room);

    if (roundIdx < 4) {
      // defilement → epreuve (increments currentRound)
      transition(room, 'epreuve');
      emitEpreuveStarted(io, room);
    }
  }

  // ── Vote (direct après round 5, plus de recap) ──
  transition(room, 'vote');
  io.to(room.code).emit('phase:changed', { phase: 'vote', roundNumber: 5 });
  io.to(room.code).emit('room:state', sanitizeRoom(room));
  await waitForVotes(room);

  // ── Reveal ──
  transition(room, 'reveal');
  const scoreMap = computeScores(room);
  const scoresObj: Record<string, any> = {};
  for (const [id, breakdown] of scoreMap.entries()) {
    scoresObj[id] = breakdown;
  }
  const traitre = Array.from(room.players.values()).find((p) => p.role === 'traitre');
  const ia = Array.from(room.players.values()).find((p) => p.isAI);
  io.to(room.code).emit('phase:changed', { phase: 'reveal', roundNumber: 5 });
  io.to(room.code).emit('scores:final', {
    scores: scoresObj,
    reveal: {
      traitorSocketId: traitre?.socketId,
      traitorPseudo: traitre?.pseudo,
      traitorCodename: traitre?.codename,
      iaSocketId: ia?.socketId,
      iaPseudo: ia?.pseudo,
      iaCodename: ia?.codename,
    },
  });
  io.to(room.code).emit('room:state', sanitizeRoom(room));

  await delay(10000);

  // ── Finished ──
  transition(room, 'finished' as any);
  room.lastActivityAt = Date.now();
  io.to(room.code).emit('room:state', sanitizeRoom(room));
}

function emitEpreuveStarted(io: Server, room: Room): void {
  const round = room.rounds[room.currentRound - 1];
  io.to(room.code).emit('phase:changed', { phase: 'epreuve', roundNumber: room.currentRound });
  io.to(room.code).emit('epreuve:started', {
    epreuveId: round.epreuve.id,
    prompt: round.resolvedPrompt,
    inputType: round.epreuve.inputType,
    timeLimit: round.epreuve.timeLimit,
    roundNumber: room.currentRound,
  });
  io.to(room.code).emit('room:state', sanitizeRoom(room));

  // Fire-and-forget: AI responds in parallel with the épreuve timer
  getAIAnswer(round.epreuve, round).catch((err: Error) => {
    console.error(`[ai] Unexpected error in room ${room.code}:`, err.message);
  });
}

function waitForAnswers(room: Room): Promise<void> {
  const round = room.rounds[room.currentRound - 1];
  return new Promise<void>((resolve) => {
    const timer = createTimer(round.epreuve.timeLimit * 1000, resolve);
    (room as any)._epreuveResolve = () => { timer.cancel(); resolve(); };
  }).then(() => { delete (room as any)._epreuveResolve; });
}

function waitForDefilement(io: Server, room: Room): Promise<void> {
  const round = room.rounds[room.currentRound - 1];
  return new Promise<void>((resolve) => {
    const timer = createTimer(DEFILEMENT_AUTO_MS, resolve);

    (room as any)._defilementReveal = () => {
      if (round.revealIndex < round.revealOrder.length) {
        const playerId = round.revealOrder[round.revealIndex];
        const answer = round.answers.get(playerId);
        io.to(room.code).emit('defilement:reveal', {
          playerId,
          pseudo: room.players.get(playerId)?.pseudo,
          content: answer?.content ?? null,
          roundNumber: room.currentRound,
          position: round.revealIndex,
          total: round.revealOrder.length,
        });
        round.revealIndex++;
      } else {
        // All answers revealed and host clicks again → end defilement
        timer.cancel();
        resolve();
      }
    };
  }).then(() => {
    delete (room as any)._defilementReveal;
  });
}

function waitForVotes(room: Room): Promise<void> {
  return new Promise<void>((resolve) => {
    const timer = createTimer(VOTE_DURATION_MS, resolve);
    (room as any)._checkVotesComplete = () => {
      // Recalculate humanCount dynamically (handles disconnects during vote)
      const humanCount = Array.from(room.players.values()).filter((p) => !p.isAI && p.connected).length;
      if (room.finalVotes.size >= humanCount) { timer.cancel(); resolve(); }
    };
  }).then(() => { delete (room as any)._checkVotesComplete; });
}

// ─── Handler registration ─────────────────────────────────────────────────────

export function registerGameHandlers(
  io: Server,
  socket: Socket,
  rooms: Map<string, Room>
): void {

  // game:start (host only)
  socket.on('game:start', () => {
    const room = getRoomByPlayerId(rooms, socket.id);
    if (!room) return socket.emit('error', { message: 'Room introuvable' });
    if (room.hostSocketId !== socket.id) return socket.emit('error', { message: 'Hôte uniquement' });
    if (room.status !== 'lobby') return socket.emit('error', { message: 'Partie déjà en cours' });

    const humanCount = Array.from(room.players.values()).filter((p) => !p.isAI).length;
    if (humanCount < 4) return socket.emit('error', { message: 'Il faut au moins 4 joueurs' });

    try {
      assignRoles(room);

      // Send each player their private role
      for (const player of room.players.values()) {
        if (!player.isAI) {
          const payload: any = { role: player.role };
          if (player.role === 'traitre') payload.codename = player.codename;
          io.to(player.socketId).emit('role:assigned', payload);
        }
      }

      // Build rounds
      const epreuves = selectEpreuves();
      room.rounds = epreuves.map((e, i): Round => ({
        roundNumber: i + 1,
        epreuve: e,
        resolvedPrompt: e.resolvedPrompt,
        answers: new Map(),
        suspicions: [],
        revealOrder: [],
        revealIndex: 0,
      }));

      // Fire-and-forget async game loop
      runGame(io, room).catch((err) => {
        console.error(`[game] Error in room ${room.code}:`, err);
      });

    } catch (err: any) {
      socket.emit('error', { message: err.message });
    }
  });

  // epreuve:answer
  socket.on('epreuve:answer', ({ content }: { content: unknown }) => {
    const room = getRoomByPlayerId(rooms, socket.id);
    if (!room || room.currentPhase !== 'epreuve') return;

    const round = room.rounds[room.currentRound - 1];
    const isFirst = round && !round.answers.has(socket.id);

    const allDone = recordAnswer(room, socket.id, content);

    // Notify others only on first answer (indicator dots)
    if (isFirst) io.to(room.code).emit('player:answered', { playerId: socket.id });

    if (allDone && (room as any)._epreuveResolve) {
      (room as any)._epreuveResolve();
    }
  });

  // defilement:next (host only)
  socket.on('defilement:next', () => {
    const room = getRoomByPlayerId(rooms, socket.id);
    if (!room || room.currentPhase !== 'defilement') return;
    if (room.hostSocketId !== socket.id) return;

    const revealFn = (room as any)._defilementReveal;
    if (revealFn) revealFn();
  });

  // suspicion:add
  socket.on('suspicion:add', ({ targetPlayerId, type }: { targetPlayerId: unknown; type: unknown }) => {
    const room = getRoomByPlayerId(rooms, socket.id);
    if (!room || room.currentPhase !== 'defilement') return;
    if (typeof targetPlayerId !== 'string' || (type !== 'robot' && type !== 'ninja')) return;
    if (targetPlayerId === socket.id) return;

    const round = room.rounds[room.currentRound - 1];
    if (!round) return;

    const alreadyVoted = round.suspicions.some(
      (s) => s.voterPlayerId === socket.id && s.type === type
    );
    if (alreadyVoted) {
      console.log(`[suspicion] ${socket.id} → ${targetPlayerId} (${type}) IGNORÉ : déjà voté ce type ce round`);
      return;
    }

    round.suspicions.push({ voterPlayerId: socket.id, targetPlayerId, type });
    socket.emit('suspicion:confirmed', { targetPlayerId, type });
    console.log(`[suspicion] ${socket.id} → ${targetPlayerId} (${type}) enregistré`);
  });

  // vote:final
  socket.on('vote:final', ({ robotTargetId, ninjaTargetId }: { robotTargetId: unknown; ninjaTargetId: unknown }) => {
    const room = getRoomByPlayerId(rooms, socket.id);
    if (!room || room.currentPhase !== 'vote') return;
    if (typeof robotTargetId !== 'string' || typeof ninjaTargetId !== 'string') return;
    if (robotTargetId === socket.id || ninjaTargetId === socket.id) return;
    if (room.finalVotes.has(socket.id)) return;

    room.finalVotes.set(socket.id, { voterPlayerId: socket.id, robotTargetId, ninjaTargetId });
    io.to(room.code).emit('player:voted', { playerId: socket.id });

    const checkFn = (room as any)._checkVotesComplete;
    if (checkFn) checkFn();
  });
}
