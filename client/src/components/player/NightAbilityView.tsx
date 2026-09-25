import React, { useState } from "react";
import { Role, EffectiveState, AbilityMode } from "@dem-niem-tin/shared";
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
  EyeOff,
  Info,
} from "lucide-react";
import { GameButton } from "../common/GameButton";
import { RoleQuickGuide } from "./RoleQuickGuide";

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
  onExecuteAbility?: (targetTeamNumber?: number, mode?: AbilityMode) => void;
  isSubmitted?: boolean;
  loading?: boolean;
  errorMessage?: string | null;
  /** Eliminated teams get the spectator copy instead of the citizen copy. */
  eliminated?: boolean;
}

/** Roles whose ability must be aimed at exactly one team. */
const TARGET_REQUIRED_ROLES: Role[] = [
  "INSPECTOR",
  "LAW",
  "CORRUPTOR",
  "OVERSIGHT",
  "SPECIAL_6",
  "SPECIAL_7",
];

/** Roles that are not allowed to target their own team. */
const NO_SELF_TARGET_ROLES: Role[] = ["INSPECTOR", "OVERSIGHT", "SPECIAL_6", "SPECIAL_7"];

const ACTION_HINTS: Partial<Record<Role, string>> = {
  INSPECTOR: "Kết quả điều tra được gửi riêng cho đội bạn ngay khi đêm kết thúc.",
  LAW: "Lá chắn pháp luật luôn được giải quyết trước mọi hành vi phá hoại trong đêm.",
  CORRUPTOR:
    "Chọn chế độ rồi chỉ định đội mục tiêu; hiệu quả sẽ được xác nhận khi đêm kết thúc.",
  OVERSIGHT:
    "Kết quả xác minh cho biết đội mục tiêu có thực sự thi hành hành động đêm nay hay không.",
  SPECIAL_6: "Kiểm tra dấu hiệu tư lợi của đội mục tiêu và nhận kết luận riêng.",
  SPECIAL_7:
    "Đội mục tiêu sẽ bị yêu cầu giải trình công khai trên màn chiếu vào bình minh.",
  WHISTLEBLOWER:
    "Hồ sơ vụ việc mới sẽ xuất hiện công khai trên bảng manh mối vào bình minh.",
};

const CORRUPTOR_MODES: { id: AbilityMode; title: string; desc: string }[] = [
  {
    id: "TRUST_DRAIN",
    title: "GIEO NHIỄU NIỀM TIN",
    desc: "Làm giảm 15 điểm Niềm tin nhân dân của đội mục tiêu trong đêm nay (trừ khi được Pháp luật che chở).",
  },
  {
    id: "INTERFERE",
    title: "CAN THIỆP ĐIỀU TRA",
    desc: "Đảo ngược kết luận điều tra của Thanh tra về đội mục tiêu trong đêm nay. Bị vô hiệu hóa nếu đội đó được Pháp luật bảo vệ.",
  },
];

