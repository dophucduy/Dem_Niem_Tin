import mongoose, { type InferSchemaType } from "mongoose";

const { model, models, Schema } = mongoose;

const PHASES = [
  "LOBBY",
  "ROLE_REVEAL",
  "NIGHT_KNOWLEDGE",
  "NIGHT_ABILITY",
  "NIGHT_RESOLUTION",
  "DAY_RESULT",
  "DISCUSSION",
  "VOTING",
  "VOTE_RESULT",
  "TRUST_UPDATE",
  "NEXT_ROUND",
  "FINAL",
] as const;

const gameSchema = new Schema(
  {
    roomId: { type: Schema.Types.ObjectId, ref: "Room", required: true, unique: true },
    roomCode: { type: String, required: true, uppercase: true, trim: true, index: true },
    status: { type: String, enum: ["ACTIVE", "FINISHED"], default: "ACTIVE", required: true },
    phase: { type: String, enum: PHASES, default: "LOBBY", required: true },
    round: { type: Number, default: 0, min: 0, max: 3, required: true },
    trust: { type: Number, default: 100, min: 0, max: 100, required: true },
    paused: { type: Boolean, default: false, required: true },
    phaseStartedAt: { type: Date },
    phaseEndsAt: { type: Date },
    startedAt: { type: Date },
    finishedAt: { type: Date },
  },
  { timestamps: true, versionKey: false },
);

gameSchema.index({ status: 1, updatedAt: -1 });

export type GameDocument = InferSchemaType<typeof gameSchema>;

export const GameModel = models.Game ?? model("Game", gameSchema);
