import mongoose from "mongoose";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
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

  it("assigns seat numbers in join order and exposes the eight-team capacity", async () => {
    const created = await roomService.createRoom("Host");
    expect(created.lobby.teams).toHaveLength(0);
    expect(created.lobby.capacity).toBe(8);

    const first = await roomService.joinRoom({ roomCode: created.roomCode, displayName: "Đội 1", socketId: "socket-1" });
    expect(first.teamNumber).toBe(1);
    const second = await roomService.joinRoom({ roomCode: created.roomCode, displayName: "Đội 2", socketId: "socket-2" });
    expect(second.teamNumber).toBe(2);
    expect(second.lobby.teams.map((team) => team.teamNumber)).toEqual([1, 2]);
  });

  it("gives all eight teams their own seat number", async () => {
    const created = await roomService.createRoom("Host");
    for (let seat = 1; seat <= 8; seat += 1) {
      const joined = await roomService.joinRoom({
        roomCode: created.roomCode,
        displayName: `Đội ${seat}`,
        socketId: `socket-${seat}`,
      });
      expect(joined.teamNumber).toBe(seat);
    }

    const lobby = await roomService.getLobby(created.roomId);
    expect(lobby.teams.map((team) => team.teamNumber)).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
  });

  it("preserves identity on reconnect and rejects an invalid session", async () => {
    const created = await roomService.createRoom("Host");
    const joined = await roomService.joinRoom({
      roomCode: created.roomCode,
      displayName: "Đội 4",
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
    ).rejects.toMatchObject({ code: "SESSION_INVALID" });
  });
});
