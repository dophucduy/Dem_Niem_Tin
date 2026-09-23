import React from "react";
import { useNavigate } from "react-router-dom";
import { usePlayerGame } from "../../context/PlayerContext";
import { NightAbilityView } from "../../components/player/NightAbilityView";
import { GameButton } from "../../components/common/GameButton";
import { ArrowRight } from "lucide-react";

export function PlayerObservePage() {
  const navigate = useNavigate();
  const { activeRole, session, teams } = usePlayerGame();

  const myTeam = session?.teamNumber || 4;

  return (
    <div className="w-full max-w-md mx-auto space-y-4">
      <NightAbilityView
        role={activeRole}
        effectiveState="CITIZEN"
        myTeamNumber={myTeam}
        teams={teams}
        onExecuteAbility={() => {}}
      />

      <div className="pt-2">
        <GameButton
          variant="outline"
          size="lg"
          fullWidth
          icon={<ArrowRight className="w-5 h-5 text-trust-300" />}
          onClick={() => navigate("/player/night/private-result?status=safe")}
        >
          TIẾN ĐẾN KẾT QUẢ RIÊNG TƯ (P-07)
        </GameButton>
      </div>
    </div>
  );
}
