# PHÂN CÔNG CÔNG VIỆC CHO 3 DEV

## 1. Mục tiêu

Xây dựng MVP **Đêm Niềm Tin** theo đúng `ĐÊM NIỀM TIN — MASTERPLAN.md` với:

- 1 Host và đúng 8 Player/đội.
- 3 vòng Night – Day – Voting và màn Final.
- Server nắm toàn quyền quyết định game state.
- Public state và private state được tách biệt.
- Người chơi trả lời đúng để mở khóa năng lực; trả lời sai trở thành Citizen tạm thời trong đêm hiện tại.
- Toàn bộ game chạy được trong mạng Wi-Fi nội bộ.

## 2. Phân bổ khối lượng

| Thành viên | Vai trò | Khối lượng dự kiến |
|---|---|---:|
| Bạn | Tech Lead, Foundation, Core Backend, Integration | 50% |
| Dev 2 | Gameplay Backend và Testing | 30% |
| Dev 3 | Frontend Host và Player | 20% |

---

## 3. Công việc của bạn — 50%

### 3.1. Project Foundation

- Khởi tạo monorepo gồm `client`, `server`, `shared` và `tests`.
- Cấu hình React, TypeScript, Vite và Tailwind CSS.
- Cấu hình Node.js, Express và Socket.IO.
- Cấu hình MongoDB, Mongoose và biến môi trường.
- Cấu hình Zod, Vitest, ESLint và các npm scripts.
- Tạo `.env.example`, `.gitignore` và README hướng dẫn chạy project.
- Đảm bảo Host và Player kết nối được với server.

### 3.2. Kiến trúc dùng chung

- Xây dựng shared types cho game state, player, team, room và socket payload.
- Định nghĩa tên và payload của các Socket.IO events.
- Thiết kế cấu trúc public state và private player state.
- Thiết lập quy ước error response và socket acknowledgement.
- Đảm bảo frontend không nhận dữ liệu bí mật không được phép xem.

### 3.3. Room và Session System

- Host tạo phòng và nhận room code.
- Tạo sẵn đúng 8 team slot.
- Player tham gia phòng và chọn/nhận team hợp lệ.
- Không cho team thứ chín hoặc hai Player chiếm cùng một team.
- Sinh session token và chỉ lưu token hash trên server/database.
- Khôi phục đúng player, team và role sau khi refresh.
- Quản lý trạng thái connected/disconnected.

### 3.4. Core Game Engine

- Xây dựng GameEngine độc lập với React.
- Triển khai state machine:

```text
LOBBY
→ ROLE_REVEAL
→ NIGHT_KNOWLEDGE
→ NIGHT_ABILITY
→ NIGHT_RESOLUTION
→ DAY_RESULT
→ DISCUSSION
→ VOTING
→ VOTE_RESULT
→ TRUST_UPDATE
→ NEXT_ROUND
→ FINAL
```

- Điều phối đúng 3 Night, 3 Day và 3 Voting.
- Không cho xuất hiện Night 4.
- Xây dựng timer server-side bằng `phaseStartedAt` và `phaseEndsAt`.
- Triển khai pause, resume, skip timer, restart round, reset và end game.
- Tự động chuyển micro-phase khi đủ điều kiện.

### 3.5. Integration và quản lý kỹ thuật

- Quản lý Git workflow và phân nhánh công việc.
- Review pull request/code của Dev 2 và Dev 3.
- Tích hợp Gameplay Backend với Socket.IO.
- Tích hợp frontend với dữ liệu và events thật.
- Xử lý merge conflict và thay đổi shared types.
- Chạy kiểm thử tổng thể với 1 Host và 8 Player.
- Chuẩn bị cấu hình chạy trên local Wi-Fi.
- Chịu trách nhiệm nghiệm thu MVP cuối cùng.

### Deliverables của bạn

- Project có thể cài đặt và chạy bằng npm scripts.
- Host và Player kết nối được với server.
- Room/session/reconnect hoạt động ổn định.
- State machine chạy đủ ba vòng.
- Timer và các lệnh điều khiển Host hoạt động.
- Public/private state không bị lẫn dữ liệu.
- Full game có thể chạy trong mạng nội bộ.

---

## 4. Công việc của Dev 2 — 30%

### 4.1. Role Assignment

- Khai báo bảy loại role theo masterplan.
- Phân ngẫu nhiên đúng cơ cấu:

```text
2 × CORRUPTOR
1 × INSPECTOR
1 × LAW
1 × WHISTLEBLOWER
1 × OVERSIGHT
1 × SPECIAL_6
1 × SPECIAL_7
```

- Gửi role riêng cho đúng Player.
- Không đưa role/faction bí mật vào public state.

### 4.2. Knowledge System

- Xây dựng question model và dữ liệu câu hỏi.
- Kiểm tra đáp án hoàn toàn trên server.
- Trả lời đúng: mở khóa ability.
- Trả lời sai: giữ nguyên permanent role và đặt `effectiveState = CITIZEN`.
- Reset cơ hội mở khóa ở đầu mỗi Night.

### 4.3. Abilities và Night Resolution

- Triển khai ability cho Corruptor, Inspector, Law, Whistleblower, Oversight, Special 6 và Special 7.
- Kiểm tra role, phase, effective state, trạng thái mở khóa, target và số lần sử dụng.
- Xử lý protection trước harmful action.
- Sinh private result và public clue đúng người nhận.
- Đưa các hiệu ứng có thể thay đổi vào configuration.

