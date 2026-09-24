import React, { useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { usePlayerGame } from "../../context/PlayerContext";
import { VoteResultView } from "../../components/player/VoteResultView";

export function PlayerVoteResultPage() {
  const navigate = useNavigate();
  const { publicState, session, teams } = usePlayerGame();

  const round = publicState?.round || 1;
  const trust = publicState?.trust ?? 100;
  const myTeamNumber = session?.teamNumber || 4;

  const myTeam = teams.find((t) => t.teamNumber === myTeamNumber);
  const isMyTeamEliminated = myTeam?.eliminated ?? false;

  const voteData = useMemo(() => {
    if (!publicState?.publicEvents) return undefined;

    const voteEvent = [...publicState.publicEvents]
      .reverse()
      .find((ev) => ev.type === "ELIMINATION" || ev.type === "VOTE_TIE");

    if (!voteEvent) return undefined;

    try {
      const parsed = JSON.parse(voteEvent.message);
      return parsed;
    } catch {
      return undefined;
    }
  }, [publicState?.publicEvents, teams, round]);

  // Phase Guard: When server moves to NIGHT or FINAL, auto-advance
  useEffect(() => {
    if (session && publicState) {
      if (publicState.phase === "NIGHT") {
        if (isMyTeamEliminated) {
          navigate("/player/night/observe");
        } else if (publicState.activeQuestion !== undefined) {
          navigate("/player/night/question");
        } else {
          navigate("/player/night/ability");
        }
      } else if (publicState.phase === "FINAL") {
        navigate("/player/final");
      } else if (publicState.phase === "LOBBY") {
        navigate("/player/lobby");
      }
    }
  }, [session, publicState?.phase, publicState?.activeQuestion, isMyTeamEliminated, navigate]);

  return (
    <VoteResultView
      round={round}
      myTeamNumber={myTeamNumber}
      isMyTeamEliminated={isMyTeamEliminated}
      eliminatedTeamNumber={voteData?.eliminatedTeamNumber}
      eliminatedTeamName={voteData?.eliminatedTeamName}
      votesReceived={voteData?.votesReceived}
      faction={voteData?.faction}
      trustDelta={voteData?.trustDelta}
      isTie={voteData?.isTie}
      trust={trust}
      voteDistribution={voteData?.voteDistribution}
    />
  );
}
