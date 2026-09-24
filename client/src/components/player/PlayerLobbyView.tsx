import React from "react";
import { Users, Shield, Clock, LogOut } from "lucide-react";
import { LobbyState } from "@dem-niem-tin/shared";
import { GameButton } from "../common/GameButton";

interface PlayerLobbyViewProps {
  lobby: LobbyState;
  myTeamNumber: number;
  onLeaveRoom: () => void;
}

export const PlayerLobbyView: React.FC<PlayerLobbyViewProps> = ({ lobby, myTeamNumber, onLeaveRoom }) => {
  const connectedPlayers = lobby.teams.filter((team) => team.connected);
  const myTeam = lobby.teams.find((team) => team.teamNumber === myTeamNumber);

  return (
    <div className="w-full max-w-md mx-auto space-y-5 animate-badge-pop">
      <div className="glass-panel-elevated rounded-2xl p-5 border border-trust-500/40 text-center relative overflow-hidden shadow-glow">
        <div className="absolute -right-8 -top-8 w-24 h-24 bg-trust-500/10 rounded-full blur-xl pointer-events-none" />
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-trust-500/20 border border-trust-500/30 text-trust-300 text-xs font-bold uppercase tracking-wider mb-2">
          <Shield className="w-3.5 h-3.5" /> Mã phòng: {lobby.roomCode}
        </div>
        <div className="text-xs uppercase tracking-widest text-slate-400 font-medium">Bạn đang tham gia với tên</div>
        <h2 className="text-3xl font-black text-white tracking-wide mt-0.5">{myTeam?.displayName ?? `Người chơi ${myTeamNumber}`}</h2>
        <div className="mt-3 pt-3 border-t border-night-700/60 flex items-center justify-center gap-2 text-amber-300 text-xs font-bold">
          <Clock className="w-4 h-4 animate-pulse-subtle" /> ĐANG CHỜ HOST BẮT ĐẦU
        </div>
      </div>

      <div className="glass-panel rounded-2xl p-5 border border-night-700/80">
        <div className="flex items-center justify-between mb-3.5">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-slate-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">Người tham gia</h3>
          </div>
          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-night-900 border border-night-700 text-slate-300">
            {connectedPlayers.length}/{lobby.teams.length} đang kết nối
          </span>
        </div>
        {lobby.teams.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-5">Đang chờ người chơi tham gia phòng.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {lobby.teams.map((team) => {
              const isMe = team.teamNumber === myTeamNumber;
              return (
                <div key={team.id} className={`p-3 rounded-xl border flex items-center justify-between ${isMe ? "bg-trust-500/15 border-trust-400 text-white" : "bg-night-900/90 border-night-700 text-slate-200"}`}>
                  <div className="min-w-0">
                    <div className="text-xs font-bold truncate">{team.displayName}{isMe ? " · BẠN" : ""}</div>
                    <div className="text-[10px] text-slate-400">Người chơi {team.teamNumber}</div>
                  </div>
                  <span className={`text-[10px] font-bold ${team.connected ? "text-righteous-400" : "text-slate-500"}`}>
                    {team.connected ? "ĐANG KẾT NỐI" : "MẤT KẾT NỐI"}
                  </span>
                </div>
              );
            })}
          </div>
        )}
        <div className="mt-4 p-3 rounded-xl bg-night-900/60 border border-night-700/60 flex items-start gap-2.5 text-xs text-slate-400">
          <Clock className="w-4 h-4 text-trust-400 shrink-0 mt-0.5 animate-pulse-subtle" />
          <span>Bạn đã vào phòng. Host sẽ bắt đầu khi mọi người đã tham gia.</span>
        </div>
      </div>

      <div className="text-center pt-1">
        <GameButton variant="outline" size="sm" onClick={onLeaveRoom} icon={<LogOut className="w-3.5 h-3.5" />}>
          Rời phòng
        </GameButton>
      </div>
    </div>
  );
};
