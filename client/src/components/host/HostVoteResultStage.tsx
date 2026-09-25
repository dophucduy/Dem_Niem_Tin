import type { Faction, PublicTeam, Role } from "@dem-niem-tin/shared";
import { GameButton } from "../common/GameButton";
import { TrustMeter } from "../common/TrustMeter";
import { ROLE_DEFINITIONS } from "../../data/roleDefinitions";
import { Gavel, AlertTriangle, ShieldCheck, Users } from "lucide-react";

export interface EliminationDetails {
  round: number;
  eliminatedTeamNumber?: number;
  eliminatedTeamName?: string;
  votesReceived?: number;
  faction?: Faction;
  role?: Role;
  trustDelta?: number;
  isTie?: boolean;
  voteDistribution?: Array<{ teamNumber: number; teamName?: string; votes: number }>;
}

interface Props {
  round: number;
  trust: number;
  teams: PublicTeam[];
  eliminationData?: EliminationDetails;
  onNextPhase: () => void;
  onRestartRound: () => void;
  loading?: boolean;
}

export function HostVoteResultStage({ round, trust, eliminationData, onNextPhase, loading }: Props) {
  const eliminated = eliminationData?.eliminatedTeamNumber;
  const isTie = eliminationData?.isTie ?? false;
  const isElimination = !!eliminationData && !isTie && eliminated !== undefined;
  const faction = eliminationData?.faction;
  const roleInfo = eliminationData?.role ? ROLE_DEFINITIONS[eliminationData.role] : undefined;
  const distribution = eliminationData?.voteDistribution ?? [];
  const totalVotes = distribution.reduce((sum, entry) => sum + entry.votes, 0);
  const maxVotes = Math.max(1, ...distribution.map((entry) => entry.votes));
  const trustDelta = eliminationData?.trustDelta ?? 0;

  return (
    <div className="w-full max-w-4xl space-y-6">
      <div className="glass-panel-elevated rounded-3xl border border-night-700 p-8 text-center space-y-4 relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none select-none font-mono font-black text-6xl rotate-[-12deg]">
          BIỂU QUYẾT
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-night-950 border border-trust-500/50 text-trust-400 text-xs font-mono font-bold uppercase tracking-widest">
          <Gavel className="w-3.5 h-3.5" />
          Kết quả bỏ phiếu • Đêm 0{round}
        </div>

        <h1 className="text-4xl font-black text-white tracking-wide">
          {isTie
            ? "PHIẾU HÒA"
            : isElimination
            ? `ĐỘI ${eliminated} BỊ LOẠI`
            : eliminationData
            ? "KHÔNG CÓ ĐỘI BỊ LOẠI"
            : "CHỜ KẾT QUẢ BIỂU QUYẾT"}
        </h1>

        {isElimination && (
          <p className="text-sm text-slate-300">
            với <strong className="text-white">{eliminationData?.votesReceived ?? 0}</strong> phiếu biểu quyết
            {eliminationData?.eliminatedTeamName ? ` • ${eliminationData.eliminatedTeamName}` : ""}
          </p>
        )}

        {isTie && (
          <p className="text-sm text-slate-300">
            Không đội nào bị loại trong đêm nay — các phiếu cao nhất bằng nhau.
          </p>
        )}

        {!eliminationData && (
          <p className="text-sm text-slate-400">
            Chưa nhận được kết quả biểu quyết từ hệ thống. Hãy chờ tổng hợp phiếu hoàn tất.
          </p>
        )}

        {/* Role & faction reveal of the eliminated team (masterplan §46) */}
        {isElimination && roleInfo && (
          <div
            className={`mx-auto max-w-xl p-4 rounded-2xl border text-left space-y-2 ${
              faction === "CORRUPTION"
                ? "bg-corruption-950/60 border-corruption-500/50 shadow-glow-danger"
                : "bg-justice-950/60 border-justice-500/50 shadow-glow-justice"
            }`}
          >
            <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400">
              Công bố danh tính bị loại
            </div>
            <div className="flex items-center justify-between gap-2">
              <span
                className={`text-sm font-black tracking-wide ${
                  faction === "CORRUPTION" ? "text-corruption-400" : "text-justice-300"
                }`}
              >
                {roleInfo.name}
              </span>
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black tracking-wider uppercase border ${
                  faction === "CORRUPTION"
                    ? "bg-corruption-950 text-corruption-400 border-corruption-600/60"
                    : "bg-justice-950 text-justice-300 border-justice-600/60"
                }`}
              >
                {faction === "CORRUPTION" ? (
                  <>
                    <AlertTriangle className="w-3 h-3" />
                    PHE THAM NHŨNG
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-3 h-3" />
                    PHE BẢO VỆ NIỀM TIN
                  </>
                )}
              </span>
            </div>
          </div>
        )}

        {/* Trust delta of the vote */}
        {trustDelta !== 0 && (
          <div
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold border ${
              trustDelta > 0
                ? "bg-righteous-950/70 text-righteous-400 border-righteous-600/50"
                : "bg-corruption-950/70 text-corruption-400 border-corruption-600/50"
            }`}
          >
            {trustDelta > 0 ? (
              <ShieldCheck className="w-3.5 h-3.5" />
            ) : (
              <AlertTriangle className="w-3.5 h-3.5" />
            )}
            Niềm tin nhân dân {trustDelta > 0 ? `+${trustDelta}` : trustDelta}
          </div>
        )}
      </div>

      {/* Vote distribution — public broadcast */}
      {distribution.length > 0 && (
        <div className="glass-panel rounded-2xl p-5 border border-night-700 space-y-3 text-left">
          <div className="flex items-center justify-between border-b border-night-700/80 pb-2.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-trust-300 flex items-center gap-1.5">
              <Users className="w-4 h-4 text-trust-400" />
              Phân bố phiếu ({totalVotes} phiếu)
            </h3>
            <span className="text-[10px] text-slate-500 font-mono">Công khai toàn lớp</span>
          </div>

          <div className="space-y-2.5">
            {distribution.map((entry) => (
              <div key={entry.teamNumber} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-300">
                    Đội {entry.teamNumber}
                    {entry.teamName ? ` • ${entry.teamName}` : ""}
                  </span>
                  <span className="font-mono text-slate-400">{entry.votes} phiếu</span>
                </div>
                <div className="h-2 rounded-full bg-night-900 border border-night-700 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      entry.teamNumber === eliminated ? "bg-corruption-500" : "bg-trust-500/70"
                    }`}
                    style={{ width: `${Math.round((entry.votes / maxVotes) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <TrustMeter trust={trust} variant="broadcast" />
      <GameButton fullWidth size="lg" onClick={onNextPhase} loading={loading}>TIẾP TỤC</GameButton>
    </div>
  );
}
