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
  const rootFolderId = process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID;
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

export async function uploadFileToDrive(params: {
  file: File;
  fileName: string;
  journeyName: string;
  documentType: string;
  existingFolderId: string | null;
}): Promise<{ driveFileId: string; webViewLink: string; folderId: string }> {
  const drive = getDriveClient();

  const journeyFolderId =
    params.existingFolderId ?? (await createJourneyFolder(drive, params.journeyName));

  const subfolderName = DOCUMENT_TYPE_FOLDER[params.documentType] ?? DOCUMENT_TYPE_FOLDER.other;
  const subfolderId = await getOrCreateSubfolder(drive, journeyFolderId, subfolderName);

  const buffer = Buffer.from(await params.file.arrayBuffer());

  const uploaded = await drive.files.create({
    requestBody: {
      name: params.fileName,
      parents: [subfolderId],
    },
    media: {
      mimeType: params.file.type || "application/octet-stream",
      body: Readable.from(buffer),
    },
    fields: "id, webViewLink",
    supportsAllDrives: true,
  });

  return {
    driveFileId: uploaded.data.id!,
    webViewLink: uploaded.data.webViewLink!,
    folderId: journeyFolderId,
  };
}
