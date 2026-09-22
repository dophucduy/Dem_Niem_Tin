import { GameEngine } from "./GameEngine.js";
import type { GameStateSnapshot } from "./GameState.js";

export type StateChangeHandler = (state: GameStateSnapshot) => void | Promise<void>;

export class GameScheduler {
  private timeout?: ReturnType<typeof setTimeout>;

  constructor(
    private readonly engine: GameEngine,
    private readonly onStateChange: StateChangeHandler,
  ) {}

  schedule(): void {
    this.cancel();
    const state = this.engine.snapshot;
    if (state.paused || state.phaseEndsAt === undefined) return;

    const delay = Math.max(0, state.phaseEndsAt - Date.now());
    this.timeout = setTimeout(() => {
      const nextState = this.engine.tick();
      void Promise.resolve(this.onStateChange(nextState)).finally(() => this.schedule());
    }, delay);
  }

  cancel(): void {
    if (this.timeout) clearTimeout(this.timeout);
    this.timeout = undefined;
  }
}
