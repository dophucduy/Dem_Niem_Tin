import type {
  Ack,
  CreateRoomPayload,
  CreateRoomResult,
  JoinRoomPayload,
  JoinRoomResult,
  HostAuthPayload,
  HostGameCommandResult,
  HostReconnectResult,
  LobbyState,
  PrivatePlayerState,
  PublicGameState,
  ReconnectPayload,
  ReconnectResult,
  SetReadyPayload,
  SetReadyResult,
  ResetGameResult,
} from "./types.js";

export const CLIENT_EVENTS = {
  CONNECTION_CHECK: "connection:check",
  CREATE_ROOM: "room:create",
  JOIN_ROOM: "room:join",
  RECONNECT: "session:reconnect",
  READY: "player:ready",
  ANSWER_QUESTION: "question:answer",
  USE_ABILITY: "ability:use",
  SUBMIT_VOTE: "vote:submit",
  HOST_RECONNECT: "host:reconnect",
  START_GAME: "host:start-game",
  PAUSE_GAME: "host:pause-game",
  RESUME_GAME: "host:resume-game",
  SKIP_TIMER: "host:skip-timer",
  RESTART_ROUND: "host:restart-round",
  RESET_GAME: "host:reset-game",
  END_GAME: "host:end-game",
} as const;

export const SERVER_EVENTS = {
  CONNECTION_READY: "connection:ready",
  LOBBY_UPDATED: "lobby:updated",
  PUBLIC_STATE_UPDATED: "game:public-state",
  PRIVATE_STATE_UPDATED: "game:private-state",
  SESSION_REPLACED: "session:replaced",
  VALIDATION_ERROR: "error:validation",
} as const;

export type ConnectionReadyPayload = {
  clientType: "HOST" | "PLAYER";
  connectedAt: string;
  socketId: string;
};

export interface ClientToServerEvents {
  [CLIENT_EVENTS.CONNECTION_CHECK]: (payload: { clientType: "HOST" | "PLAYER" }) => void;
  [CLIENT_EVENTS.CREATE_ROOM]: (
    payload: CreateRoomPayload,
    acknowledge: (response: Ack<CreateRoomResult>) => void,
  ) => void;
  [CLIENT_EVENTS.JOIN_ROOM]: (
    payload: JoinRoomPayload,
    acknowledge: (response: Ack<JoinRoomResult>) => void,
  ) => void;
  [CLIENT_EVENTS.RECONNECT]: (
    payload: ReconnectPayload,
    acknowledge: (response: Ack<ReconnectResult>) => void,
  ) => void;
  [CLIENT_EVENTS.READY]: (
    payload: SetReadyPayload,
    acknowledge: (response: Ack<SetReadyResult>) => void,
  ) => void;
  [CLIENT_EVENTS.ANSWER_QUESTION]: (
    payload: { playerId: string; questionId: string; answer: string },
    acknowledge: (response: Ack<{ correct: boolean }>) => void,
  ) => void;
  [CLIENT_EVENTS.USE_ABILITY]: (
    payload: { gameId: string; playerId: string; targetId?: string },
    acknowledge: (response: Ack<{ success: boolean }>) => void,
  ) => void;
  [CLIENT_EVENTS.SUBMIT_VOTE]: (
    payload: { gameId: string; round: number; voterId: string; targetId: string },
    acknowledge: (response: Ack<{ success: boolean }>) => void,
  ) => void;
  [CLIENT_EVENTS.HOST_RECONNECT]: (
    payload: HostAuthPayload,
    acknowledge: (response: Ack<HostReconnectResult>) => void,
  ) => void;
  [CLIENT_EVENTS.START_GAME]: (
    payload: HostAuthPayload,
    acknowledge: (response: Ack<HostGameCommandResult>) => void,
  ) => void;
  [CLIENT_EVENTS.PAUSE_GAME]: (
    payload: HostAuthPayload,
    acknowledge: (response: Ack<HostGameCommandResult>) => void,
  ) => void;
  [CLIENT_EVENTS.RESUME_GAME]: (
    payload: HostAuthPayload,
    acknowledge: (response: Ack<HostGameCommandResult>) => void,
  ) => void;
  [CLIENT_EVENTS.SKIP_TIMER]: (
    payload: HostAuthPayload,
    acknowledge: (response: Ack<HostGameCommandResult>) => void,
  ) => void;
  [CLIENT_EVENTS.RESTART_ROUND]: (
    payload: HostAuthPayload,
    acknowledge: (response: Ack<HostGameCommandResult>) => void,
  ) => void;
  [CLIENT_EVENTS.RESET_GAME]: (
    payload: HostAuthPayload,
    acknowledge: (response: Ack<ResetGameResult>) => void,
  ) => void;
  [CLIENT_EVENTS.END_GAME]: (
    payload: HostAuthPayload,
    acknowledge: (response: Ack<HostGameCommandResult>) => void,
  ) => void;
}

export interface ServerToClientEvents {
  [SERVER_EVENTS.CONNECTION_READY]: (payload: ConnectionReadyPayload) => void;
  [SERVER_EVENTS.LOBBY_UPDATED]: (payload: LobbyState) => void;
  [SERVER_EVENTS.PUBLIC_STATE_UPDATED]: (payload: PublicGameState) => void;
  [SERVER_EVENTS.PRIVATE_STATE_UPDATED]: (payload: PrivatePlayerState) => void;
  [SERVER_EVENTS.SESSION_REPLACED]: (payload: { message: string }) => void;
  [SERVER_EVENTS.VALIDATION_ERROR]: (payload: { message: string }) => void;
}
