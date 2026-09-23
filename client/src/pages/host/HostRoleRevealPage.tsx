import React from "react";
import { useNavigate } from "react-router-dom";
import { useHostGame } from "../../context/HostContext";
import { HostRoleRevealStage } from "../../components/host/HostRoleRevealStage";

export function HostRoleRevealPage() {
  const navigate = useNavigate();
  const { teams, loading, runGameCommand } = useHostGame();

  const onProceed = () => {
    runGameCommand("skip");
    navigate("/host/night");
  };

  return (
    <HostRoleRevealStage
      teams={teams}
      onProceedToNight={onProceed}
      loading={loading}
    />
  );
}

