import { PlayerModel } from "../models/Player.js";
import { GameModel } from "../models/Game.js";
import { Types } from "mongoose";
import { ActionModel, TeamModel } from "../models/index.js";
import {
  EFFECT_CONFIG,
  TRUST_EVENTS,
  type AbilityMode,
  type PrivateResultOutcome,
  type Role,
} from "@dem-niem-tin/shared";
import { ServiceError } from "./errors.js";

export type NightAction = {
  playerId: string;
  targetId?: string;
  mode?: AbilityMode;
};

/** Roles whose ability must always carry a target team; WHISTLEBLOWER acts without one. */
export const TARGET_REQUIRED_ROLES: readonly Role[] = [
  "INSPECTOR",
  "LAW",
  "CORRUPTOR",
  "OVERSIGHT",
  "SPECIAL_6",
  "SPECIAL_7",
];

const ABILITY_MODES: readonly AbilityMode[] = ["TRUST_DRAIN", "INTERFERE"];

export async function submitAbility(
  gameId: string,
  round: number,
  playerId: string,
  targetTeamId?: string,
  mode?: AbilityMode,
): Promise<void> {
  const player = await PlayerModel.findOne({ _id: playerId, gameId })
    .select("+role +effectiveState +abilityUnlocked")
    .lean();
  if (!player) throw new ServiceError("UNAUTHORIZED", "Player is not part of this game");
  const activeTeam = await TeamModel.exists({ _id: player.teamId, gameId, eliminated: false });
  if (!activeTeam) throw new ServiceError("FORBIDDEN", "Eliminated players cannot use abilities");
  if (player.effectiveState !== "SPECIAL" || !player.abilityUnlocked) {
    throw new ServiceError("FORBIDDEN", "Ability is not unlocked");
  }

  const actorTeam = player.teamId ? await TeamModel.findById(player.teamId).lean() : null;
  if (actorTeam?.eliminated) {
    throw new ServiceError("FORBIDDEN", "Eliminated teams cannot use abilities");
  }

  const role = player.role as Role | undefined;
  if (mode !== undefined && !ABILITY_MODES.includes(mode)) {
    throw new ServiceError("VALIDATION_ERROR", "Ability mode is invalid");
  }
  if (role && TARGET_REQUIRED_ROLES.includes(role) && !targetTeamId) {
    throw new ServiceError("VALIDATION_ERROR", `Role ${role} requires a target team`);
  }

  // WHISTLEBLOWER leaks a case file and ignores any stray target.
  const requestedTargetTeamId = role === "WHISTLEBLOWER" ? undefined : targetTeamId;

  let targetPlayerId: Types.ObjectId | undefined;
  if (requestedTargetTeamId) {
    const [team, target] = await Promise.all([
      TeamModel.findOne({ _id: requestedTargetTeamId, gameId, eliminated: false }).lean(),
      PlayerModel.findOne({ gameId, teamId: requestedTargetTeamId }).lean(),
    ]);
    if (!team || !target) throw new ServiceError("VALIDATION_ERROR", "Ability target is invalid");
    targetPlayerId = target._id;
  }

  const effectiveMode: AbilityMode | undefined =
    role === "CORRUPTOR" ? (mode ?? "TRUST_DRAIN") : undefined;

  try {
    await ActionModel.create({ gameId, round, playerId, targetPlayerId, mode: effectiveMode });
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
    round,
    actions.map((action) => ({
      playerId: action.playerId.toString(),
      targetId: action.targetPlayerId?.toString(),
      mode: (action.mode as AbilityMode | null | undefined) ?? undefined,
    })),
  );
}

