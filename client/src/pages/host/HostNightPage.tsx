import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useHostGame } from "../../context/HostContext";
import { HostNightStage } from "../../components/host/HostNightStage";

export function HostNightPage() {
  const navigate = useNavigate();
  const { publicState, teams, loading, runGameCommand } = useHostGame();

  const question = publicState?.activeQuestion;
  const round = publicState?.round || 1;
  const trust = publicState?.trust || 100;
  const paused = publicState?.paused ?? false;
  const phaseEndsAt = publicState?.phaseEndsAt;

  // Auto-navigate to day result when server phase transitions to DAY
  useEffect(() => {
    if (publicState && publicState.phase === "DAY") {
      navigate("/host/day-result");
    }
  }, [publicState?.phase, navigate]);

  const handlePauseToggle = () => {
    runGameCommand(paused ? "resume" : "pause");
  };

  const handleSkip = () => {
    runGameCommand("skip");
  };

  const handleResolveNight = () => {
    runGameCommand("skip");
    navigate("/host/day-result");
  };

  return (
    <HostNightStage
      round={round}
      question={question}
      teams={teams}
      trust={trust}
      phaseEndsAt={phaseEndsAt}
      paused={paused}
      onPauseToggle={handlePauseToggle}
      onSkipTimer={handleSkip}
      onResolveNight={handleResolveNight}
      loading={loading}
    />
  );
}

