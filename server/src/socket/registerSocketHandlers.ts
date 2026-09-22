import {
  CLIENT_EVENTS,
  SERVER_EVENTS,
  type ClientType,
  type ClientToServerEvents,
  type ConnectionReadyPayload,
  type ServerToClientEvents,
} from "@dem-niem-tin/shared";
import type { Server, Socket } from "socket.io";
import { RoomService } from "../services/roomService.js";
import { connectionCheckSchema } from "../validation/socketSchemas.js";
import { registerLobbyHandlers, type SocketIdentity } from "./registerLobbyHandlers.js";
import { registerGameHandlers } from "./gameHandlers.js";

type GameServer = Server<ClientToServerEvents, ServerToClientEvents, Record<string, never>, SocketIdentity>;
type GameSocket = Socket<ClientToServerEvents, ServerToClientEvents, Record<string, never>, SocketIdentity>;

const roomService = new RoomService();

export function registerSocketHandlers(io: GameServer): void {
  io.on("connection", (socket: GameSocket) => {
    console.log(`Socket connected: ${socket.id}`);

    socket.on(CLIENT_EVENTS.CONNECTION_CHECK, (rawPayload: any) => {
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

    registerLobbyHandlers(io, socket, roomService);

    socket.on("disconnect", async (reason) => {
      console.log(`Socket disconnected: ${socket.id} (${reason})`);
      try {
        const lobby = await roomService.disconnect(socket.id);
        if (lobby) io.to(`room:${lobby.roomId}`).emit(SERVER_EVENTS.LOBBY_UPDATED, lobby);
      } catch (error) {
        console.error("Failed to update disconnected player", error);
      }
    });

    registerGameHandlers(io, socket);
  });
}
