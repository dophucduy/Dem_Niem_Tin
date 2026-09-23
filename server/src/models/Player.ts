import mongoose, { model, Schema, type InferSchemaType } from "mongoose";

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
    effectiveState: { type: String, enum: ["SPECIAL", "CITIZEN"], default: "SPECIAL", select: false },
    abilityUnlocked: { type: Boolean, default: false, select: false },
    answeredRound: { type: Number, min: 1, max: 3, select: false },
    privateResults: {
      type: [
        {
          id: { type: String, required: true },
          type: { type: String, required: true },
          message: { type: String, required: true },
          createdAt: { type: Number, required: true },
        },
      ],
      default: [],
      select: false,
    },
  },
  { timestamps: true, versionKey: false },
);

playerSchema.index({ roomId: 1, teamId: 1 }, { unique: true });
playerSchema.index({ roomId: 1, sessionTokenHash: 1 }, { unique: true });

export type PlayerDocument = InferSchemaType<typeof playerSchema>;

export const PlayerModel = mongoose.models.Player ?? model("Player", playerSchema);
