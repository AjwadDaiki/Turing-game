import { computeScores } from '../game/scoring';
import { createRoom, joinRoom } from '../rooms/roomManager';
import { Room, Round, Suspicion, FinalVote, Player } from '../types';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function makeRoom(): Room {
  const room = createRoom('CIVIL1', 'Alice', new Set());
  joinRoom(room, 'CIVIL2', 'Bob');
  joinRoom(room, 'CIVIL3', 'Carol');
  // Manually assign roles (no import of roleMachine to keep tests pure)
  room.players.get('CIVIL1')!.role = 'civil';
  room.players.get('CIVIL2')!.role = 'civil';
  room.players.get('CIVIL3')!.role = 'civil';

  // Add Traître
  joinRoom(room, 'TRAITRE', 'Dave');
  room.players.get('TRAITRE')!.role = 'traitre';
  room.players.get('TRAITRE')!.codename = 'GOKU';

  // Add AI
  const aiPlayer: Player = {
    socketId: 'ai',
    pseudo: 'Morgan',
    role: 'ia',
    codename: 'VEGETA',
    isHost: false,
    isAI: true,
    connected: true,
    totalScore: 0,
  };
  room.players.set('ai', aiPlayer);

  room.status = 'playing';
  return room;
}

function makeRound(n: number, suspicions: Suspicion[] = []): Round {
  return {
    roundNumber: n,
    epreuve: {} as any,
    resolvedPrompt: 'test',
    answers: new Map(),
    suspicions,
    revealOrder: [],
    revealIndex: 0,
  };
}

