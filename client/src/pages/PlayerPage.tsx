import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { 
  CLIENT_EVENTS, 
  SERVER_EVENTS, 
  LobbyState, 
  Ack 
} from "@dem-niem-tin/shared";
import { socket } from "../services/socket";
import { PlayerJoinView } from "../components/player/PlayerJoinView";
import { PlayerLobbyView } from "../components/player/PlayerLobbyView";
import { AppHeader } from "../components/common/AppHeader";

const STORAGE_KEY = "dem_niem_tin_player_session";

interface StoredSession {
  roomCode: string;
  sessionToken: string;
  teamNumber: number;
  playerId: string;
  teamId: string;
}

export function PlayerPage() {
  const [searchParams] = useSearchParams();
  const codeFromUrl = searchParams.get("code") || "";

  const [session, setSession] = useState<StoredSession | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [lobby, setLobby] = useState<LobbyState | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Setup socket listeners
  useEffect(() => {
    if (!socket.connected) {
      socket.connect();
    }

    const handleLobbyUpdated = (updatedLobby: LobbyState) => {
      setLobby(updatedLobby);
    };

    socket.on(SERVER_EVENTS.LOBBY_UPDATED, handleLobbyUpdated);

    // Try auto-reconnect if session exists
    if (session && !lobby) {
      setLoading(true);
      socket.emit(
        CLIENT_EVENTS.RECONNECT,
        { roomCode: session.roomCode, sessionToken: session.sessionToken },
        (res: Ack<any>) => {
          setLoading(false);
          if (res.ok) {
            setLobby(res.data.room);
          } else {
            // Session expired or invalid
            localStorage.removeItem(STORAGE_KEY);
            setSession(null);
          }
        }
      );
    }

    return () => {
      socket.off(SERVER_EVENTS.LOBBY_UPDATED, handleLobbyUpdated);
    };
  }, [session]);

  const handleJoin = (roomCode: string, teamNumber: number, displayName?: string) => {
    setLoading(true);
    setErrorMessage(null);

    if (!socket.connected) {
      socket.connect();
    }

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
          setErrorMessage(res.error.message || "Không thể tham gia phòng. Vui lòng kiểm tra mã phòng.");
        }
      }
    );

    // Development/UI preview fallback if server handler is still in development
    setTimeout(() => {
      if (!lobby && loading) {
        // Mock fallback for UI/UX testing
        const mockTeams = Array.from({ length: 8 }, (_, i) => ({
          id: `team-${i + 1}`,
          teamNumber: i + 1,
          displayName: i + 1 === teamNumber ? displayName || `Đội ${i + 1}` : undefined,
          connected: i + 1 === teamNumber || i === 0 || i === 1,
          ready: i + 1 === teamNumber,
          eliminated: false,
        }));

        const mockLobby: LobbyState = {
          roomId: "mock-room-123",
          roomCode: roomCode.toUpperCase(),
          status: "LOBBY",
          teams: mockTeams as any,
          connectedCount: 3,
          capacity: 8,
        };

        const mockSession: StoredSession = {
          roomCode: roomCode.toUpperCase(),
          sessionToken: "mock-token-abc",
          teamNumber,
          playerId: "mock-player-id",
          teamId: `team-${teamNumber}`,
        };

        setLoading(false);
        setSession(mockSession);
        setLobby(mockLobby);
      }
    }, 1500);
  };

  const handleLeaveRoom = () => {
    localStorage.removeItem(STORAGE_KEY);
    setSession(null);
    setLobby(null);
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen flex flex-col justify-between">
      {/* Header */}
      {lobby && session ? (
        <AppHeader
          roleMode="PLAYER"
          roomCode={lobby.roomCode}
          teamDisplayName={`Đội ${session.teamNumber}`}
          phase="LOBBY"
        />
      ) : null}

      {/* Main Content Area */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
        {!lobby || !session ? (
          <PlayerJoinView
            initialRoomCode={codeFromUrl}
            loading={loading}
            errorMessage={errorMessage}
            onJoin={handleJoin}
          />
        ) : (
          <PlayerLobbyView
            lobby={lobby}
            myTeamNumber={session.teamNumber}
            myPlayerId={session.playerId}
            onLeaveRoom={handleLeaveRoom}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="py-3 text-center text-xs text-slate-500">
        Đêm Niềm Tin • Giao diện đội chơi di động
      </footer>
    </div>
  );
}
