import React, { useState } from "react";
import { 
  Scale, 
  Users, 
  Play, 
  QrCode, 
  Copy, 
  Check, 
  RefreshCw, 
  Shield, 
  AlertCircle,
  LogOut
} from "lucide-react";
import { LobbyState } from "@dem-niem-tin/shared";
import { GameButton } from "../common/GameButton";

interface HostLobbyViewProps {
  lobby: LobbyState;
  onStartGame: () => void;
  onResetRoom?: () => void;
  onDestroyRoom?: () => void;
  loading?: boolean;
  errorMessage?: string | null;
  onSimulateFullLobby?: (excludeTeam?: number) => void;
}

export const HostLobbyView: React.FC<HostLobbyViewProps> = ({
  lobby,
  onStartGame,
  onResetRoom,
  onDestroyRoom,
  loading = false,
  errorMessage = null,
  onSimulateFullLobby,
}) => {
  const [copied, setCopied] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);

  const connectedCount = lobby.teams.filter((t) => t.connected).length;
  const readyCount = lobby.teams.filter((t) => t.connected && t.ready).length;
  const isReadyToStart = connectedCount === 8 && readyCount === 8;

  // In production or LAN, players scan or access window.location.origin/?code=...
  const joinUrl = typeof window !== "undefined"
    ? `${window.location.origin}/?code=${lobby.roomCode}`
    : `http://localhost:5173/?code=${lobby.roomCode}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(joinUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 py-4">
      {/* Top Banner & Room Code */}
      <div className="glass-panel-elevated rounded-3xl p-8 border border-trust-500/30 text-center relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-40 bg-trust-500/10 blur-3xl pointer-events-none" />

        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-trust-500/10 border border-trust-500/30 text-trust-400 text-xs font-bold uppercase tracking-[0.25em] mb-4">
          <Scale className="w-4 h-4" />
          Phòng học trực quan • Giai đoạn chuẩn bị
        </div>

        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-wider mb-2">
          ĐÊM NIỀM TIN
        </h1>
        <p className="text-slate-400 text-sm sm:text-base max-w-xl mx-auto mb-6">
          Các đội sử dụng điện thoại quét mã QR hoặc truy cập đường dẫn để tham gia vào đúng đội của mình
        </p>

        {/* Room Code Display */}
        <div className="inline-flex flex-col sm:flex-row items-center gap-4 p-4 sm:px-8 sm:py-5 rounded-2xl bg-night-950/80 border border-trust-500/50 shadow-glow">
          <div className="text-left">
            <div className="text-[11px] uppercase tracking-widest text-slate-400 font-semibold">
              Mã phòng (Room Code)
            </div>
            <div className="text-4xl sm:text-5xl font-mono font-black tracking-widest text-trust-400">
              {lobby.roomCode}
            </div>
          </div>

          <div className="h-8 w-px bg-night-700 hidden sm:block" />

          {/* Quick Share Buttons */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setShowQrModal(true)}
              className="flex items-center gap-2 px-4 py-3 rounded-xl bg-night-800 hover:bg-night-700 text-white text-xs font-bold border border-night-600 transition-all cursor-pointer"
            >
              <QrCode className="w-4 h-4 text-trust-400" />
              MÃ QR
            </button>

            <button
              onClick={handleCopyLink}
              className="flex items-center gap-2 px-4 py-3 rounded-xl bg-night-800 hover:bg-night-700 text-white text-xs font-bold border border-night-600 transition-all cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-righteous-400" />
                  ĐÃ SAO CHÉP
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-slate-400" />
                  SAO CHÉP LINK
                </>
              )}
            </button>
          </div>
        </div>

        {/* Status Counter */}
        <div className="mt-6 flex items-center justify-center gap-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-300">
            <Users className="w-4 h-4 text-trust-400" />
            Tiến độ chuẩn bị:
            <span className="font-mono font-bold text-base text-white px-2 py-0.5 rounded bg-night-900 border border-night-700">
              {connectedCount} / 8 ĐỘI
            </span>
          </div>

          {isReadyToStart ? (
            <span className="text-xs font-bold text-righteous-400 px-3 py-1 rounded-full bg-righteous-950/80 border border-righteous-600/40 animate-badge-pop">
              ✓ Cả 8 đội đã kết nối và sẵn sàng!
            </span>
          ) : (
            <span className="text-xs text-amber-400/90 font-medium">
              ({connectedCount}/8 kết nối • {readyCount}/8 sẵn sàng)
            </span>
          )}
        </div>
      </div>

      {/* 8 Team Slots Grid */}
      <div>
        <div className="flex items-center justify-between mb-4 px-2">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <Shield className="w-4 h-4 text-trust-400" />
            Trạng thái kết nối 8 Đội chơi
          </h2>
          <span className="text-xs text-slate-500 font-mono">
            Mỗi đội đại diện cho một vai trò bí mật
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 8 }, (_, i) => i + 1).map((teamNum) => {
            const team = lobby.teams.find((t) => t.teamNumber === teamNum);
            const isConnected = !!team?.connected;
            const isTeamReady = !!team?.ready;

            return (
              <div
                key={teamNum}
                className={`
                  p-5 rounded-2xl border transition-all duration-300 relative overflow-hidden
                  ${
                    isConnected
                      ? isTeamReady
                        ? "bg-night-900/95 border-righteous-500/50 text-white shadow-lg ring-1 ring-righteous-500/20"
                        : "bg-night-900/90 border-trust-500/40 text-white shadow-lg"
                      : "bg-night-950/40 border-night-800/80 text-slate-600 border-dashed"
                  }
                `}
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
                    Slot {teamNum}
                  </span>
                  <div className="flex items-center gap-1.5">
                    {isConnected ? (
                      isTeamReady ? (
                        <span className="flex items-center gap-1 text-[11px] font-bold text-righteous-400">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                          SẴN SÀNG
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-[11px] font-bold text-amber-400">
                          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                          ONLINE
                        </span>
                      )
                    ) : (
                      <span className="text-[11px] font-medium text-slate-600">
                        CHỜ KẾT NỐI
                      </span>
                    )}
                  </div>
                </div>

                {/* Team Number */}
                <div className="text-2xl font-black text-white font-mono tracking-tight mb-1">
                  ĐỘI {teamNum}
                </div>

                {/* Display Name or Status */}
                <div className="text-xs text-slate-400 truncate">
                  {team?.displayName || (isConnected ? (isTeamReady ? "Đã sẵn sàng thi đấu" : "Đang chờ bấm sẵn sàng") : "Chưa có thiết bị kết nối")}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Host Controls */}
      <div className="glass-panel rounded-2xl p-6 border border-night-700 space-y-4">
        {errorMessage && (
          <div className="p-3 rounded-xl bg-corruption-950/80 border border-corruption-600/50 flex items-center gap-2 text-corruption-300 text-xs sm:text-sm">
            <AlertCircle className="w-4 h-4 shrink-0 text-corruption-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-400">
            <span className="font-bold text-slate-300">Quy tắc bắt đầu:</span> Yêu cầu đủ 8 đội kết nối và bấm sẵn sàng trên điện thoại.
            {!isReadyToStart && (
              <span className="text-amber-400 block sm:inline sm:ml-2">
                (Thiếu {8 - connectedCount} đội kết nối, {8 - readyCount} đội sẵn sàng)
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            {onSimulateFullLobby && !isReadyToStart && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onSimulateFullLobby(1)}
                  className="px-3 py-2 rounded-xl bg-night-800 hover:bg-night-700 text-trust-300 text-xs font-bold border border-trust-600/40 transition-all cursor-pointer"
                  title="Giả lập các đội 2-8 và chừa Đội 1 cho bạn tham gia"
                >
                  ⚡ Giả lập 7 đội (chừa Đội 1)
                </button>
                <button
                  type="button"
                  onClick={() => onSimulateFullLobby()}
                  className="px-2.5 py-2 rounded-xl bg-night-900 hover:bg-night-800 text-slate-400 hover:text-slate-200 text-xs font-medium border border-night-700 transition-all cursor-pointer"
                  title="Giả lập toàn bộ 8 đội để bắt đầu ván ngay"
                >
                  Đủ 8 đội
                </button>
              </div>
            )}

            {onDestroyRoom && (
              <GameButton
                variant="outline"
                size="md"
                onClick={onDestroyRoom}
                icon={<LogOut className="w-4 h-4 text-corruption-400" />}
              >
                Đóng phòng & Tạo mới
              </GameButton>
            )}

            {onResetRoom && (
              <GameButton
                variant="outline"
                size="md"
                onClick={onResetRoom}
                icon={<RefreshCw className="w-4 h-4" />}
              >
                Làm mới phòng
              </GameButton>
            )}

            <GameButton
              variant="primary"
              size="lg"
              onClick={onStartGame}
              disabled={!isReadyToStart || loading}
              loading={loading}
              icon={<Play className="w-5 h-5 fill-night-950" />}
            >
              BẮT ĐẦU TRÒ CHƠI
            </GameButton>
          </div>
        </div>
      </div>

      {/* QR Code Modal (SVG-based fallback or full modal) */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
          <div className="glass-panel-elevated rounded-3xl p-8 max-w-sm w-full border border-trust-500/40 text-center space-y-4">
            <h3 className="text-xl font-bold text-white">Quét mã để tham gia</h3>
            <p className="text-xs text-slate-400">
              Mở camera điện thoại hoặc Zalo để quét mã vào phòng nhanh
            </p>

            {/* Generated QR Placeholder / Code Box */}
            <div className="p-6 bg-white rounded-2xl mx-auto w-56 h-56 flex flex-col items-center justify-center border-4 border-trust-500">
              <QrCode className="w-36 h-36 text-slate-900" />
              <span className="text-xs font-mono font-bold text-slate-900 mt-2">
                {lobby.roomCode}
              </span>
            </div>

            <div className="text-xs font-mono text-slate-300 break-all px-2 py-1 bg-night-900 rounded border border-night-700">
              {joinUrl}
            </div>

            <GameButton
              variant="outline"
              size="md"
              fullWidth
              onClick={() => setShowQrModal(false)}
            >
              Đóng
            </GameButton>
          </div>
        </div>
      )}
    </div>
  );
};

