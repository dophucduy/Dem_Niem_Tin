import React from "react";
import { Role } from "@dem-niem-tin/shared";
import { ROLE_DEFINITIONS } from "../../data/roleDefinitions";
import { 
  CheckCircle2, 
  XCircle, 
  Zap, 
  Lock, 
  RotateCcw, 
  ArrowRight, 
  BookOpen, 
  Sparkles 
} from "lucide-react";
import { GameButton } from "../common/GameButton";

interface AnswerResultViewProps {
  isCorrect: boolean;
  role: Role;
  roundNumber?: number;
  questionText?: string;
  correctOptionText?: string;
  explanation: string;
  onProceed: () => void;
}

export const AnswerResultView: React.FC<AnswerResultViewProps> = ({
  isCorrect,
  role,
  roundNumber = 1,
  correctOptionText,
  explanation,
  onProceed,
}) => {
  const roleInfo = ROLE_DEFINITIONS[role];

  if (isCorrect) {
    // === P-05A: MÀN HÌNH ĐÁP ÁN ĐÚNG & MỞ KHÓA NĂNG LỰC ===
    return (
      <div className="w-full max-w-md mx-auto space-y-5 animate-badge-pop">
        {/* Success Header Card */}
        <div className="glass-panel-elevated rounded-3xl p-6 sm:p-7 border border-righteous-500/50 text-center relative overflow-hidden shadow-glow-righteous">
          {/* Ambient Glow */}
          <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-48 h-48 bg-righteous-500/20 rounded-full blur-3xl pointer-events-none" />

          {/* Celebration Icon */}
          <div className="w-20 h-20 mx-auto rounded-3xl bg-righteous-950/90 border border-righteous-500/60 flex items-center justify-center text-righteous-400 shadow-lg mb-4 animate-bounce">
            <CheckCircle2 className="w-12 h-12" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-righteous-950 text-righteous-400 text-xs font-mono font-bold uppercase tracking-wider border border-righteous-700/60 mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            ĐÁP ÁN HOÀN TOÀN CHÍNH XÁC
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-wide">
            NĂNG LỰC ĐÃ MỞ KHÓA!
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Đội bạn đã chứng minh sự am hiểu lý luận và được trao quyền hành động trong Đêm 0{roundNumber}
          </p>
        </div>

        {/* Unlocked Power Card */}
        <div className="glass-panel rounded-2xl p-5 border border-trust-500/40 space-y-3 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-trust-500/10 border border-trust-500/30 flex items-center justify-center text-trust-400">
                <Zap className="w-4 h-4 fill-trust-400/20" />
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">
                  Quyền năng kích hoạt
                </div>
                <div className="text-sm font-black text-white">
                  {roleInfo?.abilityName || "HÀNH ĐỘNG ĐẶC BIỆT"}
                </div>
              </div>
            </div>

            <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-righteous-950 text-righteous-400 border border-righteous-700 font-mono">
              SẴN SÀNG
            </span>
          </div>

          <p className="text-xs text-slate-200 leading-relaxed bg-night-950/70 p-3 rounded-xl border border-night-700">
            {roleInfo?.abilityShortDesc || roleInfo?.abilityDetail}
          </p>
        </div>

        {/* Educational Explanation Box */}
        <div className="p-4 rounded-2xl bg-night-950/80 border border-night-700 space-y-2 text-left">
          <div className="flex items-center gap-2 text-xs font-bold text-trust-400 uppercase tracking-wider">
            <BookOpen className="w-4 h-4 text-trust-400" />
            Bài học & Lời giải thích chuyên đề:
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            {explanation}
          </p>
        </div>

        {/* Action Button */}
        <GameButton
          variant="righteous"
          size="lg"
          fullWidth
          onClick={onProceed}
          icon={<ArrowRight className="w-5 h-5" />}
        >
          TIẾN HÀNH HÀNH ĐỘNG ĐÊM
        </GameButton>
      </div>
    );
  }

  // === P-05B: MÀN HÌNH ĐÁP ÁN SAI & TRẠNG THÁI CÔNG DÂN TẠM THỜI ===
  return (
    <div className="w-full max-w-md mx-auto space-y-5 animate-badge-pop">
      {/* Alert Header Card */}
      <div className="glass-panel-elevated rounded-3xl p-6 sm:p-7 border border-amber-600/50 text-center relative overflow-hidden shadow-2xl">
        {/* Ambient Amber Glow */}
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Lock / Wrong Icon */}
        <div className="w-20 h-20 mx-auto rounded-3xl bg-amber-950/80 border border-amber-500/50 flex items-center justify-center text-amber-400 shadow-lg mb-4">
          <Lock className="w-10 h-10" />
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-corruption-950 text-corruption-400 text-xs font-mono font-bold uppercase tracking-wider border border-corruption-700/60 mb-2">
          <XCircle className="w-3.5 h-3.5" />
          CÂU TRẢ LỜI CHƯA CHÍNH XÁC
        </div>

        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-wide">
          KỸ NĂNG BỊ KHÓA
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 mt-1">
          Chưa nắm vững nguyên tắc, quyền hạn bị tạm ngưng trong đêm nay
        </p>
      </div>

      {/* Temporary Citizen State Explainer */}
      <div className="glass-panel rounded-2xl p-5 border border-slate-700 space-y-3 text-left">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Trạng thái hiện tại:
          </span>
          <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-800 text-amber-300 border border-amber-600/40">
            CÔNG DÂN TẠM THỜI
          </span>
        </div>

        {/* Crucial Rule Note */}
        <div className="p-3.5 rounded-xl bg-night-950/90 border border-night-700 space-y-2 text-xs">
          <div className="text-slate-300">
            • <strong className="text-white">Trong Đêm 0{roundNumber}:</strong> Bạn hành động như một công dân bình thường (không thể dùng chức năng <span className="text-amber-400">{roleInfo?.abilityName}</span>).
          </div>
          <div className="text-slate-300">
            • <strong className="text-white">Vai trò gốc:</strong> Bạn vẫn là <strong className="text-trust-300">{roleInfo?.name}</strong>, danh tính gốc không bao giờ bị tước bỏ!
          </div>
          <div className="text-righteous-400 flex items-center gap-1.5 font-medium pt-1">
            <RotateCcw className="w-4 h-4 shrink-0" />
            Sang đêm tiếp theo, bạn sẽ có cơ hội mở khóa lại nếu trả lời đúng!
          </div>
        </div>
      </div>

      {/* Learning Knowledge Box */}
      <div className="p-4 rounded-2xl bg-night-950/80 border border-night-700 space-y-2 text-left">
        {correctOptionText && (
          <div className="text-xs text-slate-300 pb-2 border-b border-night-800">
            <span className="text-righteous-400 font-bold">Đáp án đúng là:</span> {correctOptionText}
          </div>
        )}
        <div className="flex items-center gap-2 text-xs font-bold text-trust-400 uppercase tracking-wider">
          <BookOpen className="w-4 h-4 text-trust-400" />
          Giải thích bài học để rút kinh nghiệm:
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          {explanation}
        </p>
      </div>

      {/* Action Button */}
      <GameButton
        variant="outline"
        size="lg"
        fullWidth
        onClick={onProceed}
        icon={<ArrowRight className="w-5 h-5" />}
      >
        TIẾP TỤC ĐÊM (CHẾ ĐỘ CÔNG DÂN)
      </GameButton>
    </div>
  );
};

