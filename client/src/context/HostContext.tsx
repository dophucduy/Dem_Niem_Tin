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
  handleStartGame: (onSuccess?: () => void, onError?: (err: string) => void) => void;
  handleResetRoom: () => void;
  handleDestroyRoom: () => void;
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

  const handleStartGame = (onSuccess?: () => void, onError?: (err: string) => void) => {
    if (!hostSession) {
      return;
    }
    setLoading(true);
    socket.emit(CLIENT_EVENTS.START_GAME, hostSession, (res: Ack<HostGameCommandResult>) => {
      setLoading(false);
      if (res.ok) {
        setPublicState(res.data.publicState);
        setErrorMessage(null);
        onSuccess?.();
      } else {
        let msg = res.error?.message || "Không thể bắt đầu trò chơi.";
        if (msg.includes("At least two participants")) {
          msg = "Cần ít nhất 2 người tham gia để bắt đầu ván chơi.";
        } else if (msg.includes("All participants must be connected")) {
          msg = "Hãy đợi tất cả người tham gia kết nối lại trước khi bắt đầu.";
        }
        setErrorMessage(msg);
        onError?.(msg);
      }
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

  const teams = publicState?.teams ?? lobby?.teams ?? [];

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

