import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";

// Real Player Pages & Layout
import { PlayerLayout } from "./pages/player/PlayerLayout";
import { PlayerJoinPage } from "./pages/player/PlayerJoinPage";
import { PlayerLobbyPage } from "./pages/player/PlayerLobbyPage";
import { PlayerRolePage } from "./pages/player/PlayerRolePage";
import { PlayerQuestionPage } from "./pages/player/PlayerQuestionPage";
import { PlayerResultPage } from "./pages/player/PlayerResultPage";
import { PlayerAbilityPage } from "./pages/player/PlayerAbilityPage";
import { PlayerObservePage } from "./pages/player/PlayerObservePage";
import { PlayerPrivateResultPage } from "./pages/player/PlayerPrivateResultPage";
import { PlayerDayResultPage } from "./pages/player/PlayerDayResultPage";
import { PlayerDiscussionPage } from "./pages/player/PlayerDiscussionPage";
import { PlayerVotingPage } from "./pages/player/PlayerVotingPage";
import { PlayerVoteResultPage } from "./pages/player/PlayerVoteResultPage";
import { PlayerFinalPage } from "./pages/player/PlayerFinalPage";

// Real Host Pages & Layout
import { HostLayout } from "./pages/host/HostLayout";
import { HostLobbyPage } from "./pages/host/HostLobbyPage";
import { HostRoleRevealPage } from "./pages/host/HostRoleRevealPage";
import { HostNightPage } from "./pages/host/HostNightPage";
import { HostDayResultPage } from "./pages/host/HostDayResultPage";
import { HostDiscussionPage } from "./pages/host/HostDiscussionPage";
import { HostVotingPage } from "./pages/host/HostVotingPage";
import { HostVoteResultPage } from "./pages/host/HostVoteResultPage";
import { HostFinalPage } from "./pages/host/HostFinalPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ======================================================== */}
        {/* REAL PLAYER ROUTES (Mobile first >= 360px)               */}
        {/* ======================================================== */}
        <Route element={<PlayerLayout />}>
          {/* Màn hình tham gia phòng (P-01) */}
          <Route path="/" element={<PlayerJoinPage />} />
          <Route path="/player" element={<PlayerJoinPage />} />
          <Route path="/player/join" element={<PlayerJoinPage />} />

          {/* Phòng chờ sinh viên (P-02) */}
          <Route path="/player/lobby" element={<PlayerLobbyPage />} />

          {/* Mở niêm phong vai trò bí mật (P-03) */}
          <Route path="/player/role" element={<PlayerRolePage />} />
          <Route path="/player/role/:role" element={<Navigate to="/player/role" replace />} />

          {/* Thử thách tri thức ban đêm (P-04) */}
          <Route path="/player/night/question" element={<PlayerQuestionPage />} />

          {/* Phân nhánh kết quả tri thức (P-05A ĐÚNG / P-05B SAI) */}
          <Route path="/player/night/result" element={<PlayerResultPage />} />

          {/* Thực thi quyền năng ban đêm (P-06) */}
          <Route path="/player/night/ability" element={<PlayerAbilityPage />} />

          {/* Quan sát đêm cho Công dân tạm thời (P-06-C) */}
          <Route path="/player/night/observe" element={<PlayerObservePage />} />

          {/* Kết quả mật riêng tư (P-07) */}
          <Route path="/player/night/private-result" element={<PlayerPrivateResultPage />} />

          {/* Báo cáo ban ngày (P-08) */}
          <Route path="/player/day/result" element={<PlayerDayResultPage />} />

          {/* Phiên thảo luận & tranh luận ban ngày (P-09) */}
          <Route path="/player/day/discussion" element={<PlayerDiscussionPage />} />

          {/* Phiên bỏ phiếu tín nhiệm (P-10) */}
          <Route path="/player/vote" element={<PlayerVotingPage />} />
          <Route path="/player/vote/result" element={<PlayerVoteResultPage />} />
          <Route path="/player/final" element={<PlayerFinalPage />} />
        </Route>

        {/* ======================================================== */}
        {/* REAL HOST ROUTES (Projector 1080p)                       */}
        {/* ======================================================== */}
        <Route path="/host" element={<HostLayout />}>
          {/* Điều khiển phòng học & Sảnh chờ máy chiếu (H-01) */}
          <Route index element={<HostLobbyPage />} />
          <Route path="lobby" element={<HostLobbyPage />} />

          {/* Sân khấu mở vai trò toàn lớp (H-02) */}
          <Route path="role-reveal" element={<HostRoleRevealPage />} />

          {/* Sân khấu thử thách đêm & Đồng hồ đếm ngược (H-03) */}
          <Route path="night" element={<HostNightPage />} />

          {/* Sân khấu báo cáo vụ án ban ngày (H-04) */}
          <Route path="day-result" element={<HostDayResultPage />} />

          {/* Sân khấu tranh luận & đối chất toàn lớp (H-05) */}
          <Route path="discussion" element={<HostDiscussionPage />} />

          {/* Sân khấu bỏ phiếu tín nhiệm toàn lớp (H-06) */}
          <Route path="voting" element={<HostVotingPage />} />
          <Route path="vote-result" element={<HostVoteResultPage />} />
          <Route path="final" element={<HostFinalPage />} />
        </Route>

        {/* Catch-all redirect to player home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
