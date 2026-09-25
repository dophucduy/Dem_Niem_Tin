import mongoose, { model, Schema, type InferSchemaType, type Model } from "mongoose";

const actionSchema = new Schema(
  {
    gameId: { type: Schema.Types.ObjectId, ref: "Game", required: true, index: true },
    round: { type: Number, required: true, min: 1, max: 3 },
    playerId: { type: Schema.Types.ObjectId, ref: "Player", required: true },
    targetPlayerId: { type: Schema.Types.ObjectId, ref: "Player" },
    mode: { type: String, enum: ["TRUST_DRAIN", "INTERFERE"] },
  },
  { timestamps: true, versionKey: false },
);

actionSchema.index({ gameId: 1, round: 1, playerId: 1 }, { unique: true });

export type ActionDocument = InferSchemaType<typeof actionSchema>;
export const ActionModel =
  (mongoose.models.Action as Model<ActionDocument> | undefined) ?? model<ActionDocument>("Action", actionSchema);
