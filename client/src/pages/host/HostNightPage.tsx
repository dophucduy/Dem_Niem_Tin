import React, { useState } from "react";
import { useHostGame } from "../../context/HostContext";
import { HostNightStage } from "../../components/host/HostNightStage";
import { SAMPLE_QUESTIONS } from "../../data/sampleQuestions";

export function HostNightPage() {
  const { publicState, teams, loading, runGameCommand } = useHostGame();

  const [localPaused, setLocalPaused] = useState(false);
  const [localEndsAt] = useState(() => Date.now() + 180 * 1000);

  const question = publicState?.activeQuestion || SAMPLE_QUESTIONS[0];
  const round = publicState?.round || 1;
  const trust = publicState?.trust || 100;
  const paused = publicState?.paused ?? localPaused;
  const phaseEndsAt = publicState?.phaseEndsAt ?? localEndsAt;

  const handlePauseToggle = () => {
    if (publicState) {
      runGameCommand(paused ? "resume" : "pause");
    } else {
      setLocalPaused(!localPaused);
    }
  };

  const handleSkip = () => {
    runGameCommand("skip");
  };

  return (
    <HostNightStage
      round={round}
      question={question}
      teams={teams}
      trust={trust}
      phaseEndsAt={phaseEndsAt}
      paused={paused}
      onPauseToggle={handlePauseToggle}
      onSkipTimer={handleSkip}
      onResolveNight={handleSkip}
      loading={loading}
    />
  );
}