### 4.4. Voting, Trust và Win Conditions

- Nhận và kiểm tra phiếu bầu.
- Chặn double vote, late vote và invalid target.
- Tổng hợp phiếu sau khi voting đóng.
- Xử lý reveal/elimination theo configuration.
- Cập nhật Trust bằng server-side events.
- Tính faction result độc lập với final Trust.

### 4.5. Tests

- Viết unit tests cho role, question, ability, voting và Trust.
- Viết đủ 15 security tests bắt buộc trong masterplan.
- Phối hợp với bạn để sửa lỗi integration.

### Deliverables của Dev 2

- Gameplay services không phụ thuộc React.
- Toàn bộ role và ability hoạt động đúng.
- Knowledge/Citizen reset đúng qua từng Night.
- Voting và Trust có test tự động.
- Không rò rỉ private state.

---

## 5. Công việc của Dev 3 — 20%

### 5.1. Host UI

- Trang tạo phòng và hiển thị room code.
- Lobby hiển thị trạng thái 8 team.
- Giao diện game-show hiển thị phase, round, timer và Trust.
- Hiển thị question, public clues, public events và vote result.
- Các nút pause, resume, skip, reveal, reset và end game.
- Confirmation cho reset và end game.

### 5.2. Player UI

- Trang join room.
- Waiting và role reveal.
- Question và answer feedback.
- Ability/Citizen state.
- Chọn target và xem private result.
- Voting, chờ kết quả và Final.
- Giữ session token để hỗ trợ reconnect.

### 5.3. Responsive và trải nghiệm

- Player mobile-first từ 360px.
- Host tối ưu cho 1280×720 và 1920×1080.
- Nút lớn, tương phản rõ và không chỉ truyền đạt trạng thái bằng màu sắc.
- Animation ngắn cho role, answer, clue, Trust và final reveal.
- Không đặt game rules trong React components.

### Deliverables của Dev 3

- Hoàn chỉnh Host flow và Player flow.
- Giao diện sử dụng được trên điện thoại và máy chiếu.
- UI chỉ gửi intent và hiển thị state từ server.
- Không tự tính vote, Trust, role hay ability ở client.

---

## 6. Thứ tự triển khai

### Giai đoạn 1 — Foundation

**Phụ trách chính:** Bạn  
**Hỗ trợ:** Dev 2 và Dev 3

- Setup toàn bộ project.
- Thống nhất shared types và socket contract.
- Host và Player kết nối được với server.

**Điều kiện hoàn thành:** cả Host và Player báo kết nối thành công.

### Giai đoạn 2 — Room, Session và Role

- Bạn làm room, team, session và reconnect.
- Dev 2 làm role assignment và bảo mật private state.
- Dev 3 làm Join/Lobby/Waiting UI.

**Điều kiện hoàn thành:** 8/8 Player tham gia, refresh không đổi danh tính hoặc role.

### Giai đoạn 3 — Game Engine và Knowledge

- Bạn làm state machine, timer và Host controls.
- Dev 2 làm question, answer, ability unlock và Citizen tạm thời.
- Dev 3 làm màn role/question/answer.

**Điều kiện hoàn thành:** chạy được Night 1 → Day 1 → Voting 1 bằng giao diện cơ bản.

### Giai đoạn 4 — Gameplay hoàn chỉnh

- Dev 2 làm abilities, night resolution, clues, voting và Trust.
- Bạn tích hợp các module vào GameEngine và Socket.IO.
- Dev 3 hoàn thành ability, private result, voting và Trust UI.

**Điều kiện hoàn thành:** chạy đủ ba vòng và đến Final.

### Giai đoạn 5 — Testing và hoàn thiện

- Bạn chạy integration test và full-flow test.
- Dev 2 hoàn thành unit/security tests.
- Dev 3 hoàn thiện responsive, accessibility và animation.

**Điều kiện hoàn thành:** mô phỏng thành công 1 Host + 8 Player, không sửa database thủ công.

---

## 7. Quy tắc phối hợp Git

- Nhánh chính: `main`.
- Mỗi đầu việc dùng một feature branch riêng.
- Gợi ý tên nhánh:

```text
feature/foundation
feature/room-session
feature/game-engine
feature/gameplay-abilities
feature/host-ui
feature/player-ui
test/security
```

- Không push trực tiếp vào `main`.
- Shared types/socket contract chỉ thay đổi sau khi thông báo cả nhóm.
- Pull request phải build và test thành công trước khi merge.
- Bạn là người review và quyết định merge cuối cùng.

## 8. Definition of Done cho mỗi task

Một task chỉ được xem là hoàn thành khi:

- Code build thành công.
- Không có TypeScript error.
- Có validation cho dữ liệu từ client.
- Có test cho game rule quan trọng.
- Không gửi secret state sai đối tượng.
- Không đặt game logic trong React component.
- Đã chạy thử với ít nhất hai browser/device khi task liên quan Socket.IO.
- Có mô tả cách kiểm tra trong pull request.

## 9. Trách nhiệm nghiệm thu cuối

Bạn chịu trách nhiệm xác nhận:

- Kiến trúc đúng masterplan.
- Server luôn authoritative.
- Public/private state được bảo vệ.
- Refresh không tạo Player trùng.
- Temporary Citizen không làm thay đổi permanent role.
- Game chạy đúng ba vòng.
- Full flow hoạt động với 1 Host và 8 Player trên local Wi-Fi.
