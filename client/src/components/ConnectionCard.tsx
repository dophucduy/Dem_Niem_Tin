import type { ClientType } from "@dem-niem-tin/shared";
import { CircleCheck, LoaderCircle, WifiOff } from "lucide-react";
import { useServerConnection } from "../hooks/useServerConnection";

export function ConnectionCard({ clientType }: { clientType: ClientType }) {
  const { status, details } = useServerConnection(clientType);
  const connected = status === "connected";

  return (
    <section className="w-full max-w-lg rounded-2xl border border-slate-700 bg-slate-900/80 p-8 shadow-2xl">
      <div className="mb-6 flex items-center justify-center">
        {connected ? (
          <CircleCheck className="h-14 w-14 text-emerald-400" aria-hidden="true" />
        ) : status === "connecting" ? (
          <LoaderCircle className="h-14 w-14 animate-spin text-trust" aria-hidden="true" />
        ) : (
          <WifiOff className="h-14 w-14 text-red-400" aria-hidden="true" />
        )}
      </div>
      <h2 className="text-center text-2xl font-bold">
        {clientType === "HOST" ? "MÀN HÌNH HOST" : "MÀN HÌNH PLAYER"}
      </h2>
      <p className="mt-3 text-center text-slate-300">
        {connected
          ? "Đã kết nối với máy chủ"
          : status === "connecting"
            ? "Đang kết nối với máy chủ…"
            : "Mất kết nối với máy chủ"}
      </p>
      {details && (
        <p className="mt-5 break-all rounded-lg bg-slate-950 p-3 text-center text-xs text-slate-400">
          Socket: {details.socketId}
        </p>
      )}
    </section>
  );
}
