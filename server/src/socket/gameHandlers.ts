import {
  CLIENT_EVENTS,
  SERVER_EVENTS,
  type ClientToServerEvents,
  type ServerToClientEvents,
  type GamePhase,
  type ReactionType,
  type TeamReaction,
  type ReactionSummary,
} from "@dem-niem-tin/shared";
import type { Server, Socket } from "socket.io";
import { ServiceError } from "../services/errors.js";
import { GameRuntimeService } from "../services/gameRuntimeService.js";
import { answerQuestionSchema, submitVoteSchema, useAbilitySchema, sendReactionSchema } from "../validation/socketSchemas.js";
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

// ── In-memory reaction store (per room) ──────────────────────────────
const roomReactions = new Map<string, TeamReaction[]>();
// Rate-limit: 1 reaction per team every 3 seconds
const lastReactionTime = new Map<string, number>();
const REACTION_COOLDOWN_MS = 3_000;
const MAX_REACTIONS_PER_ROOM = 200;

function buildReactionSummary(roomId: string): ReactionSummary {
  const reactions = roomReactions.get(roomId) || [];
  const summary: ReactionSummary = {
    AGREE: 0,
    SUSPECT: 0,
    OBJECT: 0,
    QUESTION: 0,
    reactions,
  };
  for (const r of reactions) {
    summary[r.reaction] += 1;
  }
  return summary;
}

/** Drop a room's reaction store and its rate-limit entries. */
export function clearRoomReactions(roomId: string): void {
  roomReactions.delete(roomId);
  // Also clear rate-limit entries for this room
  for (const key of lastReactionTime.keys()) {
    if (key.startsWith(roomId + ":")) lastReactionTime.delete(key);
  }
}

// Tracks the phase each room was last seen in, so resets only run on real phase changes.
const roomPhase = new Map<string, GamePhase>();

/**
 * Reactions only live inside the phase they were sent in. Every phase change wipes a
 * room's reaction store, so each round's DISCUSSION starts from zero; entering
 * DISCUSSION also broadcasts the empty summary to everyone in the room.
 */
export function syncReactionsWithPhase(io: GameServer, roomId: string, phase: GamePhase): void {
  if (roomPhase.get(roomId) === phase) return; // pause/resume refreshes stay in-phase
  roomPhase.set(roomId, phase);
  clearRoomReactions(roomId);
  if (phase === "DISCUSSION") {
    io.to(`room:${roomId}`).emit(SERVER_EVENTS.REACTIONS_UPDATED, buildReactionSummary(roomId));
  }
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

  // ── Reaction Handler ─────────────────────────────────────────────
  socket.on(CLIENT_EVENTS.SEND_REACTION, async (rawPayload, acknowledge) => {
    const parsed = sendReactionSchema.safeParse(rawPayload);
    if (!parsed.success) return acknowledge(validationFailure(parsed.error));
    try {
      const identity = playerIdentity(socket);
      const roomId = identity.roomId;

      // Rate-limit per team
      const rateKey = `${roomId}:${identity.playerId}`;
      const now = Date.now();
      const lastTime = lastReactionTime.get(rateKey) || 0;
      if (now - lastTime < REACTION_COOLDOWN_MS) {
        return acknowledge(failure("CONFLICT", "Vui lòng đợi vài giây trước khi gửi phản ứng tiếp."));
      }
      lastReactionTime.set(rateKey, now);

      // Find team info from socket data
      const teamNumber = (socket.data as any).teamNumber || 0;
      const displayName = (socket.data as any).displayName || `Đội ${teamNumber}`;

      // Store reaction
      if (!roomReactions.has(roomId)) roomReactions.set(roomId, []);
      const reactions = roomReactions.get(roomId)!;
      // Cap stored reactions
      if (reactions.length >= MAX_REACTIONS_PER_ROOM) reactions.shift();
      reactions.push({
        teamNumber,
        displayName,
        reaction: parsed.data.reaction as ReactionType,
        timestamp: now,
      });

      // Broadcast summary to entire room
      const summary = buildReactionSummary(roomId);
      _io.to(`room:${roomId}`).emit(SERVER_EVENTS.REACTIONS_UPDATED, summary);

      acknowledge({ ok: true, data: { accepted: true } });
    } catch (error) {
      acknowledge(serviceFailure(error));
    }
  });
}
