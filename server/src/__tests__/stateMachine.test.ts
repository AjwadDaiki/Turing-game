import { transition } from '../game/stateMachine';
import { createRoom, joinRoom } from '../rooms/roomManager';
import { Room } from '../types';

function makePlayingRoom(round = 1): Room {
  const room = createRoom('S1', 'Alice', new Set());
  room.currentRound = round;
  return room;
}

// ─── Valid transitions ────────────────────────────────────────────────────────

describe('valid transitions', () => {
  it('lobby → intro sets currentPhase=intro AND status=playing', () => {
    const room = makePlayingRoom();
    room.status = 'lobby';
    room.currentPhase = 'lobby';
    transition(room, 'intro');
    expect(room.currentPhase).toBe('intro');
    expect(room.status).toBe('playing');
  });

  it('lobby → intro blocks new joinRoom (status becomes playing)', () => {
    const room = makePlayingRoom();
    joinRoom(room, 'S2', 'Bob');
    joinRoom(room, 'S3', 'Carol');
    joinRoom(room, 'S4', 'Dave');
    room.currentPhase = 'lobby';
    room.status = 'lobby';
    transition(room, 'intro');
    // joinRoom checks status !== 'lobby' → should throw
    expect(() => joinRoom(room, 'S5', 'Eve')).toThrow('Room is not in lobby');
  });

  it('intro → epreuve', () => {
    const room = makePlayingRoom();
    room.status = 'playing';
    room.currentPhase = 'intro';
    transition(room, 'epreuve');
    expect(room.currentPhase).toBe('epreuve');
  });

  it('epreuve → defilement', () => {
    const room = makePlayingRoom();
    room.status = 'playing';
    room.currentPhase = 'epreuve';
    transition(room, 'defilement');
    expect(room.currentPhase).toBe('defilement');
  });

  it('defilement → epreuve on round 1 increments currentRound', () => {
    const room = makePlayingRoom(1);
    room.status = 'playing';
    room.currentPhase = 'defilement';
    transition(room, 'epreuve');
    expect(room.currentPhase).toBe('epreuve');
    expect(room.currentRound).toBe(2);
  });

  it('defilement → epreuve on round 4 increments currentRound to 5', () => {
    const room = makePlayingRoom(4);
    room.status = 'playing';
    room.currentPhase = 'defilement';
    transition(room, 'epreuve');
    expect(room.currentRound).toBe(5);
  });

  it('defilement → recap on round 5', () => {
    const room = makePlayingRoom(5);
    room.status = 'playing';
    room.currentPhase = 'defilement';
    transition(room, 'recap');
    expect(room.currentPhase).toBe('recap');
  });

  it('recap → vote', () => {
    const room = makePlayingRoom();
    room.status = 'playing';
    room.currentPhase = 'recap';
    transition(room, 'vote');
    expect(room.currentPhase).toBe('vote');
  });

  it('vote → reveal', () => {
    const room = makePlayingRoom();
    room.status = 'playing';
    room.currentPhase = 'vote';
    transition(room, 'reveal');
    expect(room.currentPhase).toBe('reveal');
  });

  it('reveal → finished sets status=finished', () => {
    const room = makePlayingRoom();
    room.status = 'playing';
    room.currentPhase = 'reveal';
    transition(room, 'finished' as any);
    expect(room.status).toBe('finished');
  });
});

// ─── Invalid transitions ──────────────────────────────────────────────────────

describe('invalid transitions', () => {
  it('lobby → vote throws', () => {
    const room = makePlayingRoom();
    room.currentPhase = 'lobby';
    expect(() => transition(room, 'vote')).toThrow();
  });

  it('epreuve → vote throws', () => {
    const room = makePlayingRoom();
    room.status = 'playing';
    room.currentPhase = 'epreuve';
    expect(() => transition(room, 'vote')).toThrow();
  });

  it('defilement → lobby throws', () => {
    const room = makePlayingRoom();
    room.status = 'playing';
    room.currentPhase = 'defilement';
    expect(() => transition(room, 'lobby')).toThrow();
  });

  it('finished → intro throws', () => {
    const room = makePlayingRoom();
    room.status = 'finished';
    room.currentPhase = 'reveal';
    expect(() => transition(room, 'intro')).toThrow();
  });

  it('lobby → finished throws', () => {
    const room = makePlayingRoom();
    room.currentPhase = 'lobby';
    expect(() => transition(room, 'finished' as any)).toThrow();
  });
});

// ─── Edge cases ───────────────────────────────────────────────────────────────

describe('edge cases', () => {
  it('defilement → epreuve on round 5 throws (must go to recap)', () => {
    const room = makePlayingRoom(5);
    room.status = 'playing';
    room.currentPhase = 'defilement';
    expect(() => transition(room, 'epreuve')).toThrow();
  });

  it('defilement → recap on round < 5 throws (too early)', () => {
    const room = makePlayingRoom(3);
    room.status = 'playing';
    room.currentPhase = 'defilement';
    expect(() => transition(room, 'recap')).toThrow();
  });
});
