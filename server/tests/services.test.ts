import { describe, it, expect, vi, beforeEach } from 'vitest';
import { assignRoles } from '../src/services/roleService.js';
import { submitAnswer } from '../src/services/knowledgeService.js';
import { resolveNightActions } from '../src/services/abilityService.js';
import { tallyVotes } from '../src/services/votingService.js';
import { PlayerModel } from '../src/models/Player.js';
import { GameModel } from '../src/models/Game.js';
import { VoteModel } from '../src/models/Vote.js';
import { TeamModel } from '../src/models/Team.js';
import { QuestionModel } from '../src/models/Question.js';
import { TRUST_EVENTS } from '@dem-niem-tin/shared';

function mockQuery(value: any) {
  const q = {
    select: () => q,
    lean: () => q,
    exec: async () => value,
    then: (resolve: any) => resolve(value),
  };
  return vi.fn().mockReturnValue(q);
}

vi.mock('../src/models/Game.js', () => ({
  GameModel: { findById: vi.fn(), findByIdAndUpdate: vi.fn() }
}));
vi.mock('../src/models/Player.js', () => ({
  PlayerModel: { find: vi.fn(), findOne: vi.fn(), countDocuments: vi.fn(), updateMany: vi.fn(), findById: vi.fn(), bulkWrite: vi.fn(), findOneAndUpdate: vi.fn() }
}));
vi.mock('../src/models/Vote.js', () => ({
  VoteModel: { find: vi.fn() }
}));
vi.mock('../src/models/Team.js', () => ({
  TeamModel: { updateOne: vi.fn(), findById: vi.fn(), find: vi.fn(), exists: vi.fn() }
}));
vi.mock('../src/models/Question.js', () => ({
  QuestionModel: { findById: vi.fn() }
}));

