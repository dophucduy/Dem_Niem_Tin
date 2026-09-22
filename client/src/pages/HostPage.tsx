import { useState, useEffect } from "react";
import { 
  CLIENT_EVENTS, 
  SERVER_EVENTS, 
  LobbyState, 
  PublicGameState,
  Ack,
  CreateRoomResult
} from "@dem-niem-tin/shared";
import { socket } from "../services/socket";
import { HostLobbyView } from "../components/host/HostLobbyView";
import { HostRoleRevealStage } from "../components/host/HostRoleRevealStage";
import { AppHeader } from "../components/common/AppHeader";
import { GameButton } from "../components/common/GameButton";
import { Scale, Plus, AlertCircle } from "lucide-react";

const HOST_STORAGE_KEY = "dem_niem_tin_host_session";

interface StoredHostSession {
  roomCode: string;
  hostSessionToken: string;
}

export function HostPage() {
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
  const [currentView, setCurrentView] = useState<"LOBBY" | "ROLE_REVEAL" | "GAME">("LOBBY");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!socket.connected) {
      socket.connect();
    }

    const handleLobbyUpdated = (updatedLobby: LobbyState) => {
      setLobby(updatedLobby);
    };

    const handlePublicState = (state: PublicGameState) => {
      setPublicState(state);
      if (state.phase !== "LOBBY") {
        setCurrentView("GAME");
      }
    };

    socket.on(SERVER_EVENTS.LOBBY_UPDATED, handleLobbyUpdated);
    socket.on(SERVER_EVENTS.PUBLIC_STATE_UPDATED, handlePublicState);

    return () => {
      socket.off(SERVER_EVENTS.LOBBY_UPDATED, handleLobbyUpdated);
      socket.off(SERVER_EVENTS.PUBLIC_STATE_UPDATED, handlePublicState);
    };
  }, []);

  const handleCreateRoom = () => {
    setLoading(true);
    setErrorMessage(null);

    if (!socket.connected) {
      socket.connect();
    }

    socket.emit(
      CLIENT_EVENTS.CREATE_ROOM,
      { hostName: "Giảng viên" },
      (res: Ack<CreateRoomResult>) => {
        setLoading(false);
        if (res.ok) {
          const newSession: StoredHostSession = {
            roomCode: res.data.room.roomCode,
            hostSessionToken: res.data.hostSessionToken,
          };
          localStorage.setItem(HOST_STORAGE_KEY, JSON.stringify(newSession));
          setHostSession(newSession);
          setLobby(res.data.room);
          setCurrentView("LOBBY");
        } else {
          setErrorMessage(res.error.message || "Không thể tạo phòng.");
        }
      }
    );

    // Development/UI preview fallback
    setTimeout(() => {
      if (!lobby && loading) {
        const mockCode = "NT" + Math.floor(1000 + Math.random() * 9000);
        const mockTeams = Array.from({ length: 8 }, (_, i) => ({
          id: `team-${i + 1}`,
          teamNumber: i + 1,
          displayName: i < 5 ? `Nhóm ${i + 1}` : undefined,
          connected: true, // all 8 connected in preview to allow starting
          ready: i < 4,
          eliminated: false,
        }));

        const mockLobby: LobbyState = {
          roomId: "mock-host-room",
          roomCode: mockCode,
          status: "LOBBY",
          teams: mockTeams as any,
          connectedCount: 8,
          capacity: 8,
        };

        const mockHostSession: StoredHostSession = {
          roomCode: mockCode,
          hostSessionToken: "mock-host-token",
        };

        setLoading(false);
        setHostSession(mockHostSession);
        setLobby(mockLobby);
        setCurrentView("LOBBY");
      }
    }, 1200);
  };

  const handleStartGame = () => {
    setCurrentView("ROLE_REVEAL");
  };

  const handleProceedToNight = () => {
    alert("Chuyển sang Bước 4: Màn hình Thử thách Tri thức Ban đêm (P-04 & H-03)!");
  };

  const handleResetRoom = () => {
    localStorage.removeItem(HOST_STORAGE_KEY);
    setHostSession(null);
    setLobby(null);
    setPublicState(null);
    setCurrentView("LOBBY");
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen flex flex-col justify-between">
      {/* Header */}
      <AppHeader
        roleMode="HOST"
        roomCode={lobby?.roomCode}
        phase={currentView === "ROLE_REVEAL" ? "NIGHT" : (publicState?.phase || "LOBBY")}
        round={1}
      />

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-6 sm:p-8">
        {!lobby ? (
          <div className="w-full max-w-lg mx-auto text-center space-y-6">
            <div className="glass-panel-elevated rounded-3xl p-8 sm:p-10 border border-trust-500/40 space-y-6 shadow-2xl">
              <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br from-trust-500/20 to-night-800 border border-trust-500/40 flex items-center justify-center text-trust-400 shadow-glow">
                <Scale className="w-10 h-10" />
              </div>

              <div>
                <div className="text-xs uppercase tracking-[0.25em] text-trust-400 font-bold mb-1">
                  Màn hình Giảng viên / Ban tổ chức
                </div>
                <h1 className="text-3xl font-black text-white tracking-wide">
                  ĐIỀU KHIỂN PHÒNG HỌC
                </h1>
                <p className="text-xs sm:text-sm text-slate-400 mt-2">
                  Tạo phòng học mới để lấy mã phòng và mã QR cho 8 đội sinh viên kết nối.
                </p>
              </div>

              {errorMessage && (
                <div className="p-3.5 rounded-xl bg-corruption-950/80 border border-corruption-600/50 flex items-center gap-2 text-corruption-300 text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0 text-corruption-400" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <GameButton
                variant="primary"
                size="xl"
                fullWidth
                loading={loading}
                onClick={handleCreateRoom}
                icon={<Plus className="w-6 h-6 stroke-[3]" />}
              >
                KHỞI TẠO PHÒNG MỚI
              </GameButton>

              <div className="text-xs text-slate-500 font-mono">
                Tối ưu hiển thị cho máy chiếu 1280×720 & 1920×1080
              </div>
            </div>
          </div>
        ) : currentView === "ROLE_REVEAL" ? (
          <HostRoleRevealStage
            teams={lobby.teams}
            onProceedToNight={handleProceedToNight}
            loading={loading}
          />
        ) : (
          <HostLobbyView
            lobby={lobby}
            onStartGame={handleStartGame}
            onResetRoom={handleResetRoom}
            loading={loading}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="py-3 text-center text-xs text-slate-500">
        Đêm Niềm Tin — Phiên bản phòng học • Masterplan 1.0
      </footer>
    </div>
  );
}
