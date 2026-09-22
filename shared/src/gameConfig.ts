import type { Role } from "./types.js";

export const GAME_CONFIG = {
  teamCount: 8,
  rounds: 3,
  initialTrust: 100,
  nightDurationSeconds: 180,
  discussionDurationSeconds: 90,
  votingDurationSeconds: 45,
} as const;

export const ROLE_DISTRIBUTION: readonly Role[] = [
  "CORRUPTOR",
  "CORRUPTOR",
  "INSPECTOR",
  "LAW",
  "WHISTLEBLOWER",
  "OVERSIGHT",
  "SPECIAL_6",
  "SPECIAL_7",
];
