import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import { HostProvider, useHostGame } from "../../context/HostContext";
import { AppHeader } from "../../components/common/AppHeader";

function HostLayoutContent() {
  const { lobby, publicState } = useHostGame();
  const location = useLocation();

  const isNight = location.pathname.includes("/night");
  const isRoleReveal = location.pathname.includes("/role-reveal");

  return (
    <div className="min-h-screen flex flex-col justify-between">
      <AppHeader
        roleMode="HOST"
        roomCode={lobby?.roomCode || "NT8892"}
        round={publicState?.round || 1}
        phase={isNight ? "NIGHT" : (isRoleReveal ? "NIGHT" : (publicState?.phase || "LOBBY"))}
        phaseEndsAt={publicState?.phaseEndsAt}
        paused={publicState?.paused}
        trust={publicState?.trust || 100}
      />

      <main className="flex-1 flex items-center justify-center p-4 sm:p-8">
        <Outlet />
      </main>

      <footer className="py-2 text-center text-xs text-slate-500">
        Đêm Niềm Tin — Phiên bản máy chiếu lớp học 1080p
      </footer>
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

