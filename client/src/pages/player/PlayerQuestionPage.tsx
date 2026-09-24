import React from "react";
import { useNavigate } from "react-router-dom";
import { usePlayerGame } from "../../context/PlayerContext";
import { NightQuestionView } from "../../components/player/NightQuestionView";
import { ROLE_DEFINITIONS } from "../../data/roleDefinitions";

export function PlayerQuestionPage() {
  const navigate = useNavigate();
  const { session, activeQuestion, questionDetail, activeRole, publicState, loading, handleSubmitAnswer } = usePlayerGame();

  const roleInfo = ROLE_DEFINITIONS[activeRole];

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
      navigate(`/player/night/result?correct=${isCorrect}&answer=${selectedIdx}`);
    });
  };

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
