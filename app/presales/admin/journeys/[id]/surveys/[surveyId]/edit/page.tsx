import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/presales/db";
import { updateSurveyInstance } from "@/lib/presales/adminActions";
import { Card, PageHeader, inputClass, labelClass, buttonPrimaryClass, buttonSecondaryClass } from "../../../../../../_components/ui";
import { SubmitButton } from "../../../../../../_components/SubmitButton";
import { QuestionListEditor, type QuestionDraft } from "../../../../../../_components/QuestionListEditor";

export default async function EditSurveyPage({
  params,
}: {
  params: { id: string; surveyId: string };
}) {
  const survey = await prisma.surveyInstance.findFirst({
    where: { id: params.surveyId, journeyId: params.id },
    include: { stage: true, selections: { orderBy: { order: "asc" } } },
  });

  if (!survey) notFound();

  // Sent/completed surveys have no edit form — bounce to the read-only
  // results page instead of showing a form that would just error on submit.
  if (survey!.status !== "draft") {
    redirect(`/presales/admin/journeys/${params.id}/surveys/${params.surveyId}`);
  }

  const initialQuestions: QuestionDraft[] = survey!.selections.map((item) => ({
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
        href={`/presales/admin/journeys/${params.id}/surveys`}
        className="mb-4 inline-flex items-center gap-1 text-sm text-text-muted hover:text-brand-primary"
      >
        <ArrowLeft size={14} /> Anketlere geri dön
      </Link>

      <PageHeader
        title={`Düzenle: ${survey!.title}`}
        description={`${survey!.stage.name} — taslak durumundayken sorular istediğin kadar düzenlenebilir. "Gönder"e bastıktan sonra bir daha değiştirilemez.`}
      />

      <Card>
        <form action={updateSurveyInstance.bind(null, survey!.id, params.id)} className="space-y-5">
          <div>
            <label className={labelClass}>Anket Başlığı</label>
            <input name="title" required defaultValue={survey!.title} className={`${inputClass} w-full max-w-md`} />
          </div>

          <QuestionListEditor initialQuestions={initialQuestions} exportFileNameHint={survey!.title} />

          <div className="flex items-center gap-3">
            <SubmitButton className={buttonPrimaryClass} pendingLabel="Kaydediliyor...">
              Değişiklikleri Kaydet
            </SubmitButton>
            <Link href={`/presales/admin/journeys/${params.id}/surveys`} className={buttonSecondaryClass}>
              Vazgeç
            </Link>
          </div>
        </form>
      </Card>
    </div>
  );
}
