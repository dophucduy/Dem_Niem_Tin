import { describe, expect, it } from "vitest";
import { createRoomCode } from "../src/services/roomCode.js";
import { createSessionToken, hashSessionToken } from "../src/services/session.js";

describe("room and session security", () => {
  it("creates six-character unambiguous room codes", () => {
    const roomCode = createRoomCode();
    expect(roomCode).toMatch(/^[A-HJ-NP-Z2-9]{6}$/);
  });

  it("creates high-entropy tokens and stores only deterministic hashes", () => {
    const firstToken = createSessionToken();
    const secondToken = createSessionToken();

    expect(firstToken).not.toBe(secondToken);
    expect(firstToken.length).toBeGreaterThanOrEqual(40);
    expect(hashSessionToken(firstToken)).toMatch(/^[a-f0-9]{64}$/);
    expect(hashSessionToken(firstToken)).toBe(hashSessionToken(firstToken));
    expect(hashSessionToken(firstToken)).not.toContain(firstToken);
  });
});
