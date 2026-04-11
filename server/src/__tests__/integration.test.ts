import { createServer } from 'http';
import { Server } from 'socket.io';
import { io as Client, Socket as ClientSocket } from 'socket.io-client';
import { Room } from '../types';
import { registerRoomHandlers } from '../socket/roomHandlers';

const PORT = 3099;
let httpServer: ReturnType<typeof createServer>;
let ioServer: Server;
let rooms: Map<string, Room>;

beforeAll((done) => {
  rooms = new Map();
  httpServer = createServer();
  ioServer = new Server(httpServer);
  ioServer.on('connection', (socket) => registerRoomHandlers(ioServer, socket, rooms));
  httpServer.listen(PORT, done);
});

afterAll((done) => {
  ioServer.close();
  httpServer.close(done);
});

function makeClient(): ClientSocket {
  return Client(`http://localhost:${PORT}`, { forceNew: true });
}

// ─── room:create ─────────────────────────────────────────────────────────────

describe('room:create', () => {
  it('emits room:created with a 6-char alphanumeric code', (done) => {
    const client = makeClient();
    client.once('room:created', ({ code }: { code: string }) => {
      expect(code).toMatch(/^[A-Z0-9]{6}$/);
      client.disconnect();
      done();
    });
    client.emit('room:create', { pseudo: 'Alice' });
  });

  it('emits room:state with 1 player in lobby after creation', (done) => {
    const client = makeClient();
    client.once('room:state', (state: any) => {
      expect(state.players).toHaveLength(1);
      expect(state.status).toBe('lobby');
      expect(state.players[0].pseudo).toBe('Alice');
      client.disconnect();
      done();
    });
    client.emit('room:create', { pseudo: 'Alice' });
  });

  it('rejects empty pseudo with error event', (done) => {
    const client = makeClient();
    client.once('error', ({ message }: { message: string }) => {
      expect(message).toBeTruthy();
      client.disconnect();
      done();
    });
    client.emit('room:create', { pseudo: '   ' });
  });
});

// ─── room:join ───────────────────────────────────────────────────────────────

describe('room:join', () => {
  it('second player receives room:state with 2 players', (done) => {
    const alice = makeClient();
    alice.once('room:created', ({ code }: { code: string }) => {
      const bob = makeClient();
      let joined = false;
      alice.on('room:state', (state: any) => {
        if (!joined && state.players.length === 2) {
          joined = true;
          expect(state.players.map((p: any) => p.pseudo)).toContain('Bob');
          alice.disconnect();
          bob.disconnect();
          done();
        }
      });
      bob.emit('room:join', { code, pseudo: 'Bob' });
    });
    alice.emit('room:create', { pseudo: 'Alice' });
  });

  it('emits error for unknown room code', (done) => {
    const client = makeClient();
    client.once('error', ({ message }: { message: string }) => {
      expect(message).toBe('Room introuvable');
      client.disconnect();
      done();
    });
    client.emit('room:join', { code: 'XXXXXX', pseudo: 'Bob' });
  });

  it('emits error for malformed room code', (done) => {
    const client = makeClient();
    client.once('error', ({ message }: { message: string }) => {
      expect(message).toBe('Code de room invalide');
      client.disconnect();
      done();
    });
    // "abc" is only 3 chars and lowercase — fails /^[A-Z0-9]{6}$/
    client.emit('room:join', { code: 'abc', pseudo: 'Bob' });
  });
});

// ─── disconnect ──────────────────────────────────────────────────────────────

describe('disconnect', () => {
  it('marks disconnected player as connected:false in room:state', (done) => {
    const alice = makeClient();
    alice.once('room:created', ({ code }: { code: string }) => {
      const bob = makeClient();

      // Register BEFORE join: filter states until Bob appears as disconnected
      alice.on('room:state', (updated: any) => {
        const bobEntry = updated.players.find((p: any) => p.pseudo === 'Bob');
        if (bobEntry && !bobEntry.connected) {
          alice.removeAllListeners('room:state');
          alice.disconnect();
          done();
        }
      });

      bob.emit('room:join', { code, pseudo: 'Bob' });
      bob.once('room:joined', () => bob.disconnect());
    });
    alice.emit('room:create', { pseudo: 'Alice' });
  });

  it('transfers host to next player when host disconnects', (done) => {
    const alice = makeClient();
    alice.once('room:created', ({ code }: { code: string }) => {
      const bob = makeClient();

      // Register BEFORE join: filter states until Bob is host
      bob.on('room:state', (updated: any) => {
        if (updated.hostSocketId === bob.id) {
          bob.removeAllListeners('room:state');
          bob.disconnect();
          done();
        }
      });

      bob.emit('room:join', { code, pseudo: 'Bob' });
      bob.once('room:joined', () => alice.disconnect());
    });
    alice.emit('room:create', { pseudo: 'Alice' });
  });
});
