import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { usePlayerGame } from "../../context/PlayerContext";
import { VotingBallotView } from "../../components/player/VotingBallotView";

export function PlayerVotingPage() {
  const navigate = useNavigate();
  const { 
    publicState, 
    session, 
    teams, 
    loading, 
    handleSubmitVote 
  } = usePlayerGame();

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [votedTarget, setVotedTarget] = useState<number | undefined>(undefined);
  const [localEndsAt] = useState(() => Date.now() + 45 * 1000);

  const round = publicState?.round || 1;
  const myTeamNumber = session?.teamNumber || 4;
  const phaseEndsAt = publicState?.phaseEndsAt ?? localEndsAt;
  const paused = publicState?.paused ?? false;

  // Phase Guard: Must be in VOTING phase to cast ballot
  useEffect(() => {
    if (session && publicState) {
      if (publicState.phase === "DAY") {
        navigate("/player/day/discussion");
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

  const handleVote = (targetTeamNumber: number, reason?: string) => {
    handleSubmitVote(
      targetTeamNumber,
      () => {
        setIsSubmitted(true);
        setVotedTarget(targetTeamNumber);
      },
      (err) => {
        alert(err || "Lỗi khi nộp phiếu bầu.");
      }
    );
  };

  return (
    <VotingBallotView
      round={round}
      myTeamNumber={myTeamNumber}
      teams={teams}
      phaseEndsAt={phaseEndsAt}
      paused={paused}
      onSubmitVote={handleVote}
      loading={loading}
      isSubmitted={isSubmitted}
      votedTargetTeamNumber={votedTarget}
    />
  );
}

