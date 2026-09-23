import { PlayerModel } from "../models/Player.js";
import { GameModel } from "../models/Game.js";
import { Types } from "mongoose";
import { ActionModel, TeamModel } from "../models/index.js";
import { EFFECT_CONFIG, TRUST_EVENTS } from "@dem-niem-tin/shared";
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

export async function resolveStoredNightActions(gameId: string, round: number): Promise<number> {
  const actions = await ActionModel.find({ gameId, round }).lean();
  return resolveNightActions(
    gameId,
    actions.map((action) => ({
      playerId: action.playerId.toString(),
      targetId: action.targetPlayerId?.toString(),
    })),
  );
}

export async function resolveNightActions(gameId: string, actions: NightAction[]): Promise<number> {
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

  let totalTrustDelta = 0;

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
          totalTrustDelta += TRUST_EVENTS.corruptionSuccess;
          actor.privateResults.push({
            id: new Types.ObjectId().toString(),
            type: "ACTION_SUCCESS",
            message: EFFECT_CONFIG.corruptor.message,
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
            message: target.role === "CORRUPTOR" ? "CÓ DẤU HIỆU ĐÁNG NGỜ" : "CHƯA PHÁT HIỆN DẤU HIỆU",
            createdAt: Date.now()
          });
        }
        break;
      }
      case "WHISTLEBLOWER": {
        newClues.push({
          id: new Types.ObjectId().toString(),
          title: "Whistleblower Leak",
          description: "Một manh mối về sự bất thường đã được tiết lộ.",
          visibility: "public",
          revealedAt: Date.now()
        });
        break;
      }
      case "OVERSIGHT":
        actor.privateResults.push({
          id: new Types.ObjectId().toString(),
          type: "INFO",
          message: EFFECT_CONFIG.oversight.message,
          createdAt: Date.now()
        });
        break;
      case "SPECIAL_6": {
        if (!action.targetId) break;
        const target = players.find(p => p._id.toString() === action.targetId);
        if (target) {
          const isCorruptor = target.role === "CORRUPTOR";
          actor.privateResults.push({
            id: new Types.ObjectId().toString(),
            type: "INFO",
            message: isCorruptor ? EFFECT_CONFIG.special6.corruptorMessage : EFFECT_CONFIG.special6.defaultMessage,
            createdAt: Date.now()
          });
        }
        break;
      }
      case "SPECIAL_7": {
        if (!action.targetId) break;
        const targetTeam = await TeamModel.findById(players.find(p => p._id.toString() === action.targetId)?.teamId).lean();
        if (targetTeam) {
          newClues.push({
            id: new Types.ObjectId().toString(),
            title: EFFECT_CONFIG.special7.publicClueTitle,
            description: EFFECT_CONFIG.special7.publicClueDescription(targetTeam.displayName || targetTeam.teamNumber.toString()),
            visibility: "public",
            revealedAt: Date.now()
          });
          actor.privateResults.push({
            id: new Types.ObjectId().toString(),
            type: "INFO",
            message: "Bạn đã phát lệnh yêu cầu minh bạch công khai.",
            createdAt: Date.now()
          });
        }
        break;
      }
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

  return totalTrustDelta;
}
