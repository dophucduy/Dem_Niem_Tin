import { BrowserRouter, Route, Routes } from "react-router-dom";
import { HostPage } from "./pages/HostPage";
import { PlayerPage } from "./pages/PlayerPage";
import { TestNavigationPage } from "./pages/TestNavigationPage";
import { TestScreenWrapper } from "./pages/TestScreenWrapper";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Đường dẫn tiêu chuẩn: Trang chủ (/) và (/player) là giao diện người chơi sinh viên */}
        <Route path="/" element={<PlayerPage />} />
        <Route path="/player" element={<PlayerPage />} />

        {/* Tuyến đường riêng biệt dành cho Giảng viên / Máy chiếu */}
        <Route path="/host" element={<HostPage />} />

        {/* === ĐIỀU HƯỚNG TRỰC TIẾP TRÊN THANH URL ĐỂ TEST TỪNG MÀN HÌNH === */}
        {/* Bảng tổng hợp toàn bộ các màn hình */}
        <Route path="/test" element={<TestNavigationPage />} />

        {/* Test từng màn hình người chơi (Mobile) */}
        <Route path="/test/p01" element={<TestScreenWrapper screenId="p01" />} />
        <Route path="/test/p02" element={<TestScreenWrapper screenId="p02" />} />
        <Route path="/test/p03" element={<TestScreenWrapper screenId="p03" />} />
        <Route path="/test/p03/:role" element={<TestScreenWrapper screenId="p03" />} />
        <Route path="/test/p04" element={<TestScreenWrapper screenId="p04" />} />
        <Route path="/test/p05a" element={<TestScreenWrapper screenId="p05a" />} />
        <Route path="/test/p05b" element={<TestScreenWrapper screenId="p05b" />} />
        <Route path="/test/p06" element={<TestScreenWrapper screenId="p06" />} />
        <Route path="/test/p06_citizen" element={<TestScreenWrapper screenId="p06_citizen" />} />

        {/* Test từng màn hình Giảng viên (Projector 1080p) */}
        <Route path="/test/h01" element={<TestScreenWrapper screenId="h01" />} />
        <Route path="/test/h02" element={<TestScreenWrapper screenId="h02" />} />
        <Route path="/test/h03" element={<TestScreenWrapper screenId="h03" />} />
      </Routes>
    </BrowserRouter>
  );
}
