import { Fragment } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Check,
  FileText,
  ClipboardCheck,
  Video,
  File as FileIcon,
  Package,
  UserRound,
  Mail,
  Phone,
  ArrowRight,
  Sparkles,
  Inbox,
  Lock,
} from "lucide-react";
import { prisma } from "@/lib/presales/db";
import { findCurrentStage } from "@/lib/presales/stageProgress";
import { isJourneyLinkActive } from "@/lib/presales/journeyLink";
import { saveSurveyDraft, submitSurveyResponses } from "./actions";
import { SurveyAnswerForm } from "./SurveyAnswerForm";
import { SubmitButton } from "../../_components/SubmitButton";

export const metadata = {
  robots: { index: false, follow: false },
};

const DOCUMENT_LABELS: Record<string, string> = {
  proposal: "Teklif",
  project_plan: "Proje Planı",
  recording: "Toplantı Kaydı",
  survey_export: "Anket Cevapları",
  other: "Belge",
};

const DOCUMENT_ICONS: Record<string, typeof FileText> = {
  proposal: ClipboardCheck,
  project_plan: FileText,
  recording: Video,
  other: FileIcon,
};

const DOCUMENT_COLORS: Record<string, string> = {
  proposal: "bg-svc-finance/10 text-svc-finance",
  project_plan: "bg-svc-data/10 text-svc-data",
  recording: "bg-brand-magenta/10 text-brand-magenta",
  other: "bg-gray-100 text-text-muted",
};

