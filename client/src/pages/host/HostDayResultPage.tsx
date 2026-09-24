import React from "react";
import { useNavigate } from "react-router-dom";
import { useHostGame } from "../../context/HostContext";
import { HostDayResultStage } from "../../components/host/HostDayResultStage";

export function HostDayResultPage() {
  const navigate = useNavigate();
  const { publicState, teams, loading, runGameCommand } = useHostGame();


  const round = publicState?.round || 1;
  const trust = publicState?.trust ?? 100;
  const paused = publicState?.paused ?? false;
  const publicClues = publicState?.publicClues || [];

  const handlePauseToggle = () => {
    runGameCommand(paused ? "resume" : "pause");
  };

  const handleStartDiscussion = () => {
    runGameCommand("skip");
    navigate("/host/discussion");
  };

  const handleRestart = () => {
    runGameCommand("restart");
  };

  return (
    <HostDayResultStage
      round={round}
      trust={trust}
      publicClues={publicClues}
      teams={teams}
      paused={paused}
      onPauseToggle={handlePauseToggle}
      onStartDiscussion={handleStartDiscussion}
      onRestartRound={handleRestart}
      loading={loading}
    />
  );
}

