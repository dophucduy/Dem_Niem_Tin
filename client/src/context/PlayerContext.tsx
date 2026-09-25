import React, { createContext, useContext, useState, useEffect } from "react";
import { 
  CLIENT_EVENTS, 
  SERVER_EVENTS, 
  LobbyState, 
  PublicGameState,
  PrivatePlayerState,
  PublicQuestion,
  Role,
  Faction,
  ReactionType,
  ReactionSummary,
  Ack,
  SetReadyResult,
  AnswerQuestionResult,
  PlayerActionResult,
  SendReactionResult,
  AbilityMode,
} from "@dem-niem-tin/shared";
import { socket } from "../services/socket";
import { SAMPLE_QUESTIONS } from "../data/sampleQuestions";
import { ROLE_DEFINITIONS } from "../data/roleDefinitions";

const STORAGE_KEY = "dem_niem_tin_player_session";

export interface StoredSession {
  roomCode: string;
  sessionToken: string;
  teamNumber: number;
  playerId: string;
  teamId: string;
}

export interface PlayerContextType {
  session: StoredSession | null;
  lobby: LobbyState | null;
  publicState: PublicGameState | null;
  privateState: PrivatePlayerState | null;
  loading: boolean;
  errorMessage: string | null;
  setErrorMessage: (msg: string | null) => void;
  handleJoin: (roomCode: string, teamNumber: number, displayName?: string, onSuccess?: () => void) => void;
  handleLeaveRoom: () => void;
  handleConfirmReady: () => void;
  handleToggleReady: (ready?: boolean) => void;
  handleSubmitAnswer: (selectedOption: number, onResult?: (correct: boolean) => void) => void;
  handleExecuteAbility: (
    targetTeamNumber?: number,
    mode?: AbilityMode,
    onSuccess?: () => void,
    onError?: (err: string) => void
  ) => void;
  handleSubmitVote: (
    targetTeamNumber: number,
    onSuccess?: () => void,
    onError?: (err: string) => void
  ) => void;
  handleSendReaction: (reaction: ReactionType) => void;
  reactionCooldown: boolean;
  activeRole: Role;
  setActiveRole: (role: Role) => void;
  activeFaction: Faction;
  activeQuestion: PublicQuestion;
  questionDetail: typeof SAMPLE_QUESTIONS[0];
  teams: any[];
}

const PlayerContext = createContext<PlayerContextType | null>(null);

