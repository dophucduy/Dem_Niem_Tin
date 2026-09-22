import mongoose, { model, Schema, type InferSchemaType } from "mongoose";

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
    publicClues: {
      type: [
        {
          id: { type: String, required: true },
          title: { type: String, required: true },
          description: { type: String, required: true },
          visibility: { type: String, enum: ["public", "private"], required: true },
          revealedAt: { type: Number },
        },
      ],
      default: [],
    },
    publicEvents: {
      type: [
        {
          id: { type: String, required: true },
          type: { type: String, required: true },
          message: { type: String, required: true },
          timestamp: { type: Number, required: true },
        },
      ],
      default: [],
    },
    activeQuestion: {
      type: {
        id: { type: String, required: true },
        category: { type: String, required: true },
        difficulty: { type: String, enum: ["easy", "medium", "hard"], required: true },
        text: { type: String, required: true },
        options: { type: [String], required: true },
      },
    },
  },
  { timestamps: true, versionKey: false },
);

gameSchema.index({ status: 1, updatedAt: -1 });

export type GameDocument = InferSchemaType<typeof gameSchema>;

export const GameModel = mongoose.models.Game ?? model("Game", gameSchema);
