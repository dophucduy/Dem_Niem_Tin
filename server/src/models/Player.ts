import mongoose, { type InferSchemaType } from "mongoose";

const { model, models, Schema } = mongoose;

const ROLES = [
  "CORRUPTOR",
  "INSPECTOR",
  "LAW",
  "WHISTLEBLOWER",
  "OVERSIGHT",
  "SPECIAL_6",
  "SPECIAL_7",
] as const;

const playerSchema = new Schema(
  {
    roomId: { type: Schema.Types.ObjectId, ref: "Room", required: true, index: true },
    gameId: { type: Schema.Types.ObjectId, ref: "Game", index: true },
    teamId: { type: Schema.Types.ObjectId, ref: "Team", required: true },
    sessionTokenHash: { type: String, required: true, select: false },
    role: { type: String, enum: ROLES, select: false },
    faction: { type: String, enum: ["CORRUPTION", "TRUST"], select: false },
    connected: { type: Boolean, default: true, required: true },
    socketId: { type: String, select: false },
  },
  { timestamps: true, versionKey: false },
);

playerSchema.index({ roomId: 1, teamId: 1 }, { unique: true });
playerSchema.index({ roomId: 1, sessionTokenHash: 1 }, { unique: true });

export type PlayerDocument = InferSchemaType<typeof playerSchema>;

export const PlayerModel = models.Player ?? model("Player", playerSchema);
