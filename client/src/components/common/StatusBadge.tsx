import React from "react";
import { 
  Moon, 
  Sun, 
  Vote, 
  Trophy, 
  Users, 
  ShieldCheck, 
  AlertTriangle, 
  UserCheck, 
  Lock, 
  Sparkles,
  Wifi,
  WifiOff
} from "lucide-react";
import { PublicPhase, EffectiveState, Faction } from "@dem-niem-tin/shared";

type BadgeType = 
  | { kind: "phase"; phase: PublicPhase; round?: number }
  | { kind: "effectiveState"; state: EffectiveState }
  | { kind: "faction"; faction: Faction }
  | { kind: "connection"; connected: boolean }
  | { kind: "actionStatus"; status: "pending" | "ready" | "answered" | "voted" | "eliminated" };

export const StatusBadge: React.FC<BadgeType> = (props) => {
  if (props.kind === "phase") {
    switch (props.phase) {
      case "NIGHT":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-950/80 text-indigo-300 border border-indigo-700/50 shadow-sm">
            <Moon className="w-3.5 h-3.5 text-indigo-400" />
            ĐÊM {props.round ? `0${props.round}` : ""}
          </span>
        );
      case "DAY":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-950/80 text-amber-300 border border-amber-700/50 shadow-sm">
            <Sun className="w-3.5 h-3.5 text-amber-400" />
            NGÀY {props.round ? `0${props.round}` : ""}
          </span>
        );
      case "VOTING":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-corruption-950/80 text-corruption-300 border border-corruption-700/50 shadow-sm">
            <Vote className="w-3.5 h-3.5 text-corruption-400" />
            BỎ PHIẾU {props.round ? `0${props.round}` : ""}
          </span>
        );
      case "FINAL":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-trust-950/90 text-trust-300 border border-trust-600/60 shadow-glow">
            <Trophy className="w-3.5 h-3.5 text-trust-400" />
            CHUNG CUỘC
          </span>
        );
      case "LOBBY":
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-800/90 text-slate-300 border border-slate-700 shadow-sm">
            <Users className="w-3.5 h-3.5 text-slate-400" />
            PHÒNG CHỜ
          </span>
        );
    }
  }

  if (props.kind === "effectiveState") {
    if (props.state === "SPECIAL") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-righteous-950/80 text-righteous-400 border border-righteous-700/60">
          <Sparkles className="w-3 h-3 text-righteous-400" />
          NĂNG LỰC: MỞ KHÓA
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-800 text-slate-300 border border-slate-600">
        <Lock className="w-3 h-3 text-amber-400" />
        TRẠNG THÁI: CÔNG DÂN TẠM THỜI
      </span>
    );
  }

  if (props.kind === "faction") {
    if (props.faction === "TRUST") {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold bg-justice-950/90 text-justice-400 border border-justice-600/50">
          <ShieldCheck className="w-4 h-4 text-justice-400" />
          PHE BẢO VỆ NIỀM TIN
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold bg-corruption-950/90 text-corruption-400 border border-corruption-600/50">
        <AlertTriangle className="w-4 h-4 text-corruption-400" />
        PHE THAM NHŨNG
      </span>
    );
  }

  if (props.kind === "connection") {
    return props.connected ? (
      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-righteous-400">
        <Wifi className="w-3 h-3 text-righteous-400" />
        Online
      </span>
    ) : (
      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500">
        <WifiOff className="w-3 h-3 text-slate-500" />
        Mất mạng
      </span>
    );
  }

  if (props.kind === "actionStatus") {
    switch (props.status) {
      case "ready":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-righteous-950/60 text-righteous-400 border border-righteous-700/40">
            <UserCheck className="w-3 h-3" />
            Sẵn sàng
          </span>
        );
      case "answered":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-justice-950/60 text-justice-400 border border-justice-700/40">
            Đã nộp bài
          </span>
        );
      case "voted":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-trust-950/60 text-trust-400 border border-trust-700/40">
            Đã bỏ phiếu
          </span>
        );
      case "eliminated":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-corruption-950/80 text-corruption-400 border border-corruption-700/40 line-through">
            Đã bị xử lý
          </span>
        );
      case "pending":
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-slate-800 text-slate-400">
            Đang chờ
          </span>
        );
    }
  }

  return null;
};

