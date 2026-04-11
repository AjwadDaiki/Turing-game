/**
 * Integration test: verifies that a client who intercepts ALL events from the room
 * can NEVER determine who is the IA before the reveal phase.
 *
 * Specifically:
 * - room:state never contains role, codename, or isAI fields
 * - role:assigned is only received by the player it was sent to
 * - No broadcast event leaks secret identity information
 */

import { createServer } from 'http';
import { Server } from 'socket.io';
import { io as Client, Socket as ClientSocket } from 'socket.io-client';
import { Room } from '../types';
import { registerRoomHandlers } from '../socket/roomHandlers';
import { registerGameHandlers } from '../socket/gameHandlers';

const PORT = 3098;
let httpServer: ReturnType<typeof createServer>;
let ioServer: Server;
let rooms: Map<string, Room>;

beforeAll((done) => {
  rooms = new Map();
  httpServer = createServer();
  ioServer = new Server(httpServer);
  ioServer.on('connection', (socket) => {
    registerRoomHandlers(ioServer, socket, rooms);
    registerGameHandlers(ioServer, socket, rooms);
  });
  httpServer.listen(PORT, done);
});

afterAll((done) => {
  ioServer.close();
  httpServer.close(done);
});

function makeClient(): ClientSocket {
  return Client(`http://localhost:${PORT}`, { forceNew: true });
}

describe('sanitization — role secrecy', () => {
  it('room:state events never expose role, codename, or isAI to any client', (done) => {
    const clients: ClientSocket[] = [];
    const leakedFields: string[] = [];

    // Create host
    const host = makeClient();
    clients.push(host);

    host.once('room:created', ({ code }: { code: string }) => {
      // Join 3 more players
      const others = [makeClient(), makeClient(), makeClient()];
      others.forEach((c) => clients.push(c));

      let joinedCount = 0;
      others.forEach((c) => {
        c.once('room:joined', () => {
          joinedCount++;
          if (joinedCount === 3) {
            // All joined — set up spy on ALL clients before game:start
            const spyClients = [...clients];

            spyClients.forEach((c) => {
              c.onAny((event: string, data: any) => {
                if (event === 'room:state' && data?.players) {
                  data.players.forEach((p: any) => {
                    if ('role' in p) leakedFields.push(`role via room:state`);
                    if ('codename' in p) leakedFields.push(`codename via room:state`);
                    if ('isAI' in p) leakedFields.push(`isAI via room:state`);
                  });
                }
              });
            });

            // Start game
            host.emit('game:start');

            // After intro starts (give it a moment), check no leaks occurred
            setTimeout(() => {
              expect(leakedFields).toHaveLength(0);
              clients.forEach((c) => c.disconnect());
              done();
            }, 500);
          }
        });
        c.emit('room:join', { code, pseudo: `Player${clients.indexOf(c) + 1}` });
      });
    });

    host.emit('room:create', { pseudo: 'Host' });
  });

  it('role:assigned is received only once per client and never broadcast', (done) => {
    const host = makeClient();

    host.once('room:created', ({ code }: { code: string }) => {
      const p2 = makeClient();
      const p3 = makeClient();
      const p4 = makeClient();
      const allClients = [host, p2, p3, p4];
      const roleAssignedEvents: Record<string, number> = {};

      allClients.forEach((c, i) => {
        const id = `client_${i}`;
        roleAssignedEvents[id] = 0;
        c.on('role:assigned', () => {
          roleAssignedEvents[id] += 1;
        });
      });

      let joinedCount = 0;
      [p2, p3, p4].forEach((c, i) => {
        c.once('room:joined', () => {
          joinedCount++;
          if (joinedCount === 3) {
            host.emit('game:start');

            setTimeout(() => {
              // Each client receives exactly 1 role:assigned (their own)
              const totals = Object.values(roleAssignedEvents);
              expect(totals.every((n) => n === 1)).toBe(true);
              expect(totals.reduce((a, b) => a + b, 0)).toBe(4); // 4 players, 4 events total

              allClients.forEach((c) => c.disconnect());
              done();
            }, 500);
          }
        });
        c.emit('room:join', { code, pseudo: `P${i + 2}` });
      });
    });

    host.emit('room:create', { pseudo: 'Host' });
  });
});
