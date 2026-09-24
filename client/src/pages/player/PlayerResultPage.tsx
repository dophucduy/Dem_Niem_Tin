import React from "react";
import { usePlayerGame } from "../../context/PlayerContext";
import { AnswerResultView } from "../../components/player/AnswerResultView";

export function PlayerResultPage() {
  const { activeRole, activeQuestion, publicState, privateState } = usePlayerGame();

  const isCorrect = privateState?.abilityUnlocked ?? false;

  // When in room, activeQuestion is defined during NIGHT_KNOWLEDGE, undefined during NIGHT_ABILITY
  const onProceed = () => {};

  if (!activeRole || !privateState) {
    return <div className="w-full max-w-md rounded-2xl border border-night-700 bg-night-900 p-5 text-center text-slate-300">Đang chờ kết quả từ máy chủ.</div>;
  }

  return (
    <div className="w-full max-w-md mx-auto space-y-4">
      <AnswerResultView
        isCorrect={isCorrect}
        role={activeRole}
        roundNumber={publicState?.round || 1}
        questionText={activeQuestion?.text}
        explanation=""
        onProceed={onProceed}
      />
    </div>
  );
}
