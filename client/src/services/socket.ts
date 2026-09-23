import type { ClientToServerEvents, ServerToClientEvents } from "@dem-niem-tin/shared";
import { io, type Socket } from "socket.io-client";

export const serverUrl = import.meta.env.VITE_SERVER_URL ?? "http://localhost:3000";

export const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(serverUrl, {
  autoConnect: false,
  transports: ["websocket", "polling"],
});
