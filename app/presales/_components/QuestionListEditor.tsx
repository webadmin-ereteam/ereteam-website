"use client";

import { useRef, useState } from "react";
import * as XLSX from "xlsx";
import { Plus, Trash2, Download, Upload } from "lucide-react";
import { inputClass, buttonSecondaryClass } from "./ui";
import { DragReorderList } from "./DragReorderList";
import { decodeOptions } from "@/lib/presales/surveyOptions";

export const QUESTION_TYPES: { value: string; label: string }[] = [
  { value: "short_text", label: "Kısa Metin" },
  { value: "long_text", label: "Uzun Metin" },
  { value: "single_choice", label: "Tek Seçim" },
  { value: "multi_choice", label: "Çoklu Seçim" },
  { value: "scale", label: "Puan (1-10)" },
  { value: "file_upload", label: "Dosya Yükleme" },
];

const CHOICE_TYPES = new Set(["single_choice", "multi_choice"]);

export type QuestionDraft = {
  text: string;
  type: string;
  options: string[];
  required: boolean;
  // Position (within this same draft list) of the question this one depends
  // on, matching the persisted `conditionOnOrder` — null/undefined = always shown.
  conditionOnOrder?: number | null;
  conditionValues?: string[];
};

type EditorOption = { text: string; isOther: boolean };

type EditorQuestion = {
  id: string;
  text: string;
  type: string;
  options: EditorOption[];
  required: boolean;
  // References another question by its stable editor `id`, not by array
  // position, so dragging questions around can't silently repoint a condition
  // at the wrong question (see toEditorQuestions/handleReorder).
  conditionOnId: string | null;
  conditionValues: string[];
};

let uidCounter = 0;
function nextUid() {
  uidCounter += 1;
  return `q${uidCounter}`;
}

function toEditorQuestions(drafts: QuestionDraft[]): EditorQuestion[] {
  const ids = drafts.map(() => nextUid());
  return drafts.map((q, i) => ({
    id: ids[i],
    text: q.text ?? "",
    type: q.type ?? "short_text",
    options: decodeOptions(q.options ?? []),
    required: q.required ?? true,
    conditionOnId:
      q.conditionOnOrder !== null && q.conditionOnOrder !== undefined ? ids[q.conditionOnOrder] ?? null : null,
    conditionValues: q.conditionValues ?? [],
  }));
}

function emptyQuestion(): EditorQuestion {
  return {
    id: nextUid(),
    text: "",
    type: "short_text",
    options: [],
    required: true,
    conditionOnId: null,
    conditionValues: [],
  };
}

// --- Bulk import/export via Excel (SheetJS runs entirely client-side; no upload endpoint needed) ---

const EXCEL_HEADERS = ["Soru", "Tür", "Seçenekler", "Zorunlu"] as const;
const TYPE_LABEL_TO_VALUE: Record<string, string> = Object.fromEntries(
  QUESTION_TYPES.map((t) => [t.label.toLocaleLowerCase("tr"), t.value])
);

function downloadSampleWorkbook() {
  const sampleRows = [
    { Soru: "Şirketinizin çalışan sayısı kaçtır?", Tür: "Kısa Metin", Seçenekler: "", Zorunlu: "evet" },
    { Soru: "İhtiyaçlarınızı kısaca anlatır mısınız?", Tür: "Uzun Metin", Seçenekler: "", Zorunlu: "hayır" },
    { Soru: "Hangi modülle ilgileniyorsunuz?", Tür: "Tek Seçim", Seçenekler: "Planlama;Raporlama;Bütçeleme", Zorunlu: "evet" },
    { Soru: "İlgilendiğiniz alanlar?", Tür: "Çoklu Seçim", Seçenekler: "Finans;Satış;Operasyon", Zorunlu: "hayır" },
    { Soru: "Genel memnuniyetinizi puanlayın", Tür: "Puan (1-10)", Seçenekler: "", Zorunlu: "evet" },
  ];

  const sheet = XLSX.utils.json_to_sheet(sampleRows, { header: [...EXCEL_HEADERS] });
  sheet["!cols"] = [{ wch: 40 }, { wch: 14 }, { wch: 30 }, { wch: 10 }];

  const helpRows = [
    { Alan: "Tür (geçerli değerler)", Açıklama: QUESTION_TYPES.map((t) => t.label).join(", ") },
    { Alan: "Seçenekler", Açıklama: "Sadece Tek Seçim / Çoklu Seçim için; noktalı virgülle (;) ayırın" },
    { Alan: "Zorunlu", Açıklama: '"evet" veya "hayır" — boş bırakılırsa "evet" kabul edilir' },
  ];
  const helpSheet = XLSX.utils.json_to_sheet(helpRows);
  helpSheet["!cols"] = [{ wch: 24 }, { wch: 60 }];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, sheet, "Sorular");
  XLSX.utils.book_append_sheet(workbook, helpSheet, "Yardım");
  XLSX.writeFile(workbook, "anket-sablonu-ornek.xlsx");
}

