import React from "react";
import { useNavigate } from "react-router-dom";
import { usePlayerGame } from "../../context/PlayerContext";
import { NightAbilityView } from "../../components/player/NightAbilityView";

export function PlayerAbilityPage() {
  const navigate = useNavigate();
  const { activeRole, session, teams, loading, handleExecuteAbility } = usePlayerGame();

  const myTeam = session?.teamNumber || 4;

  const onExecute = (targetTeamNumber: number) => {
    handleExecuteAbility(targetTeamNumber);
    navigate(`/player/night/private-result?status=suspicious&target=${targetTeamNumber}`);
  };

  return (
    <NightAbilityView
      role={activeRole}
      effectiveState="SPECIAL"
      myTeamNumber={myTeam}
      teams={teams}
      onExecuteAbility={onExecute}
      loading={loading}
    />
  );
}

