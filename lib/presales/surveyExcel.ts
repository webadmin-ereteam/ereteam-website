import * as XLSX from "xlsx";

type SurveySelectionForExport = {
  text: string;
  type: string;
  options: unknown;
  required: boolean;
  response: { answerText: string | null; answerJson: unknown } | null;
};

function formatAnswer(selection: SurveySelectionForExport): string {
  if (!selection.response) return "(cevaplanmadı)";
  if (selection.type === "multi_choice") {
    const values = (selection.response.answerJson as string[] | null) ?? [];
    return values.length > 0 ? values.join(", ") : "(cevaplanmadı)";
  }
  return selection.response.answerText?.trim() || "(cevaplanmadı)";
}

export function buildSurveyExportBuffer(survey: {
  title: string;
  selections: SurveySelectionForExport[];
}): ArrayBuffer {
  const rows = survey.selections.map((s) => ({
    Soru: s.text,
    Cevap: formatAnswer(s),
    Zorunlu: s.required ? "evet" : "hayır",
  }));

  const sheet = XLSX.utils.json_to_sheet(rows, { header: ["Soru", "Cevap", "Zorunlu"] });
  sheet["!cols"] = [{ wch: 50 }, { wch: 50 }, { wch: 10 }];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, sheet, "Anket Cevapları");

  const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" }) as Buffer;
  const arrayBuffer = new ArrayBuffer(buffer.length);
  new Uint8Array(arrayBuffer).set(buffer);
  return arrayBuffer;
}

const FILENAME_ALLOWED_CHARS = /[^a-zA-Z0-9ığüşöçİĞÜŞÖÇ\s-]/g;

export function surveyExportFileName(title: string): string {
  const safeTitle = title.replace(FILENAME_ALLOWED_CHARS, "").trim().replace(/\s+/g, "-");
  return `${safeTitle || "anket"}-cevaplari.xlsx`;
}

// A `Content-Disposition` header value has to be a valid HTTP header byte
// string — Turkish letters outside Latin-1 (ı, ğ, ş, İ — every one of them
// routine in a real survey title, e.g. "sorular-ı") make `new Response()`
// throw outright ("Cannot convert argument to a ByteString"), which is why
// the export download was failing entirely, not just showing a mangled
// name. `filename*=UTF-8''<percent-encoded>` (RFC 5987) is the standard way
// to carry a non-ASCII filename in this header; `filename="..."` stays as
// an ASCII-safe fallback for any client that doesn't understand the former
// (every real browser does, and prefers it when both are present).
export function contentDispositionHeader(filename: string): string {
  const asciiFallback = filename.replace(/[^\x20-\x7E]/g, "_");
  return `attachment; filename="${asciiFallback}"; filename*=UTF-8''${encodeURIComponent(filename)}`;
}
