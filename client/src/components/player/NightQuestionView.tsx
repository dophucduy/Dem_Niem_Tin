import React, { useState } from "react";
import { 
  HelpCircle, 
  Send, 
  Clock, 
  CheckCircle2, 
  Zap, 
  Sparkles,
  ShieldCheck 
} from "lucide-react";
import { Role, PublicQuestion } from "@dem-niem-tin/shared";
import { GameButton } from "../common/GameButton";
import { RoleQuickGuide } from "./RoleQuickGuide";

interface NightQuestionViewProps {
  question: PublicQuestion;
  roundNumber?: number;
  abilityName?: string;
  role?: Role;
  myTeamNumber?: number;
  isSubmitted?: boolean;
  onSubmitAnswer: (selectedOption: number) => void;
  loading?: boolean;
}

export const NightQuestionView: React.FC<NightQuestionViewProps> = ({
  question,
  roundNumber = 1,
  abilityName = "ĐẶC BIỆT",
  role,
  myTeamNumber = 0,
  isSubmitted = false,
  onSubmitAnswer,
  loading = false,
}) => {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [hasSubmittedLocally, setHasSubmittedLocally] = useState<boolean>(isSubmitted);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedOption === null || hasSubmittedLocally) return;

    setHasSubmittedLocally(true);
    onSubmitAnswer(selectedOption);
  };

  const optionLabels = ["A", "B", "C", "D"];

  return (
    <div className="w-full max-w-md mx-auto space-y-4">
      {/* Top Banner & Motivation */}
      <div className="glass-panel rounded-2xl p-4 border border-night-700/80 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">
              Thử thách Đêm 0{roundNumber}
            </div>
          </div>
        </div>

        <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-night-900 border border-night-700 text-indigo-300">
          VÒNG TRI THỨC
        </span>
      </div>

      {/* Unlock Rule: what this answer decides */}
      <div className="glass-panel rounded-2xl p-4 border border-amber-500/40 space-y-2">
        <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300 uppercase tracking-wider">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
          Trả lời đúng để mở khóa năng lực:
          <span className="text-trust-300 normal-case">{abilityName}</span>
        </div>
        <p className="text-[11px] text-slate-300 leading-relaxed flex items-start gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
          <span>
            Trả lời <strong className="text-white">sai</strong>: năng lực bị khóa trong đêm nay — đội
            bạn quan sát với tư cách <strong className="text-amber-300">công dân tạm thời</strong>;
            vai trò gốc vẫn được giữ nguyên và mở khóa lại vào đêm sau.
          </span>
        </p>
      </div>

      {/* Role reminder so nothing must be memorized */}
      {role && <RoleQuickGuide role={role} myTeamNumber={myTeamNumber} />}

      {/* Main Question Card */}
      <form
        onSubmit={handleSubmit}
        className="glass-panel-elevated rounded-2xl p-5 sm:p-6 border border-night-700/80 space-y-5 shadow-2xl"
      >
        {/* Category Badge */}
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-indigo-950/80 text-indigo-300 border border-indigo-700/60">
            <HelpCircle className="w-3.5 h-3.5 text-indigo-400" />
            {question.category}
          </span>
        </div>

        {/* Question Text */}
        <div className="text-base sm:text-lg font-bold text-white leading-relaxed">
          {question.text}
        </div>

        {/* Options List */}
        <div className="space-y-2.5">
          {question.options.map((optionText, index) => {
            const isSelected = selectedOption === index;
            const letter = optionLabels[index] || String(index + 1);

            return (
              <button
                key={index}
                type="button"
                disabled={hasSubmittedLocally || loading}
                onClick={() => setSelectedOption(index)}
                className={`
                  w-full p-3.5 sm:p-4 rounded-xl border text-left transition-all duration-200 flex items-start gap-3 cursor-pointer
                  ${
                    isSelected
                      ? "bg-gradient-to-r from-trust-500/20 to-trust-600/10 border-trust-400 text-white shadow-glow scale-[1.01]"
                      : "bg-night-950/60 border-night-700/80 text-slate-300 hover:border-slate-500 hover:text-white"
                  }
                  ${hasSubmittedLocally ? "pointer-events-none opacity-80" : ""}
                `}
              >
                {/* Option Letter Badge */}
                <div
                  className={`
                    w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black font-mono shrink-0 transition-colors
                    ${
                      isSelected
                        ? "bg-trust-500 text-night-950 shadow-sm"
                        : "bg-night-800 text-slate-400 border border-night-700"
                    }
                  `}
                >
                  {letter}
                </div>

                {/* Option Text */}
                <div className="text-xs sm:text-sm font-medium leading-snug pt-0.5">
                  {optionText}
                </div>
              </button>
            );
          })}
        </div>

        {/* Submit or Submitted Status */}
        {hasSubmittedLocally ? (
          <div className="p-4 rounded-xl bg-righteous-950/80 border border-righteous-600/50 text-center space-y-1.5 animate-badge-pop">
            <div className="flex items-center justify-center gap-2 text-righteous-400 text-sm font-bold">
              <CheckCircle2 className="w-5 h-5" />
              ĐÃ GỬI ĐÁP ÁN THÀNH CÔNG
            </div>
            <p className="text-xs text-slate-400 flex items-center justify-center gap-1.5">
              <Clock className="w-3.5 h-3.5 animate-spin text-amber-400" />
              Đang chờ các đội còn lại — màn hình tự chuyển khi đêm bước tiếp
            </p>
          </div>
        ) : (
          <GameButton
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            disabled={selectedOption === null || loading}
            loading={loading}
            icon={<Send className="w-4 h-4" />}
          >
            XÁC NHẬN NỘP BÀI
          </GameButton>
        )}

      </form>
    </div>
  );
};
