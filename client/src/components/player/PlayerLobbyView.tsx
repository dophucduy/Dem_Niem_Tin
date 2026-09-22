import React from "react";
import { Users, Shield, CheckCircle2, Clock, LogOut } from "lucide-react";
import { LobbyState } from "@dem-niem-tin/shared";
import { GameButton } from "../common/GameButton";

interface PlayerLobbyViewProps {
  lobby: LobbyState;
  myTeamNumber: number;
  myPlayerId: string;
  onLeaveRoom: () => void;
}

export const PlayerLobbyView: React.FC<PlayerLobbyViewProps> = ({
  lobby,
  myTeamNumber,
  onLeaveRoom,
}) => {
  const connectedTeams = lobby.teams.filter((t) => t.connected);
  const myTeam = lobby.teams.find((t) => t.teamNumber === myTeamNumber);

  return (
    <div className="w-full max-w-md mx-auto space-y-5">
      {/* Identity Card */}
      <div className="glass-panel-elevated rounded-2xl p-5 border border-trust-500/40 text-center relative overflow-hidden shadow-glow">
        <div className="absolute -right-8 -top-8 w-24 h-24 bg-trust-500/10 rounded-full blur-xl pointer-events-none" />
        
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-trust-500/20 border border-trust-500/30 text-trust-300 text-xs font-bold uppercase tracking-wider mb-2">
          <Shield className="w-3.5 h-3.5" />
          Mã phòng: {lobby.roomCode}
        </div>

        <div className="text-xs uppercase tracking-widest text-slate-400 font-medium">
          Bạn đang điều khiển
        </div>
        <h2 className="text-3xl font-black text-white tracking-wide mt-0.5">
          ĐỘI {myTeamNumber}
        </h2>
        {myTeam?.displayName && (
          <div className="text-xs text-trust-400 font-semibold mt-0.5">
            "{myTeam.displayName}"
          </div>
        )}

        <div className="mt-3 pt-3 border-t border-night-700/60 flex items-center justify-center gap-2 text-xs text-righteous-400 font-medium">
          <CheckCircle2 className="w-4 h-4" />
          Đã kết nối thành công với máy chủ
        </div>
      </div>

      {/* Classroom Teams Grid (8 Slots) */}
      <div className="glass-panel rounded-2xl p-5 border border-night-700/80">
        <div className="flex items-center justify-between mb-3.5">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-slate-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Danh sách các đội trong lớp
            </h3>
          </div>
          <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-night-900 border border-night-700 text-trust-400">
            {connectedTeams.length} / 8 Đội
          </span>
        </div>

        {/* 8 Team cards */}
        <div className="grid grid-cols-2 gap-2.5">
          {Array.from({ length: 8 }, (_, i) => i + 1).map((teamNum) => {
            const team = lobby.teams.find((t) => t.teamNumber === teamNum);
            const isConnected = !!team?.connected;
            const isMe = teamNum === myTeamNumber;

            return (
              <div
                key={teamNum}
                className={`
                  p-3 rounded-xl border transition-all flex items-center justify-between
                  ${
                    isMe
                      ? "bg-trust-500/15 border-trust-400 text-white shadow-sm"
                      : isConnected
                      ? "bg-night-900/90 border-night-700 text-slate-200"
                      : "bg-night-950/40 border-night-800 text-slate-500"
                  }
                `}
              >
                <div>
                  <div className="text-xs font-bold flex items-center gap-1.5">
                    Đội {teamNum}
                    {isMe && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-trust-500 text-night-950 font-black">
                        BẠN
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-slate-400 truncate max-w-[100px]">
                    {team?.displayName || (isConnected ? "Sẵn sàng" : "Chưa vào")}
                  </div>
                </div>

                <div className="shrink-0">
                  {isConnected ? (
                    <div className="w-2.5 h-2.5 rounded-full bg-righteous-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]" />
                  ) : (
                    <div className="w-2.5 h-2.5 rounded-full bg-slate-700" />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Waiting notification */}
        <div className="mt-4 p-3 rounded-xl bg-night-900/60 border border-night-700/60 flex items-start gap-2.5 text-xs text-slate-400">
          <Clock className="w-4 h-4 text-trust-400 shrink-0 mt-0.5 animate-pulse-subtle" />
          <span>
            Đang chờ Giảng viên / Host bắt đầu trận đấu. Vui lòng giữ kết nối và chú ý quan sát màn chiếu chính!
          </span>
        </div>
      </div>

      {/* Leave button */}
      <div className="text-center pt-1">
        <GameButton
          variant="outline"
          size="sm"
          onClick={onLeaveRoom}
          icon={<LogOut className="w-3.5 h-3.5" />}
        >
          Đổi Đội / Rời phòng
        </GameButton>
      </div>
    </div>
  );
};

