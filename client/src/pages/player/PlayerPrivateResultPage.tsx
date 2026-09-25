import React from "react";
import { useNavigate } from "react-router-dom";
import { usePlayerGame } from "../../context/PlayerContext";
import {
  PrivateResultView,
  selectRoundResult,
  PrivateResultEmptyVariant,
} from "../../components/player/PrivateResultView";

export function PlayerPrivateResultPage() {
  const navigate = useNavigate();
  const { session, publicState, privateState, activeRole } = usePlayerGame();

  const myTeam = session?.teamNumber ?? 0;
  const round = publicState?.round ?? 1;

  // Phase guard: this dossier belongs to NIGHT_RESOLUTION only. When the game
  // is still on an earlier night step, return to its own screen so the player
  // never skips answering or acting.
  React.useEffect(() => {
    if (!publicState) return;
    if (publicState.gamePhase === "NIGHT_KNOWLEDGE") {
      navigate("/player/night/question", { replace: true });
    } else if (publicState.gamePhase === "NIGHT_ABILITY") {
      navigate(
        privateState?.abilityUnlocked === false ? "/player/night/observe" : "/player/night/ability",
        { replace: true }
      );
    }
  }, [publicState?.gamePhase, privateState?.abilityUnlocked, navigate]);

  // Only the result resolved in the current round is shown; older entries stay
  // hidden so last night's data can never masquerade as tonight's finding.
  const myResult = selectRoundResult(privateState?.privateResults, round);

  const eliminated =
    publicState?.teams?.find((t) => t.teamNumber === myTeam)?.eliminated ?? false;

  const emptyVariant: PrivateResultEmptyVariant = !privateState
    ? "WAITING"
    : eliminated
    ? "ELIMINATED"
    : privateState.effectiveState === "CITIZEN"
    ? "CITIZEN"
    : "NO_ACTION";

  return (
    <div className="w-full max-w-md mx-auto space-y-4">
      <PrivateResultView
        role={privateState?.role ?? activeRole}
        myTeamNumber={myTeam}
        roundNumber={round}
        result={myResult}
        emptyVariant={emptyVariant}
      />
    </div>
  );
}
