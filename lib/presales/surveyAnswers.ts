import { fileContentMatchesDeclaredType } from "./fileSignature";
import {
  ALLOWED_UPLOAD_LABEL,
  ALLOWED_UPLOAD_MIME_TYPES,
  MAX_UPLOAD_BYTES,
  MAX_UPLOAD_LABEL,
} from "./fileUpload";
import { decodeOptions } from "./surveyOptions";

const SUPPORTED_TYPES = new Set([
  "short_text",
  "long_text",
  "single_choice",
  "multi_choice",
  "scale",
  "file_upload",
]);

export type SurveyAnswerSelection = {
  id: string;
  text: string;
  type: string;
  options: unknown;
  required: boolean;
  order: number;
  conditionOnOrder: number | null;
  conditionValues: unknown;
  response?: {
    answerText: string | null;
    answerJson: unknown;
    document: { driveFileId: string } | null;
  } | null;
};

export type NormalizedSurveyAnswer =
  | { kind: "text"; answerText: string | null }
  | { kind: "multi"; answerJson: string[] }
  | { kind: "file"; file: File | null };

export type ParsedSurveyAnswers = {
  answers: Map<string, NormalizedSurveyAnswer>;
  hiddenSelectionIds: string[];
};

function questionError(selection: SurveyAnswerSelection, message: string): Error {
  return new Error(`"${selection.text}" için ${message}`);
}

function stringValues(formData: FormData, name: string, selection: SurveyAnswerSelection): string[] {
  const values = formData.getAll(name);
  if (values.some((value) => typeof value !== "string")) {
    throw questionError(selection, "geçersiz bir değer gönderildi.");
  }
  return values as string[];
}

function bounded(value: string, maximum: number, selection: SurveyAnswerSelection): string {
  if (value.length > maximum) {
    throw questionError(selection, `cevap en fazla ${maximum} karakter olabilir.`);
  }
  return value;
}

function requireAnswer(selection: SurveyAnswerSelection, mode: "draft" | "submit", answered: boolean) {
  if (mode === "submit" && selection.required && !answered) {
    throw questionError(selection, "bu alan zorunludur.");
  }
}

/**
 * Parses only submitted values and survey metadata. It performs no I/O, which
 * keeps visibility and normalization rules deterministic and directly testable.
 */
