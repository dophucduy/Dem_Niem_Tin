import React from "react";
import { Role, PrivateResult, PrivateResultOutcome } from "@dem-niem-tin/shared";
import { ROLE_DEFINITIONS } from "../../data/roleDefinitions";
import {
  EyeOff,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  Lock,
  FileText,
  BookOpen,
  Moon,
  Clock,
  Zap,
  Info,
} from "lucide-react";

export type PrivateResultEmptyVariant = "CITIZEN" | "ELIMINATED" | "NO_ACTION" | "WAITING";

interface PrivateResultViewProps {
  role: Role;
  myTeamNumber: number;
  roundNumber: number;
  /** Structured result of the current round; null/undefined renders an explainer instead. */
  result?: PrivateResult | null;
  /** Explainer rendered when the team has no result for the current round. */
  emptyVariant?: PrivateResultEmptyVariant;
  /** Compact rendering used when the dossier is embedded into another screen. */
  compact?: boolean;
}

type ResultStyle = {
  box: string;
  title: string;
  iconWrap: string;
  Icon: React.ComponentType<{ className?: string }>;
  label: string;
};

const OUTCOME_STYLES: Record<PrivateResultOutcome, ResultStyle> = {
  SUSPICIOUS: {
    box: "bg-corruption-950/80 border-corruption-500/60 shadow-glow-danger",
    title: "text-corruption-400",
    iconWrap: "bg-corruption-900 border-corruption-500/50 text-corruption-400",
    Icon: AlertTriangle,
    label: "KẾT LUẬN NGHIỆP VỤ",
  },
  CLEAR: {
    box: "bg-righteous-950/80 border-righteous-500/60 shadow-glow-righteous",
    title: "text-righteous-400",
    iconWrap: "bg-righteous-900 border-righteous-500/50 text-righteous-400",
    Icon: CheckCircle2,
    label: "KẾT LUẬN NGHIỆP VỤ",
  },
  SUCCESS: {
    box: "bg-justice-950/80 border-justice-500/60 shadow-glow-justice",
    title: "text-justice-300",
    iconWrap: "bg-justice-900 border-justice-500/50 text-justice-300",
    Icon: Zap,
    label: "KẾT QUẢ THI HÀNH",
  },
  BLOCKED: {
    box: "bg-amber-950/70 border-amber-500/60",
    title: "text-amber-300",
    iconWrap: "bg-amber-950 border-amber-500/50 text-amber-300",
    Icon: ShieldAlert,
    label: "KẾT QUẢ THI HÀNH",
  },
  INFO: {
    box: "bg-justice-950/80 border-justice-500/60 shadow-glow-justice",
    title: "text-justice-300",
    iconWrap: "bg-justice-900 border-justice-500/50 text-justice-300",
    Icon: FileText,
    label: "GHI NHẬN NGHIỆP VỤ",
  },
};

/** Neutral styling for legacy results persisted before the clarity fix. */
const LEGACY_STYLE: ResultStyle = {
  box: "bg-night-950/80 border-night-600",
  title: "text-slate-200",
  iconWrap: "bg-night-900 border-night-600 text-slate-300",
  Icon: FileText,
  label: "GHI NHẬN NGHIỆP VỤ",
};

const EMPTY_VARIANT_STYLES: Record<
  PrivateResultEmptyVariant,
  { box: string; iconWrap: string; text: string; Icon: React.ComponentType<{ className?: string }> }
> = {
  CITIZEN: {
    box: "bg-amber-950/50 border-amber-500/50",
    iconWrap: "bg-amber-950 border-amber-500/50 text-amber-300",
    text: "text-amber-300",
    Icon: Moon,
  },
  ELIMINATED: {
    box: "bg-night-950/80 border-slate-600",
    iconWrap: "bg-night-900 border-slate-600 text-slate-300",
    text: "text-slate-200",
    Icon: EyeOff,
  },
  NO_ACTION: {
    box: "bg-night-950/80 border-night-600",
    iconWrap: "bg-night-900 border-night-600 text-slate-300",
    text: "text-slate-200",
    Icon: Info,
  },
  WAITING: {
    box: "bg-justice-950/60 border-justice-500/40",
    iconWrap: "bg-justice-900 border-justice-500/40 text-justice-300",
    text: "text-justice-300",
    Icon: Clock,
  },
};

