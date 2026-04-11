import { Room, Player, SanitizedRoom, SanitizedPlayer } from '../types';

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
const MAX_HUMAN_PLAYERS = 8;

// Generates a unique 6-char alphanumeric code not already in existingCodes
function generateCode(existingCodes: Set<string>): string {
  let code: string;
  do {
    code = Array.from({ length: 6 }, () =>
      CHARS[Math.floor(Math.random() * CHARS.length)]
    ).join('');
  } while (existingCodes.has(code));
  return code;
}

function uniquePseudo(room: Room, pseudo: string): string {
  const existing = Array.from(room.players.values()).map((p) => p.pseudo);
  if (!existing.includes(pseudo)) return pseudo;
  let n = 2;
  while (existing.includes(`${pseudo}_${n}`)) n++;
  return `${pseudo}_${n}`;
}

export function createRoom(
  socketId: string,
  pseudo: string,
  existingCodes: Set<string>
): Room {
  const code = generateCode(existingCodes);
  const player: Player = {
    socketId,
    pseudo,
    role: 'civil',
    traitreCodename: null,
    isHost: true,
    isAI: false,
    connected: true,
    totalScore: 0,
  };
  return {
    code,
    hostSocketId: socketId,
    status: 'lobby',
    currentRound: 0,
    currentPhase: 'lobby',
    players: new Map([[socketId, player]]),
    rounds: [],
    finalVotes: new Map(),
    createdAt: Date.now(),
    lastActivityAt: Date.now(),
  };
}

export function joinRoom(room: Room, socketId: string, rawPseudo: string): void {
  if (room.status !== 'lobby') throw new Error('Room is not in lobby');
  const humanCount = Array.from(room.players.values()).filter((p) => !p.isAI).length;
  if (humanCount >= MAX_HUMAN_PLAYERS) throw new Error('Room is full');

  const pseudo = uniquePseudo(room, rawPseudo);
  const player: Player = {
    socketId,
    pseudo,
    role: 'civil',
    traitreCodename: null,
    isHost: false,
    isAI: false,
    connected: true,
    totalScore: 0,
  };
  room.players.set(socketId, player);
  room.lastActivityAt = Date.now();
}

export function leaveRoom(room: Room, socketId: string): void {
  const player = room.players.get(socketId);
  if (!player) return;

  player.connected = false;
  room.lastActivityAt = Date.now();

  if (room.hostSocketId === socketId) {
    const next = Array.from(room.players.values()).find(
      (p) => p.connected && p.socketId !== socketId
    );
    if (next) {
      room.hostSocketId = next.socketId;
      next.isHost = true;
      player.isHost = false;
    }
  }
}

export function getRoomByPlayerId(
  rooms: Map<string, Room>,
  socketId: string
): Room | undefined {
  for (const room of rooms.values()) {
    if (room.players.has(socketId)) return room;
  }
  return undefined;
}

export function sanitizeRoom(room: Room): SanitizedRoom {
  const players: SanitizedPlayer[] = Array.from(room.players.values()).map((p) => ({
    socketId: p.socketId,
    pseudo: p.pseudo,
    isHost: p.isHost,
    connected: p.connected,
    // role, traitreCodename, isAI intentionally omitted
  }));
  return {
    code: room.code,
    status: room.status,
    currentRound: room.currentRound,
    currentPhase: room.currentPhase,
    players,
    hostSocketId: room.hostSocketId,
  };
}
