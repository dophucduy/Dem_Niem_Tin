import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useHostGame } from "../../context/HostContext";
import { HostDiscussionStage } from "../../components/host/HostDiscussionStage";

export function HostDiscussionPage() {
  const navigate = useNavigate();
  const { publicState, teams, loading, runGameCommand } = useHostGame();


  const round = publicState?.round || 1;
  const trust = publicState?.trust ?? 100;
  const paused = publicState?.paused ?? false;
  const phaseEndsAt = publicState?.phaseEndsAt;

  const publicClues = publicState?.publicClues ?? [];

  // Auto-transition to voting stage when server advances to VOTING
  useEffect(() => {
    if (publicState && publicState.phase === "VOTING") {
      navigate("/host/voting");
    }
  }, [publicState?.phase, navigate]);

  const handlePauseToggle = () => {
    runGameCommand(paused ? "resume" : "pause");
  };

  const handleSkipTimer = () => {
    runGameCommand("skip");
    navigate("/host/voting");
  };

  const handleRestart = () => {
    runGameCommand("restart");
  };

  return (
    <HostDiscussionStage
      round={round}
      trust={trust}
      phaseEndsAt={phaseEndsAt}
      paused={paused}
      publicClues={publicClues}
      teams={teams}
      onPauseToggle={handlePauseToggle}
      onSkipTimer={handleSkipTimer}
      onRestartRound={handleRestart}
      loading={loading}
    />
  );
}

