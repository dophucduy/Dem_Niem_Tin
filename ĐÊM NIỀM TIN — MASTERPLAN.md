# ĐÊM NIỀM TIN
## Master Implementation Plan

Version: 1.0

---

# 0. IMPORTANT INSTRUCTION FOR AI IDE

You are implementing a classroom multiplayer game called **"ĐÊM NIỀM TIN"**.

Read this entire document before writing code.

This document is the source of truth for:

- game rules
- role mechanics
- architecture
- security
- state management
- user flows
- technical scope
- implementation order

## Critical instructions

1. Do NOT invent new gameplay rules.
2. Do NOT remove gameplay rules defined here.
3. Do NOT add unnecessary technologies.
4. Do NOT over-engineer the application.
5. Implement one milestone at a time.
6. Test each milestone before moving to the next.
7. Never expose secret role information to unauthorized clients.
8. The server is always authoritative.
9. Keep game logic outside React components.
10. Do not implement future milestones before the current milestone is stable.

---

# 1. PRODUCT OVERVIEW

"ĐÊM NIỀM TIN" is a browser-based classroom social-deduction game inspired by Werewolf/Mafia.

The game is designed for:

- 1 Host / Lecturer
- 8 Player teams
- 1 laptop
- 8 phones/tablets
- local Wi-Fi

The educational topic is:

> Vận dụng tư tưởng Hồ Chí Minh vào công tác xây dựng Đảng và xây dựng Nhà nước — Phòng, chống tham nhũng góp phần củng cố niềm tin của nhân dân vào chế độ và pháp luật.

The game should teach through gameplay rather than through passive presentation.

---

# 2. CORE EDUCATIONAL MECHANIC

The central game loop is:

```text
KNOWLEDGE
    ↓
ANSWER QUESTION
    ↓
CORRECT?
 ┌──┴──┐
YES    NO
 ↓      ↓
UNLOCK  LOCK
ABILITY ABILITY
 ↓      ↓
ACTION  CITIZEN
 ↓      ↓
CONSEQUENCE
    ↓
DISCUSSION
    ↓
VOTE
    ↓
TRUST
```

Core principle:

> **Having a role does not automatically give the player the power associated with that role. The player must demonstrate knowledge to unlock that power.**

Therefore:

> **Knowledge → Power → Responsibility → Action → Consequence → Trust**

This is the heart of the game.

---

# 3. PLAYER COUNT

Exactly:

```text
8 teams
```

Each team controls one player device.

Example:

```text
Team 1
Team 2
Team 3
Team 4
Team 5
Team 6
Team 7
Team 8
```

Do not implement individual players inside a team for MVP.

One team = one player session.

---

# 4. FACTIONS

There are two factions.

## 4.1 Corruption Faction

```text
2 × NGƯỜI VỤ LỢI
```

Objective:

- survive identification
- interfere with investigations
- reduce trust
- create uncertainty

---

## 4.2 Trust Protection Faction

```text
6 × TRUST-PROTECTION ROLES
```

Roles:

```text
1 × THANH TRA
1 × PHÁP LUẬT
1 × NGƯỜI TỐ GIÁC
1 × CƠ QUAN GIÁM SÁT
1 × ROLE 6
1 × ROLE 7
```

The final two roles must be implemented as configurable special roles.

They are NOT permanent Citizens.

---

# 5. IMPORTANT ROLE RULE

## There are NO permanent Citizen roles.

All 8 players receive a special role.

Example:

```text
8 PLAYERS
    ↓
8 SPECIAL ROLES
```

However, a special role only has its ability when its ability is unlocked.

---

# 6. TEMPORARY CITIZEN STATE

This is a critical gameplay rule.

If a player answers the knowledge question incorrectly:

```text
role remains unchanged
ability becomes locked
effective state = CITIZEN
```

The player acts as a Citizen for the current Night.

They cannot use their special ability.

Example:

```text
Original Role:
THANH TRA

Question:
WRONG

Result:
THANH TRA role remains

BUT:

CURRENT NIGHT
Effective State = CITIZEN
Ability = LOCKED
```

The role is NOT permanently changed.

---

# 7. NEXT NIGHT RESET

At the beginning of the next Night:

```text
abilityUnlocked = false
effectiveState = SPECIAL
```

The player gets another chance to answer the question.

If correct:

```text
abilityUnlocked = true
effectiveState = SPECIAL
```

If wrong:

```text
abilityUnlocked = false
effectiveState = CITIZEN
```

Therefore:

```text
ROLE
never changes automatically.

EFFECTIVE STATE
may change every Night.
```

---

# 8. ROLE DATA MODEL

Do NOT represent temporary Citizen state by changing the player's permanent role.

Use separate concepts.

Example:

```ts
type Role =
  | "CORRUPTOR"
  | "INSPECTOR"
  | "LAW"
  | "WHISTLEBLOWER"
  | "OVERSIGHT"
  | "SPECIAL_6"
  | "SPECIAL_7";
```

Then:

```ts
type EffectiveState =
  | "SPECIAL"
  | "CITIZEN";
```

Player state:

```ts
type PlayerRoundState = {
  role: Role;
  abilityUnlocked: boolean;
  effectiveState: EffectiveState;
};
```

Never do:

```ts
player.role = "CITIZEN";
```

when the answer is wrong.

---

