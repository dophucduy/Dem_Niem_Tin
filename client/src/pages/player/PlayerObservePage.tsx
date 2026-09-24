import React from "react";
import { useNavigate } from "react-router-dom";
import { usePlayerGame } from "../../context/PlayerContext";
import { NightAbilityView } from "../../components/player/NightAbilityView";

export function PlayerObservePage() {
  const navigate = useNavigate();
  const { activeRole, session, publicState, teams } = usePlayerGame();

  const myTeam = session?.teamNumber;
  const myTeamState = teams.find((team) => team.teamNumber === myTeam);
  const isEliminated = myTeamState?.eliminated ?? false;

  // Phase Guard
  React.useEffect(() => {
    if (session && publicState) {
      if (publicState.gamePhase === "FINAL") {
        navigate("/player/final");
      } else if (!isEliminated && publicState.phase === "NIGHT" && publicState.activeQuestion !== undefined) {
        navigate("/player/night/question");
      } else if (!isEliminated && publicState.phase === "DAY") {
        navigate("/player/day/result");
      } else if (!isEliminated && publicState.phase === "VOTING") {
        navigate("/player/vote");
      } else if (!isEliminated && publicState.phase === "LOBBY") {
        navigate("/player/role");
      }
    }
  }, [session, publicState?.phase, publicState?.gamePhase, publicState?.activeQuestion, isEliminated, navigate]);

  if (isEliminated) {
    return (
      <div className="w-full max-w-md rounded-2xl border border-amber-700/50 bg-night-900 p-6 text-center">
        <p className="text-xs font-bold tracking-widest text-amber-400">ĐÃ BỊ LOẠI</p>
        <h1 className="mt-3 text-2xl font-black text-white">Bạn chuyển sang quan sát</h1>
        <p className="mt-2 text-sm text-slate-400">Bạn không thể bỏ phiếu hoặc dùng năng lực trong các vòng tiếp theo.</p>
      </div>
    );
  }

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
        myTeamNumber={myTeam ?? 0}
        teams={teams}
        onExecuteAbility={() => {}}
        onProceedToResult={onProceed}
      />
    </div>
  );
}
