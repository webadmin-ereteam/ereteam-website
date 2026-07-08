import Link from "next/link";
import { Users, Clock, CheckCircle2, XCircle, Zap, Plus } from "lucide-react";
import { prisma } from "@/lib/presales/db";
import { findCurrentStage } from "@/lib/presales/stageProgress";
import { isJourneyLinkActive } from "@/lib/presales/journeyLink";
import { JOURNEY_STATUSES, JOURNEY_STATUS_LABELS } from "@/lib/presales/journeyStatus";
import { DATE_RANGE_PRESETS, resolveDateRangePreset } from "@/lib/presales/dateRangePresets";
import { formatDisplayDate } from "@/lib/presales/formatDate";
import { Card, PageHeader, buttonPrimaryClass, buttonSecondaryClass, inputClass } from "../_components/ui";
import { JourneyListWithSelection, type JourneyRow } from "./JourneyListWithSelection";

export default async function AdminDashboardPage({
  searchParams,
}: {
  searchParams: {
    status?: string;
    salesRepId?: string;
    productId?: string;
    q?: string;
    archived?: string;
    linkActive?: string;
    action?: string;
    closeDate?: string;
    createdDate?: string;
  };
}) {
  const [journeys, salesReps, products] = await Promise.all([
    prisma.journey.findMany({
      include: {
        prospect: true,
        salesRep: true,
        product: true,
        stages: { orderBy: { order: "asc" } },
        surveyInstances: { include: { stage: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.salesRep.findMany({ orderBy: { name: "asc" } }),
    prisma.product.findMany({ orderBy: { name: "asc" } }),
  ]);

  const activeCount = journeys.filter((j) => j.status === "active").length;
  const wonCount = journeys.filter((j) => j.status === "won").length;
  const lostCount = journeys.filter((j) => j.status === "lost").length;

  const pendingOnCustomer = (j: (typeof journeys)[number]) =>
    j.surveyInstances.filter((s) => s.status === "sent").length;

  const ballInOurCourt = (j: (typeof journeys)[number]) =>
    j.surveyInstances.filter((s) => s.status === "completed" && s.stage.status !== "completed").length;

  const pendingSurveyCount = journeys.reduce((sum, j) => sum + pendingOnCustomer(j), 0);
  const ballInOurCourtCount = journeys.reduce((sum, j) => sum + ballInOurCourt(j), 0);

  // Archived cases stay out of the dashboard unless explicitly asked for —
  // "no" (hide archived) is the default the moment no filter param is present,
  // not just an option someone has to remember to pick.
  const archivedFilter = searchParams.archived || "no";

  const closeDateRange = resolveDateRangePreset(searchParams.closeDate);
  const createdDateRange = resolveDateRangePreset(searchParams.createdDate);

  const query = (searchParams.q ?? "").trim().toLowerCase();
  const filteredJourneys = journeys.filter((j) => {
    if (searchParams.status && j.status !== searchParams.status) return false;
    if (searchParams.salesRepId && j.salesRepId !== searchParams.salesRepId) return false;
    if (searchParams.productId && j.productId !== searchParams.productId) return false;
    if (archivedFilter === "yes" && !j.archived) return false;
    if (archivedFilter === "no" && j.archived) return false;
    if (searchParams.linkActive === "yes" && !isJourneyLinkActive(j)) return false;
    if (searchParams.linkActive === "no" && isJourneyLinkActive(j)) return false;
    if (searchParams.action === "ours" && ballInOurCourt(j) === 0) return false;
    if (searchParams.action === "customer" && pendingOnCustomer(j) === 0) return false;
    if (closeDateRange && (!j.outcomeSetAt || j.outcomeSetAt < closeDateRange.from || j.outcomeSetAt >= closeDateRange.to)) return false;
    if (createdDateRange && (j.createdAt < createdDateRange.from || j.createdAt >= createdDateRange.to)) return false;
    if (query) {
      const haystack = `${j.prospect.companyName} ${j.prospect.contactName} ${j.prospect.contactEmail}`.toLowerCase();
      if (!haystack.includes(query)) return false;
    }
    return true;
  });

  const hasActiveFilters = !!(
    searchParams.status ||
    searchParams.salesRepId ||
    searchParams.productId ||
    searchParams.q ||
    (searchParams.archived && searchParams.archived !== "no") ||
    searchParams.linkActive ||
    searchParams.action ||
    searchParams.closeDate ||
    searchParams.createdDate
  );

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Tüm presales journey'lerine buradan göz atabilirsin."
        action={
          <Link href="/presales/admin/prospects/new" className={buttonPrimaryClass}>
            <Plus size={15} className="mr-1.5" /> Yeni Prospect
          </Link>
        }
      />

      <div className="mb-8 grid grid-cols-5 gap-4">
        <Card className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-primary/10 text-brand-primary">
            <Users size={18} />
          </span>
          <div>
            <p className="text-xl font-semibold text-brand-dark">{activeCount}</p>
            <p className="text-xs text-text-muted">Aktif Süreç</p>
          </div>
        </Card>
        <Card className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
            <Clock size={18} />
          </span>
          <div>
            <p className="text-xl font-semibold text-brand-dark">{pendingSurveyCount}</p>
            <p className="text-xs text-text-muted">Müşteride Bekleyen</p>
          </div>
        </Card>
        <Card className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-magenta/10 text-brand-magenta">
            <Zap size={18} />
          </span>
          <div>
            <p className="text-xl font-semibold text-brand-dark">{ballInOurCourtCount}</p>
            <p className="text-xs text-text-muted">Aksiyon Bizde</p>
          </div>
        </Card>
        <Card className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
            <CheckCircle2 size={18} />
          </span>
          <div>
            <p className="text-xl font-semibold text-brand-dark">{wonCount}</p>
            <p className="text-xs text-text-muted">Kazanılan</p>
          </div>
        </Card>
        <Card className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 text-gray-500">
            <XCircle size={18} />
          </span>
          <div>
            <p className="text-xl font-semibold text-brand-dark">{lostCount}</p>
            <p className="text-xs text-text-muted">Kaybedilen</p>
          </div>
        </Card>
      </div>

      <Card className="mb-6">
        <form method="get" className="flex flex-wrap items-end gap-3">
          <div>
            <label className="mb-1 block text-xs text-text-muted">Ara</label>
            <input
              name="q"
              defaultValue={searchParams.q ?? ""}
              placeholder="Şirket, kişi veya e-posta"
              className={`${inputClass} w-64`}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-text-muted">Durum</label>
            <select name="status" defaultValue={searchParams.status ?? ""} className={`${inputClass} w-36`}>
              <option value="">Tümü</option>
              {JOURNEY_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {JOURNEY_STATUS_LABELS[s]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs text-text-muted">Satışçı</label>
            <select name="salesRepId" defaultValue={searchParams.salesRepId ?? ""} className={`${inputClass} w-48`}>
              <option value="">Tümü</option>
              {salesReps.map((rep) => (
                <option key={rep.id} value={rep.id}>
                  {rep.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs text-text-muted">Ürün / Uzmanlık</label>
            <select name="productId" defaultValue={searchParams.productId ?? ""} className={`${inputClass} w-48`}>
              <option value="">Tümü</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs text-text-muted">Arşiv</label>
            <select name="archived" defaultValue={archivedFilter} className={`${inputClass} w-40`}>
              <option value="no">Arşivlenmemiş</option>
              <option value="yes">Arşivlenmiş</option>
              <option value="all">Tümü (arşiv dahil)</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs text-text-muted">Müşteri Linki</label>
            <select name="linkActive" defaultValue={searchParams.linkActive ?? ""} className={`${inputClass} w-36`}>
              <option value="">Tümü</option>
              <option value="yes">Aktif</option>
              <option value="no">Pasif</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs text-text-muted">Aksiyon</label>
            <select name="action" defaultValue={searchParams.action ?? ""} className={`${inputClass} w-40`}>
              <option value="">Tümü</option>
              <option value="ours">Aksiyon Bizde</option>
              <option value="customer">Müşteride</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs text-text-muted">Kapanış Tarihi</label>
            <select name="closeDate" defaultValue={searchParams.closeDate ?? ""} className={`${inputClass} w-32`}>
              {DATE_RANGE_PRESETS.map((preset) => (
                <option key={preset.value} value={preset.value}>
                  {preset.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs text-text-muted">Oluşturma Tarihi</label>
            <select name="createdDate" defaultValue={searchParams.createdDate ?? ""} className={`${inputClass} w-32`}>
              {DATE_RANGE_PRESETS.map((preset) => (
                <option key={preset.value} value={preset.value}>
                  {preset.label}
                </option>
              ))}
            </select>
          </div>
          <button className={buttonPrimaryClass}>Filtrele</button>
          {hasActiveFilters && (
            <Link href="/presales/admin" className={buttonSecondaryClass}>
              Temizle
            </Link>
          )}
          <span className="ml-auto self-center text-xs text-text-muted">
            {filteredJourneys.length} / {journeys.length} journey
          </span>
        </form>
      </Card>

      {journeys.length === 0 && (
        <Card className="text-center text-text-muted">
          Henüz bir journey yok.{" "}
          <Link href="/presales/admin/prospects/new" className="text-brand-primary underline">
            Yeni prospect ekle
          </Link>
          .
        </Card>
      )}

      {journeys.length > 0 && filteredJourneys.length === 0 && (
        <Card className="text-center text-text-muted">Filtrelere uyan journey bulunamadı.</Card>
      )}

      <JourneyListWithSelection
        journeys={filteredJourneys.map(
          (journey): JourneyRow => ({
            id: journey.id,
            name: journey.name,
            companyName: journey.prospect.companyName,
            contactName: journey.prospect.contactName,
            contactEmail: journey.prospect.contactEmail,
            status: journey.status,
            archived: journey.archived,
            linkActive: isJourneyLinkActive(journey),
            accessToken: journey.accessToken,
            salesRepName: journey.salesRep?.name ?? null,
            productName: journey.product?.name ?? null,
            createdAtLabel: formatDisplayDate(journey.createdAt),
            closeDateLabel: formatDisplayDate(journey.outcomeSetAt),
            currentStageName: findCurrentStage(journey.stages)?.name ?? null,
            pendingSurveys: pendingOnCustomer(journey),
            ourTurnSurveys: ballInOurCourt(journey),
          })
        )}
        salesReps={salesReps.map((rep) => ({ id: rep.id, name: rep.name }))}
      />
    </div>
  );
}
