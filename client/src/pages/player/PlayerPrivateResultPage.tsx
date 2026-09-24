import React from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { usePlayerGame } from "../../context/PlayerContext";
import { PrivateResultView } from "../../components/player/PrivateResultView";

export function PlayerPrivateResultPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { activeRole, session, publicState, privateState } = usePlayerGame();

  const statusParam = searchParams.get("status") || "suspicious";
  const isSuspicious = statusParam !== "safe";
  const targetParam = Number(searchParams.get("target")) || 5;

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

  const mockResult = {
    id: `res-${statusParam}`,
    type: "INVESTIGATION" as const,
    message: isSuspicious ? "CÓ DẤU HIỆU ĐÁNG NGỜ" : "CHƯA PHÁT HIỆN DẤU HIỆU",
    createdAt: Date.now(),
    details: {
      isSuspicious: isSuspicious,
      riskLevel: isSuspicious ? "HIGH" as const : "LOW" as const,
      findingNotes: isSuspicious 
        ? "Phát hiện mục tiêu có các giao dịch bất thường và thông tin kê khai thiếu nhất quán so với quy định pháp luật."
        : "Hồ sơ công tác minh bạch, các hoạt động và phát ngôn đều tuân thủ chặt chẽ nguyên tắc tập trung dân chủ.",
      strategicAdvice: isSuspicious
        ? "Cần đặt câu hỏi khéo léo trong phiên thảo luận ban ngày để đối tượng bộc lộ sơ hở, tuyệt đối không vội tiết lộ thân phận."
        : "Đội ngũ này tạm thời an toàn, hãy tiếp tục phối hợp và chuyển hướng điều tra sang các đối tượng có biểu hiện thiếu tích cực khác."
    }
  };

  const realResult = privateState?.privateResults && privateState.privateResults.length > 0
    ? privateState.privateResults[privateState.privateResults.length - 1]
    : null;

  const displayResult = realResult || mockResult;

  const onAcknowledge = () => {
    navigate("/player/day/result");
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-4">
      {/* Switch between suspicious and safe for live demo */}
      <div className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-night-900/90 border border-night-700/80 text-xs">
        <span className="text-slate-400 font-medium">Báo cáo mật:</span>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => navigate(`/player/night/private-result?status=suspicious&target=${targetParam}`)}
            className={`px-2.5 py-1 rounded-lg font-bold text-xs transition-colors ${
              isSuspicious ? "bg-corruption-500/20 text-corruption-400 border border-corruption-500/40" : "text-slate-400 hover:text-white"
            }`}
          >
            ĐÁNG NGỜ (P-07)
          </button>
          <button
            type="button"
            onClick={() => navigate(`/player/night/private-result?status=safe&target=${targetParam}`)}
            className={`px-2.5 py-1 rounded-lg font-bold text-xs transition-colors ${
              !isSuspicious ? "bg-trust-500/20 text-trust-400 border border-trust-500/40" : "text-slate-400 hover:text-white"
            }`}
          >
            AN TOÀN (P-07-S)
          </button>
        </div>
      </div>

      <PrivateResultView
        role={activeRole}
        myTeamNumber={myTeam}
        targetTeamNumber={targetParam}
        roundNumber={publicState?.round || 1}
        result={displayResult}
        onAcknowledge={onAcknowledge}
      />
    </div>
  );
}
