import React from "react";
import { useNavigate } from "react-router-dom";
import { useHostGame } from "../../context/HostContext";
import { HostFinalStage } from "../../components/host/HostFinalStage";

export function HostFinalPage() {
  const navigate = useNavigate();
  const { publicState, teams, loading, handleDestroyRoom } = useHostGame();

  const trust = publicState?.trust ?? 100;

  const handleReset = () => {
    if (window.confirm("Bắt đầu trận đấu mới? Thao tác này sẽ đóng phòng hiện tại.")) {
      handleDestroyRoom();
      navigate("/host/lobby");
    }
  };

  return (
    <HostFinalStage
      trust={trust}
      teams={teams}
      onResetRoom={handleReset}
      loading={loading}
    />
  );
}
