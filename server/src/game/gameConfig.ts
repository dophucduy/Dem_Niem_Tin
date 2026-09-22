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
    NIGHT_RESOLUTION: null,
    DAY_RESULT: null,
    DISCUSSION: GAME_CONFIG.discussionDurationSeconds * 1_000,
    VOTING: GAME_CONFIG.votingDurationSeconds * 1_000,
    VOTE_RESULT: null,
    TRUST_UPDATE: null,
    NEXT_ROUND: null,
    FINAL: null,
  },
};
