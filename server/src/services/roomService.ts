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

type JoinedPlayerSession = PlayerSession & { teamNumber: number };

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
    displayName: string;
    socketId: string;
  }): Promise<JoinedPlayerSession & { lobby: LobbyState }> {
    const room = await RoomModel.findOne({ roomCode: input.roomCode, status: "LOBBY" });
    if (!room) throw new ServiceError("ROOM_NOT_FOUND", "Room not found or no longer joinable");

    const highestExistingTeam = await TeamModel.findOne({ roomId: room._id }).sort({ teamNumber: -1 }).select("teamNumber").lean();
    if (highestExistingTeam && (room.nextTeamNumber ?? 1) <= highestExistingTeam.teamNumber) {
      await RoomModel.updateOne({ _id: room._id }, { $max: { nextTeamNumber: highestExistingTeam.teamNumber + 1 } });
    }

    const allocatedRoom = await RoomModel.findOneAndUpdate(
      { _id: room._id, status: "LOBBY" },
      { $inc: { nextTeamNumber: 1 } },
      { new: false },
    );
    if (!allocatedRoom) throw new ServiceError("ROOM_NOT_FOUND", "Room is no longer accepting participants");

    const teamNumber = allocatedRoom.nextTeamNumber ?? 1;

    const sessionToken = createSessionToken();
    let team: { _id: Types.ObjectId } | undefined;
    try {
      team = await TeamModel.create({
        roomId: room._id,
        teamNumber,
        displayName: input.displayName,
      });
      const player = await PlayerModel.create({
        roomId: room._id,
        teamId: team._id,
        sessionTokenHash: hashSessionToken(sessionToken),
        connected: true,
        socketId: input.socketId,
      });

      return {
        roomId: room._id.toString(),
        roomCode: room.roomCode,
        sessionToken,
        playerId: player._id.toString(),
        teamId: team._id.toString(),
        teamNumber,
        lobby: await this.getLobby(room._id),
      };
    } catch (error) {
      if (team) await TeamModel.deleteOne({ _id: team._id });
      if (isDuplicateKeyError(error)) {
        throw new ServiceError("CONFLICT", "Could not allocate a participant number; please retry");
      }
      throw error;
    }
  }

  async reconnect(input: {
    roomCode: string;
    sessionToken: string;
    socketId: string;
  }): Promise<PlayerSession & { lobby: LobbyState; teamNumber?: number; displayName?: string }> {
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

    // Fetch team info for socket identity
    const team = await TeamModel.findById(player.teamId).lean() as (TeamDocument & { _id: Types.ObjectId }) | null;

    return {
      roomId: room._id.toString(),
      roomCode: room.roomCode,
      sessionToken: input.sessionToken,
      playerId: player._id.toString(),
      teamId: player.teamId.toString(),
      replacedSocketId,
      teamNumber: team?.teamNumber,
      displayName: team?.displayName,
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

    const players = await PlayerModel.find({ roomId: room._id })
      .select("teamId connected")
      .lean() as unknown as (PlayerDocument & { _id: Types.ObjectId })[];
    const teams = await TeamModel.find({
      roomId: room._id,
      // Older deployments pre-created eight empty Team records. They are
      // capacity placeholders, not participants, so omit them from the lobby.
      _id: { $in: players.map((player) => player.teamId) },
    })
      .sort({ teamNumber: 1 })
      .lean() as unknown as (TeamDocument & { _id: Types.ObjectId })[];
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
