import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AbilityMode } from "@dem-niem-tin/shared";
import { usePlayerGame } from "../../context/PlayerContext";
import { NightAbilityView } from "../../components/player/NightAbilityView";

export function PlayerAbilityPage() {
  const navigate = useNavigate();
  const {
    activeRole,
    session,
    publicState,
    teams,
    loading,
    handleExecuteAbility,
    privateState,
  } = usePlayerGame();

  const myTeam = session?.teamNumber ?? 0;
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // The server owns the "already acted" flag, so a refresh never re-opens the form.
  const submitted = isSubmitted || (privateState?.hasActedThisRound ?? false);

  const eliminated = publicState?.teams?.find((t) => t.teamNumber === myTeam)?.eliminated ?? false;
  const locked = privateState?.abilityUnlocked === false;

  // Phase guard: exact gamePhase so the resolution dossier is never skipped.
  React.useEffect(() => {
    if (!publicState) return;
    if (publicState.gamePhase === "NIGHT_KNOWLEDGE") {
      navigate("/player/night/question", { replace: true });
    } else if (publicState.gamePhase === "NIGHT_ABILITY" && (locked || eliminated)) {
      navigate("/player/night/observe", { replace: true });
    } else if (publicState.gamePhase === "NIGHT_RESOLUTION") {
      navigate("/player/night/private-result", { replace: true });
    }
  }, [publicState?.gamePhase, locked, eliminated, navigate]);

  const onExecute = (targetTeamNumber?: number, mode?: AbilityMode) => {
    setSubmitError(null);
    handleExecuteAbility(
      targetTeamNumber,
      mode,
      () => setIsSubmitted(true),
      (err) => setSubmitError(err)
    );
  };

  return (
    <NightAbilityView
      role={privateState?.role ?? activeRole}
      effectiveState={privateState?.effectiveState ?? "SPECIAL"}
      eliminated={eliminated}
      myTeamNumber={myTeam}
      teams={teams}
      onExecuteAbility={onExecute}
      isSubmitted={submitted}
      loading={loading}
      errorMessage={submitError}
    />
  );
}
