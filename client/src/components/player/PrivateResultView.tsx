import React from "react";
import { Role, PrivateResult } from "@dem-niem-tin/shared";
import { ROLE_DEFINITIONS } from "../../data/roleDefinitions";
import { 
  EyeOff, 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle, 
  Lock, 
  ArrowRight, 
  FileText, 
  HelpCircle,
  Sparkles,
  Info
} from "lucide-react";
import { GameButton } from "../common/GameButton";

interface PrivateResultViewProps {
  role: Role;
  myTeamNumber: number;
  targetTeamNumber?: number;
  result: PrivateResult;
  roundNumber?: number;
  onAcknowledge: () => void;
}

export const PrivateResultView: React.FC<PrivateResultViewProps> = ({
  role,
  myTeamNumber,
  targetTeamNumber,
  result,
  roundNumber = 1,
  onAcknowledge,
}) => {
  const roleInfo = ROLE_DEFINITIONS[role];

  // Helper to interpret and format raw server messages
  const formatServerMessage = (raw: string, type: string) => {
    if (type === "INSPECTION_RESULT" || raw.toLowerCase().includes("target role is")) {
      const match = raw.match(/target role is (\w+)/i);
      const roleFound = match ? match[1].toUpperCase() : "";
      if (roleFound === "CORRUPTOR") {
        return {
          title: "CÓ DẤU HIỆU ĐÁNG NGỜ",
          desc: "Phát hiện mục tiêu mang vai trò NGƯỜI VỤ LỢI. Hãy giữ bí mật và dẫn dắt lập luận trong phiên thảo luận!",
          isSuspicious: true,
          isSafe: false,
        };
      } else {
        const foundRoleName = ROLE_DEFINITIONS[roleFound as Role]?.name || roleFound || "Đồng minh";
        return {
          title: "CHƯA PHÁT HIỆN TIÊU CỰC",
          desc: `Đối tượng mang vai trò ${foundRoleName} — thuộc phe Bảo vệ Niềm tin. Tạm thời an toàn.`,
          isSuspicious: false,
          isSafe: true,
        };
      }
    }
    if (raw.toLowerCase().includes("your target was protected") || type === "ACTION_FAILED") {
      return {
        title: "BỊ PHÁP LUẬT VÔ HIỆU HÓA",
        desc: "Mục tiêu đã được lá chắn Pháp luật che chở kịp thời. Hành vi can thiệp bị chặn đứng hoàn toàn!",
        isSuspicious: false,
        isSafe: true,
      };
    }
    if (raw.toLowerCase().includes("successfully targeted") || type === "ACTION_SUCCESS") {
      return {
        title: "CAN THIỆP THÀNH CÔNG",
        desc: "Hành động bí mật đã được thực thi thành công vào ban đêm theo đúng dự tính.",
        isSuspicious: true,
        isSafe: false,
      };
    }
    const isSusp = 
      raw.toLowerCase().includes("đáng ngờ") || 
      raw.toLowerCase().includes("tư lợi") ||
      raw.toLowerCase().includes("sai lệch");
    const isS = 
      raw.toLowerCase().includes("chưa phát hiện") || 
      raw.toLowerCase().includes("bảo vệ") ||
      raw.toLowerCase().includes("hợp lệ") ||
      raw.toLowerCase().includes("an toàn");
    return {
      title: isSusp ? "CÓ DẤU HIỆU ĐÁNG NGỜ" : (isS ? "CHƯA PHÁT HIỆN DẤU HIỆU" : "GHI NHẬN HỒ SƠ"),
      desc: raw,
      isSuspicious: isSusp,
      isSafe: isS,
    };
  };

  const parsed = formatServerMessage(result.message, result.type);
  const isSuspicious = parsed.isSuspicious;
  const isSafe = parsed.isSafe;

  return (
    <div className="w-full max-w-md mx-auto space-y-5 animate-badge-pop">
      {/* Top Security Stamp Badge */}
      <div className="text-center">
        <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-night-950 border border-trust-500/50 text-trust-400 text-xs font-mono font-bold tracking-widest uppercase shadow-glow">
          <EyeOff className="w-3.5 h-3.5" />
          KẾT QUẢ TỐI MẬT • CHỈ ĐỘI {myTeamNumber}
        </span>
      </div>

      {/* Main Dossier Result Card */}
      <div className="glass-panel-elevated rounded-3xl p-6 sm:p-7 border border-night-700/80 relative overflow-hidden shadow-2xl space-y-5">
        {/* Background Watermark */}
        <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none select-none font-mono font-black text-6xl rotate-[-20deg]">
          MẬT
        </div>

        {/* Header */}
        <div className="border-b border-night-700/80 pb-4 text-center space-y-1">
          <div className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">
            Báo cáo nghiệp vụ • Đêm 0{roundNumber}
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-wide">
            KẾT QUẢ THỰC THI QUYỀN NĂNG
          </h2>
          <div className="text-xs text-trust-400 font-semibold">
            {roleInfo?.abilityName} &bull; Đội {myTeamNumber}
          </div>
        </div>

        {/* Target Info */}
        <div className="p-3.5 rounded-2xl bg-night-950/80 border border-night-700 flex items-center justify-between">
          <div className="text-xs text-slate-400 font-medium">
            {targetTeamNumber !== undefined ? "Đối tượng thụ lý:" : "Phạm vi áp dụng:"}
          </div>
          <div className="text-base font-black text-white font-mono flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-trust-400" />
            {targetTeamNumber !== undefined ? `ĐỘI ${targetTeamNumber}` : "HỒ SƠ TOÀN LỚP"}
          </div>
        </div>

        {/* Finding Result Box */}
        <div
          className={`
            p-5 rounded-2xl border text-center space-y-2 relative overflow-hidden
            ${
              isSuspicious
                ? "bg-corruption-950/80 border-corruption-500/60 shadow-glow-danger"
                : isSafe
                ? "bg-righteous-950/80 border-righteous-500/60 shadow-glow-righteous"
                : "bg-justice-950/80 border-justice-500/60 shadow-glow-justice"
            }
          `}
        >
          <div className="flex justify-center">
            {isSuspicious ? (
              <div className="w-12 h-12 rounded-2xl bg-corruption-900 border border-corruption-500/50 flex items-center justify-center text-corruption-400">
                <AlertTriangle className="w-6 h-6 animate-pulse" />
              </div>
            ) : (
              <div className="w-12 h-12 rounded-2xl bg-righteous-900 border border-righteous-500/50 flex items-center justify-center text-righteous-400">
                <CheckCircle2 className="w-6 h-6" />
              </div>
            )}
          </div>

          <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400">
            Kết luận nghiệp vụ
          </div>

          <div
            className={`text-xl sm:text-2xl font-black tracking-wide font-mono ${
              isSuspicious
                ? "text-corruption-400"
                : isSafe
                ? "text-righteous-400"
                : "text-justice-300"
            }`}
          >
            {parsed.title}
          </div>

          <p className="text-xs text-slate-200 leading-relaxed max-w-xs mx-auto pt-1 font-medium">
            {parsed.desc}
          </p>
        </div>

        {/* Tactical Advice for Classroom Gameplay */}
        <div className="p-4 rounded-2xl bg-night-950/90 border border-night-700 space-y-2 text-left text-xs">
          <div className="flex items-center gap-1.5 font-bold text-trust-400 uppercase tracking-wider">
            <Info className="w-4 h-4 text-trust-400 shrink-0" />
            Chiến thuật thảo luận ban ngày:
          </div>
          <p className="text-slate-300 leading-relaxed text-[11px]">
            {isSuspicious ? (
              <>
                • Đối tượng có dấu hiệu bất thường. Hãy <strong className="text-white">chất vấn khéo léo</strong> trong phiên thảo luận ban ngày để làm rõ hành vi mà không để lộ vai trò bí mật của đội bạn!
                <br />
                • Tránh vội vã tuyên bố thân phận quá sớm, kẻ vụ lợi có thể tìm cách đánh lạc hướng cả lớp.
              </>
            ) : (
              <>
                • Chưa phát hiện dấu hiệu tiêu cực từ đối tượng này ở thời điểm hiện tại. Hãy hướng sự nghi vấn sang các hồ sơ vụ việc khác.
                <br />
                • Giữ kín thông tin để bảo vệ thế chủ động cho phe Bảo vệ Niềm tin.
              </>
            )}
          </p>
        </div>

        {/* Security Notice */}
        <div className="text-[11px] text-slate-500 text-center flex items-center justify-center gap-1.5">
          <Lock className="w-3.5 h-3.5 text-trust-500/70" />
          Màn hình sẽ tự động đóng lại khi chuyển sang phiên Ban Ngày
        </div>

        {/* Acknowledge Button */}
        <GameButton
          variant="primary"
          size="lg"
          fullWidth
          onClick={onAcknowledge}
          icon={<ArrowRight className="w-5 h-5" />}
        >
          TIẾP TỤC ĐẾN BÁO CÁO BAN NGÀY (P-08)
        </GameButton>
      </div>
    </div>
  );
};

