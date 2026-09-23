import {
  GAME_CONFIG,
  type GamePhase,
  type PublicGameState,
} from "@dem-niem-tin/shared";
import mongoose from "mongoose";
import { GameEngine, GameScheduler, type GameStateSnapshot } from "../game/index.js";
import { GameModel, PlayerModel, RoomModel, TeamModel } from "../models/index.js";
import { ServiceError } from "./errors.js";
import { RoomService } from "./roomService.js";
import { hashSessionToken } from "./session.js";

type Runtime = {
  engine: GameEngine;
  scheduler: GameScheduler;
};

export type GameRuntimeHooks = {
  beforeGameStart?: (roomId: string) => void | Promise<void>;
  onPhaseChanged?: (roomId: string, state: GameStateSnapshot) => void | Promise<void>;
};

export type PublicStatePublisher = (roomId: string, state: PublicGameState) => void | Promise<void>;

export class GameRuntimeService {
  private readonly runtimes = new Map<string, Runtime>();

  constructor(
    private readonly roomService: RoomService,
    private readonly publish: PublicStatePublisher,
    private readonly hooks: GameRuntimeHooks = {},
  ) {}

  async authenticateHost(roomCode: string, hostSessionToken: string) {
    const room = await RoomModel.findOne({
      roomCode,
      hostSessionTokenHash: hashSessionToken(hostSessionToken),
    });
    if (!room) throw new ServiceError("UNAUTHORIZED", "Host session is invalid");
    return room;
  }

  async startGame(roomId: string): Promise<PublicGameState> {
    if (this.runtimes.has(roomId)) {
      throw new ServiceError("CONFLICT", "Game is already active");
    }

    const room = await RoomModel.findOne({ _id: roomId, status: "LOBBY" });
    if (!room) throw new ServiceError("INVALID_PHASE", "Room is not in the lobby phase");

    const [playerCount, connectedCount, readyCount] = await Promise.all([
      PlayerModel.countDocuments({ roomId }),
      PlayerModel.countDocuments({ roomId, connected: true }),
      TeamModel.countDocuments({ roomId, ready: true }),
    ]);
    if (playerCount !== GAME_CONFIG.teamCount || connectedCount !== GAME_CONFIG.teamCount) {
      throw new ServiceError("CONFLICT", "All eight players must be connected before starting");
    }
    if (readyCount !== GAME_CONFIG.teamCount) {
      throw new ServiceError("CONFLICT", "All eight teams must be ready before starting");
    }

    await this.hooks.beforeGameStart?.(roomId);

    const engine = new GameEngine();
    const state = engine.startGame();
    const game = await GameModel.create({
      roomId,
      roomCode: room.roomCode,
      status: "ACTIVE",
      startedAt: new Date(),
      ...this.toPersistence(state),
    });
    await Promise.all([
      RoomModel.updateOne({ _id: roomId }, { $set: { status: "ACTIVE" } }),
      PlayerModel.updateMany({ roomId }, { $set: { gameId: game._id } }),
      TeamModel.updateMany({ roomId }, { $set: { gameId: game._id } }),
    ]);

    const runtime = this.createRuntime(roomId, engine);
    this.runtimes.set(roomId, runtime);
    runtime.scheduler.schedule();
    await this.hooks.onPhaseChanged?.(roomId, state);
    return this.buildPublicState(roomId, engine);
  }

  async reconnectHost(roomId: string): Promise<PublicGameState | undefined> {
    const runtime = await this.getOrRecoverRuntime(roomId);
    return runtime ? this.buildPublicState(roomId, runtime.engine) : undefined;
  }

  async pause(roomId: string): Promise<PublicGameState> {
    return this.mutate(roomId, (engine) => engine.pause());
  }

  async resume(roomId: string): Promise<PublicGameState> {
    const state = await this.mutate(roomId, (engine) => engine.resume());
    this.runtimes.get(roomId)?.scheduler.schedule();
    return state;
  }

  async skipTimer(roomId: string): Promise<PublicGameState> {
    const state = await this.mutate(roomId, (engine) => engine.skipTimer());
    this.runtimes.get(roomId)?.scheduler.schedule();
    return state;
  }

  async restartRound(roomId: string): Promise<PublicGameState> {
    const state = await this.mutate(roomId, (engine) => engine.restartRound());
    this.runtimes.get(roomId)?.scheduler.schedule();
    return state;
  }

  async endGame(roomId: string): Promise<PublicGameState> {
    const runtime = await this.requireRuntime(roomId);
    runtime.scheduler.cancel();
    const state = runtime.engine.finish();
    await Promise.all([
      this.persist(roomId, state, "FINISHED"),
      RoomModel.updateOne({ _id: roomId }, { $set: { status: "FINISHED" } }),
    ]);
    await this.hooks.onPhaseChanged?.(roomId, state);
    const publicState = await this.buildPublicState(roomId, runtime.engine);
    await this.publish(roomId, publicState);
    return publicState;
  }

