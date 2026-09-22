import React, { useEffect, useState } from "react";
import { Shield, TrendingUp, TrendingDown } from "lucide-react";

interface TrustMeterProps {
  trust: number;
  delta?: number;
  variant?: "compact" | "broadcast";
  showLabel?: boolean;
}

export const TrustMeter: React.FC<TrustMeterProps> = ({
  trust = 100,
  delta,
  variant = "compact",
  showLabel = true,
}) => {
  const [displayDelta, setDisplayDelta] = useState<number | null>(null);

  // When delta arrives or changes, flash delta indicator for 3 seconds
  useEffect(() => {
    if (delta !== undefined && delta !== 0) {
      setDisplayDelta(delta);
      const timer = setTimeout(() => setDisplayDelta(null), 3500);
      return () => clearTimeout(timer);
    }
  }, [delta, trust]);

  const clampedTrust = Math.max(0, Math.min(100, Math.round(trust)));

  // Trust tier styling
  const getStatusColor = () => {
    if (clampedTrust >= 70) {
      return {
        bar: "bg-gradient-to-r from-trust-600 via-trust-500 to-righteous-400",
        text: "text-trust-300",
        border: "border-trust-500/40",
        glow: "shadow-glow",
        badge: "bg-trust-500/10 text-trust-400 border-trust-500/30",
        statusText: "VỮNG CHẮC",
      };
    }
    if (clampedTrust >= 35) {
      return {
        bar: "bg-gradient-to-r from-amber-600 to-amber-400",
        text: "text-amber-400",
        border: "border-amber-500/40",
        glow: "shadow-[0_0_20px_-5px_rgba(245,158,11,0.3)]",
        badge: "bg-amber-500/10 text-amber-400 border-amber-500/30",
        statusText: "DAO ĐỘNG",
      };
    }
    return {
      bar: "bg-gradient-to-r from-corruption-700 to-corruption-500",
      text: "text-corruption-400",
      border: "border-corruption-500/50",
      glow: "shadow-glow-danger",
      badge: "bg-corruption-500/10 text-corruption-400 border-corruption-500/30 animate-pulse",
      statusText: "NGUY CƠ",
    };
  };

  const style = getStatusColor();

  if (variant === "broadcast") {
    return (
      <div className={`glass-panel p-5 rounded-xl border ${style.border} ${style.glow} transition-all duration-300`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-night-800 border border-night-700">
              <Shield className={`w-6 h-6 ${style.text}`} />
            </div>
            <div>
              <div className="text-xs uppercase tracking-widest text-slate-400 font-semibold">
                Chỉ số xã hội
              </div>
              <div className="text-lg font-bold text-white tracking-wide">
                NIỀM TIN NHÂN DÂN
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {displayDelta !== null && (
              <div
                className={`flex items-center gap-1 font-mono font-bold text-base px-2.5 py-1 rounded-md border animate-badge-pop ${
                  displayDelta > 0
                    ? "bg-righteous-500/20 text-righteous-400 border-righteous-500/40"
                    : "bg-corruption-500/20 text-corruption-400 border-corruption-500/40"
                }`}
              >
                {displayDelta > 0 ? (
                  <>
                    <TrendingUp className="w-4 h-4" />
                    +{displayDelta}%
                  </>
                ) : (
                  <>
                    <TrendingDown className="w-4 h-4" />
                    {displayDelta}%
                  </>
                )}
              </div>
            )}

            <div className="flex items-baseline gap-1">
              <span className={`font-mono text-4xl font-extrabold tracking-tight ${style.text}`}>
                {clampedTrust}
              </span>
              <span className="text-lg font-bold text-slate-400">%</span>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-night-950 rounded-full h-4 p-0.5 border border-night-700/80 overflow-hidden relative">
          <div
            className={`h-full rounded-full transition-all duration-700 ease-out ${style.bar}`}
            style={{ width: `${clampedTrust}%` }}
          />
          {/* Subtle grid lines at 25%, 50%, 75% */}
          <div className="absolute inset-0 flex justify-between px-[25%] pointer-events-none opacity-20">
            <div className="w-px h-full bg-white" />
            <div className="w-px h-full bg-white" />
          </div>
        </div>

        {/* Bottom footer indicators */}
        <div className="flex justify-between items-center mt-2.5 text-xs">
          <span className="text-slate-400">
            Trạng thái:{" "}
            <span className={`px-2 py-0.5 rounded border text-[11px] font-medium ${style.badge}`}>
              {style.statusText}
            </span>
          </span>
          <span className="text-slate-500 font-mono">0% — 100%</span>
        </div>
      </div>
    );
  }

  // Compact variant (Mobile / Player View)
  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex justify-between items-center mb-1.5 text-xs">
          <span className="text-slate-300 font-medium flex items-center gap-1.5">
            <Shield className={`w-3.5 h-3.5 ${style.text}`} />
            Niềm tin nhân dân
          </span>
          <div className="flex items-center gap-2">
            {displayDelta !== null && (
              <span
                className={`font-mono font-bold text-[11px] px-1.5 py-0.2 rounded ${
                  displayDelta > 0 ? "text-righteous-400 bg-righteous-500/10" : "text-corruption-400 bg-corruption-500/10"
                }`}
              >
                {displayDelta > 0 ? `+${displayDelta}%` : `${displayDelta}%`}
              </span>
            )}
            <span className={`font-mono font-bold ${style.text}`}>{clampedTrust}%</span>
          </div>
        </div>
      )}

      <div className="w-full bg-night-950 rounded-full h-2 border border-night-700 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${style.bar}`}
          style={{ width: `${clampedTrust}%` }}
        />
      </div>
    </div>
  );
};

