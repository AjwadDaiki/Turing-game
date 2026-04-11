import { Room } from '../types';

const FINISHED_TTL = 5 * 60 * 1000;    // 5 min after finish
const IDLE_TTL     = 10 * 60 * 1000;   // 10 min of inactivity
const MAX_AGE      = 2 * 60 * 60 * 1000; // 2h hard cap

export function startRoomCleaner(rooms: Map<string, Room>): NodeJS.Timeout {
  return setInterval(() => {
    const now = Date.now();
    for (const [code, room] of rooms.entries()) {
      const allDisconnected = Array.from(room.players.values()).every((p) => !p.connected);
      const tooOld    = now - room.createdAt      > MAX_AGE;
      const idle      = now - room.lastActivityAt  > IDLE_TTL;
      const finishedExpired =
        room.status === 'finished' && now - room.lastActivityAt > FINISHED_TTL;

      if (finishedExpired || (allDisconnected && idle) || tooOld) {
        rooms.delete(code);
        console.log(`[cleaner] Room ${code} deleted`);
      }
    }
  }, 5 * 60 * 1000);
}
