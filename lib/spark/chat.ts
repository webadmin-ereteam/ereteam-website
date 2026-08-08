import { z } from "zod";
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
type FlatRecord = Record<string, string> & { _id: string; _url: string; _object: ObjectType };

export class SparkChatStageError extends Error {
  constructor(public readonly stage: string, cause: unknown) {
    super(cause instanceof Error ? cause.message : String(cause));
    this.name = "SparkChatStageError";
  }
}

async function stage<T>(name: string, task: () => Promise<T>) {
  try { return await task(); } catch (error) { throw new SparkChatStageError(name, error); }
}

const objectTypes: ObjectType[] = ["deals", "invoices", "orders"];
const filterSchema = z.object({
  property: z.string(),
  operator: z.enum(["eq", "neq", "contains", "not_contains", "gt", "gte", "lt", "lte", "between", "in", "is_empty", "not_empty"]),
  value: z.string().nullish(),
  values: z.array(z.string()).max(20).nullish(),
});
const planSchema = z.object({
  responseType: z.enum(["metric", "records"]),
  title: z.string().max(100),
  object: z.enum(objectTypes),
  properties: z.array(z.string()).max(16).default([]),
  filters: z.array(filterSchema).max(10).default([]),
  associatedDealFilters: z.array(filterSchema).max(8).default([]),
  aggregate: z.object({ operation: z.enum(["sum", "count", "average"]), property: z.string().nullish() }).nullish(),
  sort: z.object({ property: z.string(), direction: z.enum(["asc", "desc"]) }).nullish(),
  limit: z.number().int().min(1).max(100).default(50),
});
const requiredProperties: Record<ObjectType, string[]> = {
  deals: ["dealname", "dealstage", "createdate", "closedate", "amount_in_home_currency", "hs_is_closed_won", "dealtype", "hubspot_owner_id"],
  invoices: ["hs_number", "invoice_name", "hs_invoice_latest_company_name", "hs_invoice_date", "hs_amount_billed_in_company_currency", "hubspot_owner_id"],
  orders: ["hs_order_name", "hs_pipeline_stage", "hs_processed_date", "hs_homecurrency_amount", "hubspot_owner_id"],
};

const objectNames: Record<ObjectType, string> = { deals: "Deal", invoices: "Fatura", orders: "Order" };

function parseJson(value: string) {
  const fenced = value.match(/```(?:json)?\s*([\s\S]*?)```/i)?.[1];
  return JSON.parse(fenced || value.match(/\{[\s\S]*\}/)?.[0] || value);
}

function catalogText(catalogs: Record<ObjectType, HubSpotProperty[]>) {
  return objectTypes.map((type) => `${type}:\n${catalogs[type].map((p) => `${p.name} | ${p.label}`).join("\n")}`).join("\n\n");
}

