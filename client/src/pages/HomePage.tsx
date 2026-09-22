import { useState } from "react";
import { Link } from "react-router-dom";
import { Scale, Monitor, Smartphone, Sparkles, Shield, RotateCcw } from "lucide-react";
import { TrustMeter } from "../components/common/TrustMeter";
import { PhaseTimer } from "../components/common/PhaseTimer";
import { StatusBadge } from "../components/common/StatusBadge";
import { GameButton } from "../components/common/GameButton";

export function HomePage() {
  const [demoTrust, setDemoTrust] = useState<number>(75);
  const [demoDelta, setDemoDelta] = useState<number | undefined>(undefined);
  const [mockEndTime] = useState<number>(() => Date.now() + 180 * 1000);

  const changeTrust = (amount: number) => {
    setDemoTrust((prev) => Math.max(0, Math.min(100, prev + amount)));
    setDemoDelta(amount);
  };

  return (
    <main className="min-h-screen py-10 px-4 max-w-5xl mx-auto flex flex-col justify-between">
      {/* Brand Header */}
      <section className="text-center pt-4 pb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-trust-500/10 border border-trust-500/30 text-trust-400 text-xs font-bold uppercase tracking-widest mb-4">
          <Scale className="w-3.5 h-3.5" />
          Hệ thống Giáo dục Trực quan
        </div>
        <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white mb-3">
          ĐÊM NIỀM TIN
        </h1>
        <p className="max-w-xl mx-auto text-sm sm:text-base text-slate-400">
          Trò chơi tương tác xã hội trong lớp học: Tư tưởng Hồ Chí Minh, xây dựng Đảng và Nhà nước, phòng chống tham nhũng, củng cố niềm tin nhân dân.
        </p>

        {/* Portal Links */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
          <Link to="/host" className="flex-1">
            <GameButton
              variant="primary"
              size="lg"
              fullWidth
              icon={<Monitor className="w-5 h-5" />}
            >
              MÀN HÌNH HOST (1080P)
            </GameButton>
          </Link>

          <Link to="/player" className="flex-1">
            <GameButton
              variant="justice"
              size="lg"
              fullWidth
              icon={<Smartphone className="w-5 h-5" />}
            >
              THIẾT BỊ NGƯỜI CHƠI
            </GameButton>
          </Link>
        </div>
      </section>

      {/* Design System & Token Showcase (Step 1 Review) */}
      <section className="glass-panel rounded-2xl p-6 sm:p-8 border border-night-700/80 my-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-night-700 pb-4 mb-6">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-5 h-5 text-trust-400" />
            <h2 className="text-lg font-bold text-white uppercase tracking-wider">
              Bước 1: Design System & Tokens Preview
            </h2>
          </div>
          <span className="text-xs font-mono text-slate-400 bg-night-900 px-2.5 py-1 rounded border border-night-700">
            Design Tokens Ready
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left: TrustMeter Live Demo */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-trust-400" />
              1. Thang đo Niềm Tin (TrustMeter)
            </h3>

            {/* Broadcast variant */}
            <TrustMeter
              trust={demoTrust}
              delta={demoDelta}
              variant="broadcast"
            />

            {/* Interactive controls */}
            <div className="flex flex-wrap gap-2 pt-2">
              <GameButton
                variant="righteous"
                size="sm"
                onClick={() => changeTrust(15)}
              >
                +15% (Đúng/Phá án)
              </GameButton>
              <GameButton
                variant="danger"
                size="sm"
                onClick={() => changeTrust(-15)}
              >
                -15% (Tham nhũng)
              </GameButton>
              <GameButton
                variant="outline"
                size="sm"
                icon={<RotateCcw className="w-3.5 h-3.5" />}
                onClick={() => {
                  setDemoTrust(100);
                  setDemoDelta(undefined);
                }}
              >
                Đặt lại (100%)
              </GameButton>
            </div>
          </div>

          {/* Right: Badges & Timers & Buttons */}
          <div className="space-y-6">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                2. Đồng hồ máy chủ (PhaseTimer)
              </h3>
              <div className="flex flex-wrap items-center gap-3">
                <PhaseTimer phaseEndsAt={mockEndTime} size="sm" />
                <PhaseTimer phaseEndsAt={mockEndTime} size="md" />
                <PhaseTimer phaseEndsAt={Date.now() + 10 * 1000} size="sm" />
                <PhaseTimer phaseEndsAt={mockEndTime} paused={true} size="sm" />
              </div>
            </div>

            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                3. Huy hiệu trạng thái (StatusBadge)
              </h3>
              <div className="flex flex-wrap gap-2">
                <StatusBadge kind="phase" phase="NIGHT" round={1} />
                <StatusBadge kind="phase" phase="DAY" round={2} />
                <StatusBadge kind="phase" phase="VOTING" round={3} />
                <StatusBadge kind="phase" phase="FINAL" />
              </div>
              <div className="flex flex-wrap gap-2 mt-2.5">
                <StatusBadge kind="effectiveState" state="SPECIAL" />
                <StatusBadge kind="effectiveState" state="CITIZEN" />
                <StatusBadge kind="faction" faction="TRUST" />
                <StatusBadge kind="faction" faction="CORRUPTION" />
              </div>
            </div>

            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                4. Nút bấm thao tác (GameButton Variants)
              </h3>
              <div className="flex flex-wrap gap-2.5">
                <GameButton variant="primary" size="sm">Nút Chính</GameButton>
                <GameButton variant="justice" size="sm">Điều tra</GameButton>
                <GameButton variant="danger" size="sm">Bỏ phiếu</GameButton>
                <GameButton variant="righteous" size="sm">Mở khóa</GameButton>
                <GameButton variant="outline" size="sm">Đóng</GameButton>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center text-xs text-slate-500 py-4">
        Đêm Niềm Tin — Phiên bản phòng học • Masterplan 1.0
      </footer>
    </main>
  );
}
