import React, { useState, useEffect } from "react";
import { Scale, ArrowRight, AlertCircle, X } from "lucide-react";
import { GameButton } from "../common/GameButton";

interface PlayerJoinViewProps {
  initialRoomCode?: string;
  loading?: boolean;
  errorMessage?: string | null;
  onJoin: (roomCode: string, displayName: string) => void;
}

export const PlayerJoinView: React.FC<PlayerJoinViewProps> = ({
  initialRoomCode = "",
  loading = false,
  errorMessage = null,
  onJoin,
}) => {
  const [roomCode, setRoomCode] = useState<string>(initialRoomCode.toUpperCase());
  const [displayName, setDisplayName] = useState<string>("");
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (initialRoomCode) {
      setRoomCode(initialRoomCode.toUpperCase());
    }
  }, [initialRoomCode]);

  const cleanCode = roomCode.trim().toUpperCase();
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    const cleanCode = roomCode.trim().toUpperCase();
    if (!cleanCode) {
      setValidationError("Vui lòng nhập mã phòng do giảng viên cung cấp.");
      return;
    }

    if (!displayName.trim()) {
      setValidationError("Vui lòng nhập tên người chơi.");
      return;
    }

    onJoin(cleanCode, displayName.trim());
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Brand Header */}
      <div className="text-center mb-6">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-trust-500/20 to-night-800 border border-trust-500/40 flex items-center justify-center text-trust-400 shadow-glow mb-3">
          <Scale className="w-8 h-8" />
        </div>
        <div className="text-xs uppercase tracking-[0.2em] text-trust-400 font-bold mb-1">
          Thiết bị người chơi
        </div>
        <h1 className="text-2xl sm:text-3xl font-black tracking-wide text-white">
          ĐÊM NIỀM TIN
        </h1>
      </div>

      {/* Main Join Card */}
      <form
        onSubmit={handleSubmit}
        className="glass-panel-elevated rounded-2xl p-5 sm:p-6 border border-night-700/80 space-y-5"
      >
        {/* Error Alert */}
        {(errorMessage || validationError) && (
          <div className="p-3.5 rounded-xl bg-corruption-950/80 border border-corruption-600/50 flex items-start gap-2.5 text-corruption-300 text-xs sm:text-sm animate-badge-pop">
            <AlertCircle className="w-4 h-4 text-corruption-400 shrink-0 mt-0.5" />
            <span>{errorMessage || validationError}</span>
          </div>
        )}

        {/* Room Code Input */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
              Mã phòng <span className="text-trust-400">*</span>
            </label>
            {roomCode && (
              <button
                type="button"
                onClick={() => {
                  setRoomCode("");
                  setValidationError(null);
                }}
                className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer transition-colors"
              >
                <X className="w-3 h-3" />
                Xóa mã
              </button>
            )}
          </div>
          <div className="relative">
            <input
              type="text"
          maxLength={6}
              placeholder="VD: NT4821"
              value={roomCode}
              onChange={(e) => {
                setRoomCode(e.target.value.toUpperCase());
                setValidationError(null);
              }}
              className="w-full px-4 py-3.5 rounded-xl bg-night-950/80 border border-night-600 focus:border-trust-400 focus:ring-2 focus:ring-trust-400/20 text-white font-mono text-center text-xl font-bold tracking-widest placeholder:text-slate-600 outline-none transition-all pr-10"
              required
            />
            {roomCode && (
              <button
                type="button"
                onClick={() => {
                  setRoomCode("");
                  setValidationError(null);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-white rounded-lg hover:bg-night-800 transition-colors cursor-pointer"
                title="Xóa mã phòng"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Player Name */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
            Tên người chơi <span className="text-trust-400">*</span>
          </label>
          <input
            type="text"
            maxLength={40}
            placeholder="Nhập tên của bạn"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl bg-night-950/80 border border-night-600 focus:border-trust-400 focus:ring-1 focus:ring-trust-400/20 text-white text-sm placeholder:text-slate-600 outline-none transition-all"
            required
          />
        </div>

        {/* Submit Button */}
        <GameButton
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          loading={loading}
          icon={<ArrowRight className="w-5 h-5" />}
        >
          VÀO PHÒNG CHƠI
        </GameButton>

      </form>
    </div>
  );
};

