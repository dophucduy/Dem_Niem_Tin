import React from "react";
import { useNavigate } from "react-router-dom";
import { usePlayerGame } from "../../context/PlayerContext";
import { NightQuestionView } from "../../components/player/NightQuestionView";
import { ROLE_DEFINITIONS } from "../../data/roleDefinitions";

export function PlayerQuestionPage() {
  const navigate = useNavigate();
  const { activeQuestion, questionDetail, activeRole, publicState, loading, handleSubmitAnswer } = usePlayerGame();

  const roleInfo = ROLE_DEFINITIONS[activeRole];

  const onSubmit = (selectedIdx: number) => {
    handleSubmitAnswer(selectedIdx);
    const isCorrect = selectedIdx === questionDetail.correctOption;
    navigate(`/player/night/result?correct=${isCorrect}&answer=${selectedIdx}`);
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
