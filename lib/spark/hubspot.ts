import type { SparkRecord } from "./types";

export type HubSpotObject = { id: string; properties: Record<string, string | undefined> };
export type HubSpotProperty = {
  name: string;
  label: string;
  type?: string;
  fieldType?: string;
  options?: Array<{ label: string; value: string; hidden?: boolean }>;
};
export type StageMap = Map<string, {
  label: string;
  probability: number;
  isClosed?: boolean;
  displayOrder: number;
  pipelineLabel: string;
}>;

const PORTAL_ID = "147286586";

function token() {
  const value = process.env.HUBSPOT_ACCESS_TOKEN;
  if (!value) throw new Error("HUBSPOT_ACCESS_TOKEN tanımlı değil");
  return value;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const response = await fetch(`https://api.hubapi.com${path}`, {
      ...init,
      headers: {
        Authorization: `Bearer ${token()}`,
        "Content-Type": "application/json",
        ...init?.headers,
      },
      cache: "no-store",
      signal: AbortSignal.timeout(20_000),
    });
    if (response.ok) return response.json() as Promise<T>;
    const retryable = response.status === 429 || response.status >= 500;
    if (!retryable || attempt === 2) throw new Error(`HubSpot ${path}: ${response.status}`);
    const retryAfter = Number(response.headers.get("retry-after"));
    const delay = Number.isFinite(retryAfter) && retryAfter > 0 ? retryAfter * 1_000 : 500 * 2 ** attempt;
    await new Promise((resolve) => setTimeout(resolve, Math.min(delay, 5_000)));
  }
  throw new Error(`HubSpot ${path}: istek tamamlanamadı`);
}

export async function fetchHubSpotObjects(objectType: string, properties: string[]) {
  const rows: HubSpotObject[] = [];
  let after: string | undefined;
  do {
    const params = new URLSearchParams({ limit: "100", properties: properties.join(",") });
    if (after) params.set("after", after);
    const page = await request<{ results: HubSpotObject[]; paging?: { next?: { after: string } } }>(
      `/crm/v3/objects/${objectType}?${params}`
    );
    rows.push(...page.results);
    after = page.paging?.next?.after;
  } while (after);
  return rows;
}

export async function fetchHubSpotObjectsByIds(objectType: string, ids: string[], properties: string[]) {
  const rows: HubSpotObject[] = [];
  const uniqueIds = Array.from(new Set(ids.filter(Boolean)));
  for (let index = 0; index < uniqueIds.length; index += 100) {
    const inputs = uniqueIds.slice(index, index + 100).map((id) => ({ id }));
    const result = await request<{ results: HubSpotObject[] }>(
      `/crm/v3/objects/${objectType}/batch/read`,
      { method: "POST", body: JSON.stringify({ properties, inputs }) },
    );
    rows.push(...result.results);
  }
  return rows;
}

export async function fetchHubSpotPropertyCatalog(objectType: string) {
  const result = await request<{ results: HubSpotProperty[] }>(
    `/crm/v3/properties/${objectType}?archived=false`,
  );
  return result.results;
}

export async function updateHubSpotObjectProperties(
  objectType: "deals" | "invoices" | "orders",
  id: string,
  properties: Record<string, string>,
) {
  return request<HubSpotObject>(
    `/crm/v3/objects/${objectType}/${encodeURIComponent(id)}`,
    { method: "PATCH", body: JSON.stringify({ properties }) },
  );
}

export async function fetchHubSpotStages(objectType: "deals" | "orders") {
  const result = await request<{ results: Array<{
    label: string;
    stages: Array<{
      id: string;
      label: string;
      displayOrder: number;
      metadata?: { probability?: string; isClosed?: string };
    }>;
  }> }>(
    `/crm/v3/pipelines/${objectType}`
  );
  const map: StageMap = new Map();
  for (const pipeline of result.results) {
    for (const stage of pipeline.stages) {
      map.set(stage.id, {
        label: stage.label,
        probability: Number(stage.metadata?.probability ?? 0),
        isClosed: stage.metadata?.isClosed == null ? undefined : stage.metadata.isClosed === "true",
        displayOrder: stage.displayOrder,
        pipelineLabel: pipeline.label,
      });
    }
  }
  return map;
}

export async function fetchHubSpotOwners() {
  const owners: Array<{ id: string; firstName?: string; lastName?: string; email?: string }> = [];
  let after: string | undefined;
  do {
    const params = new URLSearchParams({ limit: "500", archived: "false" });
    if (after) params.set("after", after);
    const result = await request<{
      results: Array<{ id: string; firstName?: string; lastName?: string; email?: string }>;
      paging?: { next?: { after: string } };
    }>(`/crm/v3/owners?${params}`);
    owners.push(...result.results);
    after = result.paging?.next?.after;
  } while (after);
  return new Map(owners.map((owner) => [owner.id, `${owner.firstName ?? ""} ${owner.lastName ?? ""}`.trim() || owner.email || owner.id]));
}

export async function fetchHubSpotAssociations(
  from: "deals" | "invoices" | "orders",
  ids: string[],
  to: "deals" | "companies" = "deals",
) {
  const map = new Map<string, string[]>();
  for (let index = 0; index < ids.length; index += 100) {
    const inputs = ids.slice(index, index + 100).map((id) => ({ id }));
    const result = await request<{ results: Array<{ from: { id: string }; to: Array<{ toObjectId: number }> }> }>(
      `/crm/v4/associations/${from}/${to}/batch/read`,
      { method: "POST", body: JSON.stringify({ inputs }) }
    );
    for (const row of result.results) map.set(row.from.id, row.to.map((item) => String(item.toObjectId)));
  }
  return map;
}

const amount = (row: HubSpotObject, property: string) => Number(row.properties[property] ?? 0) || 0;
const lower = (value?: string) => (value ?? "").trim().toLowerCase();

