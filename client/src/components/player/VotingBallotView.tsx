import React, { useState } from "react";
import { PublicTeam } from "@dem-niem-tin/shared";
import { PhaseTimer } from "../common/PhaseTimer";
import { GameButton } from "../common/GameButton";
import { 
  Vote, 
  ShieldAlert, 
  CheckCircle2, 
  Lock, 
  AlertTriangle, 
  FileCheck2, 
  Users, 
  ChevronRight, 
  HelpCircle,
  Clock,
  Sparkles
} from "lucide-react";

interface VotingBallotViewProps {
  round: number;
  myTeamNumber: number;
  teams: PublicTeam[];
  phaseEndsAt?: number;
  paused?: boolean;
  onSubmitVote: (targetTeamNumber: number, reason?: string) => void;
  loading?: boolean;
  isSubmitted?: boolean;
  votedTargetTeamNumber?: number;
}

export const VotingBallotView: React.FC<VotingBallotViewProps> = ({
  round,
  myTeamNumber,
  teams,
  phaseEndsAt,
  paused = false,
  onSubmitVote,
  loading = false,
  isSubmitted = false,
  votedTargetTeamNumber,
}) => {
  const [selectedTeamNumber, setSelectedTeamNumber] = useState<number | null>(null);
  const [selectedReason, setSelectedReason] = useState<string>("Bất minh tài sản & lợi ích");
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Available justifications for pedagogic focus
  const reasons = [
    "Bất minh tài sản & lợi ích",
    "Lập luận mâu thuẫn trong tranh luận",
    "Trùng khớp manh mối công khai",
    "Có dấu hiệu can thiệp ngầm ban đêm",
  ];

  const displayTeams = teams;

  const selectedTeam = displayTeams.find(t => t.teamNumber === selectedTeamNumber);
  const votedTeam = displayTeams.find(t => t.teamNumber === votedTargetTeamNumber);

  // If already submitted, render the secure ballot receipt screen
  if (isSubmitted) {
    return (
      <div className="w-full max-w-md mx-auto space-y-5 animate-badge-pop text-center">
        {/* Security Stamp Badge */}
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-righteous-950 border border-righteous-500/50 text-righteous-300 text-xs font-mono font-bold tracking-widest uppercase shadow-glow-righteous">
          <FileCheck2 className="w-3.5 h-3.5" />
          LÁ PHIẾU ĐÃ NIÊM PHONG HỢP LỆ
        </div>

        {/* Ballot Receipt Card */}
        <div className="glass-panel-elevated rounded-3xl p-6 sm:p-7 border border-righteous-500/40 relative overflow-hidden shadow-2xl space-y-5">
          {/* Watermark */}
          <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none select-none font-mono font-black text-6xl rotate-[-20deg]">
            BỎ PHIẾU
          </div>

          <div className="w-16 h-16 rounded-2xl bg-righteous-500/20 border-2 border-righteous-400 mx-auto flex items-center justify-center text-righteous-300 shadow-glow-righteous">
            <CheckCircle2 className="w-9 h-9" />
          </div>

          <div className="space-y-1">
            <div className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-bold">
              Biên nhận Hòm phiếu Điện tử &bull; Vòng 0{round}
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              ĐÃ NỘP PHIẾU THÀNH CÔNG!
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed max-w-xs mx-auto pt-1">
              Lá phiếu của <strong className="text-trust-300">Đội {myTeamNumber}</strong> đã được mã hóa bảo mật và chuyển thẳng vào hòm phiếu trung tâm.
            </p>
          </div>

          {/* Voted Target Summary (Secret on phone) */}
          {votedTeam && (
            <div className="p-4 rounded-2xl bg-night-950/90 border border-night-700 space-y-2 text-left">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 font-medium">Đối tượng bất tín nhiệm:</span>
                <span className="font-mono font-black text-corruption-400">
                  ĐỘI {votedTeam.teamNumber} &bull; {votedTeam.displayName}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs pt-1 border-t border-night-800">
                <span className="text-slate-400 font-medium">Mã bảo mật phiếu:</span>
                <span className="font-mono text-[10px] text-slate-400">
                  #VT-0{round}-T0{myTeamNumber}-{Date.now().toString().slice(-4)}
                </span>
              </div>
            </div>
          )}

          {/* Waiting for classroom notice */}
          <div className="p-4 rounded-2xl bg-night-900/80 border border-night-700 text-xs text-slate-300 space-y-1 text-left">
            <div className="font-bold text-amber-300 flex items-center gap-1.5 uppercase text-[11px] tracking-wider">
              <Clock className="w-3.5 h-3.5" />
              Chờ kiểm phiếu toàn lớp:
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Hãy chú ý quan sát màn chiếu của Giảng viên. Kết quả kiểm phiếu công khai và biến động điểm Niềm tin nhân dân sẽ hiển thị ngay sau khi hòm phiếu đóng!
            </p>
          </div>

          <div className="text-[11px] text-slate-500 flex items-center justify-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-trust-500/70" />
            Lá phiếu được bảo mật tuyệt đối, không công khai danh tính người bầu
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto space-y-4 animate-fade-in pb-4">
      {/* Top Banner: Phase & Countdown Timer */}
      <div className="glass-panel rounded-2xl p-4 border border-corruption-500/40 space-y-3 shadow-glow-danger">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-corruption-500 animate-ping" />
            <span className="text-[10px] font-mono font-bold tracking-widest uppercase text-corruption-400">
              VÒNG 0{round} &bull; BỎ PHIẾU BẤT TÍN NHIỆM
            </span>
          </div>
          <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-lg bg-night-950 border border-night-700 text-trust-300">
            ĐỘI {myTeamNumber}
          </span>
        </div>

        <div className="flex items-center justify-between gap-3 pt-1">
          <div>
            <h2 className="text-lg font-black text-white flex items-center gap-2">
              <Vote className="w-5 h-5 text-corruption-400" />
              LÁ PHIẾU TÍN NHIỆM
            </h2>
            <p className="text-[11px] text-slate-400">
              45 giây để toàn lớp nộp phiếu
            </p>
          </div>

          <PhaseTimer phaseEndsAt={phaseEndsAt} paused={paused} size="md" />
        </div>
      </div>

      {/* Instruction Guidance */}
      <div className="p-3.5 rounded-xl bg-night-950/80 border border-night-700 text-xs text-slate-300 space-y-1">
        <div className="font-bold text-white flex items-center gap-1.5">
          <ShieldAlert className="w-4 h-4 text-corruption-400" />
          Quy tắc bỏ phiếu tín nhiệm:
        </div>
        <p className="text-[11px] text-slate-400 leading-relaxed">
          Chọn <strong>1 đội</strong> mà đội bạn cho rằng là <span className="text-corruption-400 font-semibold">Người Vụ Lợi</span> hoặc đang làm suy giảm niềm tin nhân dân. Không thể bỏ phiếu cho chính đội mình.
        </p>
      </div>

      {/* Candidate Grid */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs px-1">
          <span className="font-bold text-slate-300 uppercase tracking-wider">
            Chọn đội bị bỏ phiếu ({displayTeams.filter(t => t.teamNumber !== myTeamNumber && !t.eliminated).length} khả dụng)
          </span>
          <span className="text-[11px] text-slate-500 font-mono">Chạm để chọn</span>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          {displayTeams.map((team) => {
            const isSelf = team.teamNumber === myTeamNumber;
            const isEliminated = team.eliminated;
            const isSelected = selectedTeamNumber === team.teamNumber;
            const isDisabled = isSelf || isEliminated;

            return (
              <button
                key={team.id}
                disabled={isDisabled}
                onClick={() => setSelectedTeamNumber(team.teamNumber)}
                className={`
                  p-3.5 rounded-2xl border text-left transition-all duration-200 flex flex-col justify-between min-h-[90px] relative overflow-hidden
                  ${
                    isDisabled
                      ? "opacity-40 bg-night-950/50 border-night-800 cursor-not-allowed"
                      : isSelected
                      ? "bg-corruption-950/80 border-corruption-500 shadow-glow-danger scale-[1.02]"
                      : "bg-night-900/80 border-night-700 hover:border-slate-500 hover:bg-night-800/80"
                  }
                `}
              >
                <div className="flex items-center justify-between w-full">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center font-mono font-black text-xs ${
                      isSelected
                        ? "bg-corruption-500 text-white"
                        : "bg-night-800 text-slate-300 border border-night-700"
                    }`}
                  >
                    0{team.teamNumber}
                  </div>

                  {isSelf ? (
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-night-800 text-trust-300 border border-night-700">
                      Đội bạn
                    </span>
                  ) : isEliminated ? (
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-night-800 text-slate-500 border border-night-700">
                      Đã loại
                    </span>
                  ) : isSelected ? (
                    <span className="w-2.5 h-2.5 rounded-full bg-corruption-400 animate-ping" />
                  ) : null}
                </div>

                <div className="pt-2">
                  <div className="text-sm font-bold text-white truncate">
                    {team.displayName}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {isSelf ? "Không thể chọn" : isEliminated ? "Đã rời cuộc chơi" : isSelected ? "Đã chọn" : "Nhấn để chọn"}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Justification Selector */}
      {selectedTeam && (
        <div className="glass-panel rounded-2xl p-4 border border-night-700 space-y-2.5 animate-scale-in">
          <div className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-trust-400" />
            Lý do bỏ phiếu bất tín nhiệm:
          </div>

          <div className="grid grid-cols-1 gap-1.5">
            {reasons.map((reason) => (
              <button
                key={reason}
                onClick={() => setSelectedReason(reason)}
                className={`py-2 px-3 rounded-xl text-left text-xs transition-all border ${
                  selectedReason === reason
                    ? "bg-night-800 text-trust-300 border-trust-500/60 font-semibold"
                    : "bg-night-950/60 text-slate-400 border-night-800 hover:text-white"
                }`}
              >
                &bull; {reason}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Submit Action Button */}
      <div className="pt-2">
        <GameButton
          variant="danger"
          size="lg"
          fullWidth
          disabled={!selectedTeamNumber}
          onClick={() => setShowConfirmModal(true)}
          icon={<Vote className="w-5 h-5" />}
        >
          {selectedTeamNumber
            ? `BỎ PHIẾU BẤT TÍN NHIỆM CHO ĐỘI ${selectedTeamNumber}`
            : "CHỌN 1 ĐỘI ĐỂ BỎ PHIẾU"}
        </GameButton>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && selectedTeam && (
        <div className="fixed inset-0 z-50 bg-night-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="glass-panel-elevated rounded-3xl p-6 max-w-sm w-full border border-corruption-500/60 space-y-4 shadow-2xl animate-scale-in">
            <div className="w-14 h-14 rounded-2xl bg-corruption-500/20 border-2 border-corruption-500 mx-auto flex items-center justify-center text-corruption-400 shadow-glow-danger">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <div className="text-center space-y-1">
              <div className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-bold">
                Xác nhận lá phiếu tối mật
              </div>
              <h3 className="text-lg font-black text-white">
                BỎ PHIẾU CHO ĐỘI 0{selectedTeam.teamNumber}?
              </h3>
              <p className="text-xs text-slate-300">
                Đội bị bỏ phiếu: <strong className="text-white">{selectedTeam.displayName}</strong>
              </p>
              <p className="text-[11px] text-trust-400 italic pt-1">
                Lý do: "{selectedReason}"
              </p>
            </div>

            <div className="p-3 rounded-xl bg-night-950/80 border border-corruption-900/80 text-[11px] text-slate-300 leading-relaxed text-center">
              ⚠️ <strong>Lưu ý:</strong> Sau khi nộp, lá phiếu sẽ được niêm phong vĩnh viễn và không thể thu hồi hay thay đổi.
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <GameButton
                variant="outline"
                size="md"
                onClick={() => setShowConfirmModal(false)}
                disabled={loading}
              >
                HỦY BỎ
              </GameButton>

              <GameButton
                variant="danger"
                size="md"
                onClick={() => {
                  setShowConfirmModal(false);
                  onSubmitVote(selectedTeam.teamNumber, selectedReason);
                }}
                loading={loading}
              >
                XÁC NHẬN NỘP
              </GameButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