# 9. ROLES

## 9.1 NGƯỜI VỤ LỢI

Faction:

```text
CORRUPTION
```

Ability:

```text
GÂY NHIỄU / TÁC ĐỘNG
```

Concept:

The player can perform a secret action that interferes with investigation or weakens trust.

The exact effect must be configurable.

If the player answers incorrectly:

```text
Ability = LOCKED
Effective State = CITIZEN
```

---

# 10. THANH TRA

Faction:

```text
TRUST
```

Ability:

```text
ĐIỀU TRA
```

Can investigate one team.

Possible result:

```text
CÓ DẤU HIỆU ĐÁNG NGỜ
```

or:

```text
CHƯA PHÁT HIỆN DẤU HIỆU
```

The exact role should not automatically be exposed unless explicitly configured.

Investigation result is private.

---

# 11. PHÁP LUẬT

Faction:

```text
TRUST
```

Ability:

```text
BẢO VỆ
```

Can protect one team from a valid harmful action during a Night.

The server resolves protection before harmful actions.

---

# 12. NGƯỜI TỐ GIÁC

Faction:

```text
TRUST
```

Ability:

```text
TIẾT LỘ MANH MỐI
```

Can generate or reveal a clue.

Clue visibility can be:

```text
PUBLIC
```

or:

```text
PRIVATE
```

depending on the game configuration.

---

# 13. CƠ QUAN GIÁM SÁT

Faction:

```text
TRUST
```

Ability:

```text
XÁC MINH
```

Can verify:

- a clue
- an action
- information

Example:

```text
"Manh mối này có hợp lệ không?"
```

Result may be private or public according to configuration.

---

# 14. SPECIAL ROLE 6

This role is configurable.

Suggested concept:

```text
GIÁM SÁT TÀI SẢN
```

Ability:

```text
KIỂM TRA LỢI ÍCH
```

Can inspect whether a selected team has a suspicious "personal benefit" clue.

The exact implementation should be configuration-driven.

---

# 15. SPECIAL ROLE 7

This role is configurable.

Suggested concept:

```text
CÔNG KHAI
```

Ability:

```text
YÊU CẦU MINH BẠCH
```

Can force one piece of information or clue to become public.

The exact implementation should be configuration-driven.

---

# 16. ROLE ASSIGNMENT

At game start:

```text
2 × CORRUPTOR
1 × INSPECTOR
1 × LAW
1 × WHISTLEBLOWER
1 × OVERSIGHT
1 × SPECIAL_6
1 × SPECIAL_7
```

Randomize assignments.

Every player receives exactly one role.

Roles are secret.

---

# 17. GAME STRUCTURE

The game contains exactly:

```text
LOBBY
↓
NIGHT 1
↓
DAY 1
↓
VOTING 1
↓
NIGHT 2
↓
DAY 2
↓
VOTING 2
↓
NIGHT 3
↓
DAY 3
↓
FINAL VOTING
↓
FINAL
```

There are:

```text
3 Nights
3 Days
3 Voting phases
1 Final
```

No fourth Night.

---

# 18. RECOMMENDED GAME LENGTH

Target:

```text
20–25 minutes
```

Suggested:

| Phase | Duration |
|---|---:|
| Lobby + Role Reveal | 2 min |
| Night 1 | 3 min |
| Day 1 + Vote | 3 min |
| Night 2 | 3 min |
| Day 2 + Vote | 3 min |
| Night 3 | 3 min |
| Day 3 + Final Vote | 3 min |
| Final | 3–5 min |

The exact values must be configurable.

---

# 19. NIGHT FLOW

Every Night follows:

```text
NIGHT START
    ↓
KNOWLEDGE QUESTION
    ↓
ANSWER
    ↓
SERVER VALIDATION
    ↓
ABILITY UNLOCK OR CITIZEN STATE
    ↓
ABILITY ACTION
    ↓
SERVER RESOLUTION
    ↓
PRIVATE RESULTS
    ↓
PUBLIC CLUES / EVENTS
    ↓
NIGHT END
```

The Host should not manually control every sub-step.

The server should automatically progress between sub-phases when possible.

---

# 20. NIGHT 1

Theme:

```text
PHÁT HIỆN DẤU HIỆU
```

Educational focus:

- Nhà nước của dân
- cán bộ là công bộc của nhân dân
- trách nhiệm trước nhân dân
- biểu hiện của lợi ích cá nhân

Possible actions:

```text
Investigation
Protection
Clue
Verification
Corruption action
```

At the end, a public clue may appear.

Example:

```text
HỒ SƠ VỤ VIỆC #01

✓ Có dấu hiệu lợi dụng chức vụ
✓ Có yếu tố lợi ích cá nhân
? Người liên quan chưa xác định
```

Do not automatically expose the corruptor.

---

# 21. DAY 1

Host displays:

```text
DAY 1

MANH MỐI ĐÃ PHÁT HIỆN
```

Show public clues.

Players discuss.

Recommended:

```text
90 seconds
```

Then Voting 1.

---

# 22. VOTING 1

Each team submits one vote.

Server validates:

- player belongs to game
- player is eligible to vote
- target exists
- target is eligible
- player has not already voted
- voting phase is active

After voting closes:

```text
CALCULATE VOTES
↓
REVEAL RESULT
↓
UPDATE TRUST
```

---