describe("Gameplay Services", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe("roleService", () => {
    it("should assign exact role distribution", async () => {
      const players = Array.from({ length: 8 }).map((_, i) => ({
        _id: `p${i}`,
        teamId: `t${i}`,
      }));
      PlayerModel.find = mockQuery(players);
      vi.mocked(PlayerModel.bulkWrite).mockResolvedValue({} as any);

      await assignRoles("game1");

      expect(PlayerModel.bulkWrite).toHaveBeenCalled();
      const ops = vi.mocked(PlayerModel.bulkWrite).mock.calls[0][0] as any[];
      const roles = ops.map((op) => op.updateOne.update[0].$set.role);
      expect(roles).toHaveLength(8);
      expect(roles.filter((role) => role === "CORRUPTOR")).toHaveLength(2);
      expect(new Set(roles).size).toBe(7); // eight seats, seven distinct roles
    });
    
    it("should reject role assignment when fewer than two teams are present", async () => {
      const players = [{}];
      PlayerModel.find = mockQuery(players);
      await expect(assignRoles("game1")).rejects.toThrow("Game must have at least 2 players to assign roles");
    });
  });

  describe("knowledgeService", () => {
    beforeEach(() => {
      // submitAnswer resolves the player and verifies its team is still active.
      PlayerModel.findOne = mockQuery({ _id: "p1", gameId: "g1", teamId: "t1" });
      vi.mocked(TeamModel.exists).mockResolvedValue({ _id: "t1" } as any);
    });

    it("should unlock ability on correct answer", async () => {
      const player = { save: vi.fn() };
      PlayerModel.findOneAndUpdate = mockQuery(player);
      GameModel.findById = mockQuery({ activeQuestion: { id: "q1", correctOption: 1 } });
      QuestionModel.findById = mockQuery({ options: ["A", "B"], correctAnswer: "B" });
      
      const correct = await submitAnswer("g1", 1, "p1", "q1", 1);
      expect(correct).toBe(true);
    });
    
    it("should set CITIZEN on wrong answer", async () => {
      const player = { save: vi.fn() };
      PlayerModel.findOneAndUpdate = mockQuery(player);
      GameModel.findById = mockQuery({ activeQuestion: { id: "q1", correctOption: 1 } });
      QuestionModel.findById = mockQuery({ options: ["A", "B"], correctAnswer: "B" });
      
      const correct = await submitAnswer("g1", 1, "p1", "q1", 0);
      expect(correct).toBe(false);
    });
  });

  describe("abilityService", () => {
    it("resolves LAW protection first and gives structured feedback to every actor", async () => {
      GameModel.findById = mockQuery({ _id: "g1", save: vi.fn() });
      GameModel.findByIdAndUpdate = mockQuery({});

      const players = [
        { _id: "p1", role: "LAW", effectiveState: "SPECIAL", abilityUnlocked: true, privateResults: [] as any[], save: vi.fn() },
        { _id: "p2", role: "CORRUPTOR", effectiveState: "SPECIAL", abilityUnlocked: true, privateResults: [] as any[], save: vi.fn() },
        { _id: "p3", teamId: "t3", role: "WHISTLEBLOWER", effectiveState: "SPECIAL", abilityUnlocked: true, privateResults: [] as any[], save: vi.fn() },
      ];
      PlayerModel.find = mockQuery(players);
      TeamModel.find = mockQuery([{ _id: "t3", teamNumber: 3, displayName: "ĐỘI 3" }]);

      const actions = [
        { playerId: "p1", targetId: "p3" }, // LAW protects p3
        { playerId: "p2", targetId: "p3" }, // CORRUPTOR drains p3 but is blocked
        { playerId: "p3" }                   // WHISTLEBLOWER leaks a case file (no target)
      ];

      const trustDelta = await resolveNightActions("g1", 1, actions);

      expect(trustDelta).toBe(0);
      expect(players[1].privateResults[0]).toMatchObject({
        type: "ACTION_FAILED",
        outcome: "BLOCKED",
        round: 1,
        targetTeamNumber: 3,
        title: "BỊ PHÁP LUẬT VÔ HIỆU HÓA",
      });
      expect(players[0].privateResults[0]).toMatchObject({
        type: "INFO",
        outcome: "INFO",
        round: 1,
        targetTeamNumber: 3,
        title: "LÁ CHẮN PHÁP LUẬT ĐÃ THIẾT LẬP",
      });
      // WHISTLEBLOWER publishes a round-numbered case file
      expect(players[2].privateResults[0]).toMatchObject({ type: "INFO", title: "MANH MỐI ĐÃ TIẾT LỘ" });
      expect(GameModel.findByIdAndUpdate).toHaveBeenCalledWith("g1", {
        $push: {
          publicClues: {
            $each: expect.arrayContaining([
              expect.objectContaining({ title: "HỒ SƠ VỤ VIỆC #01", visibility: "public" }),
            ]),
          },
        },
      });
    });

    it("flips an INSPECTOR verdict when a CORRUPTOR interferes with the investigated team", async () => {
      GameModel.findById = mockQuery({ _id: "g1", save: vi.fn() });

      const players = [
        { _id: "p2", role: "CORRUPTOR", effectiveState: "SPECIAL", abilityUnlocked: true, privateResults: [] as any[], save: vi.fn() },
        { _id: "p3", teamId: "t3", role: "CORRUPTOR", effectiveState: "SPECIAL", abilityUnlocked: true, privateResults: [] as any[], save: vi.fn() },
        { _id: "p4", role: "INSPECTOR", effectiveState: "SPECIAL", abilityUnlocked: true, privateResults: [] as any[], save: vi.fn() },
      ];
      PlayerModel.find = mockQuery(players);
      TeamModel.find = mockQuery([{ _id: "t3", teamNumber: 3, displayName: "ĐỘI 3" }]);

      const trustDelta = await resolveNightActions("g1", 1, [
        { playerId: "p2", targetId: "p3", mode: "INTERFERE" },
        { playerId: "p4", targetId: "p3" },
      ]);

      // A genuine suspicious finding was suppressed by interference: no trust reward.
      expect(trustDelta).toBe(0);
      expect(players[0].privateResults[0]).toMatchObject({ outcome: "SUCCESS", type: "ACTION_SUCCESS" });
      expect(players[2].privateResults[0]).toMatchObject({
        type: "INSPECTION_RESULT",
        outcome: "CLEAR",
        title: "CHƯA PHÁT HIỆN DẤU HIỆU",
        targetTeamNumber: 3,
      });
      expect(players[2].privateResults[0].message).toContain("ĐỘI 3");
    });

    it("rewards a genuine suspicious finding and reports wasted interference", async () => {
      GameModel.findById = mockQuery({ _id: "g1", save: vi.fn() });

      const players = [
        { _id: "p2", role: "CORRUPTOR", effectiveState: "SPECIAL", abilityUnlocked: true, privateResults: [] as any[], save: vi.fn() },
        { _id: "p3", teamId: "t3", role: "CORRUPTOR", effectiveState: "SPECIAL", abilityUnlocked: true, privateResults: [] as any[], save: vi.fn() },
        { _id: "p4", role: "INSPECTOR", effectiveState: "SPECIAL", abilityUnlocked: true, privateResults: [] as any[], save: vi.fn() },
        { _id: "p5", teamId: "t5", role: "SPECIAL_7", effectiveState: "SPECIAL", abilityUnlocked: true, privateResults: [] as any[], save: vi.fn() },
      ];
      PlayerModel.find = mockQuery(players);
      TeamModel.find = mockQuery([
        { _id: "t3", teamNumber: 3, displayName: "ĐỘI 3" },
        { _id: "t5", teamNumber: 5, displayName: "ĐỘI 5" },
      ]);

      // p2 interferes with a team nobody investigates (wasted); p4 inspects p3 (corruptor) genuinely.
      const trustDelta = await resolveNightActions("g1", 2, [
        { playerId: "p2", targetId: "p5", mode: "INTERFERE" },
        { playerId: "p4", targetId: "p3" },
      ]);

      expect(trustDelta).toBe(TRUST_EVENTS.correctInvestigation);
      expect(players[0].privateResults[0]).toMatchObject({
        outcome: "INFO",
        title: "CAN THIỆP KHÔNG PHÁT HUY TÁC DỤNG",
        round: 2,
        targetTeamNumber: 5,
      });
      expect(players[2].privateResults[0]).toMatchObject({ outcome: "SUSPICIOUS", title: "CÓ DẤU HIỆU ĐÁNG NGỜ" });
    });

    it("gives OVERSIGHT truthful acted/not-acted verdicts and trust for successful verifications", async () => {
      GameModel.findById = mockQuery({ _id: "g1", save: vi.fn() });
      GameModel.findByIdAndUpdate = mockQuery({});

      const players = [
        { _id: "p1", teamId: "t1", role: "WHISTLEBLOWER", effectiveState: "SPECIAL", abilityUnlocked: true, privateResults: [] as any[], save: vi.fn() },
        { _id: "p2", teamId: "t2", role: "CORRUPTOR", effectiveState: "SPECIAL", abilityUnlocked: true, privateResults: [] as any[], save: vi.fn() },
        { _id: "p5", role: "OVERSIGHT", effectiveState: "SPECIAL", abilityUnlocked: true, privateResults: [] as any[], save: vi.fn() },
        { _id: "p6", teamId: "t6", role: "WHISTLEBLOWER", effectiveState: "SPECIAL", abilityUnlocked: true, privateResults: [] as any[], save: vi.fn() },
        { _id: "p7", role: "OVERSIGHT", effectiveState: "SPECIAL", abilityUnlocked: true, privateResults: [] as any[], save: vi.fn() },
      ];
      PlayerModel.find = mockQuery(players);
      TeamModel.find = mockQuery([
        { _id: "t1", teamNumber: 1, displayName: "ĐỘI 1" },
        { _id: "t2", teamNumber: 2, displayName: "ĐỘI 2" },
        { _id: "t6", teamNumber: 6, displayName: "ĐỘI 6" },
      ]);

      const trustDelta = await resolveNightActions("g1", 1, [
        { playerId: "p1" },                    // WHISTLEBLOWER leaks a clue
        { playerId: "p2", targetId: "p1" },  // CORRUPTOR drains trust (-15)
        { playerId: "p5", targetId: "p2" },  // OVERSIGHT verifies p2, who acted (+5)
        { playerId: "p7", targetId: "p6" },  // OVERSIGHT verifies p6, who did not act
      ]);

      expect(trustDelta).toBe(TRUST_EVENTS.corruptionSuccess + TRUST_EVENTS.verificationSuccess);
      expect(players[2].privateResults[0]).toMatchObject({
        outcome: "INFO",
        title: "XÁC MINH: CÓ THI HÀNH",
        targetTeamNumber: 2,
      });
      expect(players[4].privateResults[0]).toMatchObject({
        outcome: "INFO",
        title: "XÁC MINH: KHÔNG THI HÀNH",
        targetTeamNumber: 6,
      });
    });
  });

  describe("votingService", () => {
    it("should tally votes, eliminate the team and publish structured details", async () => {
      const votes = [
        { targetId: "p1" },
        { targetId: "p1" },
        { targetId: "p2" }
      ];
      VoteModel.find = mockQuery(votes);
      const game = { publicEvents: [] as any[], save: vi.fn() };
      GameModel.findById = mockQuery(game);
      PlayerModel.findById = mockQuery({ teamId: "t1", faction: "CORRUPTION", role: "CORRUPTOR" });
      PlayerModel.find = mockQuery([
        { _id: "p1", teamId: "t1" },
        { _id: "p2", teamId: "t2" },
      ]);
      TeamModel.find = mockQuery([
        { _id: "t1", teamNumber: 1, displayName: "ĐỘI 1" },
        { _id: "t2", teamNumber: 2, displayName: "ĐỘI 2" },
      ]);

      const trustDelta = await tallyVotes("g1", 1);
      expect(trustDelta).toBe(10); // Eliminating corruption gives +10
      expect(TeamModel.updateOne).toHaveBeenCalledWith({ _id: "t1", gameId: "g1" }, { $set: { eliminated: true } });

      const event = game.publicEvents[0];
      expect(event.type).toBe("VOTE_RESULT");
      expect(JSON.parse(event.data)).toMatchObject({
        round: 1,
        isTie: false,
        votesReceived: 2,
        eliminatedTeamNumber: 1,
        eliminatedTeamName: "ĐỘI 1",
        faction: "CORRUPTION",
        role: "CORRUPTOR",
        trustDelta: 10,
      });
      expect(JSON.parse(event.data).voteDistribution[0]).toMatchObject({ teamNumber: 1, votes: 2 });
    });
    
    it("should handle tie votes without elimination", async () => {
      const votes = [
        { targetId: "p1" },
        { targetId: "p2" }
      ];
      VoteModel.find = mockQuery(votes);
      const game = { publicEvents: [] as any[], save: vi.fn() };
      GameModel.findById = mockQuery(game);
      PlayerModel.find = mockQuery([
        { _id: "p1", teamId: "t1" },
        { _id: "p2", teamId: "t2" },
      ]);
      TeamModel.find = mockQuery([
        { _id: "t1", teamNumber: 1, displayName: "ĐỘI 1" },
        { _id: "t2", teamNumber: 2, displayName: "ĐỘI 2" },
      ]);

      const trustDelta = await tallyVotes("g1", 1);
      expect(trustDelta).toBe(0);
      expect(game.publicEvents[0].type).toBe("VOTE_TIE");
      expect(JSON.parse(game.publicEvents[0].data)).toMatchObject({ isTie: true, votesReceived: 1 });
    });
  });
});
