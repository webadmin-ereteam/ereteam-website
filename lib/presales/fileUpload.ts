// Vercel's serverless functions cap request bodies at ~4.5MB — this stays
// safely under that so uploads fail with a clear message instead of a raw 413.
export const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;
export const MAX_UPLOAD_LABEL = "4MB";

// Ordinary business-document types only — customer file-upload survey
// answers had no type restriction at all (size-capped only), so anything
// (an executable, a macro-laced doc disguised with a normal extension)
// could land in Drive for an admin to later download and open locally.
// This is a soft check, not a hard guarantee: `file.type` comes from the
// browser and a deliberate attacker crafting a raw multipart request could
// still set it to whatever they like — the real backstop is Drive's own
// scanning plus admins not blindly opening unexpected files. It does stop
// the ordinary/accidental case, which is what this is for.
export const ALLOWED_UPLOAD_MIME_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
  "text/plain",
  "text/csv",
  "application/zip",
];

export const ALLOWED_UPLOAD_ACCEPT =
  ".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.png,.jpg,.jpeg,.webp,.gif,.txt,.csv,.zip";

export const ALLOWED_UPLOAD_LABEL = "PDF, Word, Excel, PowerPoint, görsel, txt, csv veya zip";
