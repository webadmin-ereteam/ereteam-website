// Used wherever admin-entered text (company/contact/rep names, survey
// titles) gets interpolated into an outbound HTML email — those fields are
// plain `<input>`s with no server-side stripping, so a raw `<`/`&` typed
// into one would otherwise land unescaped in the email body.
export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// Email headers (Subject in particular) are one line each — a stray CR/LF
// in a field that flows into one could otherwise inject an extra header.
export function stripNewlines(value: string): string {
  return value.replace(/[\r\n]+/g, " ");
}
