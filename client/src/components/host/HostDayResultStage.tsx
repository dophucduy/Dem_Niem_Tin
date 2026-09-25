import React from "react";
import { 
  Sun, 
  FileText, 
  Users, 
  CheckCircle2, 
  ArrowRight, 
  Pause, 
  Play, 
  RotateCcw,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  Scale
} from "lucide-react";
import { Clue, PublicTeam } from "@dem-niem-tin/shared";
import { TrustMeter } from "../common/TrustMeter";
import { GameButton } from "../common/GameButton";

interface HostDayResultStageProps {
  round: number;
  trust: number;
  trustDelta?: number;
  publicClues: Clue[];
  teams: PublicTeam[];
  paused?: boolean;
  onPauseToggle?: () => void;
  onStartDiscussion: () => void;
  onRestartRound?: () => void;
  loading?: boolean;
}

export const HostDayResultStage: React.FC<HostDayResultStageProps> = ({
  round = 1,
  trust = 100,
  trustDelta,
  publicClues = [],
  teams,
  paused = false,
  onPauseToggle,
  onStartDiscussion,
  onRestartRound,
  loading = false,
}) => {
  const displayClues = publicClues;

  const NIGHT_THEMES: Record<number, string> = {
    1: "PHÁT HIỆN DẤU HIỆU",
    2: "KIỂM SOÁT QUYỀN LỰC",
    3: "NIỀM TIN VÀ TRÁCH NHIỆM",
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 py-2 animate-fade-in">
      {/* Top HUD Status Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
        {/* Phase Indicator */}
        <div className="glass-panel rounded-2xl p-4 border border-amber-500/40 flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/50 flex items-center justify-center text-amber-300 shadow-glow">
            <Sun className="w-6 h-6 animate-pulse-subtle" />
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-widest text-amber-400 font-bold">
              Giai đoạn lớp học
            </div>
            <div className="text-xl font-black text-white font-mono">
              NGÀY 0{round} • BÁO CÁO VỤ ÁN
            </div>
          </div>
        </div>

        {/* Classroom Summary Pill */}
        <div className="glass-panel rounded-2xl p-4 border border-night-700 flex items-center justify-between text-xs">
          <span className="text-slate-400 font-semibold">Tình trạng đêm qua:</span>
          <span className="text-righteous-400 font-bold font-mono px-2.5 py-1 rounded-lg bg-righteous-950/80 border border-righteous-500/40">
            ✓ ĐÃ XỬ LÝ XONG HÀNH ĐỘNG
          </span>
        </div>

        {/* Trust Meter Preview */}
        <TrustMeter trust={trust} delta={trustDelta} variant="compact" />
      </div>

      {/* Main Central Stage: 2-Column Classroom Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2/3): Public Clues & Dossier Board */}
        <div className="lg:col-span-2 glass-panel-elevated rounded-3xl p-6 sm:p-8 border border-amber-500/30 relative overflow-hidden shadow-2xl space-y-5">
          <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

          {/* Dossier Header */}
          <div className="flex items-center justify-between border-b border-night-700/80 pb-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-950/80 border border-amber-600/50 text-amber-300 text-xs font-bold uppercase tracking-wider">
              <FileText className="w-4 h-4 text-amber-400" />
              Bảng hồ sơ manh mối công khai ({displayClues.length})
            </div>
            <div className="flex items-center gap-3">
              {NIGHT_THEMES[round] && (
                <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-trust-950/80 border border-trust-600/40 text-trust-300 uppercase tracking-wider">
                  Chủ đề: {NIGHT_THEMES[round]}
                </span>
              )}
              <span className="text-xs text-slate-400 font-mono">
                Trình chiếu toàn thể lớp học
              </span>
            </div>
          </div>

          {/* Clues List - Enhanced with structured checklist */}
          <div className="space-y-3.5">
            {displayClues.map((clue, idx) => {
              // Parse structured clue descriptions containing ✓ / ? markers
              const lines = clue.description.split('\n').map(l => l.trim()).filter(Boolean);
              const hasChecklist = lines.some(l => l.startsWith('✓') || l.startsWith('?') || l.startsWith('✗'));

              return (
                <div
                  key={clue.id || idx}
                  className="p-5 rounded-2xl bg-night-950/80 border border-night-700 border-l-4 border-l-amber-500/60 space-y-3 text-left transition-all hover:border-amber-500/40 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-bold text-white flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      {clue.title}
                    </div>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-950/80 border border-amber-600/40 text-amber-300">
                      HỒ SƠ #{idx + 1} • VÒNG {round}
                    </span>
                  </div>

                  {hasChecklist ? (
                    <div className="space-y-1.5">
                      {lines.map((line, li) => {
                        const isConfirmed = line.startsWith('✓');
                        const isUnknown = line.startsWith('?');
                        const text = line.replace(/^[✓?✗]\s*/, '');
                        return (
                          <div
                            key={li}
                            className={`flex items-start gap-2.5 p-2.5 rounded-lg text-xs sm:text-sm leading-relaxed ${
                              isConfirmed
                                ? 'bg-amber-950/50 border border-amber-800/50'
                                : 'bg-night-900/60 border border-night-700/60'
                            }`}
                          >
                            <span className="shrink-0 mt-0.5 text-base">
                              {isConfirmed ? '✅' : '❓'}
                            </span>
                            <span className={
                              isConfirmed
                                ? 'text-amber-200 font-semibold'
                                : 'text-slate-400 italic'
                            }>
                              {text}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
                      {clue.description}
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          <div className="p-4 rounded-2xl bg-night-950/90 border border-night-700 flex items-center gap-3 text-xs text-slate-400">
            <Scale className="w-5 h-5 text-trust-400 shrink-0" />
            <span>
              Giảng viên nhắc nhở: Các đội dựa trên các manh mối công khai này và kết quả nghiệp vụ riêng để phát biểu trong phiên thảo luận.
            </span>
          </div>
        </div>

        {/* Right Column (1/3): Trust & Classroom Readiness */}
        <div className="glass-panel-elevated rounded-3xl p-6 sm:p-7 border border-night-700 space-y-5">
          <div className="space-y-1">
            <div className="text-[10px] uppercase tracking-widest text-trust-400 font-bold">
              Chỉ số cốt lõi
            </div>
            <h3 className="text-lg font-black text-white">LÒNG DÂN VÀ NIỀM TIN</h3>
          </div>

          <div className="py-2">
            <TrustMeter trust={trust} delta={trustDelta} variant="broadcast" />
          </div>

          <div className="p-4 rounded-2xl bg-night-950/80 border border-night-700 text-xs text-slate-300 space-y-2">
            <div className="font-bold text-trust-400 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-trust-400" />
              Quy tắc thắng / thua:
            </div>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              Nếu điểm Niềm tin giảm xuống <strong className="text-corruption-400">&lt; 50%</strong> vào cuối Vòng 3, phe Người Vụ Lợi sẽ chiến thắng. Ngược lại, nhân dân giữ trọn niềm tin!
            </p>
          </div>

          <div className="space-y-2 pt-1">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Trạng thái người chơi:
            </div>
            <div className="grid grid-cols-4 gap-2">
              {teams.map((t) => (
                <div
                  key={t.id || t.teamNumber}
                  className="p-2 rounded-xl bg-night-950 border border-night-800 text-center"
                >
                  <div className="text-[10px] text-slate-500 font-bold font-mono">
                    ĐỘI {t.teamNumber}
                  </div>
                  <div className="text-[9px] text-righteous-400 font-semibold mt-0.5">
                    {t.connected ? "ĐÃ KẾT NỐI" : "MẤT KẾT NỐI"}
                  </div>
                </div>
              ))}
            </div>
          </div>
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

          {onRestartRound && (
            <button
              onClick={onRestartRound}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-night-800 hover:bg-night-700 text-xs font-bold text-slate-200 border border-night-600 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4 text-slate-400" />
              CHẠY LẠI VÒNG
            </button>
          )}
        </div>

        <GameButton
          variant="primary"
          size="lg"
          onClick={onStartDiscussion}
          loading={loading}
          icon={<ArrowRight className="w-5 h-5" />}
        >
          BẮT ĐẦU PHIÊN THẢO LUẬN BAN NGÀY
        </GameButton>
      </div>
    </div>
  );
};
