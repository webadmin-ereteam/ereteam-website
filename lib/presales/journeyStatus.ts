// `Journey.status` values stay in English in the DB (touched by too many
// places to rename safely) — this is just the display label for each.
export const JOURNEY_STATUSES = ["active", "won", "lost", "paused"] as const;

export const JOURNEY_STATUS_LABELS: Record<string, string> = {
  active: "Aktif",
  won: "Kazanıldı",
  lost: "Kaybedildi",
  paused: "Duraklatıldı",
};
