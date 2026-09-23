import type { PublicGameState } from "@dem-niem-tin/shared";
import { Pause, Play, RotateCcw, SkipForward, Square } from "lucide-react";
import { GameButton } from "../common/GameButton";
import { TrustMeter } from "../common/TrustMeter";

type HostRuntimeViewProps = {
  state: PublicGameState;
  loading: boolean;
  onPause: () => void;
  onResume: () => void;
  onSkip: () => void;
  onRestartRound: () => void;
  onEnd: () => void;
  onReset: () => void;
};

export function HostRuntimeView({
  state,
  loading,
  onPause,
  onResume,
  onSkip,
  onRestartRound,
  onEnd,
  onReset,
}: HostRuntimeViewProps) {
  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 py-6">
      <section className="glass-panel-elevated rounded-3xl border border-trust-500/30 p-8 text-center">
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-trust-400">Server authoritative</p>
        <h2 className="mt-3 text-4xl font-black text-white">{state.phase}</h2>
        <p className="mt-2 font-mono text-slate-400">Vòng {state.round || "Chuẩn bị phân vai"}</p>
        <div className="mx-auto mt-8 max-w-2xl">
          <TrustMeter trust={state.trust} variant="broadcast" />
        </div>
      </section>

      <section className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {state.teams.map((team) => (
          <article
            key={team.id}
            className="rounded-2xl border border-night-700 bg-night-900/80 p-4"
          >
            <p className="text-xs uppercase tracking-wider text-slate-500">Đội {team.teamNumber}</p>
            <p className="mt-1 truncate font-bold text-white">{team.displayName}</p>
            <p className={team.connected ? "mt-2 text-xs text-righteous-400" : "mt-2 text-xs text-slate-500"}>
              {team.connected ? "● Đang kết nối" : "○ Mất kết nối"}
            </p>
          </article>
        ))}
      </section>

      <section className="glass-panel flex flex-wrap items-center justify-center gap-3 rounded-2xl border border-night-700 p-5">
        {state.paused ? (
          <GameButton loading={loading} onClick={onResume} icon={<Play className="h-4 w-4" />}>
            Tiếp tục
          </GameButton>
        ) : (
          <GameButton loading={loading} onClick={onPause} icon={<Pause className="h-4 w-4" />}>
            Tạm dừng
          </GameButton>
        )}
        <GameButton variant="justice" loading={loading} onClick={onSkip} icon={<SkipForward className="h-4 w-4" />}>
          Chuyển bước
        </GameButton>
        <GameButton variant="outline" loading={loading} onClick={onRestartRound} icon={<RotateCcw className="h-4 w-4" />}>
          Chạy lại vòng
        </GameButton>
        <GameButton variant="danger" loading={loading} onClick={onEnd} icon={<Square className="h-4 w-4" />}>
          Kết thúc game
        </GameButton>
        <GameButton variant="outline" loading={loading} onClick={onReset}>
          Reset về Lobby
        </GameButton>
      </section>
    </div>
  );
}
