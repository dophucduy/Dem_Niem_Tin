import {
  CLIENT_EVENTS,
  SERVER_EVENTS,
  type Ack,
  type ClientToServerEvents,
  type HostGameCommandResult,
  type HostReconnectResult,
  type ResetGameResult,
  type ServerToClientEvents,
} from "@dem-niem-tin/shared";
import type { Server, Socket } from "socket.io";
import { ServiceError } from "../services/errors.js";
import { GameRuntimeService } from "../services/gameRuntimeService.js";
import { RoomService } from "../services/roomService.js";
import { hostAuthSchema } from "../validation/socketSchemas.js";
import { failure, validationFailure } from "./acknowledgement.js";
import type { SocketIdentity } from "./registerLobbyHandlers.js";

type GameServer = Server<ClientToServerEvents, ServerToClientEvents, Record<string, never>, SocketIdentity>;
type GameSocket = Socket<ClientToServerEvents, ServerToClientEvents, Record<string, never>, SocketIdentity>;
type GameCommandAck = (response: Ack<HostGameCommandResult>) => void;

const roomChannel = (roomId: string) => `room:${roomId}`;

function serviceFailure(error: unknown) {
  if (error instanceof ServiceError) return failure(error.code, error.message);
  console.error("Unexpected host game error", error);
  return failure("INTERNAL_ERROR", "Unexpected server error");
}

export function registerHostGameHandlers(
  io: GameServer,
  socket: GameSocket,
  roomService: RoomService,
  runtimeService: GameRuntimeService,
): void {
  socket.on(CLIENT_EVENTS.HOST_RECONNECT, async (rawPayload, acknowledge) => {
    const parsed = hostAuthSchema.safeParse(rawPayload);
    if (!parsed.success) return acknowledge(validationFailure(parsed.error));

    try {
      const room = await runtimeService.authenticateHost(
        parsed.data.roomCode,
        parsed.data.hostSessionToken,
      );
      const roomId = room._id.toString();
      socket.data = { clientType: "HOST", roomId };
      await socket.join(roomChannel(roomId));
      const response: HostReconnectResult = {
        room: await roomService.getLobby(roomId),
        publicState: await runtimeService.reconnectHost(roomId),
      };
      acknowledge({ ok: true, data: response });
    } catch (error) {
      acknowledge(serviceFailure(error));
    }
  });

  const runCommand = async (
    rawPayload: unknown,
    acknowledge: GameCommandAck,
    command: (roomId: string) => Promise<HostGameCommandResult["publicState"]>,
  ) => {
    const parsed = hostAuthSchema.safeParse(rawPayload);
    if (!parsed.success) return acknowledge(validationFailure(parsed.error));

    try {
      const room = await runtimeService.authenticateHost(
        parsed.data.roomCode,
        parsed.data.hostSessionToken,
      );
      const roomId = room._id.toString();
      socket.data = { clientType: "HOST", roomId };
      await socket.join(roomChannel(roomId));
      const publicState = await command(roomId);
      acknowledge({ ok: true, data: { publicState } });
    } catch (error) {
      acknowledge(serviceFailure(error));
    }
  };

  socket.on(CLIENT_EVENTS.START_GAME, (payload, acknowledge) =>
    void runCommand(payload, acknowledge, async (roomId) => {
      const state = await runtimeService.startGame(roomId);
      io.to(roomChannel(roomId)).emit(SERVER_EVENTS.PUBLIC_STATE_UPDATED, state);
      return state;
    }),
  );
  socket.on(CLIENT_EVENTS.PAUSE_GAME, (payload, acknowledge) =>
    void runCommand(payload, acknowledge, (roomId) => runtimeService.pause(roomId)),
  );
  socket.on(CLIENT_EVENTS.RESUME_GAME, (payload, acknowledge) =>
    void runCommand(payload, acknowledge, (roomId) => runtimeService.resume(roomId)),
  );
  socket.on(CLIENT_EVENTS.SKIP_TIMER, (payload, acknowledge) =>
    void runCommand(payload, acknowledge, (roomId) => runtimeService.skipTimer(roomId)),
  );
  socket.on(CLIENT_EVENTS.RESTART_ROUND, (payload, acknowledge) =>
    void runCommand(payload, acknowledge, (roomId) => runtimeService.restartRound(roomId)),
  );
  socket.on(CLIENT_EVENTS.END_GAME, (payload, acknowledge) =>
    void runCommand(payload, acknowledge, (roomId) => runtimeService.endGame(roomId)),
  );

  socket.on(CLIENT_EVENTS.RESET_GAME, async (rawPayload, acknowledge) => {
    const parsed = hostAuthSchema.safeParse(rawPayload);
    if (!parsed.success) return acknowledge(validationFailure(parsed.error));

    try {
      const room = await runtimeService.authenticateHost(
        parsed.data.roomCode,
        parsed.data.hostSessionToken,
      );
      const roomId = room._id.toString();
      const lobby = await runtimeService.resetGame(roomId);
      const response: ResetGameResult = { room: lobby };
      acknowledge({ ok: true, data: response });
      io.to(roomChannel(roomId)).emit(SERVER_EVENTS.LOBBY_UPDATED, lobby);
    } catch (error) {
      acknowledge(serviceFailure(error));
    }
  });
}