function makeFinalVote(
  voter: string,
  robot: string,
  ninja: string
): FinalVote {
  return { voterPlayerId: voter, robotTargetId: robot, ninjaTargetId: ninja };
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('computeScores', () => {
  // Rule 1: +10 per correct robot suspicion
  it('+10 for correct robot suspicion (civil clicks robot on IA answer)', () => {
    const room = makeRoom();
    room.rounds = [
      makeRound(1, [{ voterPlayerId: 'CIVIL1', targetPlayerId: 'ai', type: 'robot' }]),
    ];
    room.finalVotes = new Map();
    const scores = computeScores(room);
    expect(scores.get('CIVIL1')!.robotSuspicionPts).toBe(10);
  });

  // Rule 2: +15 per correct ninja suspicion
  it('+15 for correct ninja suspicion (civil clicks ninja on Traître answer)', () => {
    const room = makeRoom();
    room.rounds = [
      makeRound(1, [{ voterPlayerId: 'CIVIL1', targetPlayerId: 'TRAITRE', type: 'ninja' }]),
    ];
    room.finalVotes = new Map();
    const scores = computeScores(room);
    expect(scores.get('CIVIL1')!.ninjaSuspicionPts).toBe(15);
  });

  // Rule 3: 0 for wrong suspicion (no malus)
  it('0 for wrong robot suspicion on a civil (no malus)', () => {
    const room = makeRoom();
    room.rounds = [
      makeRound(1, [{ voterPlayerId: 'CIVIL1', targetPlayerId: 'CIVIL2', type: 'robot' }]),
    ];
    room.finalVotes = new Map();
    const scores = computeScores(room);
    expect(scores.get('CIVIL1')!.robotSuspicionPts).toBe(0);
    expect(scores.get('CIVIL1')!.total).toBeGreaterThanOrEqual(0); // no negative
  });

  // Rule 4: +50 correct final vote for IA
  it('+50 for correctly voting IA in final vote', () => {
    const room = makeRoom();
    room.rounds = [];
    room.finalVotes = new Map([
      ['CIVIL1', makeFinalVote('CIVIL1', 'ai', 'CIVIL2')], // correct robot, wrong ninja
    ]);
    const scores = computeScores(room);
    expect(scores.get('CIVIL1')!.finalVoteRobot).toBe(true);
    expect(scores.get('CIVIL1')!.finalVotePts).toBeGreaterThanOrEqual(50);
  });

  // Rule 5: +75 correct final vote for Traître
  it('+75 for correctly voting Traître in final vote', () => {
    const room = makeRoom();
    room.rounds = [];
    room.finalVotes = new Map([
      ['CIVIL1', makeFinalVote('CIVIL1', 'CIVIL2', 'TRAITRE')], // wrong robot, correct ninja
    ]);
    const scores = computeScores(room);
    expect(scores.get('CIVIL1')!.finalVoteNinja).toBe(true);
    expect(scores.get('CIVIL1')!.finalVotePts).toBeGreaterThanOrEqual(75);
  });

  // Rule 6: +50 Double Trouvaille bonus
  it('+50 Double Trouvaille when both final votes are correct', () => {
    const room = makeRoom();
    room.rounds = [];
    room.finalVotes = new Map([
      ['CIVIL1', makeFinalVote('CIVIL1', 'ai', 'TRAITRE')],
    ]);
    const scores = computeScores(room);
    expect(scores.get('CIVIL1')!.doubleTrouvaille).toBe(true);
    expect(scores.get('CIVIL1')!.doubleTrouvaillePts).toBe(50);
  });

  // Rule 7: No Double Trouvaille if only one correct
  it('no Double Trouvaille if only one final vote is correct', () => {
    const room = makeRoom();
    room.rounds = [];
    room.finalVotes = new Map([
      ['CIVIL1', makeFinalVote('CIVIL1', 'ai', 'CIVIL2')], // robot correct, ninja wrong
    ]);
    const scores = computeScores(room);
    expect(scores.get('CIVIL1')!.doubleTrouvaille).toBe(false);
    expect(scores.get('CIVIL1')!.doubleTrouvaillePts).toBe(0);
  });

  // Rule 8: +5 to Traître per robot click on Traître answer
  it('+5 to Traître each time someone clicks robot on Traître answer', () => {
    const room = makeRoom();
    room.rounds = [
      makeRound(1, [
        { voterPlayerId: 'CIVIL1', targetPlayerId: 'TRAITRE', type: 'robot' },
        { voterPlayerId: 'CIVIL2', targetPlayerId: 'TRAITRE', type: 'robot' },
      ]),
    ];
    room.finalVotes = new Map();
    const scores = computeScores(room);
    expect(scores.get('TRAITRE')!.confusionPts).toBe(10); // 2 × 5
  });

  // Rule 9: +100 to Traître if not found in final vote
  it('+100 to Traître if no voter votes ninja=Traître', () => {
    const room = makeRoom();
    room.rounds = [];
    room.finalVotes = new Map([
      ['CIVIL1', makeFinalVote('CIVIL1', 'ai', 'CIVIL2')], // ninja wrong
      ['CIVIL2', makeFinalVote('CIVIL2', 'ai', 'CIVIL3')], // ninja wrong
    ]);
    const scores = computeScores(room);
    expect(scores.get('TRAITRE')!.traitorSurvivalPts).toBe(100);
  });

  // Rule 10: +50 coverage parfaite (Traître AND IA both not found)
  it('+50 coverage parfaite when both Traître and IA survive', () => {
    const room = makeRoom();
    room.rounds = [];
    room.finalVotes = new Map([
      ['CIVIL1', makeFinalVote('CIVIL1', 'CIVIL2', 'CIVIL3')], // both wrong
    ]);
    const scores = computeScores(room);
    expect(scores.get('TRAITRE')!.traitorSurvivalPts).toBe(100);
    expect(scores.get('TRAITRE')!.coveragePts).toBe(50);
  });

  // Rule 11: No coverage parfaite if IA is found
  it('no coverage parfaite if IA is correctly identified', () => {
    const room = makeRoom();
    room.rounds = [];
    room.finalVotes = new Map([
      ['CIVIL1', makeFinalVote('CIVIL1', 'ai', 'CIVIL3')], // robot correct, ninja wrong
    ]);
    const scores = computeScores(room);
    expect(scores.get('TRAITRE')!.traitorSurvivalPts).toBe(100); // still not found
    expect(scores.get('TRAITRE')!.coveragePts).toBe(0); // IA was found
  });

  // Rule 12: AI has no ScoreBreakdown
  it('IA player (socketId=ai) has no entry in scores', () => {
    const room = makeRoom();
    room.rounds = [];
    room.finalVotes = new Map();
    const scores = computeScores(room);
    expect(scores.has('ai')).toBe(false);
  });

  // Rule 13: self-vote is ignored silently (defense in depth)
  it('self-vote (voterPlayerId === robotTargetId) is ignored, does not crash', () => {
    const room = makeRoom();
    room.rounds = [];
    room.finalVotes = new Map([
      ['CIVIL1', makeFinalVote('CIVIL1', 'CIVIL1', 'CIVIL2')], // voting for yourself
    ]);
    expect(() => computeScores(room)).not.toThrow();
    const scores = computeScores(room);
    // self-vote gives 0 pts for robot (not real IA), no crash
    expect(scores.get('CIVIL1')!.finalVoteRobot).toBe(false);
  });

  // Rule 14: Score total = sum of all applicable rules
  it('total equals sum of all point categories', () => {
    const room = makeRoom();
    room.rounds = [
      makeRound(1, [
        { voterPlayerId: 'CIVIL1', targetPlayerId: 'ai', type: 'robot' },      // +10
        { voterPlayerId: 'CIVIL1', targetPlayerId: 'TRAITRE', type: 'ninja' }, // +15
      ]),
    ];
    room.finalVotes = new Map([
      ['CIVIL1', makeFinalVote('CIVIL1', 'ai', 'TRAITRE')], // +50 +75 +50 doubleTrouvaille
    ]);
    const scores = computeScores(room);
    const b = scores.get('CIVIL1')!;
    const expectedTotal = b.robotSuspicionPts + b.ninjaSuspicionPts + b.finalVotePts + b.doubleTrouvaillePts;
    expect(b.total).toBe(expectedTotal);
    expect(b.total).toBe(10 + 15 + 50 + 75 + 50); // 200
  });
});
