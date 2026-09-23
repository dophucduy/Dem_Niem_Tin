import React, { useState, useEffect } from "react";
import { Scale, Users, Shield, ArrowRight, AlertCircle, X } from "lucide-react";
import { GameButton } from "../common/GameButton";

interface PlayerJoinViewProps {
  initialRoomCode?: string;
  initialTeamNumber?: number;
  loading?: boolean;
  errorMessage?: string | null;
  onJoin: (roomCode: string, teamNumber: number, displayName?: string) => void;
  occupiedTeams?: number[]; // list of team numbers 1-8 already taken in this room
  currentLobbyRoomCode?: string;
}

export const PlayerJoinView: React.FC<PlayerJoinViewProps> = ({
  initialRoomCode = "",
  initialTeamNumber = 1,
  loading = false,
  errorMessage = null,
  onJoin,
  occupiedTeams = [],
  currentLobbyRoomCode,
}) => {
  const [roomCode, setRoomCode] = useState<string>(initialRoomCode.toUpperCase());
  const [selectedTeam, setSelectedTeam] = useState<number>(initialTeamNumber);
  const [displayName, setDisplayName] = useState<string>("");
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (initialRoomCode) {
      setRoomCode(initialRoomCode.toUpperCase());
    }
  }, [initialRoomCode]);

  const cleanCode = roomCode.trim().toUpperCase();
  // Only mark teams as occupied if user has typed a room code AND it matches the current loaded room
  const isMatchingRoom = Boolean(cleanCode && currentLobbyRoomCode && cleanCode === currentLobbyRoomCode.trim().toUpperCase());
  const effectiveOccupiedTeams = isMatchingRoom ? occupiedTeams : [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    const cleanCode = roomCode.trim().toUpperCase();
    if (!cleanCode) {
      setValidationError("Vui lòng nhập Mã phòng do Giảng viên / Host cung cấp.");
      return;
    }

    if (effectiveOccupiedTeams.includes(selectedTeam)) {
      setValidationError(`Đội ${selectedTeam} đã có người chọn. Vui lòng chọn đội khác.`);
      return;
    }

    onJoin(cleanCode, selectedTeam, displayName.trim() || undefined);
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
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Nhập mã phòng và chọn đội đại diện để tham gia lớp học
        </p>
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
              Mã phòng (Room Code) <span className="text-trust-400">*</span>
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
              maxLength={8}
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

        {/* Team Selection Grid (8 Teams) */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
            Chọn Đội đại diện (1 trong 8 Đội) <span className="text-trust-400">*</span>
          </label>
          <div className="grid grid-cols-4 gap-2">
            {Array.from({ length: 8 }, (_, i) => i + 1).map((teamNum) => {
              const isOccupied = effectiveOccupiedTeams.includes(teamNum);
              const isSelected = selectedTeam === teamNum;

              return (
                <button
                  key={teamNum}
                  type="button"
                  disabled={isOccupied}
                  onClick={() => {
                    setSelectedTeam(teamNum);
                    setValidationError(null);
                  }}
                  className={`
                    relative p-3 rounded-xl border font-bold text-center transition-all duration-200 select-none cursor-pointer
                    ${
                      isSelected
                        ? "bg-gradient-to-b from-trust-500/20 to-trust-600/10 border-trust-400 text-trust-300 shadow-glow scale-[1.03]"
                        : isOccupied
                        ? "bg-night-950/40 border-night-800 text-slate-600 cursor-not-allowed opacity-50"
                        : "bg-night-900/60 border-night-700 text-slate-300 hover:border-slate-500 hover:text-white"
                    }
                  `}
                >
                  <div className="text-[10px] text-slate-400 font-medium uppercase">
                    Đội
                  </div>
                  <div className="text-xl font-black font-mono">
                    {teamNum}
                  </div>
                  {isOccupied && (
                    <div className="text-[9px] text-corruption-400 font-semibold mt-0.5">
                      Đầy
                    </div>
                  )}
                  {isSelected && (
                    <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-trust-500 rounded-full border-2 border-night-900" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Optional Display Name */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
            Tên đại diện đội (tùy chọn)
          </label>
          <input
            type="text"
            maxLength={25}
            placeholder="VD: Nhóm 1 - Ban Thanh Tra"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl bg-night-950/80 border border-night-600 focus:border-trust-400 focus:ring-1 focus:ring-trust-400/20 text-white text-sm placeholder:text-slate-600 outline-none transition-all"
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

        <div className="text-center text-[11px] text-slate-500 flex items-center justify-center gap-1.5 pt-1">
          <Shield className="w-3.5 h-3.5 text-trust-500/60" />
          Phiên chơi bảo mật, tự động khôi phục khi tải lại trang
        </div>
      </form>
    </div>
  );
};

