"use client";

import { useState } from "react";
import { decodeOptions } from "@/lib/presales/surveyOptions";
import { MAX_UPLOAD_BYTES, MAX_UPLOAD_LABEL } from "@/lib/presales/fileUpload";

type Selection = {
  id: string;
  text: string;
  type: string;
  options: unknown;
  required: boolean;
  order: number;
  conditionOnOrder: number | null;
  conditionValues: unknown;
};

const inputClass =
  "w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm transition-colors focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/15";
const optionClass =
  "flex items-center gap-2.5 rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm transition-colors hover:border-brand-primary hover:bg-brand-primary/[0.03]";

export function SurveyAnswerForm({ selections }: { selections: Selection[] }) {
  // Tracks each question's currently chosen value(s) — used only to evaluate
  // this survey's own skip-logic conditions and "Diğer" reveal, client-side.
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const [fileErrors, setFileErrors] = useState<Record<string, string>>({});

  function handleFileChange(selectionId: string, e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file && file.size > MAX_UPLOAD_BYTES) {
      e.target.value = "";
      setFileErrors((prev) => ({ ...prev, [selectionId]: `Dosya çok büyük (maksimum ${MAX_UPLOAD_LABEL}) — lütfen daha küçük bir dosya seçin.` }));
    } else {
      setFileErrors((prev) => {
        const next = { ...prev };
        delete next[selectionId];
        return next;
      });
    }
  }

  function setChoice(selectionId: string, value: string, checked: boolean, multi: boolean) {
    setAnswers((prev) => {
      const current = prev[selectionId] ?? [];
      if (multi) {
        return { ...prev, [selectionId]: checked ? [...current, value] : current.filter((v) => v !== value) };
      }
      return { ...prev, [selectionId]: checked ? [value] : [] };
    });
  }

  function isVisible(selection: Selection): boolean {
    if (selection.conditionOnOrder == null) return true;
    const controller = selections.find((s) => s.order === selection.conditionOnOrder);
    if (!controller) return true; // dangling reference — fail open rather than hide unexpectedly
    if (!isVisible(controller)) return false;
    const triggerValues = Array.isArray(selection.conditionValues) ? (selection.conditionValues as string[]) : [];
    const chosen = answers[controller.id] ?? [];
    return chosen.some((v) => triggerValues.includes(v));
  }

  return (
    <div className="space-y-5">
      {selections.map((selection, qIndex) => {
        const visible = isVisible(selection);
        const options = decodeOptions(selection.options);
        const fieldName = `answer_${selection.id}`;
        const chosen = answers[selection.id] ?? [];
        const otherLabels = new Set(options.filter((o) => o.isOther).map((o) => o.text));
        const showOtherInput = visible && chosen.some((v) => otherLabels.has(v));

        return (
          <div
            key={selection.id}
            className={`border-t border-gray-100 pt-5 first:border-t-0 first:pt-0 ${visible ? "" : "hidden"}`}
          >
            <label className="mb-2 flex items-baseline gap-2 text-[15px] font-medium text-text-body">
              <span className="text-xs font-semibold text-gray-300">{String(qIndex + 1).padStart(2, "0")}</span>
              <span>
                {selection.text}
                {selection.required && <span className="ml-0.5 text-brand-magenta">*</span>}
              </span>
            </label>

            {selection.type === "long_text" && (
              <textarea
                name={fieldName}
                required={visible && selection.required}
                disabled={!visible}
                rows={3}
                className={inputClass}
              />
            )}
            {selection.type === "short_text" && (
              <input name={fieldName} required={visible && selection.required} disabled={!visible} className={inputClass} />
            )}
            {selection.type === "scale" && (
              <input
                type="number"
                min={1}
                max={10}
                name={fieldName}
                required={visible && selection.required}
                disabled={!visible}
                className={`${inputClass} w-24`}
              />
            )}
            {selection.type === "single_choice" && (
              <div className="space-y-1.5">
                {options.map((opt) => (
                  <label key={opt.text} className={optionClass}>
                    <input
                      type="radio"
                      name={fieldName}
                      value={opt.text}
                      required={visible && selection.required}
                      disabled={!visible}
                      checked={chosen.includes(opt.text)}
                      onChange={(e) => setChoice(selection.id, opt.text, e.target.checked, false)}
                    />
                    {opt.text}
                  </label>
                ))}
                {showOtherInput && (
                  <input
                    name={`${fieldName}_other`}
                    placeholder="Belirtiniz"
                    className={`${inputClass} mt-1`}
                  />
                )}
              </div>
            )}
            {selection.type === "multi_choice" && (
              <div className="space-y-1.5">
                {options.map((opt) => (
                  <label key={opt.text} className={optionClass}>
                    <input
                      type="checkbox"
                      name={fieldName}
                      value={opt.text}
                      disabled={!visible}
                      checked={chosen.includes(opt.text)}
                      onChange={(e) => setChoice(selection.id, opt.text, e.target.checked, true)}
                    />
                    {opt.text}
                  </label>
                ))}
                {showOtherInput && (
                  <input
                    name={`${fieldName}_other`}
                    placeholder="Belirtiniz"
                    className={`${inputClass} mt-1`}
                  />
                )}
              </div>
            )}
            {selection.type === "file_upload" && (
              <div>
                <input
                  type="file"
                  name={fieldName}
                  required={visible && selection.required}
                  disabled={!visible}
                  onChange={(e) => handleFileChange(selection.id, e)}
                  className={`${inputClass} file:mr-3 file:rounded-lg file:border-0 file:bg-brand-primary/10 file:px-3 file:py-1.5 file:text-brand-primary`}
                />
                {fileErrors[selection.id] && (
                  <p className="mt-1 text-xs text-red-600">{fileErrors[selection.id]}</p>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