export function hubspotDealState(row: HubSpotObject, stages: StageMap): "open" | "won" | "lost" {
  const stage = stages.get(row.properties.dealstage || "");
  const won = row.properties.hs_is_closed_won === "true" || (stage?.isClosed === true && stage.probability === 1);
  if (won) return "won";
  const closed = row.properties.hs_is_closed === "true" || stage?.isClosed === true;
  return closed ? "lost" : "open";
}

export function isHubSpotOpenOrder(row: HubSpotObject, stages: StageMap) {
  const stage = stages.get(row.properties.hs_pipeline_stage || "");
  return stage?.isClosed === false || (stage?.isClosed == null && lower(stage?.label) === "open");
}

export function isIncludedInvoice(row: HubSpotObject) {
  return lower(row.properties.status) !== "cancelled";
}

export function validateInvoiceStatusProperty(catalog: HubSpotProperty[]) {
  const property = catalog.find((item) => item.name === "status");
  const values = new Set(property?.options?.map((option) => lower(option.value)) ?? []);
  if (!property || !values.has("invoiced") || !values.has("cancelled")) {
    throw new Error("HubSpot invoice custom status sözleşmesi bulunamadı (status: invoiced/cancelled)");
  }
  return property;
}

export async function fetchHubSpotData() {
  const [deals, invoices, orders, dealStages, orderStages, ownerMap, invoiceCatalog] = await Promise.all([
    fetchHubSpotObjects("deals", ["dealname", "dealstage", "createdate", "closedate", "amount_in_home_currency", "hs_projected_amount_in_home_currency", "hs_is_closed", "hs_is_closed_won", "dealtype", "country", "vendor_name", "revenue_type", "ereteam_domain", "hubspot_owner_id"]),
    fetchHubSpotObjects("invoices", ["hs_number", "invoice_name", "hs_invoice_latest_company_name", "hs_invoice_date", "hs_amount_billed_in_company_currency", "status", "country", "vendor_name", "revenue_type", "ereteam_domain", "hubspot_owner_id"]),
    fetchHubSpotObjects("orders", ["hs_order_name", "hs_pipeline_stage", "hs_processed_date", "hs_homecurrency_amount", "country", "vendor_name", "revenue_type", "ereteam_domain", "hubspot_owner_id"]),
    fetchHubSpotStages("deals"),
    fetchHubSpotStages("orders"),
    fetchHubSpotOwners(),
    fetchHubSpotPropertyCatalog("invoices"),
  ]);
  validateInvoiceStatusProperty(invoiceCatalog);
  const [invoiceDeals, orderDeals] = await Promise.all([
    fetchHubSpotAssociations("invoices", invoices.map((row) => row.id)),
    fetchHubSpotAssociations("orders", orders.map((row) => row.id)),
  ]);
  return { deals, invoices, orders, dealStages, orderStages, ownerMap, invoiceDeals, orderDeals };
}

export function dealRecord(
  row: HubSpotObject,
  ownerMap: Map<string, string>,
  options: { dateProperty?: "createdate" | "closedate"; stage?: string; now?: Date; issues?: string[] } = {},
): SparkRecord {
  const createdAt = new Date(row.properties.createdate || "").getTime();
  const ageDays = Number.isFinite(createdAt) && options.now
    ? Math.max(0, Math.floor((options.now.getTime() - createdAt) / 86_400_000))
    : undefined;
  return {
    id: row.id,
    objectType: "Deal",
    name: row.properties.dealname || `Deal ${row.id}`,
    date: options.dateProperty
      ? row.properties[options.dateProperty]
      : row.properties.closedate || row.properties.createdate,
    amount: amount(row, "amount_in_home_currency"),
    owner: ownerMap.get(row.properties.hubspot_owner_id || ""),
    stage: options.stage,
    weightedAmount: amount(row, "hs_projected_amount_in_home_currency"),
    ageDays,
    issues: options.issues,
    url: `https://app.hubspot.com/contacts/${PORTAL_ID}/record/0-3/${row.id}?utm_source=spark_dashboard&utm_medium=web&utm_campaign=revenue_growth`,
  };
}

export function invoiceRecord(row: HubSpotObject, ownerMap: Map<string, string>): SparkRecord {
  return {
    id: row.id,
    objectType: "Invoice",
    name: [row.properties.hs_number, row.properties.invoice_name].filter(Boolean).join(" · ") || `Invoice ${row.id}`,
    date: row.properties.hs_invoice_date,
    amount: amount(row, "hs_amount_billed_in_company_currency"),
    owner: ownerMap.get(row.properties.hubspot_owner_id || ""),
    company: row.properties.hs_invoice_latest_company_name,
    url: `https://app.hubspot.com/contacts/${PORTAL_ID}/objects/0-53?filters=%5B%7B%22property%22%3A%22hs_object_id%22%2C%22operator%22%3A%22EQ%22%2C%22value%22%3A%22${row.id}%22%7D%5D&utm_source=spark_dashboard&utm_medium=web&utm_campaign=revenue_growth`,
  };
}

export function orderRecord(row: HubSpotObject, ownerMap: Map<string, string>): SparkRecord {
  return {
    id: row.id,
    objectType: "Order",
    name: row.properties.hs_order_name || `Order ${row.id}`,
    date: row.properties.hs_processed_date,
    amount: amount(row, "hs_homecurrency_amount"),
    owner: ownerMap.get(row.properties.hubspot_owner_id || ""),
    url: `https://app.hubspot.com/contacts/${PORTAL_ID}/record/0-123/${row.id}?utm_source=spark_dashboard&utm_medium=web&utm_campaign=revenue_growth`,
  };
}

export const hubspotHelpers = { amount, lower };
