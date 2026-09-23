import React, { createContext, useContext, useState, useEffect } from "react";
import {
  CLIENT_EVENTS,
  SERVER_EVENTS,
  type Ack,
  type CreateRoomResult,
  type HostGameCommandResult,
  type HostReconnectResult,
  type LobbyState,
  type PublicGameState,
  type ResetGameResult,
} from "@dem-niem-tin/shared";
import { socket } from "../services/socket";

const HOST_STORAGE_KEY = "dem_niem_tin_host_session";

export interface StoredHostSession {
  roomCode: string;
  hostSessionToken: string;
}

export interface HostContextType {
  hostSession: StoredHostSession | null;
  lobby: LobbyState | null;
  publicState: PublicGameState | null;
  loading: boolean;
  errorMessage: string | null;
  handleCreateRoom: () => void;
  handleStartGame: () => void;
  handleResetRoom: () => void;
  handleDestroyRoom: () => void;
  handleSimulateFullLobby: () => void;
  runGameCommand: (command: "pause" | "resume" | "skip" | "restart" | "end") => void;
  teams: any[];
}

const HostContext = createContext<HostContextType | null>(null);

export const HostProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [hostSession, setHostSession] = useState<StoredHostSession | null>(() => {
    try {
      const saved = localStorage.getItem(HOST_STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const emptyTeams = Array.from({ length: 8 }, (_, i) => ({
    id: `team-${i + 1}`,
    teamNumber: i + 1,
    displayName: undefined,
    connected: false,
    ready: false,
    eliminated: false,
  }));

  const mockLobby: LobbyState = {
    roomId: "host-room-mock",
    roomCode: hostSession?.roomCode || "",
    status: "LOBBY",
    teams: emptyTeams as any,
    connectedCount: 0,
    capacity: 8,
  };

  const [lobby, setLobby] = useState<LobbyState | null>(null);
  const [publicState, setPublicState] = useState<PublicGameState | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!socket.connected) socket.connect();
    const updateLobby = (state: LobbyState) => setLobby(state);
    const updateGame = (state: PublicGameState) => setPublicState(state);
    socket.on(SERVER_EVENTS.LOBBY_UPDATED, updateLobby);
    socket.on(SERVER_EVENTS.PUBLIC_STATE_UPDATED, updateGame);
    return () => {
      socket.off(SERVER_EVENTS.LOBBY_UPDATED, updateLobby);
      socket.off(SERVER_EVENTS.PUBLIC_STATE_UPDATED, updateGame);
    };
  }, []);

  useEffect(() => {
    if (!hostSession) return;
    const reconnect = () => {
      socket.emit(CLIENT_EVENTS.HOST_RECONNECT, hostSession, (res: Ack<HostReconnectResult>) => {
        if (res.ok) {
          setLobby(res.data.room);
          setPublicState(res.data.publicState ?? null);
          setErrorMessage(null);
        } else {
          localStorage.removeItem(HOST_STORAGE_KEY);
          setHostSession(null);
          setLobby(null);
          setErrorMessage(res.error?.message || "Phiên phòng học trước đó đã kết thúc.");
        }
      });
    };
    socket.on("connect", reconnect);
    if (!socket.connected) socket.connect();
    else reconnect();
    return () => {
      socket.off("connect", reconnect);
    };
  }, [hostSession]);

  const handleCreateRoom = () => {
    setLoading(true);
    setErrorMessage(null);

    const doCreate = () => {
      socket.emit(CLIENT_EVENTS.CREATE_ROOM, { hostName: "Giảng viên" }, (res: Ack<CreateRoomResult>) => {
        setLoading(false);
        if (!res.ok) {
          setErrorMessage(res.error?.message || "Không thể tạo phòng.");
          return;
        }
        const session = {
          roomCode: res.data.room.roomCode,
          hostSessionToken: res.data.hostSessionToken,
        };
        localStorage.setItem(HOST_STORAGE_KEY, JSON.stringify(session));
        setHostSession(session);
        setLobby(res.data.room);
        setPublicState(null);
      });
    };

    if (!socket.connected) {
      socket.connect();
      socket.once("connect", doCreate);
      setTimeout(() => {
        if (!socket.connected) {
          setLoading(false);
          setErrorMessage("Không thể kết nối đến máy chủ trò chơi. Vui lòng kiểm tra lại mạng.");
        }
      }, 3500);
    } else {
      doCreate();
    }
  };

  const handleStartGame = () => {
    if (!hostSession) {
      // Local fallback for standalone UI testing
      return;
    }
    setLoading(true);
    socket.emit(CLIENT_EVENTS.START_GAME, hostSession, (res: Ack<HostGameCommandResult>) => {
      setLoading(false);
      if (res.ok) {
        setPublicState(res.data.publicState);
        setErrorMessage(null);
      } else setErrorMessage(res.error.message);
    });
  };

  const handleResetRoom = () => {
    if (!hostSession) return;
    setLoading(true);
    socket.emit(CLIENT_EVENTS.RESET_GAME, hostSession, (res: Ack<ResetGameResult>) => {
      setLoading(false);
      if (res.ok) {
        setLobby(res.data.room);
        setPublicState(null);
        setErrorMessage(null);
      } else setErrorMessage(res.error.message);
    });
  };

  const handleDestroyRoom = () => {
    localStorage.removeItem(HOST_STORAGE_KEY);
    setHostSession(null);
    setLobby(null);
    setPublicState(null);
    setErrorMessage(null);
  };

  const runGameCommand = (command: "pause" | "resume" | "skip" | "restart" | "end") => {
    if (!hostSession) return;
    setLoading(true);
    const acknowledge = (res: Ack<HostGameCommandResult>) => {
      setLoading(false);
      if (res.ok) {
        setPublicState(res.data.publicState);
        setErrorMessage(null);
      } else setErrorMessage(res.error.message);
    };
    if (command === "pause") socket.emit(CLIENT_EVENTS.PAUSE_GAME, hostSession, acknowledge);
    if (command === "resume") socket.emit(CLIENT_EVENTS.RESUME_GAME, hostSession, acknowledge);
    if (command === "skip") socket.emit(CLIENT_EVENTS.SKIP_TIMER, hostSession, acknowledge);
    if (command === "restart") socket.emit(CLIENT_EVENTS.RESTART_ROUND, hostSession, acknowledge);
    if (command === "end") socket.emit(CLIENT_EVENTS.END_GAME, hostSession, acknowledge);
  };

  const handleSimulateFullLobby = () => {
    const targetLobby = lobby || mockLobby;
    const simulatedTeams = Array.from({ length: 8 }, (_, i) => ({
      id: `sim-team-${i + 1}`,
      teamNumber: i + 1,
      displayName: `Đội ${i + 1} (Test)`,
      connected: true,
      ready: true,
      eliminated: false,
    }));
    setLobby({
      ...targetLobby,
      teams: simulatedTeams as any,
      connectedCount: 8,
    });
  };

  const teams = publicState?.teams ?? lobby?.teams ?? emptyTeams;

  return (
    <HostContext.Provider
      value={{
        hostSession,
        lobby,
        publicState,
        loading,
        errorMessage,
        handleCreateRoom,
        handleStartGame,
        handleResetRoom,
        handleDestroyRoom,
        handleSimulateFullLobby,
        runGameCommand,
        teams,
      }}
    >
      {children}
    </HostContext.Provider>
  );
};

export const useHostGame = () => {
  const context = useContext(HostContext);
  if (!context) {
    throw new Error("useHostGame must be used within a HostProvider");
  }
  return context;
};

