import cors from "cors";
import express from "express";
import { createServer } from "node:http";
import { type ClientToServerEvents, type ServerToClientEvents } from "@dem-niem-tin/shared";
import { Server } from "socket.io";
import { env } from "./config/env.js";
import { connectDatabase } from "./database/connect.js";
import { registerSocketHandlers } from "./socket/registerSocketHandlers.js";
import type { SocketIdentity } from "./socket/registerLobbyHandlers.js";

const app = express();
const httpServer = createServer(app);
const allowedOrigins = env.CLIENT_ORIGIN.split(",").map((origin: string) => origin.trim());

app.use(cors({ origin: allowedOrigins }));
app.use(express.json());

app.get("/api/health", (_request, response) => {
  response.json({ status: "ok", service: "dem-niem-tin-server" });
});

const io = new Server<
  ClientToServerEvents,
  ServerToClientEvents,
  Record<string, never>,
  SocketIdentity
>(httpServer, {
  cors: { origin: allowedOrigins, methods: ["GET", "POST"] },
});

registerSocketHandlers(io);

httpServer.listen(env.PORT, "0.0.0.0", () => {
  console.log(`Server listening on http://0.0.0.0:${env.PORT}`);
  void connectDatabase(env.MONGODB_URI, env.MONGODB_DB_NAME);
});
