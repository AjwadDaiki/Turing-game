'use client';
import { Socket } from 'socket.io-client';
import { GameState } from '@/hooks/useGameState';
import DeskDecor from './DeskDecor';
import LobbyPhase from './phases/LobbyPhase';
import IntroPhase from './phases/IntroPhase';
import EpreuvePhase from './phases/EpreuvePhase';
import DefilementPhase from './phases/DefilementPhase';
import RecapPhase from './phases/RecapPhase';
import VotePhase from './phases/VotePhase';
import RevealPhase from './phases/RevealPhase';

interface Props {
  socket: Socket;
  gameState: GameState;
}

export default function GameOrchestrator({ socket, gameState }: Props) {
  const { currentPhase, error } = gameState;

  return (
    <>
      <DeskDecor />
      {error && (
        <div
          className="fixed top-0 inset-x-0 z-50 text-sm text-center py-2 px-4 font-stamp uppercase tracking-widest"
          style={{ background: "var(--stamp-red)", color: "var(--paper-cream)" }}
        >
          {error}
        </div>
      )}
      {currentPhase === 'lobby'      && <LobbyPhase      socket={socket} gameState={gameState} />}
      {currentPhase === 'intro'      && <IntroPhase      gameState={gameState} />}
      {currentPhase === 'epreuve'    && <EpreuvePhase    socket={socket} gameState={gameState} />}
      {currentPhase === 'defilement' && <DefilementPhase socket={socket} gameState={gameState} />}
      {currentPhase === 'recap'      && <RecapPhase      gameState={gameState} />}
      {currentPhase === 'vote'       && <VotePhase       socket={socket} gameState={gameState} />}
      {currentPhase === 'reveal'     && <RevealPhase     gameState={gameState} />}
    </>
  );
}
