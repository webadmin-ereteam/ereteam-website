import Link from "next/link";
import { Users, Clock, CheckCircle2, XCircle, Zap, Plus, Search } from "lucide-react";
import { prisma } from "@/lib/presales/db";
import { findCurrentStage } from "@/lib/presales/stageProgress";
import { isJourneyLinkActive } from "@/lib/presales/journeyLink";
import { JOURNEY_STATUSES, JOURNEY_STATUS_LABELS } from "@/lib/presales/journeyStatus";
import { DATE_RANGE_PRESETS, resolveDateRangePreset } from "@/lib/presales/dateRangePresets";
import { formatDisplayDate, formatDisplayDateTime } from "@/lib/presales/formatDate";
import { Card, PageHeader, buttonPrimaryClass, buttonSecondaryClass } from "../_components/ui";
import { JourneyListWithSelection, type JourneyRow } from "./JourneyListWithSelection";

// Notion/Airtable-style filter chip: "Label: value" fused into one soft,
// pill-shaped control — the label lives *inside* the chip instead of beside
// it, so each filter reads as one deliberate object rather than a plain
// label+input pair. `focus-within` lights the whole chip up (not just the
// invisible select inside it) so keyboard/click focus is still legible.
const filterSelectClass = "cursor-pointer border-0 bg-transparent p-0 text-[13px] font-medium text-text-body focus:outline-none";

function FilterChip({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="inline-flex items-center gap-1.5 rounded-full bg-gray-100/80 py-[7px] pl-3.5 pr-3 text-[13px] leading-none transition-colors hover:bg-gray-100 focus-within:bg-white focus-within:ring-2 focus-within:ring-brand-primary/20">
      <span className="font-medium tracking-tight text-text-muted">{label}</span>
      {children}
    </label>
  );
}

