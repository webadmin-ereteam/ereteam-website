import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { collectSparkData } from "@/lib/spark/collector";
import type { fetchHubSpotData, HubSpotObject, StageMap } from "@/lib/spark/hubspot";

const row = (id: string, properties: Record<string, string>): HubSpotObject => ({ id, properties });
const stages: StageMap = new Map([
  ["open", { label: "Aktif", probability: .2, isClosed: false, displayOrder: 0, pipelineLabel: "Sales" }],
  ["won", { label: "Kazanıldı", probability: 1, isClosed: true, displayOrder: 1, pipelineLabel: "Sales" }],
  ["lost", { label: "Kaybedildi", probability: 0, isClosed: true, displayOrder: 2, pipelineLabel: "Sales" }],
  ["cancel", { label: "Cancelled", probability: 0, isClosed: false, displayOrder: 3, pipelineLabel: "Orders" }],
]);
const now = new Date("2026-11-12T12:00:00Z");
function fixture(): Awaited<ReturnType<typeof fetchHubSpotData>> {
  return {
    deals: [row("d1", { dealstage: "open", closedate: "2026-12-31", createdate: "2026-11-10", amount_in_home_currency: "100", hs_projected_amount_in_home_currency: "37", dealtype: "newbusiness" }), row("won", { dealstage: "won", closedate: "2026-11-10", amount_in_home_currency: "999", dealtype: "newbusiness" }), row("carry", { dealstage: "won", closedate: "2025-11-10", dealtype: "newbusiness" }), row("lost", { dealstage: "lost", closedate: "2026-11-10", amount_in_home_currency: "999", dealtype: "newbusiness" }), row("missing", { dealstage: "open", amount_in_home_currency: "999" }), row("next", { dealstage: "open", closedate: "2026-12-31T21:00:00Z", amount_in_home_currency: "500", hs_projected_amount_in_home_currency: "50" })],
    invoices: [row("i1", { hs_invoice_date: "2026-11-01", hs_amount_billed_in_company_currency: "100", status: "Invoiced", hs_invoice_status: "paid", revenue_type: "License;Project" }), row("i2", { hs_invoice_date: "2026-11-02", hs_amount_billed_in_company_currency: "-10", hs_invoice_status: "open" }), row("cancelled", { hs_invoice_date: "2026-11-01", hs_amount_billed_in_company_currency: "999", status: "Cancelled" }), row("next-invoice", { hs_invoice_date: "2026-12-31T21:00:00Z", hs_amount_billed_in_company_currency: "500" })],
    orders: [row("o1", { hs_pipeline_stage: "open", hs_processed_date: "2026-12-01", hs_homecurrency_amount: "50" }), row("closed", { hs_pipeline_stage: "won", hs_processed_date: "2026-11-01", hs_homecurrency_amount: "999" }), row("cancelled", { hs_pipeline_stage: "cancel", hs_processed_date: "2026-11-01", hs_homecurrency_amount: "999" })],
    dealStages: stages, orderStages: stages, ownerMap: new Map(), invoiceDeals: new Map([["i1", ["won"]], ["i2", ["carry"]]]), orderDeals: new Map([["o1", ["won"]]]), invoiceCancelledValue: "Cancelled",
  };
}
beforeEach(() => { vi.stubEnv("SPARK_LICENSE_TARGET_2026", "100"); vi.stubEnv("SPARK_SERVICE_TARGET_2026", "100"); });
afterEach(() => vi.unstubAllEnvs());

it("reconciles headline, monthly, funnel and single-valued breakdown populations", async () => {
  const { data } = await collectSparkData(now, { hubspot: fixture() });
  expect([data.ytdInvoice, data.openOrders, data.pipeline, data.yearWeightedPipeline, data.activeDeals, data.target]).toEqual([90, 50, 100, 37, 1, 200]);
  expect(data.monthlyPerformance.flatMap(m => m.invoices).map(r => r.id).sort()).toEqual(["i1", "i2"]);
  expect(data.monthlyPerformance.flatMap(m => m.orders).map(r => r.id)).toEqual(["o1"]);
  expect(data.stageFunnel.flatMap(s => s.records).map(r => r.id)).toEqual(["d1"]);
  expect(data.revenueBreakdowns.find(b => b.key === "country")?.entries[0].label).toBe("Belirtilmemiş");
  expect(data.revenueBreakdowns.find(b => b.key === "revenueType")?.entries.find(e => e.key === "License")?.invoices.map(r => r.id)).toEqual(["i1"]);
  expect(data.revenueBreakdowns.find(b => b.key === "revenueType")?.entries.find(e => e.key === "Project")?.invoices.map(r => r.id)).toEqual(["i1"]);
});

it("keeps Paid hygiene separate from financial inclusion and retains carry-over New Business", async () => {
  const { data } = await collectSparkData(now, { hubspot: fixture() });
  expect(data.hygiene.find(g => g.key === "invoice-status-not-paid")?.records.map(r => r.id)).toEqual(["i2"]);
  expect(data.newBusiness.invoices.map(r => [r.id, r.carryover])).toEqual([["i1", false], ["i2", true]]);
  expect(data.newBusiness.sameYearInvoices.map(r => r.id)).toEqual(["i1"]);
  expect(data.weeklyNewDeals.map(r => r.id)).toEqual(["d1"]);
  expect(data.weeklyWon.map(r => r.id)).toEqual(["won"]);
  expect(data.weeklyLost.map(r => r.id)).toEqual(["lost"]);
  expect(data.hygiene.find(g => g.key === "noCloseDate")?.records.map(r => r.id)).toEqual(["missing"]);
});

it("excludes negative adjustment amounts from missing-amount issues while retaining their value", async () => {
  const hubspot = fixture();
  hubspot.deals.push(row("negative", { dealstage: "open", closedate: "2026-11-11", amount_in_home_currency: "-5", hs_projected_amount_in_home_currency: "-2" }));
  const { data } = await collectSparkData(now, { hubspot });
  expect(data.pipeline).toBe(95);
  expect(data.hygiene.find(g => g.key === "noAmount")?.records).toEqual([]);
});

it("fails loudly on a malformed financial source", async () => {
  const hubspot = fixture(); hubspot.invoices[0].properties.hs_amount_billed_in_company_currency = "1,000";
  await expect(collectSparkData(now, { hubspot })).rejects.toThrow(/geçerli bir tutar/);
});

it("scopes next-year planning to Istanbul boundaries and surfaces missing targets", async () => {
  vi.stubEnv("SPARK_LICENSE_TARGET_2027", ""); vi.stubEnv("SPARK_SERVICE_TARGET_2027", "");
  const { data, sourceState } = await collectSparkData(now, { reportYear: 2027, hubspot: fixture() });
  expect([data.ytdInvoice, data.pipeline, data.yearWeightedPipeline, data.activeDeals]).toEqual([500, 500, 50, 1]);
  expect(sourceState.hubspot.ok).toBe(true); expect(sourceState.budget.ok).toBe(false); expect(data.target).toBe(0);
});
