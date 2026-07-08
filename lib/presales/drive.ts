import { google } from "googleapis";
import { Readable } from "node:stream";
import { DOCUMENT_TYPE_FOLDER } from "./documentTypes";

function getDriveClient() {
  const rawKey = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
  if (!rawKey) {
    throw new Error(
      "GOOGLE_SERVICE_ACCOUNT_KEY is not set. Add the Drive service account JSON key to .env.local."
    );
  }

  const credentials = JSON.parse(
    rawKey.trim().startsWith("{") ? rawKey : Buffer.from(rawKey, "base64").toString("utf8")
  );

  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ["https://www.googleapis.com/auth/drive"],
  });

  return google.drive({ version: "v3", auth });
}

async function createJourneyFolder(drive: ReturnType<typeof getDriveClient>, folderName: string) {
  // .trim() guards against a stray trailing newline/whitespace from how the
  // value was pasted into the hosting provider's env var UI — Drive treats
  // "<id>\n" as a different, nonexistent id and fails with a 404.
  const rootFolderId = process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID?.trim();
  if (!rootFolderId) {
    throw new Error("GOOGLE_DRIVE_ROOT_FOLDER_ID is not set. Add it to .env.local.");
  }

  const folder = await drive.files.create({
    requestBody: {
      name: folderName,
      mimeType: "application/vnd.google-apps.folder",
      parents: [rootFolderId],
    },
    fields: "id",
    supportsAllDrives: true,
  });

  const folderId = folder.data.id!;

  // Grants inherit down to everything created inside this folder afterwards
  // (subfolders and files alike), so this is the only place we set sharing.
  await drive.permissions.create({
    fileId: folderId,
    requestBody: { type: "anyone", role: "reader" },
    supportsAllDrives: true,
  });

  return folderId;
}

function escapeForDriveQuery(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/'/g, "\\'");
}

async function getOrCreateSubfolder(
  drive: ReturnType<typeof getDriveClient>,
  parentFolderId: string,
  name: string
) {
  const existing = await drive.files.list({
    q: `'${parentFolderId}' in parents and name = '${escapeForDriveQuery(name)}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
    fields: "files(id)",
    includeItemsFromAllDrives: true,
    supportsAllDrives: true,
  });

  const existingId = existing.data.files?.[0]?.id;
  if (existingId) return existingId;

  const created = await drive.files.create({
    requestBody: {
      name,
      mimeType: "application/vnd.google-apps.folder",
      parents: [parentFolderId],
    },
    fields: "id",
    supportsAllDrives: true,
  });

  return created.data.id!;
}

async function resolveTargetFolder(
  drive: ReturnType<typeof getDriveClient>,
  params: { journeyName: string; documentType: string; existingFolderId: string | null }
) {
  const journeyFolderId =
    params.existingFolderId ?? (await createJourneyFolder(drive, params.journeyName));

  const subfolderName = DOCUMENT_TYPE_FOLDER[params.documentType] ?? DOCUMENT_TYPE_FOLDER.other;
  const subfolderId = await getOrCreateSubfolder(drive, journeyFolderId, subfolderName);

  return { journeyFolderId, subfolderId };
}

// Staff paste a Drive share link (or a bare file id) for a file that's
// already sitting elsewhere in Drive (e.g. a ~40-50MB meeting recording) —
// this pulls the id out of the common link shapes so they don't have to
// extract it by hand.
export function extractDriveFileId(input: string): string {
  const trimmed = input.trim();
  const pathMatch = trimmed.match(/\/d\/([a-zA-Z0-9_-]{10,})/);
  if (pathMatch) return pathMatch[1];
  const queryMatch = trimmed.match(/[?&]id=([a-zA-Z0-9_-]{10,})/);
  if (queryMatch) return queryMatch[1];
  return trimmed;
}

// Copies a file that already exists elsewhere in Drive straight into the
// journey's folder via the Drive API's own server-to-server copy — no bytes
// ever pass through our app, so this has none of the upload-size limits of
// `uploadFileToDrive` and is the right tool for large files (recordings,
// etc.) that are already in a Drive the service account can read.
export async function copyExistingDriveFile(params: {
  sourceFileId: string;
  fileName: string;
  journeyName: string;
  documentType: string;
  existingFolderId: string | null;
}): Promise<{ driveFileId: string; webViewLink: string; folderId: string }> {
  const drive = getDriveClient();
  const { journeyFolderId, subfolderId } = await resolveTargetFolder(drive, params);

  const copied = await drive.files.copy({
    fileId: params.sourceFileId,
    requestBody: {
      name: params.fileName,
      parents: [subfolderId],
    },
    fields: "id, webViewLink",
    supportsAllDrives: true,
  });

  return {
    driveFileId: copied.data.id!,
    webViewLink: copied.data.webViewLink!,
    folderId: journeyFolderId,
  };
}

export async function uploadFileToDrive(params: {
  file: File;
  fileName: string;
  journeyName: string;
  documentType: string;
  existingFolderId: string | null;
}): Promise<{ driveFileId: string; webViewLink: string; folderId: string }> {
  const drive = getDriveClient();

  const { journeyFolderId, subfolderId } = await resolveTargetFolder(drive, params);

  const buffer = Buffer.from(await params.file.arrayBuffer());

  // Created in two steps rather than one combined `requestBody` + `media`
  // call: googleapis' multipart upload encodes the metadata JSON part without
  // a charset on its Content-Type, so non-ASCII bytes (Turkish ı/ş/ğ/ü/ö/ç)
  // in `name` arrive mangled on Drive. A metadata-only create (plain JSON
  // POST, correctly UTF-8) followed by a media-only update sidesteps that
  // multipart path entirely.
  const created = await drive.files.create({
    requestBody: {
      name: params.fileName,
      parents: [subfolderId],
    },
    fields: "id, webViewLink",
    supportsAllDrives: true,
  });

  await drive.files.update({
    fileId: created.data.id!,
    media: {
      mimeType: params.file.type || "application/octet-stream",
      body: Readable.from(buffer),
    },
    supportsAllDrives: true,
  });

  return {
    driveFileId: created.data.id!,
    webViewLink: created.data.webViewLink!,
    folderId: journeyFolderId,
  };
}
