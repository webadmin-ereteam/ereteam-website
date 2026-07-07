// The admin-selectable categories shown in the "Belgeler" upload form.
export const DOCUMENT_TYPES = [
  "survey",
  "proposal",
  "meeting_note",
  "project_plan",
  "contract",
  "other",
] as const;

export const DOCUMENT_TYPE_LABELS: Record<string, string> = {
  survey: "Anket",
  proposal: "Teklif",
  meeting_note: "Toplantı Kaydı/Notu",
  project_plan: "Proje Planı",
  contract: "Sözleşme",
  other: "Diğer",
};

// Every document (admin-uploaded or system/customer-generated) lands in a Drive
// subfolder under the journey's own folder, named after its type. A couple of
// internal-only types (never chosen from the upload form) share/extend this map:
// `survey_export` is the auto-archived completed-survey Excel (goes alongside
// manually uploaded "Anket" documents), and `customer_upload` is a file the
// customer attached while answering a survey, kept separate from both.
export const DOCUMENT_TYPE_FOLDER: Record<string, string> = {
  ...DOCUMENT_TYPE_LABELS,
  survey_export: "Anket",
  customer_upload: "Müşteri Yüklemeleri",
};