function emptyVariantCopy(
  variant: PrivateResultEmptyVariant,
  roundNumber: number,
  roleName?: string
): { title: string; message: string } {
  switch (variant) {
    case "CITIZEN":
      return {
        title: "CÔNG DÂN TẠM THỜI ĐÊM NAY",
        message: `Kỹ năng bị khóa trong Đêm 0${roundNumber} nên đội bạn không thi hành hành động nào.${
          roleName ? ` Vai trò gốc ${roleName} không bị thay đổi` : " Vai trò gốc không bị thay đổi"
        } và sẽ mở khóa lại vào đêm sau nếu trả lời đúng câu hỏi.`,
      };
    case "ELIMINATED":
      return {
        title: "ĐỘI ĐÃ BỊ LOẠI — CHẾ ĐỘ KHÁN GIẢ",
        message:
          "Đội bạn đã bị loại khỏi ván đấu theo kết quả biểu quyết. Đội bị loại không thể hành động hay biểu quyết nữa — hãy tiếp tục theo dõi và thảo luận cùng cả lớp.",
      };
    case "WAITING":
      return {
        title: "ĐANG TỔNG HỢP KẾT QUẢ",
        message: `Máy chủ đang tổng hợp kết quả Đêm 0${roundNumber}. Báo cáo mật sẽ hiển thị ngay khi hoàn tất.`,
      };
    case "NO_ACTION":
    default:
      return {
        title: `KHÔNG CÓ KẾT QUẢ ĐÊM 0${roundNumber}`,
        message:
          "Đội bạn không gửi hành động nào trong đêm nay. Hãy quan sát các manh mối công khai và chuẩn bị lập luận cho phiên thảo luận ban ngày.",
      };
  }
}

/**
 * Selects the private result belonging to the given round.
 * Legacy entries (persisted before the clarity fix) carry no round marker and
 * are only used as a graceful fallback when nothing matches the current round.
 */
export function selectRoundResult(
  results: PrivateResult[] | undefined | null,
  round: number
): PrivateResult | null {
  if (!results || results.length === 0) return null;
  const reversed = [...results].reverse();
  const scoped = reversed.find((entry) => entry.round === round);
  if (scoped) return scoped;
  return reversed.find((entry) => entry.round === undefined) ?? null;
}