# 23. NIGHT 2

Theme:

```text
KIỂM SOÁT QUYỀN LỰC
```

Educational focus:

- kiểm tra
- giám sát
- minh bạch
- trách nhiệm
- kiểm soát quyền lực

Questions should become slightly harder.

Public clues may accumulate.

Example:

```text
HỒ SƠ VỤ VIỆC #02

✓ Có dấu hiệu can thiệp
✓ Có dấu hiệu che giấu thông tin
? Chủ thể chưa xác định
```

---

# 24. DAY 2

Show:

```text
DAY 2
NIỀM TIN: XX%
```

Show all public clues collected so far.

Discussion:

```text
90 seconds
```

Then Voting 2.

---

# 25. NIGHT 3

Theme:

```text
NIỀM TIN VÀ TRÁCH NHIỆM
```

Educational focus:

```text
HÀNH VI
↓
TRÁCH NHIỆM
↓
PHÁP LUẬT
↓
NIỀM TIN NHÂN DÂN
```

This is the strongest investigation phase.

Example final clue set:

```text
HỒ SƠ CUỐI

✓ Có lợi ích cá nhân
✓ Có dấu hiệu lợi dụng quyền hạn
✓ Có dấu hiệu che giấu
✓ Một thông tin đã được xác minh
```

---

# 26. DAY 3

This is the final discussion.

Host displays:

```text
FINAL DISCUSSION

AI ĐANG PHÁ VỠ NIỀM TIN?
```

Recommended:

```text
90 seconds
```

Then Final Vote.

---

# 27. FINAL

The Final reveals:

- surviving corruptors
- identified corruptors
- role information
- final Trust
- faction result
- educational conclusion

Host screen:

```text
FINAL

KẾT QUẢ

PHE THAM NHŨNG:
...

PHE BẢO VỆ NIỀM TIN:
...

NIỀM TIN CUỐI:
72%
```

Then:

```text
BÀI HỌC
```

Suggested message:

> Phòng, chống tham nhũng không chỉ là xử lý hành vi sai phạm. Đó còn là minh bạch, kiểm soát quyền lực, trách nhiệm giải trình, thượng tôn pháp luật và bảo vệ niềm tin của nhân dân.

Final MC discussion:

> **“Biết điều đúng và thực sự làm đúng có phải là một chuyện không?”**

---

# 28. TRUST SYSTEM

Initial Trust:

```text
100
```

Trust can change through game events.

Example configuration:

```ts
const TRUST_EVENTS = {
  correctInvestigation: +10,
  correctVote: +15,
  wrongVote: -10,
  corruptionSuccess: -15,
  knowledgeSuccess: +5,
  verifiedClue: +5,
};
```

These values must be configurable.

Only the server can modify Trust.

The client can never send:

```text
trust: 100
```

and expect the server to accept it.

---

# 29. TRUST DISPLAY

Host displays:

```text
NIỀM TIN NHÂN DÂN

████████████████░░░░

72%
```

When Trust changes:

```text
NIỀM TIN +15
```

or:

```text
NIỀM TIN -10
```

Use short animations.

---

# 30. QUESTIONS

Question model:

```ts
type Question = {
  id: string;
  category: string;
  difficulty: "easy" | "medium" | "hard";
  text: string;
  options: string[];
  correctOption: number;
  explanation: string;
};
```

Every question must have an explanation.

---

# 31. QUESTION CATEGORIES

## Category A

Hồ Chí Minh về Nhà nước:

- Nhà nước của dân
- Nhà nước do dân
- Nhà nước vì dân
- quyền làm chủ
- cán bộ là công bộc
- trách nhiệm với nhân dân

## Category B

Xây dựng Đảng:

- trong sạch
- vững mạnh
- tự phê bình
- phê bình
- kiểm tra
- giám sát
- kỷ luật
- kiểm soát quyền lực

## Category C

Phòng chống tham nhũng:

- tham ô
- lãng phí
- lợi dụng chức vụ
- lạm dụng chức vụ
- lợi ích cá nhân
- xung đột lợi ích
- minh bạch
- trách nhiệm giải trình

## Category D

Pháp luật và niềm tin:

- thượng tôn pháp luật
- công bằng
- minh bạch
- trách nhiệm cán bộ
- phòng chống tham nhũng
- niềm tin nhân dân

---

# 32. CLUES

```ts
type Clue = {
  id: string;
  title: string;
  description: string;
  visibility: "public" | "private";
  revealedAt?: number;
};
```

Public clues:

```text
Host
+
all Players
```

Private clues:

```text
only authorized Player
```

---

# 33. PUBLIC VS PRIVATE STATE

This is a critical security requirement.

## Public state

```ts
type PublicGameState = {
  roomId: string;
  phase: GamePhase;
  round: number;
  trust: number;
  timer: number;
  teams: PublicTeam[];
  activeQuestion?: PublicQuestion;
  publicClues: Clue[];
  publicEvents: GameEvent[];
};
```

Public state must NEVER contain:

```text
role
faction
private result
secret target
private ability state
private investigation
```

unless the information has explicitly been revealed.

---

# 34. PRIVATE PLAYER STATE

```ts
type PrivatePlayerState = {
  playerId: string;
  teamId: string;
  role: Role;
  faction: Faction;
  ability?: Ability;
  abilityUnlocked: boolean;
  effectiveState: "SPECIAL" | "CITIZEN";
  privateResults: PrivateResult[];
};
```

