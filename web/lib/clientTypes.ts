export type GamePhase =
  | 'lobby'
  | 'intro'
  | 'epreuve'
  | 'defilement'
  | 'recap'
  | 'vote'
  | 'reveal';

export type EpreuveInputType =
  | 'text'
  | 'emoji'
  | 'color'
  | 'swipe'
  | 'draw'
  | 'slider'
  | 'number'
  | 'list';

export interface SanitizedPlayer {
  socketId: string;
  pseudo: string;
  isHost: boolean;
  connected: boolean;
}

export interface SanitizedRoom {
  code: string;
  status: string;
  currentRound: number;
  currentPhase: GamePhase;
  players: SanitizedPlayer[];
  hostSocketId: string;
}

export interface EpreuveInfo {
  epreuveId: string;
  prompt: string;
  inputType: EpreuveInputType;
  timeLimit: number;
  roundNumber: number;
}

// draw types
export type Point = { x: number; y: number };
export type Stroke = Point[];
export type Drawing = Stroke[];

// swipe content (sent on submit)
export interface SwipeContent {
  votes: string;   // e.g. "L D L D L L"
  images: string[]; // 6 picsum URLs
}

export interface RevealedAnswer {
  playerId: string;
  pseudo: string | undefined;
  content: any;
  roundNumber: number;
  position: number;
  total: number;
}

export interface ScoreBreakdown {
  robotSuspicionCount: number;
  ninjaSuspicionCount: number;
  robotSuspicionPts: number;
  ninjaSuspicionPts: number;
  finalVoteRobot: boolean;
  finalVoteNinja: boolean;
  finalVotePts: number;
  doubleTrouvaille: boolean;
  doubleTrouvaillePts: number;
  traitorSurvivalPts: number;
  coveragePts: number;
  confusionPts: number;
  total: number;
}

export interface RevealData {
  traitorSocketId: string;
  traitorPseudo: string;
  traitorCodename: string;
  iaSocketId: string;
  iaPseudo: string;
  iaCodename: string;
}
