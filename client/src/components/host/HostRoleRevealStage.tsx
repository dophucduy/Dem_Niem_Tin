import React from "react";
import { 
  Lock, 
  EyeOff, 
  CheckCircle2, 
  Clock, 
  ArrowRight, 
  ShieldAlert, 
  Scale 
} from "lucide-react";
import { PublicTeam } from "@dem-niem-tin/shared";
import { GameButton } from "../common/GameButton";

interface HostRoleRevealStageProps {
  teams: PublicTeam[];
  onProceedToNight: () => void;
  loading?: boolean;
  phaseEndsAt?: number;
  paused?: boolean;
}

export const HostRoleRevealStage: React.FC<HostRoleRevealStageProps> = ({
  teams,
  onProceedToNight,
  loading = false,
  phaseEndsAt,
  paused = false,
}) => {
  const readyCount = teams.filter((t) => t.ready).length;
  const isAllReady = readyCount === teams.length && teams.length > 0;

  const [secondsRemaining, setSecondsRemaining] = React.useState<number>(() => {
    if (!phaseEndsAt) return 30;
    return Math.max(0, Math.ceil((phaseEndsAt - Date.now()) / 1000));
  });

  React.useEffect(() => {
    if (!phaseEndsAt || paused) return;
    const updateTimer = () => {
      const remaining = Math.max(0, Math.ceil((phaseEndsAt - Date.now()) / 1000));
      setSecondsRemaining(remaining);
    };
    updateTimer();
    const interval = setInterval(updateTimer, 500);
    return () => clearInterval(interval);
  }, [phaseEndsAt, paused]);

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 py-4">
      {/* Central Announcement Card */}
      <div className="glass-panel-elevated rounded-3xl p-8 sm:p-10 border border-trust-500/40 text-center relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-40 bg-trust-500/10 blur-3xl pointer-events-none" />

        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-trust-500/10 border border-trust-500/30 text-trust-400 text-xs font-bold uppercase tracking-[0.25em] mb-4">
          <Lock className="w-4 h-4" />
          Giai đoạn: Phân phát Vai trò Bí mật
        </div>

        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-wide mb-3">
          MỞ NIÊM PHONG HỒ SƠ
        </h1>

        <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto mb-6 leading-relaxed">
          Tất cả 8 đội đang mở niêm phong hồ sơ nhận vai trò trên thiết bị của mình.
          <br />
          <strong className="text-trust-400">
            Giữ bí mật tuyệt đối danh tính và quyền năng của đội bạn!
          </strong>
        </p>

        {/* Classroom Warning Notice */}
        <div className="max-w-xl mx-auto p-4 rounded-2xl bg-night-950/80 border border-night-700 text-left flex items-start gap-3 text-xs text-slate-300 mb-6">
          <ShieldAlert className="w-5 h-5 text-trust-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-white uppercase tracking-wider block mb-0.5">
              Cơ chế cốt lõi của Đêm Niềm Tin:
            </span>
            Mỗi đội đều sở hữu một chức năng đặc biệt. Tuy nhiên, quyền năng chỉ được mở khóa khi đội bạn vượt qua thử thách tri thức ở đầu mỗi đêm!
          </div>
        </div>

        {/* Ready Counter & Countdown Timer */}
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-slate-300">
              Tiến độ mở niêm phong:
            </span>
            <span className="font-mono font-bold text-lg text-trust-400 px-3 py-1 rounded-lg bg-night-900 border border-night-700">
              {readyCount} / {teams.length || 8} ĐỘI ĐÃ SẴN SÀNG
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-slate-300">
              Thời gian còn lại:
            </span>
            <span className={`font-mono font-bold text-lg px-3 py-1 rounded-lg border ${
              secondsRemaining <= 10 
                ? "bg-corruption-950/80 border-corruption-600 text-corruption-400 animate-pulse" 
                : "bg-night-900 border-night-700 text-trust-300"
            }`}>
              <Clock className="w-4 h-4 inline mr-1.5 -mt-0.5" />
              {secondsRemaining}s
            </span>
          </div>
        </div>
      </div>

      {/* 8 Teams Status Grid (Host sees only Ready status, NEVER secret roles!) */}
      <div>
        <div className="flex items-center justify-between mb-4 px-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <EyeOff className="w-4 h-4 text-trust-400" />
            Trạng thái xác nhận của các đội (Vai trò được mã hóa tuyệt mật)
          </h2>
          <span className="text-xs text-slate-500 font-mono">
            Host không thấy vai trò để bảo đảm tính công bằng
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          {teams.map((team) => (
            <div
              key={team.id || team.teamNumber}
              className={`
                p-4 rounded-2xl border transition-all duration-300 flex items-center justify-between
                ${
                  team.ready
                    ? "bg-night-900/90 border-righteous-600/50 text-white shadow-sm"
                    : "bg-night-950/50 border-night-800 text-slate-400"
                }
              `}
            >
              <div>
                <div className="text-sm font-bold font-mono">
                  ĐỘI {team.teamNumber}
                </div>
                <div className="text-[11px] text-slate-400 truncate">
                  {team.displayName || `Nhóm ${team.teamNumber}`}
                </div>
              </div>

              <div className="shrink-0">
                {team.ready ? (
                  <div className="flex items-center gap-1 text-[11px] font-bold text-righteous-400">
                    <CheckCircle2 className="w-4 h-4 text-righteous-400" />
                    <span>SẴN SÀNG</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-[11px] text-amber-400/80">
                    <Clock className="w-3.5 h-3.5 animate-spin" />
                    <span>ĐANG XEM</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Host Controls */}
      <div className="glass-panel rounded-2xl p-6 border border-night-700 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-xs text-slate-400 flex items-center gap-2">
          <Scale className="w-4 h-4 text-trust-400" />
          Khi toàn bộ các đội đã mở hồ sơ và sẵn sàng, Giảng viên bấm để bắt đầu Đêm thứ nhất.
        </div>

        <GameButton
          variant="primary"
          size="lg"
          onClick={onProceedToNight}
          loading={loading}
          icon={<ArrowRight className="w-5 h-5" />}
        >
          BƯỚC VÀO ĐÊM 01
        </GameButton>
      </div>
    </div>
  );
};

