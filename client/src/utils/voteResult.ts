import type { PublicGameEvent, VoteResultDetails } from "@dem-niem-tin/shared";

/**
 * Extracts the structured VOTE_RESULT / VOTE_TIE payload from public events.
 * Returns null when no vote result has been published yet — callers must never
 * fabricate fallback data.
 */
export function extractVoteDetails(
  events: PublicGameEvent[] | undefined,
  round: number
): VoteResultDetails | null {
  if (!events || events.length === 0) return null;

  const voteEvents = events.filter((ev) => ev.type === "VOTE_RESULT" || ev.type === "VOTE_TIE");
  if (voteEvents.length === 0) return null;

  const reversed = [...voteEvents].reverse();
  const event =
    reversed.find((ev) => {
      if (!ev.data) return false;
      try {
        const parsed = JSON.parse(ev.data) as Partial<VoteResultDetails>;
        return parsed.round === round;
      } catch {
        return false;
      }
    }) ?? reversed.find((ev) => typeof ev.data === "string");

  if (!event?.data) return null;

  try {
    const parsed = JSON.parse(event.data) as Partial<VoteResultDetails>;
    return {
      round: typeof parsed.round === "number" ? parsed.round : round,
      isTie: !!parsed.isTie,
      votesReceived: typeof parsed.votesReceived === "number" ? parsed.votesReceived : 0,
      voteDistribution: Array.isArray(parsed.voteDistribution)
        ? parsed.voteDistribution
            .filter((entry) => entry && typeof entry.teamNumber === "number")
            .map((entry) => ({
              teamNumber: entry.teamNumber,
              displayName: typeof entry.displayName === "string" ? entry.displayName : "",
              votes: typeof entry.votes === "number" ? entry.votes : 0,
            }))
        : [],
      eliminatedTeamNumber:
        typeof parsed.eliminatedTeamNumber === "number" ? parsed.eliminatedTeamNumber : undefined,
      eliminatedTeamName:
        typeof parsed.eliminatedTeamName === "string" ? parsed.eliminatedTeamName : undefined,
      faction: parsed.faction,
      role: parsed.role,
      trustDelta: typeof parsed.trustDelta === "number" ? parsed.trustDelta : 0,
    };
  } catch {
    return null;
  }
}
