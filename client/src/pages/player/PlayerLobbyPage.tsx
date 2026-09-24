import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { usePlayerGame } from "../../context/PlayerContext";
import { PlayerLobbyView } from "../../components/player/PlayerLobbyView";
import { GameButton } from "../../components/common/GameButton";
import { Shield } from "lucide-react";

export function PlayerLobbyPage() {
  const navigate = useNavigate();
  const { lobby, session, publicState, privateState, loading, handleToggleReady, handleLeaveRoom } = usePlayerGame();

  const myTeamNum = session?.teamNumber || 4;
  const myPlayerId = session?.playerId || "player-4";
  const myTeam = lobby?.teams.find((t) => t.teamNumber === myTeamNum);
  const isMyTeamReady = !!myTeam?.ready;

  // Auto-navigate to role reveal when host starts game
  useEffect(() => {
    if (publicState && (publicState.phase !== "LOBBY" || publicState.phaseStartedAt !== undefined)) {
      navigate("/player/role");
    } else if (privateState && privateState.role) {
      navigate("/player/role");
    }
  }, [publicState?.phase, publicState?.phaseStartedAt, privateState?.role, navigate]);

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

      {/* Button to proceed to role reveal in test/demo mode only */}
      {!session && (
        <div className="pt-2">
          <GameButton
            variant="outline"
            size="md"
            fullWidth
            icon={<Shield className="w-4 h-4 text-trust-300" />}
            onClick={() => navigate("/player/role")}
          >
            TIẾN VÀO NHẬN VAI TRÒ (P-03 - DEMO)
          </GameButton>
        </div>
      )}
    </div>
  );
}