export const PrivateResultView: React.FC<PrivateResultViewProps> = ({
  role,
  myTeamNumber,
  roundNumber,
  result,
  emptyVariant = "NO_ACTION",
  compact = false,
}) => {
  const roleInfo = ROLE_DEFINITIONS[role];

  // ---------------------------------------------------------------------------
  // No result for the current round: render the matching explainer.
  // ---------------------------------------------------------------------------
  if (!result) {
    const style = EMPTY_VARIANT_STYLES[emptyVariant];
    const copy = emptyVariantCopy(emptyVariant, roundNumber, roleInfo?.name);
    const { Icon } = style;

    if (compact) {
      return (
        <div className={`rounded-2xl border p-3.5 flex items-start gap-2.5 ${style.box}`}>
          <div className={`w-7 h-7 rounded-lg border flex items-center justify-center shrink-0 ${style.iconWrap}`}>
            <Icon className={`w-3.5 h-3.5 ${emptyVariant === "WAITING" ? "animate-spin" : ""}`} />
          </div>
          <div className="space-y-0.5 text-left">
            <div className={`text-xs font-black font-mono tracking-wide ${style.text}`}>{copy.title}</div>
            <p className="text-[11px] text-slate-300 leading-relaxed">{copy.message}</p>
          </div>
        </div>
      );
    }

    return (
      <div className="w-full max-w-md mx-auto space-y-5 animate-badge-pop">
        <div className="text-center">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-night-950 border border-night-700 text-slate-400 text-xs font-mono font-bold tracking-widest uppercase">
            <Lock className="w-3.5 h-3.5" />
            Nhật ký đêm • Đội {myTeamNumber}
          </span>
        </div>

        <div className="glass-panel-elevated rounded-3xl p-6 sm:p-7 border border-night-700/80 relative overflow-hidden shadow-2xl space-y-4 text-center">
          <div className={`w-14 h-14 mx-auto rounded-2xl border flex items-center justify-center ${style.iconWrap}`}>
            <Icon className={`w-7 h-7 ${emptyVariant === "WAITING" ? "animate-spin" : ""}`} />
          </div>
          <h2 className={`text-xl sm:text-2xl font-black tracking-wide font-mono ${style.text}`}>{copy.title}</h2>
          <p className="text-xs text-slate-300 leading-relaxed max-w-xs mx-auto">{copy.message}</p>
          <div className="text-[11px] text-slate-500 flex items-center justify-center gap-1.5 pt-2">
            <Lock className="w-3.5 h-3.5 text-trust-500/70" />
            Màn hình tự chuyển sang giai đoạn kế tiếp theo hiệu lệnh của Giảng viên
          </div>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Structured result of the current round.
  // ---------------------------------------------------------------------------
  const style = result.outcome ? OUTCOME_STYLES[result.outcome] : LEGACY_STYLE;
  const round = result.round ?? roundNumber;
  const title = result.title ?? "GHI NHẬN HỒ SƠ";
  const hasTarget = result.targetTeamNumber !== undefined;
  const { Icon } = style;

  if (compact) {
    return (
      <div className={`rounded-2xl border p-4 space-y-2.5 ${style.box}`}>
        <div className="flex items-center justify-between gap-2">
          <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-300">
            Kết quả mật • Đêm 0{round}
          </span>
          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-night-900/80 border border-night-700 text-trust-400">
            {hasTarget ? `ĐỘI ${result.targetTeamNumber}` : "TOÀN LỚP"}
          </span>
        </div>
        <div className="flex items-start gap-2.5 text-left">
          <div className={`w-8 h-8 rounded-lg border flex items-center justify-center shrink-0 ${style.iconWrap}`}>
            <Icon className="w-4 h-4" />
          </div>
          <div className="space-y-1">
            <div className={`text-sm font-black tracking-wide font-mono ${style.title}`}>{title}</div>
            <p className="text-[11px] text-slate-200 leading-relaxed">{result.message}</p>
          </div>
        </div>
      </div>
    );
  }

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
            Báo cáo nghiệp vụ • Đêm 0{round}
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-wide">
            KẾT QUẢ THỰC THI NĂNG LỰC
          </h2>
          <div className="text-xs text-trust-400 font-semibold">
            {roleInfo?.abilityName} &bull; Đội {myTeamNumber}
          </div>
        </div>

        {/* Target Info */}
        <div className="p-3.5 rounded-2xl bg-night-950/80 border border-night-700 flex items-center justify-between">
          <div className="text-xs text-slate-400 font-medium">
            {hasTarget ? "Đối tượng thụ lý:" : "Phạm vi áp dụng:"}
          </div>
          <div className="text-base font-black text-white font-mono flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-trust-400" />
            {hasTarget ? `ĐỘI ${result.targetTeamNumber}` : "HỒ SƠ TOÀN LỚP"}
          </div>
        </div>

        {/* Finding Result Box */}
        <div className={`p-5 rounded-2xl border text-center space-y-2 relative overflow-hidden ${style.box}`}>
          <div className="flex justify-center">
            <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center ${style.iconWrap}`}>
              <Icon className="w-6 h-6" />
            </div>
          </div>

          <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400">
            {style.label}
          </div>

          <div className={`text-xl sm:text-2xl font-black tracking-wide font-mono ${style.title}`}>{title}</div>

          <p className="text-xs text-slate-200 leading-relaxed max-w-xs mx-auto pt-1 font-medium">
            {result.message}
          </p>
        </div>

        {/* Role Guide Note for the Day Discussion */}
        {roleInfo?.guideNote && (
          <div className="p-4 rounded-2xl bg-night-950/90 border border-night-700 space-y-2 text-left text-xs">
            <div className="flex items-center gap-1.5 font-bold text-trust-400 uppercase tracking-wider">
              <BookOpen className="w-4 h-4 text-trust-400 shrink-0" />
              Gợi ý cho phiên thảo luận
            </div>
            <p className="text-slate-300 leading-relaxed text-[11px]">{roleInfo.guideNote}</p>
          </div>
        )}

        {/* Security Notice */}
        <div className="text-[11px] text-slate-500 text-center flex items-center justify-center gap-1.5">
          <Lock className="w-3.5 h-3.5 text-trust-500/70" />
          Màn hình tự chuyển sang phiên Ban Ngày khi đêm kết thúc
        </div>
      </div>
    </div>
  );
};
