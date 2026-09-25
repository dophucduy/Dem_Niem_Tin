import type { Role, VoteResultDetails } from "@dem-niem-tin/shared";
import { ROLE_DEFINITIONS } from "../../data/roleDefinitions";
import { TrustMeter } from "../common/TrustMeter";
import { Gavel, AlertTriangle, ShieldCheck, Users, Clock } from "lucide-react";

interface Props {
  round: number;
  myTeamNumber: number;
  isMyTeamEliminated: boolean;
  details: VoteResultDetails | null;
  trust: number;
}

/**
 * Player-facing vote result rendered strictly from the structured VOTE_RESULT
 * event published by the server. When the event is missing the view says so
 * instead of inventing numbers.
 */
export function VoteResultView({ round, myTeamNumber, isMyTeamEliminated, details, trust }: Props) {
  const eliminatedTeam = details?.eliminatedTeamNumber;
  const isTie = details?.isTie ?? false;
  const isElimination = !!details && !isTie && eliminatedTeam !== undefined;
  const faction = details?.faction;
  const roleInfo = details?.role ? ROLE_DEFINITIONS[details.role as Role] : undefined;
  const distribution = details?.voteDistribution ?? [];
  const totalVotes = distribution.reduce((sum, entry) => sum + entry.votes, 0);
  const maxVotes = Math.max(1, ...distribution.map((entry) => entry.votes));

  return (
    <div className="w-full max-w-md mx-auto space-y-5">
      {/* Headline Card */}
      <div className="glass-panel-elevated rounded-3xl border border-night-700 p-6 sm:p-7 text-center space-y-3 relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none select-none font-mono font-black text-5xl rotate-[-15deg]">
          BIỂU QUYẾT
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-night-950 border border-trust-500/50 text-trust-400 text-xs font-mono font-bold uppercase tracking-widest">
          <Gavel className="w-3.5 h-3.5" />
          Kết quả bỏ phiếu • Đêm 0{round}
        </div>

        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-wide">
          {isTie
            ? "PHIẾU HÒA"
            : isElimination
            ? `ĐỘI ${eliminatedTeam} BỊ LOẠI`
            : "CHƯA CÓ KẾT QUẢ"}
        </h1>

        {isElimination && (
          <p className="text-sm text-slate-300">
            với <strong className="text-white">{details?.votesReceived}</strong> phiếu biểu quyết
            {details?.eliminatedTeamName ? ` • ${details.eliminatedTeamName}` : ""}
          </p>
        )}

        {isTie && (
          <p className="text-sm text-slate-300">
            Không đội nào bị loại trong đêm nay — các phiếu cao nhất bằng nhau.
          </p>
        )}

        {!details && (
          <p className="text-sm text-slate-400 leading-relaxed">
            Kết quả biểu quyết chưa được công bố. Hãy chờ giảng viên công bố trên màn chiếu!
          </p>
        )}

        {/* Role & faction reveal of the eliminated team (masterplan §46) */}
        {isElimination && roleInfo && (
          <div
            className={`p-4 rounded-2xl border text-left space-y-2 ${
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
        {details && details.trustDelta !== 0 && (
          <div
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold border ${
              details.trustDelta > 0
                ? "bg-righteous-950/70 text-righteous-400 border-righteous-600/50"
                : "bg-corruption-950/70 text-corruption-400 border-corruption-600/50"
            }`}
          >
            {details.trustDelta > 0 ? (
              <ShieldCheck className="w-3.5 h-3.5" />
            ) : (
              <AlertTriangle className="w-3.5 h-3.5" />
            )}
            Niềm tin nhân dân {details.trustDelta > 0 ? `+${details.trustDelta}` : details.trustDelta}
          </div>
        )}

        {isMyTeamEliminated && (
          <p className="text-xs font-bold text-amber-400 leading-relaxed">
            Đội {myTeamNumber} của bạn đã bị loại — đội chuyển sang chế độ khán giả, tiếp tục theo dõi
            và thảo luận cùng cả lớp.
          </p>
        )}
      </div>

      {/* Vote Distribution */}
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
                  <span
                    className={`font-bold ${
                      entry.teamNumber === myTeamNumber ? "text-trust-300" : "text-slate-300"
                    }`}
                  >
                    Đội {entry.teamNumber}
                    {entry.displayName ? ` • ${entry.displayName}` : ""}
                    {entry.teamNumber === myTeamNumber ? " (Bạn)" : ""}
                  </span>
                  <span className="font-mono text-slate-400">{entry.votes} phiếu</span>
                </div>
                <div className="h-2 rounded-full bg-night-900 border border-night-700 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      entry.teamNumber === eliminatedTeam ? "bg-corruption-500" : "bg-trust-500/70"
                    }`}
                    style={{ width: `${Math.round((entry.votes / maxVotes) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <TrustMeter trust={trust} variant="compact" />

      <p className="text-center text-xs text-slate-400 flex items-center justify-center gap-1.5 font-mono">
        <Clock className="w-3.5 h-3.5 animate-spin text-indigo-400" />
        Chờ giảng viên công bố bước tiếp theo
      </p>
    </div>
  );
}
