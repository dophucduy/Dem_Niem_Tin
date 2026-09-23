import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import { PlayerProvider, usePlayerGame } from "../../context/PlayerContext";
import { AppHeader } from "../../components/common/AppHeader";

function PlayerLayoutContent() {
  const { session, publicState } = usePlayerGame();
  const location = useLocation();

  const isNight = location.pathname.includes("/night");

  return (
    <div className="min-h-screen flex flex-col justify-between">
      {/* Dynamic Header */}
      <AppHeader
        roleMode="PLAYER"
        roomCode={session?.roomCode || "NT8892"}
        teamDisplayName={`Đội ${session?.teamNumber || 4}`}
        phase={isNight ? "NIGHT" : (publicState?.phase || "LOBBY")}
        round={publicState?.round || 1}
        trust={publicState?.trust || 100}
      />

      {/* Main View Area */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <Outlet />
      </main>

      {/* Clean Footer */}
      <footer className="py-2.5 text-center text-xs text-slate-500">
        Đêm Niềm Tin • Giao diện đội chơi di động (&ge; 360px)
      </footer>
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
