import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Role } from "@dem-niem-tin/shared";
import { PlayerJoinView } from "../components/player/PlayerJoinView";
import { PlayerLobbyView } from "../components/player/PlayerLobbyView";
import { RoleRevealView } from "../components/player/RoleRevealView";
import { NightQuestionView } from "../components/player/NightQuestionView";
import { AnswerResultView } from "../components/player/AnswerResultView";
import { NightAbilityView } from "../components/player/NightAbilityView";
import { HostLobbyView } from "../components/host/HostLobbyView";
import { HostRoleRevealStage } from "../components/host/HostRoleRevealStage";
import { HostNightStage } from "../components/host/HostNightStage";
import { AppHeader } from "../components/common/AppHeader";
import { SAMPLE_QUESTIONS } from "../data/sampleQuestions";
import { ArrowLeft, Sparkles, RefreshCw } from "lucide-react";

export type TestScreenId = 
  | "p01" 
  | "p02" 
  | "p03" 
  | "p04" 
  | "p05a" 
  | "p05b" 
  | "p06" 
  | "p06_citizen" 
  | "h01" 
  | "h02" 
  | "h03";

interface TestScreenWrapperProps {
  screenId: "p01" | "p02" | "p03" | "p04" | "p05a" | "p05b" | "h01" | "h02" | "h03";
}

