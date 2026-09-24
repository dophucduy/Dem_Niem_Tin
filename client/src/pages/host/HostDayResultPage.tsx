import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useHostGame } from "../../context/HostContext";
import { HostDayResultStage } from "../../components/host/HostDayResultStage";

export function HostDayResultPage() {
  const navigate = useNavigate();
  const { publicState, teams, loading, runGameCommand } = useHostGame();

  const [localPaused, setLocalPaused] = useState(false);

  const round = publicState?.round || 1;
  const trust = publicState?.trust ?? 100;
  const paused = publicState?.paused ?? localPaused;
  const publicClues = publicState?.publicClues || [];

  const handlePauseToggle = () => {
    if (publicState) {
      runGameCommand(paused ? "resume" : "pause");
    } else {
      setLocalPaused(!localPaused);
    }
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

