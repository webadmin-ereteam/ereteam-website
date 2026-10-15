import assert from "node:assert/strict";
import test from "node:test";
import {
  parseSurveyAnswers,
  SurveyAnswerSelection,
  validateSurveyAnswerFiles,
} from "../lib/presales/surveyAnswers";
import { encodeOtherOption } from "../lib/presales/surveyOptions";
import { MAX_UPLOAD_BYTES } from "../lib/presales/fileUpload";

function selection(overrides: Partial<SurveyAnswerSelection> = {}): SurveyAnswerSelection {
  return {
    id: "question-1",
    text: "Soru",
    type: "short_text",
    options: null,
    required: true,
    order: 0,
    conditionOnOrder: null,
    conditionValues: null,
    response: null,
    ...overrides,
  };
}

test("submit requires visible required answers while drafts allow them to be missing", () => {
  assert.throws(() => parseSurveyAnswers([selection()], new FormData(), "submit"), /zorunludur/);
  const draft = parseSurveyAnswers([selection()], new FormData(), "draft");
  assert.equal(draft.answers.get("question-1")?.kind, "text");
});

test("recursive visibility ignores submitted hidden values", () => {
  const questions = [
    selection({ id: "root", type: "single_choice", options: ["Evet", "Hayır"], order: 0 }),
    selection({
      id: "middle",
      type: "single_choice",
      options: ["Aç"],
      order: 1,
      conditionOnOrder: 0,
      conditionValues: ["Evet"],
    }),
    selection({ id: "leaf", order: 2, conditionOnOrder: 1, conditionValues: ["Aç"] }),
  ];
  const form = new FormData();
  form.set("answer_root", "Hayır");
  form.set("answer_middle", "sahte-değer");
  form.set("answer_leaf", "gizli cevap");

  const parsed = parseSurveyAnswers(questions, form, "submit");
  assert.deepEqual(parsed.hiddenSelectionIds, ["middle", "leaf"]);
  assert.equal(parsed.answers.has("middle"), false);
  assert.equal(parsed.answers.has("leaf"), false);
});

test("choice answers reject unknown and duplicate values", () => {
  const question = selection({ type: "multi_choice", options: ["A", "B"] });
  const unknown = new FormData();
  unknown.append("answer_question-1", "C");
  assert.throws(() => parseSurveyAnswers([question], unknown, "submit"), /geçersiz bir seçenek/);

  const duplicate = new FormData();
  duplicate.append("answer_question-1", "A");
  duplicate.append("answer_question-1", "A");
  assert.throws(() => parseSurveyAnswers([question], duplicate, "submit"), /birden fazla kez/);
});

test("scale answers are normalized integers between 1 and 10", () => {
  const question = selection({ type: "scale" });
  for (const invalid of ["0", "11", "1.5", "abc"]) {
    const form = new FormData();
    form.set("answer_question-1", invalid);
    assert.throws(() => parseSurveyAnswers([question], form, "submit"), /tam sayı/);
  }
  const valid = new FormData();
  valid.set("answer_question-1", "01");
  assert.deepEqual(parseSurveyAnswers([question], valid, "submit").answers.get("question-1"), {
    kind: "text",
    answerText: "1",
  });
});

test("text and other answers enforce their respective bounds", () => {
  const short = new FormData();
  short.set("answer_question-1", "x".repeat(1001));
  assert.throws(() => parseSurveyAnswers([selection()], short, "draft"), /1000 karakter/);

  const otherQuestion = selection({
    type: "single_choice",
    options: ["Normal", encodeOtherOption("Diğer")],
  });
  const other = new FormData();
  other.set("answer_question-1", "Diğer");
  other.set("answer_question-1_other", "x".repeat(1001));
  assert.throws(() => parseSurveyAnswers([otherQuestion], other, "submit"), /1000 karakter/);
});

test("an existing linked document satisfies a required file answer", () => {
  const question = selection({
    type: "file_upload",
    response: { answerText: "drive-id", answerJson: null, document: { driveFileId: "drive-id" } },
  });
  const parsed = parseSurveyAnswers([question], new FormData(), "submit");
  assert.deepEqual(parsed.answers.get("question-1"), { kind: "file", file: null });
});

test("a mismatched file response cannot satisfy a required upload", () => {
  const question = selection({
    type: "file_upload",
    response: { answerText: "drive-id", answerJson: null, document: { driveFileId: "different-id" } },
  });
  assert.throws(() => parseSurveyAnswers([question], new FormData(), "submit"), /zorunludur/);
});

test("file validation rejects oversized, disallowed, and signature-mismatched uploads", async () => {
  const question = selection({ type: "file_upload" });

  const oversized = new FormData();
  oversized.set("answer_question-1", new File([new Uint8Array(MAX_UPLOAD_BYTES + 1)], "large.pdf", { type: "application/pdf" }));
  await assert.rejects(validateSurveyAnswerFiles(parseSurveyAnswers([question], oversized, "submit")), /çok büyük/);

  const disallowed = new FormData();
  disallowed.set("answer_question-1", new File(["hello"], "script.js", { type: "application/javascript" }));
  await assert.rejects(validateSurveyAnswerFiles(parseSurveyAnswers([question], disallowed, "submit")), /Desteklenmeyen/);

  const fakePdf = new FormData();
  fakePdf.set("answer_question-1", new File(["not a pdf"], "fake.pdf", { type: "application/pdf" }));
  await assert.rejects(validateSurveyAnswerFiles(parseSurveyAnswers([question], fakePdf, "submit")), /içeriği/);
});
