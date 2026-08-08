import { z } from "zod";
import { getSparkData } from "./cache";
import {
  fetchHubSpotAssociations,
  fetchHubSpotObjects,
  fetchHubSpotOwners,
  fetchHubSpotPropertyCatalog,
  fetchHubSpotStages,
  type HubSpotObject,
  type HubSpotProperty,
} from "./hubspot";
import { generateChatResponse } from "@/lib/services/llmService";

type ObjectType = "deals" | "invoices" | "orders";
export class SparkChatStageError extends Error {
  constructor(public readonly stage: string, cause: unknown) {
    super(cause instanceof Error ? cause.message : String(cause));
    this.name = "SparkChatStageError";
  }
}

async function stage<T>(name: string, task: () => Promise<T>) {
  try {
    return await task();
  } catch (error) {
    throw new SparkChatStageError(name, error);
  }
}

const objectTypes: ObjectType[] = ["deals", "invoices", "orders"];
const planSchema = z.object({
  objects: z.array(z.enum(objectTypes)).min(1).max(3),
  properties: z.record(z.string(), z.array(z.string()).max(24)).default({}),
  needsAssociations: z.boolean().default(false),
});

const requiredProperties: Record<ObjectType, string[]> = {
  deals: ["dealname", "dealstage", "createdate", "closedate", "amount_in_home_currency", "hs_is_closed_won", "dealtype", "hubspot_owner_id"],
  invoices: ["hs_number", "invoice_name", "hs_invoice_latest_company_name", "hs_invoice_date", "hs_amount_billed_in_company_currency", "hubspot_owner_id"],
  orders: ["hs_order_name", "hs_pipeline_stage", "hs_processed_date", "hs_homecurrency_amount", "hubspot_owner_id"],
};

const objectLabel: Record<ObjectType, string> = {
  deals: "Deal",
  invoices: "Fatura",
  orders: "Order",
};

function parseJson(value: string) {
  const fenced = value.match(/```(?:json)?\s*([\s\S]*?)```/i)?.[1];
  const candidate = fenced || value.match(/\{[\s\S]*\}/)?.[0] || value;
  return JSON.parse(candidate);
}

function catalogText(catalogs: Record<ObjectType, HubSpotProperty[]>) {
  return objectTypes
    .map((type) => `${type}:\n${catalogs[type].map((property) => `${property.name} | ${property.label}`).join("\n")}`)
    .join("\n\n");
}

async function createPlan(question: string, catalogs: Record<ObjectType, HubSpotProperty[]>, apiKey: string) {
  const response = await generateChatResponse(
    `Sen bir HubSpot salt-okunur sorgu planlayıcısısın. Kullanıcının sorusunu cevaplamak için gerekli nesneleri ve property adlarını seç. Yalnızca JSON döndür. Şema: {"objects":["deals"|"invoices"|"orders"],"properties":{"deals":[],"invoices":[],"orders":[]},"needsAssociations":boolean}. Her nesne için en fazla 16 ilgili property seç. Bağlı fatura, order veya deal sorularında needsAssociations true olsun. Verilen property adları dışında ad uydurma.`,
    [{ role: "user", content: `SORU:\n${question}\n\nPROPERTY KATALOĞU:\n${catalogText(catalogs)}` }],
    apiKey,
    "",
    { model: "llama-3.3-70b-versatile", temperature: 0, maxTokens: 700 },
  );
  return planSchema.parse(parseJson(response));
}

function recordUrl(type: ObjectType, id: string) {
  const portal = "147286586";
  if (type === "deals") return `https://app.hubspot.com/contacts/${portal}/record/0-3/${id}`;
  if (type === "orders") return `https://app.hubspot.com/contacts/${portal}/record/0-123/${id}`;
  return `https://app.hubspot.com/contacts/${portal}/objects/0-53?filters=%5B%7B%22property%22%3A%22hs_object_id%22%2C%22operator%22%3A%22EQ%22%2C%22value%22%3A%22${id}%22%7D%5D`;
}

function inverseAssociation(map: Map<string, string[]>) {
  const inverse = new Map<string, string[]>();
  for (const [recordId, dealIds] of Array.from(map.entries())) {
    for (const dealId of dealIds) inverse.set(dealId, [...(inverse.get(dealId) ?? []), recordId]);
  }
  return inverse;
}