export async function resolveNightActions(
  gameId: string,
  round: number,
  actions: NightAction[],
): Promise<number> {
  const game = await GameModel.findById(gameId).exec();
  if (!game) throw new Error("Game not found");

  const players = await PlayerModel.find({ gameId })
    .select("+role +effectiveState +abilityUnlocked +privateResults")
    .exec();
  const teams = await TeamModel.find({ gameId }).lean();

  type PlayerDoc = (typeof players)[number];

  const teamNumberOf = (playerId: string): number | undefined => {
    const player = players.find((p) => p._id.toString() === playerId);
    const teamId = player?.teamId?.toString();
    if (!teamId) return undefined;
    return teams.find((t) => t._id.toString() === teamId)?.teamNumber;
  };

  // 1. Collect valid actions and attach role + mode metadata.
  const validActions: Array<NightAction & { role: Role; mode: AbilityMode }> = [];
  for (const action of actions) {
    const player = players.find((p) => p._id.toString() === action.playerId);
    if (!player || !player.role) continue;
    if (player.effectiveState === "CITIZEN" || !player.abilityUnlocked) continue;
    validActions.push({
      ...action,
      role: player.role as Role,
      mode: action.mode === "INTERFERE" ? "INTERFERE" : "TRUST_DRAIN",
    });
  }

  // 2. LAW protection resolves first.
  const protectedTargetIds = new Set<string>();
  for (const action of validActions) {
    if (action.role === "LAW" && action.targetId) protectedTargetIds.add(action.targetId);
  }

  // 3. CORRUPTOR interference set — blocked when the target is protected by LAW.
  const interferedTargetIds = new Set<string>();
  for (const action of validActions) {
    if (
      action.role === "CORRUPTOR" &&
      action.mode === "INTERFERE" &&
      action.targetId &&
      !protectedTargetIds.has(action.targetId)
    ) {
      interferedTargetIds.add(action.targetId);
    }
  }

  // Targets that an INSPECTOR actually investigates tonight (used to judge interference).
  const investigatedTargetIds = new Set<string>();
  for (const action of validActions) {
    if (action.role === "INSPECTOR" && action.targetId) investigatedTargetIds.add(action.targetId);
  }

  const newClues: Array<{
    id: string;
    title: string;
    description: string;
    visibility: "public" | "private";
    revealedAt: number;
  }> = [];
  let totalTrustDelta = 0;

  const pushResult = (
    actor: PlayerDoc,
    result: {
      type: string;
      outcome: PrivateResultOutcome;
      title: string;
      message: string;
      targetTeamNumber?: number;
    },
  ) => {
    actor.privateResults.push({
      id: new Types.ObjectId().toString(),
      type: result.type,
      outcome: result.outcome,
      title: result.title,
      message: result.message,
      round,
      targetTeamNumber: result.targetTeamNumber,
      createdAt: Date.now(),
    });
  };

  // 4. Resolve every action with structured, round-scoped private feedback.
  for (const action of validActions) {
    const actor = players.find((p) => p._id.toString() === action.playerId);
    if (!actor) continue;
    const targetTeamNumber = action.targetId ? teamNumberOf(action.targetId) : undefined;
    const number = targetTeamNumber ?? 0;

    switch (action.role) {
      case "CORRUPTOR": {
        if (!action.targetId) break;
        if (protectedTargetIds.has(action.targetId)) {
          pushResult(actor, {
            type: "ACTION_FAILED",
            outcome: "BLOCKED",
            title: EFFECT_CONFIG.corruptor.blockedTitle,
            message: EFFECT_CONFIG.corruptor.blockedMessage(number),
            targetTeamNumber,
          });
          break;
        }
        if (action.mode === "INTERFERE") {
          if (investigatedTargetIds.has(action.targetId)) {
            pushResult(actor, {
              type: "ACTION_SUCCESS",
              outcome: "SUCCESS",
              title: EFFECT_CONFIG.corruptor.interferenceSuccessTitle,
              message: EFFECT_CONFIG.corruptor.interferenceSuccessMessage(number),
              targetTeamNumber,
            });
          } else {
            pushResult(actor, {
              type: "ACTION_FAILED",
              outcome: "INFO",
              title: EFFECT_CONFIG.corruptor.interferenceWastedTitle,
              message: EFFECT_CONFIG.corruptor.interferenceWastedMessage(number),
              targetTeamNumber,
            });
          }
          break;
        }
        totalTrustDelta += TRUST_EVENTS.corruptionSuccess;
        pushResult(actor, {
          type: "ACTION_SUCCESS",
          outcome: "SUCCESS",
          title: EFFECT_CONFIG.corruptor.trustDrainTitle,
          message: EFFECT_CONFIG.corruptor.trustDrainMessage(number),
          targetTeamNumber,
        });
        break;
      }
      case "INSPECTOR": {
        if (!action.targetId) break;
        const target = players.find((p) => p._id.toString() === action.targetId);
        if (!target) break;
        const genuinelySuspicious =
          target.role === "CORRUPTOR" && !interferedTargetIds.has(action.targetId);
        const suspicious = (target.role === "CORRUPTOR") !== interferedTargetIds.has(action.targetId);
        if (genuinelySuspicious) totalTrustDelta += TRUST_EVENTS.correctInvestigation;
        pushResult(actor, {
          type: "INSPECTION_RESULT",
          outcome: suspicious ? "SUSPICIOUS" : "CLEAR",
          title: suspicious
            ? EFFECT_CONFIG.inspector.suspiciousTitle
            : EFFECT_CONFIG.inspector.clearTitle,
          message: suspicious
            ? EFFECT_CONFIG.inspector.suspiciousMessage(number)
            : EFFECT_CONFIG.inspector.clearMessage(number),
          targetTeamNumber,
        });
        break;
      }
      case "LAW": {
        if (!action.targetId) break;
        pushResult(actor, {
          type: "INFO",
          outcome: "INFO",
          title: EFFECT_CONFIG.law.protectedTitle,
          message: EFFECT_CONFIG.law.protectedMessage(number),
          targetTeamNumber,
        });
        break;
      }
      case "WHISTLEBLOWER": {
        newClues.push({
          id: new Types.ObjectId().toString(),
          title: EFFECT_CONFIG.whistleblower.clueTitle(round),
          description: EFFECT_CONFIG.whistleblower.clueDescription,
          visibility: EFFECT_CONFIG.whistleblower.visibility,
          revealedAt: Date.now(),
        });
        pushResult(actor, {
          type: "INFO",
          outcome: "INFO",
          title: EFFECT_CONFIG.whistleblower.revealedTitle,
          message: EFFECT_CONFIG.whistleblower.publicMessage,
        });
        break;
      }
      case "OVERSIGHT": {
        if (!action.targetId) break;
        const targetActed = validActions.some((other) => other.playerId === action.targetId);
        if (targetActed) totalTrustDelta += TRUST_EVENTS.verificationSuccess;
        pushResult(actor, {
          type: "INFO",
          outcome: "INFO",
          title: targetActed
            ? EFFECT_CONFIG.oversight.actedTitle
            : EFFECT_CONFIG.oversight.notActedTitle,
          message: targetActed
            ? EFFECT_CONFIG.oversight.actedMessage(number)
            : EFFECT_CONFIG.oversight.notActedMessage(number),
          targetTeamNumber,
        });
        break;
      }
      case "SPECIAL_6": {
        if (!action.targetId) break;
        const target = players.find((p) => p._id.toString() === action.targetId);
        if (!target) break;
        const suspicious = target.role === "CORRUPTOR";
        pushResult(actor, {
          type: "INSPECTION_RESULT",
          outcome: suspicious ? "SUSPICIOUS" : "CLEAR",
          title: suspicious
            ? EFFECT_CONFIG.special6.suspiciousTitle
            : EFFECT_CONFIG.special6.clearTitle,
          message: suspicious
            ? EFFECT_CONFIG.special6.suspiciousMessage(number)
            : EFFECT_CONFIG.special6.clearMessage(number),
          targetTeamNumber,
        });
        break;
      }
      case "SPECIAL_7": {
        if (!action.targetId || targetTeamNumber === undefined) break;
        newClues.push({
          id: new Types.ObjectId().toString(),
          title: EFFECT_CONFIG.special7.clueTitle,
          description: EFFECT_CONFIG.special7.publicClueDescription(targetTeamNumber),
          visibility: "public",
          revealedAt: Date.now(),
        });
        pushResult(actor, {
          type: "INFO",
          outcome: "SUCCESS",
          title: EFFECT_CONFIG.special7.successTitle,
          message: EFFECT_CONFIG.special7.successMessage(targetTeamNumber),
          targetTeamNumber,
        });
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
      $push: { publicClues: { $each: newClues } },
    });
  }

  return totalTrustDelta;
}
