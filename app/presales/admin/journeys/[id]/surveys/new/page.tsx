import { notFound } from "next/navigation";
import { prisma } from "@/lib/presales/db";
import { createSurveyInstance } from "@/lib/presales/adminActions";
import { findCurrentStage } from "@/lib/presales/stageProgress";
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

  // Reached without a `?stageId=` — via the "Anketler" tab's generic "+ Yeni
  // Anket" button, not the stage-specific "Anket Oluştur" link on Genel
  // Bakış — used to silently default to `stages[0]`, i.e. always the
  // *first* surveys-enabled stage in the whole flow, regardless of which
  // stage the case is actually on. An admin who didn't separately notice
  // and correct the "Aşama" dropdown before submitting would get a real
  // survey (and its answers) attached to the wrong stage — the case's
  // actual current stage never got a survey, so it never had anything to
  // auto-advance on. Defaulting to the current stage instead (when it's a
  // surveys-enabled one) is what an admin creating a new survey almost
  // always means.
  const allActiveStages = await prisma.journeyStage.findMany({
    where: { journeyId: params.id, isActive: true },
    orderBy: { order: "asc" },
  });
  const currentStage = findCurrentStage(allActiveStages);
  const currentStageTakesSurveys = !!currentStage && stages.some((s) => s.id === currentStage.id);

  const selectedStageId = searchParams.stageId ?? (currentStageTakesSurveys ? currentStage!.id : stages[0]?.id);
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
              exportFileNameHint={selectedTemplate ? selectedTemplate.name : `${selectedStage.name} Anketi`}
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
