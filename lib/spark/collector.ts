import { fetchAnnualTarget } from "./budget";
import {
  dealRecord,
  fetchHubSpotData,
  hubspotDealState,
  hubspotHelpers,
  invoiceRecord,
  isHubSpotOpenOrder,
  isIncludedInvoice,
  orderRecord,
  type HubSpotObject,
} from "./hubspot";
import { isBetween, isReportingMonth, isReportingYear, istanbulParts, reportDateKey, rollingPeriod } from "./time";
import type { SparkBreakdown, SparkData, SparkRecord, SparkSourceState } from "./types";

const sum = (records: SparkRecord[]) => records.reduce((total, record) => total + record.amount, 0);

function values(value: string | undefined, multiValue: boolean) {
  const result = multiValue
    ? (value ?? "").split(";").map((item) => item.trim()).filter(Boolean)
    : [value?.trim()].filter((item): item is string => Boolean(item));
  return result.length ? result : ["Belirtilmemiş"];
}

export async function collectSparkData(now = new Date()): Promise<{ data: SparkData; sourceState: SparkSourceState }> {
  const { start, end } = rollingPeriod(now);
  const { year, month } = istanbulParts(now);
  const sourceState: SparkSourceState = {
    hubspot: { ok: false },
    budget: { ok: false },
  };

  const hubspot = await fetchHubSpotData();
  sourceState.hubspot = { ok: true };
  const { deals, invoices, orders, dealStages, orderStages, ownerMap, invoiceDeals, orderDeals } = hubspot;
  const dealStage = (deal: HubSpotObject) => dealStages.get(deal.properties.dealstage || "");
  const isWon = (deal: HubSpotObject) => hubspotDealState(deal, dealStages) === "won";
  const isLost = (deal: HubSpotObject) => hubspotDealState(deal, dealStages) === "lost";
  const openDeals = deals.filter((deal) => hubspotDealState(deal, dealStages) === "open");
  const yearOpenDeals = openDeals.filter((deal) => isReportingYear(deal.properties.closedate, year));
  const yearOpenOrders = orders.filter((order) =>
    isHubSpotOpenOrder(order, orderStages) && isReportingYear(order.properties.hs_processed_date, year));
  const yearInvoices = invoices.filter((invoice) =>
    isIncludedInvoice(invoice) && isReportingYear(invoice.properties.hs_invoice_date, year));
  const stageLabel = (deal: HubSpotObject) => dealStage(deal)?.label || "Tanımsız stage";
  const toDealRecord = (
    deal: HubSpotObject,
    options: { dateProperty?: "createdate" | "closedate"; issues?: string[] } = {},
  ) => dealRecord(deal, ownerMap, { ...options, stage: stageLabel(deal), now });

  const invoiceRows = yearInvoices.map((row) => invoiceRecord(row, ownerMap));
  const orderRows = yearOpenOrders.map((row) => orderRecord(row, ownerMap));
  const monthInvoices = invoiceRows.filter((row) => isReportingMonth(row.date, year, month));
  const monthOrders = orderRows.filter((row) => isReportingMonth(row.date, year, month));
  const weeklyNewDeals = yearOpenDeals
    .filter((deal) => isBetween(deal.properties.createdate, start, end))
    .map((row) => toDealRecord(row, { dateProperty: "createdate" }));
  const weeklyWon = deals
    .filter((deal) => isWon(deal) && isReportingYear(deal.properties.closedate, year) && isBetween(deal.properties.closedate, start, end))
    .map((row) => toDealRecord(row, { dateProperty: "closedate" }));
  const weeklyLost = deals
    .filter((deal) => isLost(deal) && isReportingYear(deal.properties.closedate, year) && isBetween(deal.properties.closedate, start, end))
    .map((row) => toDealRecord(row, { dateProperty: "closedate" }));
  const currentMonthOpenDeals = yearOpenDeals
    .filter((deal) => isReportingMonth(deal.properties.closedate, year, month))
    .map((row) => toDealRecord(row, { dateProperty: "closedate" }))
    .sort((left, right) => new Date(left.date || 0).getTime() - new Date(right.date || 0).getTime());
  const weightedAmount = (deal: HubSpotObject) => hubspotHelpers.amount(deal, "hs_projected_amount_in_home_currency");

  const newBusinessDeals = deals.filter((deal) => isWon(deal) && hubspotHelpers.lower(deal.properties.dealtype) === "newbusiness");
  const newBusinessIds = new Set(newBusinessDeals.map((deal) => deal.id));
  const sameYearNewBusiness = newBusinessDeals.filter((deal) => isReportingYear(deal.properties.closedate, year));
  const sameYearIds = new Set(sameYearNewBusiness.map((deal) => deal.id));
  const linkedTo = (associationMap: Map<string, string[]>, recordId: string, dealIds: Set<string>) =>
    (associationMap.get(recordId) ?? []).some((dealId) => dealIds.has(dealId));

  const nbInvoices = yearInvoices
    .filter((row) => linkedTo(invoiceDeals, row.id, newBusinessIds))
    .map((row) => {
      const record = invoiceRecord(row, ownerMap);
      record.carryover = !linkedTo(invoiceDeals, row.id, sameYearIds);
      return record;
    });
  const nbOrders = yearOpenOrders
    .filter((row) => linkedTo(orderDeals, row.id, newBusinessIds))
    .map((row) => {
      const record = orderRecord(row, ownerMap);
      record.carryover = !linkedTo(orderDeals, row.id, sameYearIds);
      return record;
    });

  let target = 0;
  try {
    target = await fetchAnnualTarget(year);
    sourceState.budget = { ok: true };
  } catch (error) {
    sourceState.budget = { ok: false, message: error instanceof Error ? error.message : "Hedef okunamadı" };
  }

  const monthLabel = (index: number) => new Intl.DateTimeFormat("tr-TR", {
    month: "short",
    timeZone: "Europe/Istanbul",
  }).format(new Date(Date.UTC(year, index, 1)));
  const monthlyPerformance = Array.from({ length: 12 }, (_, index) => {
    const reportMonth = index + 1;
    const monthDeals = yearOpenDeals
      .filter((deal) => isReportingMonth(deal.properties.closedate, year, reportMonth))
      .map((deal) => toDealRecord(deal, { dateProperty: "closedate" }));
    return {
      month: reportMonth,
      label: monthLabel(index),
      invoices: invoiceRows.filter((row) => isReportingMonth(row.date, year, reportMonth)),
      orders: orderRows.filter((row) => isReportingMonth(row.date, year, reportMonth)),
      deals: monthDeals,
      weightedPipeline: monthDeals.reduce((total, deal) => total + (deal.weightedAmount ?? 0), 0),
    };
  });
  const monthlyInvoiceTrend = monthlyPerformance.map((item) => ({
    month: item.label,
    amount: sum(item.invoices),
  }));

  const stageFunnel = Array.from(new Set(yearOpenDeals.map((deal) => deal.properties.dealstage || "unknown")))
    .map((stageId) => {
      const stage = dealStages.get(stageId);
      const stageDeals = yearOpenDeals.filter((deal) => (deal.properties.dealstage || "unknown") === stageId);
      const records = stageDeals.map((deal) => toDealRecord(deal, { dateProperty: "closedate" }));
      return {
        id: stageId,
        label: stage?.label || "Tanımsız stage",
        probability: stage?.probability ?? 0,
        records,
        weightedPipeline: stageDeals.reduce((total, deal) => total + weightedAmount(deal), 0),
        averageAgeDays: records.length
          ? records.reduce((total, record) => total + (record.ageDays ?? 0), 0) / records.length
          : 0,
        order: stage?.displayOrder ?? Number.MAX_SAFE_INTEGER,
      };
    })
    .sort((left, right) => left.order - right.order)
    .map((stage) => ({
      id: stage.id,
      label: stage.label,
      probability: stage.probability,
      records: stage.records,
      weightedPipeline: stage.weightedPipeline,
      averageAgeDays: stage.averageAgeDays,
    }));

  const dimensions: Array<{
    key: SparkBreakdown["key"];
    label: string;
    property: "country" | "vendor_name" | "revenue_type" | "ereteam_domain";
    multiValue: boolean;
  }> = [
    { key: "country", label: "Ülke", property: "country", multiValue: false },
    { key: "vendor", label: "Vendor", property: "vendor_name", multiValue: true },
    { key: "revenueType", label: "Revenue Type", property: "revenue_type", multiValue: true },
    { key: "domain", label: "Ereteam Domain", property: "ereteam_domain", multiValue: false },
  ];
  const revenueBreakdowns = dimensions.map((dimension): SparkBreakdown => {
    const categoryNames = new Set<string>();
    for (const row of [
      ...yearInvoices,
      ...yearOpenOrders,
      ...yearOpenDeals,
    ]) {
      values(row.properties[dimension.property], dimension.multiValue).forEach((value) => categoryNames.add(value));
    }
    const entries = Array.from(categoryNames).map((category) => {
      const matches = (row: HubSpotObject) => values(row.properties[dimension.property], dimension.multiValue).includes(category);
      const matchingInvoices = yearInvoices.filter(matches);
      const matchingOrders = yearOpenOrders.filter(matches);
      const matchingDeals = yearOpenDeals.filter(matches);
      return {
        key: category,
        label: category,
        invoices: matchingInvoices.map((row) => invoiceRecord(row, ownerMap)),
        orders: matchingOrders.map((row) => orderRecord(row, ownerMap)),
        deals: matchingDeals.map((row) => toDealRecord(row, { dateProperty: "closedate" })),
        weightedPipeline: matchingDeals.reduce((total, deal) => total + weightedAmount(deal), 0),
      };
    }).sort((left, right) =>
      (sum(right.invoices) + sum(right.orders) + sum(right.deals)) -
      (sum(left.invoices) + sum(left.orders) + sum(left.deals))
    );
    return { key: dimension.key, label: dimension.label, multiValue: dimension.multiValue, entries };
  });

  const todayStart = new Date(`${reportDateKey(now)}T00:00:00+03:00`).getTime();
  const overdueDeals = yearOpenDeals.filter((deal) => {
    const closeTime = new Date(deal.properties.closedate || "").getTime();
    return Number.isFinite(closeTime) && closeTime < todayStart;
  });
  const missingCloseDate = openDeals.filter((deal) => !deal.properties.closedate);
  const missingOwner = yearOpenDeals.filter((deal) => !deal.properties.hubspot_owner_id);
  const missingAmount = yearOpenDeals.filter((deal) => hubspotHelpers.amount(deal, "amount_in_home_currency") <= 0);
  const oldDeals = yearOpenDeals.filter((deal) => {
    const createdAt = new Date(deal.properties.createdate || "").getTime();
    return Number.isFinite(createdAt) && (now.getTime() - createdAt) / 86_400_000 >= 90;
  });
  const hygiene = [
    { key: "overdue", label: "Close date'i geçmiş", description: "Kapanış tarihi bugünden önce olan aktif fırsatlar", rows: overdueDeals },
    { key: "old", label: "90+ gündür açık", description: "En az 90 gündür açık olan fırsatlar", rows: oldDeals },
    { key: "noCloseDate", label: "Close date eksik", description: "Planlanan kapanış tarihi bulunmayan aktif fırsatlar", rows: missingCloseDate },
    { key: "noOwner", label: "Owner eksik", description: "Sorumlu atanmamış aktif fırsatlar", rows: missingOwner },
    { key: "noAmount", label: "Tutar eksik", description: "Tutarı boş veya sıfır olan aktif fırsatlar", rows: missingAmount },
  ].map((group) => ({
    key: group.key,
    label: group.label,
    description: group.description,
    records: group.rows.map((row) => toDealRecord(row, {
      dateProperty: "closedate",
      issues: [group.label],
    })),
  }));
  const unpaidInvoices = yearInvoices
    .filter((row) => row.properties.hs_invoice_status !== "paid")
    .map((row) => ({ ...invoiceRecord(row, ownerMap), issues: ["Invoice status Paid değil"] }));
  hygiene.push({
    key: "invoice-status-not-paid",
    label: "Invoice status Paid değil",
    description: `${year} invoice kayıtlarında Invoice status alanı Paid olmayan kayıtlar`,
    records: unpaidInvoices,
  });
  const breakdownFields = [
    ["country", "Ülke"],
    ["vendor_name", "Vendor"],
    ["revenue_type", "Revenue type"],
    ["ereteam_domain", "Ereteam domain"],
  ] as const;
  for (const [property, label] of breakdownFields) {
    const issue = `${label} eksik`;
    const invoiceIssues = yearInvoices
      .filter((row) => !row.properties[property]?.trim())
      .map((row) => ({ ...invoiceRecord(row, ownerMap), issues: [issue] }));
    const orderIssues = yearOpenOrders
      .filter((row) => !row.properties[property]?.trim())
      .map((row) => ({ ...orderRecord(row, ownerMap), issues: [issue] }));
    const dealIssues = yearOpenDeals
      .filter((row) => !row.properties[property]?.trim())
      .map((row) => toDealRecord(row, { dateProperty: "closedate", issues: [issue] }));
    hygiene.push({
      key: `missing-${property}`,
      label: issue,
      description: `${year} fatura, açık order ve aktif fırsat kayıtlarında eksik ${label.toLocaleLowerCase("tr-TR")} bilgisi`,
      records: [...invoiceIssues, ...orderIssues, ...dealIssues],
    });
  }

  const data: SparkData = {
    generatedAt: now.toISOString(), reportDate: reportDateKey(now), periodStart: start.toISOString(), periodEnd: end.toISOString(),
    target,
    ytdInvoice: sum(invoiceRows), monthInvoice: sum(monthInvoices), openOrders: sum(orderRows), monthExpected: sum(monthOrders),
    pipeline: yearOpenDeals.reduce((total, deal) => total + hubspotHelpers.amount(deal, "amount_in_home_currency"), 0),
    weightedForecast: yearOpenDeals.reduce((total, deal) => total + weightedAmount(deal), 0),
    yearWeightedPipeline: yearOpenDeals.reduce((total, deal) => total + weightedAmount(deal), 0),
    activeDeals: yearOpenDeals.length,
    weeklyNewPipeline: sum(weeklyNewDeals), weeklyNewDeals, weeklyWon, weeklyLost, currentMonthOpenDeals,
    monthInvoices, monthOrders, monthlyInvoiceTrend, monthlyPerformance, stageFunnel, revenueBreakdowns, hygiene,
    newBusiness: {
      invoices: nbInvoices,
      orders: nbOrders,
      sameYearDeals: sameYearNewBusiness.map((row) => toDealRecord(row, { dateProperty: "closedate" })),
      sameYearInvoices: nbInvoices.filter((row) => !row.carryover),
      sameYearOrders: nbOrders.filter((row) => !row.carryover),
    },
  };
  return { data, sourceState };
}
