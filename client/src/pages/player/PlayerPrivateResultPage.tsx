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
