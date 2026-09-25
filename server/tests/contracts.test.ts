import { GAME_CONFIG, ROLE_DISTRIBUTION } from "@dem-niem-tin/shared";
import { describe, expect, it } from "vitest";
import { PlayerModel } from "../src/models/index.js";
import { joinRoomSchema, reconnectSchema } from "../src/validation/socketSchemas.js";

describe("shared development contracts", () => {
  it("keeps the exact eight-role distribution without a permanent Citizen role", () => {
    expect(ROLE_DISTRIBUTION).toHaveLength(GAME_CONFIG.teamCount);
    expect(ROLE_DISTRIBUTION.filter((role) => role === "CORRUPTOR")).toHaveLength(2);
    expect(ROLE_DISTRIBUTION).not.toContain("CITIZEN");
  });

  it("normalizes valid room join payloads", () => {
    const result = joinRoomSchema.parse({ roomCode: " ab12cd ", displayName: " Đội 1 " });
    expect(result.roomCode).toBe("AB12CD");
    expect(result.displayName).toBe("Đội 1");
  });

  it("rejects malformed joins, weak session tokens and client-chosen seat numbers", () => {
    expect(joinRoomSchema.safeParse({ roomCode: "ABC12", displayName: "A" }).success).toBe(false);
    expect(joinRoomSchema.safeParse({ roomCode: "ABC123", displayName: " " }).success).toBe(false);
    // Seats are server-assigned: a client-sent seat number must never survive parsing.
    const parsed = joinRoomSchema.parse({ roomCode: "ABC123", displayName: "A", teamNumber: 9 });
    expect("teamNumber" in parsed).toBe(false);
    expect(reconnectSchema.safeParse({ roomCode: "ABC123", sessionToken: "short" }).success).toBe(false);
  });

  it("marks secret player fields as excluded by default", () => {
    expect(PlayerModel.schema.path("sessionTokenHash").options.select).toBe(false);
    expect(PlayerModel.schema.path("role").options.select).toBe(false);
    expect(PlayerModel.schema.path("faction").options.select).toBe(false);
    expect(PlayerModel.schema.path("socketId").options.select).toBe(false);
  });
});