async function createPlan(question: string, catalogs: Record<ObjectType, HubSpotProperty[]>, apiKey: string) {
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Istanbul", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
  const response = await generateChatResponse(
    `Sen HubSpot için salt-okunur JSON sorgu planlayıcısısın. Bugün ${today}, saat dilimi Europe/Istanbul.
KESİN VERİ SÖZLEŞMESİ - HER SORGUDAN ÖNCE UYGULA:
- Order tarihi yalnızca hs_processed_date, USD tutarı yalnızca hs_homecurrency_amount.
- Fatura tarihi yalnızca hs_invoice_date, USD tutarı yalnızca hs_amount_billed_in_company_currency.
- Deal USD tutarı yalnızca amount_in_home_currency; deal tarih bağlamına göre closedate veya createdate.
- Genel amount, TL tutarı veya başka para birimi property'lerini kullanma.
- "Beklenen fatura" henüz kesilmemiş, ilgili dönem tarihli açık order demektir: object orders, tarih hs_processed_date, tutar hs_homecurrency_amount, stage _stage_label eq Open.
- "Faturalanan/kesilen fatura" object invoices demektir.
Yalnızca JSON döndür. Şema:
{"responseType":"metric|records","title":"kısa Türkçe başlık","object":"deals|invoices|orders","properties":[],"filters":[{"property":"","operator":"eq|neq|contains|not_contains|gt|gte|lt|lte|between|in|is_empty|not_empty","value":"","values":[]}],"associatedDealFilters":[],"aggregate":{"operation":"sum|count|average","property":""},"sort":{"property":"","direction":"asc|desc"},"limit":50}.
Tek bir sayı/değer soruluyorsa metric, kayıtlar veya detaylar isteniyorsa records seç. Metric için aggregate zorunlu. Tutar toplamında sum kullan.
Sanal alanlar: _stage_label ve _owner_name filtrelenebilir. Tarih değerlerini YYYY-MM-DD yaz. "Bu ay" için ayın ilk ve son gününü between values ile ver. "Bu yıl" için yılın ilk ve son gününü kullan.
Bağlı faturanın/orderın deal özellikleri sorulursa associatedDealFilters kullan. Örneğin New Business için dealtype eq newbusiness.
Kayıt görünümünde gerekli isim, tarih, tutar, owner ve şirket alanlarını properties içine ekle. Verilen katalog dışında gerçek property uydurma.`,
    [{ role: "user", content: `SORU:\n${question}\n\nPROPERTY KATALOĞU:\n${catalogText(catalogs)}` }],
    apiKey,
    "",
    { model: "llama-3.3-70b-versatile", temperature: 0, maxTokens: 900, jsonMode: true },
  );
  const raw = parseJson(response);
  if (process.env.SPARK_CHAT_DEBUG === "1") console.log("Spark query plan:", JSON.stringify(raw));
  const objectAliases: Record<string, ObjectType> = { deal: "deals", deals: "deals", invoice: "invoices", invoices: "invoices", order: "orders", orders: "orders" };
  const operatorAliases: Record<string, z.infer<typeof filterSchema>["operator"]> = {
    eq: "eq", equals: "eq", equal: "eq", neq: "neq", not_equals: "neq", contains: "contains", not_contains: "not_contains",
    gt: "gt", greater_than: "gt", gte: "gte", greater_than_or_equal: "gte", lt: "lt", less_than: "lt", lte: "lte", less_than_or_equal: "lte",
    between: "between", in: "in", is_empty: "is_empty", not_empty: "not_empty",
  };
  raw.object = objectAliases[String(raw.object ?? "").toLowerCase()] ?? raw.object;
  raw.responseType = ["metric", "value", "number", "single_value"].includes(String(raw.responseType ?? "").toLowerCase()) ? "metric" : "records";
  const normalizeFilters = (filters: unknown) => (Array.isArray(filters) ? filters : []).flatMap((item: Record<string, unknown>) => {
    const operator = operatorAliases[String(item?.operator ?? "").toLowerCase()];
    if (!item?.property || !operator) return [];
    return [{ property: String(item.property), operator, value: item.value == null ? undefined : String(item.value), values: Array.isArray(item.values) ? item.values.map(String) : undefined }];
  });
  raw.filters = normalizeFilters(raw.filters);
  raw.associatedDealFilters = normalizeFilters(raw.associatedDealFilters);
  raw.properties = Array.isArray(raw.properties) ? raw.properties.map(String).slice(0, 16) : [];
  for (const filter of raw.filters) {
    if (["hs_pipeline_stage", "dealstage"].includes(filter.property) && ["open", "closed", "won", "lost"].some((word) => normalized(filter.value).includes(word))) {
      filter.property = "_stage_label";
    }
  }
  if (!raw.sort?.property || !["asc", "desc"].includes(raw.sort?.direction)) raw.sort = null;
  if (raw.responseType === "records") raw.aggregate = null;
  if (raw.responseType === "metric") {
    const operationAliases: Record<string, "sum" | "count" | "average"> = { sum: "sum", total: "sum", count: "count", average: "average", avg: "average" };
    if (raw.aggregate?.operation) raw.aggregate.operation = operationAliases[String(raw.aggregate.operation).toLowerCase()];
    if (!raw.aggregate?.operation) raw.aggregate = { operation: "count" };
  }
  raw.limit = Math.min(100, Math.max(1, Number(raw.limit) || 50));
  raw.title = String(raw.title || "HubSpot canlı sonucu").slice(0, 100);
  return planSchema.parse(raw);
}