async function parseWorkbookFile(file: File): Promise<QuestionDraft[]> {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: "array" });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: "" });

  const questions: QuestionDraft[] = [];

  rows.forEach((row, index) => {
    const text = String(row["Soru"] ?? "").trim();
    if (!text) return;

    const typeLabel = String(row["Tür"] ?? "").trim();
    const type = TYPE_LABEL_TO_VALUE[typeLabel.toLocaleLowerCase("tr")];
    if (!type) {
      throw new Error(
        `Satır ${index + 2}: geçersiz "Tür" değeri ("${typeLabel}"). Geçerli değerler: ${QUESTION_TYPES.map((t) => t.label).join(", ")}`
      );
    }

    const optionsRaw = String(row["Seçenekler"] ?? "").trim();
    const options = optionsRaw ? optionsRaw.split(";").map((o) => o.trim()).filter(Boolean) : [];

    const requiredRaw = String(row["Zorunlu"] ?? "").trim().toLocaleLowerCase("tr");
    const required = !["hayır", "hayir", "no", "false"].includes(requiredRaw);

    questions.push({ text, type, options, required });
  });

  if (questions.length === 0) {
    throw new Error('Excel dosyasında geçerli soru bulunamadı — "Soru" sütunu boş olmayan en az bir satır olmalı.');
  }

  return questions;
}

