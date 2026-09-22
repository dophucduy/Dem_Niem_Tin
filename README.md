# Đêm Niềm Tin

Ứng dụng classroom multiplayer theo `ĐÊM NIỀM TIN — MASTERPLAN.md`.

## Yêu cầu

- Node.js 20+
- npm 10+
- MongoDB local hoặc một MongoDB URI hợp lệ

## Cài đặt và chạy

```powershell
Copy-Item .env.example .env
npm.cmd install
npm.cmd run dev
```

- Trang chủ: `http://localhost:5173`
- Host: `http://localhost:5173/host`
- Player: `http://localhost:5173/player`
- Server health: `http://localhost:3000/api/health`

Khởi tạo collections và indexes trên database trong `MONGODB_URI`:

```powershell
npm.cmd run db:setup --workspace server
```

Tên database được cấu hình riêng bằng `MONGODB_DB_NAME` (mặc định: `dem-niem-tin-dev`).

Điện thoại trong cùng Wi-Fi truy cập bằng IPv4 của laptop. Khi đó, cập nhật `CLIENT_ORIGIN` trong `.env` và tạo `client/.env.local` với `VITE_SERVER_URL=http://<LOCAL-IP>:3000`.

## Kiểm tra

```powershell
npm.cmd run typecheck
npm.cmd run build
npm.cmd test
```

## Phạm vi hiện tại

Milestone 1 chỉ gồm foundation, Socket.IO, MongoDB connection và kiểm tra kết nối Host/Player. Room, role, question, ability, voting và Trust chưa được triển khai.
