import { z } from "zod";

export const connectionCheckSchema = z.object({
  clientType: z.enum(["HOST", "PLAYER"]),
});

export const createRoomSchema = z.object({
  hostName: z.string().trim().min(1).max(60).optional(),
});

export const joinRoomSchema = z.object({
  roomCode: z.string().trim().toUpperCase().regex(/^[A-Z0-9]{6}$/),
  displayName: z.string().trim().min(1).max(40),
});

export const reconnectSchema = z.object({
  roomCode: z.string().trim().toUpperCase().regex(/^[A-Z0-9]{6}$/),
  sessionToken: z.string().min(32).max(512),
});

export const setReadySchema = z.object({
  ready: z.boolean(),
});

export const hostAuthSchema = z.object({
  roomCode: z.string().trim().toUpperCase().regex(/^[A-Z0-9]{6}$/),
  hostSessionToken: z.string().min(32).max(512),
});

export const answerQuestionSchema = z.object({
  questionId: z.string().min(1).max(128),
  selectedOption: z.number().int().min(0).max(3),
});

export const useAbilitySchema = z.object({
  targetTeamId: z.string().regex(/^[a-f\d]{24}$/i).optional(),
});

export const submitVoteSchema = z.object({
  targetTeamId: z.string().regex(/^[a-f\d]{24}$/i),
});
