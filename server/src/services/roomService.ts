import { GAME_CONFIG, type LobbyState, type RoomStatus } from "@dem-niem-tin/shared";
import { Types } from "mongoose";
import { PlayerModel, RoomModel, TeamModel, type RoomDocument, type TeamDocument, type PlayerDocument } from "../models/index.js";
import { ServiceError } from "./errors.js";
import { createRoomCode } from "./roomCode.js";
import { createSessionToken, hashSessionToken } from "./session.js";

type RoomSession = {
  roomId: string;
  roomCode: string;
  sessionToken: string;
};

type PlayerSession = RoomSession & {
  playerId: string;
  teamId: string;
  replacedSocketId?: string;
};

function isDuplicateKeyError(error: unknown): boolean {
  return typeof error === "object" && error !== null && "code" in error && error.code === 11000;
}

export class RoomService {
  async createRoom(hostName?: string): Promise<RoomSession & { lobby: LobbyState }> {
    for (let attempt = 0; attempt < 5; attempt += 1) {
      const roomCode = createRoomCode();
      const sessionToken = createSessionToken();
      let roomId: Types.ObjectId | undefined;

      try {
        const room = await RoomModel.create({
          roomCode,
          hostName,
          hostSessionTokenHash: hashSessionToken(sessionToken),
        });
        const createdRoomId = room._id;
        roomId = createdRoomId;

        await TeamModel.insertMany(
          Array.from({ length: GAME_CONFIG.teamCount }, (_, index) => ({
            roomId: createdRoomId,
            teamNumber: index + 1,
            displayName: `ĐỘI ${index + 1}`,
          })),
        );

        return {
          roomId: createdRoomId.toString(),
          roomCode,
          sessionToken,
          lobby: await this.getLobby(createdRoomId),
        };
      } catch (error) {
        if (roomId) {
          await Promise.all([RoomModel.deleteOne({ _id: roomId }), TeamModel.deleteMany({ roomId })]);
        }
        if (!isDuplicateKeyError(error)) throw error;
      }
    }

    throw new ServiceError("CONFLICT", "Could not generate a unique room code");
  }

  async joinRoom(input: {
    roomCode: string;
    teamNumber: number;
    displayName?: string;
    socketId: string;
  }): Promise<PlayerSession & { lobby: LobbyState }> {
    const room = await RoomModel.findOne({ roomCode: input.roomCode, status: "LOBBY" });
    if (!room) throw new ServiceError("ROOM_NOT_FOUND", "Room not found or no longer joinable");

    const playerCount = await PlayerModel.countDocuments({ roomId: room._id });
    if (playerCount >= GAME_CONFIG.teamCount) {
      throw new ServiceError("ROOM_FULL", "Room already has eight players");
    }

    const team = await TeamModel.findOne({ roomId: room._id, teamNumber: input.teamNumber });
    if (!team) throw new ServiceError("TEAM_UNAVAILABLE", "Selected team does not exist");

    const sessionToken = createSessionToken();
    try {
      const player = await PlayerModel.create({
        roomId: room._id,
        teamId: team._id,
        sessionTokenHash: hashSessionToken(sessionToken),
        connected: true,
        socketId: input.socketId,
      });

      if (input.displayName) {
        team.displayName = input.displayName;
        await team.save();
      }

      return {
        roomId: room._id.toString(),
        roomCode: room.roomCode,
        sessionToken,
        playerId: player._id.toString(),
        teamId: team._id.toString(),
        lobby: await this.getLobby(room._id),
      };
    } catch (error) {
      if (isDuplicateKeyError(error)) {
        throw new ServiceError("TEAM_UNAVAILABLE", "Selected team is already occupied");
      }
      throw error;
    }
  }

  async reconnect(input: {
    roomCode: string;
    sessionToken: string;
    socketId: string;
  }): Promise<PlayerSession & { lobby: LobbyState }> {
    const room = await RoomModel.findOne({ roomCode: input.roomCode });
    if (!room) throw new ServiceError("ROOM_NOT_FOUND", "Room not found");

    const player = await PlayerModel.findOne({
      roomId: room._id,
      sessionTokenHash: hashSessionToken(input.sessionToken),
    }).select("+socketId");

    if (!player) throw new ServiceError("SESSION_INVALID", "Session token is invalid");

    const replacedSocketId = player.socketId && player.socketId !== input.socketId ? player.socketId : undefined;
    player.connected = true;
    player.socketId = input.socketId;
    await player.save();

    return {
      roomId: room._id.toString(),
      roomCode: room.roomCode,
      sessionToken: input.sessionToken,
      playerId: player._id.toString(),
      teamId: player.teamId.toString(),
      replacedSocketId,
      lobby: await this.getLobby(room._id),
    };
  }

  async setReady(roomId: string, playerId: string, ready: boolean): Promise<LobbyState> {
    const player = await PlayerModel.findOne({ _id: playerId, roomId });
    if (!player) throw new ServiceError("UNAUTHORIZED", "Player session is not active");

    await TeamModel.updateOne({ _id: player.teamId, roomId }, { $set: { ready } });
    return this.getLobby(roomId);
  }

  async disconnect(socketId: string): Promise<LobbyState | null> {
    const player = await PlayerModel.findOneAndUpdate(
      { socketId, connected: true },
      { $set: { connected: false }, $unset: { socketId: 1 } },
      { new: false },
    ).select("roomId");

    return player ? this.getLobby(player.roomId.toString()) : null;
  }

  async getLobby(roomId: string | Types.ObjectId): Promise<LobbyState> {
    const room = await RoomModel.findById(roomId).lean() as unknown as RoomDocument & { _id: Types.ObjectId };
    if (!room) throw new ServiceError("ROOM_NOT_FOUND", "Room not found");

    const [teams, players] = await Promise.all([
      TeamModel.find({ roomId: room._id }).sort({ teamNumber: 1 }).lean() as unknown as (TeamDocument & { _id: Types.ObjectId })[],
      PlayerModel.find({ roomId: room._id }).select("teamId connected").lean() as unknown as (PlayerDocument & { _id: Types.ObjectId })[],
    ]);
    const playersByTeam = new Map(players.map((player) => [player.teamId.toString(), player]));

    const publicTeams = teams.map((team) => {
      const player = playersByTeam.get(team._id.toString());
      return {
        id: team._id.toString(),
        teamNumber: team.teamNumber,
        displayName: team.displayName,
        connected: player?.connected ?? false,
        ready: team.ready,
        eliminated: team.eliminated,
      };
    });

    return {
      roomId: room._id.toString(),
      roomCode: room.roomCode,
      status: room.status as RoomStatus,
      teams: publicTeams,
      connectedCount: publicTeams.filter((team) => team.connected).length,
      capacity: GAME_CONFIG.teamCount,
    };
  }
}
