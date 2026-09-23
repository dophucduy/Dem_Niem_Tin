import { GAME_CONFIG, type GamePhase } from "@dem-niem-tin/shared";

export type EngineConfig = {
  rounds: number;
  initialTrust: number;
  phaseDurationMs: Readonly<Record<GamePhase, number | null>>;
};

export const DEFAULT_ENGINE_CONFIG: EngineConfig = {
  rounds: GAME_CONFIG.rounds,
  initialTrust: GAME_CONFIG.initialTrust,
  phaseDurationMs: {
    LOBBY: null,
    ROLE_REVEAL: 30_000,
    NIGHT_KNOWLEDGE: 60_000,
    NIGHT_ABILITY: 120_000,
    NIGHT_RESOLUTION: 5_000,
    DAY_RESULT: 15_000,
    DISCUSSION: GAME_CONFIG.discussionDurationSeconds * 1_000,
    VOTING: GAME_CONFIG.votingDurationSeconds * 1_000,
    VOTE_RESULT: 10_000,
    TRUST_UPDATE: 10_000,
    NEXT_ROUND: 5_000,
    FINAL: null,
  },
};
