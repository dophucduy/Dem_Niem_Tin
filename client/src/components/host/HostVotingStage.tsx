import React, { useState } from "react";
import { PublicTeam } from "@dem-niem-tin/shared";
import { TrustMeter } from "../common/TrustMeter";
import { PhaseTimer } from "../common/PhaseTimer";
import { GameButton } from "../common/GameButton";
import { 
  Vote, 
  Lock, 
  CheckCircle2, 
  Clock, 
  Pause, 
  Play, 
  SkipForward, 
  Users, 
  HelpCircle, 
  ShieldAlert, 
  Layers,
  Inbox
} from "lucide-react";

interface HostVotingStageProps {
  round: number;
  trust: number;
  phaseEndsAt?: number;
  paused?: boolean;
  teams: PublicTeam[];
  onPauseToggle: () => void;
  onSkipTimer: () => void;
  onRestartRound?: () => void;
  loading?: boolean;
}

export const HostVotingStage: React.FC<HostVotingStageProps> = ({
  round,
  trust,
  phaseEndsAt,
  paused = false,
  teams,
  onPauseToggle,
  onSkipTimer,
  loading = false,
}) => {
  // 8 teams fallback
  const displayTeams: PublicTeam[] = teams.length >= 8 ? teams : Array.from({ length: 8 }).map((_, i) => ({
    id: `team-${i + 1}`,
    teamNumber: i + 1,
    displayName: `Đội ${i + 1}`,
    connected: true,
    ready: true,
    eliminated: false,
  }));

  // Track voted teams locally for visual demonstration on host
  // In real multiplayer, this can be synced or simulated
  const [votedTeamIds, setVotedTeamIds] = useState<Set<string>>(() => new Set(["team-1", "team-3"]));

  const activeTeams = displayTeams.filter(t => !t.eliminated);
  const totalActive = activeTeams.length;
  const votedCount = activeTeams.filter(t => votedTeamIds.has(t.id)).length;
  const progressPercent = totalActive > 0 ? Math.round((votedCount / totalActive) * 100) : 0;

  const toggleTeamVoted = (teamId: string) => {
    setVotedTeamIds(prev => {
      const next = new Set(prev);
      if (next.has(teamId)) next.delete(teamId);
      else next.add(teamId);
      return next;
    });
  };

  return (
    <div className="w-full min-h-[92vh] flex flex-col justify-between p-6 lg:p-8 space-y-6 animate-fade-in text-white">
      {/* 1. TOP BAR: Stage Header, 45s Countdown Timer, Trust Meter */}
      <div className="glass-panel-elevated rounded-3xl p-5 lg:p-6 border border-corruption-500/40 shadow-2xl flex flex-wrap items-center justify-between gap-4">
        {/* Stage Identity */}
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-corruption-500/20 border border-corruption-500/50 flex items-center justify-center text-corruption-400 shadow-glow-danger">
            <Vote className="w-8 h-8 animate-pulse-subtle" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-corruption-500 animate-ping" />
              <span className="text-xs font-mono font-bold tracking-widest uppercase text-corruption-400">
                PHIÊN BỎ PHIẾU &bull; NGÀY 0{round}
              </span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-black text-white tracking-wide">
              BỎ PHIẾU BẤT TÍN NHIỆM TOÀN LỚP
            </h1>
          </div>
        </div>

        {/* Big Phase Timer */}
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <div className="text-[11px] font-mono uppercase text-slate-400 tracking-wider">
              Thời gian nộp phiếu
            </div>
            <div className="text-xs text-corruption-400 font-semibold font-mono">
              45 GIÂY ĐẾM NGƯỢC
            </div>
          </div>
          <PhaseTimer phaseEndsAt={phaseEndsAt} paused={paused} size="lg" />
        </div>

        {/* Trust Meter (Compact) */}
        <div className="w-full sm:w-72 lg:w-80">
          <div className="flex justify-between items-center text-xs mb-1.5 font-bold">
            <span className="text-slate-300 uppercase tracking-wider">Niềm Tin Hiện Tại</span>
            <span className="text-trust-400 font-mono">{trust}%</span>
          </div>
          <TrustMeter trust={trust} variant="compact" />
        </div>
      </div>

      {/* 2. MAIN CENTER ARENA: Live Ballot Box & 8-Team Attendance */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1">
        {/* Left Column: Live Central Ballot Box (6 cols) */}
        <div className="lg:col-span-6 flex flex-col space-y-4">
          <div className="glass-panel-elevated rounded-3xl p-6 lg:p-8 border border-night-700/80 flex-1 flex flex-col justify-between relative overflow-hidden bg-gradient-to-b from-night-900/90 to-night-950/95">
            {/* Watermark */}
            <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none select-none font-mono font-black text-8xl rotate-[-15deg]">
              HÒM PHIẾU
            </div>

            {/* Central Ballot Box Graphic */}
            <div className="text-center space-y-4 py-4">
              <div className="relative inline-block">
                <div className="w-28 h-28 lg:w-32 lg:h-32 rounded-3xl bg-corruption-950/60 border-2 border-corruption-500/60 mx-auto flex items-center justify-center text-corruption-400 shadow-glow-danger animate-pulse-subtle">
                  <Inbox className="w-16 h-16 lg:w-20 lg:h-20" />
                </div>
                <div className="absolute -top-2 -right-2 px-3 py-1 rounded-full bg-corruption-500 text-night-950 font-black font-mono text-xs shadow-lg">
                  TRỰC TIẾP
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-xs font-mono uppercase tracking-widest text-slate-400 font-bold">
                  Hòm phiếu bảo mật toàn lớp
                </div>
                <h2 className="text-3xl lg:text-4xl font-black text-white font-mono">
                  {votedCount} / {totalActive} PHIẾU
                </h2>
                <p className="text-xs text-slate-300 max-w-sm mx-auto">
                  Các đội đang thao tác nộp phiếu bí mật trên điện thoại cá nhân.
                </p>
              </div>

              {/* Progress Bar */}
              <div className="max-w-md mx-auto space-y-1.5 pt-2">
                <div className="h-3 rounded-full bg-night-950 border border-night-700 overflow-hidden p-0.5">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-corruption-500 via-amber-400 to-righteous-400 transition-all duration-500 shadow-glow"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] font-mono text-slate-400 font-bold">
                  <span>Tiến độ thu thập</span>
                  <span className="text-white">{progressPercent}%</span>
                </div>
              </div>
            </div>

            {/* Pedagogic Rule Notice */}
            <div className="p-4 rounded-2xl bg-night-950/80 border border-night-700 text-xs text-slate-300 space-y-1.5">
              <div className="font-bold text-amber-300 flex items-center gap-1.5 uppercase text-[11px] tracking-wider">
                <Lock className="w-3.5 h-3.5" />
                Nguyên tắc biểu quyết dân chủ:
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Phiếu bầu được <strong className="text-white">mã hóa bí mật</strong> — hệ thống chỉ hiển thị trạng thái đã nộp chứ không tiết lộ đội nào bầu cho đội nào. Đội nhận số phiếu cao nhất sẽ phải rời cuộc chơi hoặc chịu chế tài minh bạch.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: 8-Team Ballot Progress Grid (6 cols) */}
        <div className="lg:col-span-6 flex flex-col space-y-3">
          <div className="flex items-center justify-between px-1">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Users className="w-4 h-4 text-trust-400" />
              TIẾN ĐỘ NỘP PHIẾU CỦA 8 ĐỘI
            </div>
            <span className="text-[11px] text-slate-500 font-mono">
              (Bấm vào thẻ đội để chuyển trạng thái test)
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 flex-1">
            {displayTeams.map((team) => {
              const isEliminated = team.eliminated;
              const hasVoted = votedTeamIds.has(team.id);

              return (
                <div
                  key={team.id}
                  onClick={() => !isEliminated && toggleTeamVoted(team.id)}
                  className={`
                    p-4 rounded-2xl border transition-all duration-200 flex flex-col justify-between cursor-pointer
                    ${
                      isEliminated
                        ? "opacity-40 bg-night-950/50 border-night-800 cursor-not-allowed"
                        : hasVoted
                        ? "bg-righteous-950/70 border-righteous-500/60 shadow-glow-righteous"
                        : "glass-panel border-night-700/80 hover:border-slate-500"
                    }
                  `}
                >
                  <div className="flex items-center justify-between">
                    <div
                      className={`w-8 h-8 rounded-xl font-mono font-black text-sm flex items-center justify-center ${
                        hasVoted
                          ? "bg-righteous-500 text-night-950"
                          : "bg-night-900 border border-night-700 text-white"
                      }`}
                    >
                      0{team.teamNumber}
                    </div>

                    {isEliminated ? (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-night-800 text-slate-500 border border-night-700">
                        ĐÃ LOẠI
                      </span>
                    ) : hasVoted ? (
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-righteous-500/20 text-righteous-300 border border-righteous-500/40 flex items-center gap-1 shadow-sm">
                        <CheckCircle2 className="w-3 h-3 text-righteous-400" />
                        ĐÃ NỘP PHIẾU
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                        <Clock className="w-3 h-3 animate-spin" />
                        ĐANG SUY NGHĨ
                      </span>
                    )}
                  </div>

                  <div className="pt-3">
                    <div className="text-sm font-bold text-white truncate">
                      {team.displayName}
                    </div>
                    <div className="text-[11px] text-slate-400 flex items-center justify-between pt-0.5">
                      <span>{isEliminated ? "Không tham gia" : hasVoted ? "Phiếu đã niêm phong" : "Chưa hoàn tất nộp"}</span>
                      {hasVoted && <Lock className="w-3 h-3 text-righteous-400" />}
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
        {/* Left: Hint */}
        <div className="flex items-center gap-3 text-xs text-slate-400">
          <HelpCircle className="w-5 h-5 text-trust-400 shrink-0" />
          <span>
            Khi đủ 100% số phiếu hoặc giảng viên bấm nút, hệ thống sẽ tiến hành <strong>Kiểm phiếu Công khai (H-07)</strong>.
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
            variant="danger"
            size="md"
            onClick={onSkipTimer}
            icon={<SkipForward className="w-4 h-4" />}
            disabled={loading}
          >
            ĐÓNG HÒM PHIẾU &amp; KIỂM PHIẾU (H-07)
          </GameButton>
        </div>
      </div>
    </div>
  );
};

