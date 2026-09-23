import React from "react";
import { 
  Moon, 
  HelpCircle, 
  Users, 
  CheckCircle2, 
  Clock, 
  ArrowRight, 
  Pause, 
  Play, 
  FastForward,
  ShieldAlert 
} from "lucide-react";
import { PublicQuestion, PublicTeam } from "@dem-niem-tin/shared";
import { TrustMeter } from "../common/TrustMeter";
import { PhaseTimer } from "../common/PhaseTimer";
import { GameButton } from "../common/GameButton";

interface HostNightStageProps {
  round: number;
  question: PublicQuestion;
  teams: PublicTeam[];
  trust: number;
  trustDelta?: number;
  phaseEndsAt?: number;
  paused?: boolean;
  onPauseToggle?: () => void;
  onSkipTimer?: () => void;
  onResolveNight?: () => void;
  loading?: boolean;
}

export const HostNightStage: React.FC<HostNightStageProps> = ({
  round = 1,
  question,
  teams,
  trust = 100,
  trustDelta,
  phaseEndsAt,
  paused = false,
  onPauseToggle,
  onSkipTimer,
  onResolveNight,
  loading = false,
}) => {
  const answeredCount = teams.filter((t) => t.ready).length;
  const isAllAnswered = answeredCount === teams.length && teams.length > 0;
  const optionLetters = ["A", "B", "C", "D"];

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 py-2">
      {/* Top HUD Status Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
        {/* Phase Indicator */}
        <div className="glass-panel rounded-2xl p-4 border border-indigo-700/50 flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-indigo-950/90 border border-indigo-500/40 flex items-center justify-center text-indigo-400 shadow-glow">
            <Moon className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">
              Giai đoạn lớp học
            </div>
            <div className="text-xl font-black text-white font-mono">
              ĐÊM 0{round} • TRI THỨC
            </div>
          </div>
        </div>

        {/* Phase Timer */}
        <div className="glass-panel rounded-2xl p-3.5 border border-night-700 flex flex-col items-center justify-center text-center">
          <div className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold mb-1">
            Thời gian suy nghĩ & trả lời
          </div>
          <PhaseTimer phaseEndsAt={phaseEndsAt} paused={paused} size="lg" />
        </div>

        {/* Trust Meter Preview */}
        <TrustMeter trust={trust} delta={trustDelta} variant="compact" />
      </div>

      {/* Central Big Stage: Question & Options for the Classroom */}
      <div className="glass-panel-elevated rounded-3xl p-8 border border-indigo-500/30 relative overflow-hidden shadow-2xl space-y-6">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

        {/* Category Badge */}
        <div className="flex items-center justify-between border-b border-night-700/80 pb-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-950/80 border border-indigo-600/50 text-indigo-300 text-xs font-bold uppercase tracking-wider">
            <HelpCircle className="w-4 h-4 text-indigo-400" />
            Chủ đề: {question.category}
          </div>

          <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-400">
            <Users className="w-4 h-4 text-trust-400" />
            <span>Tiến độ nộp bài:</span>
            <span className="text-white px-2 py-0.5 rounded bg-night-900 border border-night-700">
              {answeredCount} / {teams.length || 8} ĐỘI
            </span>
          </div>
        </div>

        {/* Question Heading */}
        <h2 className="text-2xl sm:text-3xl font-black text-white leading-snug tracking-tight">
          {question.text}
        </h2>

        {/* 4 Options Grid (2x2 for Projector screen) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {question.options.map((option, idx) => (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-night-950/70 border border-night-700/80 flex items-start gap-4 shadow-sm"
            >
              <div className="w-8 h-8 rounded-xl bg-night-800 border border-night-600 flex items-center justify-center text-trust-400 font-mono font-bold text-sm shrink-0">
                {optionLetters[idx]}
              </div>
              <div className="text-sm sm:text-base font-semibold text-slate-200 leading-relaxed pt-0.5">
                {option}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Classroom Progress (8 Teams Grid) */}
      <div className="glass-panel rounded-2xl p-5 border border-night-700 space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
            <Users className="w-4 h-4 text-trust-400" />
            Trạng thái nộp bài của 8 Đội (Không tiết lộ đúng/sai trong khi làm)
          </span>
          {isAllAnswered ? (
            <span className="text-righteous-400 font-bold text-xs animate-badge-pop">
              ✓ Toàn bộ 8 đội đã nộp bài!
            </span>
          ) : (
            <span className="text-slate-500 font-mono">
              Chờ các đội hoàn tất...
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2.5">
          {teams.map((team) => (
            <div
              key={team.id || team.teamNumber}
              className={`
                p-3 rounded-xl border text-center transition-all duration-300
                ${
                  team.ready
                    ? "bg-righteous-950/50 border-righteous-600/50 text-white"
                    : "bg-night-950/50 border-night-800 text-slate-500"
                }
              `}
            >
              <div className="text-xs font-mono font-bold">
                ĐỘI {team.teamNumber}
              </div>
              <div className="mt-1 flex items-center justify-center gap-1 text-[10px] font-semibold">
                {team.ready ? (
                  <span className="text-righteous-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    ĐÃ NỘP
                  </span>
                ) : (
                  <span className="text-slate-500 flex items-center gap-1">
                    <Clock className="w-3 h-3 animate-spin" />
                    ĐANG NGHĨ
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Host Action Bar */}
      <div className="glass-panel rounded-2xl p-5 border border-night-700 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {onPauseToggle && (
            <button
              onClick={onPauseToggle}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-night-800 hover:bg-night-700 text-xs font-bold text-slate-200 border border-night-600 cursor-pointer"
            >
              {paused ? (
                <>
                  <Play className="w-4 h-4 text-righteous-400" />
                  TIẾP TỤC
                </>
              ) : (
                <>
                  <Pause className="w-4 h-4 text-amber-400" />
                  TẠM DỪNG
                </>
              )}
            </button>
          )}

          {onSkipTimer && (
            <button
              onClick={onSkipTimer}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-night-800 hover:bg-night-700 text-xs font-bold text-slate-200 border border-night-600 cursor-pointer"
            >
              <FastForward className="w-4 h-4 text-trust-400" />
              BỎ QUA THỜI GIAN
            </button>
          )}
        </div>

        <GameButton
          variant="primary"
          size="lg"
          onClick={onResolveNight}
          loading={loading}
          icon={<ArrowRight className="w-5 h-5" />}
        >
          THẨM ĐỊNH KẾT QUẢ & MỞ KHÓA
        </GameButton>
      </div>
    </div>
  );
};

