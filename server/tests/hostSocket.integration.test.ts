import type {
  ClientToServerEvents,
  ServerToClientEvents,
} from "@dem-niem-tin/shared";
import { createServer, type Server as HttpServer } from "node:http";
import mongoose from "mongoose";
import { Server as SocketServer } from "socket.io";
import { io as createClient, type Socket as ClientSocket } from "socket.io-client";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { registerSocketHandlers } from "../src/socket/registerSocketHandlers.js";

const runDatabaseTests = process.env.RUN_DB_INTEGRATION === "true";
const describeDatabase = runDatabaseTests ? describe : describe.skip;
const databaseName = `dem-niem-tin-host-socket-test-${process.pid}`;

describeDatabase("Host Socket.IO integration", () => {
  let httpServer: HttpServer;
  let ioServer: SocketServer<ClientToServerEvents, ServerToClientEvents>;
  let serverUrl: string;
  const clients: ClientSocket[] = [];

  beforeAll(async () => {
    await mongoose.connect(process.env.TEST_MONGODB_URI ?? "mongodb://127.0.0.1:27017", {
      dbName: databaseName,
    });
    httpServer = createServer();
    ioServer = new SocketServer<ClientToServerEvents, ServerToClientEvents>(httpServer);
    registerSocketHandlers(ioServer);
    await new Promise<void>((resolve) => httpServer.listen(0, "127.0.0.1", resolve));
    const address = httpServer.address();
    if (!address || typeof address === "string") throw new Error("Test server did not expose a port");
    serverUrl = `http://127.0.0.1:${address.port}`;
  });

  afterAll(async () => {
    for (const client of clients) client.disconnect();
    await new Promise<void>((resolve) => ioServer.close(() => resolve()));
    await new Promise((resolve) => setTimeout(resolve, 200));
    await mongoose.connection.db?.dropDatabase();
    await mongoose.disconnect();
  });

  async function connectClient(): Promise<ClientSocket> {
    const client = createClient(serverUrl, { transports: ["websocket"] });
    clients.push(client);
    await new Promise<void>((resolve, reject) => {
      client.once("connect", resolve);
      client.once("connect_error", reject);
    });
    return client;
  }

  function emitAck<T>(client: ClientSocket, event: string, payload: unknown): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error(`${event} acknowledgement timed out`)), 5_000);
      client.emit(event, payload, (response: T) => {
        clearTimeout(timeout);
        resolve(response);
      });
    });
  }

  it("authorizes Host commands and broadcasts only public runtime state", async () => {
    const host = await connectClient();
    const created = await emitAck<any>(host, "room:create", { hostName: "Host" });
    expect(created.ok).toBe(true);
    const hostAuth = {
      roomCode: created.data.room.roomCode,
      hostSessionToken: created.data.hostSessionToken,
    };

    const unauthorized = await emitAck<any>(host, "host:start-game", {
      ...hostAuth,
      hostSessionToken: "x".repeat(43),
    });
    expect(unauthorized).toMatchObject({ ok: false, error: { code: "UNAUTHORIZED" } });

    for (let teamNumber = 1; teamNumber <= 8; teamNumber += 1) {
      const player = await connectClient();
      const joined = await emitAck<any>(player, "room:join", {
        roomCode: hostAuth.roomCode,
        teamNumber,
      });
      expect(joined.ok).toBe(true);
      const ready = await emitAck<any>(player, "player:ready", { ready: true });
      expect(ready.ok).toBe(true);
    }

    const publicUpdates: any[] = [];
    host.on("game:public-state", (state) => publicUpdates.push(state));

    const started = await emitAck<any>(host, "host:start-game", hostAuth);
    expect(started).toMatchObject({
      ok: true,
      data: { publicState: { phase: "LOBBY", round: 0, trust: 100 } },
    });
    expect(JSON.stringify(started.data.publicState)).not.toMatch(/role|faction|sessionToken/i);

    const paused = await emitAck<any>(host, "host:pause-game", hostAuth);
    expect(paused.data.publicState.paused).toBe(true);
    const resumed = await emitAck<any>(host, "host:resume-game", hostAuth);
    expect(resumed.data.publicState.paused).toBe(false);
    const skipped = await emitAck<any>(host, "host:skip-timer", hostAuth);
    expect(skipped.data.publicState).toMatchObject({ phase: "NIGHT", round: 1 });

    const reset = await emitAck<any>(host, "host:reset-game", hostAuth);
    expect(reset).toMatchObject({ ok: true, data: { room: { status: "LOBBY" } } });
    expect(publicUpdates.length).toBeGreaterThan(0);
  });
});
