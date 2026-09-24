import {
  GAME_CONFIG,
  type GamePhase,
  type AnswerQuestionPayload,
  type AnswerQuestionResult,
  type PrivatePlayerState,
  type PublicQuestion,
  type Clue,
  type PublicGameEvent,
  type PublicGameState,
  type SubmitVotePayload,
  type UseAbilityPayload,
} from "@dem-niem-tin/shared";
import mongoose from "mongoose";
import { GameEngine, GameScheduler, type GameStateSnapshot } from "../game/index.js";
import { ActionModel, GameModel, PlayerModel, RoomModel, TeamModel, VoteModel } from "../models/index.js";
import { resolveStoredNightActions, submitAbility } from "./abilityService.js";
import { ServiceError } from "./errors.js";
import { RoomService } from "./roomService.js";
import { hashSessionToken } from "./session.js";
import { assignRoles, getPrivatePlayerState } from "./roleService.js";
import { getRandomQuestion, resetKnowledgeState, submitAnswer } from "./knowledgeService.js";
import { submitVote, tallyVotes } from "./votingService.js";

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
    await assignRoles(game._id.toString());
    await this.hooks.beforeGameStart?.(roomId);

    const runtime = this.createRuntime(roomId, engine);
    this.runtimes.set(roomId, runtime);
    runtime.scheduler.schedule();
    await this.preparePhase(roomId, engine);
    await this.hooks.onPhaseChanged?.(roomId, engine.snapshot);
    return this.buildPublicState(roomId, engine);
  }

  async getPrivateState(roomId: string, playerId: string): Promise<PrivatePlayerState | undefined> {
    const player = await PlayerModel.findOne({ _id: playerId, roomId }).lean();
    if (!player) throw new ServiceError("UNAUTHORIZED", "Player session is invalid");
    return (await getPrivatePlayerState(playerId)) ?? undefined;
  }

  async answerQuestion(
    roomId: string,
    playerId: string,
    payload: AnswerQuestionPayload,
  ): Promise<AnswerQuestionResult> {
    const runtime = await this.requireRuntimePhase(roomId, "NIGHT_KNOWLEDGE");
    const game = await GameModel.findOne({ roomId, status: "ACTIVE" }).lean();
    if (!game?.activeQuestion || game.activeQuestion.id !== payload.questionId) {
      throw new ServiceError("VALIDATION_ERROR", "Question is no longer active");
    }
    const correct = await submitAnswer(
      game._id.toString(),
      runtime.engine.snapshot.round,
      playerId,
      payload.questionId,
      payload.selectedOption,
    );
    const privateState = await this.getPrivateState(roomId, playerId);
    if (!privateState) throw new ServiceError("INTERNAL_ERROR", "Private player state is unavailable");
    const answered = await PlayerModel.countDocuments({
      gameId: game._id,
      answeredRound: runtime.engine.snapshot.round,
    });
    if (answered === GAME_CONFIG.teamCount) await this.advanceCurrentPhase(roomId, runtime);
    return { correct, privateState };
  }

  async useAbility(roomId: string, playerId: string, payload: UseAbilityPayload): Promise<void> {
    const runtime = await this.requireRuntimePhase(roomId, "NIGHT_ABILITY");
    const game = await GameModel.findOne({ roomId, status: "ACTIVE" }).select("_id").lean();
    if (!game) throw new ServiceError("INVALID_PHASE", "Active game was not found");
    await submitAbility(game._id.toString(), runtime.engine.snapshot.round, playerId, payload.targetTeamId);
  }

  async submitVote(roomId: string, playerId: string, payload: SubmitVotePayload): Promise<void> {
    const runtime = await this.requireRuntimePhase(roomId, "VOTING");
    const game = await GameModel.findOne({ roomId, status: "ACTIVE" }).select("_id").lean();
    if (!game) throw new ServiceError("INVALID_PHASE", "Active game was not found");
    await submitVote(game._id.toString(), runtime.engine.snapshot.round, playerId, payload.targetTeamId);
    const votes = await VoteModel.countDocuments({ gameId: game._id, round: runtime.engine.snapshot.round });
    const activePlayers = await TeamModel.countDocuments({ gameId: game._id, eliminated: false });
    if (votes === activePlayers) await this.advanceCurrentPhase(roomId, runtime);
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
    const state = await this.mutate(roomId, (engine) => engine.restartRound(), true);
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
    await this.preparePhase(roomId, runtime.engine);
    await this.persist(roomId, runtime.engine.snapshot, "FINISHED");
    await this.hooks.onPhaseChanged?.(roomId, runtime.engine.snapshot);
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
          $unset: { gameId: 1, role: 1, faction: 1, answeredRound: 1 },
        },
      ),
      TeamModel.updateMany(
        { roomId },
        { $set: { ready: false, eliminated: false }, $unset: { gameId: 1 } },
      ),
      ActionModel.deleteMany(game ? { gameId: game._id } : { roomId }),
      VoteModel.deleteMany(game ? { gameId: game._id } : { roomId }),
      gameplayCleanup,
    ]);

    return this.roomService.getLobby(roomId);
  }

  private async mutate(
    roomId: string,
    mutation: (engine: GameEngine) => GameStateSnapshot,
    forcePrepare = false,
  ): Promise<PublicGameState> {
    const runtime = await this.requireRuntime(roomId);
    runtime.scheduler.cancel();
    mutation(runtime.engine);
    await this.preparePhase(roomId, runtime.engine, forcePrepare);
    const state = runtime.engine.snapshot;
    await this.persist(roomId, state);
    await this.hooks.onPhaseChanged?.(roomId, state);
    const publicState = await this.buildPublicState(roomId, runtime.engine);
    await this.publish(roomId, publicState);
    return publicState;
  }

  private createRuntime(roomId: string, engine: GameEngine): Runtime {
    const scheduler = new GameScheduler(engine, async (state) => {
      await this.preparePhase(roomId, engine);
      const preparedState = engine.snapshot;
      await this.persist(roomId, preparedState);
      await this.hooks.onPhaseChanged?.(roomId, preparedState);
      await this.publish(roomId, await this.buildPublicState(roomId, engine));
    });
    return { engine, scheduler };
  }

  private async requireRuntime(roomId: string): Promise<Runtime> {
    const runtime = await this.getOrRecoverRuntime(roomId);
    if (!runtime) throw new ServiceError("INVALID_PHASE", "No active game exists for this room");
    return runtime;
  }

  private async requireRuntimePhase(roomId: string, phase: GamePhase): Promise<Runtime> {
    const runtime = await this.requireRuntime(roomId);
    if (runtime.engine.snapshot.phase !== phase) {
      throw new ServiceError("INVALID_PHASE", `Action is only allowed during ${phase}`);
    }
    return runtime;
  }

  private async advanceCurrentPhase(roomId: string, runtime: Runtime): Promise<void> {
    runtime.scheduler.cancel();
    runtime.engine.advance();
    await this.preparePhase(roomId, runtime.engine);
    await this.persist(roomId, runtime.engine.snapshot);
    await this.hooks.onPhaseChanged?.(roomId, runtime.engine.snapshot);
    await this.publish(roomId, await this.buildPublicState(roomId, runtime.engine));
    runtime.scheduler.schedule();
  }

  private async preparePhase(roomId: string, engine: GameEngine, force = false): Promise<void> {
    const state = engine.snapshot;
    const game = await GameModel.findOne({ roomId, status: "ACTIVE" }).select("_id phase activeQuestion");
    if (!game) return;
    if (!force && game.phase === state.phase) return;

    if (state.phase === "NIGHT_KNOWLEDGE") {
      await resetKnowledgeState(game._id.toString());
      const difficulty = state.round === 1 ? "easy" : state.round === 2 ? "medium" : "hard";
      const question = await getRandomQuestion(difficulty);
      if (!question) throw new ServiceError("CONFLICT", `No ${difficulty} question is configured`);
      game.activeQuestion = question;
      await game.save();
    }
    if (state.phase === "NIGHT_RESOLUTION") {
      const trustDelta = await resolveStoredNightActions(game._id.toString(), state.round);
      if (trustDelta) engine.updateTrust(trustDelta);
    }
    if (state.phase === "VOTE_RESULT") {
      const trustDelta = await tallyVotes(game._id.toString(), state.round);
      if (trustDelta) engine.updateTrust(trustDelta);
    }
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
      pausedRemainingMs: game.pausedRemainingMs ?? undefined,
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
      phaseStartedAt: state.phaseStartedAt === undefined ? null : new Date(state.phaseStartedAt),
      phaseEndsAt: state.phaseEndsAt === undefined ? null : new Date(state.phaseEndsAt),
      pausedRemainingMs: state.pausedRemainingMs ?? null,
      revision: state.revision,
    };
  }

  private async buildPublicState(roomId: string, engine: GameEngine): Promise<PublicGameState> {
    const lobby = await this.roomService.getLobby(roomId);
    const state = engine.snapshot;
    const game = await GameModel.findOne({ roomId }).select("activeQuestion publicClues publicEvents").lean();
    const publicState: PublicGameState = {
      roomId,
      roomCode: lobby.roomCode,
      phase: engine.publicPhase,
      round: state.round,
      trust: state.trust,
      phaseStartedAt: state.phaseStartedAt,
      phaseEndsAt: state.phaseEndsAt,
      paused: state.paused,
      teams: lobby.teams,
      activeQuestion:
        state.phase === "NIGHT_KNOWLEDGE" && game?.activeQuestion
          ? ({
              id: game.activeQuestion.id,
              category: game.activeQuestion.category,
              difficulty: game.activeQuestion.difficulty,
              text: game.activeQuestion.text,
              options: [...game.activeQuestion.options],
            } satisfies PublicQuestion)
          : undefined,
      publicClues: (game?.publicClues ?? []).map(
        (clue: { id: string; title: string; description: string; visibility: Clue["visibility"]; revealedAt?: number | null }): Clue => ({
          id: clue.id,
          title: clue.title,
          description: clue.description,
          visibility: clue.visibility,
          revealedAt: clue.revealedAt ?? undefined,
        }),
      ),
      publicEvents: (game?.publicEvents ?? []).map(
        (event: PublicGameEvent): PublicGameEvent => ({
          id: event.id,
          type: event.type,
          message: event.message,
          timestamp: event.timestamp,
        }),
      ),
    };

    if (engine.publicPhase === "FINAL" && game && game._id) {
      const corruptors = await PlayerModel.find({ gameId: game._id, role: "CORRUPTOR" }).lean();
      let corruptorsAlive = 0;
      for (const corruptor of corruptors) {
        const team = await TeamModel.findById(corruptor.teamId).lean();
        if (team && !team.eliminated) {
          corruptorsAlive++;
        }
      }
      publicState.factionWin = corruptorsAlive === 0 ? "TRUST" : "CORRUPTION";
    }

    return publicState;
  }
}
