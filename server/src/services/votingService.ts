import { VoteModel } from "../models/Vote.js";
import { GameModel } from "../models/Game.js";
import { PlayerModel } from "../models/Player.js";
import { TeamModel } from "../models/Team.js";
import { Types } from "mongoose";
import type { VoteDistributionEntry, VoteResultDetails } from "@dem-niem-tin/shared";
import { ServiceError } from "./errors.js";

export async function submitVote(gameId: string, round: number, voterId: string, targetTeamId: string): Promise<void> {
  const voter = await PlayerModel.findOne({ _id: voterId, gameId }).lean();
  if (!voter) throw new ServiceError("UNAUTHORIZED", "Player is not part of this game");

  const voterTeam = voter.teamId ? await TeamModel.findOne({ _id: voter.teamId, gameId }).lean() : null;
  if (voterTeam?.eliminated) throw new ServiceError("FORBIDDEN", "Eliminated teams cannot vote");

  const [target, targetTeam] = await Promise.all([
    PlayerModel.findOne({ gameId, teamId: targetTeamId }).lean(),
    TeamModel.findOne({ _id: targetTeamId, gameId, eliminated: false }).lean(),
  ]);
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

/** Resolves vote targets to public team info for the structured result payload. */
async function resolveVoteTargets(gameId: string, voteCounts: Record<string, number>) {
  const targetIds = Object.keys(voteCounts);
  const [players, teams] = await Promise.all([
    PlayerModel.find({ _id: { $in: targetIds } }).lean(),
    TeamModel.find({ gameId }).lean(),
  ]);

  const byPlayerId = new Map<string, { teamNumber: number; displayName: string }>();
  for (const player of players ?? []) {
    const team = (teams ?? []).find((candidate) => candidate._id.toString() === player.teamId.toString());
    if (team) {
      byPlayerId.set(player._id.toString(), {
        teamNumber: team.teamNumber,
        displayName: team.displayName,
      });
    }
  }

  const voteDistribution: VoteDistributionEntry[] = targetIds
    .map((targetId) => ({
      teamNumber: byPlayerId.get(targetId)?.teamNumber ?? 0,
      displayName: byPlayerId.get(targetId)?.displayName ?? "",
      votes: voteCounts[targetId] ?? 0,
    }))
    .sort((a, b) => b.votes - a.votes);

  return { byPlayerId, voteDistribution };
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
  const { byPlayerId, voteDistribution } = await resolveVoteTargets(gameId, voteCounts);

  if (!isTie && eliminatedId) {
    const eliminatedPlayer = await PlayerModel.findById(eliminatedId).select("+faction +role").exec();
    if (eliminatedPlayer) {
      if (eliminatedPlayer.faction === "TRUST") {
        trustDelta = -10;
      } else if (eliminatedPlayer.faction === "CORRUPTION") {
        trustDelta = 10;
      }
      await TeamModel.updateOne({ _id: eliminatedPlayer.teamId, gameId }, { $set: { eliminated: true } });

      const eliminatedInfo = byPlayerId.get(eliminatedId);
      const details: VoteResultDetails = {
        round,
        isTie: false,
        votesReceived: voteCounts[eliminatedId] ?? 0,
        voteDistribution,
        eliminatedTeamNumber: eliminatedInfo?.teamNumber,
        eliminatedTeamName: eliminatedInfo?.displayName,
        faction: (eliminatedPlayer.faction as VoteResultDetails["faction"]) ?? undefined,
        role: (eliminatedPlayer.role as VoteResultDetails["role"]) ?? undefined,
        trustDelta,
      };

      game.publicEvents.push({
        id: new Types.ObjectId().toString(),
        type: "VOTE_RESULT",
        message: `ĐỘI ${eliminatedInfo?.teamNumber ?? "?"} đã bị loại sau biểu quyết.`,
        timestamp: Date.now(),
        data: JSON.stringify(details),
      });
    }
  } else {
    const details: VoteResultDetails = {
      round,
      isTie: true,
      votesReceived: maxVotes,
      voteDistribution,
      trustDelta: 0,
    };
    game.publicEvents.push({
      id: new Types.ObjectId().toString(),
      type: "VOTE_TIE",
      message: "Phiếu hòa — không đội nào bị loại trong đêm nay.",
      timestamp: Date.now(),
      data: JSON.stringify(details),
    });
  }

  await game.save();
  return trustDelta;
}
