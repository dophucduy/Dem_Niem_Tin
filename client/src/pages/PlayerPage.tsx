import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { 
  CLIENT_EVENTS, 
  SERVER_EVENTS, 
  LobbyState, 
  PublicGameState,
  PrivatePlayerState,
  Role,
  Faction,
  Ack 
} from "@dem-niem-tin/shared";
import { socket } from "../services/socket";
import { PlayerJoinView } from "../components/player/PlayerJoinView";
import { PlayerLobbyView } from "../components/player/PlayerLobbyView";
import { RoleRevealView } from "../components/player/RoleRevealView";
import { AppHeader } from "../components/common/AppHeader";
import { Sparkles } from "lucide-react";

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
  const [publicState, setPublicState] = useState<PublicGameState | null>(null);
  const [privateState, setPrivateState] = useState<PrivatePlayerState | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Demo role state for frontend UI preview
  const [demoRole, setDemoRole] = useState<Role>("INSPECTOR");
  const [showRoleDemoSelector, setShowRoleDemoSelector] = useState(false);

  // Setup socket listeners
  useEffect(() => {
    if (!socket.connected) {
      socket.connect();
    }

    const handleLobbyUpdated = (updatedLobby: LobbyState) => {
      setLobby(updatedLobby);
    };

    const handlePublicState = (state: PublicGameState) => {
      setPublicState(state);
    };

    const handlePrivateState = (state: PrivatePlayerState) => {
      setPrivateState(state);
    };

    socket.on(SERVER_EVENTS.LOBBY_UPDATED, handleLobbyUpdated);
    socket.on(SERVER_EVENTS.PUBLIC_STATE_UPDATED, handlePublicState);
    socket.on(SERVER_EVENTS.PRIVATE_STATE_UPDATED, handlePrivateState);

    // Try auto-reconnect if session exists
    if (session && !lobby && !privateState) {
      setLoading(true);
      socket.emit(
        CLIENT_EVENTS.RECONNECT,
        { roomCode: session.roomCode, sessionToken: session.sessionToken },
        (res: Ack<any>) => {
          setLoading(false);
          if (res.ok) {
            setLobby(res.data.room);
            if (res.data.privateState) setPrivateState(res.data.privateState);
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

    // Development/UI preview fallback
    setTimeout(() => {
      if (!lobby && loading) {
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
    }, 1200);
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
      socket.emit(CLIENT_EVENTS.READY);
    }
  };

  // Determine current active role & faction
  const activeRole: Role = privateState?.role || demoRole;
  const activeFaction: Faction = activeRole === "CORRUPTOR" ? "CORRUPTION" : "TRUST";

  // Check if we should display the Role Reveal view
  const isRoleRevealPhase = 
    privateState !== null || 
    publicState?.phase === "LOBBY" || 
    showRoleDemoSelector;

  return (
    <div className="min-h-screen flex flex-col justify-between">
      {/* Header */}
      {session ? (
        <AppHeader
          roleMode="PLAYER"
          roomCode={session.roomCode}
          teamDisplayName={`Đội ${session.teamNumber}`}
          phase={publicState?.phase || "LOBBY"}
          round={publicState?.round || 1}
          trust={publicState?.trust || 100}
        />
      ) : null}

      {/* Main Content Area */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
        {!session ? (
          <PlayerJoinView
            initialRoomCode={codeFromUrl}
            loading={loading}
            errorMessage={errorMessage}
            onJoin={handleJoin}
          />
        ) : showRoleDemoSelector || privateState ? (
          <RoleRevealView
            role={activeRole}
            faction={activeFaction}
            teamNumber={session.teamNumber}
            onConfirmReady={handleConfirmReady}
          />
        ) : (
          <PlayerLobbyView
            lobby={lobby || {
              roomId: "mock",
              roomCode: session.roomCode,
              status: "LOBBY",
              teams: [],
              connectedCount: 1,
              capacity: 8
            }}
            myTeamNumber={session.teamNumber}
            myPlayerId={session.playerId}
            onLeaveRoom={handleLeaveRoom}
          />
        )}
      </main>

      {/* Development UI Preview Bar: Allows designer to test any role reveal */}
      {session && (
        <div className="bg-night-950/90 border-t border-night-700/80 p-2.5 px-4 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 text-slate-400">
            <Sparkles className="w-3.5 h-3.5 text-trust-400" />
            <span>Xem trước vai trò (UI Test):</span>
            <select
              value={activeRole}
              onChange={(e) => {
                setDemoRole(e.target.value as Role);
                setShowRoleDemoSelector(true);
              }}
              className="bg-night-800 border border-night-600 rounded px-2 py-1 text-white font-bold text-xs outline-none"
            >
              <option value="INSPECTOR">Thanh Tra (Bảo vệ niềm tin)</option>
              <option value="CORRUPTOR">Người Vụ Lợi (Tham nhũng)</option>
              <option value="LAW">Pháp Luật (Bảo vệ niềm tin)</option>
              <option value="WHISTLEBLOWER">Người Tố Giác (Bảo vệ niềm tin)</option>
              <option value="OVERSIGHT">Cơ Quan Giám Sát (Bảo vệ niềm tin)</option>
              <option value="SPECIAL_6">Giám Sát Tài Sản (Bảo vệ niềm tin)</option>
              <option value="SPECIAL_7">Minh Bạch Thông Tin (Bảo vệ niềm tin)</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowRoleDemoSelector(!showRoleDemoSelector)}
              className="px-2.5 py-1 rounded bg-night-800 hover:bg-night-700 border border-night-600 text-trust-300 font-bold"
            >
              {showRoleDemoSelector ? "Về phòng chờ (P-02)" : "Xem mở vai trò (P-03)"}
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="py-2.5 text-center text-xs text-slate-500">
        Đêm Niềm Tin • Giao diện đội chơi di động
      </footer>
    </div>
  );
}
