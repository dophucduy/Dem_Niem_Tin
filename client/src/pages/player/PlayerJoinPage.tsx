import React from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { usePlayerGame } from "../../context/PlayerContext";
import { PlayerJoinView } from "../../components/player/PlayerJoinView";

export function PlayerJoinPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const codeFromUrl = searchParams.get("code") || "";

  const { loading, errorMessage, handleJoin, lobby } = usePlayerGame();

  const occupiedTeams = lobby?.teams.filter((t) => t.connected).map((t) => t.teamNumber) || [];

  const onJoin = (roomCode: string, teamNumber: number, displayName?: string) => {
    handleJoin(roomCode, teamNumber, displayName, () => {
      navigate("/player/lobby");
    });
  };

  return (
    <PlayerJoinView
      initialRoomCode={codeFromUrl}
      loading={loading}
      errorMessage={errorMessage}
      occupiedTeams={occupiedTeams}
      onJoin={onJoin}
    />
  );
}
