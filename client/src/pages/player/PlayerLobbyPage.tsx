import React from "react";
import { useNavigate } from "react-router-dom";
import { usePlayerGame } from "../../context/PlayerContext";
import { PlayerLobbyView } from "../../components/player/PlayerLobbyView";

export function PlayerLobbyPage() {
  const navigate = useNavigate();
  const { lobby, session, handleLeaveRoom } = usePlayerGame();

  if (!lobby || !session) {
    return <div className="text-center text-slate-300">Đang kết nối lại phòng...</div>;
  }

  return (
    <div className="w-full max-w-md mx-auto space-y-4">
      <PlayerLobbyView
        lobby={lobby}
        myTeamNumber={session.teamNumber}
        onLeaveRoom={() => {
          handleLeaveRoom();
          navigate("/player");
        }}
      />
    </div>
  );
}