export const PlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<StoredSession | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [lobby, setLobby] = useState<LobbyState | null>(null);
  const [publicState, setPublicState] = useState<PublicGameState | null>(null);
  const [privateState, setPrivateState] = useState<PrivatePlayerState | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeRole, setActiveRole] = useState<Role>("INSPECTOR");
  const [reactionCooldown, setReactionCooldown] = useState(false);

  // Initial empty teams: all 8 slots start unconnected and unready
  const emptyTeams = Array.from({ length: 8 }, (_, i) => ({
    id: `team-${i + 1}`,
    teamNumber: i + 1,
    displayName: undefined,
    connected: false,
    ready: false,
    eliminated: false,
  }));

  const mockLobby: LobbyState = {
    roomId: "room-default",
    roomCode: session?.roomCode || "",
    status: "LOBBY",
    teams: emptyTeams as any,
    connectedCount: 0,
    capacity: 8,
  };

  useEffect(() => {
    const handleLobbyUpdated = (updatedLobby: LobbyState) => setLobby(updatedLobby);
    const handlePublicState = (state: PublicGameState) => setPublicState(state);
    const handlePrivateState = (state: PrivatePlayerState) => {
      setPrivateState(state);
      if (state.role) setActiveRole(state.role);
    };

    socket.on(SERVER_EVENTS.LOBBY_UPDATED, handleLobbyUpdated);
    socket.on(SERVER_EVENTS.PUBLIC_STATE_UPDATED, handlePublicState);
    socket.on(SERVER_EVENTS.PRIVATE_STATE_UPDATED, handlePrivateState);

    // Auto reconnect only if we have an active saved session
    if (session && !lobby && !privateState) {
      const doReconnect = () => {
        socket.emit(
          CLIENT_EVENTS.RECONNECT,
          { roomCode: session.roomCode, sessionToken: session.sessionToken },
          (res: Ack<any>) => {
            if (res.ok) {
              setLobby(res.data.room);
              if (res.data.privateState) {
                setPrivateState(res.data.privateState);
                if (res.data.privateState.role) setActiveRole(res.data.privateState.role);
              }
              if (res.data.publicState) setPublicState(res.data.publicState);
            } else {
              localStorage.removeItem(STORAGE_KEY);
              setSession(null);
              if (socket.connected) socket.disconnect();
            }
          }
        );
      };

      if (!socket.connected) {
        socket.connect();
        socket.once("connect", doReconnect);
      } else {
        doReconnect();
      }
    }

    const handleBeforeUnload = () => {
      if (socket.connected) {
        socket.disconnect();
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      socket.off(SERVER_EVENTS.LOBBY_UPDATED, handleLobbyUpdated);
      socket.off(SERVER_EVENTS.PUBLIC_STATE_UPDATED, handlePublicState);
      socket.off(SERVER_EVENTS.PRIVATE_STATE_UPDATED, handlePrivateState);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [session]);

  const handleJoin = (
    roomCode: string,
    teamNumber: number,
    displayName?: string,
    onSuccess?: () => void
  ) => {
    setLoading(true);
    setErrorMessage(null);

    const cleanRoomCode = roomCode.trim().toUpperCase();

    const doJoin = () => {
      socket.emit(
        CLIENT_EVENTS.JOIN_ROOM,
        {
          roomCode: cleanRoomCode,
          teamNumber,
          displayName: displayName?.trim() || undefined,
        },
        (res: Ack<any>) => {
          setLoading(false);
          if (res.ok) {
            const newSession: StoredSession = {
              roomCode: cleanRoomCode,
              sessionToken: res.data.sessionToken,
              teamNumber,
              playerId: res.data.playerId,
              teamId: res.data.teamId,
            };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(newSession));
            setSession(newSession);
            setLobby(res.data.room);
            onSuccess?.();
          } else {
            setErrorMessage(res.error?.message || "Không thể tham gia phòng. Vui lòng kiểm tra lại mã phòng.");
          }
        }
      );
    };

    if (!socket.connected) {
      socket.connect();
      socket.once("connect", doJoin);
      setTimeout(() => {
        if (!socket.connected) {
          setLoading(false);
          setErrorMessage("Không thể kết nối đến máy chủ. Vui lòng kiểm tra lại mạng.");
        }
      }, 3500);
    } else {
      doJoin();
    }
  };

  const handleLeaveRoom = () => {
    localStorage.removeItem(STORAGE_KEY);
    if (socket.connected) {
      socket.disconnect();
    }
    setSession(null);
    setLobby(null);
    setPublicState(null);
    setPrivateState(null);
    setErrorMessage(null);
  };

  const handleConfirmReady = () => {
    if (socket.connected) {
      socket.emit(CLIENT_EVENTS.READY, { ready: true }, (res: Ack<SetReadyResult>) => {
        if (res.ok) setLobby(res.data.room);
      });
    }
  };

  const handleToggleReady = (explicitReady?: boolean) => {
    const currentMyTeam = lobby?.teams.find((t) => t.teamNumber === session?.teamNumber);
    const nextReady = explicitReady !== undefined ? explicitReady : !currentMyTeam?.ready;

    if (socket.connected) {
      setLoading(true);
      socket.emit(CLIENT_EVENTS.READY, { ready: nextReady }, (res: Ack<SetReadyResult>) => {
        setLoading(false);
        if (res.ok) {
          setLobby(res.data.room);
        } else {
          setErrorMessage(res.error.message);
        }
      });
    } else {
      setErrorMessage("Mất kết nối máy chủ. Trạng thái chưa được thay đổi.");
    }
  };

  const handleSubmitAnswer = (selectedOption: number, onResult?: (correct: boolean) => void) => {
    const currentQ = publicState?.activeQuestion || SAMPLE_QUESTIONS[0];
    if (socket.connected && session) {
      setLoading(true);
      socket.emit(
        CLIENT_EVENTS.ANSWER_QUESTION,
        {
          questionId: currentQ.id,
          selectedOption,
        },
        (res: Ack<AnswerQuestionResult>) => {
          setLoading(false);
          if (res.ok) {
            setPrivateState(res.data.privateState);
            onResult?.(res.data.correct);
          } else {
            setErrorMessage(res.error?.message || "Không thể gửi câu trả lời.");
          }
        }
      );
    } else {
      setErrorMessage("Mất kết nối máy chủ. Câu trả lời chưa được gửi.");
    }
  };

  const handleExecuteAbility = (
    targetTeamNumber?: number,
    mode?: AbilityMode,
    onSuccess?: () => void,
    onError?: (err: string) => void
  ) => {
    setLoading(true);
    setErrorMessage(null);

    let targetTeamId: string | undefined = undefined;
    if (targetTeamNumber !== undefined) {
      const allTeams = publicState?.teams || lobby?.teams || [];
      const targetTeam = allTeams.find((t: { teamNumber: number; id: string }) => t.teamNumber === targetTeamNumber);
      targetTeamId = targetTeam?.id;
    }

    if (targetTeamNumber !== undefined && !targetTeamId) {
      const msg = "Không tìm thấy thông tin định danh của đội được chọn.";
      setLoading(false);
      setErrorMessage(msg);
      onError?.(msg);
      return;
    }

    if (socket.connected && session) {
      socket.emit(
        CLIENT_EVENTS.USE_ABILITY,
        {
          targetTeamId,
          mode,
        },
        (res: Ack<PlayerActionResult>) => {
          setLoading(false);
          if (res.ok) {
            onSuccess?.();
          } else {
            const msg = res.error?.message || "Không thể thực thi năng lực lúc này.";
            setErrorMessage(msg);
            onError?.(msg);
          }
        }
      );
    } else {
      const msg = "Mất kết nối máy chủ. Hành động đêm chưa được gửi đi.";
      setLoading(false);
      setErrorMessage(msg);
      onError?.(msg);
    }
  };

  const handleSubmitVote = (
    targetTeamNumber: number,
    onSuccess?: () => void,
    onError?: (err: string) => void
  ) => {
    setLoading(true);
    setErrorMessage(null);

    const allTeams = publicState?.teams || lobby?.teams || [];
    const targetTeam = allTeams.find((t: { teamNumber: number; id: string }) => t.teamNumber === targetTeamNumber);
    const targetTeamId = targetTeam?.id;

    if (!targetTeamId && socket.connected) {
      const msg = "Không tìm thấy thông tin định danh của đội được chọn.";
      setLoading(false);
      setErrorMessage(msg);
      onError?.(msg);
      return;
    }

    if (socket.connected && session) {
      socket.emit(
        CLIENT_EVENTS.SUBMIT_VOTE,
        { targetTeamId: targetTeamId! },
        (res: Ack<PlayerActionResult>) => {
          setLoading(false);
          if (res.ok) {
            onSuccess?.();
          } else {
            const msg = res.error?.message || "Không thể nộp phiếu biểu quyết lúc này.";
            setErrorMessage(msg);
            onError?.(msg);
          }
        }
      );
    } else {
      const msg = "Mất kết nối máy chủ. Phiếu biểu quyết chưa được gửi đi.";
      setLoading(false);
      setErrorMessage(msg);
      onError?.(msg);
    }
  };

  const handleSendReaction = (reaction: ReactionType) => {
    if (reactionCooldown) return;
    if (socket.connected && session) {
      setReactionCooldown(true);
      socket.emit(
        CLIENT_EVENTS.SEND_REACTION,
        { reaction },
        (res: Ack<SendReactionResult>) => {
          if (!res.ok) {
            // silently ignore rate-limit errors
          }
        }
      );
      // 3 second cooldown matching server rate-limit
      setTimeout(() => setReactionCooldown(false), 3000);
    }
  };

  const activeFaction: Faction = activeRole === "CORRUPTOR" ? "CORRUPTION" : "TRUST";
  const activeQuestion: PublicQuestion = publicState?.activeQuestion || SAMPLE_QUESTIONS[0];
  const questionDetail = SAMPLE_QUESTIONS.find(q => q.id === activeQuestion.id) || SAMPLE_QUESTIONS[0];
  const teams = publicState?.teams || lobby?.teams || emptyTeams;

  return (
    <PlayerContext.Provider
      value={{
        session,
        lobby,
        publicState,
        privateState,
        loading,
        errorMessage,
        setErrorMessage,
        handleJoin,
        handleLeaveRoom,
        handleConfirmReady,
        handleToggleReady,
        handleSubmitAnswer,
        handleExecuteAbility,
        handleSubmitVote,
        handleSendReaction,
        reactionCooldown,
        activeRole,
        setActiveRole,
        activeFaction,
        activeQuestion,
        questionDetail,
        teams,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
};

export const usePlayerGame = () => {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error("usePlayerGame must be used within a PlayerProvider");
  }
  return context;
};
