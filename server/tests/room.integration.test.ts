import mongoose from "mongoose";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import { ServiceError } from "../src/services/errors.js";
import { RoomService } from "../src/services/roomService.js";

const runDatabaseTests = process.env.RUN_DB_INTEGRATION === "true";
const describeDatabase = runDatabaseTests ? describe : describe.skip;
const databaseName = `dem-niem-tin-test-${process.pid}`;
const roomService = new RoomService();

describeDatabase("RoomService integration", () => {
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

  it("creates eight teams and rejects duplicate team claims", async () => {
    const created = await roomService.createRoom("Host");
    expect(created.lobby.teams).toHaveLength(8);

    await roomService.joinRoom({ roomCode: created.roomCode, teamNumber: 1, socketId: "socket-1" });
    await expect(
      roomService.joinRoom({ roomCode: created.roomCode, teamNumber: 1, socketId: "socket-2" }),
    ).rejects.toMatchObject<ServiceError>({ code: "TEAM_UNAVAILABLE" });
  });

  it("rejects a ninth player when all teams are occupied", async () => {
    const created = await roomService.createRoom("Host");
    for (let teamNumber = 1; teamNumber <= 8; teamNumber += 1) {
      await roomService.joinRoom({
        roomCode: created.roomCode,
        teamNumber,
        socketId: `socket-${teamNumber}`,
      });
    }

    await expect(
      roomService.joinRoom({ roomCode: created.roomCode, teamNumber: 1, socketId: "socket-9" }),
    ).rejects.toMatchObject<ServiceError>({ code: "ROOM_FULL" });
  });

  it("preserves identity on reconnect and rejects an invalid session", async () => {
    const created = await roomService.createRoom("Host");
    const joined = await roomService.joinRoom({
      roomCode: created.roomCode,
      teamNumber: 4,
      socketId: "socket-old",
    });

    const reconnected = await roomService.reconnect({
      roomCode: created.roomCode,
      sessionToken: joined.sessionToken,
      socketId: "socket-new",
    });
    expect(reconnected.playerId).toBe(joined.playerId);
    expect(reconnected.teamId).toBe(joined.teamId);

    await expect(
      roomService.reconnect({
        roomCode: created.roomCode,
        sessionToken: "x".repeat(43),
        socketId: "socket-attacker",
      }),
    ).rejects.toMatchObject<ServiceError>({ code: "SESSION_INVALID" });
  });
});
