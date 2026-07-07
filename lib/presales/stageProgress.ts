type StageLike = { status: string; isActive: boolean };

// The single "current" stage is always the first one (in order) that isn't done yet —
// never a manually-set pointer. This keeps admin and customer views from ever disagreeing
// about where a case actually stands, even when a stage was jumped into early (e.g. an
// early proposal request) and is separately marked "active" out of sequence.
export function findCurrentStage<T extends StageLike>(orderedStages: T[]): T | undefined {
  return orderedStages.find((s) => s.isActive && s.status !== "completed" && s.status !== "skipped");
}
