import React from "react";
import { useNavigate } from "react-router-dom";
import { usePlayerGame } from "../../context/PlayerContext";
import { NightAbilityView } from "../../components/player/NightAbilityView";

export function PlayerObservePage() {
  const navigate = useNavigate();
  const { activeRole, session, publicState, teams, privateState } = usePlayerGame();

  const myTeam = session?.teamNumber ?? 0;
  const eliminated = publicState?.teams?.find((t) => t.teamNumber === myTeam)?.eliminated ?? false;

  // Phase guard: exact gamePhase only; otherwise hand control back by staying put.
  React.useEffect(() => {
    if (!publicState) return;
    if (publicState.gamePhase === "NIGHT_KNOWLEDGE") {
      navigate("/player/night/question", { replace: true });
    } else if (publicState.gamePhase === "NIGHT_RESOLUTION") {
      navigate("/player/night/private-result", { replace: true });
    }
  }, [publicState?.gamePhase, navigate]);

  return (
    <div className="w-full max-w-md mx-auto space-y-4">
      <NightAbilityView
        role={privateState?.role ?? activeRole}
        effectiveState={privateState?.effectiveState ?? "CITIZEN"}
        eliminated={eliminated}
        myTeamNumber={myTeam}
        teams={teams}
      />
    </div>
  );
}
