import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { usePlayerGame } from "../../context/PlayerContext";
import { DiscussionView } from "../../components/player/DiscussionView";
import { Clue, PrivateResult } from "@dem-niem-tin/shared";

export function PlayerDiscussionPage() {
  const navigate = useNavigate();
  const { publicState, privateState, session, activeRole, handleSendReaction, reactionCooldown } = usePlayerGame();

  const [isReady, setIsReady] = useState(false);

  const round = publicState?.round || 1;
  const myTeamNumber = session?.teamNumber || 4;
  const role = activeRole || privateState?.role;
  const effState = privateState?.effectiveState;
  const phaseEndsAt = publicState?.phaseEndsAt;
  const paused = publicState?.paused ?? false;

  const publicClues: Clue[] = publicState?.publicClues ?? [];

  // Private findings from privateState
  const privateResults: PrivateResult[] = privateState?.privateResults ?? [];

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

  if (!role || !effState) {
    return <div className="w-full max-w-md rounded-2xl border border-night-700 bg-night-900 p-5 text-center text-slate-300">Đang chờ trạng thái người chơi từ máy chủ.</div>;
  }

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
      onSendReaction={handleSendReaction}
      reactionCooldown={reactionCooldown}
    />
  );
}