export function parseSurveyAnswers(
  selections: SurveyAnswerSelection[],
  formData: FormData,
  mode: "draft" | "submit",
): ParsedSurveyAnswers {
  const byOrder = new Map<number, SurveyAnswerSelection>();
  for (const selection of selections) {
    if (!SUPPORTED_TYPES.has(selection.type)) {
      throw questionError(selection, "desteklenmeyen bir soru türü kullanılıyor.");
    }
    byOrder.set(selection.order, selection);
  }

  const answers = new Map<string, NormalizedSurveyAnswer>();
  const visibilityChoices = new Map<string, string[]>();
  const visibility = new Map<string, boolean>();
  const evaluating = new Set<string>();

  const parseVisibleAnswer = (selection: SurveyAnswerSelection): NormalizedSurveyAnswer => {
    const existing = answers.get(selection.id);
    if (existing) return existing;

    const fieldName = `answer_${selection.id}`;
    let answer: NormalizedSurveyAnswer;

    if (selection.type === "file_upload") {
      const values = formData.getAll(fieldName);
      if (values.length > 1 || values.some((value) => typeof value === "string")) {
        throw questionError(selection, "geçersiz bir dosya gönderildi.");
      }
      const file = (values[0] as File | undefined) ?? null;
      const suppliedFile = file && file.size > 0 ? file : null;
      const existingFileIsValid = Boolean(
        selection.response?.answerText
        && selection.response.document?.driveFileId === selection.response.answerText,
      );
      requireAnswer(selection, mode, Boolean(suppliedFile || existingFileIsValid));
      answer = { kind: "file", file: suppliedFile };
    } else if (selection.type === "multi_choice") {
      const values = stringValues(formData, fieldName, selection);
      const unique = new Set(values);
      if (unique.size !== values.length) {
        throw questionError(selection, "aynı seçenek birden fazla kez gönderilemez.");
      }
      const options = decodeOptions(selection.options);
      const allowed = new Set(options.map((option) => option.text));
      if (values.some((value) => !allowed.has(value))) {
        throw questionError(selection, "geçersiz bir seçenek gönderildi.");
      }
      requireAnswer(selection, mode, values.length > 0);
      const otherLabels = new Set(options.filter((option) => option.isOther).map((option) => option.text));
      const selectedOther = values.find((value) => otherLabels.has(value));
      const otherValues = selectedOther ? stringValues(formData, `${fieldName}_other`, selection) : [];
      if (otherValues.length > 1) throw questionError(selection, "birden fazla diğer açıklaması gönderilemez.");
      const otherText = selectedOther ? bounded((otherValues[0] ?? "").trim(), 1000, selection) : "";
      visibilityChoices.set(selection.id, values);
      answer = {
        kind: "multi",
        answerJson: values.map((value) => (value === selectedOther && otherText ? `${value}: ${otherText}` : value)),
      };
    } else {
      const values = stringValues(formData, fieldName, selection);
      if (values.length > 1) {
        throw questionError(selection, "birden fazla değer gönderilemez.");
      }
      const value = values[0] ?? "";

      if (selection.type === "single_choice") {
        const options = decodeOptions(selection.options);
        const chosen = value || null;
        if (chosen && !options.some((option) => option.text === chosen)) {
          throw questionError(selection, "geçersiz bir seçenek gönderildi.");
        }
        requireAnswer(selection, mode, Boolean(chosen));
        const isOther = options.some((option) => option.isOther && option.text === chosen);
        const otherValues = isOther ? stringValues(formData, `${fieldName}_other`, selection) : [];
        if (otherValues.length > 1) throw questionError(selection, "birden fazla diğer açıklaması gönderilemez.");
        const otherText = isOther ? bounded((otherValues[0] ?? "").trim(), 1000, selection) : "";
        visibilityChoices.set(selection.id, chosen ? [chosen] : []);
        answer = { kind: "text", answerText: chosen && otherText ? `${chosen}: ${otherText}` : chosen };
      } else if (selection.type === "scale") {
        requireAnswer(selection, mode, value.trim() !== "");
        if (value && (!Number.isInteger(Number(value)) || Number(value) < 1 || Number(value) > 10)) {
          throw questionError(selection, "1 ile 10 arasında bir tam sayı girilmelidir.");
        }
        answer = { kind: "text", answerText: value ? String(Number(value)) : null };
      } else {
        const maximum = selection.type === "long_text" ? 10_000 : 1_000;
        const normalized = bounded(value, maximum, selection);
        requireAnswer(selection, mode, normalized.trim() !== "");
        answer = { kind: "text", answerText: normalized || null };
      }
    }

    answers.set(selection.id, answer);
    return answer;
  };

  const isVisible = (selection: SurveyAnswerSelection): boolean => {
    const cached = visibility.get(selection.id);
    if (cached !== undefined) return cached;
    if (evaluating.has(selection.id)) {
      throw questionError(selection, "koşullu görünürlük döngüsü geçersizdir.");
    }
    evaluating.add(selection.id);

    let visible = true;
    if (selection.conditionOnOrder !== null) {
      const controller = byOrder.get(selection.conditionOnOrder);
      if (controller && !isVisible(controller)) {
        visible = false;
      } else if (controller) {
        const triggerValues = Array.isArray(selection.conditionValues)
          ? selection.conditionValues.filter((value): value is string => typeof value === "string")
          : [];
        parseVisibleAnswer(controller);
        const chosen = visibilityChoices.get(controller.id) ?? [];
        visible = chosen.some((value) => triggerValues.includes(value));
      }
    }

    evaluating.delete(selection.id);
    visibility.set(selection.id, visible);
    return visible;
  };

  const hiddenSelectionIds: string[] = [];
  for (const selection of selections) {
    if (isVisible(selection)) parseVisibleAnswer(selection);
    else hiddenSelectionIds.push(selection.id);
  }

  return { answers, hiddenSelectionIds };
}

export async function validateSurveyAnswerFiles(parsed: ParsedSurveyAnswers): Promise<void> {
  for (const answer of parsed.answers.values()) {
    if (answer.kind !== "file" || !answer.file) continue;
    if (answer.file.size > MAX_UPLOAD_BYTES) {
      throw new Error(`Yüklenen dosya çok büyük (maksimum ${MAX_UPLOAD_LABEL}). Lütfen daha küçük bir dosya seçip tekrar gönderin.`);
    }
    if (!ALLOWED_UPLOAD_MIME_TYPES.includes(answer.file.type)) {
      throw new Error(`Desteklenmeyen dosya türü — izin verilenler: ${ALLOWED_UPLOAD_LABEL}.`);
    }
    if (!(await fileContentMatchesDeclaredType(answer.file))) {
      throw new Error("Yüklenen dosyanın içeriği, seçtiğin dosya türüyle uyuşmuyor.");
    }
  }
}
