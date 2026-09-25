import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GameRuntimeService } from '../src/services/gameRuntimeService.js';
import { RoomService } from '../src/services/roomService.js';
import { GameModel } from '../src/models/Game.js';
import { PlayerModel } from '../src/models/Player.js';
import { RoomModel } from '../src/models/Room.js';
import { TeamModel } from '../src/models/Team.js';
import { VoteModel } from '../src/models/Vote.js';
import { ActionModel } from '../src/models/Action.js';
import { QuestionModel } from '../src/models/Question.js';
import { submitVote } from '../src/services/votingService.js';
import { submitAbility } from '../src/services/abilityService.js';
import { submitAnswer } from '../src/services/knowledgeService.js';
import { GameEngine } from '../src/game/GameEngine.js';

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
  GameModel: { findOne: vi.fn(), findById: vi.fn(), create: vi.fn() }
}));
vi.mock('../src/models/Player.js', () => ({
  PlayerModel: { findOne: vi.fn(), findById: vi.fn(), countDocuments: vi.fn(), updateMany: vi.fn(), findOneAndUpdate: vi.fn() }
}));
vi.mock('../src/models/Room.js', () => ({
  RoomModel: { findOne: vi.fn() }
}));
vi.mock('../src/models/Team.js', () => ({
  TeamModel: { findOne: vi.fn(), findById: vi.fn(), countDocuments: vi.fn() }
}));
vi.mock('../src/models/Vote.js', () => ({
  VoteModel: { create: vi.fn(), findOne: vi.fn() }
}));
vi.mock('../src/models/Action.js', () => ({
  ActionModel: { create: vi.fn() }
}));
vi.mock('../src/models/Question.js', () => ({
  QuestionModel: { findById: vi.fn() }
}));

