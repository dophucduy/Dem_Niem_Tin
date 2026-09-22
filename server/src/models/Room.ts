import { model, models, Schema, type InferSchemaType } from "mongoose";

const roomSchema = new Schema(
  {
    roomCode: { type: String, required: true, unique: true, uppercase: true, trim: true },
    status: {
      type: String,
      enum: ["LOBBY", "ACTIVE", "FINISHED"],
      default: "LOBBY",
      required: true,
    },
    hostName: { type: String, trim: true, maxlength: 60 },
    hostSessionTokenHash: { type: String, required: true, select: false },
  },
  { timestamps: true, versionKey: false },
);

roomSchema.index({ status: 1, updatedAt: -1 });

export type RoomDocument = InferSchemaType<typeof roomSchema>;

export const RoomModel = models.Room ?? model("Room", roomSchema);
