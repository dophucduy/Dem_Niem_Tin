import type {
  Ack,
  CreateRoomPayload,
  CreateRoomResult,
  JoinRoomPayload,
  JoinRoomResult,
  LobbyState,
  PrivatePlayerState,
  PublicGameState,
  ReconnectPayload,
  ReconnectResult,
  SetReadyPayload,
  SetReadyResult,
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
    acknowledge: (response: Ack<{ correct: boolean }>) => void
  ) => void;
  [CLIENT_EVENTS.USE_ABILITY]: (
    payload: { gameId: string; playerId: string; targetId?: string },
    acknowledge: (response: Ack<{ success: boolean }>) => void
  ) => void;
  [CLIENT_EVENTS.SUBMIT_VOTE]: (
    payload: { gameId: string; round: number; voterId: string; targetId: string },
    acknowledge: (response: Ack<{ success: boolean }>) => void
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
