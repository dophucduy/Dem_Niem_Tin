import React, { useEffect, useState } from "react";
import { Clock, Pause } from "lucide-react";

interface PhaseTimerProps {
  phaseEndsAt?: number;
  paused?: boolean;
  size?: "sm" | "md" | "lg";
  showIcon?: boolean;
  onExpire?: () => void;
}

export const PhaseTimer: React.FC<PhaseTimerProps> = ({
  phaseEndsAt,
  paused = false,
  size = "md",
  showIcon = true,
  onExpire,
}) => {
  const [remainingSeconds, setRemainingSeconds] = useState<number>(() => {
    if (!phaseEndsAt) return 0;
    return Math.max(0, Math.ceil((phaseEndsAt - Date.now()) / 1000));
  });

  useEffect(() => {
    if (!phaseEndsAt || paused) return;

    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.ceil((phaseEndsAt - Date.now()) / 1000));
      setRemainingSeconds(remaining);

      if (remaining <= 0) {
        clearInterval(interval);
        onExpire?.();
      }
    }, 500);

    return () => clearInterval(interval);
  }, [phaseEndsAt, paused, onExpire]);

  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  const formattedTime = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  const isUrgent = remainingSeconds <= 15 && remainingSeconds > 0;
  const isExpired = remainingSeconds <= 0 && phaseEndsAt !== undefined;

  // Size styling
  const sizeConfig = {
    sm: {
      box: "px-2.5 py-1 text-sm gap-1.5",
      icon: "w-3.5 h-3.5",
      text: "text-sm",
    },
    md: {
      box: "px-3.5 py-1.5 text-base gap-2",
      icon: "w-4 h-4",
      text: "text-base font-semibold",
    },
    lg: {
      box: "px-6 py-3 text-2xl gap-3",
      icon: "w-6 h-6",
      text: "text-2xl font-bold tracking-wider",
    },
  }[size];

  // Visual status
  let statusClasses = "bg-night-900/80 border-night-700 text-slate-200";
  if (paused) {
    statusClasses = "bg-amber-950/40 border-amber-600/50 text-amber-300";
  } else if (isUrgent) {
    statusClasses = "bg-corruption-950/60 border-corruption-500 text-corruption-400 animate-pulse";
  } else if (isExpired) {
    statusClasses = "bg-night-950 border-slate-700 text-slate-500";
  }

  return (
    <div
      className={`inline-flex items-center rounded-lg border font-mono backdrop-blur-sm transition-colors ${sizeConfig.box} ${statusClasses}`}
    >
      {showIcon && (
        paused ? (
          <Pause className={`${sizeConfig.icon} text-amber-400`} />
        ) : (
          <Clock className={`${sizeConfig.icon} ${isUrgent ? "text-corruption-400" : "text-slate-400"}`} />
        )
      )}
      <span className={sizeConfig.text}>
        {paused ? "TẠM DỪNG" : formattedTime}
      </span>
    </div>
  );
};

