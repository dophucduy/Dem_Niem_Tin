import React from "react";
import { useHostGame } from "../../context/HostContext";
import { HostLobbyView } from "../../components/host/HostLobbyView";
import { GameButton } from "../../components/common/GameButton";
import { Scale, Plus, AlertCircle } from "lucide-react";

export function HostLobbyPage() {
  const { 
    lobby, 
    hostSession, 
    loading, 
    errorMessage, 
    handleCreateRoom, 
    handleStartGame, 
    handleResetRoom, 
    handleDestroyRoom,
  } = useHostGame();

  const onStart = () => {
    handleStartGame();
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
              Dành cho giảng viên
            </div>
            <h1 className="text-3xl font-black text-white tracking-wide">ĐIỀU KHIỂN PHÒNG HỌC</h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-2">
              Tạo phòng và chờ những người chơi tham gia.
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
            Tối ưu cho màn hình trình chiếu
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
    />
  );
}

