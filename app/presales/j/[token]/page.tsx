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

// Shared "frosted glass" card treatment — semi-transparent white + blur so the
// decorative gradient blobs behind the page show through softly, with a
// gentle colored shadow instead of a flat gray one for a more elevated feel.
const glassCardClass =
  "rounded-[28px] border border-white/80 bg-white/80 shadow-[0_16px_40px_-22px_rgba(15,23,42,0.18)] backdrop-blur-xl";

function initialsOf(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

// Decorative, fixed-position blurred color blobs behind the whole page —
// the signature of the glassmorphism look; every card above floats on top
// of these via backdrop-blur instead of a flat solid background.
function BackgroundBlobs() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-[#F7F8FB]">
      <div className="absolute -left-40 -top-48 h-[28rem] w-[28rem] rounded-full bg-brand-primary/[0.07] blur-[130px]" />
      <div className="absolute -right-32 top-1/4 h-[26rem] w-[26rem] rounded-full bg-brand-magenta/[0.05] blur-[130px]" />
      <div className="absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-brand-primary/[0.04] blur-[130px]" />
    </div>
  );
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
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#F7F8FB] px-6 text-text-body">
        <BackgroundBlobs />
        <div className={`max-w-sm p-8 text-center ${glassCardClass}`}>
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
  // `Document.customerVisible` is the single, explicit toggle admins use for
  // this — it used to also be silently gated on the document's stage having
  // started, so a document uploaded ahead of time for a future stage would
  // stay invisible with no indication why. Admins can just upload it later if
  // they want it to appear only once that stage begins.
  const visibleDocuments = journey!.documents;

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
    <div className="relative min-h-screen overflow-hidden bg-[#F7F8FB] text-text-body">
      <BackgroundBlobs />

      <div className="mx-auto max-w-7xl px-6 pb-14 pt-8 sm:px-10 lg:px-16">
        {/* Hero — a floating gradient card, not a full-bleed banner, so it reads
            as one element among several rather than eating the whole viewport. */}
        <div className="relative mb-7 overflow-hidden rounded-[28px] bg-gradient-to-br from-brand-dark to-brand-primary shadow-[0_20px_45px_-24px_rgba(15,23,42,0.5)] ring-1 ring-white/10">
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              backgroundImage:
                "radial-gradient(circle at 96% 8%, rgba(233,30,140,0.3) 0, transparent 42%), radial-gradient(circle at 6% 100%, rgba(255,255,255,0.08) 0, transparent 35%)",
            }}
          />
          <div className="relative px-6 py-8 text-white sm:px-10 sm:py-14">
            <div className="flex flex-wrap items-center justify-between gap-5">
              <div>
                {journey!.prospect.logoUrl ? (
                  <img
                    src={journey!.prospect.logoUrl}
                    alt={journey!.prospect.companyName}
                    className="mb-3 h-11 max-w-[220px] object-contain object-left sm:h-14"
                  />
                ) : (
                  <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 ring-1 ring-inset ring-white/25 backdrop-blur-sm">
                    <Sparkles size={11} className="text-white/80" />
                    <span className="text-[10.5px] font-medium uppercase tracking-wider text-white/80">
                      {journey!.prospect.companyName}
                    </span>
                  </div>
                )}
                <h1 className="text-2xl font-semibold tracking-tight sm:text-4xl">
                  Merhaba {journey!.prospect.contactName}
                </h1>
                {hasRemainingEstimates && (
                  <p className="mt-2 text-sm text-white/70">Tahmini kalan süre: ~{remainingEstimatedDays} gün</p>
                )}
              </div>
              <div className="flex items-center gap-3 sm:gap-4">
                <div
                  className="relative flex h-16 w-16 shrink-0 items-center justify-center rounded-full shadow-[0_0_16px_rgba(255,255,255,0.18)] sm:h-20 sm:w-20"
                  style={{ background: `conic-gradient(white ${progressPct * 3.6}deg, rgba(255,255,255,0.18) 0deg)` }}
                >
                  <div className="flex h-[52px] w-[52px] items-center justify-center rounded-full bg-brand-primary sm:h-[66px] sm:w-[66px]">
                    <span className="text-sm font-semibold tabular-nums sm:text-base">%{progressPct}</span>
                  </div>
                </div>
                <div>
                  <p className="text-[10.5px] uppercase tracking-wide text-white/60 sm:text-[11px]">Süreç İlerlemesi</p>
                  <p className="text-sm font-semibold sm:text-base">
                    {completedCount} / {totalCount} aşama tamamlandı
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Timeline — the visual centerpiece, floating as a frosted glass card.
            Below `sm` this is a vertical stepper (a horizontally-scrolling row
            of 5-6 stops doesn't read as "the important part" on a phone — it
            reads as a sideways-scrolling strip most people never swipe), and
            from `sm` up it becomes the horizontal row with connecting lines. */}
        <div className={`mb-9 p-6 sm:p-9 ${glassCardClass}`}>
          <div className="mb-6 flex flex-wrap items-center justify-between gap-2 sm:mb-8">
            <h2 className="text-xs font-semibold uppercase tracking-[0.15em] text-text-muted">Süreciniz</h2>
            {hasEstimates && (
              <span className="text-xs text-text-muted">Toplam tahmini süre: ~{totalEstimatedDays} gün</span>
            )}
          </div>

          {/* Mobile: vertical stepper */}
          <ol className="space-y-0 sm:hidden">
            {visibleStages.map((stage, index) => {
              const isCompleted = stage.status === "completed";
              const isCurrent = index === currentStageIndex;
              const isPastOrCurrent = currentStageIndex === -1 ? true : index <= currentStageIndex;
              const label = stage.customerDescription;
              const isLast = index === visibleStages.length - 1;

              return (
                <li key={stage.id} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div
                      className={`relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${
                        isCompleted
                          ? "bg-brand-primary text-white"
                          : isCurrent
                          ? "border-2 border-brand-primary bg-white/90 text-brand-primary ring-[4px] ring-brand-primary/[0.06]"
                          : "border-2 border-gray-200/80 bg-gray-50/80 text-gray-400"
                      }`}
                    >
                      {isCurrent && (
                        <span className="absolute inset-0 -z-10 animate-pulse rounded-full bg-brand-primary/10" />
                      )}
                      {isCompleted ? <Check size={15} strokeWidth={2.5} /> : index + 1}
                    </div>
                    {!isLast && (
                      <div
                        className={`w-[2px] flex-1 ${isPastOrCurrent ? "bg-brand-primary/40" : "bg-gray-200/70"}`}
                      />
                    )}
                  </div>
                  <div className={`min-w-0 pb-6 ${isLast ? "pb-0" : ""}`}>
                    <p
                      className={`pt-1 text-[14px] font-semibold leading-snug ${
                        isCurrent ? "text-brand-primary" : isCompleted ? "text-brand-dark" : "text-text-muted"
                      }`}
                    >
                      {stage.name}
                      {stage.estimatedDays != null && (
                        <span className="ml-1.5 text-[11px] font-normal text-text-muted">
                          ~{stage.estimatedDays} gün
                        </span>
                      )}
                    </p>
                    {isCurrent && (
                      <span className="mt-1.5 inline-block rounded-full bg-brand-primary/10 px-2.5 py-1 text-[11px] font-semibold text-brand-primary ring-1 ring-inset ring-brand-primary/15">
                        Şu anda bu aşamadasınız
                      </span>
                    )}
                    {isCurrent && label && (
                      <p className="mt-1.5 text-[12.5px] leading-snug text-text-muted">{label}</p>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>

          {/* sm and up: horizontal stepper */}
          <div className="hidden w-full items-start overflow-x-auto pb-1 sm:flex">
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
                      className={`mt-[22px] h-[2px] flex-1 rounded-full ${
                        isPastOrCurrent ? "bg-brand-primary/40" : "bg-gray-200/70"
                      }`}
                    />
                  )}
                  <div className="flex min-w-[120px] max-w-[190px] flex-col items-center px-2 text-center">
                    <div
                      className={`relative flex h-11 w-11 items-center justify-center rounded-full text-base font-semibold transition-all ${
                        isCompleted
                          ? "bg-brand-primary text-white shadow-[0_4px_12px_-4px_rgba(26,111,168,0.4)]"
                          : isCurrent
                          ? "border-2 border-brand-primary bg-white/90 text-brand-primary shadow-[0_4px_12px_-4px_rgba(26,111,168,0.18)] ring-[5px] ring-brand-primary/[0.06]"
                          : "border-2 border-gray-200/80 bg-gray-50/80 text-gray-400"
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
                      <span className="mt-2 rounded-full bg-brand-primary/10 px-2.5 py-1 text-[11px] font-semibold text-brand-primary ring-1 ring-inset ring-brand-primary/15">
                        Şu anda bu aşamadasınız
                      </span>
                    )}
                    {isCurrent && label && (
                      <p className="mt-2.5 text-[12px] leading-snug text-text-muted">{label}</p>
                    )}
                  </div>
                </Fragment>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="space-y-7 lg:col-span-2">
            {/* The stage's main customer-facing message — shown for the current
                stage regardless of whether there's a pending survey, since it's
                meant to be the primary thing we want the customer to read at
                this point in the process, not just a "nothing to do" filler. */}
            {currentStage?.customerWaitingMessage && (
              <div className={`overflow-hidden ${glassCardClass}`}>
                <div className="h-1.5 w-full bg-gradient-to-r from-brand-primary to-brand-magenta" />
                <p className="p-6 text-sm leading-relaxed text-text-body sm:p-8">
                  {currentStage.customerWaitingMessage}
                </p>
              </div>
            )}
            {pendingSurveys.length > 0 ? (
              pendingSurveys.map((survey) => (
                <form
                  key={survey.id}
                  action={submitSurveyResponses.bind(null, params.token, survey.id)}
                  className={`overflow-hidden ${glassCardClass}`}
                >
                  <div className="h-1.5 w-full bg-gradient-to-r from-brand-primary to-brand-magenta" />
                  <div className="space-y-6 p-8">
                    <div className="flex items-center gap-2.5">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-brand-primary to-brand-magenta shadow-[0_4px_10px_-4px_rgba(26,111,168,0.3)]">
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
                        className="rounded-xl border border-gray-300 bg-white/80 px-5 py-2.5 font-medium text-text-body backdrop-blur-sm transition-colors hover:border-brand-primary hover:text-brand-primary"
                        pendingLabel="Kaydediliyor..."
                        formNoValidate
                        formAction={saveSurveyDraft.bind(null, params.token, survey.id)}
                      >
                        Taslağı Kaydet
                      </SubmitButton>
                      <SubmitButton
                        className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-primary to-brand-magenta px-6 py-2.5 font-medium text-white shadow-[0_6px_16px_-6px_rgba(26,111,168,0.35)] transition-opacity hover:opacity-90"
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
              <div className={`overflow-hidden ${glassCardClass}`}>
                <div className="h-1.5 w-full bg-gradient-to-r from-emerald-400 to-brand-primary" />
                <div className="flex flex-col items-center gap-3 p-6 text-center sm:p-10">
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-50 text-emerald-500 ring-1 ring-inset ring-emerald-100">
                    <Check size={20} />
                  </span>
                  <p className="text-[15px] font-medium text-brand-dark">Şu anda sizden beklenen bir aksiyon yok</p>
                  <p className="max-w-sm text-sm leading-relaxed text-text-muted">
                    Yeni bir adım olduğunda burada göreceksiniz — bu sayfayı yer imlerinize ekleyebilirsiniz.
                  </p>
                </div>
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
                      className={`group flex flex-wrap items-center justify-between gap-2 p-4 transition-all hover:-translate-y-0.5 hover:shadow-[0_12px_28px_-18px_rgba(26,111,168,0.2)] ${glassCardClass}`}
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
              <div className={`overflow-hidden ${glassCardClass}`}>
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

                {journey!.product && journey!.salesRep && <div className="border-t border-white/60" />}

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
                    <div className="mt-3.5 space-y-1.5 border-t border-white/60 pt-3.5 text-sm">
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
                      className={`flex items-center gap-3 p-4 transition-all hover:-translate-y-0.5 hover:shadow-[0_12px_28px_-18px_rgba(26,111,168,0.2)] ${glassCardClass}`}
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
              <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-gray-300/70 bg-white/40 p-6 text-center backdrop-blur-sm">
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