Each player receives only their own private state.

Player A must never receive Player B's private state.

---

# 35. HOST CLIENT

There are exactly two client types.

```text
1. HOST
2. PLAYER
```

There is NO separate Display client.

The Host is both:

```text
GAME CONTROLLER
+
PUBLIC PROJECTED SCREEN
```

---

# 36. HOST ROUTES

Suggested:

```text
/host
/host/game
```

Host can:

```text
Create Room
Start Game
Pause
Resume
Skip Timer
Reveal Result
Restart Round
Reset Game
End Game
```

Dangerous actions require confirmation:

```text
RESET GAME
END GAME
```

---

# 37. HOST UI

The Host must look like a game show, not an admin dashboard.

Header:

```text
ĐÊM NIỀM TIN

ROUND 03

NIỀM TIN NHÂN DÂN: 72%

PHASE: NIGHT

01:24
```

Team grid:

```text
ĐỘI 1    ĐỘI 2    ĐỘI 3    ĐỘI 4

ĐỘI 5    ĐỘI 6    ĐỘI 7    ĐỘI 8
```

Only public status.

Never show secret roles during normal gameplay.

---

# 38. PLAYER ROUTES

Suggested:

```text
/player
/player/game
/player/result
```

Player flow:

```text
JOIN
↓
WAITING
↓
ROLE REVEAL
↓
QUESTION
↓
ABILITY / CITIZEN
↓
PRIVATE RESULT
↓
VOTE
↓
WAIT
```

---

# 39. PLAYER ROLE SCREEN

Example:

```text
BẠN LÀ

THANH TRA

PHE:
BẢO VỆ NIỀM TIN

CHỨC NĂNG:
ĐIỀU TRA

Muốn sử dụng chức năng,
bạn phải trả lời đúng câu hỏi.
```

This information is private.

---

# 40. QUESTION SCREEN

Host displays the question.

Players answer on their own phones.

Example:

```text
CÂU HỎI

Theo tư tưởng Hồ Chí Minh,
cán bộ phải có trách nhiệm như thế nào
đối với nhân dân?

A
B
C
D
```

The answer is sent to the server.

---

# 41. CORRECT ANSWER

Player receives:

```text
CHÍNH XÁC!

NĂNG LỰC ĐÃ ĐƯỢC MỞ KHÓA.

Bạn có thể sử dụng:
ĐIỀU TRA
```

Host does NOT receive the player's secret role unless configured.

---

# 42. WRONG ANSWER

Player receives:

```text
CHƯA CHÍNH XÁC.

CHỨC NĂNG BỊ KHÓA.

Đêm này:
BẠN HÀNH ĐỘNG NHƯ CÔNG DÂN.
```

Important:

The player's original role remains unchanged.

Only:

```text
abilityUnlocked = false
effectiveState = CITIZEN
```

---

# 43. ABILITY SCREEN

Example:

```text
ĐIỀU TRA

Chọn một đội:

[ĐỘI 1]
[ĐỘI 2]
[ĐỘI 3]
[ĐỘI 4]
...
```

Server validates:

- current phase
- player's role
- abilityUnlocked
- effectiveState
- target
- action availability

---

# 44. PRIVATE RESULT

Example:

```text
KẾT QUẢ ĐIỀU TRA

ĐỘI 5

CÓ DẤU HIỆU ĐÁNG NGỜ
```

Only the relevant player receives this.

---

# 45. VOTING

Host:

```text
BỎ PHIẾU

AI CẦN ĐƯỢC ĐƯA RA ÁNH SÁNG?
```

Players:

```text
ĐỘI 1
ĐỘI 2
ĐỘI 3
ĐỘI 4
ĐỘI 5
ĐỘI 6
ĐỘI 7
ĐỘI 8
```

Each team has exactly one vote.

Votes are secret.

Host only sees aggregated results after voting closes.

---

# 46. VOTE RESULT

Host:

```text
KẾT QUẢ BỎ PHIẾU

ĐỘI 5
```

Then reveal:

```text
VAI TRÒ:

NGƯỜI VỤ LỢI
```

or:

```text
VAI TRÒ:

THANH TRA
```

depending on the result.

---

# 47. SOCKET EVENTS

## Player → Server

```text
JOIN_ROOM
READY
ANSWER_QUESTION
USE_ABILITY
SELECT_TARGET
SUBMIT_VOTE
```

## Host → Server

```text
CREATE_ROOM
START_GAME
START_PHASE
PAUSE_GAME
RESUME_GAME
SKIP_TIMER
REVEAL_RESULT
RESTART_ROUND
RESET_GAME
END_GAME
```

## Server → Public

```text
ROOM_JOINED
PHASE_CHANGED
QUESTION_STARTED
VOTE_STARTED
VOTE_RESULT
CLUE_REVEALED
TRUST_CHANGED
PLAYER_ELIMINATED
GAME_OVER
```

## Server → Specific Player

```text
ROLE_ASSIGNED
ANSWER_RESULT
ABILITY_UNLOCKED
ACTION_RESULT
PRIVATE_RESULT
```

---

# 48. SERVER AUTHORITATIVE MODEL

Clients send intent.

Example:

```text
USE_ABILITY
```