  async resetGame(roomId: string) {
    this.runtimes.get(roomId)?.scheduler.cancel();
    this.runtimes.delete(roomId);
    const game = await GameModel.findOne({ roomId }).select("_id").lean();
    const database = mongoose.connection.db;
    const gameplayCleanup =
      game && database
        ? Promise.all(
            ["actions", "votes", "clues", "gameevents"].map((collectionName) =>
              database.collection(collectionName).deleteMany({ gameId: game._id }),
            ),
          )
        : Promise.resolve([]);
    await Promise.all([
      GameModel.deleteMany({ roomId }),
      RoomModel.updateOne({ _id: roomId }, { $set: { status: "LOBBY" } }),
      PlayerModel.updateMany(
        { roomId },
        {
          $unset: { gameId: 1, role: 1, faction: 1 },
        },
      ),
      TeamModel.updateMany(
        { roomId },
        { $set: { ready: false, eliminated: false }, $unset: { gameId: 1 } },
      ),
      gameplayCleanup,
    ]);

    return this.roomService.getLobby(roomId);
  }

  private async mutate(
    roomId: string,
    mutation: (engine: GameEngine) => GameStateSnapshot,
  ): Promise<PublicGameState> {
    const runtime = await this.requireRuntime(roomId);
    runtime.scheduler.cancel();
    const state = mutation(runtime.engine);
    await this.persist(roomId, state);
    await this.hooks.onPhaseChanged?.(roomId, state);
    const publicState = await this.buildPublicState(roomId, runtime.engine);
    await this.publish(roomId, publicState);
    return publicState;
  }

  private createRuntime(roomId: string, engine: GameEngine): Runtime {
    const scheduler = new GameScheduler(engine, async (state) => {
      await this.persist(roomId, state);
      await this.hooks.onPhaseChanged?.(roomId, state);
      await this.publish(roomId, await this.buildPublicState(roomId, engine));
    });
    return { engine, scheduler };
  }

  private async requireRuntime(roomId: string): Promise<Runtime> {
    const runtime = await this.getOrRecoverRuntime(roomId);
    if (!runtime) throw new ServiceError("INVALID_PHASE", "No active game exists for this room");
    return runtime;
  }

  private async getOrRecoverRuntime(roomId: string): Promise<Runtime | undefined> {
    const existing = this.runtimes.get(roomId);
    if (existing) return existing;

    const game = await GameModel.findOne({ roomId, status: "ACTIVE" }).lean();
    if (!game) return undefined;

    const engine = new GameEngine(undefined, {
      phase: game.phase as GamePhase,
      round: game.round,
      trust: game.trust,
      paused: game.paused,
      phaseStartedAt: game.phaseStartedAt?.getTime(),
      phaseEndsAt: game.phaseEndsAt?.getTime(),
      pausedRemainingMs: game.pausedRemainingMs,
      revision: game.revision,
    });
    const runtime = this.createRuntime(roomId, engine);
    this.runtimes.set(roomId, runtime);
    runtime.scheduler.schedule();
    return runtime;
  }

  private async persist(
    roomId: string,
    state: GameStateSnapshot,
    status: "ACTIVE" | "FINISHED" = "ACTIVE",
  ): Promise<void> {
    await GameModel.updateOne(
      { roomId },
      {
        $set: {
          status,
          ...this.toPersistence(state),
          ...(status === "FINISHED" ? { finishedAt: new Date() } : {}),
        },
      },
    );
  }

  private toPersistence(state: GameStateSnapshot) {
    return {
      phase: state.phase,
      round: state.round,
      trust: state.trust,
      paused: state.paused,
      phaseStartedAt: state.phaseStartedAt === undefined ? undefined : new Date(state.phaseStartedAt),
      phaseEndsAt: state.phaseEndsAt === undefined ? undefined : new Date(state.phaseEndsAt),
      pausedRemainingMs: state.pausedRemainingMs,
      revision: state.revision,
    };
  }

  private async buildPublicState(roomId: string, engine: GameEngine): Promise<PublicGameState> {
    const lobby = await this.roomService.getLobby(roomId);
    const state = engine.snapshot;
    return {
      roomId,
      roomCode: lobby.roomCode,
      phase: engine.publicPhase,
      round: state.round,
      trust: state.trust,
      phaseStartedAt: state.phaseStartedAt,
      phaseEndsAt: state.phaseEndsAt,
      paused: state.paused,
      teams: lobby.teams,
      publicClues: [],
      publicEvents: [],
    };
  }
}
