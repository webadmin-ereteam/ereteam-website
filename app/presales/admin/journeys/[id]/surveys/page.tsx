import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/presales/db";
import { sendSurveyInstance } from "@/lib/presales/adminActions";
import { Badge, Card, buttonPrimaryClass, buttonSecondaryClass } from "../../../../_components/ui";
import { SubmitButton } from "../../../../_components/SubmitButton";

const SURVEY_STATUS_BADGE: Record<string, "gray" | "amber" | "green"> = {
  draft: "gray",
  sent: "amber",
  completed: "green",
};

export default async function JourneySurveysTab({ params }: { params: { id: string } }) {
  const journey = await prisma.journey.findUnique({
    where: { id: params.id },
    include: { surveyInstances: { include: { stage: true }, orderBy: { createdAt: "desc" } } },
  });

  if (!journey) notFound();

  return (
    <Card>
      <div className="mb-1 flex items-center justify-between">
        <h2 className="text-base font-semibold text-brand-dark">Anketler</h2>
        <Link href={`/presales/admin/journeys/${journey!.id}/surveys/new`} className={buttonPrimaryClass}>
          + Yeni Anket
        </Link>
      </div>
      <p className="mb-4 text-xs text-text-muted">
        Sorular &quot;Soru Havuzu&quot;ndan veya kayıtlı &quot;Anket Şablonları&quot;ndan seçilip burada
        özelleştirilir. Bir anket gönderildikten sonra soruları değiştirilemez — sadece cevaplarını
        görebilirsin.
      </p>
      <div className="space-y-2">
        {journey!.surveyInstances.map((survey) => (
          <div
            key={survey.id}
            className="flex items-center justify-between rounded-xl border border-gray-200/70 bg-white px-4 py-3.5 shadow-[0_1px_2px_rgba(16,24,40,0.04)] transition-colors hover:border-gray-300"
          >
            <div>
              <p className="font-medium text-brand-dark">{survey.title}</p>
              <p className="text-sm text-text-muted">{survey.stage.name}</p>
            </div>
            <div className="flex items-center gap-3">
              <Badge color={SURVEY_STATUS_BADGE[survey.status] ?? "gray"}>{survey.status}</Badge>
              {survey.status === "draft" && (
                <form action={sendSurveyInstance.bind(null, survey.id, journey!.id)}>
                  <SubmitButton className={buttonPrimaryClass} pendingLabel="Gönderiliyor...">
                    Gönder
                  </SubmitButton>
                </form>
              )}
              {(survey.status === "sent" || survey.status === "completed") && (
                <Link
                  href={`/presales/admin/journeys/${journey!.id}/surveys/${survey.id}`}
                  className={buttonSecondaryClass}
                >
                  Sonuçları Gör
                </Link>
              )}
            </div>
          </div>
        ))}
        {journey!.surveyInstances.length === 0 && (
          <p className="text-sm text-text-muted">Henüz anket oluşturulmadı.</p>
        )}
      </div>
    </Card>
  );
}
