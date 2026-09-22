import React, { useState } from "react";
import { 
  Role, 
  Faction 
} from "@dem-niem-tin/shared";
import { 
  ROLE_DEFINITIONS, 
  RoleInfo 
} from "../../data/roleDefinitions";
import { 
  Search, 
  ShieldCheck, 
  FileWarning, 
  Eye, 
  Coins, 
  Share2, 
  Flame, 
  Lock, 
  Sparkles, 
  Check, 
  AlertTriangle, 
  ShieldAlert, 
  Zap,
  BookOpen
} from "lucide-react";
import { GameButton } from "../common/GameButton";

interface RoleRevealViewProps {
  role: Role;
  faction: Faction;
  teamNumber: number;
  onConfirmReady?: () => void;
  isReady?: boolean;
}

export const RoleRevealView: React.FC<RoleRevealViewProps> = ({
  role,
  faction,
  teamNumber,
  onConfirmReady,
  isReady = false,
}) => {
  const [unsealed, setUnsealed] = useState<boolean>(false);
  const [confirmed, setConfirmed] = useState<boolean>(isReady);

  const roleInfo: RoleInfo = ROLE_DEFINITIONS[role] || {
    role,
    faction,
    name: role,
    subtitle: "Vai trò đặc biệt",
    iconName: "Search",
    abilityName: "HÀNH ĐỘNG ĐẶC BIỆT",
    abilityShortDesc: "Sử dụng kỹ năng bí mật trong đêm",
    abilityDetail: "Cần trả lời đúng câu hỏi để kích hoạt",
    guideNote: "Giữ kín vai trò của mình",
    flavorQuote: "",
  };

  const isCorruption = faction === "CORRUPTION";

  const renderRoleIcon = (className: string) => {
    switch (roleInfo.iconName) {
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

  // State 1: Sealed Dossier Screen
  if (!unsealed) {
    return (
      <div className="w-full max-w-sm mx-auto text-center space-y-6">
        <div className="text-xs uppercase tracking-[0.25em] text-slate-400 font-bold">
          Nhiệm vụ bí mật • Đội {teamNumber}
        </div>

        {/* Sealed Envelope / Dossier Card */}
        <div
          onClick={() => setUnsealed(true)}
          className="relative glass-panel-elevated rounded-3xl p-8 border-2 border-trust-500/50 cursor-pointer shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 group overflow-hidden"
        >
          {/* Background diagonal watermark */}
          <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none select-none font-mono font-black text-6xl rotate-[-25deg]">
            TỐI MẬT
          </div>

          {/* Red/Gold Wax Seal */}
          <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-trust-400 via-trust-600 to-amber-700 p-1 shadow-glow flex items-center justify-center mb-5 group-hover:rotate-6 transition-transform">
            <div className="w-full h-full rounded-full bg-night-950/90 border border-trust-300/40 flex flex-col items-center justify-center text-trust-300">
              <Lock className="w-8 h-8 mb-0.5 text-trust-400 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest font-mono">
                NIÊM PHONG
              </span>
            </div>
          </div>

          <div className="space-y-1.5 mb-6">
            <div className="text-xs font-mono font-bold text-trust-400 uppercase tracking-widest">
              HỒ SƠ BỔ NHIỆM
            </div>
            <h2 className="text-2xl font-black text-white tracking-wide">
              ĐỘI SỐ {teamNumber}
            </h2>
            <p className="text-xs text-slate-400 px-4">
              Hồ sơ chứa đựng danh tính và quyền năng của đội bạn trong suốt trận đấu
            </p>
          </div>

          {/* Interactive Tap CTA */}
          <div className="py-3 px-4 rounded-xl bg-trust-500/15 border border-trust-500/40 text-trust-300 text-xs font-bold tracking-wider uppercase flex items-center justify-center gap-2 group-hover:bg-trust-500/25 transition-colors">
            <Sparkles className="w-4 h-4 text-trust-400" />
            CHẠM ĐỂ MỞ NIÊM PHONG
          </div>
        </div>

        <p className="text-[11px] text-slate-500">
          Chỉ thành viên trong Đội {teamNumber} được phép quan sát màn hình này
        </p>
      </div>
    );
  }

  // State 2: Revealed Role Card
  return (
    <div className="w-full max-w-md mx-auto space-y-5 animate-badge-pop">
      {/* Top Warning Badge */}
      <div className="text-center">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-night-900 border border-slate-700 text-slate-400 text-xs font-mono font-bold uppercase">
          <Lock className="w-3.5 h-3.5 text-trust-400" />
          Tuyệt mật • Không để đội khác nhìn thấy
        </span>
      </div>

      {/* Main Identity Card */}
      <div
        className={`
          glass-panel-elevated rounded-3xl p-6 sm:p-7 border relative overflow-hidden text-center
          ${
            isCorruption
              ? "border-corruption-500/60 shadow-glow-danger"
              : "border-justice-500/50 shadow-glow-justice"
          }
        `}
      >
        {/* Glow ambient circle */}
        <div
          className={`absolute -top-12 left-1/2 -translate-x-1/2 w-48 h-48 rounded-full blur-3xl pointer-events-none opacity-20 ${
            isCorruption ? "bg-corruption-500" : "bg-justice-500"
          }`}
        />

        {/* Faction Header */}
        <div className="flex justify-center mb-4">
          <span
            className={`inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-black tracking-wider uppercase border ${
              isCorruption
                ? "bg-corruption-950 text-corruption-400 border-corruption-600/60"
                : "bg-justice-950 text-justice-300 border-justice-600/60"
            }`}
          >
            {isCorruption ? (
              <>
                <AlertTriangle className="w-3.5 h-3.5 text-corruption-400" />
                PHE THAM NHŨNG
              </>
            ) : (
              <>
                <ShieldCheck className="w-3.5 h-3.5 text-justice-400" />
                PHE BẢO VỆ NIỀM TIN
              </>
            )}
          </span>
        </div>

        {/* Role Icon & Title */}
        <div className="space-y-2 mb-6">
          <div
            className={`w-20 h-20 mx-auto rounded-2xl flex items-center justify-center p-4 border shadow-lg ${
              isCorruption
                ? "bg-corruption-950/80 border-corruption-500/50 text-corruption-400"
                : "bg-justice-950/80 border-justice-500/50 text-justice-400"
            }`}
          >
            {renderRoleIcon("w-12 h-12")}
          </div>

          <div className="text-xs uppercase tracking-widest text-slate-400 font-bold">
            Vai trò của Đội {teamNumber}
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-wide">
            {roleInfo.name}
          </h1>
          <p className="text-xs font-semibold text-slate-300">
            {roleInfo.subtitle}
          </p>
        </div>

        {/* Ability Section */}
        <div className="p-4 rounded-2xl bg-night-950/80 border border-night-700/80 text-left space-y-2 mb-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-trust-400 uppercase tracking-wider">
              <Zap className="w-4 h-4 text-trust-400 fill-trust-400/20" />
              Năng lực: {roleInfo.abilityName}
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded bg-night-800 text-slate-400 font-mono">
              Ban Đêm
            </span>
          </div>

          <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
            {roleInfo.abilityDetail}
          </p>
        </div>

        {/* CORE EDUCATIONAL PRINCIPLE BANNER */}
        <div className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-600/40 text-left flex items-start gap-2.5 mb-5">
          <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <div className="font-bold text-amber-300 uppercase tracking-wider">
              Quy tắc Mở khóa Năng lực
            </div>
            <p className="text-slate-300 leading-normal text-[11px]">
              Muốn sử dụng năng lực trên, đội bạn bắt buộc phải <strong className="text-white">trả lời ĐÚNG</strong> câu hỏi tri thức ở đầu mỗi đêm. Nếu trả lời sai, bạn sẽ tạm thời trở thành <strong className="text-amber-300">CÔNG DÂN</strong> (bị khóa kỹ năng trong đêm đó)!
            </p>
          </div>
        </div>

        {/* Quotation / Flavor */}
        {roleInfo.flavorQuote && (
          <div className="p-3 rounded-xl bg-night-900/50 border border-night-800 text-slate-400 italic text-[11px] leading-relaxed mb-6">
            <BookOpen className="w-3.5 h-3.5 text-trust-500/70 inline mr-1.5 -mt-0.5" />
            {roleInfo.flavorQuote}
          </div>
        )}

        {/* Confirm Ready Action */}
        <div>
          {confirmed ? (
            <div className="p-3 rounded-xl bg-righteous-950/80 border border-righteous-600/50 text-righteous-400 text-xs font-bold flex items-center justify-center gap-2">
              <Check className="w-4 h-4" />
              ĐÃ SẴN SÀNG • ĐANG CHỜ CẢ LỚP
            </div>
          ) : (
            <GameButton
              variant={isCorruption ? "danger" : "primary"}
              size="lg"
              fullWidth
              onClick={() => {
                setConfirmed(true);
                onConfirmReady?.();
              }}
              icon={<Check className="w-5 h-5" />}
            >
              TÔI ĐÃ HIỂU VÀ SẴN SÀNG
            </GameButton>
          )}
        </div>
      </div>
    </div>
  );
};

