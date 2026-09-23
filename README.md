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

Foundation, MongoDB setup, shared contracts, Room, Team, Player session, reconnect, realtime lobby presence, ready state, authoritative GameEngine và Host runtime controls đã được triển khai. Role, question, ability và voting chưa được triển khai; Trust hiện có state/timer server-side nhưng chưa có gameplay events.

Khi mạng không ổn định, có thể tạo `.env.local` để override Atlas bằng MongoDB local mà không sửa `.env`:

```env
MONGODB_URI=mongodb://127.0.0.1:27017
MONGODB_DB_NAME=dem-niem-tin-dev
```

Chạy Room/Session integration tests với MongoDB local:

```powershell
$env:RUN_DB_INTEGRATION='true'
npm.cmd run test --workspace server -- tests/room.integration.test.ts
```

Game runtime integration tests use the same flag:

```powershell
$env:RUN_DB_INTEGRATION='true'
npm.cmd run test --workspace server -- tests/gameRuntime.integration.test.ts
```
