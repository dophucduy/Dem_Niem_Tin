import { VoteModel } from "../models/Vote.js";
import { GameModel } from "../models/Game.js";
import { PlayerModel } from "../models/Player.js";
import { TeamModel } from "../models/Team.js";
import { Types } from "mongoose";
import { ServiceError } from "./errors.js";

export type VoteTallyResult = {
  trustDelta: number;
  eliminatedTeamId?: string;
};

export async function submitVote(gameId: string, round: number, voterId: string, targetTeamId: string): Promise<void> {
  const voter = await PlayerModel.findOne({ _id: voterId, gameId }).lean();
  if (!voter) throw new ServiceError("UNAUTHORIZED", "Player is not part of this game");

  const [voterTeam, targetTeam, target] = await Promise.all([
    TeamModel.findOne({ _id: voter.teamId, gameId, eliminated: false }).lean(),
    TeamModel.findOne({ _id: targetTeamId, gameId, eliminated: false }).lean(),
    PlayerModel.findOne({ gameId, teamId: targetTeamId }).select("_id teamId").lean(),
  ]);
  if (!voterTeam) throw new ServiceError("UNAUTHORIZED", "Eliminated players cannot vote");
  if (!target || !targetTeam) throw new ServiceError("VALIDATION_ERROR", "Vote target is invalid");
  if (voter.teamId.toString() === targetTeamId) {
    throw new ServiceError("VALIDATION_ERROR", "Players cannot vote for their own team");
  }
  try {
    await VoteModel.create({ gameId, round, voterId, targetId: target._id });
  } catch (error) {
    if (typeof error === "object" && error && "code" in error && error.code === 11000) {
      throw new ServiceError("CONFLICT", "Player has already voted in this round");
    }
    throw error;
  }
}

export async function tallyVotes(gameId: string, round: number): Promise<VoteTallyResult> {
  const votes = await VoteModel.find({ gameId, round }).exec();
  if (votes.length === 0) return { trustDelta: 0 };

  const game = await GameModel.findById(gameId).exec();
  if (!game) return { trustDelta: 0 };

  const activeTeams = await TeamModel.find({ gameId, eliminated: false }).select("_id teamNumber displayName").lean();
  const activeTeamById = new Map(activeTeams.map((team) => [team._id.toString(), team]));
  const activePlayers = await PlayerModel.find({ gameId, teamId: { $in: activeTeams.map((team) => team._id) } })
    .select("_id teamId +faction")
    .lean();
  const activePlayerById = new Map(activePlayers.map((player) => [player._id.toString(), player]));

  const voteCounts: Record<string, number> = {};
  for (const vote of votes) {
    const voter = activePlayerById.get(vote.voterId.toString());
    const target = activePlayerById.get(vote.targetId.toString());
    if (!voter || !target || voter.teamId.toString() === target.teamId.toString()) continue;
    const teamId = target.teamId.toString();
    voteCounts[teamId] = (voteCounts[teamId] || 0) + 1;
  }

  const rankedTeams = Object.entries(voteCounts).sort((a, b) => b[1] - a[1]);
  const topVotes = rankedTeams[0]?.[1] ?? 0;
  const tiedAtTop = topVotes > 0 && rankedTeams.filter(([, count]) => count === topVotes).length > 1;
  const eliminatedTeamId = !tiedAtTop ? rankedTeams[0]?.[0] : undefined;
  let trustDelta = 0;
  let eliminatedTeam;
  let eliminatedFaction;

  if (eliminatedTeamId) {
    eliminatedTeam = activeTeamById.get(eliminatedTeamId);
    const eliminatedPlayer = activePlayers.find((player) => player.teamId.toString() === eliminatedTeamId);
    eliminatedFaction = eliminatedPlayer?.faction;
    if (eliminatedFaction === "TRUST") trustDelta = -10;
    if (eliminatedFaction === "CORRUPTION") trustDelta = 10;
    await TeamModel.updateOne({ _id: eliminatedTeamId, gameId, eliminated: false }, { $set: { eliminated: true } });

    game.publicEvents.push({
      id: new Types.ObjectId().toString(),
      type: "ELIMINATION",
      message: JSON.stringify({
        round,
        eliminatedTeamId,
        eliminatedTeamNumber: eliminatedTeam?.teamNumber,
        eliminatedTeamName: eliminatedTeam?.displayName,
        votesReceived: topVotes,
        faction: eliminatedFaction,
        trustDelta,
        isTie: false,
        voteDistribution: activeTeams.map((team) => ({
          teamNumber: team.teamNumber,
          teamName: team.displayName,
          votes: voteCounts[team._id.toString()] ?? 0,
        })),
      }),
      timestamp: Date.now(),
    });
  } else if (tiedAtTop) {
    game.publicEvents.push({
      id: new Types.ObjectId().toString(),
      type: "VOTE_TIE",
      message: JSON.stringify({
        round,
        isTie: true,
        voteDistribution: activeTeams.map((team) => ({
          teamNumber: team.teamNumber,
          teamName: team.displayName,
          votes: voteCounts[team._id.toString()] ?? 0,
        })),
      }),
      timestamp: Date.now()
    });
  }

  await game.save();
  return { trustDelta, eliminatedTeamId };
}
