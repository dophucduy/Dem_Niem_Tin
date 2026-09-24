import React, { useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { HostProvider, useHostGame } from "../../context/HostContext";
import { AppHeader } from "../../components/common/AppHeader";

function HostLayoutContent() {
  const { lobby, publicState } = useHostGame();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!publicState) return;
    const routes = {
      LOBBY: "/host",
      ROLE_REVEAL: "/host/role-reveal",
      NIGHT_KNOWLEDGE: "/host/night",
      NIGHT_ABILITY: "/host/night",
      NIGHT_RESOLUTION: "/host/night",
      DAY_RESULT: "/host/day-result",
      DISCUSSION: "/host/discussion",
      VOTING: "/host/voting",
      VOTE_RESULT: "/host/vote-result",
      TRUST_UPDATE: "/host/vote-result",
      NEXT_ROUND: "/host/vote-result",
      FINAL: "/host/final",
    } as const;
    const target = routes[publicState.gamePhase];
    if (location.pathname !== target) navigate(target, { replace: true });
  }, [publicState?.gamePhase, location.pathname, navigate]);

  const isNight = location.pathname.includes("/night");
  const isRoleReveal = location.pathname.includes("/role-reveal");

  return (
    <div className="min-h-screen flex flex-col justify-between">
      <AppHeader
        roleMode="HOST"
        roomCode={lobby?.roomCode || "NT8892"}
        round={publicState?.round || 1}
        phase={publicState?.phase || (isNight || isRoleReveal ? "NIGHT" : "LOBBY")}
        phaseEndsAt={publicState?.phaseEndsAt}
        paused={publicState?.paused}
        trust={publicState?.trust || 100}
      />

      <main className="flex-1 flex items-center justify-center p-4 sm:p-8">
        <Outlet />
      </main>

    </div>
  );
}

export function HostLayout() {
  return (
    <HostProvider>
      <HostLayoutContent />
    </HostProvider>
  );
}

