import mongoose from "mongoose";
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { GameModel, PlayerModel, QuestionModel, RoomModel, TeamModel } from "../src/models/index.js";
import { GameRuntimeService } from "../src/services/gameRuntimeService.js";
import { RoomService } from "../src/services/roomService.js";
import { assignRoles } from "../src/services/roleService.js";

const runDatabaseTests = process.env.RUN_DB_INTEGRATION === "true";
const describeDatabase = runDatabaseTests ? describe : describe.skip;
const databaseName = `dem-niem-tin-fullflow-${process.pid}`;

describeDatabase("Full Game Flow (1 Host + 8 Players)", () => {
  const roomService = new RoomService();
  
  beforeAll(async () => {
    await mongoose.connect(process.env.TEST_MONGODB_URI ?? "mongodb://127.0.0.1:27017", {
      dbName: databaseName,
    });
  });

  afterEach(async () => {
    await mongoose.connection.db?.dropDatabase();
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });

  async function seedQuestions() {
    await QuestionModel.insertMany(
      ["easy", "medium", "hard"].map((difficulty) => ({
        category: "Test",
        difficulty,
        text: `Integration ${difficulty} question?`,
        options: ["A", "B", "C", "D"],
        correctOption: 0,
        explanation: "Test explanation"
      })),
    );
  }

  it("should complete a full 3-round game", async () => {
    await seedQuestions();

    // 1. Host creates room
    const created = await roomService.createRoom("Host");
    
    // 2. 8 Players join and set ready
    const players = [];
    for (let teamNumber = 1; teamNumber <= 8; teamNumber++) {
      const joined = await roomService.joinRoom({
        roomCode: created.roomCode,
        teamNumber,
        socketId: `socket-${teamNumber}`,
      });
      await roomService.setReady(created.roomId, joined.playerId, true);
      players.push(joined);
    }

    // 3. Start Game
    const runtimeService = new GameRuntimeService(roomService, vi.fn());
    await runtimeService.authenticateHost(created.roomCode, created.sessionToken);
    const startedState = await runtimeService.startGame(created.roomId);
    
    expect(startedState.phase).toBe("LOBBY");
    
    // Force transition to ROLE_REVEAL, then NIGHT_KNOWLEDGE
    await runtimeService.skipTimer(created.roomId); // to ROLE_REVEAL
    const nightState = await runtimeService.skipTimer(created.roomId); // to NIGHT_KNOWLEDGE
    expect(nightState.phase).toBe("NIGHT");

    const game = await GameModel.findOne({ roomId: created.roomId }).lean();
    expect(game).not.toBeNull();

    // Simulate 3 rounds
    for (let round = 1; round <= 3; round++) {
      // 4. Night Knowledge Phase: Players answer questions
      const gameDoc = await GameModel.findOne({ roomId: created.roomId }).lean();
      expect(gameDoc?.activeQuestion).toBeDefined();

      for (const p of players) {
        await runtimeService.answerQuestion(created.roomId, p.playerId, { 
          questionId: gameDoc!.activeQuestion!.id, 
          selectedOption: 0 
        });
      }

      // Phase should auto advance to NIGHT_ABILITY
      const postAnswerState = await GameModel.findOne({ roomId: created.roomId }).lean();
      expect(postAnswerState?.phase).toBe("NIGHT_ABILITY");

      // 5. Night Ability Phase: Players use abilities (or skip)
      for (const p of players) {
        // Just send empty target to pass the phase
        await runtimeService.useAbility(created.roomId, p.playerId, { targetTeamId: undefined });
      }

      // Phase should auto advance to NIGHT_RESOLUTION
      const postAbilityState = await GameModel.findOne({ roomId: created.roomId }).lean();
      expect(postAbilityState?.phase).toBe("NIGHT_RESOLUTION");

      // Skip to DAY_RESULT -> DISCUSSION -> VOTING
      await runtimeService.skipTimer(created.roomId); // to DAY_RESULT
      await runtimeService.skipTimer(created.roomId); // to DISCUSSION
      await runtimeService.skipTimer(created.roomId); // to VOTING

      const votePhaseState = await GameModel.findOne({ roomId: created.roomId }).lean();
      expect(votePhaseState?.phase).toBe("VOTING");

      // 6. Voting Phase
      // We will have all players vote for team 2
      const targetTeam = await TeamModel.findOne({ gameId: game!._id, teamNumber: 2 }).lean();
      
      let votesCount = 0;
      for (const p of players) {
        const team = await TeamModel.findOne({ gameId: game!._id, _id: p.teamId }).lean();
        if (team && !team.eliminated) {
           await runtimeService.submitVote(created.roomId, p.playerId, { targetTeamId: targetTeam!._id.toString() });
           votesCount++;
        }
      }

      // 7. Vote Result & Trust Update
      const postVoteState = await GameModel.findOne({ roomId: created.roomId }).lean();
      expect(postVoteState?.phase).toBe("VOTE_RESULT");

      await runtimeService.skipTimer(created.roomId); // to TRUST_UPDATE
      const postTrustState = await GameModel.findOne({ roomId: created.roomId }).lean();
      expect(postTrustState?.phase).toBe("TRUST_UPDATE");
      
      if (round < 3) {
        await runtimeService.skipTimer(created.roomId); // to NEXT_ROUND
        await runtimeService.skipTimer(created.roomId); // to NIGHT_KNOWLEDGE
      } else {
        await runtimeService.skipTimer(created.roomId); // to FINAL
      }
    }

    const finalState = await GameModel.findOne({ roomId: created.roomId }).lean();
    expect(finalState?.phase).toBe("FINAL");
    
    const finalPublicState = await runtimeService.reconnectHost(created.roomId);
    expect(finalPublicState?.factionWin).toBeDefined();
  });
});
