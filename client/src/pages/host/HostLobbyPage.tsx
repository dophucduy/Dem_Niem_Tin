import React from "react";
import { useNavigate } from "react-router-dom";
import { useHostGame } from "../../context/HostContext";
import { HostLobbyView } from "../../components/host/HostLobbyView";
import { GameButton } from "../../components/common/GameButton";
import { Scale, Plus, AlertCircle } from "lucide-react";

export function HostLobbyPage() {
  const navigate = useNavigate();
  const { 
    lobby, 
    hostSession, 
    loading, 
    errorMessage, 
    handleCreateRoom, 
    handleStartGame, 
    handleResetRoom, 
    handleDestroyRoom,
    handleSimulateFullLobby 
  } = useHostGame();

  const onStart = () => {
    handleStartGame();
    navigate("/host/role-reveal");
  };

  if (!hostSession || !lobby) {
    return (
      <div className="w-full max-w-lg mx-auto text-center space-y-6">
        <div className="glass-panel-elevated rounded-3xl p-8 sm:p-10 border border-trust-500/40 space-y-6 shadow-2xl">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br from-trust-500/20 to-night-800 border border-trust-500/40 flex items-center justify-center text-trust-400 shadow-glow">
            <Scale className="w-10 h-10" />
          </div>
          <div>
            <div className="text-xs uppercase tracking-[0.25em] text-trust-400 font-bold mb-1">
              Màn hình Giảng viên / Ban tổ chức
            </div>
            <h1 className="text-3xl font-black text-white tracking-wide">ĐIỀU KHIỂN PHÒNG HỌC</h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-2">
              Tạo phòng học mới để lấy mã phòng và mã QR cho 8 đội sinh viên kết nối.
            </p>
          </div>
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-corruption-950/80 border border-corruption-600/50 flex items-center gap-2 text-corruption-300 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 text-corruption-400" />
              <span>{errorMessage}</span>
            </div>
          )}
          <GameButton
            variant="primary"
            size="xl"
            fullWidth
            loading={loading}
            onClick={handleCreateRoom}
            icon={<Plus className="w-6 h-6 stroke-[3]" />}
          >
            KHỞI TẠO PHÒNG MỚI
          </GameButton>
          <div className="text-xs text-slate-500 font-mono">
            Tối ưu hiển thị cho máy chiếu 1280×720 & 1920×1080
          </div>
        </div>
      </div>
    );
  }

  return (
    <HostLobbyView
      lobby={lobby!}
      onStartGame={onStart}
      onResetRoom={handleResetRoom}
      onDestroyRoom={handleDestroyRoom}
      loading={loading}
      errorMessage={errorMessage}
      onSimulateFullLobby={handleSimulateFullLobby}
    />
  );
}

