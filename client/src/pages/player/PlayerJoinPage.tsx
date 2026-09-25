import React from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { usePlayerGame } from "../../context/PlayerContext";
import { PlayerJoinView } from "../../components/player/PlayerJoinView";

export function PlayerJoinPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const codeFromUrl = searchParams.get("code") || "";

  const { loading, errorMessage, handleJoin, session } = usePlayerGame();

  const onJoin = (roomCode: string, displayName: string) => {
    handleJoin(roomCode, 0, displayName, () => {
      navigate("/player/lobby");
    });
  };

  return (
    <PlayerJoinView
      initialRoomCode={codeFromUrl || session?.roomCode || ""}
      loading={loading}
      errorMessage={errorMessage}
      onJoin={onJoin}
    />
  );
}
