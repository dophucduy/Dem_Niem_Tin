import { PlayerModel } from "../models/Player.js";
import { GameModel } from "../models/Game.js";
import { Types } from "mongoose";
import { ActionModel, TeamModel } from "../models/index.js";
import { ServiceError } from "./errors.js";

export type NightAction = {
  playerId: string;
  targetId?: string;
};

export async function submitAbility(
  gameId: string,
  round: number,
  playerId: string,
  targetTeamId?: string,
): Promise<void> {
  const player = await PlayerModel.findOne({ _id: playerId, gameId })
    .select("+effectiveState +abilityUnlocked")
    .lean();
  if (!player) throw new ServiceError("UNAUTHORIZED", "Player is not part of this game");
  if (player.effectiveState !== "SPECIAL" || !player.abilityUnlocked) {
    throw new ServiceError("FORBIDDEN", "Ability is not unlocked");
  }

  let targetPlayerId: Types.ObjectId | undefined;
  if (targetTeamId) {
    const [team, target] = await Promise.all([
      TeamModel.findOne({ _id: targetTeamId, gameId, eliminated: false }).lean(),
      PlayerModel.findOne({ gameId, teamId: targetTeamId }).lean(),
    ]);
    if (!team || !target) throw new ServiceError("VALIDATION_ERROR", "Ability target is invalid");
    targetPlayerId = target._id;
  }

  try {
    await ActionModel.create({ gameId, round, playerId, targetPlayerId });
  } catch (error) {
    if (typeof error === "object" && error && "code" in error && error.code === 11000) {
      throw new ServiceError("CONFLICT", "Ability already submitted this round");
    }
    throw error;
  }
}

export async function resolveStoredNightActions(gameId: string, round: number): Promise<void> {
  const actions = await ActionModel.find({ gameId, round }).lean();
  await resolveNightActions(
    gameId,
    actions.map((action) => ({
      playerId: action.playerId.toString(),
      targetId: action.targetPlayerId?.toString(),
    })),
  );
}

export async function resolveNightActions(gameId: string, actions: NightAction[]): Promise<void> {
  const game = await GameModel.findById(gameId).exec();
  if (!game) throw new Error("Game not found");

  const players = await PlayerModel.find({ gameId })
    .select("+role +effectiveState +abilityUnlocked +privateResults")
    .exec();
  
  // 1. Validate actions & collect targets
  const validActions = [];
  for (const action of actions) {
    const player = players.find(p => p._id.toString() === action.playerId);
    if (!player || player.effectiveState === "CITIZEN" || !player.abilityUnlocked) continue;
    validActions.push({ ...action, role: player.role });
  }

  const protectedTargetIds = new Set<string>();
  
  // 2. Pre-process (Protection - LAW)
  for (const action of validActions) {
    if (action.role === "LAW" && action.targetId) {
      protectedTargetIds.add(action.targetId);
    }
  }

  const newClues = [];

  // 3. Process actions
  for (const action of validActions) {
    const actor = players.find(p => p._id.toString() === action.playerId)!;
    
    switch (action.role) {
      case "CORRUPTOR": {
        if (!action.targetId) break;
        if (protectedTargetIds.has(action.targetId)) {
          actor.privateResults.push({
            id: new Types.ObjectId().toString(),
            type: "ACTION_FAILED",
            message: "Your target was protected.",
            createdAt: Date.now()
          });
        } else {
          actor.privateResults.push({
            id: new Types.ObjectId().toString(),
            type: "ACTION_SUCCESS",
            message: "You successfully targeted the player.",
            createdAt: Date.now()
          });
        }
        break;
      }
      case "INSPECTOR": {
        if (!action.targetId) break;
        const target = players.find(p => p._id.toString() === action.targetId);
        if (target) {
          actor.privateResults.push({
            id: new Types.ObjectId().toString(),
            type: "INSPECTION_RESULT",
            message: `Target role is ${target.role}`, // Basic implementation
            createdAt: Date.now()
          });
        }
        break;
      }
      case "WHISTLEBLOWER": {
        newClues.push({
          id: new Types.ObjectId().toString(),
          title: "Whistleblower Leak",
          description: "A piece of information has been leaked.",
          visibility: "public",
          revealedAt: Date.now()
        });
        break;
      }
      case "OVERSIGHT":
      case "SPECIAL_6":
      case "SPECIAL_7":
        actor.privateResults.push({
          id: new Types.ObjectId().toString(),
          type: "INFO",
          message: `${action.role} action recorded.`,
          createdAt: Date.now()
        });
        break;
    }
  }

  // Save all player state changes (privateResults)
  for (const player of players) {
    await player.save();
  }

  if (newClues.length > 0) {
    await GameModel.findByIdAndUpdate(gameId, {
      $push: { publicClues: { $each: newClues } }
    });
  }
}
