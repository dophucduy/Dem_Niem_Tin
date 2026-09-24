import React, { useState } from "react";
import { PublicTeam, Clue } from "@dem-niem-tin/shared";
import { TrustMeter } from "../common/TrustMeter";
import { PhaseTimer } from "../common/PhaseTimer";
import { GameButton } from "../common/GameButton";
import { 
  MessageSquare, 
  Mic, 
  MicOff, 
  FileText, 
  Sparkles, 
  Pause, 
  Play, 
  SkipForward, 
  Users, 
  HelpCircle, 
  Volume2, 
  Shuffle, 
  CheckCircle2,
  AlertCircle
} from "lucide-react";

interface HostDiscussionStageProps {
  round: number;
  trust: number;
  phaseEndsAt?: number;
  paused?: boolean;
  publicClues: Clue[];
  teams: PublicTeam[];
  onPauseToggle: () => void;
  onSkipTimer: () => void;
  onRestartRound?: () => void;
  loading?: boolean;
}

export const HostDiscussionStage: React.FC<HostDiscussionStageProps> = ({
  round,
  trust,
  phaseEndsAt,
  paused = false,
  publicClues,
  teams,
  onPauseToggle,
  onSkipTimer,
  onRestartRound,
  loading = false,
}) => {
  const [selectedSpeakerId, setSelectedSpeakerId] = useState<string | null>(null);

  // Fallback 8 teams if empty
  const displayTeams: PublicTeam[] = teams.length >= 8 ? teams : Array.from({ length: 8 }).map((_, i) => ({
    id: `team-${i + 1}`,
    teamNumber: i + 1,
    displayName: `Đội ${i + 1}`,
    connected: true,
    ready: true,
    eliminated: false,
  }));

  const activeSpeaker = displayTeams.find(t => t.id === selectedSpeakerId);

  // Pick random speaker for classroom engagement
  const handleRandomSpeaker = () => {
    const connectedTeams = displayTeams.filter(t => !t.eliminated);
    if (connectedTeams.length > 0) {
      const rand = connectedTeams[Math.floor(Math.random() * connectedTeams.length)];
      setSelectedSpeakerId(rand.id);
    }
  };

  return (
    <div className="w-full min-h-[92vh] flex flex-col justify-between p-6 lg:p-8 space-y-6 animate-fade-in text-white">
      {/* 1. TOP BAR: Stage Title, 90s Countdown Timer, Trust Meter */}
      <div className="glass-panel-elevated rounded-3xl p-5 lg:p-6 border border-night-700/80 shadow-2xl flex flex-wrap items-center justify-between gap-4">
        {/* Stage Identity */}
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-glow">
            <MessageSquare className="w-8 h-8 animate-pulse-subtle" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
              <span className="text-xs font-mono font-bold tracking-widest uppercase text-amber-300">
                PHIÊN BAN NGÀY &bull; NGÀY 0{round}
              </span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-black text-white tracking-wide">
              TRANH LUẬN &amp; ĐỐI CHẤT TRỰC TIẾP
            </h1>
          </div>
        </div>

        {/* Big Phase Timer */}
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <div className="text-[11px] font-mono uppercase text-slate-400 tracking-wider">
              Thời gian thảo luận
            </div>
            <div className="text-xs text-slate-300 font-semibold">
              Chuẩn bị bỏ phiếu tín nhiệm
            </div>
          </div>
          <PhaseTimer phaseEndsAt={phaseEndsAt} paused={paused} size="lg" />
        </div>

        {/* Trust Meter (Broadcast format) */}
        <div className="w-full sm:w-72 lg:w-80">
          <div className="flex justify-between items-center text-xs mb-1.5 font-bold">
            <span className="text-slate-300 uppercase tracking-wider">Niềm Tin Nhân Dân</span>
            <span className="text-trust-400 font-mono">{trust}%</span>
          </div>
          <TrustMeter trust={trust} variant="compact" />
        </div>
      </div>

      {/* 2. MAIN CENTER ARENA: Active Speaker Spotlight & Evidence Dossier Board */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1">
        {/* Left Column: Speaker Spotlight & Evidence Dossier (7 cols) */}
        <div className="lg:col-span-7 flex flex-col space-y-5">
          {/* Spotlight Speaker Stage */}
          <div className={`
            glass-panel-elevated rounded-3xl p-6 border transition-all duration-300 relative overflow-hidden
            ${activeSpeaker 
              ? "border-amber-400/80 shadow-glow-amber bg-gradient-to-b from-amber-950/40 to-night-950/90" 
              : "border-night-700/80 bg-night-900/60"}
          `}>
            {activeSpeaker ? (
              <div className="space-y-4 animate-scale-in">
                <div className="flex items-center justify-between border-b border-amber-500/30 pb-3">
                  <div className="flex items-center gap-2 text-amber-300 font-mono text-xs font-bold uppercase tracking-wider">
                    <Mic className="w-4 h-4 animate-bounce" />
                    ĐANG PHÁT BIỂU TRƯỚC TOÀN THỂ LỚP HỌC
                  </div>
                  <button
                    onClick={() => setSelectedSpeakerId(null)}
                    className="text-xs text-slate-400 hover:text-white px-2.5 py-1 rounded-lg bg-night-800 border border-night-700 hover:border-slate-500 transition-all flex items-center gap-1"
                  >
                    <MicOff className="w-3.5 h-3.5" />
                    Bỏ chọn
                  </button>
                </div>

                <div className="flex items-center gap-5">
                  <div className="w-20 h-20 rounded-2xl bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center font-mono font-black text-3xl text-amber-300 shadow-glow-amber">
                    {activeSpeaker.teamNumber}
                  </div>
                  <div>
                    <h2 className="text-2xl lg:text-3xl font-black text-white">
                      {activeSpeaker.displayName}
                    </h2>
                    <p className="text-sm text-amber-200/90 font-medium pt-1">
                      Đang thực hiện quyền trình bày quan điểm, giải trình và chất vấn nghi vấn.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-night-950/80 border border-amber-500/30 text-xs text-slate-300 flex items-start gap-2.5">
                  <Volume2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <p className="leading-relaxed">
                    <strong>Gợi ý điều phối cho Giảng viên:</strong> Yêu cầu Đội {activeSpeaker.teamNumber} tập trung trả lời về các điểm nghi vấn trong hồ sơ hoặc đưa ra chất vấn có căn cứ đối với đội khác.
                  </p>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center space-y-3">
                <div className="w-16 h-16 rounded-2xl bg-night-800 border border-night-700 mx-auto flex items-center justify-center text-slate-400">
                  <Mic className="w-8 h-8 opacity-60" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-white">
                    CHƯA CHỈ ĐỊNH ĐỘI PHÁT BIỂU
                  </h3>
                  <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                    Giảng viên nhấp chọn một đội ở danh sách bên phải hoặc nhấn <strong>"Chỉ định ngẫu nhiên"</strong> để mời đội trình bày.
                  </p>
                </div>
                <button
                  onClick={handleRandomSpeaker}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-trust-600/30 hover:bg-trust-600/50 border border-trust-500/40 text-trust-300 text-xs font-bold transition-all"
                >
                  <Shuffle className="w-4 h-4" />
                  Chỉ định ngẫu nhiên một đội
                </button>
              </div>
            )}
          </div>

          {/* Evidence Dossier Board */}
          <div className="glass-panel rounded-3xl p-5 lg:p-6 border border-night-700/80 flex-1 flex flex-col space-y-3">
            <div className="flex items-center justify-between border-b border-night-700/80 pb-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-trust-300 flex items-center gap-2">
                <FileText className="w-4 h-4 text-trust-400" />
                HỒ SƠ CHỨNG CỨ VÀ TÀI LIỆU CÔNG KHAI ({publicClues.length})
              </h3>
              <span className="text-[11px] font-mono text-slate-400">
                Toàn thể lớp học cùng theo dõi
              </span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-1 max-h-[300px]">
              {publicClues.length === 0 ? (
                <div className="h-full flex items-center justify-center p-6 text-xs text-slate-500 italic">
                  Chưa có tài liệu mới được đưa vào hồ sơ vụ án trong phiên này.
                </div>
              ) : (
                publicClues.map((clue, idx) => (
                  <div
                    key={clue.id || idx}
                    className="p-4 rounded-2xl bg-night-950/80 border border-night-700 space-y-1.5 transition-all hover:border-trust-500/50"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-white flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-amber-400" />
                        {clue.title}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-night-800 border border-night-700 text-slate-300">
                        Tài liệu #{idx + 1}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed font-sans">
                      {clue.description}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column: 8-Team Classroom Attendance & Speaker Selection (5 cols) */}
        <div className="lg:col-span-5 flex flex-col space-y-3">
          <div className="flex items-center justify-between px-1">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Users className="w-4 h-4 text-trust-400" />
              DANH SÁCH 8 ĐỘI CHƠI (BẤM ĐỂ CHỈ ĐỊNH PHÁT BIỂU)
            </div>
            <button
              onClick={handleRandomSpeaker}
              className="text-[11px] text-trust-400 hover:text-trust-300 flex items-center gap-1 font-mono font-bold"
            >
              <Shuffle className="w-3.5 h-3.5" />
              Chọn ngẫu nhiên
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3 flex-1">
            {displayTeams.map((team) => {
              const isSpeaking = activeSpeaker?.id === team.id;
              return (
                <div
                  key={team.id}
                  onClick={() => setSelectedSpeakerId(isSpeaking ? null : team.id)}
                  className={`
                    p-4 rounded-2xl border cursor-pointer transition-all duration-200 flex flex-col justify-between
                    ${isSpeaking
                      ? "bg-amber-950/80 border-amber-400 shadow-glow-amber scale-[1.02]"
                      : "glass-panel border-night-700/80 hover:border-trust-500/50 hover:bg-night-800/80"}
                  `}
                >
                  <div className="flex items-center justify-between">
                    <div className="w-8 h-8 rounded-xl bg-night-900 border border-night-700 flex items-center justify-center font-mono font-black text-sm text-white">
                      0{team.teamNumber}
                    </div>

                    {isSpeaking ? (
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-500 text-night-950 flex items-center gap-1">
                        <Mic className="w-3 h-3 animate-pulse" />
                        ĐANG NÓI
                      </span>
                    ) : (
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" title="Online" />
                    )}
                  </div>

                  <div className="pt-3">
                    <div className="text-sm font-bold text-white truncate">
                      {team.displayName}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {isSpeaking ? "Bấm để tắt" : "Bấm để chỉ định"}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 3. BOTTOM CONTROL BAR: Host Action Controls */}
      <div className="glass-panel-elevated rounded-3xl p-4 lg:p-5 border border-night-700/80 flex flex-wrap items-center justify-between gap-4">
        {/* Left: Quick Guide */}
        <div className="flex items-center gap-3 text-xs text-slate-400">
          <HelpCircle className="w-5 h-5 text-trust-400 shrink-0" />
          <span>
            Hết 90s tranh luận, hệ thống sẽ tự động chuyển sang <strong>Phiên Bỏ phiếu Tín nhiệm (H-06)</strong>.
          </span>
        </div>

        {/* Right: Action Buttons */}
        <div className="flex items-center gap-3">
          <GameButton
            variant="outline"
            size="md"
            onClick={onPauseToggle}
            icon={paused ? <Play className="w-4 h-4 text-emerald-400" /> : <Pause className="w-4 h-4 text-amber-400" />}
          >
            {paused ? "TIẾP TỤC" : "TẠM DỪNG"}
          </GameButton>

          <GameButton
            variant="primary"
            size="md"
            onClick={onSkipTimer}
            icon={<SkipForward className="w-4 h-4" />}
            disabled={loading}
          >
            BƯỚC VÀO PHIÊN BỎ PHIẾU (H-06)
          </GameButton>
        </div>
      </div>
    </div>
  );
};
