import {
  CLIENT_EVENTS,
  SERVER_EVENTS,
  type ClientToServerEvents,
  type ServerToClientEvents,
} from "@dem-niem-tin/shared";
import type { Server, Socket } from "socket.io";
import { ServiceError } from "../services/errors.js";
import { GameRuntimeService } from "../services/gameRuntimeService.js";
import { answerQuestionSchema, submitVoteSchema, useAbilitySchema } from "../validation/socketSchemas.js";
import { failure, validationFailure } from "./acknowledgement.js";
import type { SocketIdentity } from "./registerLobbyHandlers.js";

type GameServer = Server<ClientToServerEvents, ServerToClientEvents, Record<string, never>, SocketIdentity>;
type GameSocket = Socket<ClientToServerEvents, ServerToClientEvents, Record<string, never>, SocketIdentity>;

function serviceFailure(error: unknown) {
  if (error instanceof ServiceError) return failure(error.code, error.message);
  console.error("Unexpected gameplay error", error);
  return failure("INTERNAL_ERROR", "Unexpected server error");
}

function playerIdentity(socket: GameSocket) {
  if (socket.data.clientType !== "PLAYER" || !socket.data.roomId || !socket.data.playerId) {
    throw new ServiceError("UNAUTHORIZED", "Join or reconnect as a player first");
  }
  return { roomId: socket.data.roomId, playerId: socket.data.playerId };
}

export function registerGameHandlers(
  _io: GameServer,
  socket: GameSocket,
  runtime: GameRuntimeService,
): void {
  socket.on(CLIENT_EVENTS.ANSWER_QUESTION, async (rawPayload, acknowledge) => {
    const parsed = answerQuestionSchema.safeParse(rawPayload);
    if (!parsed.success) return acknowledge(validationFailure(parsed.error));
    try {
      const identity = playerIdentity(socket);
      const result = await runtime.answerQuestion(identity.roomId, identity.playerId, parsed.data);
      socket.emit(SERVER_EVENTS.PRIVATE_STATE_UPDATED, result.privateState);
      acknowledge({ ok: true, data: result });
    } catch (error) {
      acknowledge(serviceFailure(error));
    }
  });

  socket.on(CLIENT_EVENTS.USE_ABILITY, async (rawPayload, acknowledge) => {
    const parsed = useAbilitySchema.safeParse(rawPayload);
    if (!parsed.success) return acknowledge(validationFailure(parsed.error));
    try {
      const identity = playerIdentity(socket);
      await runtime.useAbility(identity.roomId, identity.playerId, parsed.data);
      acknowledge({ ok: true, data: { accepted: true } });
    } catch (error) {
      acknowledge(serviceFailure(error));
    }
  });

  socket.on(CLIENT_EVENTS.SUBMIT_VOTE, async (rawPayload, acknowledge) => {
    const parsed = submitVoteSchema.safeParse(rawPayload);
    if (!parsed.success) return acknowledge(validationFailure(parsed.error));
    try {
      const identity = playerIdentity(socket);
      await runtime.submitVote(identity.roomId, identity.playerId, parsed.data);
      acknowledge({ ok: true, data: { accepted: true } });
    } catch (error) {
      acknowledge(serviceFailure(error));
    }
  });
}
