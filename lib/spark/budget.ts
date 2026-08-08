import { google } from "googleapis";

const DEFAULT_SHEET_ID = "1Yc-CO6QHlgOhVyvuuAp_2Oh4Ywm3kYKkfjFyZevfhyU";

function credentials() {
  const encoded = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
  if (!encoded) throw new Error("GOOGLE_SERVICE_ACCOUNT_KEY tanımlı değil");
  return JSON.parse(Buffer.from(encoded, "base64").toString("utf8"));
}

export async function fetchAnnualTarget(year: number) {
  const auth = new google.auth.GoogleAuth({
    credentials: credentials(),
    scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
  });
  const sheets = google.sheets({ version: "v4", auth });
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: process.env.SPARK_SHEET_ID || DEFAULT_SHEET_ID,
    range: "'Bütçe_Hedef'!A:D",
    valueRenderOption: "UNFORMATTED_VALUE",
  });
  const rows = response.data.values ?? [];
  return rows.slice(1).reduce((total, row) => {
    if (!String(row[0] ?? "").startsWith(`${year}-`)) return total;
    return total + (Number(row[2]) || 0) + (Number(row[3]) || 0);
  }, 0);
}
