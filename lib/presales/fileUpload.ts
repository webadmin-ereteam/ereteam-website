// Vercel's serverless functions cap request bodies at ~4.5MB — this stays
// safely under that so uploads fail with a clear message instead of a raw 413.
export const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;
export const MAX_UPLOAD_LABEL = "4MB";