The client does NOT decide whether the ability is allowed.

Server checks:

```text
Is player authenticated?
Is game active?
Is phase correct?
Does player exist?
Does player have this role?
Did player answer correctly?
Is ability unlocked?
Is player currently a Citizen?
Is target valid?
Has the ability already been used?
```

Only then execute the action.

---

# 49. ZOD VALIDATION

Use Zod for all client-originated payloads.

Example:

```ts
const VoteSchema = z.object({
  targetTeamId: z.string(),
});
```

But Zod validation alone is not sufficient.

Game rules must also be validated by the GameEngine.

---

# 50. GAME ENGINE

All gameplay logic must be outside React.

Suggested:

```text
server/
├── game/
│   ├── GameEngine.ts
│   ├── GameState.ts
│   ├── roles.ts
│   ├── abilities.ts
│   ├── trust.ts
│   ├── questions.ts
│   └── winConditions.ts
```

Example:

```ts
class GameEngine {
  startGame() {}

  startNight() {}

  startKnowledgeChallenge() {}

  answerQuestion() {}

  unlockAbility() {}

  setCitizenState() {}

  useAbility() {}

  resolveNight() {}

  startDay() {}

  startVoting() {}

  submitVote() {}

  closeVoting() {}

  calculateVoteResult() {}

  updateTrust() {}

  nextRound() {}

  checkWinCondition() {}

  finishGame() {}
}
```

---

# 51. GAME STATE MACHINE

Internal state can be:

```text
LOBBY
↓
ROLE_REVEAL
↓
NIGHT_KNOWLEDGE
↓
NIGHT_ABILITY
↓
NIGHT_RESOLUTION
↓
DAY_RESULT
↓
DISCUSSION
↓
VOTING
↓
VOTE_RESULT
↓
TRUST_UPDATE
↓
NEXT_ROUND
```

Public Host labels should remain simple:

```text
LOBBY
NIGHT
DAY
VOTING
FINAL
```

---

# 52. NIGHT STATE RESET

At the beginning of EVERY Night:

```ts
for each player:
  player.abilityUnlocked = false
  player.effectiveState = "SPECIAL"
```

Then the knowledge challenge begins.

After answering:

### Correct

```ts
abilityUnlocked = true
effectiveState = "SPECIAL"
```

### Wrong

```ts
abilityUnlocked = false
effectiveState = "CITIZEN"
```

This reset must happen every Night.

---

# 53. IMPORTANT: CITIZEN IS A TEMPORARY STATE

Citizen is NOT a permanent role.

Correct model:

```text
Permanent Role:
THANH TRA

Current Night:
CITIZEN

Next Night:
THANH TRA
→ answer question
→ potentially SPECIAL again
```

Never store temporary Citizen state as a permanent role.

---

# 54. DATABASE

Use:

```text
MongoDB
```

with:

```text
Mongoose
```

Minimum collections/models:

```text
Room
Game
Player
Team
Question
Action
Vote
Clue
GameEvent
```

Role definitions can be configuration rather than a separate collection.

---

# 55. MONGODB DESIGN

Example Game document:

```ts
{
  roomCode: "NT4821",
  status: "ACTIVE",
  phase: "NIGHT",
  round: 2,
  trust: 78,
  startedAt: Date,
  updatedAt: Date
}
```

Player document:

```ts
{
  gameId,
  teamId,
  sessionTokenHash,
  role,
  faction,
  connected,
  createdAt,
  updatedAt
}
```

Do NOT store plaintext session tokens if avoidable.

---

# 56. ACTIVE GAME STATE

Do not use MongoDB as the real-time game loop.

The architecture is:

```text
Host
  ↕
Socket.IO
  ↕
Node.js GameEngine
  ↕
MongoDB
```

Node.js/GameEngine is the authoritative source of truth during active gameplay.

MongoDB is used for:

- persistence
- recovery
- game history
- player/session information
- questions
- clues
- actions
- votes

Do not write every timer tick to MongoDB.

---

# 57. AUTHENTICATION

No Google Login.

No Facebook Login.

No OAuth.

No user account system.

Use a simple generated player session token.

Flow:

```text
JOIN ROOM
↓
SERVER CREATES PLAYER
↓
SERVER CREATES SESSION TOKEN
↓
CLIENT STORES SESSION
↓
RECONNECT USING SESSION
```

The server maps:

```text
session
↓
player
↓
team
↓
role
```

---

# 58. RECONNECTION

If a player refreshes:

```text
REFRESH
↓
SESSION TOKEN
↓
FIND PLAYER
↓
RECONNECT SOCKET
↓
SEND CURRENT PUBLIC STATE
↓
SEND OWN PRIVATE STATE
```

The player must retain:

- same player ID
- same team
- same role
- same faction

Never assign a new role after refresh.

Never create a duplicate player.

---

# 59. SECURITY TESTS

Mandatory tests:

## Test 1

Player A cannot retrieve Player B's role.

## Test 2

Player A cannot retrieve Player B's private result.

## Test 3

Player cannot modify Trust.

## Test 4

Player cannot use an ability before answering the question.

## Test 5

Player cannot use an ability after answering incorrectly.

## Test 6

Player with `effectiveState = CITIZEN` cannot use special ability.

## Test 7

Ability cannot be used outside its phase.

## Test 8

Player cannot vote twice.

