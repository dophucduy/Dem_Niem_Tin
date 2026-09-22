import {
  CLIENT_EVENTS,
  SERVER_EVENTS,
  type ClientToServerEvents,
  type ServerToClientEvents,
} from "@dem-niem-tin/shared";
import type { Server, Socket } from "socket.io";
import { ServiceError } from "../services/errors.js";
import { RoomService } from "../services/roomService.js";
import {
  createRoomSchema,
  joinRoomSchema,
  reconnectSchema,
  setReadySchema,
} from "../validation/socketSchemas.js";
import { failure, validationFailure } from "./acknowledgement.js";

export type SocketIdentity = {
  clientType?: "HOST" | "PLAYER";
  roomId?: string;
  playerId?: string;
};

type GameServer = Server<ClientToServerEvents, ServerToClientEvents, Record<string, never>, SocketIdentity>;
type GameSocket = Socket<ClientToServerEvents, ServerToClientEvents, Record<string, never>, SocketIdentity>;

const roomChannel = (roomId: string) => `room:${roomId}`;

function serviceFailure(error: unknown) {
  if (error instanceof ServiceError) return failure(error.code, error.message);
  console.error("Unexpected lobby error", error);
  return failure("INTERNAL_ERROR", "Unexpected server error");
}

export function registerLobbyHandlers(
  io: GameServer,
  socket: GameSocket,
  roomService: RoomService,
): void {
  socket.on(CLIENT_EVENTS.CREATE_ROOM, async (rawPayload, acknowledge) => {
    const parsed = createRoomSchema.safeParse(rawPayload);
    if (!parsed.success) return acknowledge(validationFailure(parsed.error));

    try {
      const created = await roomService.createRoom(parsed.data.hostName);
      socket.data = { clientType: "HOST", roomId: created.roomId };
      await socket.join(roomChannel(created.roomId));
      acknowledge({
        ok: true,
        data: { room: created.lobby, hostSessionToken: created.sessionToken },
      });
      io.to(roomChannel(created.roomId)).emit(SERVER_EVENTS.LOBBY_UPDATED, created.lobby);
    } catch (error) {
      acknowledge(serviceFailure(error));
    }
  });

  socket.on(CLIENT_EVENTS.JOIN_ROOM, async (rawPayload, acknowledge) => {
    const parsed = joinRoomSchema.safeParse(rawPayload);
    if (!parsed.success) return acknowledge(validationFailure(parsed.error));

    try {
      const joined = await roomService.joinRoom({ ...parsed.data, socketId: socket.id });
      socket.data = { clientType: "PLAYER", roomId: joined.roomId, playerId: joined.playerId };
      await socket.join(roomChannel(joined.roomId));
      acknowledge({
        ok: true,
        data: {
          room: joined.lobby,
          playerId: joined.playerId,
          teamId: joined.teamId,
          sessionToken: joined.sessionToken,
        },
      });
      io.to(roomChannel(joined.roomId)).emit(SERVER_EVENTS.LOBBY_UPDATED, joined.lobby);
    } catch (error) {
      acknowledge(serviceFailure(error));
    }
  });

  socket.on(CLIENT_EVENTS.RECONNECT, async (rawPayload, acknowledge) => {
    const parsed = reconnectSchema.safeParse(rawPayload);
    if (!parsed.success) return acknowledge(validationFailure(parsed.error));

    try {
      const reconnected = await roomService.reconnect({ ...parsed.data, socketId: socket.id });
      if (reconnected.replacedSocketId) {
        const replacedSocket = io.sockets.sockets.get(reconnected.replacedSocketId);
        replacedSocket?.emit(SERVER_EVENTS.SESSION_REPLACED, {
          message: "This player session reconnected on another socket",
        });
        replacedSocket?.disconnect(true);
      }

      socket.data = {
        clientType: "PLAYER",
        roomId: reconnected.roomId,
        playerId: reconnected.playerId,
      };
      await socket.join(roomChannel(reconnected.roomId));
      acknowledge({
        ok: true,
        data: {
          room: reconnected.lobby,
          playerId: reconnected.playerId,
          teamId: reconnected.teamId,
        },
      });
      io.to(roomChannel(reconnected.roomId)).emit(SERVER_EVENTS.LOBBY_UPDATED, reconnected.lobby);
    } catch (error) {
      acknowledge(serviceFailure(error));
    }
  });

  socket.on(CLIENT_EVENTS.READY, async (rawPayload, acknowledge) => {
    const parsed = setReadySchema.safeParse(rawPayload);
    if (!parsed.success) return acknowledge(validationFailure(parsed.error));
    if (!socket.data.roomId || !socket.data.playerId) {
      return acknowledge(failure("UNAUTHORIZED", "Reconnect or join before changing ready state"));
    }

    try {
      const lobby = await roomService.setReady(socket.data.roomId, socket.data.playerId, parsed.data.ready);
      acknowledge({ ok: true, data: { room: lobby } });
      io.to(roomChannel(socket.data.roomId)).emit(SERVER_EVENTS.LOBBY_UPDATED, lobby);
    } catch (error) {
      acknowledge(serviceFailure(error));
    }
  });
}
