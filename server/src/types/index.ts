export type RoomStatus = 'lobby' | 'playing' | 'finished';

export type GamePhase =
  | 'lobby'
  | 'intro'
  | 'epreuve'
  | 'defilement'
  | 'recap'
  | 'vote'
  | 'reveal';

export type EpreuveFamily = 'verbale' | 'visuelle' | 'dessin' | 'numerique' | 'chaotique';
export type EpreuveInputType = 'text' | 'emoji' | 'color' | 'swipe' | 'draw' | 'slider' | 'number' | 'list';

export interface Epreuve {
  id: string;
  family: EpreuveFamily;
  inputType: EpreuveInputType;
  basePrompt: string;       // may contain [X]
  promptBanque: string[];   // values to fill [X]
  timeLimit: number;        // seconds
}

export interface Round {
  roundNumber: number;
  epreuve: Epreuve;
  resolvedPrompt: string;   // basePrompt with [X] resolved
  answers: Map<string, Answer>;
  suspicions: Suspicion[];
  revealOrder: string[];    // shuffled playerIds for défilement
  revealIndex: number;      // cursor into revealOrder
}

export interface Answer {
  playerId: string;
  content: any;
  submittedAt: number;
}

export interface Suspicion {
  voterPlayerId: string;
  targetPlayerId: string;
  type: 'robot' | 'ninja';
}

export interface FinalVote {
  voterPlayerId: string;
  robotTargetId: string;
  ninjaTargetId: string;
}

export interface ScoreBreakdown {
  robotSuspicionCount: number;
  ninjaSuspicionCount: number;
  robotSuspicionPts: number;    // ×10
  ninjaSuspicionPts: number;    // ×15
  finalVoteRobot: boolean;
  finalVoteNinja: boolean;
  finalVotePts: number;         // +50 IA + +75 Traître
  doubleTrouvaille: boolean;
  doubleTrouvaillePts: number;  // +50 bonus
  traitorSurvivalPts: number;   // +100 if Traître not found
  coveragePts: number;          // +50 extra if IA also not found
  confusionPts: number;         // +5 per robot click on Traître answer
  total: number;
}

export interface Player {
  socketId: string;
  pseudo: string;
  role: 'civil' | 'traitre' | 'ia';
  codename: string | null;  // assigned to Traître + IA, null for civils
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
  rounds: Round[];
  finalVotes: Map<string, FinalVote>;
  createdAt: number;
  lastActivityAt: number;
}

// What clients receive — never includes role, codename, isAI
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
