import { Server, Socket } from 'socket.io';
import { Room } from '../types';
import {
  createRoom,
  joinRoom,
  leaveRoom,
  getRoomByPlayerId,
  sanitizeRoom,
} from '../rooms/roomManager';

// ─── Input validation ────────────────────────────────────────────────────────

function validatePseudo(pseudo: unknown): string {
  if (typeof pseudo !== 'string') throw new Error('Pseudo invalide');
  // Strip HTML tags, trim, cap at 24 chars
  const clean = pseudo.trim().replace(/<[^>]*>/g, '').slice(0, 24);
  if (!clean) throw new Error('Pseudo vide');
  return clean;
}

function validateCode(code: unknown): string {
  if (typeof code !== 'string' || !/^[A-Z0-9]{6}$/.test(code))
    throw new Error('Code de room invalide');
  return code;
}

// ─── Handler registration ────────────────────────────────────────────────────

export function registerRoomHandlers(
  io: Server,
  socket: Socket,
  rooms: Map<string, Room>
): void {

  // room:create
  socket.on('room:create', ({ pseudo }: { pseudo: unknown }) => {
    try {
      const safePseudo = validatePseudo(pseudo);
      const existingCodes = new Set(rooms.keys());
      const room = createRoom(socket.id, safePseudo, existingCodes);
      rooms.set(room.code, room);
      socket.join(room.code);
      socket.emit('room:created', { code: room.code });
      io.to(room.code).emit('room:state', sanitizeRoom(room));
      console.log(`[room] ${safePseudo} created room ${room.code}`);
    } catch (err: any) {
      socket.emit('error', { message: err.message });
    }
  });

  // room:join
  socket.on('room:join', ({ code, pseudo }: { code: unknown; pseudo: unknown }) => {
    try {
      const safeCode   = validateCode(code);
      const safePseudo = validatePseudo(pseudo);
      const room = rooms.get(safeCode);
      if (!room) throw new Error('Room introuvable');
      joinRoom(room, socket.id, safePseudo);
      socket.join(safeCode);
      socket.emit('room:joined', { code: safeCode });
      io.to(safeCode).emit('room:state', sanitizeRoom(room));
      console.log(`[room] ${safePseudo} joined ${safeCode}`);
    } catch (err: any) {
      socket.emit('error', { message: err.message });
    }
  });

  // room:leave (voluntary)
  socket.on('room:leave', () => {
    const room = getRoomByPlayerId(rooms, socket.id);
    if (!room) return;
    leaveRoom(room, socket.id);
    socket.leave(room.code);
    io.to(room.code).emit('room:state', sanitizeRoom(room));
  });

  // disconnect (network drop)
  socket.on('disconnect', () => {
    const room = getRoomByPlayerId(rooms, socket.id);
    if (!room) return;
    leaveRoom(room, socket.id);
    io.to(room.code).emit('room:state', sanitizeRoom(room));
    console.log(`[room] ${socket.id} disconnected from ${room.code}`);
  });
}
