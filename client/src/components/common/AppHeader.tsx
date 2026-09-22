import React from "react";
import { Scale } from "lucide-react";
import { PublicPhase } from "@dem-niem-tin/shared";
import { StatusBadge } from "./StatusBadge";
import { PhaseTimer } from "./PhaseTimer";
import { TrustMeter } from "./TrustMeter";

interface AppHeaderProps {
  roleMode: "HOST" | "PLAYER";
  roomCode?: string;
  round?: number;
  phase?: PublicPhase;
  phaseEndsAt?: number;
  paused?: boolean;
  trust?: number;
  trustDelta?: number;
  teamDisplayName?: string;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  roleMode,
  roomCode,
  round = 1,
  phase = "LOBBY",
  phaseEndsAt,
  paused = false,
  trust = 100,
  trustDelta,
  teamDisplayName,
}) => {
  if (roleMode === "PLAYER") {
    return (
      <header className="sticky top-0 z-40 w-full glass-panel border-b border-night-700/80 px-4 py-2.5">
        <div className="flex items-center justify-between gap-3 mb-2">
          {/* Logo & Team */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-trust-500/10 border border-trust-500/30 flex items-center justify-center text-trust-400">
              <Scale className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Đêm Niềm Tin
              </h1>
              <div className="text-sm font-extrabold text-white">
                {teamDisplayName || `Phòng: ${roomCode || "---"}`}
              </div>
            </div>
          </div>

          {/* Phase Badge & Timer */}
          <div className="flex items-center gap-2">
            <StatusBadge kind="phase" phase={phase} round={round} />
            {phaseEndsAt && (
              <PhaseTimer phaseEndsAt={phaseEndsAt} paused={paused} size="sm" />
            )}
          </div>
        </div>

        {/* Compact Trust bar */}
        {phase !== "LOBBY" && (
          <TrustMeter trust={trust} delta={trustDelta} variant="compact" />
        )}
      </header>
    );
  }

  // HOST Broadcast Header
  return (
    <header className="w-full glass-panel border-b border-night-700/80 px-8 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-8">
        {/* Logo / Game title */}
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-trust-500/20 to-night-800 border border-trust-500/40 flex items-center justify-center text-trust-400 shadow-glow">
            <Scale className="w-7 h-7" />
          </div>
          <div>
            <div className="text-xs font-bold uppercase tracking-[0.25em] text-trust-400/80">
              Trò chơi giáo dục chuyên đề
            </div>
            <h1 className="text-2xl font-black tracking-wider text-white">
              ĐÊM NIỀM TIN
            </h1>
          </div>
        </div>

        {/* Center: Phase & Round */}
        <div className="flex items-center gap-4">
          <StatusBadge kind="phase" phase={phase} round={round} />
          {roomCode && (
            <div className="px-3 py-1 rounded-lg bg-night-900 border border-night-700 text-xs font-mono text-slate-300">
              Mã phòng: <span className="font-bold text-trust-400">{roomCode}</span>
            </div>
          )}
        </div>

        {/* Right: Timer & Trust mini preview if not full page */}
        <div className="flex items-center gap-4">
          {phaseEndsAt && (
            <PhaseTimer phaseEndsAt={phaseEndsAt} paused={paused} size="md" />
          )}
        </div>
      </div>
    </header>
  );
};

