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
    handleLeaveRoom 
  } = usePlayerGame();

  const trust = publicState?.trust ?? 100;
  const myTeamNumber = session?.teamNumber || 4;

  const myTeam = teams.find((t) => t.teamNumber === myTeamNumber);
  const isMyTeamEliminated = myTeam?.eliminated ?? false;

  if (!privateState) {
    return <div className="w-full max-w-md rounded-2xl border border-night-700 bg-night-900 p-5 text-center text-slate-300">Đang chờ kết quả cuối từ máy chủ.</div>;
  }

  const onLeave = () => {
    handleLeaveRoom();
    navigate("/player/join");
  };

  return (
    <FinalSummaryView
      myTeamNumber={myTeamNumber}
      myRole={privateState.role}
      myFaction={privateState.faction}
      isMyTeamEliminated={isMyTeamEliminated}
      trust={trust}
      teams={teams}
      onLeaveRoom={onLeave}
    />
  );
}
