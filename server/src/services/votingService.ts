import { VoteModel } from "../models/Vote.js";
import { GameModel } from "../models/Game.js";
import { PlayerModel } from "../models/Player.js";
import { TeamModel } from "../models/Team.js";
import { Types } from "mongoose";
import { ServiceError } from "./errors.js";

export async function submitVote(gameId: string, round: number, voterId: string, targetTeamId: string): Promise<void> {
  const [voter, target, targetTeam] = await Promise.all([
    PlayerModel.findOne({ _id: voterId, gameId }).lean(),
    PlayerModel.findOne({ gameId, teamId: targetTeamId }).lean(),
    TeamModel.findOne({ _id: targetTeamId, gameId, eliminated: false }).lean(),
  ]);
  if (!voter) throw new ServiceError("UNAUTHORIZED", "Player is not part of this game");
  if (!target || !targetTeam) throw new ServiceError("VALIDATION_ERROR", "Vote target is invalid");
  try {
    await VoteModel.create({ gameId, round, voterId, targetId: target._id });
  } catch (error) {
    if (typeof error === "object" && error && "code" in error && error.code === 11000) {
      throw new ServiceError("CONFLICT", "Player has already voted in this round");
    }
    throw error;
  }
}

export async function tallyVotes(gameId: string, round: number): Promise<number> {
  const votes = await VoteModel.find({ gameId, round }).exec();
  if (votes.length === 0) return 0;

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
  if (!game) return 0;

  let trustDelta = 0;

  if (!isTie && eliminatedId) {
    const eliminatedPlayer = await PlayerModel.findById(eliminatedId).select("+faction").exec();
    if (eliminatedPlayer) {
      if (eliminatedPlayer.faction === "TRUST") {
        trustDelta = -10;
      } else if (eliminatedPlayer.faction === "CORRUPTION") {
        trustDelta = 10;
      }
      await TeamModel.updateOne({ _id: eliminatedPlayer.teamId, gameId }, { $set: { eliminated: true } });

      game.publicEvents.push({
        id: new Types.ObjectId().toString(),
        type: "ELIMINATION",
        message: "Một đội đã bị loại sau biểu quyết.",
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
  return trustDelta;
}
