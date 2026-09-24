import React from "react";
import { PublicTeam } from "@dem-niem-tin/shared";
import { TrustMeter } from "../common/TrustMeter";
import { GameButton } from "../common/GameButton";
import { 
  Award, 
  RotateCcw, 
  BookOpen, 
  CheckCircle, 
  ShieldCheck, 
  AlertTriangle, 
  Users, 
  LogOut,
  Flag,
  Sparkles
} from "lucide-react";

interface HostFinalStageProps {
  trust: number;
  teams: PublicTeam[];
  onResetRoom: () => void;
  loading?: boolean;
}

export const HostFinalStage: React.FC<HostFinalStageProps> = ({
  trust,
  teams,
  onResetRoom,
  loading = false,
}) => {
  const isVictory = trust >= 50;
  const survivingTeams = teams.filter((t) => !t.eliminated);
  const eliminatedTeams = teams.filter((t) => t.eliminated);

  return (
    <div className="w-full min-h-[92vh] flex flex-col justify-between p-6 lg:p-8 space-y-6 animate-fade-in text-white">
      {/* 1. TOP BAR */}
      <div className="glass-panel-elevated rounded-3xl p-5 lg:p-6 border border-night-700/80 shadow-2xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-glow ${
            isVictory ? "bg-righteous-500/20 border border-righteous-500/50 text-righteous-400" : "bg-amber-500/20 border border-amber-500/50 text-amber-400"
          }`}>
            {isVictory ? <Award className="w-8 h-8" /> : <AlertTriangle className="w-8 h-8" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${isVictory ? "bg-righteous-400" : "bg-amber-400"} animate-ping`} />
              <span className="text-xs font-mono font-bold tracking-widest uppercase text-slate-300">
                CHUYÊN ĐỀ HOÀN TẤT &bull; TỔNG KẾT CHUNG CUỘC (H-08)
              </span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-black text-white tracking-wide">
              {isVictory ? "BẢO VỆ THÀNH CÔNG NIỀM TIN CÔNG CHÚNG" : "CẢNH BÁO NGUY CƠ SUY GIẢM NIỀM TIN"}
            </h1>
          </div>
        </div>

        {/* Final Trust Score Display */}
        <div className="w-full sm:w-72 lg:w-80">
          <div className="flex justify-between items-center text-xs mb-1.5 font-bold">
            <span className="text-slate-300 uppercase tracking-wider">Chỉ Số Niềm Tin Chung Cuộc</span>
            <span className={`font-mono text-base ${isVictory ? "text-righteous-400" : "text-amber-400"}`}>
              {trust}/100
            </span>
          </div>
          <TrustMeter trust={trust} variant="compact" />
        </div>
      </div>

      {/* 2. MAIN CENTER ARENA */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1">
        {/* Left Column: Overall Game Review & Pedagogical Takeaways (7 cols) */}
        <div className="lg:col-span-7 flex flex-col space-y-4">
          <div className="glass-panel-elevated rounded-3xl p-6 lg:p-8 border border-night-700/80 flex-1 flex flex-col justify-between space-y-6 bg-gradient-to-b from-night-900/90 to-night-950/95">
            {/* Outcome Overview Banner */}
            <div className={`p-5 rounded-2xl border ${
              isVictory 
                ? "bg-righteous-950/60 border-righteous-500/40 text-righteous-300"
                : "bg-amber-950/60 border-amber-500/40 text-amber-300"
            }`}>
              <div className="flex items-center gap-3">
                {isVictory ? <ShieldCheck className="w-6 h-6 text-righteous-400 shrink-0" /> : <AlertTriangle className="w-6 h-6 text-amber-400 shrink-0" />}
                <div>
                  <h3 className="text-base font-black text-white">
                    {isVictory ? "Tập thể hoàn thành xuất sắc mục tiêu liêm chính" : "Bài học sâu sắc về nhận diện nguy cơ suy thoái"}
                  </h3>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    {isVictory
                      ? `Tập thể đã giữ vững mức độ tin cậy ${trust}% sau 3 vòng đấu tranh và phản biện dân chủ, triệt tiêu ảnh hưởng tiêu cực của các biểu hiện thoái hóa.`
                      : `Mức độ tin cậy kết thúc ở mức ${trust}%, phản ánh những khó khăn trong công tác kiểm soát nội bộ và tự phê bình.`}
                  </p>
                </div>
              </div>
            </div>

            {/* Pedagogical Insights */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-wider">
                <BookOpen className="w-4 h-4 text-trust-400" />
                BÀI HỌC TỔNG KẾT VỀ TƯ TƯỞNG HỒ CHÍ MINH
              </div>

              <div className="grid grid-cols-1 gap-2.5 text-xs text-slate-300">
                <div className="p-3.5 rounded-2xl bg-night-950/80 border border-night-700/80 flex items-start gap-3">
                  <div className="w-6 h-6 rounded-lg bg-righteous-500/20 text-righteous-400 flex items-center justify-center shrink-0 mt-0.5">
                    1
                  </div>
                  <div>
                    <div className="font-bold text-white">Thực hành Dân chủ &amp; Kỷ luật nghiêm minh</div>
                    <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                      Dân chủ là chìa khóa vạn năng. Bỏ phiếu bất tín nhiệm và thảo luận công khai giúp sàng lọc cán bộ, loại trừ mầm mống suy thoái đạo đức cách mạng.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-night-950/80 border border-night-700/80 flex items-start gap-3">
                  <div className="w-6 h-6 rounded-lg bg-righteous-500/20 text-righteous-400 flex items-center justify-center shrink-0 mt-0.5">
                    2
                  </div>
                  <div>
                    <div className="font-bold text-white">Xây dựng Niềm Tin là gốc rễ của sự lãnh đạo</div>
                    <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                      "Muốn người ta tin mình thì mình phải thành thực với người ta." Mỗi quyết sách phải đặt lợi ích của nhân dân và tập thể lên trên hết.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-night-950/80 border border-night-700/80 flex items-start gap-3">
                  <div className="w-6 h-6 rounded-lg bg-righteous-500/20 text-righteous-400 flex items-center justify-center shrink-0 mt-0.5">
                    3
                  </div>
                  <div>
                    <div className="font-bold text-white">Chống chủ nghĩa cá nhân - giặc nội xâm nguy hiểm</div>
                    <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                      Luôn đề cao tinh thần tự soi, tự sửa; cảnh giác với các biểu hiện chạy theo lợi ích nhóm, vi phạm nguyên tắc công khai, minh bạch.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-3 gap-3 pt-2 text-center">
              <div className="p-3 rounded-2xl bg-night-950/90 border border-night-700">
                <div className="text-[10px] font-mono uppercase text-slate-400">Tổng số đội</div>
                <div className="text-xl font-black text-white font-mono mt-1">{teams.length}</div>
              </div>
              <div className="p-3 rounded-2xl bg-night-950/90 border border-night-700">
                <div className="text-[10px] font-mono uppercase text-righteous-400">Trụ vững</div>
                <div className="text-xl font-black text-righteous-400 font-mono mt-1">{survivingTeams.length}</div>
              </div>
              <div className="p-3 rounded-2xl bg-night-950/90 border border-night-700">
                <div className="text-[10px] font-mono uppercase text-corruption-400">Bị loại</div>
                <div className="text-xl font-black text-corruption-400 font-mono mt-1">{eliminatedTeams.length}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: 8-Team Final Status Grid (5 cols) */}
        <div className="lg:col-span-5 flex flex-col space-y-3">
          <div className="flex items-center justify-between px-1">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Users className="w-4 h-4 text-trust-400" />
              DANH SÁCH 8 ĐỘI THAM GIA
            </div>
            <span className="text-[11px] font-mono text-slate-500">
              Tổng kết 3 vòng
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 flex-1">
            {teams.map((team) => {
              const isEliminated = team.eliminated;
              return (
                <div
                  key={team.id}
                  className={`p-3.5 rounded-2xl border transition-all flex flex-col justify-between ${
                    isEliminated
                      ? "opacity-50 bg-night-950/50 border-night-800"
                      : "bg-night-900/80 border-night-700/90 shadow-sm"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="w-7 h-7 rounded-xl font-mono font-black text-xs flex items-center justify-center bg-night-950 border border-night-700 text-white">
                      0{team.teamNumber}
                    </div>

                    {isEliminated ? (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-night-800 text-slate-400 border border-night-700">
                        ĐÃ LOẠI
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-righteous-500/20 text-righteous-300 border border-righteous-500/40 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3 text-righteous-400" />
                        HOÀN THÀNH
                      </span>
                    )}
                  </div>

                  <div className="pt-2">
                    <div className="text-xs font-bold text-white truncate">
                      {team.displayName}
                    </div>
                    <div className="text-[10px] text-slate-400 pt-0.5">
                      {isEliminated ? "Dừng lại ở các vòng bỏ phiếu" : "Bảo vệ thành công nhiệm vụ"}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 3. BOTTOM CONTROL BAR */}
      <div className="glass-panel-elevated rounded-3xl p-4 lg:p-5 border border-night-700/80 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
          <span>
            Giảng viên có thể đóng phòng này và bắt đầu phiên thảo luận mới cho lớp học khác bất cứ lúc nào.
          </span>
        </div>

        <div className="flex items-center gap-3">
          <GameButton
            variant="danger"
            size="md"
            onClick={onResetRoom}
            icon={<RotateCcw className="w-4 h-4" />}
            disabled={loading}
          >
            ĐÓNG PHÒNG &amp; TẠO PHÒNG MỚI
          </GameButton>
        </div>
      </div>
    </div>
  );
};

