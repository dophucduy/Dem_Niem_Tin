import React, { useState } from "react";
import { Role } from "@dem-niem-tin/shared";
import { usePlayerGame } from "../../context/PlayerContext";
import { RoleRevealView } from "../../components/player/RoleRevealView";

export function PlayerRolePage() {
  const { 
    activeRole, 
    session, 
    privateState, 
    handleConfirmReady 
  } = usePlayerGame();

  const [hasConfirmed, setHasConfirmed] = useState(false);

  const currentRole: Role | undefined = privateState?.role || activeRole;

  if (!currentRole || !privateState) {
    return <div className="w-full max-w-md rounded-2xl border border-night-700 bg-night-900 p-5 text-center text-slate-300">Đang chờ vai trò bí mật từ máy chủ.</div>;
  }

  const currentFaction = privateState.faction;

  const onConfirm = () => {
    setHasConfirmed(true);
    handleConfirmReady();
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-4">
      <RoleRevealView
        role={currentRole}
        faction={currentFaction}
        teamNumber={session?.teamNumber || 1}
        onConfirmReady={onConfirm}
        isReady={hasConfirmed}
      />

      {hasConfirmed && (
        <div className="p-3 rounded-2xl bg-night-950/80 border border-trust-500/40 text-center space-y-1">
          <div className="text-xs font-bold text-trust-300 flex items-center justify-center gap-1.5 font-mono">
            <span className="w-2 h-2 rounded-full bg-trust-400 animate-ping" />
            ĐÃ SẴN SÀNG • CHỜ GIẢNG VIÊN MỞ ĐÊM
          </div>
        </div>
      )}
    </div>
  );
}
