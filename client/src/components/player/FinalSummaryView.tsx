import React from "react";
import { Role, Faction, PublicTeam } from "@dem-niem-tin/shared";
import { ROLE_DEFINITIONS } from "../../data/roleDefinitions";
import { TrustMeter } from "../common/TrustMeter";
import { GameButton } from "../common/GameButton";
import { Award, LogOut, Shield, BookOpen, CheckCircle } from "lucide-react";

interface FinalSummaryViewProps {
  myTeamNumber: number;
  myRole: Role;
  myFaction: Faction;
  isMyTeamEliminated: boolean;
  trust: number;
  teams: PublicTeam[];
  onLeaveRoom: () => void;
}

export const FinalSummaryView: React.FC<FinalSummaryViewProps> = ({
  myTeamNumber,
  myRole,
  myFaction,
  isMyTeamEliminated,
  trust,
  teams,
  onLeaveRoom,
}) => {
  const isVictory = trust >= 50;
  const roleInfo = ROLE_DEFINITIONS[myRole];
  const isTrustFaction = myFaction === "TRUST";

  return (
    <div className="w-full max-w-md mx-auto space-y-5 animate-fade-in pb-8">
      {/* Top Banner */}
      <div className="text-center space-y-1.5">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-night-800 border border-night-600 text-[11px] font-mono tracking-wider text-trust-400 uppercase">
          TỔNG KẾT BÀI HỌC • CHUYÊN ĐỀ KẾT THÚC
        </div>
        <h1 className="text-2xl font-black text-white">
          {isVictory ? "BẢO VỆ THÀNH CÔNG NIỀM TIN" : "KẾT QUẢ CHUYÊN ĐỀ"}
        </h1>
        <p className="text-xs text-slate-400">
          Chỉ số niềm tin chung cuộc đạt <strong className="text-trust-400">{trust}/100</strong>
        </p>
      </div>

      {/* Trust Meter */}
      <div className="glass-panel rounded-2xl p-4 border border-night-700">
        <TrustMeter trust={trust} variant="compact" />
      </div>

      {/* Your Team Outcome */}
      <div className="glass-panel-elevated rounded-2xl p-5 border border-night-700 space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-trust-500/20 border border-trust-500/40 flex items-center justify-center text-trust-400">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-wider text-slate-400 font-bold">
              ĐỘI {myTeamNumber} • {roleInfo?.name || "VAI TRÒ BÍ MẬT"}
            </div>
            <div className="text-sm font-extrabold text-white">
              {isTrustFaction ? "Phe Niềm Tin & Liêm Chính" : "Phe Tiêu Cực & Thoái Hóa"}
            </div>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-night-900/80 border border-night-700 text-xs text-slate-300 leading-relaxed">
          {isMyTeamEliminated
            ? "Đội của bạn đã bị loại qua các vòng bỏ phiếu nhưng đã đóng góp tích cực vào tiến trình thảo luận chung của lớp."
            : "Đội của bạn đã trụ vững thành công qua 3 vòng thi đấu mà không bị loại bỏ."}
        </div>
      </div>

      {/* Pedagogical Summary */}
      <div className="glass-panel rounded-2xl p-5 border border-night-700 space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-wider">
          <BookOpen className="w-4 h-4 text-righteous-400" />
          BÀI HỌC VỀ TƯ TƯỞNG HỒ CHÍ MINH
        </div>
        <div className="space-y-2 text-xs text-slate-300">
          <div className="flex items-start gap-2">
            <CheckCircle className="w-3.5 h-3.5 text-righteous-400 shrink-0 mt-0.5" />
            <span>Nâng cao năng lực tự phê bình và phê bình trong tổ chức.</span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle className="w-3.5 h-3.5 text-righteous-400 shrink-0 mt-0.5" />
            <span>Chống chủ nghĩa cá nhân, thực hành liêm chính và công tâm.</span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle className="w-3.5 h-3.5 text-righteous-400 shrink-0 mt-0.5" />
            <span>Bảo vệ vững chắc niềm tin của nhân dân đối với Đảng và chế độ.</span>
          </div>
        </div>
      </div>

      {/* Exit Button */}
      <div className="pt-2">
        <GameButton
          variant="outline"
          size="lg"
          fullWidth
          onClick={onLeaveRoom}
          icon={<LogOut className="w-4 h-4" />}
        >
          RỜI PHÒNG & QUAY VỀ TRANG CHỦ
        </GameButton>
      </div>
    </div>
  );
};
