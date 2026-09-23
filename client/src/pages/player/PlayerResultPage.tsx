import React from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { usePlayerGame } from "../../context/PlayerContext";
import { AnswerResultView } from "../../components/player/AnswerResultView";

export function PlayerResultPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { activeRole, activeQuestion, questionDetail, publicState } = usePlayerGame();

  const isCorrectParam = searchParams.get("correct");
  const isCorrect = isCorrectParam !== "false"; // defaults to true unless explicitly false

  const onProceed = () => {
    if (isCorrect) {
      navigate("/player/night/ability");
    } else {
      navigate("/player/night/observe");
    }
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-4">
      {/* Toggle result view for testing */}
      <div className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-night-900/90 border border-night-700/80 text-xs">
        <span className="text-slate-400 font-medium">Trạng thái kết quả:</span>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => navigate("/player/night/result?correct=true")}
            className={`px-2.5 py-1 rounded-lg font-bold text-xs transition-colors ${
              isCorrect ? "bg-righteous-500/20 text-righteous-400 border border-righteous-500/40" : "text-slate-400 hover:text-white"
            }`}
          >
            ĐÚNG (P-05A)
          </button>
          <button
            type="button"
            onClick={() => navigate("/player/night/result?correct=false")}
            className={`px-2.5 py-1 rounded-lg font-bold text-xs transition-colors ${
              !isCorrect ? "bg-corruption-500/20 text-corruption-400 border border-corruption-500/40" : "text-slate-400 hover:text-white"
            }`}
          >
            SAI (P-05B)
          </button>
        </div>
      </div>

      <AnswerResultView
        isCorrect={isCorrect}
        role={activeRole}
        roundNumber={publicState?.round || 1}
        questionText={activeQuestion.text}
        correctOptionText={activeQuestion.options[questionDetail.correctOption]}
        explanation={questionDetail.explanation}
        onProceed={onProceed}
      />
    </div>
  );
}
