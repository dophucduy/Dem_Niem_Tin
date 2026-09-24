import React, { useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { PlayerProvider, usePlayerGame } from "../../context/PlayerContext";
import { AppHeader } from "../../components/common/AppHeader";

function PlayerLayoutContent() {
  const { session, publicState, privateState } = usePlayerGame();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!session || !publicState) return;

    let target: string | null = null;
    switch (publicState.gamePhase) {
      case "LOBBY":
        target = "/player/lobby";
        break;
      case "ROLE_REVEAL":
        target = "/player/role";
        break;
      case "NIGHT_KNOWLEDGE":
        // The answer screen is part of this phase; wait there until the host advances.
        target = location.pathname === "/player/night/result" ? null : "/player/night/question";
        break;
      case "NIGHT_ABILITY":
        target = privateState?.abilityUnlocked ? "/player/night/ability" : "/player/night/observe";
        break;
      case "NIGHT_RESOLUTION":
        target = "/player/night/private-result";
        break;
      case "DAY_RESULT":
        target = "/player/day/result";
        break;
      case "DISCUSSION":
        target = "/player/day/discussion";
        break;
      case "VOTING":
        target = "/player/vote";
        break;
      case "VOTE_RESULT":
        target = "/player/vote/result";
        break;
      case "TRUST_UPDATE":
      case "NEXT_ROUND":
        target = "/player/day/result";
        break;
      case "FINAL":
        target = "/player/final";
        break;
    }

    if (target && location.pathname !== target) navigate(target, { replace: true });
  }, [session, publicState?.gamePhase, privateState?.abilityUnlocked, location.pathname, navigate]);

  const isNight = location.pathname.includes("/night");

  return (
    <div className="min-h-screen flex flex-col justify-between">
      {/* Dynamic Header */}
      <AppHeader
        roleMode="PLAYER"
        roomCode={session?.roomCode || "—"}
        teamDisplayName={session ? `Đội ${session.teamNumber}` : ""}
        phase={publicState?.phase || (isNight ? "NIGHT" : "LOBBY")}
        round={publicState?.round || 1}
        trust={publicState?.trust || 100}
      />

      {/* Main View Area */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <Outlet />
      </main>

    </div>
  );
}

export function PlayerLayout() {
  return (
    <PlayerProvider>
      <PlayerLayoutContent />
    </PlayerProvider>
  );
}
