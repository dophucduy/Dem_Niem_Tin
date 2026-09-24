import React from "react";
import { useNavigate } from "react-router-dom";
import { usePlayerGame } from "../../context/PlayerContext";
import { NightQuestionView } from "../../components/player/NightQuestionView";
import { ROLE_DEFINITIONS } from "../../data/roleDefinitions";

export function PlayerQuestionPage() {
  const navigate = useNavigate();
  const { session, activeQuestion, activeRole, publicState, loading, handleSubmitAnswer } = usePlayerGame();

  const roleInfo = activeRole ? ROLE_DEFINITIONS[activeRole] : undefined;

  // Phase Guard: ensure room is in NIGHT phase
  React.useEffect(() => {
    if (session && publicState) {
      if (publicState.phase === "LOBBY") {
        navigate("/player/role");
      } else if (publicState.phase === "DAY") {
        navigate("/player/day/result");
      } else if (publicState.phase === "VOTING") {
        navigate("/player/vote");
      }
    }
  }, [session, publicState?.phase, navigate]);

  const onSubmit = (selectedIdx: number) => {
    handleSubmitAnswer(selectedIdx, (isCorrect: boolean) => {
      navigate("/player/night/result");
    });
  };

  if (!activeQuestion || !activeRole) {
    return <div className="w-full max-w-md rounded-2xl border border-amber-500/40 bg-night-900 p-6 text-center text-amber-200">Đang chờ máy chủ gửi dữ liệu lượt chơi.</div>;
  }

  return (
    <NightQuestionView
      question={activeQuestion}
      roundNumber={publicState?.round || 1}
      abilityName={roleInfo?.abilityName || "ĐIỀU TRA BÍ MẬT"}
      onSubmitAnswer={onSubmit}
      loading={loading}
    />
  );
}
