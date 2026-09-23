import React from "react";
import { useNavigate } from "react-router-dom";
import { usePlayerGame } from "../../context/PlayerContext";
import { PlayerLobbyView } from "../../components/player/PlayerLobbyView";
import { GameButton } from "../../components/common/GameButton";
import { Shield } from "lucide-react";

export function PlayerLobbyPage() {
  const navigate = useNavigate();
  const { lobby, session, handleLeaveRoom } = usePlayerGame();

  const myTeam = session?.teamNumber || 4;
  const myPlayer = session?.playerId || "player-4";

  return (
    <div className="w-full max-w-md mx-auto space-y-4">
      <PlayerLobbyView
        lobby={lobby!}
        myTeamNumber={myTeam}
        myPlayerId={myPlayer}
        onLeaveRoom={() => {
          handleLeaveRoom();
          navigate("/player");
        }}
      />

      {/* Button to proceed to role reveal when ready */}
      <div className="pt-2">
        <GameButton
          variant="primary"
          size="lg"
          fullWidth
          icon={<Shield className="w-5 h-5 text-trust-300" />}
          onClick={() => navigate("/player/role")}
        >
          TIẾN VÀO NHẬN VAI TRÒ (P-03)
        </GameButton>
      </div>
    </div>
  );
}

