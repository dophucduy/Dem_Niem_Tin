import {
  CLIENT_EVENTS,
  SERVER_EVENTS,
  type ClientType,
  type ConnectionReadyPayload,
} from "@dem-niem-tin/shared";
import type { Server, Socket } from "socket.io";
import { z } from "zod";

const connectionCheckSchema = z.object({
  clientType: z.enum(["HOST", "PLAYER"]),
});

export function registerSocketHandlers(io: Server): void {
  io.on("connection", (socket: Socket) => {
    console.log(`Socket connected: ${socket.id}`);

    socket.on(CLIENT_EVENTS.CONNECTION_CHECK, (rawPayload: unknown) => {
      const parsed = connectionCheckSchema.safeParse(rawPayload);
      if (!parsed.success) {
        socket.emit("error:validation", { message: "Invalid connection payload" });
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
