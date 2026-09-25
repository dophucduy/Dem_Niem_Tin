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
import { QuestionModel } from "../src/models/index.js";

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
    await QuestionModel.create({
      category: "Test",
      difficulty: "easy",
      text: "Socket integration question?",
      options: ["A", "B", "C", "D"],
      correctAnswer: "A",
    });
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

    const players: ClientSocket[] = [];
    const joinedPlayers: any[] = [];
    const privateStatePromises: Promise<any>[] = [];
    let hostReceivedPrivateState = false;
    host.on("game:private-state", () => { hostReceivedPrivateState = true; });
    for (let teamNumber = 1; teamNumber <= 8; teamNumber += 1) {
      const player = await connectClient();
      players.push(player);
      const joined = await emitAck<any>(player, "room:join", {
        roomCode: hostAuth.roomCode,
        displayName: `Đội ${teamNumber}`,
      });
      expect(joined.ok).toBe(true);
      // The server assigns seats in join order; the client no longer sends a team number.
      expect(joined.data.teamNumber).toBe(teamNumber);
      joinedPlayers.push(joined.data);
      privateStatePromises.push(new Promise((resolve) => player.once("game:private-state", resolve)));
      const ready = await emitAck<any>(player, "player:ready", { ready: true });
      expect(ready.ok).toBe(true);
    }

    const publicUpdates: any[] = [];
    host.on("game:public-state", (state) => publicUpdates.push(state));

    const started = await emitAck<any>(host, "host:start-game", hostAuth);
    const privateStates = await Promise.all(privateStatePromises);
    expect(started).toMatchObject({
      ok: true,
      data: { publicState: { phase: "LOBBY", round: 0, trust: 100 } },
    });
    // ROLE_REVEAL is a legitimate public phase name; only the secret fields must be absent.
    expect(JSON.stringify(started.data.publicState)).not.toMatch(/"role"|"faction"|"sessionToken"/i);
    expect(hostReceivedPrivateState).toBe(false);
    expect(privateStates).toHaveLength(8);
    expect(privateStates.map((state) => state.playerId).sort()).toEqual(
      joinedPlayers.map((joined) => joined.playerId).sort(),
    );
    expect(privateStates.filter((state) => state.role === "CORRUPTOR")).toHaveLength(2);

    const paused = await emitAck<any>(host, "host:pause-game", hostAuth);
    expect(paused.data.publicState.paused).toBe(true);
    const resumed = await emitAck<any>(host, "host:resume-game", hostAuth);
    expect(resumed.data.publicState.paused).toBe(false);
    const skipped = await emitAck<any>(host, "host:skip-timer", hostAuth);
    expect(skipped.data.publicState).toMatchObject({ phase: "NIGHT", round: 1 });
    expect(skipped.data.publicState.activeQuestion).toMatchObject({ text: "Socket integration question?" });
    expect(JSON.stringify(skipped.data.publicState.activeQuestion)).not.toContain("correctAnswer");

    const hostAnswer = await emitAck<any>(host, "question:answer", {
      questionId: skipped.data.publicState.activeQuestion.id,
      selectedOption: 0,
    });
    expect(hostAnswer).toMatchObject({ ok: false, error: { code: "UNAUTHORIZED" } });

    const firstAnswer = await emitAck<any>(players[0], "question:answer", {
      questionId: skipped.data.publicState.activeQuestion.id,
      selectedOption: 0,
      playerId: joinedPlayers[1].playerId,
    });
    expect(firstAnswer).toMatchObject({
      ok: true,
      data: { correct: true, privateState: { playerId: joinedPlayers[0].playerId } },
    });
    const duplicateAnswer = await emitAck<any>(players[0], "question:answer", {
      questionId: skipped.data.publicState.activeQuestion.id,
      selectedOption: 0,
    });
    expect(duplicateAnswer).toMatchObject({ ok: false, error: { code: "CONFLICT" } });

    const reset = await emitAck<any>(host, "host:reset-game", hostAuth);
    expect(reset).toMatchObject({ ok: true, data: { room: { status: "LOBBY" } } });
    expect(publicUpdates.length).toBeGreaterThan(0);
  });

  it("resets reaction counts at the start of every discussion round", async () => {
    await QuestionModel.insertMany([
      {
        category: "Test",
        difficulty: "easy",
        text: "Reaction easy question?",
        options: ["A", "B", "C", "D"],
        correctAnswer: "A",
      },
      {
        category: "Test",
        difficulty: "medium",
        text: "Reaction medium question?",
        options: ["A", "B", "C", "D"],
        correctAnswer: "A",
      },
    ]);
    const host = await connectClient();
    const created = await emitAck<any>(host, "room:create", { hostName: "Host" });
    expect(created.ok).toBe(true);
    const hostAuth = {
      roomCode: created.data.room.roomCode,
      hostSessionToken: created.data.hostSessionToken,
    };

    const players: ClientSocket[] = [];
    for (const displayName of ["Đội 1", "Đội 2"]) {
      const player = await connectClient();
      players.push(player);
      const joined = await emitAck<any>(player, "room:join", { roomCode: hostAuth.roomCode, displayName });
      expect(joined.ok).toBe(true);
      const ready = await emitAck<any>(player, "player:ready", { ready: true });
      expect(ready.ok).toBe(true);
    }

    const summaries: any[] = [];
    host.on("reactions:updated", (summary: any) => summaries.push(summary));
    const latestSummary = () => summaries[summaries.length - 1];

    expect((await emitAck<any>(host, "host:start-game", hostAuth)).ok).toBe(true);

    // Advance to the first DISCUSSION: ROLE_REVEAL -> KN -> ABILITY -> RESOLUTION -> DAY_RESULT -> DISCUSSION.
    let skipped: any;
    for (let step = 0; step < 5; step += 1) {
      skipped = await emitAck<any>(host, "host:skip-timer", hostAuth);
      expect(skipped.ok).toBe(true);
    }
    expect(skipped.data.publicState).toMatchObject({ gamePhase: "DISCUSSION", round: 1 });
    // Entering DISCUSSION broadcasts a zeroed summary right away.
    expect(latestSummary()).toMatchObject({ AGREE: 0, SUSPECT: 0, OBJECT: 0, QUESTION: 0, reactions: [] });

    const firstReaction = await emitAck<any>(players[0], "reaction:send", { reaction: "AGREE" });
    expect(firstReaction).toMatchObject({ ok: true });
    expect(latestSummary()).toMatchObject({ AGREE: 1, SUSPECT: 0, OBJECT: 0, QUESTION: 0 });
    expect(latestSummary().reactions).toHaveLength(1);

    // Advance to round 2's DISCUSSION: VOTING -> VOTE_RESULT -> TRUST_UPDATE -> NEXT_ROUND ->
    // NIGHT_KNOWLEDGE -> NIGHT_ABILITY -> NIGHT_RESOLUTION -> DAY_RESULT -> DISCUSSION.
    for (let step = 0; step < 9; step += 1) {
      skipped = await emitAck<any>(host, "host:skip-timer", hostAuth);
      expect(skipped.ok).toBe(true);
    }
    expect(skipped.data.publicState).toMatchObject({ gamePhase: "DISCUSSION", round: 2 });
    // The previous round's AGREE must not leak into the new round's summary.
    expect(latestSummary()).toMatchObject({ AGREE: 0, SUSPECT: 0, OBJECT: 0, QUESTION: 0, reactions: [] });

    const secondReaction = await emitAck<any>(players[0], "reaction:send", { reaction: "SUSPECT" });
    expect(secondReaction).toMatchObject({ ok: true });
    expect(latestSummary()).toMatchObject({ AGREE: 0, SUSPECT: 1, OBJECT: 0, QUESTION: 0 });

    const cleanup = await emitAck<any>(host, "host:reset-game", hostAuth);
    expect(cleanup).toMatchObject({ ok: true });
  });
});
