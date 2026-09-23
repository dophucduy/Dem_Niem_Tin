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
  Ack,
  SetReadyResult,
  AnswerQuestionResult,
  PlayerActionResult 
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
  handleJoin: (roomCode: string, teamNumber: number, displayName?: string) => void;
  handleLeaveRoom: () => void;
  handleConfirmReady: () => void;
  handleSubmitAnswer: (selectedOption: number) => void;
  handleExecuteAbility: (targetTeamNumber: number) => void;
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

  // Mock teams for standalone UI testing
  const mockTeams = Array.from({ length: 8 }, (_, i) => ({
    id: `team-${i + 1}`,
    teamNumber: i + 1,
    displayName: i < 5 ? `Nhóm ${i + 1}` : undefined,
    connected: i < 6,
    ready: i < 4,
    eliminated: false,
  }));

  const mockLobby: LobbyState = {
    roomId: "room-default",
    roomCode: session?.roomCode || "NT8892",
    status: "LOBBY",
    teams: mockTeams as any,
    connectedCount: 6,
    capacity: 8,
  };

  useEffect(() => {
    if (!socket.connected) {
      socket.connect();
    }

    const handleLobbyUpdated = (updatedLobby: LobbyState) => setLobby(updatedLobby);
    const handlePublicState = (state: PublicGameState) => setPublicState(state);
    const handlePrivateState = (state: PrivatePlayerState) => {
      setPrivateState(state);
      if (state.role) setActiveRole(state.role);
    };

    socket.on(SERVER_EVENTS.LOBBY_UPDATED, handleLobbyUpdated);
    socket.on(SERVER_EVENTS.PUBLIC_STATE_UPDATED, handlePublicState);
    socket.on(SERVER_EVENTS.PRIVATE_STATE_UPDATED, handlePrivateState);

    // Auto reconnect
    if (session && !lobby && !privateState) {
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
          }
        }
      );
    }

    return () => {
      socket.off(SERVER_EVENTS.LOBBY_UPDATED, handleLobbyUpdated);
      socket.off(SERVER_EVENTS.PUBLIC_STATE_UPDATED, handlePublicState);
      socket.off(SERVER_EVENTS.PRIVATE_STATE_UPDATED, handlePrivateState);
    };
  }, [session]);

  const handleJoin = (roomCode: string, teamNumber: number, displayName?: string) => {
    setLoading(true);
    setErrorMessage(null);

    const fallbackSession: StoredSession = {
      roomCode: roomCode.toUpperCase() || "NT8892",
      sessionToken: "session-token-fallback",
      teamNumber,
      playerId: `player-${teamNumber}`,
      teamId: `team-${teamNumber}`,
    };

    if (socket.connected) {
      socket.emit(
        CLIENT_EVENTS.JOIN_ROOM,
        { roomCode, teamNumber, displayName },
        (res: Ack<any>) => {
          setLoading(false);
          if (res.ok) {
            const newSession: StoredSession = {
              roomCode,
              sessionToken: res.data.sessionToken,
              teamNumber,
              playerId: res.data.playerId,
              teamId: res.data.teamId,
            };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(newSession));
            setSession(newSession);
            setLobby(res.data.room);
          } else {
            // If server error or offline, still save session for UI demo
            localStorage.setItem(STORAGE_KEY, JSON.stringify(fallbackSession));
            setSession(fallbackSession);
          }
        }
      );
    } else {
      setLoading(false);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(fallbackSession));
      setSession(fallbackSession);
    }
  };

  const handleLeaveRoom = () => {
    localStorage.removeItem(STORAGE_KEY);
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

  const handleSubmitAnswer = (selectedOption: number) => {
    const currentQ = publicState?.activeQuestion || SAMPLE_QUESTIONS[0];
    if (socket.connected && session) {
      socket.emit(
        CLIENT_EVENTS.ANSWER_QUESTION,
        {
          questionId: currentQ.id,
          selectedOption,
        },
        (res: Ack<AnswerQuestionResult>) => {
          if (res.ok) {
            setPrivateState(res.data.privateState);
          }
        }
      );
    }
  };

  const handleExecuteAbility = (targetTeamNumber: number) => {
    if (socket.connected && session) {
      const targetTeam = (publicState?.teams || mockTeams).find((t) => t.teamNumber === targetTeamNumber);
      socket.emit(
        CLIENT_EVENTS.USE_ABILITY,
        {
          targetTeamId: targetTeam?.id || `team-${targetTeamNumber}`,
        },
        (res: Ack<PlayerActionResult>) => {
          if (!res.ok) setErrorMessage(res.error.message);
        }
      );
    }
  };

  const activeFaction: Faction = activeRole === "CORRUPTOR" ? "CORRUPTION" : "TRUST";
  const activeQuestion: PublicQuestion = publicState?.activeQuestion || SAMPLE_QUESTIONS[0];
  const questionDetail = SAMPLE_QUESTIONS.find(q => q.id === activeQuestion.id) || SAMPLE_QUESTIONS[0];
  const teams = publicState?.teams || lobby?.teams || mockTeams;

  return (
    <PlayerContext.Provider
      value={{
        session,
        lobby: lobby || mockLobby,
        publicState,
        privateState,
        loading,
        errorMessage,
        setErrorMessage,
        handleJoin,
        handleLeaveRoom,
        handleConfirmReady,
        handleSubmitAnswer,
        handleExecuteAbility,
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
