import { VoteModel } from "../models/Vote.js";
import { GameModel } from "../models/Game.js";
import { PlayerModel } from "../models/Player.js";
import { Types } from "mongoose";

export async function submitVote(gameId: string, round: number, voterId: string, targetId: string): Promise<void> {
  const game = await GameModel.findById(gameId).exec();
  if (!game || game.phase !== "VOTING") {
    throw new Error("Invalid phase or game not found");
  }

  const existingVote = await VoteModel.findOne({ gameId, round, voterId }).exec();
  if (existingVote) {
    throw new Error("Player has already voted in this round");
  }

  const target = await PlayerModel.findById(targetId).exec();
  if (!target) {
    throw new Error("Invalid target");
  }

  await VoteModel.create({
    gameId,
    round,
    voterId,
    targetId
  });
}

export async function tallyVotes(gameId: string, round: number): Promise<void> {
  const votes = await VoteModel.find({ gameId, round }).exec();
  if (votes.length === 0) return;

  const voteCounts: Record<string, number> = {};
  for (const vote of votes) {
    const tId = vote.targetId.toString();
    voteCounts[tId] = (voteCounts[tId] || 0) + 1;
  }

  let maxVotes = 0;
  let eliminatedId: string | null = null;
  let isTie = false;

  for (const [tId, count] of Object.entries(voteCounts)) {
    if (count > maxVotes) {
      maxVotes = count;
      eliminatedId = tId;
      isTie = false;
    } else if (count === maxVotes) {
      isTie = true;
    }
  }

  const game = await GameModel.findById(gameId).exec();
  if (!game) return;

  if (!isTie && eliminatedId) {
    const eliminatedPlayer = await PlayerModel.findById(eliminatedId).select("+faction").exec();
    if (eliminatedPlayer) {
      if (eliminatedPlayer.faction === "TRUST") {
        game.trust = Math.max(0, game.trust - 10);
      } else if (eliminatedPlayer.faction === "CORRUPTION") {
        game.trust = Math.min(100, game.trust + 10);
      }

      game.publicEvents.push({
        id: new Types.ObjectId().toString(),
        type: "ELIMINATION",
        message: `A player was eliminated. Trust is now ${game.trust}`,
        timestamp: Date.now()
      });
    }
  } else {
    game.publicEvents.push({
      id: new Types.ObjectId().toString(),
      type: "VOTE_TIE",
      message: "The vote ended in a tie. No one was eliminated.",
      timestamp: Date.now()
    });
  }

  await game.save();
}