## Test 9

Player cannot vote after voting closes.

## Test 10

Invalid target is rejected.

## Test 11

Player cannot call Host-only commands.

## Test 12

Host public state does not contain secret role data.

## Test 13

Refresh preserves player identity.

## Test 14

Refresh preserves role.

## Test 15

Night reset restores the ability opportunity.

---

# 60. SIMPLE TECH STACK

Use only:

| Layer | Technology |
|---|---|
| Frontend | React + TypeScript |
| Build | Vite |
| Styling | Tailwind CSS |
| Backend | Node.js + Express |
| Real-time | Socket.IO |
| Database | MongoDB |
| ODM | Mongoose |
| Validation | Zod |
| Routing | React Router |
| State | React hooks |
| Testing | Vitest |
| Icons | Lucide React |
| Package manager | npm |
| Version control | Git |

---

# 61. DO NOT OVER-ENGINEER

Do NOT use:

```text
Next.js
Redux
PostgreSQL
Prisma
Redis
Docker
Kubernetes
AWS
Firebase
Supabase
GraphQL
Microservices
OAuth
CI/CD
Terraform
```

unless a concrete later requirement appears.

The objective is:

> **A simple, reliable classroom application that implements the complete game nghiệp vụ.**

---

# 62. PROJECT STRUCTURE

Use a simple single repository:

```text
niem-tin/
│
├── client/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── HostPage.tsx
│   │   │   ├── HostGamePage.tsx
│   │   │   ├── PlayerJoinPage.tsx
│   │   │   └── PlayerGamePage.tsx
│   │   │
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── types/
│   │   └── App.tsx
│   │
│   └── package.json
│
├── server/
│   ├── src/
│   │   ├── game/
│   │   │   ├── GameEngine.ts
│   │   │   ├── GameState.ts
│   │   │   ├── roles.ts
│   │   │   ├── abilities.ts
│   │   │   ├── trust.ts
│   │   │   ├── questions.ts
│   │   │   └── winConditions.ts
│   │   │
│   │   ├── models/
│   │   ├── socket/
│   │   ├── services/
│   │   └── index.ts
│   │
│   └── package.json
│
├── shared/
│   ├── types.ts
│   └── socketEvents.ts
│
├── tests/
│
├── .env.example
├── package.json
└── README.md
```

---

# 63. CLASSROOM DEPLOYMENT

Preferred:

```text
                 LAPTOP
        ┌────────────────────┐
        │ React Frontend     │
        │ Node.js Server     │
        │ MongoDB            │
        └──────────┬─────────┘
                   │
                Wi-Fi
                   │
       ┌───────────┼───────────┐
       ↓           ↓           ↓
    Phone 1     Phone 2     Phone 8
```

Players access:

```text
http://<LOCAL-IP>/player
```

Host:

```text
http://localhost/host
```

The application should be usable on a local network.

---

# 64. HOST EXPERIENCE

The Host must feel like a game show.

Prioritize:

1. Current phase
2. Timer
3. Trust
4. Current question/action
5. Clues
6. Team status
7. Game events

Avoid dense admin tables.

---

# 65. PLAYER EXPERIENCE

Player interface must be mobile-first.

Prioritize:

1. Current task
2. Answer buttons
3. Ability status
4. Private result
5. Vote buttons
6. Timer

Large buttons.

Minimal text.

Clear feedback.

---

# 66. VISUAL STYLE

Suggested:

```text
Dark
Dramatic
Investigation
Justice
Trust
Game-show
```

Visual motifs:

```text
document
shield
eye
scales
magnifying glass
stamp
lock
trust meter
```

Do not make the application look like an actual government investigation system.

It is a fictional educational game.

---

# 67. ANIMATION

Use simple CSS transitions or Framer Motion only if needed.

Important moments:

```text
Role reveal
Question reveal
Correct answer
Wrong answer
Ability unlock
Clue reveal
Vote result
Trust change
Final reveal
```

Keep animations:

```text
150–500ms
```

Do not use long cinematic sequences.

---

# 68. AUDIO

Audio is optional.

If implemented:

```text
question
correct
wrong
clue
vote
reveal
trust up
trust down
final
```

Host must have:

```text
Mute
```

---

# 69. RESPONSIVE DESIGN

Player target:

```text
360px+
```

Host target:

```text
1280×720
1920×1080
```

Host content must remain readable on a projector.

---

# 70. ACCESSIBILITY

Minimum:

- readable contrast
- large controls
- keyboard support for Host
- visible timer
- clear state labels
- do not rely on color alone

For example:

Instead of only:

```text
GREEN
```

display:

```text
CHÍNH XÁC
```

---

# 71. CONFIGURATION

Gameplay values must be configurable.

Example:

```ts
const GAME_CONFIG = {
  teamCount: 8,

  rounds: 3,

  initialTrust: 100,

  nightDuration: 180,

  discussionDuration: 90,

  votingDuration: 45,

  roles: {
    corruptor: 2,
    inspector: 1,
    law: 1,
    whistleblower: 1,
    oversight: 1,
    special6: 1,
    special7: 1,
  },

  trust: {
    correctInvestigation: 10,
    correctVote: 15,
    wrongVote: -10,
    corruptionSuccess: -15,
    knowledgeSuccess: 5,
  },
};
```

---

