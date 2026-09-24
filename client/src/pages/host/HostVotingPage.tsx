import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useHostGame } from "../../context/HostContext";
import { HostVotingStage } from "../../components/host/HostVotingStage";

export function HostVotingPage() {
  const navigate = useNavigate();
  const { publicState, teams, loading, runGameCommand } = useHostGame();


  const round = publicState?.round || 1;
  const trust = publicState?.trust ?? 100;
  const paused = publicState?.paused ?? false;
  const phaseEndsAt = publicState?.phaseEndsAt;

  const handlePauseToggle = () => {
    runGameCommand(paused ? "resume" : "pause");
  };

  const handleSkipTimer = () => {
    runGameCommand("skip");
    // In Feature 8, this will navigate to /host/vote-result
  };

  const handleRestart = () => {
    runGameCommand("restart");
  };

  return (
    <HostVotingStage
      round={round}
      trust={trust}
      phaseEndsAt={phaseEndsAt}
      paused={paused}
      teams={teams}
      onPauseToggle={handlePauseToggle}
      onSkipTimer={handleSkipTimer}
      onRestartRound={handleRestart}
      loading={loading}
    />
  );
}

