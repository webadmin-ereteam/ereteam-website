import Link from "next/link";
import { notFound } from "next/navigation";
import { Zap, Clock, CheckCircle2, Circle, ArrowRight, FileText, Send, ListChecks, FileSignature } from "lucide-react";
import { prisma } from "@/lib/presales/db";
import { findCurrentStage } from "@/lib/presales/stageProgress";
import { completeCurrentStage, forceCompleteCurrentStage } from "@/lib/presales/adminActions";
import { Badge, Card, buttonPrimaryClass, buttonSecondaryClass } from "../../../_components/ui";
import { SubmitButton } from "../../../_components/SubmitButton";

const SURVEY_STATUS_BADGE: Record<string, "gray" | "amber" | "green"> = {
  draft: "gray",
  sent: "amber",
  completed: "green",
};
const SURVEY_STATUS_LABEL: Record<string, string> = {
  draft: "Taslak",
  sent: "Müşteride bekliyor",
  completed: "Tamamlandı",
};

function formatDate(date: Date | null) {
  return date ? new Date(date).toLocaleDateString("tr-TR", { timeZone: "Europe/Istanbul" }) : null;
}

function AnswerPreview({
  selection,
}: {
  selection: {
    id: string;
    text: string;
    type: string;
    response: { answerText: string | null; answerJson: unknown; document: { title: string; driveWebViewLink: string } | null } | null;
  };
}) {
  const response = selection.response;
  return (
    <p className="text-sm">
      <span className="font-medium text-brand-dark">{selection.text}: </span>
      {!response ? (
        <span className="italic text-text-muted">cevaplanmadı</span>
      ) : selection.type === "multi_choice" ? (
        <span className="text-text-body">
          {((response.answerJson as string[] | null) ?? []).join(", ") || "—"}
        </span>
      ) : selection.type === "file_upload" ? (
        response.document ? (
          <a
            href={response.document.driveWebViewLink}
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand-primary hover:underline"
          >
            {response.document.title}
          </a>
        ) : (
          <span className="text-text-muted">dosya yüklenmedi</span>
        )
      ) : (
        <span className="text-text-body">{response.answerText || "—"}</span>
      )}
    </p>
  );
}

