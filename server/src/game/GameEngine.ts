import type { GamePhase } from "@dem-niem-tin/shared";
import { ServiceError } from "../services/errors.js";
import { type GameState, type GameStateSnapshot, toPublicPhase } from "./GameState.js";
import { DEFAULT_ENGINE_CONFIG, type EngineConfig } from "./gameConfig.js";

const ALLOWED_TRANSITIONS: Record<GamePhase, readonly GamePhase[]> = {
  LOBBY: ["ROLE_REVEAL"],
  ROLE_REVEAL: ["NIGHT_KNOWLEDGE"],
  NIGHT_KNOWLEDGE: ["NIGHT_ABILITY"],
  NIGHT_ABILITY: ["NIGHT_RESOLUTION"],
  NIGHT_RESOLUTION: ["DAY_RESULT"],
  DAY_RESULT: ["DISCUSSION"],
  DISCUSSION: ["VOTING"],
  VOTING: ["VOTE_RESULT"],
  VOTE_RESULT: ["TRUST_UPDATE"],
  TRUST_UPDATE: ["NEXT_ROUND", "FINAL"],
  NEXT_ROUND: ["NIGHT_KNOWLEDGE"],
  FINAL: [],
};

export class GameEngine {
  private state: GameState;

  constructor(
    private readonly config: EngineConfig = DEFAULT_ENGINE_CONFIG,
    initialState?: GameState,
  ) {
    if (initialState) {
      this.state = { ...initialState };
      if (this.config.phaseDurationMs[this.state.phase] === null) {
        this.state.phaseEndsAt = undefined;
        this.state.pausedRemainingMs = undefined;
      }
    } else {
      this.state = this.initialState();
    }
  }

  get snapshot(): GameStateSnapshot {
    return Object.freeze({ ...this.state });
  }

  get publicPhase() {
    return toPublicPhase(this.state.phase);
  }

  startGame(now = Date.now()): GameStateSnapshot {
    if (this.state.phase !== "LOBBY") {
      throw new ServiceError("INVALID_PHASE", "Game can only start from the lobby");
    }
    return this.transitionTo("ROLE_REVEAL", now);
  }

  advance(now = Date.now()): GameStateSnapshot {
    if (this.state.paused) throw new ServiceError("INVALID_PHASE", "Cannot advance a paused game");

    const nextPhase = this.nextPhase();
    if (!nextPhase) throw new ServiceError("INVALID_PHASE", "Final phase cannot advance");

    if (nextPhase === "NIGHT_KNOWLEDGE") {
      if (this.state.phase === "ROLE_REVEAL") this.state.round = 1;
      if (this.state.phase === "NEXT_ROUND") this.state.round += 1;
    }

    return this.transitionTo(nextPhase, now);
  }

  tick(now = Date.now()): GameStateSnapshot {
    if (this.state.paused || this.state.phaseEndsAt === undefined || now < this.state.phaseEndsAt) {
      return this.snapshot;
    }
    return this.advance(now);
  }

  pause(now = Date.now()): GameStateSnapshot {
    if (this.state.paused) return this.snapshot;
    if (this.state.phase === "LOBBY" || this.state.phase === "FINAL") {
      throw new ServiceError("INVALID_PHASE", "This phase cannot be paused");
    }

    this.state.paused = true;
    this.state.pausedRemainingMs =
      this.state.phaseEndsAt === undefined ? undefined : Math.max(0, this.state.phaseEndsAt - now);
    this.state.phaseEndsAt = undefined;
    this.state.revision += 1;
    return this.snapshot;
  }

  resume(now = Date.now()): GameStateSnapshot {
    if (!this.state.paused) return this.snapshot;

    this.state.paused = false;
    this.state.phaseStartedAt = now;
    this.state.phaseEndsAt =
      this.state.pausedRemainingMs === undefined ? undefined : now + this.state.pausedRemainingMs;
    this.state.pausedRemainingMs = undefined;
    this.state.revision += 1;
    return this.snapshot;
  }

  skipTimer(now = Date.now()): GameStateSnapshot {
    if (this.state.phase === "LOBBY" || this.state.phase === "FINAL") {
      throw new ServiceError("INVALID_PHASE", "This phase has no timer to skip");
    }
    if (this.state.paused) this.resume(now);
    return this.advance(now);
  }

  restartRound(now = Date.now()): GameStateSnapshot {
    if (this.state.round < 1 || this.state.round > this.config.rounds) {
      throw new ServiceError("INVALID_PHASE", "No active round to restart");
    }
    return this.transitionTo("NIGHT_KNOWLEDGE", now, true);
  }

  updateTrust(delta: number): GameStateSnapshot {
    if (!Number.isFinite(delta)) throw new ServiceError("VALIDATION_ERROR", "Trust delta must be finite");
    this.state.trust = Math.max(0, Math.min(100, this.state.trust + delta));
    this.state.revision += 1;
    return this.snapshot;
  }

  finish(now = Date.now()): GameStateSnapshot {
    if (this.state.phase === "FINAL") return this.snapshot;
    return this.transitionTo("FINAL", now, true);
  }

  reset(): GameStateSnapshot {
    this.state = this.initialState();
    return this.snapshot;
  }

  private nextPhase(): GamePhase | null {
    if (this.state.phase === "TRUST_UPDATE") {
      return this.state.round >= this.config.rounds ? "FINAL" : "NEXT_ROUND";
    }
    return ALLOWED_TRANSITIONS[this.state.phase][0] ?? null;
  }

  private transitionTo(nextPhase: GamePhase, now: number, allowRestart = false): GameStateSnapshot {
    if (!allowRestart && !ALLOWED_TRANSITIONS[this.state.phase].includes(nextPhase)) {
      throw new ServiceError("INVALID_PHASE", `Cannot transition from ${this.state.phase} to ${nextPhase}`);
    }

    const duration = this.config.phaseDurationMs[nextPhase];
    this.state.phase = nextPhase;
    this.state.paused = false;
    this.state.pausedRemainingMs = undefined;
    this.state.phaseStartedAt = now;
    this.state.phaseEndsAt = duration === null ? undefined : now + duration;
    this.state.revision += 1;
    return this.snapshot;
  }

  private initialState(): GameState {
    return {
      phase: "LOBBY",
      round: 0,
      trust: this.config.initialTrust,
      paused: false,
      revision: 0,
    };
  }
}
