import { CLIENT_EVENTS, SERVER_EVENTS } from "@dem-niem-tin/shared";
import { describe, expect, it } from "vitest";

describe("foundation socket contract", () => {
  it("defines separate client and server connection events", () => {
    expect(CLIENT_EVENTS.CONNECTION_CHECK).toBe("connection:check");
    expect(SERVER_EVENTS.CONNECTION_READY).toBe("connection:ready");
    expect(CLIENT_EVENTS.CONNECTION_CHECK).not.toBe(SERVER_EVENTS.CONNECTION_READY);
  });
});
