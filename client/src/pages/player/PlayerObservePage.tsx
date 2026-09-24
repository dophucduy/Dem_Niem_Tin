import React from "react";
import { useNavigate } from "react-router-dom";
import { usePlayerGame } from "../../context/PlayerContext";
import { NightAbilityView } from "../../components/player/NightAbilityView";

export function PlayerObservePage() {
  const navigate = useNavigate();
  const { activeRole, session, publicState, teams } = usePlayerGame();

  const myTeam = session?.teamNumber || 4;

  // Phase Guard
  React.useEffect(() => {
    if (session && publicState) {
      if (publicState.phase === "NIGHT" && publicState.activeQuestion !== undefined) {
        navigate("/player/night/question");
      } else if (publicState.phase === "DAY") {
        navigate("/player/day/result");
      } else if (publicState.phase === "VOTING") {
        navigate("/player/vote");
      } else if (publicState.phase === "LOBBY") {
        navigate("/player/role");
      }
    }
  }, [session, publicState?.phase, publicState?.activeQuestion, navigate]);

  if (!activeRole) {
    return <div className="w-full max-w-md rounded-2xl border border-night-700 bg-night-900 p-5 text-center text-slate-300">Đang chờ vai trò từ máy chủ.</div>;
  }

  const onProceed = () => {
    if (session && publicState?.phase === "NIGHT") {
      alert("Đang trong giai đoạn quan sát ban đêm. Hãy chờ bình minh lên theo hiệu lệnh của Giảng viên!");
      return;
    }
    navigate("/player/day/result");
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-4">
      <NightAbilityView
        role={activeRole}
        effectiveState="CITIZEN"
        myTeamNumber={myTeam}
        teams={teams}
        onExecuteAbility={() => {}}
        onProceedToResult={onProceed}
      />
    </div>
  );
}
