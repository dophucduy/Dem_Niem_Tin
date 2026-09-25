import React from "react";
import { useNavigate } from "react-router-dom";
import { usePlayerGame } from "../../context/PlayerContext";
import { TrustMeter } from "../../components/common/TrustMeter";
import {
  PrivateResultView,
  selectRoundResult,
  PrivateResultEmptyVariant,
} from "../../components/player/PrivateResultView";
import { Sun, FileText, Sparkles, Info, Clock, Lock } from "lucide-react";

export function PlayerDayResultPage() {
  const navigate = useNavigate();
  const { publicState, session, activeRole, privateState } = usePlayerGame();

  const round = publicState?.round || 1;
  const trust = publicState?.trust ?? 100;
  const publicClues = publicState?.publicClues || [];
  const myTeam = session?.teamNumber ?? 0;

  // Phase guard: exact gamePhase only, so a stale render never bounces the
  // player away from the morning recap.
  React.useEffect(() => {
    if (!publicState) return;
    if (publicState.gamePhase === "NIGHT_KNOWLEDGE") {
      navigate("/player/night/question", { replace: true });
    } else if (publicState.gamePhase === "NIGHT_ABILITY") {
      navigate(
        privateState?.abilityUnlocked === false ? "/player/night/observe" : "/player/night/ability",
        { replace: true }
      );
    } else if (publicState.gamePhase === "NIGHT_RESOLUTION") {
      navigate("/player/night/private-result", { replace: true });
    }
  }, [publicState?.gamePhase, privateState?.abilityUnlocked, navigate]);

  // Private result of the current round, shown next to the public clues so the
  // day discussion can link both sources of information.
  const myResult = selectRoundResult(privateState?.privateResults, round);
  const eliminated = publicState?.teams?.find((t) => t.teamNumber === myTeam)?.eliminated ?? false;
  const emptyVariant: PrivateResultEmptyVariant = !privateState
    ? "WAITING"
    : eliminated
    ? "ELIMINATED"
    : privateState.effectiveState === "CITIZEN"
    ? "CITIZEN"
    : "NO_ACTION";

  return (
    <div className="w-full max-w-md mx-auto space-y-4 animate-fade-in">
      {/* Top Banner: Dawn Announcement */}
      <div className="glass-panel rounded-2xl p-4 border border-amber-500/40 flex items-center justify-between gap-3 shadow-glow">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300">
            <Sun className="w-6 h-6 animate-pulse-subtle" />
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-widest text-amber-300 font-bold">
              Bình minh lên • Phiên ban ngày
            </div>
            <div className="text-base font-black text-white">
              BÁO CÁO NGÀY 0{round}
            </div>
          </div>
        </div>

        <span className="text-[11px] font-mono font-bold px-2 py-1 rounded-lg bg-night-900 border border-night-700 text-trust-400">
          ĐỘI {myTeam}
        </span>
      </div>

      {/* Trust Meter Status */}
      <div className="glass-panel-elevated rounded-2xl p-4 sm:p-5 border border-night-700 space-y-2.5">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-slate-300 uppercase tracking-wider">
            Niềm tin nhân dân hiện tại
          </span>
          <span className="font-mono text-xs text-trust-400 font-bold">
            Mục tiêu: &ge; 50%
          </span>
        </div>
        <TrustMeter trust={trust} variant="broadcast" />
        <p className="text-[11px] text-slate-400 text-center pt-1 leading-relaxed">
          {trust >= 80
            ? "Lòng tin của nhân dân đang được giữ vững. Hãy tiếp tục phát huy tinh thần minh bạch!"
            : trust >= 50
            ? "Có dấu hiệu suy giảm niềm tin do các hành vi tiêu cực. Cần khẩn trương tìm ra kẻ vụ lợi!"
            : "⚠️ BÁO ĐỘNG ĐỎ: Niềm tin đang chạm ngưỡng khủng hoảng. Phiên thảo luận này mang tính quyết định!"}
        </p>
      </div>

      {/* Private Result of the Night: links secret findings to public clues */}
      <div className="glass-panel-elevated rounded-2xl p-4 sm:p-5 border border-night-700 space-y-3">
        <div className="flex items-center justify-between border-b border-night-700/80 pb-2.5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
            <Lock className="w-4 h-4 text-amber-400" />
            Kết quả mật — Đêm 0{round}
          </h3>
          <span className="text-[10px] text-slate-500 font-mono">Chỉ đội bạn được xem</span>
        </div>

        <PrivateResultView
          role={privateState?.role ?? activeRole}
          myTeamNumber={myTeam}
          roundNumber={round}
          result={myResult}
          emptyVariant={emptyVariant}
          compact
        />
      </div>

      {/* Public Clues Dossier */}
      <div className="glass-panel-elevated rounded-2xl p-5 border border-night-700 space-y-3">
        <div className="flex items-center justify-between border-b border-night-700/80 pb-2.5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-trust-300 flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-trust-400" />
            Hồ sơ manh mối công khai ({publicClues.length})
          </h3>
          <span className="text-[10px] text-slate-500 font-mono">Toàn lớp được xem</span>
        </div>

        {publicClues.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-3 leading-relaxed">
            Chưa có manh mối công khai nào được giải mã trong đêm nay.
          </p>
        ) : (
          <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
            {publicClues.map((clue, idx) => (
              <div
                key={clue.id || idx}
                className="p-3.5 rounded-xl bg-night-950/80 border border-night-700 text-left space-y-1.5 transition-all hover:border-trust-500/40"
              >
                <div className="flex items-center justify-between text-xs font-bold text-white">
                  <span className="flex items-center gap-1.5 text-trust-300">
                    <Sparkles className="w-3.5 h-3.5 text-trust-400" />
                    {clue.title}
                  </span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-night-800 text-slate-400 border border-night-700">
                    Tài liệu #{idx + 1}
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {clue.description}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Strategic Preparation Advice */}
      <div className="p-3.5 rounded-xl bg-indigo-950/40 border border-indigo-500/30 flex items-start gap-2.5 text-xs text-slate-300">
        <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
        <p className="leading-relaxed text-[11px]">
          Hãy liên kết <strong className="text-trust-300">kết quả mật riêng của đội bạn</strong> với các <strong className="text-white">manh mối công khai</strong> trên để chuẩn bị phát biểu và chất vấn trong phiên thảo luận!
        </p>
      </div>

      {/* Waiting Status: the discussion phase advances server-side */}
      <div className="p-3.5 rounded-xl bg-night-950/80 border border-indigo-500/30 flex items-start gap-2.5 text-xs text-slate-300">
        <Clock className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5 animate-spin" />
        <p className="leading-relaxed text-[11px]">
          Đội bạn đã nắm đủ thông tin. <strong className="text-white">Giảng viên</strong> sẽ mở phiên thảo luận trên màn chiếu khi cả lớp sẵn sàng — hãy tiếp tục chuẩn bị lập luận!
        </p>
      </div>
    </div>
  );
}
