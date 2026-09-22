import { z } from "zod";

export const connectionCheckSchema = z.object({
  clientType: z.enum(["HOST", "PLAYER"]),
});

export const createRoomSchema = z.object({
  hostName: z.string().trim().min(1).max(60).optional(),
});

export const joinRoomSchema = z.object({
  roomCode: z.string().trim().toUpperCase().regex(/^[A-Z0-9]{6}$/),
  teamNumber: z.number().int().min(1).max(8),
  displayName: z.string().trim().min(1).max(40).optional(),
});

export const reconnectSchema = z.object({
  roomCode: z.string().trim().toUpperCase().regex(/^[A-Z0-9]{6}$/),
  sessionToken: z.string().min(32).max(512),
});
