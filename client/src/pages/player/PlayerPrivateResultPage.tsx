import React from "react";
import { useNavigate } from "react-router-dom";
import { usePlayerGame } from "../../context/PlayerContext";
import { PrivateResultView } from "../../components/player/PrivateResultView";

export function PlayerPrivateResultPage() {
  const navigate = useNavigate();
  const { activeRole, session, publicState, privateState } = usePlayerGame();
  const myTeam = session?.teamNumber || 4;

  // Phase Guard: Must be in DAY phase to view morning private findings
  React.useEffect(() => {
    if (session && publicState) {
      if (publicState.phase === "NIGHT") {
        if (publicState.activeQuestion !== undefined) {
          navigate("/player/night/question");
        } else {
          navigate("/player/night/ability");
        }
      } else if (publicState.phase === "LOBBY") {
        navigate("/player/role");
      } else if (publicState.phase === "VOTING") {
        navigate("/player/vote");
      }
    }
  }, [session, publicState?.phase, publicState?.activeQuestion, navigate]);

  if (!activeRole) {
    return <div className="w-full max-w-md rounded-2xl border border-night-700 bg-night-900 p-5 text-center text-slate-300">Đang chờ vai trò từ máy chủ.</div>;
  }

  const realResult = privateState?.privateResults && privateState.privateResults.length > 0
    ? privateState.privateResults[privateState.privateResults.length - 1]
    : null;

  const displayResult = realResult;

  const onAcknowledge = () => {
    navigate("/player/day/result");
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-4">
      {displayResult ? <PrivateResultView
        role={activeRole}
        myTeamNumber={myTeam}
        roundNumber={publicState?.round || 1}
        result={displayResult}
        onAcknowledge={onAcknowledge}
      /> : <div className="rounded-2xl border border-night-700 bg-night-900 p-5 text-center text-slate-300">Chưa có kết quả riêng từ máy chủ.</div>}
    </div>
  );
}