function recordUrl(type: ObjectType, id: string) {
  const portal = "147286586";
  if (type === "deals") return `https://app.hubspot.com/contacts/${portal}/record/0-3/${id}`;
  if (type === "orders") return `https://app.hubspot.com/contacts/${portal}/record/0-123/${id}`;
  return `https://app.hubspot.com/contacts/${portal}/objects/0-53?filters=%5B%7B%22property%22%3A%22hs_object_id%22%2C%22operator%22%3A%22EQ%22%2C%22value%22%3A%22${id}%22%7D%5D`;
}

function flatten(type: ObjectType, row: HubSpotObject, owners: Map<string, string>, stages: Map<string, { label: string }>): FlatRecord {
  const stageKey = type === "deals" ? "dealstage" : type === "orders" ? "hs_pipeline_stage" : "";
  return {
    _id: row.id,
    _url: recordUrl(type, row.id),
    _object: type,
    ...Object.fromEntries(Object.entries(row.properties).map(([key, value]) => [key, value ?? ""])),
    _owner_name: owners.get(row.properties.hubspot_owner_id ?? "") ?? "",
    _stage_label: stageKey ? stages.get(row.properties[stageKey] ?? "")?.label ?? "" : "",
  };
}

const normalized = (value?: string | null) => (value ?? "").trim().toLocaleLowerCase("tr-TR");
function comparable(value?: string | null) {
  value = value ?? "";
  const number = Number(value);
  if (value !== "" && Number.isFinite(number)) return number;
  const date = Date.parse(value);
  return Number.isFinite(date) ? date : normalized(value);
}

function matches(record: FlatRecord, filter: z.infer<typeof filterSchema>) {
  const raw = record[filter.property] ?? "";
  const left = comparable(raw);
  const right = comparable(filter.value ?? "");
  if (filter.operator === "is_empty") return raw.trim() === "";
  if (filter.operator === "not_empty") return raw.trim() !== "";
  if (filter.operator === "contains") return normalized(raw).includes(normalized(filter.value));
  if (filter.operator === "not_contains") return !normalized(raw).includes(normalized(filter.value));
  if (filter.operator === "eq") return normalized(raw) === normalized(filter.value);
  if (filter.operator === "neq") return normalized(raw) !== normalized(filter.value);
  if (filter.operator === "in") return (filter.values ?? []).some((value) => normalized(raw) === normalized(value));
  if (filter.operator === "between") {
    const [min, max] = filter.values ?? [];
    return min !== undefined && max !== undefined && left >= comparable(min) && left <= comparable(max);
  }
  if (filter.operator === "gt") return left > right;
  if (filter.operator === "gte") return left >= right;
  if (filter.operator === "lt") return left < right;
  if (filter.operator === "lte") return left <= right;
  return true;
}

function labelMap(catalog: HubSpotProperty[]) {
  const labels = new Map([...catalog.map((property) => [property.name, property.label] as const), ["_owner_name", "Owner"], ["_stage_label", "Stage"]]);
  labels.set("hs_processed_date", "Tarih");
  labels.set("hs_invoice_date", "Fatura tarihi");
  labels.set("hs_homecurrency_amount", "Tutar (USD)");
  labels.set("hs_amount_billed_in_company_currency", "Tutar (USD)");
  labels.set("amount_in_home_currency", "Tutar (USD)");
  return labels;
}

function coreFields(type: ObjectType) {
  if (type === "deals") return ["dealname", "closedate", "amount_in_home_currency", "_owner_name", "_stage_label"];
  if (type === "invoices") return ["hs_number", "invoice_name", "hs_invoice_latest_company_name", "hs_invoice_date", "hs_amount_billed_in_company_currency", "_owner_name"];
  return ["hs_order_name", "hs_processed_date", "hs_homecurrency_amount", "_owner_name", "_stage_label"];
}

function formatMetric(value: number, property?: string | null) {
  const isMoney = Boolean(property?.includes("amount"));
  return isMoney
    ? new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value)
    : new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 2 }).format(value);
}