function initialsOf(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default async function CustomerJourneyPage({ params }: { params: { token: string } }) {
  const journey = await prisma.journey.findUnique({
    where: { accessToken: params.token },
    include: {
      prospect: true,
      salesRep: true,
      product: true,
      stages: { orderBy: { order: "asc" } },
      surveyInstances: {
        where: { status: { in: ["sent", "completed"] } },
        include: {
          stage: true,
          selections: { include: { response: { include: { document: true } } }, orderBy: { order: "asc" } },
        },
        orderBy: { createdAt: "asc" },
      },
      documents: { where: { customerVisible: true }, orderBy: { uploadedAt: "desc" } },
    },
  });

  if (!journey) notFound();

  if (!isJourneyLinkActive(journey)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F8F9FB] px-6 text-text-body">
        <div className="max-w-sm rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
          <span className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-gray-100 text-gray-400">
            <Lock size={18} />
          </span>
          <h1 className="mb-2 text-lg font-semibold text-brand-dark">Bu bağlantı artık aktif değil</h1>
          <p className="text-sm text-text-muted">
            Bu link için erişim kapatılmış. Sorularınız için satış temsilcinizle iletişime geçebilirsiniz.
          </p>
        </div>
      </div>
    );
  }

  const visibleStages = journey!.stages.filter((s) => s.customerVisible && s.isActive);
  const reachedStageIds = new Set(
    journey!.stages.filter((s) => s.status === "active" || s.status === "completed").map((s) => s.id)
  );
  const visibleDocuments = journey!.documents.filter(
    (doc) => !doc.stageId || reachedStageIds.has(doc.stageId)
  );

  const pendingSurveys = journey!.surveyInstances.filter((s) => s.status === "sent");
  const completedSurveys = journey!.surveyInstances.filter((s) => s.status === "completed");
  const completedCount = visibleStages.filter((s) => s.status === "completed").length;
  const totalCount = visibleStages.length;
  const progressPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const hasEstimates = visibleStages.some((s) => s.estimatedDays != null);
  const totalEstimatedDays = visibleStages.reduce((sum, s) => sum + (s.estimatedDays ?? 0), 0);

  // The customer should only ever see a single "you are here" marker, and it must always sit
  // right after the last completed stage — regardless of how many stages an admin has separately
  // marked "active" (e.g. an early proposal-request loopback keeps an earlier stage active too).
  const currentStage = findCurrentStage(visibleStages);
  const currentStageIndex = currentStage ? visibleStages.findIndex((s) => s.id === currentStage.id) : -1;
  const remainingStages = currentStageIndex === -1 ? [] : visibleStages.slice(currentStageIndex);
  const hasRemainingEstimates = remainingStages.some((s) => s.estimatedDays != null);
  const remainingEstimatedDays = remainingStages.reduce((sum, s) => sum + (s.estimatedDays ?? 0), 0);

  return (
    <div className="min-h-screen bg-[#F8F9FB] text-text-body">
      {/* Full-bleed hero */}
      <header className="relative overflow-hidden bg-gradient-to-br from-brand-dark via-brand-primary to-brand-magenta text-white">
        <div
          className="pointer-events-none absolute inset-0 opacity-25"
          style={{
            backgroundImage:
              "radial-gradient(circle at 12% 15%, white 0, transparent 32%), radial-gradient(circle at 88% 85%, white 0, transparent 32%), radial-gradient(circle at 90% 10%, white 0, transparent 22%)",
          }}
        />
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)",
            backgroundSize: "44px 44px",
          }}
        />
        <div className="relative mx-auto max-w-7xl px-6 py-16 sm:px-10 lg:px-16">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1.5 ring-1 ring-inset ring-white/20 backdrop-blur-sm">
            <Sparkles size={13} className="text-white/80" />
            <span className="text-xs font-medium uppercase tracking-wider text-white/80">
              {journey!.prospect.companyName}
            </span>
          </div>
          <h1 className="mb-3 text-4xl font-semibold tracking-tight sm:text-5xl">
            Merhaba {journey!.prospect.contactName}
          </h1>
          <p className="mb-10 max-w-xl text-[15px] leading-relaxed text-white/75">
            Birlikte yürüttüğümüz presales sürecini burada uçtan uca takip edebilir, bekleyen aksiyonları
            tamamlayabilirsiniz.
          </p>

          <div className="max-w-2xl">
            <div className="mb-2.5 flex items-end justify-between">
              <span className="text-sm font-medium text-white/80">Süreç ilerlemesi</span>
              <span className="text-2xl font-semibold tabular-nums">%{progressPct}</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-white/15">
              <div
                className="h-full rounded-full bg-gradient-to-r from-white/80 to-white shadow-[0_0_12px_rgba(255,255,255,0.5)] transition-all"
                style={{ width: `${Math.max(progressPct, 4)}%` }}
              />
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <div className="rounded-xl bg-white/10 px-4 py-2.5 ring-1 ring-inset ring-white/15 backdrop-blur-sm">
                <p className="text-[11px] uppercase tracking-wide text-white/60">Aşama</p>
                <p className="text-sm font-semibold">
                  {completedCount} / {totalCount} tamamlandı
                </p>
              </div>
              {hasEstimates && (
                <div className="rounded-xl bg-white/10 px-4 py-2.5 ring-1 ring-inset ring-white/15 backdrop-blur-sm">
                  <p className="text-[11px] uppercase tracking-wide text-white/60">Toplam Süreç</p>
                  <p className="text-sm font-semibold">~{totalEstimatedDays} gün</p>
                </div>
              )}
              {hasRemainingEstimates && (
                <div className="rounded-xl bg-white/10 px-4 py-2.5 ring-1 ring-inset ring-white/15 backdrop-blur-sm">
                  <p className="text-[11px] uppercase tracking-wide text-white/60">Kalan Süre</p>
                  <p className="text-sm font-semibold">~{remainingEstimatedDays} gün</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Full-bleed process band */}
      <section className="border-b border-gray-200/80 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-11 sm:px-10 lg:px-16">
          <h2 className="mb-9 text-xs font-semibold uppercase tracking-[0.15em] text-text-muted">Süreç</h2>
          <div className="flex w-full items-start">
            {visibleStages.map((stage, index) => {
              // Stages always proceed strictly in order now — there is no "started early"
              // state anymore, so a stage is either done, the current one, or upcoming.
              const isCompleted = stage.status === "completed";
              const isCurrent = index === currentStageIndex;
              const isPastOrCurrent = currentStageIndex === -1 ? true : index <= currentStageIndex;
              const label = stage.customerDescription;

              return (
                <Fragment key={stage.id}>
                  {index > 0 && (
                    <div
                      className={`mt-[22px] h-[3px] flex-1 rounded-full ${
                        isPastOrCurrent ? "bg-gradient-to-r from-brand-primary to-brand-magenta" : "bg-gray-200"
                      }`}
                    />
                  )}
                  <div className="flex min-w-[100px] max-w-[168px] flex-col items-center px-2 text-center">
                    <div
                      className={`relative flex h-11 w-11 items-center justify-center rounded-full text-base font-semibold transition-all ${
                        isCompleted
                          ? "bg-gradient-to-br from-brand-primary to-brand-magenta text-white shadow-md shadow-brand-primary/20"
                          : isCurrent
                          ? "border-2 border-brand-primary bg-white text-brand-primary shadow-md shadow-brand-primary/10 ring-[5px] ring-brand-primary/10"
                          : "border-2 border-gray-200 bg-gray-50 text-gray-400"
                      }`}
                    >
                      {isCurrent && (
                        <span className="absolute inset-0 -z-10 animate-pulse rounded-full bg-brand-primary/10" />
                      )}
                      {isCompleted ? <Check size={18} strokeWidth={2.5} /> : index + 1}
                    </div>
                    <p
                      className={`mt-3 text-[13.5px] font-semibold leading-snug ${
                        isCurrent ? "text-brand-primary" : isCompleted ? "text-brand-dark" : "text-text-muted"
                      }`}
                    >
                      {stage.name}
                    </p>
                    {stage.estimatedDays != null && (
                      <p className="mt-0.5 text-[11px] text-text-muted">~{stage.estimatedDays} gün</p>
                    )}
                    {isCurrent && (
                      <span className="mt-2 rounded-full bg-brand-primary/10 px-2.5 py-1 text-[11px] font-semibold text-brand-primary">
                        Şu anda bu aşamadasınız
                      </span>
                    )}
                    {isCurrent && label && (
                      <p className="mt-2.5 text-[12.5px] leading-snug text-text-muted">{label}</p>
                    )}
                  </div>
                </Fragment>
              );
            })}
          </div>
        </div>
      </section>

      {/* Content grid */}
      <div className="mx-auto max-w-7xl px-6 py-14 sm:px-10 lg:px-16">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="space-y-7 lg:col-span-2">
            {pendingSurveys.length > 0 ? (
              pendingSurveys.map((survey) => (
                <form
                  key={survey.id}
                  action={submitSurveyResponses.bind(null, params.token, survey.id)}
                  className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-[0_4px_24px_-4px_rgba(26,111,168,0.12)]"
                >
                  <div className="h-1.5 w-full bg-gradient-to-r from-brand-primary to-brand-magenta" />
                  <div className="space-y-6 p-8">
                    <div className="flex items-center gap-2.5">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-brand-primary to-brand-magenta">
                        <Sparkles size={14} className="text-white" />
                      </span>
                      <span className="text-xs font-semibold uppercase tracking-wider text-brand-magenta">
                        Aksiyon Gerekli
                      </span>
                    </div>
                    <h3 className="text-xl font-semibold text-brand-dark">{survey.title}</h3>
                    <SurveyAnswerForm selections={survey.selections} />
                    <div className="flex flex-wrap items-center gap-3">
                      <SubmitButton
                        className="rounded-xl border border-gray-300 bg-white px-5 py-2.5 font-medium text-text-body transition-colors hover:border-brand-primary hover:text-brand-primary"
                        pendingLabel="Kaydediliyor..."
                        formNoValidate
                        formAction={saveSurveyDraft.bind(null, params.token, survey.id)}
                      >
                        Taslağı Kaydet
                      </SubmitButton>
                      <SubmitButton
                        className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-primary to-brand-magenta px-6 py-2.5 font-medium text-white shadow-sm shadow-brand-primary/20 transition-opacity hover:opacity-90"
                        pendingLabel="Gönderiliyor..."
                      >
                        Gönder <ArrowRight size={15} />
                      </SubmitButton>
                    </div>
                    <p className="text-xs text-text-muted">
                      İlerlemenizi kaybetmemek için istediğiniz zaman taslak olarak kaydedebilir, daha sonra bu
                      linkten devam edebilirsiniz.
                    </p>
                  </div>
                </form>
              ))
            ) : (
              <div className="flex flex-col items-center gap-3 rounded-2xl border border-gray-200 bg-white p-10 text-center shadow-sm">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-50 text-emerald-500">
                  <Check size={20} />
                </span>
                <p className="text-[15px] font-medium text-brand-dark">Şu anda sizden beklenen bir aksiyon yok</p>
                <p className="max-w-xs text-sm text-text-muted">
                  Yeni bir adım olduğunda burada göreceksiniz — bu sayfayı yer imlerinize ekleyebilirsiniz.
                </p>
              </div>
            )}

            {completedSurveys.length > 0 && (
              <div>
                <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.15em] text-text-muted">
                  Tamamladığınız Anketler
                </h2>
                <div className="space-y-2">
                  {completedSurveys.map((survey) => (
                    <Link
                      key={survey.id}
                      href={`/presales/j/${params.token}/surveys/${survey.id}`}
                      className="group flex flex-wrap items-center justify-between gap-2 rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-brand-primary/30 hover:shadow-md"
                    >
                      <span className="flex items-center gap-2.5 text-sm font-medium text-brand-dark">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-50 text-emerald-500">
                          <Check size={13} strokeWidth={2.5} />
                        </span>
                        {survey.title}
                      </span>
                      <span className="flex items-center gap-1 text-xs font-medium text-brand-primary">
                        Cevaplarımı Gör
                        <ArrowRight size={12} className="transition-transform group-hover:translate-x-0.5" />
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-5">
            {(journey!.product || journey!.salesRep) && (
              <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                {journey!.product && (
                  <div className="p-5">
                    <p className="mb-2.5 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-text-muted">
                      <Package size={13} /> İlgili Ürün / Uzmanlık
                    </p>
                    <p className="font-semibold text-brand-dark">{journey!.product.name}</p>
                    {journey!.product.description && (
                      <p className="mt-1 text-sm leading-relaxed text-text-muted">{journey!.product.description}</p>
                    )}
                  </div>
                )}

                {journey!.product && journey!.salesRep && <div className="border-t border-gray-100" />}

                {journey!.salesRep && (
                  <div className="p-5">
                    <p className="mb-3 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-text-muted">
                      <UserRound size={13} /> Satış Temsilciniz
                    </p>
                    <div className="flex items-center gap-3">
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-primary to-brand-magenta text-sm font-semibold text-white shadow-sm">
                        {initialsOf(journey!.salesRep.name)}
                      </span>
                      <div>
                        <p className="font-semibold text-brand-dark">{journey!.salesRep.name}</p>
                        {journey!.salesRep.title && (
                          <p className="text-xs text-text-muted">{journey!.salesRep.title}</p>
                        )}
                      </div>
                    </div>
                    <div className="mt-3.5 space-y-1.5 border-t border-gray-100 pt-3.5 text-sm">
                      <a
                        href={`mailto:${journey!.salesRep.email}`}
                        className="flex items-center gap-2 text-text-body transition-colors hover:text-brand-primary"
                      >
                        <Mail size={14} className="text-gray-400" /> {journey!.salesRep.email}
                      </a>
                      {journey!.salesRep.phone && (
                        <a
                          href={`tel:${journey!.salesRep.phone}`}
                          className="flex items-center gap-2 text-text-body transition-colors hover:text-brand-primary"
                        >
                          <Phone size={14} className="text-gray-400" /> {journey!.salesRep.phone}
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            <h2 className="text-xs font-semibold uppercase tracking-[0.15em] text-text-muted">
              Sizinle Paylaşılanlar
            </h2>
            {visibleDocuments.length > 0 ? (
              <div className="space-y-2">
                {visibleDocuments.map((doc) => {
                  const Icon = DOCUMENT_ICONS[doc.type] ?? FileIcon;
                  const colorClass = DOCUMENT_COLORS[doc.type] ?? DOCUMENT_COLORS.other;
                  return (
                    <a
                      key={doc.id}
                      href={doc.driveWebViewLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-brand-primary/30 hover:shadow-md"
                    >
                      <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${colorClass}`}>
                        <Icon size={17} />
                      </span>
                      <div className="min-w-0">
                        <span className="block truncate font-medium text-brand-dark">{doc.title}</span>
                        <span className="block text-xs text-text-muted">{DOCUMENT_LABELS[doc.type] ?? doc.type}</span>
                      </div>
                    </a>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-gray-200 bg-white/60 p-6 text-center">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-gray-400">
                  <Inbox size={16} />
                </span>
                <p className="text-sm text-text-muted">Henüz sizinle paylaşılan bir belge yok.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
