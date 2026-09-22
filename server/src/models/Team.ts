import mongoose, { type InferSchemaType } from "mongoose";

const { model, models, Schema } = mongoose;

const teamSchema = new Schema(
  {
    roomId: { type: Schema.Types.ObjectId, ref: "Room", required: true, index: true },
    gameId: { type: Schema.Types.ObjectId, ref: "Game", index: true },
    teamNumber: { type: Number, required: true, min: 1, max: 8 },
    displayName: { type: String, required: true, trim: true, maxlength: 40 },
    ready: { type: Boolean, default: false, required: true },
    eliminated: { type: Boolean, default: false, required: true },
  },
  { timestamps: true, versionKey: false },
);

teamSchema.index({ roomId: 1, teamNumber: 1 }, { unique: true });

export type TeamDocument = InferSchemaType<typeof teamSchema>;

export const TeamModel = models.Team ?? model("Team", teamSchema);