export async function executeSparkChatQuery(question: string, apiKey: string) {
  const [dealCatalog, invoiceCatalog, orderCatalog] = await stage("catalog", () => Promise.all([
    fetchHubSpotPropertyCatalog("deals"), fetchHubSpotPropertyCatalog("invoices"), fetchHubSpotPropertyCatalog("orders"),
  ]));
  const catalogs: Record<ObjectType, HubSpotProperty[]> = { deals: dealCatalog, invoices: invoiceCatalog, orders: orderCatalog };
  const plan = await stage("planner", () => createPlan(question, catalogs, apiKey));
  const valid = new Set(catalogs[plan.object].map((property) => property.name));
  const filterProperties = [...plan.filters, ...plan.associatedDealFilters].map((filter) => filter.property).filter((property) => !property.startsWith("_"));
  const selected = Array.from(new Set([...requiredProperties[plan.object], ...plan.properties, ...filterProperties, plan.aggregate?.property, plan.sort?.property]
    .filter((property): property is string => Boolean(property) && valid.has(property!))));

  const [rows, owners, dealStages, orderStages] = await stage("records", () => Promise.all([
    fetchHubSpotObjects(plan.object, selected), fetchHubSpotOwners(), fetchHubSpotStages("deals"), fetchHubSpotStages("orders"),
  ]));
  const stages = plan.object === "deals" ? dealStages : plan.object === "orders" ? orderStages : new Map();
  let filtered = rows.map((row) => flatten(plan.object, row, owners, stages)).filter((row) => plan.filters.every((filter) => matches(row, filter)));

  if (plan.associatedDealFilters.length && plan.object !== "deals") {
    const associatedObject: "invoices" | "orders" = plan.object;
    const dealProperties = Array.from(new Set([...requiredProperties.deals, ...plan.associatedDealFilters.map((filter) => filter.property).filter((property) => !property.startsWith("_"))]));
    const [deals, associations] = await stage("associations", () => Promise.all([
      fetchHubSpotObjects("deals", dealProperties), fetchHubSpotAssociations(associatedObject, filtered.map((row) => row._id)),
    ]));
    const allowedDeals = new Set(deals.map((row) => flatten("deals", row, owners, dealStages)).filter((row) => plan.associatedDealFilters.every((filter) => matches(row, filter))).map((row) => row._id));
    filtered = filtered.filter((row) => (associations.get(row._id) ?? []).some((dealId) => allowedDeals.has(dealId)));
  }

  if (plan.sort) {
    filtered.sort((a, b) => {
      const left = comparable(a[plan.sort!.property]);
      const right = comparable(b[plan.sort!.property]);
      const result = left < right ? -1 : left > right ? 1 : 0;
      return plan.sort!.direction === "asc" ? result : -result;
    });
  }

  const queriedAt = new Date().toISOString();
  if (plan.responseType === "metric") {
    const operation = plan.aggregate?.operation ?? "count";
    const property = plan.aggregate?.property;
    const values = property ? filtered.map((row) => Number(row[property]) || 0) : [];
    const value = operation === "count" ? filtered.length : operation === "average" ? (values.reduce((sum, item) => sum + item, 0) / Math.max(values.length, 1)) : values.reduce((sum, item) => sum + item, 0);
    return { kind: "metric" as const, title: plan.title, value, formattedValue: formatMetric(value, property), recordCount: filtered.length, queriedAt, source: "live_hubspot" as const };
  }

  const labels = labelMap(catalogs[plan.object]);
  const internalDisplayFields = new Set(["hubspot_owner_id", "dealstage", "hs_pipeline_stage"]);
  const fields = Array.from(new Set([...coreFields(plan.object), ...plan.properties])).filter((property) => !internalDisplayFields.has(property) && (valid.has(property) || property.startsWith("_")));
  const shown = filtered.slice(0, plan.limit);
  return {
    kind: "records" as const,
    title: plan.title,
    objectLabel: objectNames[plan.object],
    totalRecords: filtered.length,
    shownRecords: shown.length,
    columns: fields.map((key) => ({ key, label: labels.get(key) ?? key, format: key.includes("amount") ? "currency" : key.includes("date") ? "date" : "text" })),
    records: shown.map((row) => ({ id: row._id, url: row._url, values: Object.fromEntries(fields.map((field) => [field, row[field] ?? ""])) })),
    queriedAt,
    source: "live_hubspot" as const,
  };
}
