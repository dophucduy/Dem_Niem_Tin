import React from "react";
import { useNavigate } from "react-router-dom";
import { usePlayerGame } from "../../context/PlayerContext";
import { FinalSummaryView } from "../../components/player/FinalSummaryView";

export function PlayerFinalPage() {
  const navigate = useNavigate();
  const { 
    publicState, 
    session, 
    teams, 
    privateState, 
    activeRole, 
    activeFaction, 
    handleLeaveRoom 
  } = usePlayerGame();

  const trust = publicState?.trust ?? 100;
  const myTeamNumber = session?.teamNumber || 4;

  const myTeam = teams.find((t) => t.teamNumber === myTeamNumber);
  const isMyTeamEliminated = myTeam?.eliminated ?? false;

  const onLeave = () => {
    handleLeaveRoom();
    navigate("/player/join");
  };

  return (
    <FinalSummaryView
      myTeamNumber={myTeamNumber}
      myRole={privateState?.role || activeRole}
      myFaction={privateState?.faction || activeFaction}
      isMyTeamEliminated={isMyTeamEliminated}
      trust={trust}
      teams={teams}
      onLeaveRoom={onLeave}
    />
  );
}