export const TestScreenWrapper: React.FC<TestScreenWrapperProps> = ({ screenId }) => {
  const { role: urlRole } = useParams<{ role?: string }>();

  // State for P03 & P05/P06 tests
  const validRole = (urlRole && ["INSPECTOR", "CORRUPTOR", "LAW", "WHISTLEBLOWER", "OVERSIGHT", "SPECIAL_6", "SPECIAL_7"].includes(urlRole))
    ? (urlRole as Role)
    : "INSPECTOR";
  const [selectedRole, setSelectedRole] = useState<Role>(validRole);

  // State for H03 test
  const [paused, setPaused] = useState(false);
  const [phaseEndsAt, setPhaseEndsAt] = useState(() => Date.now() + 180 * 1000);
  const [trust, setTrust] = useState(100);
  const [trustDelta, setTrustDelta] = useState<number | undefined>(undefined);

  // Mock Teams for Lobby & Stages
  const mockTeams = Array.from({ length: 8 }, (_, i) => ({
    id: `team-${i + 1}`,
    teamNumber: i + 1,
    displayName: i < 5 ? `Nhóm ${i + 1}` : undefined,
    connected: i < 6, // 6 connected
    ready: i < 4,     // 4 ready
    eliminated: false,
  }));

  const mockLobby = {
    roomId: "test-room-id",
    roomCode: "NT8892",
    status: "LOBBY" as const,
    teams: mockTeams as any,
    connectedCount: 6,
    capacity: 8 as const,
  };

  const isHostScreen = screenId.startsWith("h");

  return (
    <div className="min-h-screen flex flex-col justify-between">
      {/* Top Test Navigation Bar */}
      <div className="bg-night-950 border-b border-night-700/80 px-4 py-2 flex items-center justify-between text-xs sticky top-0 z-50">
        <Link
          to="/test"
          className="inline-flex items-center gap-1.5 text-trust-400 font-bold hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          Quay lại Danh sách Test (/test)
        </Link>

        <div className="flex items-center gap-3">
          <span className="font-mono font-bold text-slate-300 px-2 py-0.5 rounded bg-night-900 border border-night-700">
            URL: /test/{screenId}{urlRole ? `/${urlRole}` : ""}
          </span>

          {(screenId === "p03" || screenId === "p05a" || screenId === "p05b" || screenId === "p06") && (
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400 font-medium">Đổi vai:</span>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value as Role)}
                className="bg-night-900 border border-night-600 rounded px-2 py-0.5 text-white font-bold outline-none"
              >
                <option value="INSPECTOR">Thanh Tra</option>
                <option value="CORRUPTOR">Người Vụ Lợi</option>
                <option value="LAW">Pháp Luật</option>
                <option value="WHISTLEBLOWER">Người Tố Giác</option>
                <option value="OVERSIGHT">Cơ Quan Giám Sát</option>
                <option value="SPECIAL_6">Giám Sát Tài Sản</option>
                <option value="SPECIAL_7">Minh Bạch Thông Tin</option>
              </select>
            </div>
          )}

          {screenId === "h03" && (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => {
                  setTrust((t) => Math.min(100, t + 15));
                  setTrustDelta(15);
                }}
                className="px-2 py-0.5 rounded bg-righteous-950 text-righteous-400 border border-righteous-700 font-bold cursor-pointer"
              >
                +15% Trust
              </button>
              <button
                onClick={() => {
                  setTrust((t) => Math.max(0, t - 15));
                  setTrustDelta(-15);
                }}
                className="px-2 py-0.5 rounded bg-corruption-950 text-corruption-400 border border-corruption-700 font-bold cursor-pointer"
              >
                -15% Trust
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Screen Header */}
      <AppHeader
        roleMode={isHostScreen ? "HOST" : "PLAYER"}
        roomCode="NT8892"
        teamDisplayName={!isHostScreen ? "Đội 4" : undefined}
        phase={
          screenId === "h03" || screenId === "p04" || screenId === "p05a" || screenId === "p05b" || screenId === "p06" || screenId === "p06_citizen"
            ? "NIGHT"
            : screenId === "h02" || screenId === "p03"
            ? "NIGHT"
            : "LOBBY"
        }
        round={1}
        trust={trust}
        trustDelta={trustDelta}
        phaseEndsAt={screenId === "h03" || screenId === "p04" ? phaseEndsAt : undefined}
        paused={paused}
      />

      {/* Main Render Target */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
        {screenId === "p01" && (
          <PlayerJoinView
            initialRoomCode="NT8892"
            initialTeamNumber={4}
            occupiedTeams={[1, 2]}
            onJoin={(code, team, name) => {
              alert(`Xác nhận tham gia test: Phòng ${code}, Đội ${team}, Tên: ${name || "Mặc định"}`);
            }}
          />
        )}

        {screenId === "p02" && (
          <PlayerLobbyView
            lobby={mockLobby}
            myTeamNumber={4}
            myPlayerId="player-test-4"
            onLeaveRoom={() => alert("Test sự kiện: Rời phòng")}
          />
        )}

        {screenId === "p03" && (
          <RoleRevealView
            role={selectedRole}
            faction={selectedRole === "CORRUPTOR" ? "CORRUPTION" : "TRUST"}
            teamNumber={4}
            onConfirmReady={() => alert("Test sự kiện: Xác nhận sẵn sàng!")}
          />
        )}

        {screenId === "p04" && (
          <NightQuestionView
            question={SAMPLE_QUESTIONS[0]}
            roundNumber={1}
            abilityName="ĐIỀU TRA BÍ MẬT"
            onSubmitAnswer={(selectedIdx) => {
              alert(`Test sự kiện nộp đáp án: Lựa chọn index ${selectedIdx} (Đáp án ${['A', 'B', 'C', 'D'][selectedIdx]})`);
            }}
          />
        )}

        {screenId === "p05a" && (
          <AnswerResultView
            isCorrect={true}
            role={selectedRole}
            roundNumber={1}
            questionText={SAMPLE_QUESTIONS[0].text}
            explanation={SAMPLE_QUESTIONS[0].explanation}
            onProceed={() => alert("Test sự kiện: Chuyển sang Màn hình Hành động Ban đêm (P-06)")}
          />
        )}

        {screenId === "p05b" && (
          <AnswerResultView
            isCorrect={false}
            role={selectedRole}
            roundNumber={1}
            questionText={SAMPLE_QUESTIONS[0].text}
            correctOptionText={SAMPLE_QUESTIONS[0].options[SAMPLE_QUESTIONS[0].correctOption]}
            explanation={SAMPLE_QUESTIONS[0].explanation}
            onProceed={() => alert("Test sự kiện: Tiếp tục đêm với tư cách Công dân")}
          />
        )}

        {screenId === "p06" && (
          <NightAbilityView
            role={selectedRole}
            effectiveState="SPECIAL"
            myTeamNumber={4}
            teams={mockTeams}
            onExecuteAbility={(targetTeam) => {
              alert(`Test sự kiện thực thi năng lực: Đã chọn mục tiêu ĐỘI ${targetTeam}`);
            }}
          />
        )}

        {screenId === "p06_citizen" && (
          <NightAbilityView
            role={selectedRole}
            effectiveState="CITIZEN"
            myTeamNumber={4}
            teams={mockTeams}
            onExecuteAbility={() => {}}
          />
        )}

        {screenId === "h01" && (
          <HostLobbyView
            lobby={mockLobby}
            onStartGame={() => alert("Test sự kiện Host: BẮT ĐẦU TRÒ CHƠI")}
            onResetRoom={() => alert("Test sự kiện Host: Làm mới phòng")}
          />
        )}

        {screenId === "h02" && (
          <HostRoleRevealStage
            teams={mockTeams as any}
            onProceedToNight={() => alert("Test sự kiện Host: BƯỚC VÀO ĐÊM 01")}
          />
        )}

        {screenId === "h03" && (
          <HostNightStage
            round={1}
            question={SAMPLE_QUESTIONS[0]}
            teams={mockTeams as any}
            trust={trust}
            trustDelta={trustDelta}
            phaseEndsAt={phaseEndsAt}
            paused={paused}
            onPauseToggle={() => setPaused(!paused)}
            onSkipTimer={() => setPhaseEndsAt(Date.now() + 5000)}
            onResolveNight={() => alert("Test sự kiện Host: Thẩm định kết quả")}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="py-2.5 text-center text-xs text-slate-500 bg-night-950/80 border-t border-night-800">
        Chế độ Kiểm thử Trực quan • Màn hình: <span className="font-mono text-trust-400 font-bold uppercase">{screenId}</span>
      </footer>
    </div>
  );
};
