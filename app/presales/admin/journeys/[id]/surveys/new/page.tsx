import { notFound } from "next/navigation";
import { prisma } from "@/lib/presales/db";
import { createSurveyInstance } from "@/lib/presales/adminActions";
import { Card, PageHeader, inputClass, labelClass, buttonPrimaryClass, buttonSecondaryClass } from "../../../../../_components/ui";
import { SubmitButton } from "../../../../../_components/SubmitButton";
import { QuestionListEditor, type QuestionDraft } from "../../../../../_components/QuestionListEditor";

export default async function NewSurveyPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { stageId?: string; templateId?: string };
}) {
  const journey = await prisma.journey.findUnique({ where: { id: params.id } });
  if (!journey) notFound();

  const stages = await prisma.journeyStage.findMany({
    where: { journeyId: params.id, isActive: true, surveysEnabled: true },
    orderBy: { order: "asc" },
  });

  const selectedStageId = searchParams.stageId ?? stages[0]?.id;
  const selectedStage = selectedStageId ? stages.find((s) => s.id === selectedStageId) : null;

  const templates = await prisma.surveyTemplate.findMany({ orderBy: { name: "asc" } });

  const selectedTemplate = searchParams.templateId
    ? await prisma.surveyTemplate.findUnique({
        where: { id: searchParams.templateId },
        include: { items: { orderBy: { order: "asc" } } },
      })
    : null;

  return (
    <div>
      <PageHeader
        title="Yeni Anket Oluştur"
        description='Önce taslak olarak oluşturulur, "Gönder"e bastıktan sonra soruları bir daha değiştiremezsin.'
      />

      <div className="mb-6 flex flex-wrap items-end gap-4">
        <form method="get" className="flex items-end gap-2">
          {searchParams.templateId && <input type="hidden" name="templateId" value={searchParams.templateId} />}
          <div>
            <label className={labelClass}>Aşama</label>
            <select name="stageId" defaultValue={selectedStageId} className={`${inputClass} w-56`}>
              {stages.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
          <button className={buttonSecondaryClass}>Seç</button>
        </form>

        {templates.length > 0 && (
          <form method="get" className="flex items-end gap-2">
            {selectedStageId && <input type="hidden" name="stageId" value={selectedStageId} />}
            <div>
              <label className={labelClass}>Şablondan Başla</label>
              <select name="templateId" defaultValue={searchParams.templateId ?? ""} className={`${inputClass} w-64`}>
                <option value="">— Sıfırdan oluştur —</option>
                {templates.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
            <button className={buttonSecondaryClass}>Şablonu Yükle</button>
          </form>
        )}
      </div>

      {selectedStage && (
        <Card>
          <form action={createSurveyInstance} className="space-y-5">
            <input type="hidden" name="journeyId" value={journey!.id} />
            <input type="hidden" name="stageId" value={selectedStage.id} />

            <div>
              <label className={labelClass}>Anket Başlığı</label>
              <input
                name="title"
                required
                defaultValue={selectedTemplate ? selectedTemplate.name : `${selectedStage.name} Anketi`}
                className={`${inputClass} w-full max-w-md`}
              />
            </div>

            <QuestionListEditor
              key={selectedTemplate?.id ?? "blank"}
              initialQuestions={selectedTemplate?.items.map(
                (item): QuestionDraft => ({
                  text: item.text,
                  type: item.type,
                  options: (item.options as string[] | null) ?? [],
                  required: item.required,
                  conditionOnOrder: item.conditionOnOrder,
                  conditionValues: (item.conditionValues as string[] | null) ?? [],
                })
              )}
            />

            <SubmitButton className={buttonPrimaryClass} pendingLabel="Oluşturuluyor...">
              Taslak Olarak Oluştur
            </SubmitButton>
          </form>
        </Card>
      )}
    </div>
  );
}