function enrichRows(
  type: ObjectType,
  rows: HubSpotObject[],
  ownerMap: Map<string, string>,
  stageMap?: Map<string, { label: string; probability: number }>,
) {
  return rows.map((row) => ({
    id: row.id,
    url: recordUrl(type, row.id),
    properties: {
      ...Object.fromEntries(Object.entries(row.properties).filter(([, value]) => value !== undefined && value !== "")),
      ...(row.properties.hubspot_owner_id ? { _owner_name: ownerMap.get(row.properties.hubspot_owner_id) } : {}),
      ...(stageMap && row.properties[type === "deals" ? "dealstage" : "hs_pipeline_stage"]
        ? { _stage_label: stageMap.get(row.properties[type === "deals" ? "dealstage" : "hs_pipeline_stage"] || "")?.label }
        : {}),
    },
  }));
}

export async function buildSparkChatContext(question: string, apiKey: string) {
  const snapshot = await stage("snapshot", () => getSparkData());
  const [dealCatalog, invoiceCatalog, orderCatalog] = await stage("catalog", () => Promise.all([
      fetchHubSpotPropertyCatalog("deals"),
      fetchHubSpotPropertyCatalog("invoices"),
      fetchHubSpotPropertyCatalog("orders"),
    ]));
  const catalogs: Record<ObjectType, HubSpotProperty[]> = {
    deals: dealCatalog,
    invoices: invoiceCatalog,
    orders: orderCatalog,
  };
  const plan = await stage("planner", () => createPlan(question, catalogs, apiKey));
  const selected = Object.fromEntries(plan.objects.map((type) => {
    const valid = new Set(catalogs[type].map((property) => property.name));
    const planned = (plan.properties[type] ?? []).filter((property) => valid.has(property));
    return [type, Array.from(new Set([...requiredProperties[type], ...planned]))];
  })) as Partial<Record<ObjectType, string[]>>;

  const [ownerMap, dealStages, orderStages, ...rowSets] = await stage("records", () => Promise.all([
    fetchHubSpotOwners(),
    fetchHubSpotStages("deals"),
    fetchHubSpotStages("orders"),
    ...plan.objects.map((type) => fetchHubSpotObjects(type, selected[type] ?? requiredProperties[type])),
  ]));
  const rawRows = Object.fromEntries(plan.objects.map((type, index) => [type, rowSets[index]])) as Partial<Record<ObjectType, HubSpotObject[]>>;
  const records: Record<string, unknown> = {};
  for (const type of plan.objects) {
    records[objectLabel[type]] = enrichRows(type, rawRows[type] ?? [], ownerMap, type === "deals" ? dealStages : type === "orders" ? orderStages : undefined);
  }

  if (plan.needsAssociations) {
    const invoiceRows = rawRows.invoices ?? await fetchHubSpotObjects("invoices", requiredProperties.invoices);
    const orderRows = rawRows.orders ?? await fetchHubSpotObjects("orders", requiredProperties.orders);
    const [invoiceDeals, orderDeals] = await stage("associations", () => Promise.all([
      fetchHubSpotAssociations("invoices", invoiceRows.map((row) => row.id)),
      fetchHubSpotAssociations("orders", orderRows.map((row) => row.id)),
    ]));
    records.Baglantilar = {
      invoice_to_deals: Object.fromEntries(invoiceDeals),
      order_to_deals: Object.fromEntries(orderDeals),
      deal_to_invoices: Object.fromEntries(inverseAssociation(invoiceDeals)),
      deal_to_orders: Object.fromEntries(inverseAssociation(orderDeals)),
    };
  }

  const labels = Object.fromEntries(plan.objects.map((type) => [
    objectLabel[type],
    Object.fromEntries(catalogs[type].filter((property) => selected[type]?.includes(property.name)).map((property) => [property.name, property.label])),
  ]));

  return {
    queriedAt: new Date().toISOString(),
    plan,
    snapshot: snapshot.data,
    propertyLabels: labels,
    liveHubSpotRecords: records,
  };
}
