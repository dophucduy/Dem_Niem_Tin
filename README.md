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

Foundation, MongoDB setup, shared contracts, Room/Session/Reconnect, authoritative GameEngine, Host controls, role assignment, private player state, knowledge question, ability submission và voting backend đã được triển khai. Gameplay socket lấy danh tính từ session server-side; client không được tự khai báo `playerId` hoặc `gameId`.

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

## Deploy Render + Vercel

Repository có sẵn `render.yaml` và `vercel.json`.

Vercel phải dùng **Root Directory để trống** (gốc repository), không đặt là `client`.
Gốc repository mới có khai báo npm workspaces cho `shared`, `client` và `server`.
Các lệnh install/build và thư mục kết quả `client/dist` đã được khai báo trong `vercel.json`.
Sau khi đổi Root Directory, lưu lại và redeploy bản mới nhất.
Commit `package-lock.json` cùng các thay đổi dependency để Windows và Linux dùng cùng phiên bản;
không xóa các dependency tùy chọn dành cho Linux khỏi lockfile.

Render cần các biến môi trường:

```env
MONGODB_URI=<MongoDB Atlas URI>
MONGODB_DB_NAME=dem-niem-tin-dev
CLIENT_ORIGIN=https://<project>.vercel.app
```

Vercel cần biến môi trường build-time:

```env
VITE_SERVER_URL=https://<service>.onrender.com
```

Sau khi cấu hình Atlas URI, chạy một lần để tạo indexes và seed bộ câu hỏi mặc định nếu collection đang rỗng:

```powershell
npm.cmd run db:setup --workspace server
```
