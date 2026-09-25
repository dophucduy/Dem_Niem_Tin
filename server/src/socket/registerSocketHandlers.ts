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
import { GameRuntimeService } from "../services/gameRuntimeService.js";
import { connectionCheckSchema } from "../validation/socketSchemas.js";
import { registerLobbyHandlers, type SocketIdentity } from "./registerLobbyHandlers.js";
import { registerGameHandlers, syncReactionsWithPhase } from "./gameHandlers.js";
import { registerHostGameHandlers } from "./registerHostGameHandlers.js";

type GameServer = Server<ClientToServerEvents, ServerToClientEvents, Record<string, never>, SocketIdentity>;
type GameSocket = Socket<ClientToServerEvents, ServerToClientEvents, Record<string, never>, SocketIdentity>;

const roomService = new RoomService();

export function registerSocketHandlers(io: GameServer): void {
  const publishPrivateStates = async (roomId: string, runtime: GameRuntimeService) => {
    const sockets = await io.in(`room:${roomId}`).fetchSockets();
    await Promise.all(
      sockets.map(async (connectedSocket) => {
        if (connectedSocket.data.clientType !== "PLAYER" || !connectedSocket.data.playerId) return;
        const privateState = await runtime.getPrivateState(roomId, connectedSocket.data.playerId);
        if (privateState) connectedSocket.emit(SERVER_EVENTS.PRIVATE_STATE_UPDATED, privateState);
      }),
    );
  };
  let gameRuntimeService: GameRuntimeService;
  gameRuntimeService = new GameRuntimeService(roomService, (roomId, state) => {
    io.to(`room:${roomId}`).emit(SERVER_EVENTS.PUBLIC_STATE_UPDATED, state);
  }, {
    onPhaseChanged: (roomId, state) => {
      syncReactionsWithPhase(io, roomId, state.phase);
      return publishPrivateStates(roomId, gameRuntimeService);
    },
  });

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

    registerLobbyHandlers(io, socket, roomService, gameRuntimeService);
    registerHostGameHandlers(io, socket, roomService, gameRuntimeService);

    socket.on("disconnect", async (reason) => {
      console.log(`Socket disconnected: ${socket.id} (${reason})`);
      try {
        const lobby = await roomService.disconnect(socket.id);
        if (lobby) io.to(`room:${lobby.roomId}`).emit(SERVER_EVENTS.LOBBY_UPDATED, lobby);
      } catch (error) {
        console.error("Failed to update disconnected player", error);
      }
    });

    registerGameHandlers(io, socket, gameRuntimeService);
  });
}
