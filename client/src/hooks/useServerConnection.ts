import {
  CLIENT_EVENTS,
  SERVER_EVENTS,
  type ClientType,
  type ConnectionReadyPayload,
  type ConnectionStatus,
} from "@dem-niem-tin/shared";
import { useEffect, useState } from "react";
import { socket } from "../services/socket";

export function useServerConnection(clientType: ClientType) {
  const [status, setStatus] = useState<ConnectionStatus>("connecting");
  const [details, setDetails] = useState<ConnectionReadyPayload | null>(null);

  useEffect(() => {
    const handleConnect = () => {
      setStatus("connecting");
      socket.emit(CLIENT_EVENTS.CONNECTION_CHECK, { clientType });
    };
    const handleReady = (payload: ConnectionReadyPayload) => {
      if (payload.clientType === clientType) {
        setDetails(payload);
        setStatus("connected");
      }
    };
    const handleDisconnect = () => setStatus("disconnected");

    socket.on("connect", handleConnect);
    socket.on(SERVER_EVENTS.CONNECTION_READY, handleReady);
    socket.on("disconnect", handleDisconnect);
    socket.connect();
    if (socket.connected) handleConnect();

    return () => {
      socket.off("connect", handleConnect);
      socket.off(SERVER_EVENTS.CONNECTION_READY, handleReady);
      socket.off("disconnect", handleDisconnect);
    };
  }, [clientType]);

  return { status, details };
}
