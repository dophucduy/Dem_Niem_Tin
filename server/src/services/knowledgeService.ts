import { QuestionModel } from "../models/Question.js";
import { PlayerModel } from "../models/Player.js";
import type { QuestionDifficulty } from "@dem-niem-tin/shared";

export async function getRandomQuestion(difficulty: QuestionDifficulty) {
  const questions = await QuestionModel.aggregate([
    { $match: { difficulty } },
    { $sample: { size: 1 } }
  ]).exec();

  if (questions.length === 0) return null;

  return {
    id: questions[0]._id.toString(),
    category: questions[0].category,
    difficulty: questions[0].difficulty,
    text: questions[0].text,
    options: questions[0].options,
  };
}

export async function submitAnswer(playerId: string, questionId: string, answer: string): Promise<boolean> {
  const question = await QuestionModel.findById(questionId).select("+correctAnswer").exec();
  if (!question) {
    throw new Error("Question not found");
  }

  const isCorrect = question.correctAnswer === answer;

  if (isCorrect) {
    await PlayerModel.findByIdAndUpdate(playerId, { abilityUnlocked: true });
  } else {
    await PlayerModel.findByIdAndUpdate(playerId, { 
      abilityUnlocked: false, 
      effectiveState: "CITIZEN" 
    });
  }

  return isCorrect;
}

export async function resetKnowledgeState(gameId: string): Promise<void> {
  await PlayerModel.updateMany(
    { gameId },
    { abilityUnlocked: false, effectiveState: "SPECIAL" }
  );
}
