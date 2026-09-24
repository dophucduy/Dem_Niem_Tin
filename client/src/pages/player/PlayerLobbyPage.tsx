import React from "react";
import { useNavigate } from "react-router-dom";
import { usePlayerGame } from "../../context/PlayerContext";
import { PlayerLobbyView } from "../../components/player/PlayerLobbyView";

export function PlayerLobbyPage() {
  const navigate = useNavigate();
  const { lobby, session, loading, handleToggleReady, handleLeaveRoom } = usePlayerGame();

  const myTeamNum = session?.teamNumber || 4;
  const myPlayerId = session?.playerId || "player-4";
  const myTeam = lobby?.teams.find((t) => t.teamNumber === myTeamNum);
  const isMyTeamReady = !!myTeam?.ready;

  return (
    <div className="w-full max-w-md mx-auto space-y-4">
      <PlayerLobbyView
        lobby={lobby!}
        myTeamNumber={myTeamNum}
        myPlayerId={myPlayerId}
        isReady={isMyTeamReady}
        onToggleReady={() => handleToggleReady(!isMyTeamReady)}
        onLeaveRoom={() => {
          handleLeaveRoom();
          navigate("/player");
        }}
        loading={loading}
      />
    </div>
  );
}
