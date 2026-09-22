import type { Server, Socket } from "socket.io";
import { CLIENT_EVENTS, type ClientToServerEvents, type ServerToClientEvents } from "@dem-niem-tin/shared";
import { submitAnswer } from "../services/knowledgeService.js";
import { submitVote } from "../services/votingService.js";

type GameServer = Server<ClientToServerEvents, ServerToClientEvents>;
type GameSocket = Socket<ClientToServerEvents, ServerToClientEvents>;

export function registerGameHandlers(io: GameServer, socket: GameSocket): void {
  socket.on(CLIENT_EVENTS.ANSWER_QUESTION, async (payload: any, acknowledge: any) => {
    try {
      const isCorrect = await submitAnswer(payload.playerId, payload.questionId, payload.answer);
      acknowledge({ ok: true, data: { correct: isCorrect } });
    } catch (error: any) {
      console.error("Error answering question:", error);
      acknowledge({ ok: false, error: { code: "INTERNAL_ERROR", message: error.message } });
    }
  });

  socket.on(CLIENT_EVENTS.SUBMIT_VOTE, async (payload: any, acknowledge: any) => {
    try {
      await submitVote(payload.gameId, payload.round, payload.voterId, payload.targetId);
      acknowledge({ ok: true, data: { success: true } });
    } catch (error: any) {
      console.error("Error submitting vote:", error);
      acknowledge({ ok: false, error: { code: "INTERNAL_ERROR", message: error.message } });
    }
  });
}
