import { assignRoles } from '../game/roleMachine';
import { createRoom, joinRoom } from '../rooms/roomManager';
import { Room } from '../types';

function makeRoom(humanCount: number): Room {
  const room = createRoom('SOCK1', 'Player1', new Set());
  for (let i = 2; i <= humanCount; i++) {
    joinRoom(room, `SOCK${i}`, `Player${i}`);
  }
  return room;
}

describe('assignRoles', () => {
  it('exactly 1 player has role traitre', () => {
    const room = makeRoom(4);
    assignRoles(room);
    const traitres = Array.from(room.players.values()).filter((p) => p.role === 'traitre');
    expect(traitres).toHaveLength(1);
  });

  it('all non-AI humans except Traître have role civil', () => {
    const room = makeRoom(4);
    assignRoles(room);
    const humans = Array.from(room.players.values()).filter((p) => !p.isAI);
    const civils = humans.filter((p) => p.role === 'civil');
    expect(civils).toHaveLength(3); // 4 humans - 1 traitre = 3 civils
  });

  it('exactly 1 player is AI (isAI=true, role=ia, socketId=ai)', () => {
    const room = makeRoom(4);
    assignRoles(room);
    const aiPlayers = Array.from(room.players.values()).filter((p) => p.isAI);
    expect(aiPlayers).toHaveLength(1);
    expect(aiPlayers[0].role).toBe('ia');
    expect(aiPlayers[0].socketId).toBe('ai');
    expect(room.players.has('ai')).toBe(true);
  });

  it('Traître has a non-null codename', () => {
    const room = makeRoom(4);
    assignRoles(room);
    const traitre = Array.from(room.players.values()).find((p) => p.role === 'traitre')!;
    expect(traitre.codename).not.toBeNull();
    expect(typeof traitre.codename).toBe('string');
  });

  it('IA has a non-null codename', () => {
    const room = makeRoom(4);
    assignRoles(room);
    const ia = room.players.get('ai')!;
    expect(ia.codename).not.toBeNull();
    expect(typeof ia.codename).toBe('string');
  });

  it('IA codename and Traître codename are different', () => {
    const room = makeRoom(4);
    assignRoles(room);
    const ia = room.players.get('ai')!;
    const traitre = Array.from(room.players.values()).find((p) => p.role === 'traitre')!;
    expect(ia.codename).not.toBe(traitre.codename);
  });

  it('codenames are always distinct across 50 calls', () => {
    for (let i = 0; i < 50; i++) {
      const room = makeRoom(4);
      assignRoles(room);
      const ia = room.players.get('ai')!;
      const traitre = Array.from(room.players.values()).find((p) => p.role === 'traitre')!;
      expect(ia.codename).not.toBe(traitre.codename);
    }
  });

  it('throws if fewer than 4 humans', () => {
    const room = makeRoom(3);
    expect(() => assignRoles(room)).toThrow();
  });

  it('Traître is randomly assigned (not always the same player) across 20 calls', () => {
    const traitorIds = new Set<string>();
    for (let i = 0; i < 20; i++) {
      const room = makeRoom(4);
      assignRoles(room);
      const traitre = Array.from(room.players.values()).find((p) => p.role === 'traitre')!;
      traitorIds.add(traitre.socketId);
    }
    expect(traitorIds.size).toBeGreaterThan(1);
  });

  it('AI player has connected=true and isHost=false', () => {
    const room = makeRoom(4);
    assignRoles(room);
    const ia = room.players.get('ai')!;
    expect(ia.connected).toBe(true);
    expect(ia.isHost).toBe(false);
  });

  it('civil players have codename=null', () => {
    const room = makeRoom(4);
    assignRoles(room);
    const civils = Array.from(room.players.values()).filter((p) => p.role === 'civil');
    civils.forEach((p) => expect(p.codename).toBeNull());
  });
});
