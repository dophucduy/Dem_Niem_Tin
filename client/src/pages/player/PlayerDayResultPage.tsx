import React from "react";
import { useNavigate } from "react-router-dom";
import { usePlayerGame } from "../../context/PlayerContext";
import { TrustMeter } from "../../components/common/TrustMeter";
import { GameButton } from "../../components/common/GameButton";
import { 
  Sun, 
  FileText, 
  AlertTriangle, 
  ShieldCheck, 
  Users, 
  ArrowRight, 
  MessageSquare,
  Sparkles,
  Info
} from "lucide-react";

export function PlayerDayResultPage() {
  const navigate = useNavigate();
  const { publicState, session, activeRole, teams } = usePlayerGame();

  const round = publicState?.round || 1;
  const trust = publicState?.trust ?? 100;
  const publicClues = publicState?.publicClues || [];
  const myTeam = session?.teamNumber || 4;

  // Phase Guard: Must be in DAY phase
  React.useEffect(() => {
    if (session && publicState) {
      if (publicState.phase === "NIGHT") {
        if (publicState.activeQuestion !== undefined) {
          navigate("/player/night/question");
        } else {
          navigate("/player/night/ability");
        }
      } else if (publicState.phase === "LOBBY") {
        navigate("/player/role");
      } else if (publicState.phase === "VOTING") {
        navigate("/player/vote");
      }
    }
  }, [session, publicState?.phase, publicState?.activeQuestion, navigate]);

  // Fallback demo clues if none from server yet
  const displayClues = publicClues.length > 0 ? publicClues : [
    {
      id: "clue-demo-1",
      title: "Bản kê khai tài sản có dấu hiệu chỉnh sửa",
      description: "Một tài liệu nặc danh xuất hiện tại phòng văn thư, chỉ ra có sự chênh lệch lớn giữa thu nhập thực tế và tài sản sở hữu.",
      visibility: "public" as const,
      revealedAt: Date.now(),
    }
  ];

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

      {/* Public Clues Dossier */}
      <div className="glass-panel-elevated rounded-2xl p-5 border border-night-700 space-y-3">
        <div className="flex items-center justify-between border-b border-night-700/80 pb-2.5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-trust-300 flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-trust-400" />
            Hồ sơ manh mối công khai ({displayClues.length})
          </h3>
          <span className="text-[10px] text-slate-500 font-mono">Toàn lớp được xem</span>
        </div>

        <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
          {displayClues.map((clue, idx) => (
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
      </div>

      {/* Strategic Preparation Advice */}
      <div className="p-3.5 rounded-xl bg-indigo-950/40 border border-indigo-500/30 flex items-start gap-2.5 text-xs text-slate-300">
        <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
        <p className="leading-relaxed text-[11px]">
          Phiên thảo luận ban ngày chuẩn bị bắt đầu. Hãy liên kết <strong className="text-trust-300">kết quả mật riêng của đội bạn</strong> với các <strong className="text-white">manh mối công khai</strong> trên để chuẩn bị phát biểu và chất vấn!
        </p>
      </div>

      {/* Proceed to Discussion */}
      <div className="pt-1">
        <GameButton
          variant="primary"
          size="lg"
          fullWidth
          onClick={() => {
            alert("Đội bạn đã sẵn sàng! Giảng viên sẽ mở phiên thảo luận trên màn chiếu.");
            navigate("/player/day/discussion");
          }}
          icon={<MessageSquare className="w-5 h-5" />}
        >
          SẴN SÀNG THẢO LUẬN BAN NGÀY
        </GameButton>
      </div>
    </div>
  );
}