export const NightAbilityView: React.FC<NightAbilityViewProps> = ({
  role,
  effectiveState,
  myTeamNumber,
  teams = [],
  onExecuteAbility,
  isSubmitted = false,
  loading = false,
  errorMessage,
  eliminated = false,
}) => {
  const [selectedTarget, setSelectedTarget] = useState<number | null>(null);
  const [corruptorMode, setCorruptorMode] = useState<AbilityMode>("TRUST_DRAIN");
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);

  const roleInfo = ROLE_DEFINITIONS[role];
  const isCitizen = effectiveState === "CITIZEN";
  const isCorruption = role === "CORRUPTOR";
  const requiresTarget = TARGET_REQUIRED_ROLES.includes(role);

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
    onExecuteAbility?.(
      requiresTarget && selectedTarget !== null ? selectedTarget : undefined,
      role === "CORRUPTOR" ? corruptorMode : undefined
    );
  };

  // =========================================================================
  // CASE 1: ĐỘI ĐÃ BỊ LOẠI (SPECTATOR MODE)
  // =========================================================================
  if (eliminated) {
    return (
      <div className="w-full max-w-md mx-auto space-y-5 animate-badge-pop text-center">
        <div className="glass-panel-elevated rounded-3xl p-7 border border-slate-700/80 space-y-5 shadow-2xl relative overflow-hidden">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-night-900 border border-slate-700 flex items-center justify-center text-slate-400">
            <EyeOff className="w-10 h-10 text-slate-400" />
          </div>

          <div className="space-y-1">
            <div className="text-[11px] font-mono font-bold uppercase tracking-widest text-slate-400">
              Chế độ khán giả • Theo dõi ván đấu
            </div>
            <h2 className="text-2xl font-black text-white tracking-wide">ĐỘI BẠN ĐÃ BỊ LOẠI</h2>
            <p className="text-xs text-slate-300 max-w-xs mx-auto leading-relaxed pt-1">
              Theo luật ván đấu, đội bị loại không thể hành động hay biểu quyết nữa. Hãy tiếp tục
              theo dõi diễn biến và chuẩn bị ý kiến cho phiên thảo luận chung của lớp.
            </p>
          </div>

          <RoleQuickGuide role={role} myTeamNumber={myTeamNumber} />

          <div className="pt-2 flex items-center justify-center gap-2 text-xs text-slate-400 font-mono">
            <Clock className="w-4 h-4 text-indigo-400 animate-spin" />
            Đang chờ các đội khác hoàn thành hành động đêm...
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // CASE 2: CÔNG DÂN TẠM THỜI (effectiveState === "CITIZEN")
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
              <br />• Vai trò gốc <strong className="text-white">{roleInfo?.name}</strong> (
              {roleInfo?.abilityName}) không bị tước bỏ — hãy trả lời đúng ở đêm sau để mở khóa
              lại!
            </p>
          </div>

          <RoleQuickGuide role={role} myTeamNumber={myTeamNumber} />

          <div className="pt-2 flex items-center justify-center gap-2 text-xs text-slate-400 font-mono">
            <Clock className="w-4 h-4 text-indigo-400 animate-spin" />
            Đang chờ các đội khác hoàn thành hành động đêm...
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // CASE 3: ĐÃ NỘP HÀNH ĐỘNG (SUBMITTED STATE, REFRESH-SAFE)
  // =========================================================================
  if (isSubmitted) {
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
                <>
                  {" "}
                  lên <strong className="text-trust-400">ĐỘI {selectedTarget}</strong>.
                </>
              ) : (
                <> thành công.</>
              )}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-night-950/80 border border-night-700 text-xs text-slate-300 space-y-1 text-left">
            <span className="font-bold text-trust-400 uppercase tracking-wider block">
              Quy trình giải quyết:
            </span>
            Máy chủ tổng hợp tất cả hành động đêm theo thứ tự thẩm quyền (Bảo vệ pháp luật &rarr;
            Hành động vụ lợi &rarr; Điều tra). Kết quả tuyệt mật sẽ gửi về máy của bạn khi đêm kết
            thúc!
          </div>

          <RoleQuickGuide role={role} myTeamNumber={myTeamNumber} />

          <div className="flex items-center justify-center gap-2 text-xs text-slate-400 font-mono pt-1">
            <Clock className="w-4 h-4 text-trust-400 animate-spin" />
            Đang chờ kết thúc đêm để nhận kết quả mật...
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // CASE 4: CHỌN MỤC TIÊU ĐỂ THI HÀNH NĂNG LỰC
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
              Thực thi năng lực đêm
            </div>
            <div className="text-sm font-black text-white">{roleInfo?.abilityName}</div>
          </div>
        </div>

        <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-night-900 border border-night-700 text-trust-400">
          ĐỘI BẠN: {myTeamNumber}
        </span>
      </div>

      {/* Role re-read reminder */}
      <RoleQuickGuide role={role} myTeamNumber={myTeamNumber} />

      {/* Main Action Card */}
      <div className="glass-panel-elevated rounded-3xl p-5 sm:p-6 border border-night-700 space-y-4 shadow-2xl">
        {requiresTarget ? (
          <>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Target className="w-4 h-4 text-trust-400" />
                Chọn 1 Đội mục tiêu để thi hành:
              </h3>
              <p className="text-xs text-slate-400">{roleInfo?.abilityShortDesc}</p>
            </div>

            {/* CORRUPTOR mode selector */}
            {isCorruption && (
              <div className="space-y-2">
                <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-corruption-400">
                  Chế độ hành động:
                </div>
                <div className="grid grid-cols-1 gap-2">
                  {CORRUPTOR_MODES.map((m) => {
                    const active = corruptorMode === m.id;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setCorruptorMode(m.id)}
                        className={`p-3 rounded-2xl border text-left transition-all duration-200 ${
                          active
                            ? "bg-corruption-950/80 border-corruption-400 shadow-glow-danger"
                            : "bg-night-950/60 border-night-800 hover:border-slate-500"
                        }`}
                      >
                        <div
                          className={`text-xs font-black font-mono tracking-wide ${
                            active ? "text-corruption-300" : "text-slate-300"
                          }`}
                        >
                          {m.title}
                        </div>
                        <p className="text-[11px] text-slate-400 leading-relaxed pt-1">{m.desc}</p>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 8 Teams Grid */}
            <div className="grid grid-cols-4 gap-2.5 pt-1">
              {teams.map((t) => {
                const isMe = t.teamNumber === myTeamNumber;
                const isSelected = selectedTarget === t.teamNumber;
                const isEliminatedTeam = t.eliminated;
                const isSelfDisabled = NO_SELF_TARGET_ROLES.includes(role) && isMe;

                return (
                  <button
                    key={t.teamNumber}
                    type="button"
                    disabled={isSelfDisabled || isEliminatedTeam}
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
                      ${isSelfDisabled || isEliminatedTeam ? "opacity-40 cursor-not-allowed" : ""}
                    `}
                  >
                    <div className="text-[10px] text-slate-400 font-medium uppercase">
                      {isMe ? "Bạn" : "Đội"}
                    </div>
                    <div className="text-xl font-black font-mono">{t.teamNumber}</div>
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
                  <strong className="text-trust-400 font-mono text-sm">ĐỘI {selectedTarget}</strong>
                </span>
                <span className="text-[10px] text-slate-400">
                  {selectedTarget === myTeamNumber ? "(Bảo vệ chính mình)" : "(Chỉ định đội khác)"}
                </span>
              </div>
            )}
          </>
        ) : (
          /* WHISTLEBLOWER: no target needed, show the effect preview instead */
          <div className="p-4 rounded-2xl bg-night-950/80 border border-trust-500/30 space-y-2 text-left">
            <div className="flex items-center gap-1.5 text-[11px] font-mono font-bold text-trust-400 uppercase tracking-wider">
              <FileWarning className="w-4 h-4" />
              Không cần chọn mục tiêu
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Kích hoạt năng lực sẽ tạo một <strong className="text-white">hồ sơ vụ việc mới</strong>{" "}
              cho toàn lớp. Manh mối từ hồ sơ sẽ xuất hiện công khai trên bảng hồ sơ vào bình minh.
            </p>
          </div>
        )}

        {/* Per-role action hint */}
        {ACTION_HINTS[role] && (
          <div className="p-3 rounded-xl bg-night-950/70 border border-night-700 flex items-start gap-2 text-[11px] text-slate-400 leading-relaxed text-left">
            <Info className="w-3.5 h-3.5 text-trust-400 shrink-0 mt-0.5" />
            <span>{ACTION_HINTS[role]}</span>
          </div>
        )}

        {/* Server rejection feedback */}
        {errorMessage && (
          <div className="p-3 rounded-xl bg-corruption-950/70 border border-corruption-600/50 text-[11px] text-corruption-300 text-left flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
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
          {requiresTarget
            ? "XÁC NHẬN THỰC THI NĂNG LỰC"
            : `KÍCH HOẠT: ${roleInfo?.abilityName || "NĂNG LỰC"}`}
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
                Bạn có chắc chắn muốn thi hành{" "}
                <strong className="text-trust-400">{roleInfo?.abilityName}</strong>
                {isCorruption && (
                  <>
                    {" "}
                    theo chế độ{" "}
                    <strong className="text-corruption-300">
                      {corruptorMode === "INTERFERE" ? "CAN THIỆP ĐIỀU TRA" : "GIEO NHIỄU NIỀM TIN"}
                    </strong>
                  </>
                )}
                {selectedTarget !== null ? (
                  <>
                    {" "}
                    lên <strong className="text-white font-mono">ĐỘI {selectedTarget}</strong>?
                  </>
                ) : (
                  <> ngay bây giờ?</>
                )}
              </p>
            </div>

            <p className="text-[11px] text-amber-400/90 bg-amber-950/40 p-2.5 rounded-xl border border-amber-800/40">
              ⚠️ Hành động ban đêm chỉ có thể thực hiện một lần duy nhất và không thể thu hồi sau
              khi gửi!
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
