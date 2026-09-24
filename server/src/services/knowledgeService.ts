import { QuestionModel } from "../models/Question.js";
import { PlayerModel, TeamModel } from "../models/index.js";
import type { QuestionDifficulty } from "@dem-niem-tin/shared";
import { ServiceError } from "./errors.js";

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

export async function submitAnswer(
  gameId: string,
  round: number,
  playerId: string,
  questionId: string,
  selectedOption: number,
): Promise<boolean> {
  const activePlayer = await PlayerModel.findOne({ _id: playerId, gameId }).select("teamId").lean();
  if (!activePlayer) throw new ServiceError("UNAUTHORIZED", "Player is not part of this game");
  const activeTeam = await TeamModel.exists({ _id: activePlayer.teamId, gameId, eliminated: false });
  if (!activeTeam) throw new ServiceError("FORBIDDEN", "Eliminated players cannot answer questions");

  const question = await QuestionModel.findById(questionId).select("+correctAnswer").exec();
  if (!question) throw new ServiceError("VALIDATION_ERROR", "Question not found");
  const answer = question.options[selectedOption];
  if (answer === undefined) throw new ServiceError("VALIDATION_ERROR", "Answer option is invalid");

  const isCorrect = question.correctAnswer === answer;
  const player = await PlayerModel.findOneAndUpdate(
    { _id: playerId, gameId, teamId: activePlayer.teamId, answeredRound: { $ne: round } },
    {
      $set: {
        answeredRound: round,
        abilityUnlocked: isCorrect,
        effectiveState: isCorrect ? "SPECIAL" : "CITIZEN",
      },
    },
    { new: true },
  );
  if (!player) throw new ServiceError("CONFLICT", "Question already answered or player is invalid");

  return isCorrect;
}

export async function resetKnowledgeState(gameId: string): Promise<void> {
  await PlayerModel.updateMany(
    { gameId },
    { $set: { abilityUnlocked: false, effectiveState: "SPECIAL" }, $unset: { answeredRound: 1 } }
  );
}