function StatCard({
  icon: Icon,
  value,
  label,
  tint,
}: {
  icon: typeof Users;
  value: number;
  label: string;
  tint: string;
}) {
  return (
    <Card className="flex items-center gap-3">
      <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${tint}`}>
        <Icon size={18} />
      </span>
      <div>
        <p className="text-xl font-semibold text-brand-dark">{value}</p>
        <p className="text-xs text-text-muted">{label}</p>
      </div>
    </Card>
  );
}

export default async function AdminDashboardPage({
  searchParams,
}: {
  searchParams: {
    status?: string;
    salesRepId?: string;
    technicalLeadId?: string;
    productId?: string;
    q?: string;
    archived?: string;
    linkActive?: string;
    action?: string;
    closeDate?: string;
    createdDate?: string;
  };
}) {
  const [journeys, salesReps, technicalLeads, products] = await Promise.all([
    prisma.journey.findMany({
      include: {
        prospect: true,
        salesRep: true,
        technicalLead: true,
        product: true,
        stages: { orderBy: { order: "asc" } },
        surveyInstances: { include: { stage: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.salesRep.findMany({ orderBy: { name: "asc" } }),
    prisma.technicalLead.findMany({ orderBy: { name: "asc" } }),
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
    if (searchParams.technicalLeadId && j.technicalLeadId !== searchParams.technicalLeadId) return false;
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
    searchParams.technicalLeadId ||
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
        title="Kontrol Paneli"
        description="Tüm presales journey'lerine buradan göz atabilirsin."
        action={
          <Link href="/presales/admin/prospects/new" className={buttonPrimaryClass}>
            <Plus size={15} className="mr-1.5" /> Yeni Prospect
          </Link>
        }
      />

      <div className="mb-8 grid grid-cols-5 gap-4">
        <StatCard icon={Users} value={activeCount} label="Aktif Süreç" tint="bg-brand-primary/10 text-brand-primary" />
        <StatCard icon={Clock} value={pendingSurveyCount} label="Müşteride Bekleyen" tint="bg-amber-100 text-amber-600" />
        <StatCard icon={Zap} value={ballInOurCourtCount} label="Aksiyon Bizde" tint="bg-brand-magenta/10 text-brand-magenta" />
        <StatCard icon={CheckCircle2} value={wonCount} label="Kazanılan" tint="bg-emerald-100 text-emerald-600" />
        <StatCard icon={XCircle} value={lostCount} label="Kaybedilen" tint="bg-gray-100 text-gray-500" />
      </div>

      <div className="mb-8 border-b border-gray-100 pb-6">
        <form method="get" className="flex flex-wrap items-center gap-2">
          <div className="relative mr-1">
            <Search size={13} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              name="q"
              defaultValue={searchParams.q ?? ""}
              placeholder="Şirket, kişi veya e-posta"
              className="w-56 rounded-full border border-gray-200 bg-white py-[7px] pl-8 pr-3.5 text-[13px] tracking-tight transition-colors focus:border-brand-primary focus:outline-none"
            />
          </div>

          <FilterChip label="Durum">
            <select name="status" defaultValue={searchParams.status ?? ""} className={filterSelectClass}>
              <option value="">Tümü</option>
              {JOURNEY_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {JOURNEY_STATUS_LABELS[s]}
                </option>
              ))}
            </select>
          </FilterChip>

          <FilterChip label="Satışçı">
            <select name="salesRepId" defaultValue={searchParams.salesRepId ?? ""} className={filterSelectClass}>
              <option value="">Tümü</option>
              {salesReps.map((rep) => (
                <option key={rep.id} value={rep.id}>
                  {rep.name}
                </option>
              ))}
            </select>
          </FilterChip>

          <FilterChip label="Teknik Sorumlu">
            <select name="technicalLeadId" defaultValue={searchParams.technicalLeadId ?? ""} className={filterSelectClass}>
              <option value="">Tümü</option>
              {technicalLeads.map((lead) => (
                <option key={lead.id} value={lead.id}>
                  {lead.name}
                </option>
              ))}
            </select>
          </FilterChip>

          <FilterChip label="Ürün">
            <select name="productId" defaultValue={searchParams.productId ?? ""} className={filterSelectClass}>
              <option value="">Tümü</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name}
                </option>
              ))}
            </select>
          </FilterChip>

          <FilterChip label="Arşiv">
            <select name="archived" defaultValue={archivedFilter} className={filterSelectClass}>
              <option value="no">Arşivlenmemiş</option>
              <option value="yes">Arşivlenmiş</option>
              <option value="all">Tümü</option>
            </select>
          </FilterChip>

          <FilterChip label="Müşteri Linki">
            <select name="linkActive" defaultValue={searchParams.linkActive ?? ""} className={filterSelectClass}>
              <option value="">Tümü</option>
              <option value="yes">Aktif</option>
              <option value="no">Pasif</option>
            </select>
          </FilterChip>

          <FilterChip label="Aksiyon">
            <select name="action" defaultValue={searchParams.action ?? ""} className={filterSelectClass}>
              <option value="">Tümü</option>
              <option value="ours">Bizde</option>
              <option value="customer">Müşteride</option>
            </select>
          </FilterChip>

          <FilterChip label="Kapanış">
            <select name="closeDate" defaultValue={searchParams.closeDate ?? ""} className={filterSelectClass}>
              {DATE_RANGE_PRESETS.map((preset) => (
                <option key={preset.value} value={preset.value}>
                  {preset.label}
                </option>
              ))}
            </select>
          </FilterChip>

          <FilterChip label="Oluşturma">
            <select name="createdDate" defaultValue={searchParams.createdDate ?? ""} className={filterSelectClass}>
              {DATE_RANGE_PRESETS.map((preset) => (
                <option key={preset.value} value={preset.value}>
                  {preset.label}
                </option>
              ))}
            </select>
          </FilterChip>

          <button className={`${buttonPrimaryClass} ml-1`}>Filtrele</button>
          {hasActiveFilters && (
            <Link href="/presales/admin" className={buttonSecondaryClass}>
              Temizle
            </Link>
          )}
          <span className="ml-auto self-center text-[11px] font-medium uppercase tracking-wide text-text-muted/70">
            {filteredJourneys.length} / {journeys.length} journey
          </span>
        </form>
      </div>

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
            technicalLeadName: journey.technicalLead?.name ?? null,
            productName: journey.product?.name ?? null,
            createdAtLabel: formatDisplayDate(journey.createdAt),
            closeDateLabel: formatDisplayDate(journey.outcomeSetAt),
            currentStageName: findCurrentStage(journey.stages)?.name ?? null,
            viewCount: journey.viewCount,
            lastViewedLabel: journey.lastViewedAt ? formatDisplayDateTime(journey.lastViewedAt) : null,
            pendingSurveys: pendingOnCustomer(journey),
            ourTurnSurveys: ballInOurCourt(journey),
            proposalRequested: journey.proposalRequested,
          })
        )}
        salesReps={salesReps.map((rep) => ({ id: rep.id, name: rep.name }))}
      />
    </div>
  );
}
