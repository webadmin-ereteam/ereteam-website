import type { SparkRecord } from "./types";

export type HubSpotObject = { id: string; properties: Record<string, string | undefined> };
export type StageMap = Map<string, { label: string; probability: number }>;

const PORTAL_ID = "147286586";

function token() {
  const value = process.env.HUBSPOT_ACCESS_TOKEN;
  if (!value) throw new Error("HUBSPOT_ACCESS_TOKEN tanımlı değil");
  return value;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`https://api.hubapi.com${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token()}`,
      "Content-Type": "application/json",
      ...init?.headers,
    },
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`HubSpot ${path}: ${response.status}`);
  return response.json() as Promise<T>;
}

async function allObjects(objectType: string, properties: string[]) {
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

async function stages(objectType: "deals" | "orders") {
  const result = await request<{ results: Array<{ stages: Array<{ id: string; label: string; metadata?: { probability?: string } }> }> }>(
    `/crm/v3/pipelines/${objectType}`
  );
  const map: StageMap = new Map();
  for (const pipeline of result.results) {
    for (const stage of pipeline.stages) {
      map.set(stage.id, { label: stage.label, probability: Number(stage.metadata?.probability ?? 0) });
    }
  }
  return map;
}

async function owners() {
  const result = await request<{ results: Array<{ id: string; firstName?: string; lastName?: string; email?: string }> }>(
    "/crm/v3/owners?limit=500&archived=false"
  );
  return new Map(result.results.map((owner) => [owner.id, `${owner.firstName ?? ""} ${owner.lastName ?? ""}`.trim() || owner.email || owner.id]));
}

async function associations(from: "invoices" | "orders", ids: string[]) {
  const map = new Map<string, string[]>();
  for (let index = 0; index < ids.length; index += 100) {
    const inputs = ids.slice(index, index + 100).map((id) => ({ id }));
    const result = await request<{ results: Array<{ from: { id: string }; to: Array<{ toObjectId: number }> }> }>(
      `/crm/v4/associations/${from}/deals/batch/read`,
      { method: "POST", body: JSON.stringify({ inputs }) }
    );
    for (const row of result.results) map.set(row.from.id, row.to.map((item) => String(item.toObjectId)));
  }
  return map;
}

const amount = (row: HubSpotObject, property: string) => Number(row.properties[property] ?? 0) || 0;
const lower = (value?: string) => (value ?? "").trim().toLowerCase();

export async function fetchHubSpotData() {
  const [deals, invoices, orders, dealStages, orderStages, ownerMap] = await Promise.all([
    allObjects("deals", ["dealname", "dealstage", "createdate", "closedate", "amount_in_home_currency", "hs_deal_stage_probability", "hs_is_closed_won", "dealtype", "hubspot_owner_id"]),
    allObjects("invoices", ["hs_number", "invoice_name", "hs_invoice_latest_company_name", "hs_invoice_date", "hs_amount_billed_in_company_currency", "hubspot_owner_id"]),
    allObjects("orders", ["hs_order_name", "hs_pipeline_stage", "hs_processed_date", "hs_homecurrency_amount", "hubspot_owner_id"]),
    stages("deals"),
    stages("orders"),
    owners(),
  ]);
  const [invoiceDeals, orderDeals] = await Promise.all([
    associations("invoices", invoices.map((row) => row.id)),
    associations("orders", orders.map((row) => row.id)),
  ]);
  return { deals, invoices, orders, dealStages, orderStages, ownerMap, invoiceDeals, orderDeals };
}

export function dealRecord(row: HubSpotObject, ownerMap: Map<string, string>): SparkRecord {
  return {
    id: row.id,
    name: row.properties.dealname || `Deal ${row.id}`,
    date: row.properties.closedate || row.properties.createdate,
    amount: amount(row, "amount_in_home_currency"),
    owner: ownerMap.get(row.properties.hubspot_owner_id || ""),
    url: `https://app.hubspot.com/contacts/${PORTAL_ID}/record/0-3/${row.id}?utm_source=spark_dashboard&utm_medium=web&utm_campaign=revenue_growth`,
  };
}

export function invoiceRecord(row: HubSpotObject, ownerMap: Map<string, string>): SparkRecord {
  return {
    id: row.id,
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
    name: row.properties.hs_order_name || `Order ${row.id}`,
    date: row.properties.hs_processed_date,
    amount: amount(row, "hs_homecurrency_amount"),
    owner: ownerMap.get(row.properties.hubspot_owner_id || ""),
    url: `https://app.hubspot.com/contacts/${PORTAL_ID}/record/0-123/${row.id}?utm_source=spark_dashboard&utm_medium=web&utm_campaign=revenue_growth`,
  };
}

export const hubspotHelpers = { amount, lower };
