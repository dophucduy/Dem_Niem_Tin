import { PlayerModel } from "../models/Player.js";
import { GameModel } from "../models/Game.js";
import { Types } from "mongoose";

export type NightAction = {
  playerId: string;
  targetId?: string;
};

export async function resolveNightActions(gameId: string, actions: NightAction[]): Promise<void> {
  const game = await GameModel.findById(gameId).exec();
  if (!game) throw new Error("Game not found");

  const players = await PlayerModel.find({ gameId }).select("+role +effectiveState +abilityUnlocked").exec();
  
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
