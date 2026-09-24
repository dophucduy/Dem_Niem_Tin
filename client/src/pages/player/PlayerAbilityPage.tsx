import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePlayerGame } from "../../context/PlayerContext";
import { NightAbilityView } from "../../components/player/NightAbilityView";

export function PlayerAbilityPage() {
  const navigate = useNavigate();
  const { activeRole, session, publicState, teams, loading, handleExecuteAbility, privateState } = usePlayerGame();

  const [submittedTarget, setSubmittedTarget] = useState<number | undefined>(undefined);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const myTeam = session?.teamNumber || 4;

  // Phase Guard: Auto-transition to Day when morning arrives, or back to Question if still in Question phase
  React.useEffect(() => {
    if (session && publicState) {
      if (publicState.phase === "NIGHT" && publicState.activeQuestion !== undefined) {
        navigate("/player/night/question");
      } else if (publicState.phase === "DAY") {
        const targetParam = submittedTarget !== undefined ? `&target=${submittedTarget}` : "";
        navigate(`/player/night/private-result?status=suspicious${targetParam}`);
      } else if (publicState.phase === "VOTING") {
        navigate("/player/vote");
      } else if (publicState.phase === "LOBBY") {
        navigate("/player/role");
      }
    }
  }, [session, publicState?.phase, publicState?.activeQuestion, submittedTarget, navigate]);

  const onExecute = (targetTeamNumber?: number) => {
    handleExecuteAbility(
      targetTeamNumber,
      () => {
        setSubmittedTarget(targetTeamNumber);
        setIsSubmitted(true);
      },
      (err) => {
        console.error("Ability execution error:", err);
      }
    );
  };

  const onProceed = () => {
    if (session && publicState?.phase === "NIGHT") {
      alert("Đội bạn đã gửi hành động đêm! Vui lòng chờ hết đêm và bình minh lên để nhận báo cáo nghiệp vụ.");
      return;
    }
    const targetParam = submittedTarget !== undefined ? `&target=${submittedTarget}` : "";
    navigate(`/player/night/private-result?status=suspicious${targetParam}`);
  };

  return (
    <NightAbilityView
      role={activeRole}
      effectiveState={privateState?.effectiveState || "SPECIAL"}
      myTeamNumber={myTeam}
      teams={teams}
      onExecuteAbility={onExecute}
      onProceedToResult={onProceed}
      isSubmitted={isSubmitted}
      loading={loading}
    />
  );
}

