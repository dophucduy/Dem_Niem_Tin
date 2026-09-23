import { PlayerModel } from "../models/Player.js";
import { ROLE_DISTRIBUTION, type Role, type Faction, type PrivatePlayerState } from "@dem-niem-tin/shared";

function shuffle<T>(array: readonly T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function getFactionForRole(role: Role): Faction {
  return role === "CORRUPTOR" ? "CORRUPTION" : "TRUST";
}

export async function assignRoles(gameId: string): Promise<void> {
  const players = await PlayerModel.find({ gameId }).exec();
  if (players.length !== 8) {
    throw new Error("Game must have exactly 8 players to assign roles");
  }

  const shuffledRoles = shuffle(ROLE_DISTRIBUTION);

  const bulkOps = players.map((player, index) => {
    const role = shuffledRoles[index];
    const faction = getFactionForRole(role);
    return {
      updateOne: {
        filter: { _id: player._id },
        update: { 
          $set: { 
            role, 
            faction, 
            effectiveState: "SPECIAL" as const,
            abilityUnlocked: false,
            privateResults: []
          } 
        },
      },
    };
  });

  await PlayerModel.bulkWrite(bulkOps);
}

export async function getPrivatePlayerState(playerId: string): Promise<PrivatePlayerState | null> {
  const player = await PlayerModel.findById(playerId)
    .select("+role +faction +effectiveState +abilityUnlocked +privateResults")
    .exec();
    
  if (!player || !player.role || !player.faction || !player.effectiveState) {
    return null;
  }

  return {
    playerId: player._id.toString(),
    teamId: player.teamId.toString(),
    role: player.role as Role,
    faction: player.faction as Faction,
    abilityUnlocked: player.abilityUnlocked ?? false,
    effectiveState: player.effectiveState as "SPECIAL" | "CITIZEN",
    privateResults: (player.privateResults as any) || [],
  };
}
