import { Room, Player } from '../types';
import { pickTwoCodenames, CODENAMES } from './codenames';

const AI_PSEUDOS = [
  'Alex', 'Jordan', 'Morgan', 'Taylor', 'Casey', 'Riley',
  'Jamie', 'Avery', 'Quinn', 'Reese', 'Blake', 'Sage',
];

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Mutates room: assigns roles (civil/traitre/ia), codenames, and adds AI player.
 * Requires at least 4 human players.
 */
export function assignRoles(room: Room): void {
  const humans = Array.from(room.players.values()).filter((p) => !p.isAI);
  if (humans.length < 4) throw new Error('Il faut au moins 4 joueurs humains');

  // Pick two distinct codenames: [iaCodename, traitreCodename]
  const [iaCodename, traitreCodename] = pickTwoCodenames();

  // Shuffle humans and pick one as Traître
  const shuffled = [...humans].sort(() => Math.random() - 0.5);
  const traitre = shuffled[0];

  // Assign roles
  for (const player of room.players.values()) {
    if (player.socketId === traitre.socketId) {
      player.role = 'traitre';
      player.codename = traitreCodename;
    } else {
      player.role = 'civil';
      player.codename = null;
    }
  }

  // Add AI player — pick a pseudo not already in use
  const usedPseudos = new Set(Array.from(room.players.values()).map((p) => p.pseudo));
  const aiPseudo = AI_PSEUDOS.find((p) => !usedPseudos.has(p)) ?? 'Unit';

  const aiPlayer: Player = {
    socketId: 'ai',
    pseudo: aiPseudo,
    role: 'ia',
    codename: iaCodename,
    isHost: false,
    isAI: true,
    connected: true,
    totalScore: 0,
  };
  room.players.set('ai', aiPlayer);
}
