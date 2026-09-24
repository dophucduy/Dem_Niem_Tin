import React from "react";
import { useSearchParams } from "react-router-dom";
import { usePlayerGame } from "../../context/PlayerContext";
import { AnswerResultView } from "../../components/player/AnswerResultView";
import { Clock } from "lucide-react";

export function PlayerResultPage() {
  const [searchParams] = useSearchParams();
  const { session, activeRole, activeQuestion, questionDetail, publicState, privateState } = usePlayerGame();

  const isCorrectParam = searchParams.get("correct");
  const isCorrect = privateState !== null
    ? privateState.abilityUnlocked
    : (isCorrectParam !== null ? isCorrectParam === "true" : true);

  // When in room, activeQuestion is defined during NIGHT_KNOWLEDGE, undefined during NIGHT_ABILITY
  const isWaitingForOthers = !!session && publicState?.phase === "NIGHT" && publicState?.activeQuestion !== undefined;

  const onProceed = () => {};

  return (
    <div className="w-full max-w-md mx-auto space-y-4">
      {isWaitingForOthers && (
        <div className="p-3.5 rounded-2xl bg-night-950/95 border border-amber-500/50 text-center space-y-1 shadow-glow animate-pulse">
          <div className="text-xs font-bold text-amber-300 flex items-center justify-center gap-1.5 font-mono">
            <Clock className="w-3.5 h-3.5 animate-spin text-amber-400" />
            ĐÃ NỘP BÀI • ĐANG CHỜ CÁC ĐỘI CÒN LẠI...
          </div>
        </div>
      )}

      <AnswerResultView
        isCorrect={isCorrect}
        role={activeRole}
        roundNumber={publicState?.round || 1}
        questionText={activeQuestion.text}
        correctOptionText={activeQuestion.options[questionDetail.correctOption]}
        explanation={questionDetail.explanation}
        onProceed={onProceed}
        waitingForHost={isWaitingForOthers}
      />
    </div>
  );
}
