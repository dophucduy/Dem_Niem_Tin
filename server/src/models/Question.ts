import mongoose, { model, Schema, type InferSchemaType, type Model } from "mongoose";

const questionSchema = new Schema(
  {
    category: { type: String, required: true, trim: true },
    difficulty: { type: String, enum: ["easy", "medium", "hard"], required: true },
    text: { type: String, required: true },
    options: { type: [String], required: true },
    correctAnswer: { type: String, required: true, select: false },
  },
  { timestamps: true, versionKey: false },
);

questionSchema.index({ difficulty: 1 });

export type QuestionDocument = InferSchemaType<typeof questionSchema>;

export const QuestionModel =
  (mongoose.models.Question as Model<QuestionDocument> | undefined) ?? model<QuestionDocument>("Question", questionSchema);
