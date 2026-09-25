import mongoose from "mongoose";
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import type { Role } from "@dem-niem-tin/shared";
import { GameModel, PlayerModel, QuestionModel, RoomModel, TeamModel } from "../src/models/index.js";
import { GameRuntimeService } from "../src/services/gameRuntimeService.js";
import { RoomService } from "../src/services/roomService.js";
import { assignRoles } from "../src/services/roleService.js";
import { TARGET_REQUIRED_ROLES } from "../src/services/abilityService.js";

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
        correctAnswer: "A",
        explanation: "Test explanation"
      })),
    );
  }

  it("should complete a full 3-round game", async () => {
    await seedQuestions();

    // 1. Host creates room
    const created = await roomService.createRoom("Host");
    
    // 2. Eight teams join in order and the server assigns seat numbers 1..8
    const players = [];
    for (let seat = 1; seat <= 8; seat++) {
      const joined = await roomService.joinRoom({
        roomCode: created.roomCode,
        displayName: `Đội ${seat}`,
        socketId: `socket-${seat}`,
      });
      expect(joined.teamNumber).toBe(seat);
      await roomService.setReady(created.roomId, joined.playerId, true);
      players.push(joined);
    }

    // 3. Start Game
    const runtimeService = new GameRuntimeService(roomService, vi.fn());
    await runtimeService.authenticateHost(created.roomCode, created.sessionToken);
    const startedState = await runtimeService.startGame(created.roomId);
    
    expect(startedState.phase).toBe("LOBBY");
    
    // startGame already entered ROLE_REVEAL, so a single skip reaches the first knowledge night.
    const nightState = await runtimeService.skipTimer(created.roomId); // to NIGHT_KNOWLEDGE
    expect(nightState.gamePhase).toBe("NIGHT_KNOWLEDGE");
    expect(nightState.phase).toBe("NIGHT");

    const game = await GameModel.findOne({ roomId: created.roomId }).lean();
    expect(game).not.toBeNull();

    // Simulate 3 rounds
    for (let round = 1; round <= 3; round++) {
      // 4. Night Knowledge Phase: Players answer questions
      const gameDoc = await GameModel.findOne({ roomId: created.roomId }).lean();
      expect(gameDoc?.activeQuestion).toBeDefined();

      for (const p of players) {
        const team = await TeamModel.findOne({ gameId: game!._id, _id: p.teamId }).lean();
        if (!team || team.eliminated) continue; // eliminated teams are spectators
        await runtimeService.answerQuestion(created.roomId, p.playerId, { 
          questionId: gameDoc!.activeQuestion!.id, 
          selectedOption: 0 
        });
      }

      // Phase should auto advance to NIGHT_ABILITY
      const postAnswerState = await GameModel.findOne({ roomId: created.roomId }).lean();
      expect(postAnswerState?.phase).toBe("NIGHT_ABILITY");

      // 5. Night Ability Phase: every active team submits its ability (targets where required)
      for (const p of players) {
        const team = await TeamModel.findOne({ gameId: game!._id, _id: p.teamId }).lean();
        if (!team || team.eliminated) continue; // eliminated teams are spectators
        const player = await PlayerModel.findById(p.playerId).select("+role").lean();
        const role = player?.role as Role | undefined;
        let targetTeamId: string | undefined;
        if (role && TARGET_REQUIRED_ROLES.includes(role)) {
          const abilityTarget = await TeamModel.findOne({
            gameId: game!._id,
            eliminated: false,
            teamNumber: { $ne: team.teamNumber },
          }).lean();
          expect(abilityTarget).not.toBeNull();
          targetTeamId = abilityTarget!._id.toString();
        }
        await runtimeService.useAbility(created.roomId, p.playerId, { targetTeamId });
      }

      // Host skips the remaining ability time: NIGHT_ABILITY -> NIGHT_RESOLUTION
      await runtimeService.skipTimer(created.roomId);
      const postAbilityState = await GameModel.findOne({ roomId: created.roomId }).lean();
      expect(postAbilityState?.phase).toBe("NIGHT_RESOLUTION");

      // Skip to DAY_RESULT -> DISCUSSION -> VOTING
      await runtimeService.skipTimer(created.roomId); // to DAY_RESULT
      await runtimeService.skipTimer(created.roomId); // to DISCUSSION
      await runtimeService.skipTimer(created.roomId); // to VOTING

      const votePhaseState = await GameModel.findOne({ roomId: created.roomId }).lean();
      expect(votePhaseState?.phase).toBe("VOTING");

      // 6. Voting Phase — each round eliminates the next team (2, 3, 4)
      const targetTeamNumber = round + 1;
      const targetTeam = await TeamModel.findOne({
        gameId: game!._id,
        teamNumber: targetTeamNumber,
        eliminated: false,
      }).lean();
      expect(targetTeam).not.toBeNull();
      
      let votesCount = 0;
      for (const p of players) {
        const team = await TeamModel.findOne({ gameId: game!._id, _id: p.teamId }).lean();
        if (!team || team.eliminated) continue;
        // The ballot rejects self-votes, so the targeted team votes for a rival instead.
        const voteTarget = team.teamNumber === targetTeamNumber
          ? await TeamModel.findOne({
              gameId: game!._id,
              eliminated: false,
              teamNumber: { $ne: team.teamNumber },
            }).lean()
          : targetTeam;
        expect(voteTarget).not.toBeNull();
        await runtimeService.submitVote(created.roomId, p.playerId, { targetTeamId: voteTarget!._id.toString() });
        votesCount++;
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