# 72. WIN CONDITIONS

Do not rely only on Trust.

There are two outcomes:

```text
FACTION RESULT
+
FINAL TRUST
```

Corruption faction succeeds if the configured final identification condition is met.

Trust faction succeeds if the configured identification condition is met.

Trust is an independent game outcome indicator.

Do not automatically define:

```text
Trust > 50 = Trust faction wins
```

unless explicitly configured.

---

# 73. GAME EVENTS

Represent important events explicitly.

Example:

```ts
type GameEvent = {
  id: string;
  type: string;
  message: string;
  timestamp: number;
  visibility: "public" | "private";
  recipientPlayerId?: string;
};
```

Examples:

```text
CLUE_REVEALED
TRUST_CHANGED
PLAYER_ELIMINATED
ABILITY_UNLOCKED
VOTE_RESULT
CORRUPTION_SUCCESS
```

---

# 74. PLAYER ELIMINATION

If the game uses elimination:

- eliminated player cannot perform future special actions
- eliminated player cannot vote
- eliminated player can remain connected as spectator to their own status if desired
- their role can be revealed according to the configured reveal rule

Do not disconnect them automatically unless necessary.

---

# 75. TIMER

Timer must be server-controlled.

Do NOT rely only on:

```ts
setInterval()
```

inside each browser.

Server should store:

```text
phaseStartedAt
phaseEndsAt
```

Clients calculate display time from server timestamps.

This prevents different devices from drifting significantly.

---

# 76. PAUSE / RESUME

Host can pause the game.

When paused:

```text
timer stops
actions stop
```

Resume continues from remaining time.

All clients receive:

```text
GAME_PAUSED
GAME_RESUMED
```

---

# 77. RESET

Host can reset the game.

Reset should:

```text
clear active game state
clear votes
clear actions
clear temporary abilities
reset Trust
reset rounds
reset phase
```

Players should return to a waiting state.

---

# 78. DEVELOPMENT MILESTONES

Do NOT build everything at once.

---

## MILESTONE 1 — PROJECT FOUNDATION

Implement:

```text
React
Vite
Tailwind
Node
Express
Socket.IO
MongoDB
Mongoose
Zod
```

Create basic:

```text
Host page
Player page
Server
MongoDB connection
Socket connection
```

Success condition:

```text
Host connects to server.
Player connects to server.
```

---

# 79. MILESTONE 2 — ROOM SYSTEM

Implement:

```text
Host creates room
↓
Room code generated
↓
Players join
↓
8 teams created
↓
Player session created
```

Success:

```text
8 / 8 connected
```

---

# 80. MILESTONE 3 — SECRET ROLES

Implement:

```text
Role assignment
Faction assignment
Private state
Public state
```

Success:

- each player gets exactly one role
- roles are randomized
- Host does not receive roles
- Player A cannot retrieve Player B role

Write security tests NOW.

---

# 81. MILESTONE 4 — RECONNECTION

Implement:

```text
session token
player reconnect
refresh
restore state
```

Success:

```text
refresh
↓
same player
same team
same role
```

---

# 82. MILESTONE 5 — GAME ENGINE

Implement:

```text
Lobby
Night 1
Day 1
Vote 1
Night 2
Day 2
Vote 2
Night 3
Day 3
Final Vote
Final
```

Do not polish UI yet.

First make the state machine reliable.

---

# 83. MILESTONE 6 — KNOWLEDGE SYSTEM

Implement:

```text
question
answer
validation
correct
wrong
ability unlock
temporary citizen state
```

Test:

```text
correct → ability unlocked
wrong → citizen state
next night → role restored
```

This milestone is critical.

---

# 84. MILESTONE 7 — ABILITIES

Implement:

```text
Corruptor
Inspector
Law
Whistleblower
Oversight
Special 6
Special 7
```

Every ability must:

```text
check role
check phase
check effectiveState
check abilityUnlocked
check target
check usage limit
```

---

# 85. MILESTONE 8 — NIGHT RESOLUTION

Implement:

```text
secret actions
protection
investigation
clues
verification
corruption effects
private results
public events
```

Server resolves actions.

Clients never resolve actions themselves.

---

# 86. MILESTONE 9 — VOTING

Implement:

```text
Vote
Vote validation
Vote close
Vote calculation
Reveal
Elimination
Trust update
```

Test:

```text
double vote rejected
late vote rejected
invalid target rejected
```

---

# 87. MILESTONE 10 — TRUST

Implement:

```text
Trust state
Trust events
Trust history
Host display
```

Trust is server-controlled.

---

# 88. MILESTONE 11 — AUTOMATIC 3-NIGHT FLOW

Implement:

```text
Night 1
↓
Day 1
↓
Night 2
↓
Day 2
↓
Night 3
↓
Day 3
↓
Final
```

The Host should not manually trigger every micro-phase.

Host should only intervene for:

```text
pause
resume
skip
reveal
restart
reset
end
```

---

# 89. MILESTONE 12 — HOST UI

Build game-show interface.

Focus:

```text
Trust
Timer
Phase
Question
Clues
Teams
Events
```

---

# 90. MILESTONE 13 — PLAYER UI

Build:

```text
Join
Waiting
Role
Question
Correct
Wrong
Citizen state
Ability
Private result
Voting
```

Mobile-first.

---

# 91. MILESTONE 14 — FINAL SCREEN

