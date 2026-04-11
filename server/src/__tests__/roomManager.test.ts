import {
  createRoom,
  joinRoom,
  leaveRoom,
  getRoomByPlayerId,
  sanitizeRoom,
} from '../rooms/roomManager';
import { Room } from '../types';

// ─── generateCode uniqueness ─────────────────────────────────────────────────

describe('generateCode uniqueness', () => {
  it('never re-generates an existing code', () => {
    // Force Math.random to always produce the same characters → code = "AAAAAA"
    const spy = jest.spyOn(Math, 'random').mockReturnValue(0);

    const existing = new Set<string>(['AAAAAA']);
    // After the spy is removed the next call will be truly random,
    // but we only need to verify the loop runs more than once.
    // We'll let it succeed on the 2nd iteration by restoring Math.random
    // after 6 calls (first code attempt = "AAAAAA" which collides).
    let callCount = 0;
    spy.mockImplementation(() => {
      callCount++;
      // First 6 calls produce 'A' (index 0) → "AAAAAA" (collision)
      // From call 7 onward produce 'B' (index 1/36 ≈ 0.028)
      return callCount <= 6 ? 0 : 1 / 36;
    });

    const { createRoom: _create } = jest.requireActual('../rooms/roomManager') as typeof import('../rooms/roomManager');
    // We test the exported createRoom which internally calls generateCode
    const room = createRoom('SOCK1', 'Alice', existing);
    expect(room.code).not.toBe('AAAAAA');
    expect(room.code).toMatch(/^[A-Z0-9]{6}$/);

    spy.mockRestore();
  });
});

// ─── createRoom ──────────────────────────────────────────────────────────────

describe('createRoom', () => {
  it('generates a 6-char alphanumeric code', () => {
    const room = createRoom('SOCK1', 'Alice', new Set());
    expect(room.code).toMatch(/^[A-Z0-9]{6}$/);
  });

  it('adds the creator as host with isHost=true', () => {
    const room = createRoom('SOCK1', 'Alice', new Set());
    const host = room.players.get('SOCK1');
    expect(host?.isHost).toBe(true);
    expect(host?.pseudo).toBe('Alice');
    expect(host?.connected).toBe(true);
  });

  it('sets status to lobby and phase to lobby', () => {
    const room = createRoom('SOCK1', 'Alice', new Set());
    expect(room.status).toBe('lobby');
    expect(room.currentPhase).toBe('lobby');
  });

  it('does not reuse a code from existingCodes', () => {
    const codes = new Set<string>();
    const r1 = createRoom('S1', 'A', codes);
    codes.add(r1.code);
    const r2 = createRoom('S2', 'B', codes);
    codes.add(r2.code);
    expect(r1.code).not.toBe(r2.code);
  });
});

// ─── joinRoom ────────────────────────────────────────────────────────────────

describe('joinRoom', () => {
  let room: Room;
  beforeEach(() => {
    room = createRoom('SOCK1', 'Alice', new Set());
  });

  it('adds a second player', () => {
    joinRoom(room, 'SOCK2', 'Bob');
    expect(room.players.size).toBe(2);
  });

  it('suffixes pseudo if duplicate', () => {
    joinRoom(room, 'SOCK2', 'Alice');
    expect(room.players.get('SOCK2')?.pseudo).toBe('Alice_2');
  });

  it('handles triple duplicate with _3 suffix', () => {
    joinRoom(room, 'SOCK2', 'Alice');
    joinRoom(room, 'SOCK3', 'Alice');
    expect(room.players.get('SOCK3')?.pseudo).toBe('Alice_3');
  });

  it('throws if room is playing', () => {
    room.status = 'playing';
    expect(() => joinRoom(room, 'SOCK2', 'Bob')).toThrow('Room is not in lobby');
  });

  it('throws if room is full (8 human players)', () => {
    // host (SOCK1) is player 1; add 7 more → total 8
    for (let i = 2; i <= 8; i++) {
      joinRoom(room, `SOCK${i}`, `P${i}`);
    }
    expect(() => joinRoom(room, 'SOCK9', 'P9')).toThrow('Room is full');
  });
});

// ─── leaveRoom ───────────────────────────────────────────────────────────────

describe('leaveRoom', () => {
  let room: Room;
  beforeEach(() => {
    room = createRoom('SOCK1', 'Alice', new Set());
    joinRoom(room, 'SOCK2', 'Bob');
  });

  it('marks player as disconnected', () => {
    leaveRoom(room, 'SOCK2');
    expect(room.players.get('SOCK2')?.connected).toBe(false);
  });

  it('transfers host when host leaves', () => {
    leaveRoom(room, 'SOCK1');
    expect(room.hostSocketId).toBe('SOCK2');
    expect(room.players.get('SOCK2')?.isHost).toBe(true);
    expect(room.players.get('SOCK1')?.isHost).toBe(false);
  });

  it('does not crash if socketId is unknown', () => {
    expect(() => leaveRoom(room, 'UNKNOWN')).not.toThrow();
  });
});

// ─── getRoomByPlayerId ────────────────────────────────────────────────────────

describe('getRoomByPlayerId', () => {
  it('finds the room containing a given socket', () => {
    const rooms = new Map<string, Room>();
    const room = createRoom('SOCK1', 'Alice', new Set());
    rooms.set(room.code, room);
    expect(getRoomByPlayerId(rooms, 'SOCK1')).toBe(room);
  });

  it('returns undefined for unknown socket', () => {
    const rooms = new Map<string, Room>();
    expect(getRoomByPlayerId(rooms, 'GHOST')).toBeUndefined();
  });
});

// ─── sanitizeRoom ─────────────────────────────────────────────────────────────

describe('sanitizeRoom', () => {
  it('never exposes role, traitreCodename or isAI', () => {
    const room = createRoom('SOCK1', 'Alice', new Set());
    const sanitized = sanitizeRoom(room);
    sanitized.players.forEach((p: any) => {
      expect(p.role).toBeUndefined();
      expect(p.traitreCodename).toBeUndefined();
      expect(p.isAI).toBeUndefined();
    });
  });

  it('exposes pseudo, isHost, connected', () => {
    const room = createRoom('SOCK1', 'Alice', new Set());
    const sanitized = sanitizeRoom(room);
    expect(sanitized.players[0].pseudo).toBe('Alice');
    expect(sanitized.players[0].isHost).toBe(true);
    expect(sanitized.players[0].connected).toBe(true);
  });
});
