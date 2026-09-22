import { BrowserRouter, Route, Routes } from "react-router-dom";
import { HostPage } from "./pages/HostPage";
import { PlayerPage } from "./pages/PlayerPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Kahoot style: Trang chủ (/) và (/player) 100% là giao diện người chơi sinh viên */}
        <Route path="/" element={<PlayerPage />} />
        <Route path="/player" element={<PlayerPage />} />

        {/* Tuyến đường riêng biệt dành cho Giảng viên / Máy chiếu */}
        <Route path="/host" element={<HostPage />} />
      </Routes>
    </BrowserRouter>
  );
}
