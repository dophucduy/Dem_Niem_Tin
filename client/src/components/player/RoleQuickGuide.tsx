import React, { useState } from "react";
import { Role } from "@dem-niem-tin/shared";
import { ROLE_DEFINITIONS } from "../../data/roleDefinitions";
import { ChevronDown, ChevronUp, ShieldCheck, AlertTriangle, Zap } from "lucide-react";

interface RoleQuickGuideProps {
  role: Role;
  myTeamNumber: number;
  defaultOpen?: boolean;
}

/**
 * Collapsible role reminder so players can re-read their role, ability and
 * guidance at any point of the night or day without leaving the screen.
 */
export const RoleQuickGuide: React.FC<RoleQuickGuideProps> = ({
  role,
  myTeamNumber,
  defaultOpen = false,
}) => {
  const [open, setOpen] = useState(defaultOpen);
  const roleInfo = ROLE_DEFINITIONS[role];

  if (!roleInfo) return null;

  const isCorruption = roleInfo.faction === "CORRUPTION";

  return (
    <div className="glass-panel rounded-2xl border border-night-700 overflow-hidden text-left">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-2 px-4 py-3 transition-colors hover:bg-night-900/60"
      >
        <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-300">
          <Zap className="w-4 h-4 text-trust-400" />
          Vai trò &amp; Năng lực • Đội {myTeamNumber}
        </span>
        {open ? (
          <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" />
        ) : (
          <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
        )}
      </button>

      {open && (
        <div className="px-4 pb-4 pt-3 space-y-3 border-t border-night-700/70">
          <div className="flex items-center justify-between gap-2">
            <div
              className={`text-sm font-black tracking-wide ${
                isCorruption ? "text-corruption-400" : "text-justice-300"
              }`}
            >
              {roleInfo.name}
            </div>
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black tracking-wider uppercase border ${
                isCorruption
                  ? "bg-corruption-950 text-corruption-400 border-corruption-600/60"
                  : "bg-justice-950 text-justice-300 border-justice-600/60"
              }`}
            >
              {isCorruption ? (
                <>
                  <AlertTriangle className="w-3 h-3" />
                  PHE THAM NHŨNG
                </>
              ) : (
                <>
                  <ShieldCheck className="w-3 h-3" />
                  PHE BẢO VỆ NIỀM TIN
                </>
              )}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-night-950/80 border border-night-700 space-y-1.5">
            <div className="flex items-center gap-1.5 text-[11px] font-mono font-bold text-trust-400 uppercase tracking-wider">
              <Zap className="w-3.5 h-3.5" />
              Năng lực: {roleInfo.abilityName}
            </div>
            <p className="text-[11px] text-slate-200 leading-relaxed">{roleInfo.abilityDetail}</p>
          </div>

          {role === "CORRUPTOR" && (
            <div className="space-y-1 text-[11px] text-slate-300 leading-relaxed">
              <div className="font-bold text-corruption-400 uppercase tracking-wider text-[10px]">
                Hai chế độ hành động:
              </div>
              <p>
                • <strong className="text-white">Gieo nhiễu niềm tin:</strong> làm giảm 15 điểm
                Niềm tin nhân dân của đội mục tiêu.
              </p>
              <p>
                • <strong className="text-white">Can thiệp điều tra:</strong> đảo ngược kết luận
                điều tra của Thanh tra về đội mục tiêu trong đêm nay (bị vô hiệu hóa nếu đội đó
                được Pháp luật bảo vệ).
              </p>
            </div>
          )}

          <p className="text-[11px] text-slate-400 leading-relaxed">
            <span className="font-bold text-slate-300">Ghi chú:</span> {roleInfo.guideNote}
          </p>
        </div>
      )}
    </div>
  );
};
