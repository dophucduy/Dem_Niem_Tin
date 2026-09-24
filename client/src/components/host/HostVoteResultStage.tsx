import type { Faction, PublicTeam } from "@dem-niem-tin/shared";
import { GameButton } from "../common/GameButton";
import { TrustMeter } from "../common/TrustMeter";

export interface EliminationDetails {
  round: number;
  eliminatedTeamNumber?: number;
  eliminatedTeamName?: string;
  votesReceived?: number;
  faction?: Faction;
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

export function HostVoteResultStage({ trust, eliminationData, onNextPhase, loading }: Props) {
  const eliminated = eliminationData?.eliminatedTeamNumber;
  return (
    <div className="w-full max-w-4xl space-y-6">
      <div className="glass-panel-elevated rounded-3xl border border-night-700 p-8 text-center">
        <p className="text-sm font-bold text-trust-400">KẾT QUẢ BỎ PHIẾU</p>
        <h1 className="mt-3 text-4xl font-black text-white">
          {eliminationData?.isTie ? "PHIẾU HÒA" : eliminated ? `ĐỘI ${eliminated} BỊ LOẠI` : "KHÔNG CÓ ĐỘI BỊ LOẠI"}
        </h1>
        {eliminated && <p className="mt-2 text-slate-400">{eliminationData?.votesReceived ?? 0} phiếu</p>}
      </div>
      <TrustMeter trust={trust} variant="broadcast" />
      <GameButton fullWidth size="lg" onClick={onNextPhase} loading={loading}>TIẾP TỤC</GameButton>
    </div>
  );
}
