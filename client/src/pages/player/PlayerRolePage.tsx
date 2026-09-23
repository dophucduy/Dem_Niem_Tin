import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Role } from "@dem-niem-tin/shared";
import { usePlayerGame } from "../../context/PlayerContext";
import { RoleRevealView } from "../../components/player/RoleRevealView";
import { GameButton } from "../../components/common/GameButton";
import { Moon } from "lucide-react";

const VALID_ROLES: Role[] = [
  "INSPECTOR",
  "CORRUPTOR",
  "LAW",
  "WHISTLEBLOWER",
  "OVERSIGHT",
  "SPECIAL_6",
  "SPECIAL_7",
];

export function PlayerRolePage() {
  const navigate = useNavigate();
  const { role: urlRole } = useParams<{ role?: string }>();
  const { 
    activeRole, 
    setActiveRole, 
    session, 
    privateState, 
    publicState, 
    handleConfirmReady 
  } = usePlayerGame();

  const [hasConfirmed, setHasConfirmed] = useState(false);

  // Auto-navigate to night question when server transitions to NIGHT phase
  useEffect(() => {
    if (publicState && publicState.phase === "NIGHT") {
      navigate("/player/night/question");
    }
  }, [publicState?.phase, navigate]);

  const currentRole: Role = (urlRole && VALID_ROLES.includes(urlRole as Role))
    ? (urlRole as Role)
    : (privateState?.role || activeRole);

  const currentFaction = privateState?.faction || (currentRole === "CORRUPTOR" ? "CORRUPTION" : "TRUST");

  const onConfirm = () => {
    setHasConfirmed(true);
    handleConfirmReady();
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-4">
      {/* Quick Role Switcher for direct testing */}
      <div className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-night-900/90 border border-night-700/80 text-xs">
        <span className="text-slate-400 font-medium">Đổi vai trò xem thử:</span>
        <select
          value={currentRole}
          onChange={(e) => {
            const newRole = e.target.value as Role;
            setActiveRole(newRole);
            navigate(`/player/role/${newRole}`);
          }}
          className="bg-night-800 border border-night-600 rounded px-2.5 py-1 text-trust-300 font-bold outline-none cursor-pointer"
        >
          <option value="INSPECTOR">Thanh Tra</option>
          <option value="CORRUPTOR">Người Vụ Lợi</option>
          <option value="LAW">Pháp Luật</option>
          <option value="WHISTLEBLOWER">Người Tố Giác</option>
          <option value="OVERSIGHT">Cơ Quan Giám Sát</option>
          <option value="SPECIAL_6">Giám Sát Tài Sản</option>
          <option value="SPECIAL_7">Minh Bạch Thông Tin</option>
        </select>
      </div>

      <RoleRevealView
        role={currentRole}
        faction={currentFaction}
        teamNumber={session?.teamNumber || 1}
        onConfirmReady={onConfirm}
        isReady={hasConfirmed}
      />

      {/* Manual button to proceed to Night in test/demo mode */}
      <div className="pt-1">
        <GameButton
          variant="outline"
          size="sm"
          fullWidth
          icon={<Moon className="w-4 h-4 text-trust-300" />}
          onClick={() => navigate("/player/night/question")}
        >
          TIẾN VÀO THỬ THÁCH TRI THỨC (P-04)
        </GameButton>
      </div>
    </div>
  );
}
