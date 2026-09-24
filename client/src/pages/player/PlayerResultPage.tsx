import React, { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { usePlayerGame } from "../../context/PlayerContext";
import { AnswerResultView } from "../../components/player/AnswerResultView";
import { Clock } from "lucide-react";

export function PlayerResultPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { session, activeRole, activeQuestion, questionDetail, publicState, privateState } = usePlayerGame();

  const isCorrectParam = searchParams.get("correct");
  const isCorrect = privateState !== null
    ? privateState.abilityUnlocked
    : (isCorrectParam !== null ? isCorrectParam === "true" : true);

  // When in room, activeQuestion is defined during NIGHT_KNOWLEDGE, undefined during NIGHT_ABILITY
  const isWaitingForOthers = !!session && publicState?.phase === "NIGHT" && publicState?.activeQuestion !== undefined;

  // Auto-transition as soon as server advances to NIGHT_ABILITY
  useEffect(() => {
    if (session && publicState) {
      if (publicState.phase === "NIGHT" && !publicState.activeQuestion) {
        if (isCorrect) {
          navigate("/player/night/ability");
        } else {
          navigate("/player/night/observe");
        }
      } else if (publicState.phase === "DAY") {
        navigate("/player/day/result");
      } else if (publicState.phase === "VOTING") {
        navigate("/player/vote");
      }
    }
  }, [session, publicState?.phase, publicState?.activeQuestion, isCorrect, navigate]);

  const onProceed = () => {
    if (isWaitingForOthers) {
      alert("Đội bạn đã nộp bài thành công! Vui lòng chờ các đội còn lại hoàn tất câu hỏi để mở phiên Quyền năng.");
      return;
    }
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

      {isWaitingForOthers && (
        <div className="p-3.5 rounded-2xl bg-night-950/95 border border-amber-500/50 text-center space-y-1 shadow-glow animate-pulse">
          <div className="text-xs font-bold text-amber-300 flex items-center justify-center gap-1.5 font-mono">
            <Clock className="w-3.5 h-3.5 animate-spin text-amber-400" />
            ĐÃ NỘP BÀI • ĐANG CHỜ CÁC ĐỘI CÒN LẠI...
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Hệ thống sẽ tự động chuyển sang phiên Thực thi Quyền năng ngay khi đủ bài hoặc hết thời gian.
          </p>
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
      />
    </div>
  );
}