export default async function JourneyOverviewTab({ params }: { params: { id: string } }) {
  const journey = await prisma.journey.findUnique({
    where: { id: params.id },
    include: {
      stages: {
        orderBy: { order: "asc" },
        include: {
          surveyInstances: {
            orderBy: { createdAt: "desc" },
            include: {
              selections: {
                include: { response: { include: { document: true } } },
                orderBy: { order: "asc" },
              },
            },
          },
        },
      },
    },
  });

  if (!journey) notFound();

  const activeStages = journey!.stages.filter((s) => s.isActive);
  const currentStage = findCurrentStage(activeStages);

  const allSurveys = activeStages.flatMap((stage) =>
    stage.surveyInstances.map((survey) => ({ ...survey, stageName: stage.name, stageStatus: stage.status }))
  );
  const pendingOnCustomer = allSurveys.filter((s) => s.status === "sent");
  const waitingOnUs = allSurveys.filter((s) => s.status === "completed" && s.stageStatus !== "completed");
  const allSurveysByStageOrder = activeStages.flatMap((stage) =>
    stage.surveyInstances.map((survey) => ({ ...survey, stageName: stage.name }))
  );

  const isCaseOpen = journey!.status === "active" && !journey!.archived;
  const currentStagePendingSurveys = currentStage
    ? pendingOnCustomer.filter((s) => s.stageId === currentStage.id).length
    : 0;
  const currentStageWaitingSurveys = currentStage
    ? waitingOnUs.filter((s) => s.stageId === currentStage.id).length
    : 0;
  const currentStageCanComplete =
    !!currentStage && currentStagePendingSurveys === 0 && currentStageWaitingSurveys === 0;
  // A stage that requires a survey but hasn't had one sent yet — the real
  // next action is creating/sending that survey, not completing the stage,
  // so that action should read as primary, not "Tamamla ve sıradakine geç".
  const currentStageNeedsSurveySent =
    !!currentStage &&
    currentStage.surveysEnabled &&
    !currentStage.surveyInstances.some((s) => s.status === "sent" || s.status === "completed");

  let banner: { color: "pink" | "amber" | "green" | "gray"; icon: typeof Zap; title: string; description: string };

  if (!isCaseOpen) {
    banner = {
      color: "gray",
      icon: CheckCircle2,
      title: "Aktif bir aksiyon gerekmiyor",
      description: journey!.archived
        ? "Bu case arşivlenmiş."
        : `Süreç şu an "${journey!.status}" durumunda.`,
    };
  } else if (waitingOnUs.length > 0) {
    banner = {
      color: "pink",
      icon: Zap,
      title: "Aksiyon Bizde",
      description: `Müşteri ${waitingOnUs.length} anketi tamamladı, inceleyip aşamayı ilerletmen bekleniyor.`,
    };
  } else if (pendingOnCustomer.length > 0) {
    banner = {
      color: "amber",
      icon: Clock,
      title: "Müşteride Bekliyor",
      description: `Müşteriye gönderilen ${pendingOnCustomer.length} anket henüz cevaplanmadı — şimdilik yapman gereken bir şey yok.`,
    };
  } else if (currentStage && !currentStage.surveysEnabled) {
    banner = {
      color: "pink",
      icon: Zap,
      title: "Aksiyon Bizde",
      description: `"${currentStage.name}" aşaması anket gerektirmiyor — tamamlandığında elle ilerlet.`,
    };
  } else if (currentStage) {
    banner = {
      color: "pink",
      icon: Zap,
      title: "Aksiyon Bizde",
      description: `"${currentStage.name}" aşaması için henüz müşteriye gönderilmiş bir anket yok.`,
    };
  } else {
    banner = {
      color: "green",
      icon: CheckCircle2,
      title: "Tüm aşamalar tamamlandı",
      description: 'Süreci "Ayarlar" sekmesinden Kazanıldı/Kaybedildi olarak sonuçlandırmayı unutma.',
    };
  }

  const BannerIcon = banner.icon;
  const bannerStyles: Record<string, string> = {
    pink: "border-brand-magenta/20 bg-brand-magenta/[0.04]",
    amber: "border-amber-200 bg-amber-50",
    green: "border-emerald-200 bg-emerald-50",
    gray: "border-gray-200 bg-gray-50",
  };
  const bannerIconStyles: Record<string, string> = {
    pink: "bg-brand-magenta/10 text-brand-magenta",
    amber: "bg-amber-100 text-amber-600",
    green: "bg-emerald-100 text-emerald-600",
    gray: "bg-gray-100 text-gray-500",
  };

  return (
    <div className="space-y-6">
      <Card className={`flex items-center gap-4 ${bannerStyles[banner.color]}`}>
        <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${bannerIconStyles[banner.color]}`}>
          <BannerIcon size={20} />
        </span>
        <div className="flex-1">
          <p className="text-base font-semibold text-brand-dark">{banner.title}</p>
          <p className="text-sm text-text-muted">{banner.description}</p>
        </div>
        {journey!.proposalRequested && (
          <Badge color="pink">
            <FileSignature size={12} className="mr-1" /> Teklif talep edildi
          </Badge>
        )}
      </Card>

      {currentStage && (
        <Card>
          <div className="mb-3 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">Şu anki aşama</p>
              <p className="text-lg font-semibold text-brand-dark">{currentStage.name}</p>
            </div>
            <div className="flex items-center gap-2">
              {currentStageCanComplete && (
                <form action={completeCurrentStage.bind(null, journey!.id)}>
                  <SubmitButton
                    className={currentStageNeedsSurveySent ? buttonSecondaryClass : buttonPrimaryClass}
                    pendingLabel="İşleniyor..."
                  >
                    Tamamla ve sıradakine geç
                  </SubmitButton>
                </form>
              )}
              {currentStage.surveysEnabled && currentStagePendingSurveys === 0 && currentStageWaitingSurveys === 0 && (
                <Link
                  href={`/presales/admin/journeys/${journey!.id}/surveys/new?stageId=${currentStage.id}`}
                  className={currentStageNeedsSurveySent ? buttonPrimaryClass : buttonSecondaryClass}
                >
                  <Send size={14} className="mr-1.5" /> Anket Oluştur
                </Link>
              )}
              {currentStagePendingSurveys > 0 && (
                <form action={forceCompleteCurrentStage.bind(null, journey!.id)}>
                  <SubmitButton
                    className={buttonSecondaryClass}
                    pendingLabel="İlerletiliyor..."
                    confirmMessage={`Bu aşamada ${currentStagePendingSurveys} cevaplanmamış anket var. Yine de ilerletirsen bu anket(ler) silinecek — müşteri cevabı telefon/e-posta gibi başka bir yoldan geldiyse ve tool'a ayrıca not düşmek istiyorsan önce onu yap. Devam edilsin mi?`}
                  >
                    Yine de ilerlet
                  </SubmitButton>
                </form>
              )}
            </div>
          </div>
          {currentStagePendingSurveys > 0 && (
            <p className="mb-2 text-xs text-amber-600">
              Müşteride {currentStagePendingSurveys} tamamlanmamış anket var — bu aşama normalde ancak
              o(nlar) cevaplanınca ilerler.
            </p>
          )}
          {currentStage.customerDescription && (
            <p className="text-sm text-text-muted">{currentStage.customerDescription}</p>
          )}
          {currentStage.customerWaitingMessage && (
            <p className="mt-2 border-t border-gray-100 pt-2 text-xs text-text-muted">
              <span className="font-medium text-brand-dark">Müşteri ekranında şunu görüyor: </span>
              {currentStage.customerWaitingMessage}
            </p>
          )}
        </Card>
      )}

      {waitingOnUs.length > 0 && (
        <Card>
          <p className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-brand-dark">
            <Zap size={15} className="text-brand-magenta" /> İncelemeni bekleyen anketler
          </p>
          <div className="space-y-2">
            {waitingOnUs.map((survey) => (
              <Link
                key={survey.id}
                href={`/presales/admin/journeys/${journey!.id}/surveys/${survey.id}`}
                className="flex items-center justify-between rounded-lg border border-gray-100 px-3.5 py-2.5 text-sm transition-colors hover:border-brand-primary hover:bg-brand-primary/[0.03]"
              >
                <span className="flex items-center gap-2">
                  <FileText size={14} className="text-gray-400" />
                  <span className="font-medium text-brand-dark">{survey.title}</span>
                  <span className="text-xs text-text-muted">· {survey.stageName}</span>
                </span>
                <ArrowRight size={14} className="text-gray-300" />
              </Link>
            ))}
          </div>
        </Card>
      )}

      {pendingOnCustomer.length > 0 && (
        <Card>
          <p className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-brand-dark">
            <Clock size={15} className="text-amber-500" /> Müşteride bekleyen anketler
          </p>
          <div className="space-y-2">
            {pendingOnCustomer.map((survey) => (
              <div
                key={survey.id}
                className="flex items-center justify-between rounded-lg border border-gray-100 px-3.5 py-2.5 text-sm"
              >
                <span className="flex items-center gap-2">
                  <FileText size={14} className="text-gray-400" />
                  <span className="font-medium text-brand-dark">{survey.title}</span>
                  <span className="text-xs text-text-muted">· {survey.stageName}</span>
                </span>
                <Badge color="amber">
                  {survey.sentAt ? new Date(survey.sentAt).toLocaleDateString("tr-TR", { timeZone: "Europe/Istanbul" }) : "—"} tarihinde gönderildi
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Card>
        <p className="mb-4 flex items-center gap-1.5 text-sm font-semibold text-brand-dark">
          <ListChecks size={15} className="text-brand-primary" /> Süreç Akışı
        </p>
        <ol className="space-y-3">
          {activeStages.map((stage) => {
            const isCompleted = stage.status === "completed";
            const isCurrent = stage.id === currentStage?.id;
            const stageSurveyCount = stage.surveyInstances.length;
            return (
              <li key={stage.id} className="flex items-start gap-3">
                <span
                  className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
                    isCompleted
                      ? "bg-brand-primary text-white"
                      : isCurrent
                      ? "border-2 border-brand-primary text-brand-primary"
                      : "border-2 border-gray-200 text-gray-300"
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle2 size={13} strokeWidth={2.5} />
                  ) : (
                    <Circle size={8} fill="currentColor" />
                  )}
                </span>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className={`text-sm font-medium ${isCurrent ? "text-brand-primary" : "text-brand-dark"}`}>
                      {stage.name}
                    </p>
                    {isCurrent && <Badge color="blue">şu anda burada</Badge>}
                    {stageSurveyCount > 0 && (
                      <span className="text-xs text-text-muted">
                        {stageSurveyCount} anket
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-text-muted">
                    {formatDate(stage.enteredAt) && `Başladı: ${formatDate(stage.enteredAt)}`}
                    {formatDate(stage.enteredAt) && formatDate(stage.completedAt) && " · "}
                    {formatDate(stage.completedAt) && `Tamamlandı: ${formatDate(stage.completedAt)}`}
                    {!stage.enteredAt && !stage.completedAt && "Henüz başlamadı"}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>
      </Card>

      {allSurveysByStageOrder.length > 0 && (
        <Card>
          <p className="mb-4 flex items-center gap-1.5 text-sm font-semibold text-brand-dark">
            <FileText size={15} className="text-brand-primary" /> Tüm Anketler ve Cevaplar
          </p>
          <div className="space-y-5">
            {allSurveysByStageOrder.map((survey) => (
              <div key={survey.id} className="border-b border-gray-100 pb-5 last:border-0 last:pb-0">
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                  <span className="text-sm">
                    <span className="font-medium text-brand-dark">{survey.title}</span>
                    <span className="text-xs text-text-muted"> · {survey.stageName}</span>
                  </span>
                  <div className="flex items-center gap-2">
                    <Badge color={SURVEY_STATUS_BADGE[survey.status] ?? "gray"}>
                      {SURVEY_STATUS_LABEL[survey.status] ?? survey.status}
                    </Badge>
                    <Link
                      href={`/presales/admin/journeys/${journey!.id}/surveys/${survey.id}`}
                      className="text-xs font-medium text-brand-primary hover:underline"
                    >
                      Detay / Excel
                    </Link>
                  </div>
                </div>
                {survey.status === "completed" ? (
                  <div className="space-y-1.5 rounded-lg bg-gray-50 p-3">
                    {survey.selections.map((selection) => (
                      <AnswerPreview key={selection.id} selection={selection} />
                    ))}
                    {survey.selections.length === 0 && (
                      <p className="text-sm italic text-text-muted">Bu ankette soru yok.</p>
                    )}
                  </div>
                ) : survey.status === "sent" ? (
                  <p className="text-xs text-amber-600">Müşteriye gönderildi, henüz cevaplanmadı.</p>
                ) : (
                  <p className="text-xs text-text-muted">Henüz gönderilmedi (taslak).</p>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