Implement:

```text
Final roles
Final Trust
Faction result
Game statistics
Educational message
MC discussion prompt
```

---

# 92. MILESTONE 15 — FULL TEST

Simulate:

```text
1 Host
8 Players
3 Nights
3 Days
3 Votes
1 Final
```

Verify:

```text
20–25 minutes
```

No manual database editing.

---

# 93. MVP DEFINITION OF DONE

The MVP is complete only when all are true:

- Host creates room.
- 8 players join.
- 8 teams exist.
- 8 special roles are assigned.
- No permanent Citizen roles exist.
- Player sees only their own role.
- Host sees only public state.
- Question system works.
- Correct answer unlocks ability.
- Wrong answer makes player a temporary Citizen.
- Wrong answer does NOT change permanent role.
- Next Night restores the ability opportunity.
- Abilities work.
- Invalid abilities are rejected.
- Private results remain private.
- Clues work.
- Trust works.
- Discussion timer works.
- Voting works.
- Double voting is rejected.
- Late voting is rejected.
- Invalid target is rejected.
- Three Nights work.
- Three Days work.
- Final works.
- Win conditions work.
- Refresh preserves player identity.
- Refresh preserves role.
- Host can pause/resume.
- Host can reset.
- Host can end game.
- Full game can run without manually modifying MongoDB.

---

# 94. NON-GOALS

Do NOT implement for MVP:

```text
Chat
Voice chat
Video
User accounts
Google login
Facebook login
Payment
Leaderboard
Multiple concurrent classrooms
Spectator client
Separate display client
Inventory
Revive system
Complex skill trees
AI-generated questions during gameplay
Microservices
Kubernetes
Cloud infrastructure
```

---

# 95. CODING RULES FOR AI IDE

## Rule 1

Read the current repository before modifying it.

## Rule 2

Do not delete working code without reason.

## Rule 3

Do not rewrite the entire project unnecessarily.

## Rule 4

Game logic belongs in the server.

## Rule 5

React components must not decide game rules.

## Rule 6

The client is never authoritative.

## Rule 7

Public and private state must be separate.

## Rule 8

Never send secret data and rely on frontend hiding it.

If a player should not know it:

> Do not send it to that player.

## Rule 9

Use TypeScript types for all game state.

## Rule 10

Validate Socket.IO payloads using Zod.

## Rule 11

Run tests after every milestone.

## Rule 12

Do not proceed to the next milestone if the current milestone is broken.

---

# 96. FIRST TASK FOR THE AI IDE

The first coding task is ONLY:

```text
Create project
↓
Configure React + Vite
↓
Configure Node + Express
↓
Configure Socket.IO
↓
Configure MongoDB + Mongoose
↓
Host connects
↓
Player connects
```

Do NOT implement:

```text
roles
questions
abilities
voting
trust
animations
```

yet.

---

# 97. SECOND TASK

After the first task passes:

```text
Host creates room
↓
Room code
↓
8 players join
↓
8 teams
↓
8 roles
↓
Private role delivery
↓
Public state delivery
```

Then run security tests.

---

# 98. EXPECTED HOST VIEW

Example:

```text
╔══════════════════════════════════════════╗
║             ĐÊM NIỀM TIN                ║
║                                          ║
║  ROUND 01              NIỀM TIN 100%     ║
║                                          ║
║              NIGHT                       ║
║                                          ║
║             01:42                        ║
║                                          ║
║  ĐỘI 1   ĐỘI 2   ĐỘI 3   ĐỘI 4          ║
║  ĐỘI 5   ĐỘI 6   ĐỘI 7   ĐỘI 8          ║
║                                          ║
║  HỒ SƠ VỤ VIỆC                           ║
║  ✓ Chưa có kết luận                      ║
║                                          ║
╚══════════════════════════════════════════╝
```

---

# 99. EXPECTED PLAYER VIEW

Example:

```text
┌──────────────────────────┐
│       ĐÊM NIỀM TIN       │
│                          │
│       ĐỘI 4              │
│                          │
│       THANH TRA          │
│                          │
│  Trả lời đúng để mở      │
│  khóa chức năng.         │
│                          │
│      [ BẮT ĐẦU ]         │
└──────────────────────────┘
```

After wrong answer:

```text
┌──────────────────────────┐
│     CHƯA CHÍNH XÁC      │
│                          │
│  Chức năng bị khóa.      │
│                          │
│  Đêm này bạn hành động   │
│  như CÔNG DÂN.           │
│                          │
│  Sang đêm tiếp theo,     │
│  bạn sẽ có cơ hội        │
│  mở khóa lại.            │
└──────────────────────────┘
```

---

# 100. FINAL DESIGN PRINCIPLE

The entire application should communicate this idea through mechanics:

```text
        KNOWLEDGE
            ↓
          POWER
            ↓
      RESPONSIBILITY
            ↓
          ACTION
            ↓
       CONSEQUENCE
            ↓
          TRUST
```

The player should **experience** this loop.

Do not merely display it as theory.

The game should make players understand:

> **Quyền lực đi kèm với trách nhiệm; muốn thực hiện quyền hạn phải hiểu đúng nguyên tắc; và việc thực thi đúng, minh bạch, có kiểm soát góp phần củng cố niềm tin.**

---

# END OF MASTERPLAN