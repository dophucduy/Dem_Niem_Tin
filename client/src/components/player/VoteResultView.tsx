import type { Faction } from "@dem-niem-tin/shared";
import { TrustMeter } from "../common/TrustMeter";

interface Props {
  round: number;
  myTeamNumber: number;
  isMyTeamEliminated: boolean;
  eliminatedTeamNumber?: number;
  eliminatedTeamName?: string;
  votesReceived?: number;
  faction?: Faction;
  trustDelta?: number;
  isTie?: boolean;
  trust: number;
  voteDistribution?: Array<{ teamNumber: number; teamName?: string; votes: number }>;
}

export function VoteResultView({ isMyTeamEliminated, eliminatedTeamNumber, votesReceived, isTie, trust }: Props) {
  return (
    <div className="w-full max-w-md space-y-5">
      <div className="glass-panel-elevated rounded-3xl border border-night-700 p-7 text-center">
        <p className="text-xs font-bold text-trust-400">KẾT QUẢ BỎ PHIẾU</p>
        <h1 className="mt-3 text-3xl font-black text-white">
          {isTie ? "PHIẾU HÒA" : eliminatedTeamNumber ? `ĐỘI ${eliminatedTeamNumber} BỊ LOẠI` : "KHÔNG CÓ ĐỘI BỊ LOẠI"}
        </h1>
        {eliminatedTeamNumber && <p className="mt-2 text-sm text-slate-400">{votesReceived ?? 0} phiếu</p>}
        {isMyTeamEliminated && <p className="mt-4 font-bold text-amber-400">Đội bạn chuyển sang quan sát</p>}
      </div>
      <TrustMeter trust={trust} variant="compact" />
      <p className="text-center text-sm text-slate-400">Chờ giảng viên tiếp tục</p>
    </div>
  );
}
