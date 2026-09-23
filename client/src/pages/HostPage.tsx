import { useEffect, useState } from "react";
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
import { AlertCircle, Plus, Scale } from "lucide-react";
import { AppHeader } from "../components/common/AppHeader";
import { GameButton } from "../components/common/GameButton";
import { HostLobbyView } from "../components/host/HostLobbyView";
import { HostNightStage } from "../components/host/HostNightStage";
import { HostRoleRevealStage } from "../components/host/HostRoleRevealStage";
import { HostRuntimeView } from "../components/host/HostRuntimeView";
import { socket } from "../services/socket";

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
        } else setErrorMessage(res.error.message);
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
    if (!socket.connected) socket.connect();
    socket.emit(CLIENT_EVENTS.CREATE_ROOM, { hostName: "Giảng viên" }, (res: Ack<CreateRoomResult>) => {
      setLoading(false);
      if (!res.ok) {
        setErrorMessage(res.error.message || "Không thể tạo phòng.");
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

  const handleStartGame = () => {
    if (!hostSession) return;
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
    if (!hostSession || !window.confirm("Reset toàn bộ game về Lobby?")) return;
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

  const runGameCommand = (command: "pause" | "resume" | "skip" | "restart" | "end") => {
    if (!hostSession) return;
    if (command === "end" && !window.confirm("Kết thúc game ngay bây giờ?")) return;
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
    <div className="min-h-screen flex flex-col justify-between">
      <AppHeader
        roleMode="HOST"
        roomCode={lobby?.roomCode}
        round={publicState?.round}
        phase={publicState?.phase ?? "LOBBY"}
        phaseEndsAt={publicState?.phaseEndsAt}
        paused={publicState?.paused}
        trust={publicState?.trust}
      />
      <main className="flex-1 flex items-center justify-center p-4 sm:p-8">
        {errorMessage && lobby && (
          <div className="fixed top-20 z-50 rounded-xl border border-corruption-600/50 bg-corruption-950/95 px-4 py-3 text-xs text-corruption-300">{errorMessage}</div>
        )}
        {!lobby ? (
          <div className="w-full max-w-lg mx-auto text-center space-y-6">
            <div className="glass-panel-elevated rounded-3xl p-8 sm:p-10 border border-trust-500/40 space-y-6 shadow-2xl">
              <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br from-trust-500/20 to-night-800 border border-trust-500/40 flex items-center justify-center text-trust-400 shadow-glow"><Scale className="w-10 h-10" /></div>
              <div>
                <div className="text-xs uppercase tracking-[0.25em] text-trust-400 font-bold mb-1">Màn hình Giảng viên / Ban tổ chức</div>
                <h1 className="text-3xl font-black text-white tracking-wide">ĐIỀU KHIỂN PHÒNG HỌC</h1>
                <p className="text-xs sm:text-sm text-slate-400 mt-2">Tạo phòng học mới để lấy mã phòng và mã QR cho 8 đội sinh viên kết nối.</p>
              </div>
              {errorMessage && (
                <div className="p-3.5 rounded-xl bg-corruption-950/80 border border-corruption-600/50 flex items-center gap-2 text-corruption-300 text-xs"><AlertCircle className="w-4 h-4 shrink-0 text-corruption-400" /><span>{errorMessage}</span></div>
              )}
              <GameButton variant="primary" size="xl" fullWidth loading={loading} onClick={handleCreateRoom} icon={<Plus className="w-6 h-6 stroke-[3]" />}>KHỞI TẠO PHÒNG MỚI</GameButton>
              <div className="text-xs text-slate-500 font-mono">Tối ưu hiển thị cho máy chiếu 1280×720 & 1920×1080</div>
            </div>
          </div>
        ) : !publicState ? (
          <HostLobbyView lobby={lobby} onStartGame={handleStartGame} onResetRoom={handleResetRoom} loading={loading} />
        ) : publicState.phase === "LOBBY" ? (
          <HostRoleRevealStage teams={teams} onProceedToNight={() => runGameCommand("skip")} loading={loading} />
        ) : publicState.phase === "NIGHT" && publicState.activeQuestion ? (
          <HostNightStage
            round={publicState.round}
            question={publicState.activeQuestion}
            teams={teams}
            trust={publicState.trust}
            phaseEndsAt={publicState.phaseEndsAt}
            paused={publicState.paused}
            onPauseToggle={() => runGameCommand(publicState.paused ? "resume" : "pause")}
            onSkipTimer={() => runGameCommand("skip")}
            onResolveNight={() => runGameCommand("skip")}
            loading={loading}
          />
        ) : (
          <HostRuntimeView
            state={publicState}
            loading={loading}
            onPause={() => runGameCommand("pause")}
            onResume={() => runGameCommand("resume")}
            onSkip={() => runGameCommand("skip")}
            onRestartRound={() => runGameCommand("restart")}
            onEnd={() => runGameCommand("end")}
            onReset={handleResetRoom}
          />
        )}
      </main>
      <footer className="py-2 text-center text-xs text-slate-500">Đêm Niềm Tin — Phiên bản phòng học • Masterplan 1.0</footer>
    </div>
  );
}