export function QuestionListEditor({ initialQuestions }: { initialQuestions?: QuestionDraft[] }) {
  const [questions, setQuestions] = useState<EditorQuestion[]>(() =>
    initialQuestions && initialQuestions.length > 0 ? toEditorQuestions(initialQuestions) : [emptyQuestion()]
  );
  const [importError, setImportError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function update(id: string, patch: Partial<EditorQuestion>) {
    setQuestions((qs) => qs.map((q) => (q.id === id ? { ...q, ...patch } : q)));
  }

  function addQuestion() {
    setQuestions((qs) => [...qs, emptyQuestion()]);
  }

  function removeQuestion(id: string) {
    setQuestions((qs) => qs.filter((q) => q.id !== id));
  }

  function addOption(id: string) {
    setQuestions((qs) =>
      qs.map((q) => (q.id === id ? { ...q, options: [...q.options, { text: "", isOther: false }] } : q))
    );
  }

  function updateOption(id: string, idx: number, patch: Partial<EditorOption>) {
    setQuestions((qs) =>
      qs.map((q) =>
        q.id === id ? { ...q, options: q.options.map((o, i) => (i === idx ? { ...o, ...patch } : o)) } : q
      )
    );
  }

  function removeOption(id: string, idx: number) {
    setQuestions((qs) =>
      qs.map((q) => (q.id === id ? { ...q, options: q.options.filter((_, i) => i !== idx) } : q))
    );
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    try {
      const parsed = await parseWorkbookFile(file);
      setQuestions(toEditorQuestions(parsed));
      setImportError(null);
    } catch (err) {
      setImportError(err instanceof Error ? err.message : "Excel dosyası okunamadı.");
    }
  }

  function handleReorder(orderedIds: string[]) {
    const byId = new Map(questions.map((q) => [q.id, q]));
    setQuestions(orderedIds.map((id) => byId.get(id)!));
  }

  return (
    <div className="space-y-3">
      <input type="hidden" name="questionCount" value={questions.length} />

      <div className="flex flex-wrap items-center gap-2 rounded-lg border border-dashed border-gray-300 bg-gray-50/60 p-3">
        <span className="mr-1 text-xs text-text-muted">Soruları Excel ile toplu ekle:</span>
        <button type="button" onClick={downloadSampleWorkbook} className={buttonSecondaryClass}>
          <Download size={14} className="mr-1.5" /> Örnek Excel İndir
        </button>
        <button type="button" onClick={() => fileInputRef.current?.click()} className={buttonSecondaryClass}>
          <Upload size={14} className="mr-1.5" /> Excel&apos;den Yükle
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>
      {importError && <p className="text-xs text-red-600">{importError}</p>}
      {questions.length > 1 && (
        <p className="text-[11px] text-text-muted">Sıralamayı değiştirmek için soru kartlarını sürükleyip bırakın.</p>
      )}

      <DragReorderList
        items={questions}
        onReorder={handleReorder}
        renderItem={(q, i) => {
          const priorChoiceQuestions = questions
            .slice(0, i)
            .filter((cq) => CHOICE_TYPES.has(cq.type) && cq.text.trim());
          const conditionTarget = q.conditionOnId !== null ? questions.find((cq) => cq.id === q.conditionOnId) : undefined;
          // The saved wire format still references the target by its current
          // position (parseQuestionSlots translates that into a final `order`
          // at submit time) — recomputed fresh every render so a drag-reorder
          // can never leave a condition silently pointing at the wrong question.
          const conditionOnCurrentIndex = q.conditionOnId !== null ? questions.findIndex((cq) => cq.id === q.conditionOnId) : null;

          return (
            <div className="space-y-2 rounded-lg border border-gray-100 bg-gray-50 p-3">
              <div className="flex items-center gap-2">
                <input
                  name={`question_${i}_text`}
                  value={q.text}
                  onChange={(e) => update(q.id, { text: e.target.value })}
                  placeholder={`Soru ${i + 1}`}
                  className={`${inputClass} flex-1 bg-white`}
                />
                <select
                  name={`question_${i}_type`}
                  value={q.type}
                  onChange={(e) => update(q.id, { type: e.target.value })}
                  className={`${inputClass} w-40 bg-white`}
                >
                  {QUESTION_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
                <label className="flex items-center gap-1.5 whitespace-nowrap text-xs text-text-muted">
                  <input
                    type="checkbox"
                    name={`question_${i}_required`}
                    checked={q.required}
                    onChange={(e) => update(q.id, { required: e.target.checked })}
                  />
                  Zorunlu
                </label>
                <button
                  type="button"
                  onClick={() => removeQuestion(q.id)}
                  className="shrink-0 rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-500"
                  title="Soruyu sil"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              {CHOICE_TYPES.has(q.type) && (
                <div className="ml-1 space-y-1.5 border-l-2 border-gray-200 pl-3">
                  {q.options.map((opt, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        name={`question_${i}_option`}
                        value={opt.text}
                        onChange={(e) => updateOption(q.id, idx, { text: e.target.value })}
                        placeholder={`Seçenek ${idx + 1}`}
                        className={`${inputClass} w-56 bg-white`}
                      />
                      <input
                        type="hidden"
                        name={`question_${i}_option_isOther`}
                        value={opt.isOther ? "1" : "0"}
                      />
                      <label className="flex items-center gap-1 whitespace-nowrap text-[11px] text-text-muted">
                        <input
                          type="checkbox"
                          checked={opt.isOther}
                          onChange={(e) => updateOption(q.id, idx, { isOther: e.target.checked })}
                        />
                        Diğer (serbest yazı)
                      </label>
                      <button
                        type="button"
                        onClick={() => removeOption(q.id, idx)}
                        className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addOption(q.id)}
                    className="flex items-center gap-1 text-xs font-medium text-brand-primary hover:underline"
                  >
                    <Plus size={13} /> Seçenek ekle
                  </button>
                </div>
              )}

              {priorChoiceQuestions.length > 0 && (
                <div className="border-t border-gray-200 pt-2">
                  <label className="flex items-center gap-1.5 text-xs text-text-muted">
                    <input
                      type="checkbox"
                      checked={q.conditionOnId !== null}
                      onChange={(e) =>
                        update(q.id, {
                          conditionOnId: e.target.checked ? priorChoiceQuestions[priorChoiceQuestions.length - 1].id : null,
                          conditionValues: [],
                        })
                      }
                    />
                    Koşullu göster (sadece belirli bir cevaba göre)
                  </label>
                  {q.conditionOnId !== null && (
                    <div className="mt-2 space-y-2 pl-5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-text-muted whitespace-nowrap">Şu sorunun cevabı:</span>
                        <select
                          name={`question_${i}_conditionOn`}
                          value={conditionOnCurrentIndex ?? ""}
                          onChange={(e) => {
                            const target = questions[Number(e.target.value)];
                            update(q.id, { conditionOnId: target?.id ?? null, conditionValues: [] });
                          }}
                          className={`${inputClass} flex-1 bg-white`}
                        >
                          {priorChoiceQuestions.map((cq) => (
                            <option key={cq.id} value={questions.findIndex((qq) => qq.id === cq.id)}>
                              {cq.text}
                            </option>
                          ))}
                        </select>
                      </div>
                      {conditionTarget && (
                        <div className="flex flex-wrap gap-3">
                          {conditionTarget.options
                            .filter((o) => o.text.trim())
                            .map((opt) => (
                              <label key={opt.text} className="flex items-center gap-1.5 text-xs text-text-body">
                                <input
                                  type="checkbox"
                                  name={`question_${i}_conditionValue`}
                                  value={opt.text}
                                  checked={q.conditionValues.includes(opt.text)}
                                  onChange={(e) =>
                                    update(q.id, {
                                      conditionValues: e.target.checked
                                        ? [...q.conditionValues, opt.text]
                                        : q.conditionValues.filter((v) => v !== opt.text),
                                    })
                                  }
                                />
                                {opt.text}
                              </label>
                            ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        }}
      />

      <button
        type="button"
        onClick={addQuestion}
        className={`${buttonSecondaryClass} w-full justify-center border-dashed`}
      >
        <Plus size={15} className="mr-1.5" /> Soru Ekle
      </button>
    </div>
  );
}
