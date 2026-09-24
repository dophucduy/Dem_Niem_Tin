import React, { useState } from "react";
import { Role, Clue, PrivateResult } from "@dem-niem-tin/shared";
import { ROLE_DEFINITIONS } from "../../data/roleDefinitions";
import { PhaseTimer } from "../common/PhaseTimer";
import { GameButton } from "../common/GameButton";
import { 
  MessageSquare, 
  FileText, 
  HelpCircle, 
  ShieldCheck, 
  Flame, 
  AlertTriangle, 
  CheckCircle2, 
  Sparkles, 
  ChevronRight, 
  Copy, 
  Mic, 
  Volume2,
  Lock,
  Layers
} from "lucide-react";

interface DiscussionViewProps {
  round: number;
  myTeamNumber: number;
  role?: Role;
  effectiveState?: "SPECIAL" | "CITIZEN";
  phaseEndsAt?: number;
  paused?: boolean;
  publicClues: Clue[];
  privateResults: PrivateResult[];
  onReadyToVote?: () => void;
  isReady?: boolean;
}

export const DiscussionView: React.FC<DiscussionViewProps> = ({
  round,
  myTeamNumber,
  role,
  effectiveState = "SPECIAL",
  phaseEndsAt,
  paused = false,
  publicClues,
  privateResults,
  onReadyToVote,
  isReady = false,
}) => {
  const [activeTab, setActiveTab] = useState<"tactics" | "clues" | "questions">("tactics");
  const [copiedQuestion, setCopiedQuestion] = useState<string | null>(null);

  const roleInfo = role ? ROLE_DEFINITIONS[role] : null;
  const isCorruptor = role === "CORRUPTOR";
  const isCitizen = effectiveState === "CITIZEN";

  // Latest private finding from night
  const latestFinding = privateResults.length > 0 ? privateResults[privateResults.length - 1] : null;

  // Question prompts for cross-examination
  const questionTemplates = [
    {
      id: "q1",
      title: "Chất vấn Kê khai Tài sản",
      text: "Đội bạn hãy giải thích rõ nguồn gốc thu nhập và các khoản chi tiêu có dấu hiệu bất thường trong tài liệu công khai?",
      tag: "Minh bạch tài sản",
    },
    {
      id: "q2",
      title: "Chất vấn Quy trình & Thẩm quyền",
      text: "Hành động của đội bạn đêm qua có tuân thủ đúng quy định công vụ, hay có sự lạm quyền vì mục đích riêng?",
      tag: "Đúng thẩm quyền",
    },
    {
      id: "q3",
      title: "Chất vấn Xung đột Lợi ích",
      text: "Có hay không mối liên hệ hoặc thỏa thuận ngầm giữa đội bạn với quyết định làm suy giảm niềm tin nhân dân?",
      tag: "Phòng ngừa lợi ích nhóm",
    },
    {
      id: "q4",
      title: "Yêu cầu Đối chất Bằng chứng",
      text: "Đội bạn đưa ra bằng chứng xác thực nào để chứng minh sự trong sạch trước toàn thể lớp học?",
      tag: "Trọng chứng hơn trọng cung",
    },
  ];

  const handleCopyQuestion = (text: string) => {
    navigator.clipboard?.writeText?.(text);
    setCopiedQuestion(text);
    setTimeout(() => setCopiedQuestion(null), 2500);
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-4 animate-fade-in pb-4">
      {/* Top Header: Phase & Countdown Timer */}
      <div className="glass-panel rounded-2xl p-4 border border-night-700 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
            <span className="text-[10px] font-mono font-bold tracking-widest uppercase text-amber-400">
              NGÀY 0{round} &bull; TRANH LUẬN TRỰC TIẾP
            </span>
          </div>
          <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-lg bg-night-950 border border-night-700 text-trust-300">
            ĐỘI {myTeamNumber}
          </span>
        </div>

        <div className="flex items-center justify-between gap-3 pt-1">
          <div>
            <h2 className="text-lg font-black text-white flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-amber-400" />
              PHIÊN ĐỐI CHẤT
            </h2>
            <p className="text-[11px] text-slate-400">
              90 giây tranh luận trước toàn lớp
            </p>
          </div>

          <PhaseTimer phaseEndsAt={phaseEndsAt} paused={paused} size="md" />
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-night-950/80 border border-night-800 text-xs font-bold">
        <button
          onClick={() => setActiveTab("tactics")}
          className={`py-2 px-2 rounded-lg transition-all text-center flex items-center justify-center gap-1 ${
            activeTab === "tactics"
              ? "bg-night-800 text-trust-300 border border-night-600 shadow-sm"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          Hồ sơ bí mật
        </button>
        <button
          onClick={() => setActiveTab("clues")}
          className={`py-2 px-2 rounded-lg transition-all text-center flex items-center justify-center gap-1 ${
            activeTab === "clues"
              ? "bg-night-800 text-amber-300 border border-night-600 shadow-sm"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          Manh mối ({publicClues.length})
        </button>
        <button
          onClick={() => setActiveTab("questions")}
          className={`py-2 px-2 rounded-lg transition-all text-center flex items-center justify-center gap-1 ${
            activeTab === "questions"
              ? "bg-night-800 text-justice-300 border border-night-600 shadow-sm"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <HelpCircle className="w-3.5 h-3.5" />
          Câu chất vấn
        </button>
      </div>

      {/* TAB 1: TACTICS & SECRET DOSSIER */}
      {activeTab === "tactics" && (
        <div className="space-y-3 animate-fade-in">
          {/* Secret Role Card Reminder */}
          <div className="glass-panel-elevated rounded-2xl p-4 border border-night-700 space-y-3">
            <div className="flex items-center justify-between border-b border-night-700/80 pb-2.5">
              <span className="text-[10px] uppercase tracking-wider font-mono font-bold text-slate-400 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-trust-400" />
                VAI TRÒ BÍ MẬT CỦA BẠN
              </span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  isCorruptor
                    ? "bg-corruption-950/80 text-corruption-400 border-corruption-600"
                    : "bg-righteous-950/80 text-righteous-400 border-righteous-600"
                }`}
              >
                {isCorruptor ? "PHE VỤ LỢI" : "PHE BẢO VỆ NIỀM TIN"}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="text-base font-black text-white">
                  {roleInfo?.name || "CÔNG DÂN TỰ DO"}
                </div>
                <div className="text-xs text-slate-400">
                  {roleInfo?.subtitle || "Đại diện tiếng nói cử tri"}
                </div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-night-900 border border-night-700 flex items-center justify-center">
                {isCorruptor ? (
                  <Flame className="w-5 h-5 text-corruption-400" />
                ) : (
                  <ShieldCheck className="w-5 h-5 text-righteous-400" />
                )}
              </div>
            </div>

            {/* Night Finding Summary (if any) */}
            {latestFinding && (
              <div className="p-3 rounded-xl bg-night-950/90 border border-night-700 text-xs space-y-1">
                <div className="text-[10px] uppercase font-mono font-bold text-trust-400 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  Kết quả điều tra đêm qua:
                </div>
                <div className="text-slate-200 font-medium leading-relaxed">
                  {latestFinding.message}
                </div>
              </div>
            )}
          </div>

          {/* Role-tailored Debate Tactics */}
          <div className="glass-panel rounded-2xl p-4 border border-night-700 space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-trust-300 flex items-center gap-1.5">
              <Mic className="w-4 h-4 text-trust-400" />
              Chiến thuật tranh luận đề xuất:
            </h4>

            <div className="space-y-2 text-xs text-slate-300 leading-relaxed">
              {isCorruptor ? (
                <>
                  <p className="p-2.5 rounded-lg bg-corruption-950/40 border border-corruption-900/50">
                    <strong className="text-corruption-300">Đánh lạc hướng:</strong> Chủ động phân tích các sơ hở trong hồ sơ công khai để hướng sự nghi ngờ sang các đội khác.
                  </p>
                  <p className="p-2.5 rounded-lg bg-night-950/60 border border-night-800">
                    <strong className="text-white">Giả lập công dân:</strong> Tỏ ra ủng hộ nhiệt tình các biện pháp minh bạch, nhưng kín đáo làm phân tán số phiếu tín nhiệm.
                  </p>
                </>
              ) : isCitizen ? (
                <>
                  <p className="p-2.5 rounded-lg bg-indigo-950/40 border border-indigo-900/50">
                    <strong className="text-indigo-300">Đòi hỏi minh bạch:</strong> Chất vấn các đội có dấu hiệu bất minh trong kê khai hoặc trả lời vòng vo.
                  </p>
                  <p className="p-2.5 rounded-lg bg-night-950/60 border border-night-800">
                    <strong className="text-white">Lắng nghe lập luận:</strong> Quan sát thái độ và tính logic khi các đội phản bác để đưa ra quyết định bỏ phiếu đúng đắn.
                  </p>
                </>
              ) : (
                <>
                  <p className="p-2.5 rounded-lg bg-righteous-950/40 border border-righteous-900/50">
                    <strong className="text-righteous-300">Dẫn dắt bằng chứng:</strong> Khéo léo đặt câu hỏi xoay quanh thông tin mật mà đội bạn nắm giữ để các đội khác cùng nhận diện.
                  </p>
                  <p className="p-2.5 rounded-lg bg-night-950/60 border border-night-800">
                    <strong className="text-white">Bảo toàn thân phận:</strong> Tránh vội công khai vai trò trừ khi thực sự cần thiết để đảo ngược tình thế.
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PUBLIC CLUES */}
      {activeTab === "clues" && (
        <div className="space-y-3 animate-fade-in">
          <div className="text-[11px] text-slate-400 px-1">
            Toàn bộ các tài liệu, bằng chứng đã được công khai trên màn chiếu:
          </div>

          {publicClues.length === 0 ? (
            <div className="p-6 rounded-2xl bg-night-950/60 border border-night-800 text-center text-xs text-slate-400">
              Chưa có tài liệu công khai mới trong phiên này.
            </div>
          ) : (
            <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
              {publicClues.map((clue, idx) => (
                <div
                  key={clue.id || idx}
                  className="p-3.5 rounded-xl bg-night-950/90 border border-night-700 text-left space-y-1.5"
                >
                  <div className="flex items-center justify-between text-xs font-bold text-white">
                    <span className="flex items-center gap-1.5 text-amber-300">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      {clue.title}
                    </span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-night-800 text-slate-400 border border-night-700 font-mono">
                      #{idx + 1}
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
      )}

      {/* TAB 3: CROSS-EXAMINATION QUESTIONS BANK */}
      {activeTab === "questions" && (
        <div className="space-y-2.5 animate-fade-in">
          <div className="text-[11px] text-slate-400 px-1">
            Gợi ý câu hỏi chất vấn đối với các đội nghi vấn (chạm để sao chép):
          </div>

          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {questionTemplates.map((q) => {
              const isCopied = copiedQuestion === q.text;
              return (
                <div
                  key={q.id}
                  onClick={() => handleCopyQuestion(q.text)}
                  className={`p-3 rounded-xl border text-left space-y-1.5 cursor-pointer transition-all ${
                    isCopied
                      ? "bg-righteous-950/60 border-righteous-500 shadow-glow-righteous"
                      : "bg-night-950/80 border-night-800 hover:border-night-600"
                  }`}
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-white flex items-center gap-1.5">
                      <Volume2 className="w-3.5 h-3.5 text-justice-400" />
                      {q.title}
                    </span>
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-night-900 border border-night-700 text-slate-400">
                      {q.tag}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed font-serif italic">
                    "{q.text}"
                  </p>
                  <div className="flex justify-end pt-1">
                    <span className="text-[10px] text-trust-400 flex items-center gap-1 font-mono">
                      {isCopied ? (
                        <>
                          <CheckCircle2 className="w-3 h-3 text-righteous-400" />
                          Đã sao chép!
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          Chạm để sao chép
                        </>
                      )}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Readiness for Voting Action */}
      <div className="pt-2">
        {isReady ? (
          <div className="p-3.5 rounded-2xl bg-righteous-950/60 border border-righteous-500/60 text-center space-y-1">
            <div className="text-xs font-bold text-righteous-300 flex items-center justify-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-righteous-400 animate-pulse" />
              ĐÃ SẴN SÀNG BỎ PHIẾU
            </div>
            <p className="text-[11px] text-slate-400">
              Vui lòng tập trung lắng nghe giảng viên điều phối và chờ mở hòm phiếu điện tử.
            </p>
          </div>
        ) : (
          <GameButton
            variant="primary"
            size="lg"
            fullWidth
            onClick={onReadyToVote}
            icon={<CheckCircle2 className="w-5 h-5" />}
          >
            SẴN SÀNG BỎ PHIẾU TÍN NHIỆM (P-10)
          </GameButton>
        )}
      </div>
    </div>
  );
};

