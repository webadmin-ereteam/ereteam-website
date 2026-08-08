import { fetchAnnualTarget } from "./budget";
import { fetchAmplemarket } from "./amplemarket";
import {
  dealRecord,
  fetchHubSpotData,
  hubspotHelpers,
  invoiceRecord,
  orderRecord,
  type HubSpotObject,
} from "./hubspot";
import { isBetween, isReportingMonth, isReportingYear, istanbulParts, reportDateKey, rollingPeriod } from "./time";
import type { SparkData, SparkRecord, SparkSourceState } from "./types";

const sum = (records: SparkRecord[]) => records.reduce((total, record) => total + record.amount, 0);

export async function collectSparkData(now = new Date()): Promise<{ data: SparkData; sourceState: SparkSourceState }> {
  const { start, end } = rollingPeriod(now);
  const { year, month } = istanbulParts(now);
  const sourceState: SparkSourceState = {
    hubspot: { ok: false },
    budget: { ok: false },
    amplemarket: { ok: false },
  };

  const hubspot = await fetchHubSpotData();
  sourceState.hubspot = { ok: true };
  const { deals, invoices, orders, dealStages, orderStages, ownerMap, invoiceDeals, orderDeals } = hubspot;
  const stageLabel = (deal: HubSpotObject) => dealStages.get(deal.properties.dealstage || "")?.label || deal.properties.dealstage || "";
  const isWon = (deal: HubSpotObject) => deal.properties.hs_is_closed_won === "true" || hubspotHelpers.lower(stageLabel(deal)).includes("won");
  const isLost = (deal: HubSpotObject) => hubspotHelpers.lower(stageLabel(deal)).includes("lost");
  const activeDeals = deals.filter((deal) => !isWon(deal) && !isLost(deal));
  const openOrders = orders.filter((order) => hubspotHelpers.lower(orderStages.get(order.properties.hs_pipeline_stage || "")?.label) === "open");

  const invoiceRows = invoices.filter((invoice) => isReportingYear(invoice.properties.hs_invoice_date, year)).map((row) => invoiceRecord(row, ownerMap));
  const orderRows = openOrders.filter((order) => isReportingYear(order.properties.hs_processed_date, year)).map((row) => orderRecord(row, ownerMap));
  const monthInvoices = invoiceRows.filter((row) => isReportingMonth(row.date, year, month));
  const monthOrders = orderRows.filter((row) => isReportingMonth(row.date, year, month));
  const weeklyNewDeals = activeDeals.filter((deal) => isBetween(deal.properties.createdate, start, end)).map((row) => dealRecord(row, ownerMap));
  const weeklyWon = deals.filter((deal) => isWon(deal) && isBetween(deal.properties.closedate, start, end)).map((row) => dealRecord(row, ownerMap));
  const weeklyLost = deals.filter((deal) => isLost(deal) && isBetween(deal.properties.closedate, start, end)).map((row) => dealRecord(row, ownerMap));

  const newBusinessDeals = deals.filter((deal) => isWon(deal) && hubspotHelpers.lower(deal.properties.dealtype) === "newbusiness");
  const newBusinessIds = new Set(newBusinessDeals.map((deal) => deal.id));
  const sameYearNewBusiness = newBusinessDeals.filter((deal) => isReportingYear(deal.properties.closedate, year));
  const sameYearIds = new Set(sameYearNewBusiness.map((deal) => deal.id));
  const linkedTo = (associationMap: Map<string, string[]>, recordId: string, dealIds: Set<string>) =>
    (associationMap.get(recordId) ?? []).some((dealId) => dealIds.has(dealId));

  const nbInvoices = invoices
    .filter((row) => isReportingYear(row.properties.hs_invoice_date, year) && linkedTo(invoiceDeals, row.id, newBusinessIds))
    .map((row) => {
      const record = invoiceRecord(row, ownerMap);
      record.carryover = !linkedTo(invoiceDeals, row.id, sameYearIds);
      return record;
    });
  const nbOrders = openOrders
    .filter((row) => isReportingYear(row.properties.hs_processed_date, year) && linkedTo(orderDeals, row.id, newBusinessIds))
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

  let leadGeneration: SparkData["leadGeneration"] = { sent: null, bulk: null, duo: null, replies: null, positive: null, owners: [], meetings: [] };
  try {
    leadGeneration = await fetchAmplemarket(start, end);
    sourceState.amplemarket = { ok: true };
  } catch (error) {
    sourceState.amplemarket = { ok: false, message: error instanceof Error ? error.message : "Amplemarket okunamadı" };
  }

  const monthlyInvoiceTrend = Array.from({ length: month }, (_, index) => ({
    month: new Intl.DateTimeFormat("tr-TR", { month: "short", timeZone: "Europe/Istanbul" }).format(new Date(Date.UTC(year, index, 1))),
    amount: invoiceRows.filter((row) => isReportingMonth(row.date, year, index + 1)).reduce((total, row) => total + row.amount, 0),
  }));

  const data: SparkData = {
    generatedAt: now.toISOString(), reportDate: reportDateKey(now), periodStart: start.toISOString(), periodEnd: end.toISOString(),
    target,
    ytdInvoice: sum(invoiceRows), monthInvoice: sum(monthInvoices), openOrders: sum(orderRows), monthExpected: sum(monthOrders),
    pipeline: activeDeals.reduce((total, deal) => total + hubspotHelpers.amount(deal, "amount_in_home_currency"), 0),
    weightedForecast: activeDeals.reduce((total, deal) => {
      const value = hubspotHelpers.amount(deal, "amount_in_home_currency");
      const probability = Number(deal.properties.hs_deal_stage_probability ?? dealStages.get(deal.properties.dealstage || "")?.probability ?? 0);
      return total + value * (probability > 1 ? probability / 100 : probability);
    }, 0),
    activeDeals: activeDeals.length,
    weeklyNewPipeline: sum(weeklyNewDeals), weeklyNewDeals, weeklyWon, weeklyLost,
    monthInvoices, monthOrders, monthlyInvoiceTrend,
    newBusiness: {
      invoices: nbInvoices,
      orders: nbOrders,
      sameYearDeals: sameYearNewBusiness.map((row) => dealRecord(row, ownerMap)),
      sameYearInvoices: nbInvoices.filter((row) => !row.carryover),
      sameYearOrders: nbOrders.filter((row) => !row.carryover),
    },
    leadGeneration,
  };
  return { data, sourceState };
}
