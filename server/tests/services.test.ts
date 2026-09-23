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
  TeamModel: { updateOne: vi.fn(), findById: vi.fn() }
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
    });
    
    it("should not assign roles if player count is not 8", async () => {
      const players = [{}];
      PlayerModel.find = mockQuery(players);
      await expect(assignRoles("game1")).rejects.toThrow("Game must have exactly 8 players");
    });
  });

  describe("knowledgeService", () => {
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
    it("should resolve actions based on role priorities", async () => {
      GameModel.findById = mockQuery({ _id: "g1", save: vi.fn() });

      const players = [
        { _id: "p1", role: "LAW", effectiveState: "SPECIAL", abilityUnlocked: true, privateResults: [] as any[], save: vi.fn() },
        { _id: "p2", role: "CORRUPTOR", effectiveState: "SPECIAL", abilityUnlocked: true, privateResults: [] as any[], save: vi.fn() },
        { _id: "p3", teamId: "t3", role: "WHISTLEBLOWER", effectiveState: "SPECIAL", abilityUnlocked: true, privateResults: [] as any[], save: vi.fn() },
      ];
      PlayerModel.find = mockQuery(players);

      const actions = [
        { playerId: "p1", targetId: "p3" }, // LAW protects p3
        { playerId: "p2", targetId: "p3" }  // CORRUPTOR attacks p3
      ];

      await resolveNightActions("g1", actions);
      expect(players[1].privateResults[0].type).toBe("ACTION_FAILED");
    });
  });

  describe("votingService", () => {
    it("should tally votes and update trust", async () => {
      const votes = [
        { targetId: "p1" },
        { targetId: "p1" },
        { targetId: "p2" }
      ];
      VoteModel.find = mockQuery(votes);
      const game = { publicEvents: [] as any[], save: vi.fn() };
      GameModel.findById = mockQuery(game);
      const eliminatedPlayer = { teamId: "t1", faction: "CORRUPTION" };
      PlayerModel.findById = mockQuery(eliminatedPlayer);

      const trustDelta = await tallyVotes("g1", 1);
      expect(trustDelta).toBe(10); // Eliminating corruption gives +10
      expect(TeamModel.updateOne).toHaveBeenCalledWith({ _id: "t1", gameId: "g1" }, { $set: { eliminated: true } });
    });
    
    it("should handle tie votes without elimination", async () => {
      const votes = [
        { targetId: "p1" },
        { targetId: "p2" }
      ];
      VoteModel.find = mockQuery(votes);
      const game = { publicEvents: [] as any[], save: vi.fn() };
      GameModel.findById = mockQuery(game);

      const trustDelta = await tallyVotes("g1", 1);
      expect(trustDelta).toBe(0);
      expect(game.publicEvents[0].type).toBe("VOTE_TIE");
    });
  });
});
