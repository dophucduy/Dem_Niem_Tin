import type { ClueVisibility, Role } from "./types.js";

export const GAME_CONFIG = {
  /** Eight teams per room: one device per team, seats are assigned in join order. */
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

export const TRUST_EVENTS = {
  correctInvestigation: +10,
  correctVote: +15,
  wrongVote: -10,
  corruptionSuccess: -15,
  knowledgeSuccess: +5,
  verifiedClue: +5,
  verificationSuccess: +5,
} as const;

export const EFFECT_CONFIG = {
  corruptor: {
    trustDeduction: 15,
    trustDrainTitle: "GIEO NHIỄU THÀNH CÔNG",
    trustDrainMessage: (teamNumber: number) =>
      `Bạn đã gieo nhiễu vào ĐỘI ${teamNumber}. Điểm Niềm tin nhân dân giảm 15%.`,
    interferenceSuccessTitle: "CAN THIỆP THÀNH CÔNG",
    interferenceSuccessMessage: (teamNumber: number) =>
      `Hồ sơ thẩm tra ĐỘI ${teamNumber} đêm nay đã bị bạn bóp méo thành "an toàn".`,
    interferenceWastedTitle: "CAN THIỆP KHÔNG PHÁT HUY TÁC DỤNG",
    interferenceWastedMessage: (teamNumber: number) =>
      `Không ai thẩm tra ĐỘI ${teamNumber} đêm nay — can thiệp của bạn không phát huy tác dụng.`,
    blockedTitle: "BỊ PHÁP LUẬT VÔ HIỆU HÓA",
    blockedMessage: (teamNumber: number) =>
      `ĐỘI ${teamNumber} nằm trong lá chắn của Pháp luật — hành động của bạn không phát huy tác dụng.`,
  },
  inspector: {
    suspiciousTitle: "CÓ DẤU HIỆU ĐÁNG NGỜ",
    suspiciousMessage: (teamNumber: number) =>
      `Kết quả thẩm tra: ĐỘI ${teamNumber} có dấu hiệu đáng ngờ.`,
    clearTitle: "CHƯA PHÁT HIỆN DẤU HIỆU",
    clearMessage: (teamNumber: number) =>
      `Kết quả thẩm tra: ĐỘI ${teamNumber} chưa phát hiện dấu hiệu đáng ngờ.`,
  },
  law: {
    protectedTitle: "LÁ CHẮN PHÁP LUẬT ĐÃ THIẾT LẬP",
    protectedMessage: (teamNumber: number) =>
      `ĐỘI ${teamNumber} được che chở trong đêm nay. Mọi hành động nhắm vào đội này đều bị vô hiệu hóa.`,
  },
  whistleblower: {
    visibility: "public" as ClueVisibility,
    clueTitle: (round: number) => `HỒ SƠ VỤ VIỆC #0${round}`,
    clueDescription:
      "Một hồ sơ về bất thường trong bộ máy đã được tiết lộ. Hãy cùng phân tích phản ứng của các đội để tìm kẻ chủ mưu.",
    revealedTitle: "MANH MỐI ĐÃ TIẾT LỘ",
    publicMessage: "Hồ sơ của bạn sẽ xuất hiện công khai vào bình minh.",
  },
  oversight: {
    actedTitle: "XÁC MINH: CÓ THI HÀNH",
    actedMessage: (teamNumber: number) =>
      `XÁC MINH: ĐỘI ${teamNumber} CÓ thi hành hành động trong đêm nay.`,
    notActedTitle: "XÁC MINH: KHÔNG THI HÀNH",
    notActedMessage: (teamNumber: number) =>
      `XÁC MINH: ĐỘI ${teamNumber} KHÔNG thi hành hành động trong đêm nay.`,
  },
  special6: {
    suspiciousTitle: "CÓ DẤU HIỆU TƯ LỢI",
    suspiciousMessage: (teamNumber: number) =>
      `ĐỘI ${teamNumber} có dấu hiệu lợi ích cá nhân đáng ngờ.`,
    clearTitle: "TÀI SẢN MINH BẠCH",
    clearMessage: (teamNumber: number) =>
      `ĐỘI ${teamNumber} hiện chưa có dấu hiệu tư lợi cá nhân.`,
  },
  special7: {
    clueTitle: "YÊU CẦU MINH BẠCH",
    publicClueDescription: (teamNumber: number) =>
      `ĐỘI ${teamNumber} bị yêu cầu giải trình và minh bạch thông tin!`,
    successTitle: "LỆNH MINH BẠCH ĐÃ BAN HÀNH",
    successMessage: (teamNumber: number) =>
      `Bạn đã ban hành lệnh minh bạch với ĐỘI ${teamNumber}. Cả làng sẽ nhìn thấy thông báo này vào bình minh.`,
  },
} as const;
