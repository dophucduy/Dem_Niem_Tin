import React from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { usePlayerGame } from "../../context/PlayerContext";
import { PlayerJoinView } from "../../components/player/PlayerJoinView";

export function PlayerJoinPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const codeFromUrl = searchParams.get("code") || "";

  const { loading, errorMessage, handleJoin, lobby, session } = usePlayerGame();

  const occupiedTeams = lobby?.teams
    .filter((t) => t.connected && t.teamNumber !== session?.teamNumber)
    .map((t) => t.teamNumber) || [];

  const onJoin = (roomCode: string, teamNumber: number, displayName?: string) => {
    handleJoin(roomCode, teamNumber, displayName, () => {
      navigate("/player/lobby");
    });
  };

  return (
    <PlayerJoinView
      initialRoomCode={codeFromUrl || session?.roomCode || ""}
      initialTeamNumber={session?.teamNumber || 1}
      loading={loading}
      errorMessage={errorMessage}
      occupiedTeams={occupiedTeams}
      currentLobbyRoomCode={lobby?.roomCode}
      onJoin={onJoin}
    />
  );
}
