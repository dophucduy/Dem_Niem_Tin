import mongoose, { model, Schema, type InferSchemaType, type Model } from "mongoose";

const voteSchema = new Schema(
  {
    gameId: { type: Schema.Types.ObjectId, ref: "Game", required: true, index: true },
    round: { type: Number, required: true },
    voterId: { type: Schema.Types.ObjectId, ref: "Player", required: true },
    targetId: { type: Schema.Types.ObjectId, ref: "Player", required: true },
  },
  { timestamps: true, versionKey: false },
);

voteSchema.index({ gameId: 1, round: 1, voterId: 1 }, { unique: true });

export type VoteDocument = InferSchemaType<typeof voteSchema>;

export const VoteModel =
  (mongoose.models.Vote as Model<VoteDocument> | undefined) ?? model<VoteDocument>("Vote", voteSchema);
