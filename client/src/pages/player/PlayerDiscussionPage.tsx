import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { usePlayerGame } from "../../context/PlayerContext";
import { DiscussionView } from "../../components/player/DiscussionView";
import { Clue, PrivateResult } from "@dem-niem-tin/shared";

export function PlayerDiscussionPage() {
  const navigate = useNavigate();
  const { publicState, privateState, session, activeRole } = usePlayerGame();

  const [isReady, setIsReady] = useState(false);
  const [localEndsAt] = useState(() => Date.now() + 90 * 1000);

  const round = publicState?.round || 1;
  const myTeamNumber = session?.teamNumber || 4;
  const role = activeRole || privateState?.role || "INSPECTOR";
  const effState = privateState?.effectiveState || "SPECIAL";
  const phaseEndsAt = publicState?.phaseEndsAt ?? localEndsAt;
  const paused = publicState?.paused ?? false;

  // Fallback demo clues if server hasn't sent any
  const publicClues: Clue[] = publicState?.publicClues?.length 
    ? publicState.publicClues 
    : [
        {
          id: "clue-1",
          title: "Bản kê khai tài sản có dấu hiệu chỉnh sửa",
          description: "Một tài liệu nặc danh xuất hiện tại phòng văn thư, chỉ ra có sự chênh lệch lớn giữa thu nhập thực tế và tài sản sở hữu.",
          visibility: "public",
          revealedAt: Date.now(),
        },
      ];

  // Private findings from privateState
  const privateResults: PrivateResult[] = privateState?.privateResults?.length
    ? privateState.privateResults
    : [
        {
          id: "res-demo",
          type: "INSPECTION_RESULT",
          message: "Mục tiêu Đội 2: CÓ DẤU HIỆU ĐÁNG NGỜ (Người Vụ Lợi). Hãy khéo léo dẫn dắt thảo luận!",
          createdAt: Date.now(),
        }
      ];

  // Phase Guard & Auto-transition when server advances to VOTING
  useEffect(() => {
    if (session && publicState) {
      if (publicState.phase === "VOTING") {
        navigate("/player/vote");
      } else if (publicState.phase === "NIGHT") {
        if (publicState.activeQuestion !== undefined) {
          navigate("/player/night/question");
        } else {
          navigate("/player/night/ability");
        }
      } else if (publicState.phase === "LOBBY") {
        navigate("/player/role");
      }
    }
  }, [session, publicState?.phase, publicState?.activeQuestion, navigate]);

  const handleReadyToVote = () => {
    setIsReady(true);
    // In standalone test mode without session, allow direct jump for testing
    if (!session) {
      navigate("/player/vote");
    }
  };

  return (
    <DiscussionView
      round={round}
      myTeamNumber={myTeamNumber}
      role={role}
      effectiveState={effState}
      phaseEndsAt={phaseEndsAt}
      paused={paused}
      publicClues={publicClues}
      privateResults={privateResults}
      onReadyToVote={handleReadyToVote}
      isReady={isReady}
    />
  );
}
