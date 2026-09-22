import type { GamePhase, PublicPhase } from "@dem-niem-tin/shared";

export type GameState = {
  phase: GamePhase;
  round: number;
  trust: number;
  paused: boolean;
  phaseStartedAt?: number;
  phaseEndsAt?: number;
  pausedRemainingMs?: number;
  revision: number;
};

export type GameStateSnapshot = Readonly<GameState>;

export function toPublicPhase(phase: GamePhase): PublicPhase {
  if (phase === "LOBBY" || phase === "ROLE_REVEAL") return "LOBBY";
  if (phase.startsWith("NIGHT_")) return "NIGHT";
  if (phase === "VOTING" || phase === "VOTE_RESULT") return "VOTING";
  if (phase === "FINAL") return "FINAL";
  return "DAY";
}
