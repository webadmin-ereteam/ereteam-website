"use client";

import { useState } from "react";
import { updateSurveyTemplate, deleteSurveyTemplate } from "@/lib/presales/adminActions";
import { Badge, Card, inputClass, labelClass, buttonPrimaryClass, buttonSecondaryClass } from "../../_components/ui";
import { SubmitButton } from "../../_components/SubmitButton";
import { QuestionListEditor, type QuestionDraft } from "../../_components/QuestionListEditor";

type Template = {
  id: string;
  name: string;
  items: {
    text: string;
    type: string;
    options: unknown;
    required: boolean;
    conditionOnOrder: number | null;
    conditionValues: unknown;
  }[];
};

export function SurveyTemplateCard({ template }: { template: Template }) {
  const [isEditing, setIsEditing] = useState(false);

  if (!isEditing) {
    return (
      <Card className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-brand-dark">{template.name}</span>
          <Badge color="blue">{template.items.length} soru</Badge>
        </div>
        <div className="flex items-center gap-2">
          <button className={buttonSecondaryClass} onClick={() => setIsEditing(true)}>
            Düzenle
          </button>
          <form action={deleteSurveyTemplate.bind(null, template.id)}>
            <SubmitButton className={buttonSecondaryClass} pendingLabel="Siliniyor...">
              Sil
            </SubmitButton>
          </form>
        </div>
      </Card>
    );
  }

  const initialQuestions: QuestionDraft[] = template.items.map((item) => ({
    text: item.text,
    type: item.type,
    options: (item.options as string[] | null) ?? [],
    required: item.required,
    conditionOnOrder: item.conditionOnOrder,
    conditionValues: (item.conditionValues as string[] | null) ?? [],
  }));

  return (
    <Card>
      <form
        action={async (formData) => {
          await updateSurveyTemplate(template.id, formData);
          setIsEditing(false);
        }}
        className="space-y-4"
      >
        <div>
          <label className={labelClass}>Şablon Adı</label>
          <input name="name" required defaultValue={template.name} className={`${inputClass} w-full max-w-md`} />
        </div>
        <QuestionListEditor initialQuestions={initialQuestions} />
        <div className="flex gap-2">
          <SubmitButton className={buttonPrimaryClass} pendingLabel="Kaydediliyor...">
            Kaydet
          </SubmitButton>
          <button type="button" className={buttonSecondaryClass} onClick={() => setIsEditing(false)}>
            Vazgeç
          </button>
        </div>
      </form>
    </Card>
  );
}
