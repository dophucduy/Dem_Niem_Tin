import React, { useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useHostGame } from "../../context/HostContext";
import { HostVoteResultStage, EliminationDetails } from "../../components/host/HostVoteResultStage";
import { extractVoteDetails } from "../../utils/voteResult";

export function HostVoteResultPage() {
  const navigate = useNavigate();
  const { publicState, teams, loading, runGameCommand } = useHostGame();

  const round = publicState?.round || 1;
  const trust = publicState?.trust ?? 100;

  const eliminationData = useMemo<EliminationDetails | undefined>(() => {
    const details = extractVoteDetails(publicState?.publicEvents, round);
    if (!details) return undefined;

    return {
      round: details.round,
      eliminatedTeamNumber: details.eliminatedTeamNumber,
      eliminatedTeamName: details.eliminatedTeamName,
      votesReceived: details.votesReceived,
      faction: details.faction,
      role: details.role,
      trustDelta: details.trustDelta,
      isTie: details.isTie,
      voteDistribution: details.voteDistribution.map((entry) => ({
        teamNumber: entry.teamNumber,
        teamName: entry.displayName,
        votes: entry.votes,
      })),
    };
  }, [publicState?.publicEvents, round]);

  useEffect(() => {
    if (publicState) {
      if (publicState.phase === "FINAL") {
        navigate("/host/final");
      } else if (publicState.phase === "NIGHT") {
        navigate("/host/night");
      }
    }
  }, [publicState?.phase, navigate]);

  const handleNextPhase = () => {
    runGameCommand("skip");
    if (round >= 3) {
      navigate("/host/final");
    } else {
      navigate("/host/night");
    }
  };

  const handleRestart = () => {
    runGameCommand("restart");
    navigate("/host/night");
  };

  return (
    <HostVoteResultStage
      round={round}
      trust={trust}
      teams={teams}
      eliminationData={eliminationData}
      onNextPhase={handleNextPhase}
      onRestartRound={handleRestart}
      loading={loading}
    />
  );
}
