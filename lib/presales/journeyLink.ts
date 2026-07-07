// The no-login customer link is only ever "active" when the journey itself is
// active, hasn't been manually disabled, and isn't archived — used identically
// wherever the link's effective state needs to be checked (customer page,
// admin settings, journey header badge).
export function isJourneyLinkActive(journey: { status: string; linkDisabled: boolean; archived: boolean }): boolean {
  return journey.status === "active" && !journey.linkDisabled && !journey.archived;
}
