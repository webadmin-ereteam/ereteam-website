import Link from "next/link";
import { notFound } from "next/navigation";
import { Zap, Clock, CheckCircle2, ArrowRight, FileText, Send } from "lucide-react";
import { prisma } from "@/lib/presales/db";
import { findCurrentStage } from "@/lib/presales/stageProgress";
import { completeCurrentStage } from "@/lib/presales/adminActions";
import { Badge, Card, buttonPrimaryClass, buttonSecondaryClass } from "../../../_components/ui";
import { SubmitButton } from "../../../_components/SubmitButton";

export default async function JourneyOverviewTab({ params }: { params: { id: string } }) {
  const journey = await prisma.journey.findUnique({
    where: { id: params.id },
    include: {
      stages: {
        orderBy: { order: "asc" },
        include: { surveyInstances: { orderBy: { createdAt: "desc" } } },
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

  const isCaseOpen = journey!.status === "active" && !journey!.archived;
  const currentStagePendingSurveys = currentStage
    ? pendingOnCustomer.filter((s) => s.stageId === currentStage.id).length
    : 0;
  const currentStageWaitingSurveys = currentStage
    ? waitingOnUs.filter((s) => s.stageId === currentStage.id).length
    : 0;
  const currentStageCanComplete =
    !!currentStage && currentStagePendingSurveys === 0 && currentStageWaitingSurveys === 0;

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
        <div>
          <p className="text-base font-semibold text-brand-dark">{banner.title}</p>
          <p className="text-sm text-text-muted">{banner.description}</p>
        </div>
      </Card>

      {currentStage && (
        <Card>
          <div className="mb-3 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">Şu anki aşama</p>
              <p className="text-lg font-semibold text-brand-dark">{currentStage.name}</p>
            </div>
            {currentStageCanComplete && (
              <form action={completeCurrentStage.bind(null, journey!.id)}>
                <SubmitButton className={buttonPrimaryClass} pendingLabel="İşleniyor...">
                  Tamamla ve sıradakine geç
                </SubmitButton>
              </form>
            )}
            {currentStage.surveysEnabled && currentStagePendingSurveys === 0 && currentStageWaitingSurveys === 0 && (
              <Link
                href={`/presales/admin/journeys/${journey!.id}/surveys/new?stageId=${currentStage.id}`}
                className={buttonSecondaryClass}
              >
                <Send size={14} className="mr-1.5" /> Anket Oluştur
              </Link>
            )}
          </div>
          {currentStage.customerDescription && (
            <p className="text-sm text-text-muted">{currentStage.customerDescription}</p>
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
                  {survey.sentAt ? new Date(survey.sentAt).toLocaleDateString("tr-TR") : "—"} tarihinde gönderildi
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
