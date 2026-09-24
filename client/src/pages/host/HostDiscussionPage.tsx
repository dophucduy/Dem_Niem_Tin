import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useHostGame } from "../../context/HostContext";
import { HostDiscussionStage } from "../../components/host/HostDiscussionStage";
import { Clue } from "@dem-niem-tin/shared";

export function HostDiscussionPage() {
  const navigate = useNavigate();
  const { publicState, teams, loading, runGameCommand } = useHostGame();

  const [localPaused, setLocalPaused] = useState(false);
  const [localEndsAt] = useState(() => Date.now() + 90 * 1000);

  const round = publicState?.round || 1;
  const trust = publicState?.trust ?? 100;
  const paused = publicState?.paused ?? localPaused;
  const phaseEndsAt = publicState?.phaseEndsAt ?? localEndsAt;

  // Fallback demo clues if server hasn't sent any yet
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

  // Auto-transition to voting stage when server advances to VOTING
  useEffect(() => {
    if (publicState && publicState.phase === "VOTING") {
      navigate("/host/voting");
    }
  }, [publicState?.phase, navigate]);

  const handlePauseToggle = () => {
    if (publicState) {
      runGameCommand(paused ? "resume" : "pause");
    } else {
      setLocalPaused(!localPaused);
    }
  };

  const handleSkipTimer = () => {
    runGameCommand("skip");
    navigate("/host/voting");
  };

  const handleRestart = () => {
    runGameCommand("restart");
  };

  return (
    <HostDiscussionStage
      round={round}
      trust={trust}
      phaseEndsAt={phaseEndsAt}
      paused={paused}
      publicClues={publicClues}
      teams={teams}
      onPauseToggle={handlePauseToggle}
      onSkipTimer={handleSkipTimer}
      onRestartRound={handleRestart}
      loading={loading}
    />
  );
}

