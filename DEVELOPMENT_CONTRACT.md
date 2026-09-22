# Development Contract

This file defines the boundaries the three developers must share. Import contracts from `@dem-niem-tin/shared`; do not duplicate them in the client or server.

## Dev 2 — Gameplay Backend

- Use `Role`, `Faction`, `EffectiveState`, `GamePhase`, `PrivatePlayerState`, and `ROLE_DISTRIBUTION` from the shared package.
- `CITIZEN` is only an `EffectiveState`; it must never be added to `Role`.
- Keep role, faction, session token hashes, targets, and private results out of public DTOs.
- Extend server gameplay code without placing rules in socket handlers.
- Return private information only through `PRIVATE_STATE_UPDATED` to the authorized player's socket.
- Add new client payload validation under `server/src/validation`.

## Dev 3 — Host and Player Frontend

- Use the typed socket exported by `client/src/services/socket.ts`.
- Use `CLIENT_EVENTS` and `SERVER_EVENTS`; do not hard-code event strings.
- Use `LobbyState` for Join/Lobby/Waiting UI.
- Use `PublicGameState` for Host and public Player displays.
- Use `PrivatePlayerState` only for the current Player's private screen.
- Store session tokens locally, but never put them in React-rendered public state or logs.
- The client sends intent only; it must not calculate roles, voting results, Trust, or ability permission.

## Shared acknowledgement pattern

Every request/response socket event uses:

```ts
type Ack<T> =
  | { ok: true; data: T }
  | { ok: false; error: { code: ApiErrorCode; message: string } };
```

Handle `ok === false` explicitly in the UI. Do not infer errors from timeouts alone.

## Current events available

### Client to server

- `connection:check`
- `room:create`
- `room:join`
- `session:reconnect`
- `player:ready`
- `question:answer`
- `ability:use`
- `vote:submit`

### Server to client

- `connection:ready`
- `lobby:updated`
- `game:public-state`
- `game:private-state`
- `session:replaced`
- `error:validation`

Room creation, joining, reconnection, disconnect presence, and ready-state handlers are implemented. Frontend work can consume them directly; gameplay work can attach role assignment after the lobby reaches 8/8.

## GameEngine boundary

- The server-only engine lives in `server/src/game`.
- Dev 2 should call role assignment when `startGame()` succeeds and reset per-night ability state when the engine enters `NIGHT_KNOWLEDGE`.
- Do not put role or ability resolution inside `GameEngine`; inject gameplay work around phase transitions.
- The Host UI should display server timestamps from snapshots and must not advance phases locally.
