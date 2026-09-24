import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useHostGame } from "../../context/HostContext";
import { HostRoleRevealStage } from "../../components/host/HostRoleRevealStage";

export function HostRoleRevealPage() {
  const navigate = useNavigate();
  const { teams, loading, runGameCommand, publicState, hostSession } = useHostGame();

  // If host session is lost, navigate to /host
  useEffect(() => {
    if (!hostSession) {
      navigate("/host");
    }
  }, [hostSession, navigate]);

  const onProceed = () => {
    runGameCommand("skip");
  };

  return (
    <HostRoleRevealStage
      teams={teams}
      onProceedToNight={onProceed}
      loading={loading}
      phaseEndsAt={publicState?.phaseEndsAt}
      paused={publicState?.paused}
    />
  );
}
