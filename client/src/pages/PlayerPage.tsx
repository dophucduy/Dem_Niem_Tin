import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { 
  CLIENT_EVENTS, 
  SERVER_EVENTS, 
  LobbyState, 
  PublicGameState,
  PrivatePlayerState,
  PublicQuestion,
  Role,
  Faction,
  Ack 
} from "@dem-niem-tin/shared";
import { socket } from "../services/socket";
import { PlayerJoinView } from "../components/player/PlayerJoinView";
import { PlayerLobbyView } from "../components/player/PlayerLobbyView";
import { RoleRevealView } from "../components/player/RoleRevealView";
import { NightQuestionView } from "../components/player/NightQuestionView";
import { AppHeader } from "../components/common/AppHeader";
import { ROLE_DEFINITIONS } from "../data/roleDefinitions";
import { SAMPLE_QUESTIONS } from "../data/sampleQuestions";
import { Sparkles } from "lucide-react";

const STORAGE_KEY = "dem_niem_tin_player_session";

interface StoredSession {
  roomCode: string;
  sessionToken: string;
  teamNumber: number;
  playerId: string;
  teamId: string;
}

type PlayerScreen = "AUTO" | "P01_JOIN" | "P02_LOBBY" | "P03_ROLE" | "P04_QUESTION";

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

  // UI Test / Designer Preview state
  const [demoScreen, setDemoScreen] = useState<PlayerScreen>("AUTO");
  const [demoRole, setDemoRole] = useState<Role>("INSPECTOR");

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
      socket.emit(CLIENT_EVENTS.READY, { ready: true }, (res) => {
        if (res.ok) setLobby(res.data.room);
        else setErrorMessage(res.error.message);
      });
    }
  };

  const handleSubmitAnswer = (selectedOption: number) => {
    const currentQ = publicState?.activeQuestion || SAMPLE_QUESTIONS[0];
    if (socket.connected && session) {
      socket.emit(CLIENT_EVENTS.ANSWER_QUESTION, {
        playerId: session.playerId,
        questionId: currentQ.id,
        answer: currentQ.options[selectedOption],
      }, (res) => {
        if (!res.ok) setErrorMessage(res.error.message);
      });
    }
  };

  // Determine current active role & question
  const activeRole: Role = privateState?.role || demoRole;
  const activeFaction: Faction = activeRole === "CORRUPTOR" ? "CORRUPTION" : "TRUST";
  const roleInfo = ROLE_DEFINITIONS[activeRole];
  const activeQuestion: PublicQuestion = publicState?.activeQuestion || SAMPLE_QUESTIONS[0];

  // Screen routing determination
  let currentScreen: PlayerScreen = demoScreen;
  if (demoScreen === "AUTO") {
    if (!session) {
      currentScreen = "P01_JOIN";
    } else if (publicState?.phase === "NIGHT") {
      currentScreen = "P04_QUESTION";
    } else if (privateState !== null) {
      currentScreen = "P03_ROLE";
    } else {
      currentScreen = "P02_LOBBY";
    }
  }

  return (
    <div className="min-h-screen flex flex-col justify-between">
      {/* Header */}
      {session ? (
        <AppHeader
          roleMode="PLAYER"
          roomCode={session.roomCode}
          teamDisplayName={`Đội ${session.teamNumber}`}
          phase={currentScreen === "P04_QUESTION" ? "NIGHT" : (publicState?.phase || "LOBBY")}
          round={publicState?.round || 1}
          trust={publicState?.trust || 100}
        />
      ) : null}

      {/* Main Content Area */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
        {currentScreen === "P01_JOIN" && (
          <PlayerJoinView
            initialRoomCode={codeFromUrl}
            loading={loading}
            errorMessage={errorMessage}
            onJoin={handleJoin}
          />
        )}

        {currentScreen === "P02_LOBBY" && (
          <PlayerLobbyView
            lobby={lobby || {
              roomId: "mock",
              roomCode: session?.roomCode || "NT4821",
              status: "LOBBY",
              teams: [],
              connectedCount: 1,
              capacity: 8
            }}
            myTeamNumber={session?.teamNumber || 1}
            myPlayerId={session?.playerId || "p1"}
            onLeaveRoom={handleLeaveRoom}
          />
        )}

        {currentScreen === "P03_ROLE" && (
          <RoleRevealView
            role={activeRole}
            faction={activeFaction}
            teamNumber={session?.teamNumber || 1}
            onConfirmReady={handleConfirmReady}
          />
        )}

        {currentScreen === "P04_QUESTION" && (
          <NightQuestionView
            question={activeQuestion}
            roundNumber={publicState?.round || 1}
            abilityName={roleInfo?.abilityName || "ĐIỀU TRA"}
            onSubmitAnswer={handleSubmitAnswer}
            loading={loading}
          />
        )}
      </main>

      {/* Developer UI Preview Switcher (Only visible to help test each screen) */}
      {session && (
        <div className="bg-night-950/95 border-t border-night-700/80 p-2.5 px-4 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 text-slate-400">
            <Sparkles className="w-3.5 h-3.5 text-trust-400" />
            <span className="font-semibold text-slate-300">Chuyển màn hình (UI Test):</span>
            <select
              value={demoScreen}
              onChange={(e) => setDemoScreen(e.target.value as PlayerScreen)}
              className="bg-night-800 border border-night-600 rounded px-2.5 py-1 text-white font-bold text-xs outline-none"
            >
              <option value="AUTO">Tự động (Theo trạng thái Game)</option>
              <option value="P02_LOBBY">P-02: Phòng chờ (Lobby)</option>
              <option value="P03_ROLE">P-03: Mở vai trò (Role Reveal)</option>
              <option value="P04_QUESTION">P-04: Thử thách tri thức đêm</option>
            </select>
          </div>

          {currentScreen === "P03_ROLE" && (
            <div className="flex items-center gap-1.5 text-slate-400">
              <span>Đổi vai:</span>
              <select
                value={activeRole}
                onChange={(e) => setDemoRole(e.target.value as Role)}
                className="bg-night-800 border border-night-600 rounded px-2 py-1 text-trust-300 font-bold text-xs outline-none"
              >
                <option value="INSPECTOR">Thanh Tra</option>
                <option value="CORRUPTOR">Người Vụ Lợi</option>
                <option value="LAW">Pháp Luật</option>
                <option value="WHISTLEBLOWER">Người Tố Giác</option>
                <option value="OVERSIGHT">Cơ Quan Giám Sát</option>
                <option value="SPECIAL_6">Giám Sát Tài Sản</option>
                <option value="SPECIAL_7">Minh Bạch Thông Tin</option>
              </select>
            </div>
          )}
        </div>
      )}

      {/* Footer */}
      <footer className="py-2.5 text-center text-xs text-slate-500">
        Đêm Niềm Tin • Giao diện đội chơi di động
      </footer>
    </div>
  );
}
