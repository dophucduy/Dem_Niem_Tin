import React, { useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useHostGame } from "../../context/HostContext";
import { HostVoteResultStage, EliminationDetails } from "../../components/host/HostVoteResultStage";

export function HostVoteResultPage() {
  const navigate = useNavigate();
  const { publicState, teams, loading, runGameCommand } = useHostGame();

  const round = publicState?.round || 1;
  const trust = publicState?.trust ?? 100;

  const eliminationData = useMemo<EliminationDetails | undefined>(() => {
    if (!publicState?.publicEvents) return undefined;

    const voteEvent = [...publicState.publicEvents]
      .reverse()
      .find((ev) => ev.type === "ELIMINATION" || ev.type === "VOTE_TIE");

    if (!voteEvent) return undefined;

    try {
      return JSON.parse(voteEvent.message);
    } catch {
      return {
        round,
        isTie: voteEvent.type === "VOTE_TIE",
      };
    }
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
