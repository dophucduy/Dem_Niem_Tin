import type { Role } from "./types.js";

export const GAME_CONFIG = {
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

export const TRUST_EVENTS = {
  correctInvestigation: +10,
  correctVote: +15,
  wrongVote: -10,
  corruptionSuccess: -15,
  knowledgeSuccess: +5,
  verifiedClue: +5,
} as const;

export const EFFECT_CONFIG = {
  corruptor: {
    trustDeduction: 15,
    message: "Bạn đã gây nhiễu, điểm Niềm tin nhân dân giảm 15%.",
  },
  oversight: {
    message: "Hành động đã được xác minh. Manh mối hoặc dữ liệu là chính xác.",
  },
  special6: {
    corruptorMessage: "Có dấu hiệu lợi ích cá nhân đáng ngờ.",
    defaultMessage: "Tài sản minh bạch.",
  },
  special7: {
    publicClueTitle: "Yêu Cầu Minh Bạch",
    publicClueDescription: (targetName: string) => `Đội ${targetName} bị yêu cầu minh bạch thông tin!`,
  }
} as const;
