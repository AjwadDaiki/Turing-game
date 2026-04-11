import "dotenv/config";
import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import { Room } from "./types";
import { registerRoomHandlers } from "./socket/roomHandlers";
import { startRoomCleaner } from "./rooms/roomCleaner";

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3001;
const CORS_ORIGIN = process.env.CORS_ORIGIN || "http://localhost:3000";

const app = express();
app.use(cors({ origin: CORS_ORIGIN }));
app.use(express.json());

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: { origin: CORS_ORIGIN, methods: ["GET", "POST"] },
});

// Global in-memory state
const rooms = new Map<string, Room>();

app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    rooms: rooms.size,
    timestamp: new Date().toISOString(),
  });
});

io.on("connection", (socket) => {
  console.log(`[socket] connected: ${socket.id}`);
  registerRoomHandlers(io, socket, rooms);
});

startRoomCleaner(rooms);

httpServer.listen(PORT, () => {
  console.log(`[server] TURING server running on port ${PORT}`);
});