describe("Security Requirements (15 mandatory tests)", () => {
  let runtimeService: GameRuntimeService;
  let roomService: RoomService;

  beforeEach(() => {
    vi.resetAllMocks();
    roomService = new RoomService();
    runtimeService = new GameRuntimeService(roomService, vi.fn());
  });

  describe("1. Private State Leakage", () => {
    it("must not include role in public state payload", () => {
      const engine = new GameEngine();
      engine.startGame();
      expect(engine.snapshot).not.toHaveProperty('role');
    });
    
    it("must not include faction in public state payload", () => {
      const engine = new GameEngine();
      engine.startGame();
      expect(engine.snapshot).not.toHaveProperty('faction');
    });
  });

  describe("2. Action Validation (Phase)", () => {
    it("must reject vote submission outside VOTING phase", async () => {
      GameModel.findOne = mockQuery({ phase: "NIGHT_KNOWLEDGE", round: 1, status: "ACTIVE", _id: "game1" });
      await expect(runtimeService.submitVote("room1", "player1", { targetTeamId: "team2" }))
        .rejects.toMatchObject({ code: "INVALID_PHASE" });
    });

    it("must reject ability usage outside NIGHT_ABILITY phase", async () => {
      GameModel.findOne = mockQuery({ phase: "DAY_RESULT", round: 1, status: "ACTIVE", _id: "game1" });
      await expect(runtimeService.useAbility("room1", "player1", { targetTeamId: "team2" }))
        .rejects.toMatchObject({ code: "INVALID_PHASE" });
    });

    it("must reject question answer outside NIGHT_KNOWLEDGE phase", async () => {
      GameModel.findOne = mockQuery({ phase: "VOTING", round: 1, status: "ACTIVE", _id: "game1" });
      await expect(runtimeService.answerQuestion("room1", "player1", { questionId: "q1", selectedOption: 0 }))
        .rejects.toMatchObject({ code: "INVALID_PHASE" });
    });
  });

  describe("3. Duplicate Actions", () => {
    it("must block double voting", async () => {
      PlayerModel.findOne = mockQuery({ _id: "p1", gameId: "g1", teamId: "t1" });
      TeamModel.findOne = mockQuery({ _id: "t2", gameId: "g1", eliminated: false });
      VoteModel.findOne = mockQuery({ _id: "v1" }); // Existing vote
      vi.mocked(VoteModel.create).mockRejectedValue({ code: 11000 });
      await expect(submitVote("g1", 1, "p1", "t2")).rejects.toMatchObject({ code: "CONFLICT" });
    });

    it("must block answering question multiple times", async () => {
      PlayerModel.findOneAndUpdate = mockQuery(null);
      QuestionModel.findById = mockQuery({ id: "q1", options: ["A", "B", "C", "D"], correctOption: 1 });
      await expect(submitAnswer("g1", 1, "p1", "q1", 0)).rejects.toMatchObject({ code: "CONFLICT" });
    });

    it("must block using ability multiple times", async () => {
      PlayerModel.findOne = mockQuery({ _id: "p1", gameId: "g1", effectiveState: "SPECIAL", abilityUnlocked: true });
      vi.mocked(ActionModel.create).mockRejectedValue({ code: 11000 });
      await expect(submitAbility("g1", 1, "p1")).rejects.toMatchObject({ code: "CONFLICT" });
    });
  });

  describe("4. Target Validation", () => {
    it("must reject vote for eliminated player", async () => {
      PlayerModel.findOne = mockQuery({ _id: "p1", gameId: "g1", teamId: "t1" });
      TeamModel.findOne = mockQuery(null);
      VoteModel.findOne = mockQuery(null);
      await expect(submitVote("g1", 1, "p1", "t2")).rejects.toMatchObject({ code: "VALIDATION_ERROR" });
    });

    it("must reject ability target for eliminated player", async () => {
      PlayerModel.findOne = mockQuery({ _id: "p1", gameId: "g1", effectiveState: "SPECIAL", abilityUnlocked: true });
      TeamModel.findOne = mockQuery(null);
      await expect(submitAbility("g1", 1, "p1", "t2")).rejects.toMatchObject({ code: "VALIDATION_ERROR" });
    });
  });

  describe("5. State Integrity", () => {
    it("must enforce Trust score bounds [0, 100]", () => {
      const engine = new GameEngine();
      engine.updateTrust(150);
      expect(engine.snapshot.trust).toBe(100);
      engine.updateTrust(-200);
      expect(engine.snapshot.trust).toBe(0);
    });

    it("must reset effectiveState and ability unlocked at start of night", async () => {
      const { resetKnowledgeState } = await import('../src/services/knowledgeService.js');
      vi.mocked(PlayerModel.updateMany).mockResolvedValue({} as any);
      await resetKnowledgeState("g1");
      expect(PlayerModel.updateMany).toHaveBeenCalledWith({ gameId: "g1" }, { $set: { abilityUnlocked: false, effectiveState: "SPECIAL" }, $unset: { answeredRound: 1 } });
    });
  });

  describe("6. Authorization", () => {
    it("must reject host-only commands from player client", async () => {
      RoomModel.findOne = mockQuery(null);
      await expect(runtimeService.authenticateHost("r1", "wrong")).rejects.toMatchObject({ code: "UNAUTHORIZED" });
    });

    it("must reject player-only commands from host client", async () => {
      GameModel.findOne = mockQuery(null);
      await expect(runtimeService.submitVote("r1", "hostId", { targetTeamId: "t2" })).rejects.toThrow();
    });

    it("must reject spoofing another playerId in payload", async () => {
      PlayerModel.findOne = mockQuery(null);
      TeamModel.findOne = mockQuery(null);
      VoteModel.findOne = mockQuery(null);
      await expect(submitVote("g1", 1, "wrong_player", "t2")).rejects.toMatchObject({ code: "UNAUTHORIZED" });
    });
  });

  describe("7. Eliminated Teams & Ability Validation", () => {
    it("must reject eliminated teams from voting", async () => {
      PlayerModel.findOne = mockQuery({ _id: "p1", gameId: "g1", teamId: "t1" });
      TeamModel.findOne = mockQuery({ _id: "t1", gameId: "g1", eliminated: true });
      await expect(submitVote("g1", 1, "p1", "t2")).rejects.toMatchObject({ code: "FORBIDDEN" });
    });

    it("must reject eliminated teams from using abilities", async () => {
      PlayerModel.findOne = mockQuery({
        _id: "p1", gameId: "g1", teamId: "t1", role: "INSPECTOR", effectiveState: "SPECIAL", abilityUnlocked: true,
      });
      TeamModel.findById = mockQuery({ _id: "t1", eliminated: true });
      await expect(submitAbility("g1", 1, "p1", "t2")).rejects.toMatchObject({ code: "FORBIDDEN" });
    });

    it("must reject abilities that require a target when none is given", async () => {
      PlayerModel.findOne = mockQuery({
        _id: "p1", gameId: "g1", role: "SPECIAL_7", effectiveState: "SPECIAL", abilityUnlocked: true,
      });
      await expect(submitAbility("g1", 1, "p1")).rejects.toMatchObject({ code: "VALIDATION_ERROR" });
    });

    it("must reject unknown ability modes", async () => {
      PlayerModel.findOne = mockQuery({
        _id: "p1", gameId: "g1", role: "CORRUPTOR", effectiveState: "SPECIAL", abilityUnlocked: true,
      });
      await expect(submitAbility("g1", 1, "p1", "t2", "SABOTAGE" as any)).rejects.toMatchObject({ code: "VALIDATION_ERROR" });
    });

    it("must let WHISTLEBLOWER act without a target", async () => {
      PlayerModel.findOne = mockQuery({
        _id: "p1", gameId: "g1", role: "WHISTLEBLOWER", effectiveState: "SPECIAL", abilityUnlocked: true,
      });
      vi.mocked(ActionModel.create).mockResolvedValue({} as any);
      await expect(submitAbility("g1", 1, "p1")).resolves.toBeUndefined();
      expect(ActionModel.create).toHaveBeenCalledWith({
        gameId: "g1",
        round: 1,
        playerId: "p1",
        targetPlayerId: undefined,
        mode: undefined,
      });
    });

    it("must default CORRUPTOR mode to TRUST_DRAIN", async () => {
      const actor = { _id: "p1", gameId: "g1", role: "CORRUPTOR", effectiveState: "SPECIAL", abilityUnlocked: true };
      const target = { _id: "p2", gameId: "g1" };
      PlayerModel.findOne = vi.fn((filter: any) => mockQuery(filter._id ? actor : target)(filter));
      TeamModel.findOne = mockQuery({ _id: "t2", gameId: "g1", eliminated: false });
      vi.mocked(ActionModel.create).mockResolvedValue({} as any);
      await submitAbility("g1", 1, "p1", "t2");
      expect(ActionModel.create).toHaveBeenCalledWith(
        expect.objectContaining({ mode: "TRUST_DRAIN", targetPlayerId: "p2" }),
      );
    });
  });
});
