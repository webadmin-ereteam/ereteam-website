// A browser-supplied `file.type` is just a label the client attached to the
// upload — trivially spoofable by anyone crafting a raw multipart request,
// which is exactly what the customer survey's file-answer upload is exposed
// to (no login, just a possession-of-token check). This checks the file's
// actual leading bytes against the signature real files of that type start
// with, so a MIME-type claim can't be used to sneak an arbitrary file past
// the allowlist in `fileUpload.ts`.
//
// Formats with no reliable magic number (text/plain, text/csv) have no
// entry here and are intentionally left unchecked — same as before this
// existed, not a new gap.

function matches(bytes: Uint8Array, signature: number[], offset = 0): boolean {
  if (bytes.length < offset + signature.length) return false;
  return signature.every((b, i) => bytes[offset + i] === b);
}

const isZip = (b: Uint8Array) =>
  matches(b, [0x50, 0x4b, 0x03, 0x04]) || matches(b, [0x50, 0x4b, 0x05, 0x06]) || matches(b, [0x50, 0x4b, 0x07, 0x08]);
const isOle = (b: Uint8Array) => matches(b, [0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1]);

const SIGNATURE_CHECKS: Record<string, (bytes: Uint8Array) => boolean> = {
  "image/png": (b) => matches(b, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  "image/jpeg": (b) => matches(b, [0xff, 0xd8, 0xff]),
  "image/gif": (b) => matches(b, [0x47, 0x49, 0x46, 0x38]),
  "image/webp": (b) => matches(b, [0x52, 0x49, 0x46, 0x46]) && matches(b, [0x57, 0x45, 0x42, 0x50], 8),
  "application/pdf": (b) => matches(b, [0x25, 0x50, 0x44, 0x46]),
  "application/zip": isZip,
  // The three OOXML formats (docx/xlsx/pptx) are all just a ZIP container —
  // telling them apart requires reading the archive's internal manifest,
  // which is more than a signature check buys here. Confirming "this is at
  // least a real ZIP file" is what actually matters: it rules out a
  // renamed executable or script, which is the attack this defends against.
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": isZip,
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": isZip,
  "application/vnd.openxmlformats-officedocument.presentationml.presentation": isZip,
  // Legacy (pre-2007) Office formats share the OLE2 compound-file signature.
  "application/msword": isOle,
  "application/vnd.ms-excel": isOle,
  "application/vnd.ms-powerpoint": isOle,
};

// Reads only the file's first 16 bytes — enough for every signature above —
// rather than the whole file, so this stays cheap even for a multi-MB upload.
export async function fileContentMatchesDeclaredType(file: File): Promise<boolean> {
  const check = SIGNATURE_CHECKS[file.type];
  if (!check) return true; // no signature defined for this type — nothing to check
  const header = new Uint8Array(await file.slice(0, 16).arrayBuffer());
  return check(header);
}
