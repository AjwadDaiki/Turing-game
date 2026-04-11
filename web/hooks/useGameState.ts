'use client';
import { useEffect, useState } from 'react';
import { Socket } from 'socket.io-client';
import {
  SanitizedRoom,
  EpreuveInfo,
  RevealedAnswer,
  RevealData,
  ScoreBreakdown,
  GamePhase,
} from '@/lib/clientTypes';

export interface GameState {
  room: SanitizedRoom | null;
  mySocketId: string | null;
  role: 'civil' | 'traitre' | null;
  codename: string | null;
  currentPhase: GamePhase;
  epreuveInfo: EpreuveInfo | null;
  epreuveInfoByRound: Record<number, EpreuveInfo>;
  answeredPlayerIds: Set<string>;
  revealedAnswers: RevealedAnswer[];
  votedPlayerIds: Set<string>;
  scores: Record<string, ScoreBreakdown> | null;
  revealData: RevealData | null;
  error: string | null;
}

const initialState: GameState = {
  room: null,
  mySocketId: null,
  role: null,
  codename: null,
  currentPhase: 'lobby',
  epreuveInfo: null,
  epreuveInfoByRound: {},
  answeredPlayerIds: new Set(),
  revealedAnswers: [],
  votedPlayerIds: new Set(),
  scores: null,
  revealData: null,
  error: null,
};

export function useGameState(socket: Socket): GameState {
  const [state, setState] = useState<GameState>({
    ...initialState,
    mySocketId: socket.connected ? (socket.id ?? null) : null,
  });

  useEffect(() => {
    function onConnect() {
      setState((prev) => ({ ...prev, mySocketId: socket.id ?? null }));
    }

    function onRoomState(room: SanitizedRoom) {
      setState((prev) => ({ ...prev, room, currentPhase: room.currentPhase }));
    }

    function onPhaseChanged({ phase }: { phase: GamePhase }) {
      setState((prev) => ({
        ...prev,
        currentPhase: phase,
        ...(phase === 'epreuve' ? { answeredPlayerIds: new Set(), revealedAnswers: [] } : {}),
        ...(phase === 'vote' ? { votedPlayerIds: new Set() } : {}),
      }));
    }

    function onRoleAssigned({ role, codename }: { role: 'civil' | 'traitre'; codename?: string }) {
      setState((prev) => ({ ...prev, role, codename: codename ?? null }));
    }

    function onEpreuveStarted(info: EpreuveInfo) {
      setState((prev) => ({
        ...prev,
        epreuveInfo: info,
        epreuveInfoByRound: { ...prev.epreuveInfoByRound, [info.roundNumber]: info },
      }));
    }

    function onPlayerAnswered({ playerId }: { playerId: string }) {
      setState((prev) => ({
        ...prev,
        answeredPlayerIds: new Set(Array.from(prev.answeredPlayerIds).concat(playerId)),
      }));
    }

    function onDefilementReveal(answer: RevealedAnswer) {
      setState((prev) => ({
        ...prev,
        revealedAnswers: [...prev.revealedAnswers, answer],
      }));
    }

    function onPlayerVoted({ playerId }: { playerId: string }) {
      setState((prev) => ({
        ...prev,
        votedPlayerIds: new Set(Array.from(prev.votedPlayerIds).concat(playerId)),
      }));
    }

    function onScoresFinal({
      scores,
      reveal,
    }: {
      scores: Record<string, ScoreBreakdown>;
      reveal: RevealData;
    }) {
      setState((prev) => ({ ...prev, scores, revealData: reveal }));
    }

    function onError({ message }: { message: string }) {
      setState((prev) => ({ ...prev, error: message }));
    }

    socket.on('connect', onConnect);
    socket.on('room:state', onRoomState);
    socket.on('phase:changed', onPhaseChanged);
    socket.on('role:assigned', onRoleAssigned);
    socket.on('epreuve:started', onEpreuveStarted);
    socket.on('player:answered', onPlayerAnswered);
    socket.on('defilement:reveal', onDefilementReveal);
    socket.on('player:voted', onPlayerVoted);
    socket.on('scores:final', onScoresFinal);
    socket.on('error', onError);

    return () => {
      socket.off('connect', onConnect);
      socket.off('room:state', onRoomState);
      socket.off('phase:changed', onPhaseChanged);
      socket.off('role:assigned', onRoleAssigned);
      socket.off('epreuve:started', onEpreuveStarted);
      socket.off('player:answered', onPlayerAnswered);
      socket.off('defilement:reveal', onDefilementReveal);
      socket.off('player:voted', onPlayerVoted);
      socket.off('scores:final', onScoresFinal);
      socket.off('error', onError);
    };
  }, [socket]);

  return state;
}
