import {
  CLIENT_EVENTS,
  SERVER_EVENTS,
  type ClientType,
  type ClientToServerEvents,
  type ConnectionReadyPayload,
  type ServerToClientEvents,
} from "@dem-niem-tin/shared";
import type { Server, Socket } from "socket.io";
import { connectionCheckSchema } from "../validation/socketSchemas.js";

type GameServer = Server<ClientToServerEvents, ServerToClientEvents>;
type GameSocket = Socket<ClientToServerEvents, ServerToClientEvents>;

export function registerSocketHandlers(io: GameServer): void {
  io.on("connection", (socket: GameSocket) => {
    console.log(`Socket connected: ${socket.id}`);

    socket.on(CLIENT_EVENTS.CONNECTION_CHECK, (rawPayload) => {
      const parsed = connectionCheckSchema.safeParse(rawPayload);
      if (!parsed.success) {
        socket.emit(SERVER_EVENTS.VALIDATION_ERROR, { message: "Invalid connection payload" });
        return;
      }

      const clientType: ClientType = parsed.data.clientType;
      const payload: ConnectionReadyPayload = {
        clientType,
        connectedAt: new Date().toISOString(),
        socketId: socket.id,
      };

      socket.emit(SERVER_EVENTS.CONNECTION_READY, payload);
    });

    socket.on("disconnect", (reason) => {
      console.log(`Socket disconnected: ${socket.id} (${reason})`);
    });
  });
}
