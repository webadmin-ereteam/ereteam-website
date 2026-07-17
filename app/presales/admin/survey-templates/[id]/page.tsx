import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/presales/db";
import { renameSurveyTemplate, updateSurveyTemplate } from "@/lib/presales/adminActions";
import { Card, PageHeader, inputClass, labelClass, buttonPrimaryClass, buttonSecondaryClass } from "../../../_components/ui";
import { SubmitButton } from "../../../_components/SubmitButton";
import { QuestionListEditor, type QuestionDraft } from "../../../_components/QuestionListEditor";

export default async function SurveyTemplateEditorPage({ params }: { params: { id: string } }) {
  const template = await prisma.surveyTemplate.findUnique({
    where: { id: params.id },
    include: { items: { orderBy: { order: "asc" } } },
  });

  if (!template) notFound();

  const initialQuestions: QuestionDraft[] = template!.items.map((item) => ({
    text: item.text,
    type: item.type,
    options: (item.options as string[] | null) ?? [],
    required: item.required,
    conditionOnOrder: item.conditionOnOrder,
    conditionValues: (item.conditionValues as string[] | null) ?? [],
  }));

  return (
    <div>
      <Link
        href="/presales/admin/survey-templates"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-brand-primary"
      >
        <ArrowLeft size={14} /> Tüm şablonlar
      </Link>

      <PageHeader
        title={template!.name}
        description="Soruları ekle, sürükleyip sırala, koşullu göster veya Diğer serbest yazı seçeneği ekle. Bu şablonu bir case için anket oluştururken 'Şablondan Başla' diyerek yükleyebilirsin."
      />

      <Card className="mb-6 max-w-md">
        <form action={renameSurveyTemplate.bind(null, template!.id)} className="flex items-end gap-2">
          <div className="flex-1">
            <label className={labelClass}>Şablon Adı</label>
            <input name="name" defaultValue={template!.name} required className={`${inputClass} w-full`} />
          </div>
          <SubmitButton className={buttonSecondaryClass}>Kaydet</SubmitButton>
        </form>
      </Card>

      <Card>
        <h2 className="mb-4 text-base font-semibold text-brand-dark">Sorular</h2>
        <form action={updateSurveyTemplate.bind(null, template!.id)} className="space-y-4">
          <QuestionListEditor initialQuestions={initialQuestions} exportFileNameHint={template!.name} />
          <SubmitButton className={buttonPrimaryClass} pendingLabel="Kaydediliyor...">
            Soruları Kaydet
          </SubmitButton>
        </form>
      </Card>
    </div>
  );
}
