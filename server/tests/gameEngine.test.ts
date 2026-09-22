import { afterEach, describe, expect, it, vi } from "vitest";
import { GameEngine, GameScheduler } from "../src/game/index.js";

function advanceRound(engine: GameEngine, now: number): number {
  const phases = [
    "NIGHT_ABILITY",
    "NIGHT_RESOLUTION",
    "DAY_RESULT",
    "DISCUSSION",
    "VOTING",
    "VOTE_RESULT",
    "TRUST_UPDATE",
  ];
  for (const expectedPhase of phases) {
    now += 1;
    expect(engine.advance(now).phase).toBe(expectedPhase);
  }
  return now;
}

describe("GameEngine", () => {
  afterEach(() => vi.useRealTimers());

  it("runs exactly three rounds and never creates a fourth night", () => {
    const engine = new GameEngine();
    let now = 1_000;
    expect(engine.startGame(now).phase).toBe("ROLE_REVEAL");

    now += 1;
    expect(engine.advance(now)).toMatchObject({ phase: "NIGHT_KNOWLEDGE", round: 1 });
    now = advanceRound(engine, now);
    expect(engine.advance(++now).phase).toBe("NEXT_ROUND");
    expect(engine.advance(++now)).toMatchObject({ phase: "NIGHT_KNOWLEDGE", round: 2 });

    now = advanceRound(engine, now);
    expect(engine.advance(++now).phase).toBe("NEXT_ROUND");
    expect(engine.advance(++now)).toMatchObject({ phase: "NIGHT_KNOWLEDGE", round: 3 });

    now = advanceRound(engine, now);
    expect(engine.advance(++now)).toMatchObject({ phase: "FINAL", round: 3 });
    expect(() => engine.advance(++now)).toThrow(/Final phase cannot advance/);
  });

  it("pauses and resumes a server deadline without losing remaining time", () => {
    const engine = new GameEngine();
    expect(engine.startGame(1_000).phaseEndsAt).toBe(31_000);

    const paused = engine.pause(11_000);
    expect(paused).toMatchObject({ paused: true, pausedRemainingMs: 20_000 });
    expect(paused.phaseEndsAt).toBeUndefined();

    const resumed = engine.resume(50_000);
    expect(resumed).toMatchObject({ paused: false, phaseEndsAt: 70_000 });
    expect(engine.tick(69_999).phase).toBe("ROLE_REVEAL");
    expect(engine.tick(70_000)).toMatchObject({ phase: "NIGHT_KNOWLEDGE", round: 1 });
  });

  it("restarts only the active round and clamps server-side Trust", () => {
    const engine = new GameEngine();
    engine.startGame(0);
    engine.advance(1);
    engine.advance(2);
    expect(engine.restartRound(3)).toMatchObject({ phase: "NIGHT_KNOWLEDGE", round: 1 });
    expect(engine.updateTrust(-500).trust).toBe(0);
    expect(engine.updateTrust(500).trust).toBe(100);
  });

  it("maps internal phases to simple public labels", () => {
    const engine = new GameEngine();
    expect(engine.publicPhase).toBe("LOBBY");
    engine.startGame(0);
    expect(engine.publicPhase).toBe("LOBBY");
    engine.advance(1);
    expect(engine.publicPhase).toBe("NIGHT");
  });

  it("uses a server scheduler to advance timed phases", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(0);
    const engine = new GameEngine();
    const states: string[] = [];
    engine.startGame(0);
    const scheduler = new GameScheduler(engine, (state) => states.push(state.phase));
    scheduler.schedule();

    await vi.advanceTimersByTimeAsync(30_000);
    expect(engine.snapshot).toMatchObject({ phase: "NIGHT_KNOWLEDGE", round: 1 });
    expect(states).toEqual(["NIGHT_KNOWLEDGE"]);
    scheduler.cancel();
  });
});
