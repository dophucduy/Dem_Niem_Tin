import mongoose from "mongoose";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import { GameModel, PlayerModel, QuestionModel, RoomModel, TeamModel } from "../src/models/index.js";
import { GameRuntimeService } from "../src/services/gameRuntimeService.js";
import { RoomService } from "../src/services/roomService.js";

const runDatabaseTests = process.env.RUN_DB_INTEGRATION === "true";
const describeDatabase = runDatabaseTests ? describe : describe.skip;
const databaseName = `dem-niem-tin-runtime-test-${process.pid}`;

describeDatabase("GameRuntimeService integration", () => {
  const roomService = new RoomService();

  beforeAll(async () => {
    await mongoose.connect(process.env.TEST_MONGODB_URI ?? "mongodb://127.0.0.1:27017", {
      dbName: databaseName,
    });
  });

  afterEach(async () => {
    await mongoose.connection.db?.dropDatabase();
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });

  async function createReadyRoom() {
    const created = await roomService.createRoom("Integration Host");
    for (let seat = 1; seat <= 8; seat += 1) {
      const joined = await roomService.joinRoom({
        roomCode: created.roomCode,
        displayName: `Đội ${seat}`,
        socketId: `socket-${seat}`,
      });
      expect(joined.teamNumber).toBe(seat);
      await roomService.setReady(created.roomId, joined.playerId, true);
    }
    return created;
  }

  async function seedQuestions() {
    await QuestionModel.insertMany(
      ["easy", "medium", "hard"].map((difficulty) => ({
        category: "Test",
        difficulty,
        text: `Integration ${difficulty} question?`,
        options: ["A", "B", "C", "D"],
        correctAnswer: "A",
      })),
    );
  }

  it("authenticates the host and controls a persisted server-authoritative game", async () => {
    await seedQuestions();
    const created = await createReadyRoom();
    const publishedPhases: string[] = [];
    const runtimeService = new GameRuntimeService(roomService, (_roomId, state) => {
      publishedPhases.push(state.phase);
    });

    const room = await runtimeService.authenticateHost(created.roomCode, created.sessionToken);
    expect(room._id.toString()).toBe(created.roomId);
    await expect(
      runtimeService.authenticateHost(created.roomCode, "x".repeat(43)),
    ).rejects.toMatchObject({ code: "UNAUTHORIZED" });

    const started = await runtimeService.startGame(created.roomId);
    expect(started).toMatchObject({ phase: "LOBBY", round: 0, trust: 100, paused: false });
    // ROLE_REVEAL is a legitimate public phase name; only the secret fields must be absent.
    expect(JSON.stringify(started)).not.toMatch(/"role"|"faction"|"sessionToken"/i);

    const game = await GameModel.findOne({ roomId: created.roomId }).lean();
    expect(game).toMatchObject({ phase: "ROLE_REVEAL", status: "ACTIVE" });

    expect((await runtimeService.pause(created.roomId)).paused).toBe(true);
    expect((await runtimeService.resume(created.roomId)).paused).toBe(false);
    expect(await runtimeService.skipTimer(created.roomId)).toMatchObject({ phase: "NIGHT", round: 1 });
    expect(await runtimeService.restartRound(created.roomId)).toMatchObject({ phase: "NIGHT", round: 1 });
    expect(await runtimeService.endGame(created.roomId)).toMatchObject({ phase: "FINAL", round: 1 });
    expect(publishedPhases).toContain("FINAL");

    const resetLobby = await runtimeService.resetGame(created.roomId);
    expect(resetLobby.status).toBe("LOBBY");
    expect(resetLobby.teams.every((team) => !team.ready && !team.eliminated)).toBe(true);
    expect(await GameModel.countDocuments({ roomId: created.roomId })).toBe(0);
    expect(await PlayerModel.countDocuments({ roomId: created.roomId, gameId: { $exists: true } })).toBe(0);
    expect(await TeamModel.countDocuments({ roomId: created.roomId, gameId: { $exists: true } })).toBe(0);
    expect(await RoomModel.findById(created.roomId).lean()).toMatchObject({ status: "LOBBY" });
  });

  it("refuses to start until all eight teams are connected and ready", async () => {
    const created = await roomService.createRoom("Host");
    const runtimeService = new GameRuntimeService(roomService, () => undefined);
    await expect(runtimeService.startGame(created.roomId)).rejects.toMatchObject({
      code: "CONFLICT",
    });
  });

  it("recovers a persisted paused runtime after a server-service restart", async () => {
    const created = await createReadyRoom();
    const firstRuntime = new GameRuntimeService(roomService, () => undefined);
    await firstRuntime.startGame(created.roomId);
    await firstRuntime.pause(created.roomId);

    const recoveredRuntime = new GameRuntimeService(roomService, () => undefined);
    const recovered = await recoveredRuntime.reconnectHost(created.roomId);
    expect(recovered).toMatchObject({ phase: "LOBBY", round: 0, paused: true });
    await recoveredRuntime.resetGame(created.roomId);
  });

  it("runs exactly three rounds to FINAL without creating Night 4", async () => {
    await seedQuestions();
    const created = await createReadyRoom();
    const runtime = new GameRuntimeService(roomService, () => undefined);
    await runtime.startGame(created.roomId);

    const visited: Array<{ phase: string; round: number }> = [];
    for (let step = 0; step < 40; step += 1) {
      const game = await GameModel.findOne({ roomId: created.roomId }).lean();
      if (!game) throw new Error("Game disappeared during full-flow test");
      visited.push({ phase: game.phase, round: game.round });
      if (game.phase === "FINAL") break;
      await runtime.skipTimer(created.roomId);
    }

    expect(visited.at(-1)).toEqual({ phase: "FINAL", round: 3 });
    expect(visited.some((state) => state.round > 3)).toBe(false);
    expect(visited.filter((state) => state.phase === "NIGHT_KNOWLEDGE").map((state) => state.round))
      .toEqual([1, 2, 3]);
  });
});
