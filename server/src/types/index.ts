export type RoomStatus = 'lobby' | 'playing' | 'finished';

export type GamePhase =
  | 'lobby'
  | 'intro'
  | 'epreuve'
  | 'defilement'
  | 'recap'
  | 'vote'
  | 'reveal';

export interface Player {
  socketId: string;
  pseudo: string;
  role: 'civil' | 'traitre' | 'ia';
  traitreCodename: string | null;
  isHost: boolean;
  isAI: boolean;
  connected: boolean;
  totalScore: number;
}

export interface Room {
  code: string;
  hostSocketId: string;
  status: RoomStatus;
  currentRound: number;
  currentPhase: GamePhase;
  players: Map<string, Player>;
  rounds: any[]; // populated in Phase 2
  finalVotes: Map<string, any>;
  createdAt: number;
  lastActivityAt: number;
}

// What clients receive — never includes role, traitreCodename, isAI
export interface SanitizedPlayer {
  socketId: string;
  pseudo: string;
  isHost: boolean;
  connected: boolean;
}

export interface SanitizedRoom {
  code: string;
  status: RoomStatus;
  currentRound: number;
  currentPhase: GamePhase;
  players: SanitizedPlayer[];
  hostSocketId: string;
}
