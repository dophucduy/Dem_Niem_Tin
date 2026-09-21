export const CLIENT_EVENTS = {
  CONNECTION_CHECK: "connection:check",
} as const;

export const SERVER_EVENTS = {
  CONNECTION_READY: "connection:ready",
} as const;

export type ConnectionReadyPayload = {
  clientType: "HOST" | "PLAYER";
  connectedAt: string;
  socketId: string;
};
