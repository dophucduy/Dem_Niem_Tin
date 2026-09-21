import cors from "cors";
import express from "express";
import { createServer } from "node:http";
import { Server } from "socket.io";
import { env } from "./config/env.js";
import { connectDatabase } from "./database/connect.js";
import { registerSocketHandlers } from "./socket/registerSocketHandlers.js";

const app = express();
const httpServer = createServer(app);
const allowedOrigins = env.CLIENT_ORIGIN.split(",").map((origin: string) => origin.trim());

app.use(cors({ origin: allowedOrigins }));
app.use(express.json());

app.get("/api/health", (_request, response) => {
  response.json({ status: "ok", service: "dem-niem-tin-server" });
});

const io = new Server(httpServer, {
  cors: { origin: allowedOrigins, methods: ["GET", "POST"] },
});

registerSocketHandlers(io);

httpServer.listen(env.PORT, "0.0.0.0", () => {
  console.log(`Server listening on http://0.0.0.0:${env.PORT}`);
  void connectDatabase(env.MONGODB_URI);
});
