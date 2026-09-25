export type ClientType = "HOST" | "PLAYER";

export type ConnectionStatus = "connecting" | "connected" | "disconnected";

export type RoomStatus = "LOBBY" | "ACTIVE" | "FINISHED";

export type GamePhase =
  | "LOBBY"
  | "ROLE_REVEAL"
  | "NIGHT_KNOWLEDGE"
  | "NIGHT_ABILITY"
  | "NIGHT_RESOLUTION"
  | "DAY_RESULT"
  | "DISCUSSION"
  | "VOTING"
  | "VOTE_RESULT"
  | "TRUST_UPDATE"
  | "NEXT_ROUND"
  | "FINAL";

export type PublicPhase = "LOBBY" | "NIGHT" | "DAY" | "VOTING" | "FINAL";

export type Role =
  | "CORRUPTOR"
  | "INSPECTOR"
  | "LAW"
  | "WHISTLEBLOWER"
  | "OVERSIGHT"
  | "SPECIAL_6"
  | "SPECIAL_7";

export type Faction = "CORRUPTION" | "TRUST";

export type EffectiveState = "SPECIAL" | "CITIZEN";

export type AbilityMode = "TRUST_DRAIN" | "INTERFERE";

export type QuestionDifficulty = "easy" | "medium" | "hard";

export type ClueVisibility = "public" | "private";

export type ReactionType = "AGREE" | "SUSPECT" | "OBJECT" | "QUESTION";

export type TeamReaction = {
  teamNumber: number;
  displayName: string;
  reaction: ReactionType;
  timestamp: number;
};

export type ReactionSummary = {
  AGREE: number;
  SUSPECT: number;
  OBJECT: number;
  QUESTION: number;
  reactions: TeamReaction[];
};

export type PublicTeam = {
  id: string;
  teamNumber: number;
  displayName: string;
  connected: boolean;
  ready: boolean;
  eliminated: boolean;
};

export type PublicQuestion = {
  id: string;
  category: string;
  difficulty: QuestionDifficulty;
  text: string;
  options: string[];
};

export type Clue = {
  id: string;
  title: string;
  description: string;
  visibility: ClueVisibility;
  revealedAt?: number;
};

export type PublicGameEvent = {
  id: string;
  type: string;
  message: string;
  timestamp: number;
  /** Optional JSON payload for structured events (e.g. VOTE_RESULT details). */
  data?: string;
};

export type LobbyState = {
  roomId: string;
  roomCode: string;
  status: RoomStatus;
  teams: PublicTeam[];
  connectedCount: number;
  /** null means the room accepts an unlimited number of participants. */
  capacity: number | null;
};

export type PublicGameState = {
  roomId: string;
  roomCode: string;
  /** Exact server-authoritative phase used to keep every client in sync. */
  gamePhase: GamePhase;
  phase: PublicPhase;
  round: number;
  trust: number;
  phaseStartedAt?: number;
  phaseEndsAt?: number;
  paused: boolean;
  teams: PublicTeam[];
  activeQuestion?: PublicQuestion;
  publicClues: Clue[];
  publicEvents: PublicGameEvent[];
  factionWin?: Faction | "DRAW";
};

export type PrivateResultOutcome = "SUSPICIOUS" | "CLEAR" | "SUCCESS" | "BLOCKED" | "INFO";

export type PrivateResult = {
  id: string;
  type: string;
  message: string;
  createdAt: number;
  /** Structured fields (present on results resolved after the clarity fix; legacy entries omit them). */
  outcome?: PrivateResultOutcome;
  title?: string;
  /** Round in which the result was produced, used to scope results to the current round. */
  round?: number;
  targetTeamNumber?: number;
};

export type PrivatePlayerState = {
  playerId: string;
  teamId: string;
  role: Role;
  faction: Faction;
  abilityUnlocked: boolean;
  effectiveState: EffectiveState;
  privateResults: PrivateResult[];
  /** Refresh-safe flag telling whether this player already submitted a night action this round. */
  hasActedThisRound: boolean;
};

export type ApiErrorCode =
  | "VALIDATION_ERROR"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "ROOM_NOT_FOUND"
  | "ROOM_FULL"
  | "TEAM_UNAVAILABLE"
  | "SESSION_INVALID"
  | "INVALID_PHASE"
  | "CONFLICT"
  | "INTERNAL_ERROR";

export type ApiError = {
  code: ApiErrorCode;
  message: string;
  fieldErrors?: Record<string, string[]>;
};

export type AckSuccess<T> = { ok: true; data: T };
export type AckFailure = { ok: false; error: ApiError };
export type Ack<T> = AckSuccess<T> | AckFailure;

export type CreateRoomPayload = {
  hostName?: string;
};

export type CreateRoomResult = {
  room: LobbyState;
  hostSessionToken: string;
};

export type JoinRoomPayload = {
  roomCode: string;
  displayName: string;
};

export type JoinRoomResult = {
  room: LobbyState;
  playerId: string;
  teamId: string;
  teamNumber: number;
  sessionToken: string;
};

export type ReconnectPayload = {
  roomCode: string;
  sessionToken: string;
};

export type ReconnectResult = {
  room: LobbyState;
  playerId: string;
  teamId: string;
  /** Server-assigned participant number, echoed so clients can repair stale sessions. */
  teamNumber?: number;
  privateState?: PrivatePlayerState;
  publicState?: PublicGameState;
};

export type SetReadyPayload = {
  ready: boolean;
};

export type SetReadyResult = {
  room: LobbyState;
};

export type AnswerQuestionPayload = {
  questionId: string;
  selectedOption: number;
};

export type AnswerQuestionResult = {
  correct: boolean;
  privateState: PrivatePlayerState;
};

export type UseAbilityPayload = {
  targetTeamId?: string;
  mode?: AbilityMode;
};

export type SendReactionPayload = {
  reaction: ReactionType;
};

export type SendReactionResult = {
  accepted: true;
};

export type SubmitVotePayload = {
  targetTeamId: string;
};

export type VoteDistributionEntry = {
  teamNumber: number;
  displayName: string;
  votes: number;
};

/** Structured payload of the public VOTE_RESULT event (serialized into PublicGameEvent.data). */
export type VoteResultDetails = {
  round: number;
  isTie: boolean;
  votesReceived: number;
  voteDistribution: VoteDistributionEntry[];
  eliminatedTeamNumber?: number;
  eliminatedTeamName?: string;
  faction?: Faction;
  role?: Role;
  trustDelta: number;
};

export type PlayerActionResult = {
  accepted: true;
};

export type HostAuthPayload = {
  roomCode: string;
  hostSessionToken: string;
};

export type HostReconnectResult = {
  room: LobbyState;
  publicState?: PublicGameState;
};

export type HostGameCommandResult = {
  publicState: PublicGameState;
};

export type ResetGameResult = {
  room: LobbyState;
};
