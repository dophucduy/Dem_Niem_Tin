import React, { useState } from "react";
import { Role, EffectiveState } from "@dem-niem-tin/shared";
import { ROLE_DEFINITIONS } from "../../data/roleDefinitions";
import { 
  Zap, 
  Target, 
  ShieldCheck, 
  Search, 
  Eye, 
  Flame, 
  Coins, 
  Share2, 
  FileWarning, 
  Lock, 
  Check, 
  AlertTriangle, 
  Clock, 
  Moon,
  Users
} from "lucide-react";
import { GameButton } from "../common/GameButton";

interface TeamOption {
  teamNumber: number;
  displayName?: string;
  eliminated?: boolean;
}

interface NightAbilityViewProps {
  role: Role;
  effectiveState: EffectiveState;
  myTeamNumber: number;
  teams?: TeamOption[];
  onExecuteAbility: (targetTeamNumber?: number, extraData?: string) => void;
  onProceedToResult?: () => void;
  isSubmitted?: boolean;
  loading?: boolean;
}

export const NightAbilityView: React.FC<NightAbilityViewProps> = ({
  role,
  effectiveState,
  myTeamNumber,
  teams = Array.from({ length: 8 }, (_, i) => ({ teamNumber: i + 1, eliminated: false })),
  onExecuteAbility,
  onProceedToResult,
  isSubmitted = false,
  loading = false,
}) => {
  const [selectedTarget, setSelectedTarget] = useState<number | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [hasSubmittedLocally, setHasSubmittedLocally] = useState<boolean>(isSubmitted);

  const roleInfo = ROLE_DEFINITIONS[role];
  const isCitizen = effectiveState === "CITIZEN";
  const isCorruption = role === "CORRUPTOR";
  const requiresTarget = role === "INSPECTOR" || role === "LAW" || role === "CORRUPTOR" || role === "SPECIAL_6";

  const renderRoleIcon = (className: string) => {
    switch (roleInfo?.iconName) {
      case "Search":
        return <Search className={className} />;
      case "ShieldCheck":
        return <ShieldCheck className={className} />;
      case "FileWarning":
        return <FileWarning className={className} />;
      case "Eye":
        return <Eye className={className} />;
      case "Coins":
        return <Coins className={className} />;
      case "Share2":
        return <Share2 className={className} />;
      case "Flame":
      default:
        return <Flame className={className} />;
    }
  };

  const handleConfirmAction = () => {
    if (requiresTarget && selectedTarget === null) return;
    setShowConfirmModal(false);
    setHasSubmittedLocally(true);
    onExecuteAbility(selectedTarget !== null ? selectedTarget : undefined);
  };

  // =========================================================================
  // CASE 1: CÔNG DÂN TẠM THỜI (effectiveState === "CITIZEN")
  // =========================================================================
  if (isCitizen) {
    return (
      <div className="w-full max-w-md mx-auto space-y-5 animate-badge-pop text-center">
        <div className="glass-panel-elevated rounded-3xl p-7 border border-slate-700/80 space-y-5 shadow-2xl relative overflow-hidden">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-night-900 border border-slate-700 flex items-center justify-center text-slate-400">
            <Moon className="w-10 h-10 text-indigo-400 animate-pulse-subtle" />
          </div>

          <div className="space-y-1">
            <div className="text-[11px] font-mono font-bold uppercase tracking-widest text-slate-400">
              Góc nhìn Công dân • Đêm tĩnh lặng
            </div>
            <h2 className="text-2xl font-black text-white tracking-wide">
              ĐANG QUAN SÁT TÌNH HÌNH
            </h2>
            <p className="text-xs text-slate-300 max-w-xs mx-auto leading-relaxed pt-1">
              Do kỹ năng bị khóa trong đêm nay, đội bạn không thực hiện hành động bí mật nào.
            </p>
          </div>

          {/* Citizen advice card */}
          <div className="p-4 rounded-2xl bg-night-950/80 border border-night-700 text-left space-y-2 text-xs">
            <div className="font-bold text-amber-300 flex items-center gap-1.5 uppercase tracking-wider">
              <Lock className="w-4 h-4 text-amber-400" />
              Nhiệm vụ của bạn lúc này:
            </div>
            <p className="text-slate-300 leading-relaxed text-[11px]">
              • Giữ trật tự và chú ý quan sát động thái xung quanh lớp học.
              <br />
              • Chuẩn bị lập luận và các câu hỏi chất vấn cho phiên thảo luận ban ngày sắp tới.
              <br />
              • Sang đêm tiếp theo, bạn sẽ có cơ hội mở khóa lại chức năng của mình!
            </p>
          </div>

          <div className="pt-2 flex items-center justify-center gap-2 text-xs text-slate-400 font-mono">
            <Clock className="w-4 h-4 text-indigo-400 animate-spin" />
            Đang chờ các đội khác hoàn thành hành động đêm...
          </div>

          {onProceedToResult && (
            <div className="pt-2">
              <GameButton
                variant="outline"
                size="md"
                fullWidth
                onClick={onProceedToResult}
              >
                XEM KẾT QUẢ
              </GameButton>
            </div>
          )}
        </div>
      </div>
    );
  }

  // =========================================================================
  // CASE 2: ĐÃ NỘP HÀNH ĐỘNG THÀNH CÔNG (SUBMITTED STATE)
  // =========================================================================
  if (hasSubmittedLocally) {
    return (
      <div className="w-full max-w-md mx-auto space-y-5 animate-badge-pop text-center">
        <div className="glass-panel-elevated rounded-3xl p-7 border border-righteous-500/50 space-y-5 shadow-glow-righteous relative overflow-hidden">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-righteous-950/90 border border-righteous-500/60 flex items-center justify-center text-righteous-400 shadow-lg">
            <Check className="w-10 h-10" />
          </div>

          <div className="space-y-1">
            <div className="text-[11px] font-mono font-bold uppercase tracking-widest text-righteous-400">
              Đã ghi nhận vào hồ sơ đêm
            </div>
            <h2 className="text-2xl font-black text-white tracking-wide">
              HÀNH ĐỘNG ĐÃ GỬI ĐẾN MÁY CHỦ
            </h2>
            <p className="text-xs text-slate-300 max-w-xs mx-auto leading-relaxed pt-1">
              Bạn đã chọn thi hành <strong className="text-white">{roleInfo?.abilityName}</strong>
              {selectedTarget !== null ? (
                <> lên <strong className="text-trust-400">ĐỘI {selectedTarget}</strong>.</>
              ) : (
                <> thành công.</>
              )}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-night-950/80 border border-night-700 text-xs text-slate-300 space-y-1 text-left">
            <span className="font-bold text-trust-400 uppercase tracking-wider block">
              Quy trình giải quyết:
            </span>
            Máy chủ sẽ tổng hợp tất cả hành động đêm theo đúng thứ tự thẩm quyền (Bảo vệ pháp luật &rarr; Hành động vụ lợi &rarr; Điều tra). Kết quả tuyệt mật sẽ gửi về máy của bạn khi đêm kết thúc!
          </div>

          <div className="flex items-center justify-center gap-2 text-xs text-slate-400 font-mono pt-1">
            <Clock className="w-4 h-4 text-trust-400 animate-spin" />
            Đang chờ kết thúc đêm để nhận kết quả mật...
          </div>

          {onProceedToResult && (
            <div className="pt-2">
              <GameButton
                variant="outline"
                size="md"
                fullWidth
                onClick={onProceedToResult}
              >
                XEM KẾT QUẢ
              </GameButton>
            </div>
          )}
        </div>
      </div>
    );
  }

  // =========================================================================
  // CASE 3: CHỌN MỤC TIÊU ĐỂ THI HÀNH NĂNG LỰC
  // =========================================================================
  return (
    <div className="w-full max-w-md mx-auto space-y-4">
      {/* Header Banner */}
      <div className="glass-panel rounded-2xl p-4 border border-night-700 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center border shadow-sm ${
              isCorruption
                ? "bg-corruption-950 text-corruption-400 border-corruption-600/50"
                : "bg-justice-950 text-justice-400 border-justice-600/50"
            }`}
          >
            {renderRoleIcon("w-5 h-5")}
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">
              Thực thi quyền năng đêm
            </div>
            <div className="text-sm font-black text-white">
              {roleInfo?.abilityName}
            </div>
          </div>
        </div>

        <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-night-900 border border-night-700 text-trust-400">
          ĐỘI BẠN: {myTeamNumber}
        </span>
      </div>

      {/* Main Target Selection Card */}
      <div className="glass-panel-elevated rounded-3xl p-5 sm:p-6 border border-night-700 space-y-4 shadow-2xl">
        <div className="space-y-1">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
            <Target className="w-4 h-4 text-trust-400" />
            Chọn 1 Đội mục tiêu để thi hành:
          </h3>
          <p className="text-xs text-slate-400">
            {roleInfo?.abilityShortDesc}
          </p>
        </div>

        {/* 8 Teams Grid */}
        <div className="grid grid-cols-4 gap-2.5 pt-1">
          {teams.map((t) => {
            const isMe = t.teamNumber === myTeamNumber;
            const isSelected = selectedTarget === t.teamNumber;
            const isEliminated = t.eliminated;

            // Thanh tra không thể điều tra chính mình
            const isSelfDisabled = (role === "INSPECTOR" || role === "SPECIAL_6") && isMe;

            return (
              <button
                key={t.teamNumber}
                type="button"
                disabled={isSelfDisabled || isEliminated}
                onClick={() => setSelectedTarget(t.teamNumber)}
                className={`
                  relative p-3 rounded-2xl border font-bold text-center transition-all duration-200 cursor-pointer
                  ${
                    isSelected
                      ? isCorruption
                        ? "bg-corruption-950/80 border-corruption-400 text-white shadow-glow-danger scale-[1.04]"
                        : "bg-trust-500/20 border-trust-400 text-trust-200 shadow-glow scale-[1.04]"
                      : isMe
                      ? "bg-night-900/90 border-night-700 text-slate-400"
                      : "bg-night-950/60 border-night-800 text-slate-300 hover:border-slate-500 hover:text-white"
                  }
                  ${isSelfDisabled || isEliminated ? "opacity-40 cursor-not-allowed" : ""}
                `}
              >
                <div className="text-[10px] text-slate-400 font-medium uppercase">
                  {isMe ? "Bạn" : "Đội"}
                </div>
                <div className="text-xl font-black font-mono">
                  {t.teamNumber}
                </div>
                {isSelected && (
                  <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-trust-400 rounded-full border-2 border-night-900 flex items-center justify-center text-[9px] text-night-950 font-black">
                    ✓
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Selected target preview */}
        {selectedTarget !== null && (
          <div className="p-3.5 rounded-xl bg-night-950/80 border border-trust-500/40 flex items-center justify-between text-xs animate-badge-pop">
            <span className="text-slate-300">
              Mục tiêu đã chọn:{" "}
              <strong className="text-trust-400 font-mono text-sm">
                ĐỘI {selectedTarget}
              </strong>
            </span>
            <span className="text-[10px] text-slate-400">
              {selectedTarget === myTeamNumber ? "(Bảo vệ chính mình)" : "(Chỉ định đội khác)"}
            </span>
          </div>
        )}

        {/* Action Trigger Button */}
        <GameButton
          variant={isCorruption ? "danger" : "primary"}
          size="lg"
          fullWidth
          disabled={(requiresTarget && selectedTarget === null) || loading}
          loading={loading}
          onClick={() => setShowConfirmModal(true)}
          icon={<Zap className="w-5 h-5" />}
        >
          {requiresTarget ? "XÁC NHẬN THỰC THI NĂNG LỰC" : `KÍCH HOẠT: ${roleInfo?.abilityName || "NĂNG LỰC"}`}
        </GameButton>

        <div className="text-[11px] text-slate-500 text-center flex items-center justify-center gap-1.5">
          <Lock className="w-3.5 h-3.5 text-trust-500/60" />
          Hành động được máy chủ mã hóa bảo mật tuyệt đối
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
          <div className="glass-panel-elevated rounded-3xl p-6 sm:p-7 max-w-sm w-full border border-trust-500/50 space-y-4 text-center">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-950/80 border border-amber-500/50 flex items-center justify-center text-amber-400">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <div className="space-y-1">
              <h4 className="text-lg font-black text-white">Xác nhận thực thi</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Bạn có chắc chắn muốn thi hành <strong className="text-trust-400">{roleInfo?.abilityName}</strong>
                {selectedTarget !== null ? (
                  <> lên <strong className="text-white font-mono">ĐỘI {selectedTarget}</strong>?</>
                ) : (
                  <> ngay bây giờ?</>
                )}
              </p>
            </div>

            <p className="text-[11px] text-amber-400/90 bg-amber-950/40 p-2.5 rounded-xl border border-amber-800/40">
              ⚠️ Hành động ban đêm chỉ có thể thực hiện một lần duy nhất và không thể thu hồi sau khi gửi!
            </p>

            <div className="flex gap-2.5 pt-2">
              <GameButton
                variant="outline"
                size="md"
                className="flex-1"
                onClick={() => setShowConfirmModal(false)}
              >
                HỦY
              </GameButton>
              <GameButton
                variant={isCorruption ? "danger" : "primary"}
                size="md"
                className="flex-1"
                onClick={handleConfirmAction}
              >
                XÁC NHẬN
              </GameButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
