import { z } from "zod";
import {
  fetchHubSpotAssociations,
  fetchHubSpotObjects,
  fetchHubSpotObjectsByIds,
  fetchHubSpotOwners,
  fetchHubSpotPropertyCatalog,
  fetchHubSpotStages,
  type HubSpotObject,
  type HubSpotProperty,
} from "./hubspot";
import { generateChatResponse } from "@/lib/services/llmService";
import {
  SPARK_CHAT_KNOWLEDGE,
  detectSparkCountries,
  detectSparkCompanyName,
  detectSparkCountry,
  detectSparkDealBusinessType,
  detectSparkDomain,
  detectSparkGroupBy,
  detectSparkRevenueIntent,
  detectSparkVendor,
  normalizeSparkChatText,
  sparkObjectTypes,
  sparkBreakdownValueLabel,
  sparkGuaranteedRevenueSubquestions,
  sparkMultiValueTokens,
  sparkPlannerKnowledge,
  sparkRevenueGroup,
  sparkRevenueValues,
  type SparkObjectType,
} from "./chatKnowledge";

type ObjectType = SparkObjectType;
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

const objectTypes = sparkObjectTypes;
export const sparkChatFilterSchema = z.object({
  property: z.string().trim().min(1).max(120),
  operator: z.enum(["eq", "neq", "contains", "not_contains", "gt", "gte", "lt", "lte", "between", "in", "is_empty", "not_empty"]),
  value: z.string().max(500).nullish(),
  values: z.array(z.string().max(500)).max(20).nullish(),
}).superRefine((filter, context) => {
  if (filter.operator === "between" && filter.values?.length !== 2) context.addIssue({ code: "custom", message: "between iki değer gerektirir" });
  if (filter.operator === "in" && !filter.values?.length) context.addIssue({ code: "custom", message: "in en az bir değer gerektirir" });
  if (!["between", "in", "is_empty", "not_empty"].includes(filter.operator) && filter.value == null) context.addIssue({ code: "custom", message: `${filter.operator} bir değer gerektirir` });
});
const filterSchema = sparkChatFilterSchema;
const planSchema = z.object({
  responseType: z.enum(["metric", "records", "text"]),
  title: z.string().max(100),
  object: z.enum(objectTypes),
  properties: z.array(z.string()).max(16).default([]),
  filters: z.array(filterSchema).max(10).default([]),
  associatedDealFilters: z.array(filterSchema).max(8).default([]),
  aggregate: z.object({ operation: z.enum(["sum", "count", "average"]), property: z.string().nullish() }).nullish(),
  groupBy: z.string().max(120).nullish().default(null),
  answer: z.string().max(800).nullish().default(null),
  sort: z.object({ property: z.string(), direction: z.enum(["asc", "desc"]) }).nullish(),
  limit: z.number().int().min(1).max(100).default(50),
});
const requiredProperties = Object.fromEntries(objectTypes.map((type) => [type, SPARK_CHAT_KNOWLEDGE.objects[type].requiredProperties])) as unknown as Record<ObjectType, readonly string[]>;
const objectNames = Object.fromEntries(objectTypes.map((type) => [type, SPARK_CHAT_KNOWLEDGE.objects[type].label])) as unknown as Record<ObjectType, string>;
const dateProperties = Object.fromEntries(objectTypes.map((type) => [type, SPARK_CHAT_KNOWLEDGE.objects[type].dateProperty])) as unknown as Record<ObjectType, string>;
const amountProperties = Object.fromEntries(objectTypes.map((type) => [type, SPARK_CHAT_KNOWLEDGE.objects[type].amountProperty])) as unknown as Record<ObjectType, string>;

type QueryPlan = z.infer<typeof planSchema>;
export type SparkChatQueryContext = Pick<QueryPlan, "object" | "filters" | "associatedDealFilters" | "aggregate"> & {
  groupBy?: string | null;
  metricKind?: "guaranteed_revenue" | "weighted_pipeline";
};
export type SparkChatContextItem = {
  question: string;
  result: ({ kind: "metric" | "breakdown"; title: string; value: string; recordCount: number } | { kind: "records"; title: string; recordCount: number; objectLabel: string } | { kind: "text"; title: string; value: string; recordCount: number }) & { queryContext?: SparkChatQueryContext };
};
export type SparkChatExecutionResult =
  | { kind: "metric"; title: string; value: number; formattedValue: string; recordCount: number; interpretation: string; queryContext: SparkChatQueryContext; queriedAt: string; source: "live_hubspot" }
  | { kind: "breakdown"; title: string; groupLabel: string; items: Array<{ key: string; label: string; value: number; formattedValue: string; recordCount: number }>; summary: string; recordCount: number; interpretation: string; queryContext: SparkChatQueryContext; queriedAt: string; source: "live_hubspot" }
  | { kind: "text"; title: string; text: string; queriedAt: string; source: "planner_knowledge" }
  | { kind: "records"; title: string; objectLabel: string; totalRecords: number; shownRecords: number; interpretation: string; queryContext: SparkChatQueryContext; columns: Array<{ key: string; label: string; format: "currency" | "date" | "text" }>; records: Array<{ id: string; url: string; values: Record<string, string> }>; queriedAt: string; source: "live_hubspot" };
type DateRange = { start: string; endExclusive: string; label: string };

function dateParts(date: Date) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Europe/Istanbul", year: "numeric", month: "2-digit", day: "2-digit",
  }).formatToParts(date);
  const value = (type: Intl.DateTimeFormatPartTypes) => Number(parts.find((part) => part.type === type)?.value);
  return { year: value("year"), month: value("month"), day: value("day") };
}

function isoDate(year: number, month: number, day: number) {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function shiftCalendarDay(year: number, month: number, day: number, delta: number) {
  const shifted = new Date(Date.UTC(year, month - 1, day + delta));
  return isoDate(shifted.getUTCFullYear(), shifted.getUTCMonth() + 1, shifted.getUTCDate());
}

function nextIsoDate(value: string) {
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  return match ? shiftCalendarDay(Number(match[1]), Number(match[2]), Number(match[3]), 1) : null;
}

function semanticText(value: string) {
  return normalizeSparkChatText(value);
}

export function resolveSparkDateRange(question: string, now = new Date()): DateRange | null {
  const text = semanticText(question);
  const { year, month, day } = dateParts(now);
  const previousMonthYear = month === 1 ? year - 1 : year;
  const previousMonth = month === 1 ? 12 : month - 1;
  const explicitYear = text.match(/\b(20\d{2})\b/)?.[1];
  const quarter = SPARK_CHAT_KNOWLEDGE.quarters.find((period) => period.pattern.test(text));
  const halfYear = SPARK_CHAT_KNOWLEDGE.halfYears.find((period) => period.pattern.test(text));

  if (quarter) {
    const selectedYear = explicitYear ? Number(explicitYear) : /\bgecen\s+yil/.test(text) ? year - 1 : year;
    const endExclusive = quarter.endExclusiveMonth === 13
      ? isoDate(selectedYear + 1, 1, 1)
      : isoDate(selectedYear, quarter.endExclusiveMonth, 1);
    return { start: isoDate(selectedYear, quarter.startMonth, 1), endExclusive, label: `${selectedYear} ${quarter.label}` };
  }

  if (halfYear) {
    const selectedYear = explicitYear ? Number(explicitYear) : /\bgecen\s+yil/.test(text) ? year - 1 : year;
    const endExclusive = halfYear.endExclusiveMonth === 13
      ? isoDate(selectedYear + 1, 1, 1)
      : isoDate(selectedYear, halfYear.endExclusiveMonth, 1);
    return { start: isoDate(selectedYear, halfYear.startMonth, 1), endExclusive, label: `${selectedYear} ${halfYear.label}` };
  }

  if (/\bgecen\s+ay\b/.test(text)) {
    return { start: isoDate(previousMonthYear, previousMonth, 1), endExclusive: isoDate(year, month, 1), label: "Geçen ay" };
  }
  if (/\bbu\s+ay\b/.test(text)) {
    return { start: isoDate(year, month, 1), endExclusive: shiftCalendarDay(year, month, day, 1), label: "Bu ay" };
  }
  if (/\bgecen\s+yil\b/.test(text)) {
    return { start: isoDate(year - 1, 1, 1), endExclusive: isoDate(year, 1, 1), label: "Geçen yıl" };
  }
  if (/\bbu\s+yil\b/.test(text)) {
    return { start: isoDate(year, 1, 1), endExclusive: shiftCalendarDay(year, month, day, 1), label: "Bu yıl" };
  }
  if (/\bbugun\b/.test(text)) {
    return { start: isoDate(year, month, day), endExclusive: shiftCalendarDay(year, month, day, 1), label: "Bugün" };
  }
  if (/\bdun\b/.test(text)) {
    return { start: shiftCalendarDay(year, month, day, -1), endExclusive: isoDate(year, month, day), label: "Dün" };
  }
  const rollingDays = text.match(/\bson\s+(7|30)\s+gun\b/)?.[1];
  if (rollingDays) {
    const days = Number(rollingDays);
    return { start: shiftCalendarDay(year, month, day, 1 - days), endExclusive: shiftCalendarDay(year, month, day, 1), label: `Son ${days} gün` };
  }
  if (explicitYear) {
    const selectedYear = Number(explicitYear);
    return { start: isoDate(selectedYear, 1, 1), endExclusive: isoDate(selectedYear + 1, 1, 1), label: explicitYear };
  }
  return null;
}

function explicitObject(question: string): ObjectType | null {
  const text = semanticText(question);
  if (/\bbeklenen\s+fatura/.test(text) || /\b(open|acik)\s+order\w*/.test(text)) return "orders";
  if (/\b(fatura|faturalan|invoice)/.test(text)) return "invoices";
  if (/\b(order\w*|siparis\w*)/.test(text)) return "orders";
  if (/\b(deal|firsat|pipeline|won|lost)/.test(text)) return "deals";
  return null;
}

function uniqueFilters(filters: QueryPlan["filters"]) {
  return Array.from(new Map(filters.map((filter) => [JSON.stringify(filter), filter])).values());
}

export function applySparkQueryGuardrails(plan: QueryPlan, question: string, now = new Date(), context: SparkChatContextItem[] = []): QueryPlan {
  const text = semanticText(question);
  const explicit = explicitObject(question);
  const countries = detectSparkCountries(text);
  const country = countries.length === 1 ? detectSparkCountry(text) : null;
  const revenueIntent = detectSparkRevenueIntent(text);
  const domain = detectSparkDomain(text);
  const businessType = detectSparkDealBusinessType(text);
  const weightedPipelineIntent = SPARK_CHAT_KNOWLEDGE.compositeMetrics.weightedPipeline.pattern.test(text);
  const stageIntent = /\b(pipeline|aktif|acik\s+(firsat|order)|open|won|lost|kazanilan|kaybedilen|beklenen\s+fatura)\b/.test(text);
  const possessiveOwner = text.match(/\b([a-z]{2,30})['’]?(?:nin|nun|in|un)\s+(?:deal\w*|firsat\w*|fatura\w*|order\w*|siparis\w*)\b/)?.[1];
  const companyIntent = SPARK_CHAT_KNOWLEDGE.companies.triggerPattern.test(text);
  const requestedGroupBy = detectSparkGroupBy(text);
  const previous = context.at(-1)?.result.queryContext;
  const range = resolveSparkDateRange(question, now);
  const referencesPrevious = /\b(peki|bunlar|bunlarin|onlar|onlarin|ayni)\b/.test(text)
    || /^(toplami|tutari|kac(\s+tane(si)?)?|detaylari|listele|goster)[?!.]*$/.test(text)
    || Boolean(range || countries.length || revenueIntent || domain || businessType || requestedGroupBy || companyIntent || SPARK_CHAT_KNOWLEDGE.vendors.triggerPattern.test(text));
  const followsPrevious = Boolean(!explicit && previous && referencesPrevious);
  const object = weightedPipelineIntent ? "deals" : explicit ?? (followsPrevious ? previous!.object : plan.object);
  const vendor = detectSparkVendor(text, object);
  let companyName = detectSparkCompanyName(text);
  const collapsesBreakdown = /^(bunlarin\s+|onlarin\s+)?(toplami|tutari)[?!.]*$/.test(text);
  let groupBy = requestedGroupBy ?? (followsPrevious && !collapsesBreakdown ? previous?.groupBy ?? null : null);
  const asksAverage = /\bortalama\b/.test(text);
  const asksCount = /\b(kac|sayi|adet)/.test(text) && !/\bne\s+kadar\b/.test(text);
  const asksAmount = /\b(ne\s+kadar(?:i)?|tutar|toplam|ciro)/.test(text);
  const asksRecords = /\b(hangi|liste|goster|detay|kayit)/.test(text) && !asksAmount && !asksCount && !asksAverage;

  let responseType = plan.responseType;
  let aggregate = plan.aggregate;
  if (groupBy) {
    responseType = "metric";
    aggregate = asksCount
      ? { operation: "count" as const, property: null }
      : { operation: asksAverage ? "average" as const : "sum" as const, property: amountProperties[object] };
  } else if (asksRecords) {
    responseType = "records";
    aggregate = null;
  } else if (asksAverage || asksCount || asksAmount) {
    responseType = "metric";
    aggregate = asksCount
      ? { operation: "count" as const, property: null }
      : { operation: asksAverage ? "average" as const : "sum" as const, property: amountProperties[object] };
  } else if (responseType === "metric" && aggregate && aggregate.operation !== "count") {
    aggregate = { ...aggregate, property: amountProperties[object] };
  }
  if (weightedPipelineIntent) {
    responseType = "metric";
    aggregate = { operation: "sum", property: SPARK_CHAT_KNOWLEDGE.compositeMetrics.weightedPipeline.property };
    groupBy = null;
  }

  let filters = [...plan.filters];
  let associatedDealFilters = [...plan.associatedDealFilters];
  const plannedOwnerValues = [...filters, ...associatedDealFilters]
    .filter((filter) => ["_owner_name", "hubspot_owner_id"].includes(filter.property))
    .flatMap((filter) => filter.operator === "in" ? filter.values ?? [] : filter.value ? [filter.value] : []);
  const ownerIntent = Boolean(possessiveOwner || /\b(owner|satisci|sorumlu)\b/.test(text)
    || plannedOwnerValues.some((value) => normalizeSparkChatText(value).split(/[^a-z0-9]+/).some((part) => part.length >= 3 && text.includes(part))));
  const normalizeOwnerProperty = (filter: QueryPlan["filters"][number]) => filter.property === "hubspot_owner_id"
    && (filter.value ? !/^\d+$/.test(filter.value) : Boolean(filter.values?.some((value) => !/^\d+$/.test(value))))
    ? { ...filter, property: "_owner_name" }
    : filter;
  if (ownerIntent) {
    filters = filters.map(normalizeOwnerProperty);
    associatedDealFilters = associatedDealFilters.map(normalizeOwnerProperty);
  }
  if (followsPrevious && previous) {
    const previousNonDate = previous.filters.filter((filter) => !Object.values(dateProperties).includes(filter.property));
    const plannedNonDate = filters.filter((filter) => !Object.values(dateProperties).includes(filter.property));
    if (/\b(bunlar|bunlarin|onlar|onlarin|ayni)\b/.test(text)) {
      filters = range ? uniqueFilters([...previousNonDate, ...plannedNonDate]) : previous.filters;
      associatedDealFilters = previous.associatedDealFilters;
    } else if (range) {
      filters = uniqueFilters([...previousNonDate, ...plannedNonDate]);
      associatedDealFilters = previous.associatedDealFilters;
    } else if (countries.length || vendor || companyName || revenueIntent || domain || businessType || requestedGroupBy) {
      const changedProperties = new Set([
        countries.length && "country", vendor && "vendor_name", companyName && "_company_name", revenueIntent && "revenue_type",
        domain && "ereteam_domain",
        object === "deals" && businessType && "dealtype",
      ].filter(Boolean));
      const previousUnchanged = previous.filters.filter((filter) => !changedProperties.has(filter.property));
      const plannedUnchanged = filters.filter((filter) => !changedProperties.has(filter.property));
      filters = uniqueFilters([...previousUnchanged, ...plannedUnchanged]);
      associatedDealFilters = previous.associatedDealFilters;
    }
  }
  if (!followsPrevious) {
    if (!countries.length) filters = filters.filter((filter) => filter.property !== "country");
    if (!revenueIntent) filters = filters.filter((filter) => filter.property !== "revenue_type");
    if (!domain) filters = filters.filter((filter) => filter.property !== "ereteam_domain");
    if (!businessType) {
      filters = filters.filter((filter) => filter.property !== "dealtype");
      associatedDealFilters = associatedDealFilters.filter((filter) => filter.property !== "dealtype");
    }
    if (!stageIntent) filters = filters.filter((filter) => !["dealstage", "hs_is_closed_won", "hs_pipeline_stage", "_stage_label"].includes(filter.property));
    if (!ownerIntent) {
      filters = filters.filter((filter) => !["_owner_name", "hubspot_owner_id"].includes(filter.property));
      associatedDealFilters = associatedDealFilters.filter((filter) => !["_owner_name", "hubspot_owner_id"].includes(filter.property));
    }
  }
  if (possessiveOwner) {
    filters = filters.filter((filter) => !["_owner_name", "hubspot_owner_id"].includes(filter.property));
    filters.push({ property: "_owner_name", operator: "contains", value: possessiveOwner });
  }
  if (groupBy === "_revenue_group" || groupBy === "revenue_type") filters = filters.filter((filter) => filter.property !== "revenue_type");
  if (groupBy === "ereteam_domain" && !domain) filters = filters.filter((filter) => filter.property !== "ereteam_domain");
  if (groupBy === "dealtype" && !businessType) filters = filters.filter((filter) => filter.property !== "dealtype");
  if (range) {
    const knownDateProperties = new Set(Object.values(dateProperties));
    const plannedDealDate = plan.filters.find((filter) => filter.property === "createdate" || filter.property === "closedate")?.property;
    const dealDate = /\b(acilan|yeni|olusturulan)\b/.test(text) ? "createdate"
      : /\b(kapanan|kazanilan|kaybedilen)\b/.test(text) ? "closedate"
      : plannedDealDate ?? dateProperties.deals;
    const dateProperty = object === "deals" ? dealDate : dateProperties[object];
    filters = filters.filter((filter) => !knownDateProperties.has(filter.property));
    filters.push(
      { property: dateProperty, operator: "gte", value: range.start },
      { property: dateProperty, operator: "lt", value: range.endExclusive },
    );
  }
  if (object === "orders" && (/\bbeklenen\s+fatura/.test(text) || /\b(open|acik)\s+order\w*/.test(text))) {
    filters = filters.filter((filter) => filter.property !== "_stage_label");
    filters.push({ property: "_stage_label", operator: "eq", value: "Open" });
  }
  if (object === "deals") {
    if (/\b(pipeline|aktif|acik\s+firsat)/.test(text)) {
      filters = filters.filter((filter) => !["dealstage", "hs_is_closed_won", "_stage_label"].includes(filter.property));
      filters.push(
        { property: "_stage_label", operator: "not_contains", value: "won" },
        { property: "_stage_label", operator: "not_contains", value: "lost" },
      );
    } else if (/\b(kazanilan|closed\s+won|won)\b/.test(text)) {
      filters = filters.filter((filter) => filter.property !== "_stage_label");
      filters.push({ property: "_stage_label", operator: "contains", value: "won" });
    } else if (/\b(kaybedilen|closed\s+lost|lost)\b/.test(text)) {
      filters = filters.filter((filter) => filter.property !== "_stage_label");
      filters.push({ property: "_stage_label", operator: "contains", value: "lost" });
    }
  }
  if (object !== "deals") {
    const plannedDealType = filters.find((filter) => filter.property === "dealtype");
    filters = filters.filter((filter) => filter.property !== "dealtype");
    if (plannedDealType && !businessType) {
      associatedDealFilters = associatedDealFilters.filter((filter) => filter.property !== "dealtype");
      associatedDealFilters.push(plannedDealType);
    }
  }
  if (object !== "deals" && businessType) {
    associatedDealFilters = associatedDealFilters.filter((filter) => !["dealtype", "_stage_label"].includes(filter.property));
    associatedDealFilters.push({ property: "dealtype", operator: "eq", value: businessType });
    if (businessType === "newbusiness") associatedDealFilters.push({ property: "_stage_label", operator: "contains", value: "won" });
  }
  if (groupBy === "country" && countries.length) {
    filters = filters.filter((filter) => filter.property !== "country");
    filters.push({ property: "country", operator: "in", values: countries });
  } else if (country) {
    filters = filters.filter((filter) => filter.property !== "country");
    filters.push({ property: "country", operator: "eq", value: country });
  }
  const explicitVendorIntent = SPARK_CHAT_KNOWLEDGE.vendors.triggerPattern.test(text);
  const plannerVendorValue = filters.find((filter) => filter.property === "vendor_name")?.value?.trim();
  if (!explicitVendorIntent && !companyName && plannerVendorValue) companyName = plannerVendorValue;
  if (vendor && groupBy !== "vendor_name") {
    filters = filters.filter((filter) => filter.property !== "vendor_name");
    filters.push({ property: "vendor_name", operator: "eq", value: vendor });
  } else if (!explicitVendorIntent) {
    filters = filters.filter((filter) => filter.property !== "vendor_name");
  }
  if (companyName) {
    filters = filters.filter((filter) => !["_company_name", "hs_invoice_latest_company_name"].includes(filter.property));
    filters.push({ property: "_company_name", operator: "contains", value: companyName });
  } else if (companyIntent) {
    filters = filters.map((filter) => filter.property === "hs_invoice_latest_company_name"
      ? { ...filter, property: "_company_name", operator: "contains" as const }
      : filter);
  }
  if (revenueIntent && !["revenue_type", "_revenue_group"].includes(groupBy ?? "")) {
    filters = filters.filter((filter) => filter.property !== "revenue_type");
    const values = sparkRevenueValues(revenueIntent, object);
    filters.push(values.length === 1
      ? { property: "revenue_type", operator: "eq", value: values[0] }
      : { property: "revenue_type", operator: "in", values });
  }
  if (domain && groupBy !== "ereteam_domain") {
    filters = filters.filter((filter) => filter.property !== "ereteam_domain");
    filters.push({ property: "ereteam_domain", operator: "eq", value: domain });
  }
  if (object === "deals" && businessType === "newbusiness" && groupBy !== "dealtype") {
    filters = filters.filter((filter) => filter.property !== "dealtype");
    filters.push({ property: "dealtype", operator: "eq", value: "newbusiness" });
  } else if (object === "deals" && businessType === "existingbusiness" && groupBy !== "dealtype") {
    filters = filters.filter((filter) => filter.property !== "dealtype");
    filters.push({ property: "dealtype", operator: "eq", value: "existingbusiness" });
  }

  if (responseType === "text") {
    aggregate = null;
    groupBy = null;
  }
  const guarded = { ...plan, object, responseType, aggregate, groupBy, filters: uniqueFilters(filters), associatedDealFilters };
  if (weightedPipelineIntent) guarded.title = SPARK_CHAT_KNOWLEDGE.compositeMetrics.weightedPipeline.label;
  if (range && responseType === "metric") {
    const subject = object === "invoices" ? "fatura" : object === "orders" ? "order" : "deal";
    const measure = aggregate?.operation === "count" ? "sayısı" : aggregate?.operation === "average" ? "ortalama tutarı" : "tutarı";
    guarded.title = `${range.label} ${subject} ${measure}`;
  }
  return planSchema.parse(guarded);
}

function parseJson(value: string) {
  const fenced = value.match(/```(?:json)?\s*([\s\S]*?)```/i)?.[1];
  return JSON.parse(fenced || value.match(/\{[\s\S]*\}/)?.[0] || value);
}

function catalogText(catalogs: Record<ObjectType, HubSpotProperty[]>, question: string, context: SparkChatContextItem[]) {
  const terms = normalized(question).split(/[^a-z0-9çğıöşü]+/).filter((term) => term.length >= 4);
  const contextProperties = new Set(context.flatMap((item) => {
    const query = item.result.queryContext;
    return query ? [...query.filters, ...query.associatedDealFilters].map((filter) => filter.property).concat(query.aggregate?.property ?? [], query.groupBy ?? []) : [];
  }));
  return objectTypes.map((type) => {
    const required = new Set(requiredProperties[type]);
    const relevant = catalogs[type].filter((property) => {
      const text = normalized(`${property.name} ${property.label}`);
      return required.has(property.name) || contextProperties.has(property.name) || terms.some((term) => text.includes(term));
    }).slice(0, 60);
    return `${type}:\n${relevant.map((property) => `${property.name} | ${property.label}`).join("\n")}`;
  }).join("\n\n");
}

async function createPlan(question: string, catalogs: Record<ObjectType, HubSpotProperty[]>, apiKey: string, context: SparkChatContextItem[], model: string, retry = false) {
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Istanbul", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
  const response = await generateChatResponse(
    `Sen HubSpot için salt-okunur JSON sorgu planlayıcısısın. Bugün ${today}, saat dilimi Europe/Istanbul.
KESİN VERİ SÖZLEŞMESİ - HER SORGUDAN ÖNCE UYGULA:
${sparkPlannerKnowledge}
Yalnızca JSON döndür. Şema:
{"responseType":"metric|records|text","title":"kısa Türkçe başlık","object":"deals|invoices|orders","properties":[],"filters":[{"property":"","operator":"eq|neq|contains|not_contains|gt|gte|lt|lte|between|in|is_empty|not_empty","value":"","values":[]}],"associatedDealFilters":[],"aggregate":{"operation":"sum|count|average","property":""},"groupBy":"property veya null","answer":"text cevabı veya null","sort":{"property":"","direction":"asc|desc"},"limit":50}.
Tek bir sayı/değer soruluyorsa metric, kayıtlar veya detaylar isteniyorsa records seç. Açıklama, yorum, selamlama veya "ne demek/nasıl hesaplanır" sorularında text seç ve yalnızca doğrulanmış sözleşmeye dayanan kısa Türkçe answer yaz. Metric için aggregate zorunlu. Tutar toplamında sum kullan. Kırılım istenirse metric ve groupBy kullan.
Sanal alanlar: _stage_label, _owner_name ve lisans/servis kırılımı için _revenue_group kullanılabilir. Tarih değerlerini YYYY-MM-DD yaz. "Bu ay", "geçen ay", "bu yıl", "geçen yıl", "bugün", "dün" ve "son 7/30 gün" ifadelerinde tam takvim aralığını uygula; tarih filtresini asla atlama.
Bağlı faturanın/orderın deal özellikleri sorulursa associatedDealFilters kullan. Örneğin New Business için dealtype eq newbusiness.
Kayıt görünümünde gerekli isim, tarih, tutar, owner ve şirket alanlarını properties içine ekle. Verilen katalog dışında gerçek property uydurma.`,
    [{ role: "user", content: `${context.length ? `SON 5 KONUŞMA ÖZETİ VE DOĞRULANMIŞ SORGU BAĞLAMI (detay kayıt içermez):\n${JSON.stringify(context)}\n\nTakip sorusunda önceki queryContext kapsamını koru; yalnızca kullanıcı yeni nesne, dönem veya filtre belirttiyse ilgili kısmı değiştir.\n\n` : ""}SORU:\n${question}\n\nİLGİLİ PROPERTY KATALOĞU:\n${catalogText(catalogs, question, context)}${retry ? "\n\nÖnceki plan şemaya uymadı. Bu kez hiçbir istenen filtreyi atlamadan tüm zorunlu alanlarla geçerli, sade JSON üret." : ""}` }],
    apiKey,
    "",
    { model, temperature: 0, maxTokens: 900, jsonMode: true },
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
  const responseAliases: Record<string, "metric" | "records" | "text"> = {
    metric: "metric", metrics: "metric", value: "metric", number: "metric", single_value: "metric",
    records: "records", record: "records", list: "records", table: "records", details: "records",
    text: "text", answer: "text", explanation: "text", narrative: "text",
  };
  raw.responseType = responseAliases[String(raw.responseType ?? "").toLowerCase()] ?? raw.responseType;
  const normalizeFilters = (filters: unknown) => {
    if (filters == null) return [];
    if (!Array.isArray(filters)) throw new Error("Filtre listesi geçersiz");
    return filters.map((item: Record<string, unknown>) => {
    const operator = operatorAliases[String(item?.operator ?? "").toLowerCase()];
      if (!item || typeof item !== "object" || !item.property || !operator) throw new Error("Eksik veya geçersiz filtre");
      return { property: String(item.property), operator, value: item.value == null ? undefined : String(item.value), values: Array.isArray(item.values) ? item.values.map(String) : undefined };
    });
  };
  raw.filters = normalizeFilters(raw.filters);
  raw.associatedDealFilters = normalizeFilters(raw.associatedDealFilters);
  const expandDateRanges = (filters: Array<Record<string, unknown>>) => filters.flatMap((filter) => {
    if (filter.operator !== "between" || !String(filter.property).includes("date") || !Array.isArray(filter.values) || filter.values.length !== 2) return [filter];
    const exclusiveEnd = nextIsoDate(String(filter.values[1]));
    return exclusiveEnd
      ? [{ property: filter.property, operator: "gte", value: String(filter.values[0]) }, { property: filter.property, operator: "lt", value: exclusiveEnd }]
      : [filter];
  });
  raw.filters = expandDateRanges(raw.filters);
  raw.associatedDealFilters = expandDateRanges(raw.associatedDealFilters);
  if (raw.properties == null) raw.properties = [];
  else if (Array.isArray(raw.properties)) raw.properties = raw.properties.map(String).slice(0, 16);
  for (const filter of raw.filters) {
    if (["stage", "hs_pipeline_stage", "dealstage"].includes(filter.property) && ["open", "closed", "won", "lost"].some((word) => normalized(filter.value).includes(word))) {
      filter.property = "_stage_label";
    }
    if (filter.operator === "between" && filter.value && filter.values?.length === 1) filter.values = [filter.value, filter.values[0]];
  }
  if (raw.sort == null || (typeof raw.sort === "object" && !raw.sort.property && !raw.sort.direction)) raw.sort = null;
  raw.groupBy = raw.groupBy == null || raw.groupBy === "" ? null : String(raw.groupBy);
  raw.answer = raw.answer == null || raw.answer === "" ? null : String(raw.answer).slice(0, 800);
  if (raw.responseType === "records") raw.aggregate = null;
  if (raw.responseType === "text") { raw.aggregate = null; raw.groupBy = null; }
  if (raw.responseType === "metric") {
    const operationAliases: Record<string, "sum" | "count" | "average"> = { sum: "sum", total: "sum", count: "count", average: "average", avg: "average" };
    if (raw.aggregate?.operation) raw.aggregate.operation = operationAliases[String(raw.aggregate.operation).toLowerCase()];
  }
  raw.limit = Math.min(100, Math.max(1, Number(raw.limit) || 50));
  raw.title = String(raw.title || "HubSpot canlı sonucu").slice(0, 100);
  const plan = applySparkQueryGuardrails(planSchema.parse(raw), question, new Date(), context);
  if (plan.responseType === "metric" && !plan.aggregate) throw new Error("Metric sorgusunda hesaplama eksik");
  const virtualProperties = plan.object === "invoices" ? ["_owner_name", "_company_name", "_revenue_group"] : ["_owner_name", "_company_name", "_stage_label", "_revenue_group"];
  const objectFilterProperties = new Set([...catalogs[plan.object].map((property) => property.name), ...virtualProperties]);
  const dealFilterProperties = new Set([...catalogs.deals.map((property) => property.name), "_owner_name", "_stage_label"]);
  const invalidFilter = plan.filters.find((filter) => !objectFilterProperties.has(filter.property));
  const invalidDealFilter = plan.associatedDealFilters.find((filter) => !dealFilterProperties.has(filter.property));
  const invalidProperty = plan.properties.find((property) => !objectFilterProperties.has(property));
  const invalidSort = plan.sort && !objectFilterProperties.has(plan.sort.property) ? plan.sort.property : null;
  const invalidAggregate = plan.aggregate?.property && !objectFilterProperties.has(plan.aggregate.property) ? plan.aggregate.property : null;
  const invalidGroupBy = plan.groupBy && !objectFilterProperties.has(plan.groupBy) ? plan.groupBy : null;
  if (invalidFilter || invalidDealFilter || invalidProperty || invalidSort || invalidAggregate || invalidGroupBy) {
    throw new Error(`Geçersiz sorgu alanı: ${invalidFilter?.property ?? invalidDealFilter?.property ?? invalidProperty ?? invalidSort ?? invalidAggregate ?? invalidGroupBy}`);
  }
  return plan;
}

function recordUrl(type: ObjectType, id: string) {
  const portal = "147286586";
  if (type === "deals") return `https://app.hubspot.com/contacts/${portal}/record/0-3/${id}`;
  if (type === "orders") return `https://app.hubspot.com/contacts/${portal}/record/0-123/${id}`;
  return `https://app.hubspot.com/contacts/${portal}/objects/0-53?filters=%5B%7B%22property%22%3A%22hs_object_id%22%2C%22operator%22%3A%22EQ%22%2C%22value%22%3A%22${id}%22%7D%5D`;
}

function flatten(type: ObjectType, row: HubSpotObject, owners: Map<string, string>, stages: Map<string, { label: string }>): FlatRecord {
  const stageKey = type === "deals" ? "dealstage" : type === "orders" ? "hs_pipeline_stage" : "";
  const flat = {
    _id: row.id,
    _url: recordUrl(type, row.id),
    _object: type,
    ...Object.fromEntries(Object.entries(row.properties).map(([key, value]) => [key, value ?? ""])),
    _owner_name: owners.get(row.properties.hubspot_owner_id ?? "") ?? "",
    _company_name: type === "invoices" ? row.properties.hs_invoice_latest_company_name ?? ""
      : type === "deals" ? row.properties.dealname ?? "" : "",
    _stage_label: stageKey ? stages.get(row.properties[stageKey] ?? "")?.label ?? "" : "",
  };
  return {
    ...flat,
    _revenue_group: sparkRevenueGroup(row.properties.revenue_type),
  };
}

const normalized = (value?: string | null) => (value ?? "").trim().toLocaleLowerCase("tr-TR");

function editDistance(left: string, right: string) {
  const distances = Array.from({ length: left.length + 1 }, (_, leftIndex) =>
    Array.from({ length: right.length + 1 }, (_, rightIndex) => leftIndex ? rightIndex ? 0 : leftIndex : rightIndex));
  for (let leftIndex = 1; leftIndex <= left.length; leftIndex += 1) {
    for (let rightIndex = 1; rightIndex <= right.length; rightIndex += 1) {
      distances[leftIndex][rightIndex] = Math.min(
        distances[leftIndex - 1][rightIndex] + 1,
        distances[leftIndex][rightIndex - 1] + 1,
        distances[leftIndex - 1][rightIndex - 1] + (left[leftIndex - 1] === right[rightIndex - 1] ? 0 : 1),
      );
      if (leftIndex > 1 && rightIndex > 1
        && left[leftIndex - 1] === right[rightIndex - 2]
        && left[leftIndex - 2] === right[rightIndex - 1]) {
        distances[leftIndex][rightIndex] = Math.min(distances[leftIndex][rightIndex], distances[leftIndex - 2][rightIndex - 2] + 1);
      }
    }
  }
  return distances[left.length][right.length];
}

function ownerSimilarity(query: string, candidate: string) {
  const candidateParts = candidate.split(/[^a-z0-9]+/).filter(Boolean);
  const comparisons = [candidate, ...candidateParts];
  return Math.max(...comparisons.map((part) => 1 - editDistance(query, part) / Math.max(query.length, part.length, 1)));
}

export function resolveSparkOwnerName(value: string, ownerNames: Iterable<string>) {
  const query = normalizeSparkChatText(value);
  if (!query) return null;
  const candidates = Array.from(new Set(Array.from(ownerNames).filter(Boolean)));
  const normalizedCandidates = candidates.map((name) => ({ name, normalized: normalizeSparkChatText(name) }));
  const exact = normalizedCandidates.find((candidate) => candidate.normalized === query);
  if (exact) return exact.name;

  const tokenMatches = normalizedCandidates.filter((candidate) => candidate.normalized.split(/[^a-z0-9]+/).includes(query));
  if (tokenMatches.length === 1) return tokenMatches[0].name;

  const substringMatches = normalizedCandidates.filter((candidate) => candidate.normalized.includes(query) || query.includes(candidate.normalized));
  if (substringMatches.length === 1) return substringMatches[0].name;

  const ranked = normalizedCandidates
    .map((candidate) => ({ ...candidate, score: ownerSimilarity(query, candidate.normalized) }))
    .sort((left, right) => right.score - left.score || left.name.localeCompare(right.name, "tr"));
  if (!ranked.length
    || ranked[0].score < SPARK_CHAT_KNOWLEDGE.ownerMatching.minimumSimilarity
    || (ranked[1] && ranked[0].score - ranked[1].score < SPARK_CHAT_KNOWLEDGE.ownerMatching.ambiguityMargin)) return null;
  return ranked[0].name;
}

export function resolveSparkOwnerFilter(filter: z.infer<typeof filterSchema>, ownerNames: string[]) {
  if (filter.property !== "_owner_name") return filter;
  if (filter.operator === "in") {
    const values = Array.from(new Set((filter.values ?? []).map((value) => resolveSparkOwnerName(value, ownerNames) ?? value)));
    return { ...filter, values };
  }
  if (filter.value == null) return filter;
  const value = resolveSparkOwnerName(filter.value, ownerNames);
  return value ? { ...filter, operator: filter.operator === "contains" ? "eq" as const : filter.operator, value } : filter;
}

function resolveOwnerFilters(plan: QueryPlan, owners: Map<string, string>): QueryPlan {
  const ownerNames = Array.from(owners.values());
  const ownerFilters = [...plan.filters, ...plan.associatedDealFilters].filter((filter) => filter.property === "_owner_name");
  const unresolved = ownerFilters.flatMap((filter) => filter.operator === "in" ? filter.values ?? [] : filter.value ? [filter.value] : [])
    .find((value) => !resolveSparkOwnerName(value, ownerNames));
  if (unresolved) throw new SparkChatStageError("owner", `Owner eşleşmedi: ${unresolved}`);
  return {
    ...plan,
    filters: plan.filters.map((filter) => resolveSparkOwnerFilter(filter, ownerNames)),
    associatedDealFilters: plan.associatedDealFilters.map((filter) => resolveSparkOwnerFilter(filter, ownerNames)),
  };
}

export function sparkChatComparableValue(value?: string | null) {
  value = value ?? "";
  const number = Number(value);
  if (value !== "" && Number.isFinite(number)) return number;
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return Date.parse(`${value}T00:00:00+03:00`);
  const date = Date.parse(value);
  return Number.isFinite(date) ? date : normalized(value);
}

export function sparkChatMatchesFilter(record: Record<string, string>, filter: z.infer<typeof filterSchema>) {
  const raw = record[filter.property] ?? "";
  const multiValue = SPARK_CHAT_KNOWLEDGE.filterContracts.multiValueProperties.includes(filter.property as "vendor_name" | "revenue_type");
  const tokens = multiValue ? sparkMultiValueTokens(raw) : [raw];
  const tokenMatches = (value?: string | null) => normalized(value) === "" && raw.trim() === ""
    ? true
    : tokens.some((token) => normalized(token) === normalized(value));
  const left = sparkChatComparableValue(raw);
  const right = sparkChatComparableValue(filter.value ?? "");
  if (filter.operator === "is_empty") return raw.trim() === "";
  if (filter.operator === "not_empty") return raw.trim() !== "";
  if (filter.operator === "contains") return normalized(raw).includes(normalized(filter.value));
  if (filter.operator === "not_contains") return !normalized(raw).includes(normalized(filter.value));
  if (filter.operator === "eq") return tokenMatches(filter.value);
  if (filter.operator === "neq") return !tokenMatches(filter.value);
  if (filter.operator === "in") return (filter.values ?? []).some(tokenMatches);
  if (filter.operator === "between") {
    const [min, max] = filter.values ?? [];
    return min !== undefined && max !== undefined && left >= sparkChatComparableValue(min) && left <= sparkChatComparableValue(max);
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
  labels.set("country", "Ülke");
  labels.set("vendor_name", "Vendor");
  labels.set("_company_name", "Müşteri / Şirket");
  labels.set("revenue_type", "Revenue Type");
  labels.set("dealtype", "İş tipi");
  labels.set("ereteam_domain", "Ereteam Domain");
  labels.set("_revenue_group", "Gelir grubu");
  return labels;
}

function coreFields(type: ObjectType) {
  return [...SPARK_CHAT_KNOWLEDGE.objects[type].coreFields];
}

function formatMetric(value: number, property?: string | null) {
  const isMoney = Boolean(property?.includes("amount"));
  return isMoney
    ? new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value)
    : new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 2 }).format(value);
}

function queryContext(plan: QueryPlan): SparkChatQueryContext {
  return {
    object: plan.object,
    filters: plan.filters,
    associatedDealFilters: plan.associatedDealFilters,
    aggregate: plan.aggregate,
    groupBy: plan.groupBy,
    metricKind: plan.aggregate?.property === SPARK_CHAT_KNOWLEDGE.compositeMetrics.weightedPipeline.property ? "weighted_pipeline" : undefined,
  };
}

function formatPlanDate(value: string, endExclusive = false) {
  const date = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return value;
  if (endExclusive) date.setUTCDate(date.getUTCDate() - 1);
  return new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }).format(date);
}

function interpretation(plan: QueryPlan, catalog: HubSpotProperty[]) {
  const labels = labelMap(catalog);
  const dateProperty = plan.object === "deals"
    ? plan.filters.find((filter) => filter.property === "createdate" || filter.property === "closedate")?.property
    : dateProperties[plan.object];
  const start = dateProperty ? plan.filters.find((filter) => filter.property === dateProperty && filter.operator === "gte")?.value : null;
  const end = dateProperty ? plan.filters.find((filter) => filter.property === dateProperty && filter.operator === "lt")?.value : null;
  const period = start && end ? `${formatPlanDate(start)}–${formatPlanDate(end, true)}` : "Tüm tarihler";
  const measure = plan.responseType === "records" ? "Kayıt listesi"
    : plan.aggregate?.operation === "count" ? "Kayıt sayısı"
    : plan.aggregate?.operation === "average" ? "Ortalama USD tutarı" : "Toplam USD tutarı";
  const filterValue = (filter: QueryPlan["filters"][number]) => {
    const value = filter.value ?? filter.values?.join(", ") ?? "";
    if (filter.operator === "neq") return `${value} değil`;
    if (filter.operator === "not_contains") return `${value} hariç`;
    if (filter.operator === "contains") return `${value} içerir`;
    if (filter.operator === "is_empty") return "boş";
    if (filter.operator === "not_empty") return "dolu";
    return value || filter.operator;
  };
  const otherFilters = plan.filters
    .filter((filter) => filter.property !== dateProperty)
    .slice(0, 3)
    .map((filter) => `${labels.get(filter.property) ?? filter.property}: ${filterValue(filter)}`);
  if (plan.associatedDealFilters.length) otherFilters.push("Bağlı deal filtresi uygulandı");
  if (plan.groupBy) otherFilters.push(`Kırılım: ${labels.get(plan.groupBy) ?? plan.groupBy}`);
  return [objectNames[plan.object], period, measure, ...otherFilters].join(" · ");
}

function aggregateRows(rows: FlatRecord[], operation: "sum" | "count" | "average", property?: string | null) {
  const values = property ? rows.flatMap((row) => {
    const raw = row[property];
    const numeric = Number(raw);
    return raw?.trim() && Number.isFinite(numeric) ? [numeric] : [];
  }) : [];
  const value = operation === "count" ? rows.length
    : operation === "average" ? values.reduce((sum, item) => sum + item, 0) / Math.max(values.length, 1)
    : values.reduce((sum, item) => sum + item, 0);
  return { value, recordCount: operation === "count" ? rows.length : values.length };
}

export async function executeSparkChatQuery(question: string, apiKey: string, context: SparkChatContextItem[] = []): Promise<SparkChatExecutionResult> {
  const guaranteedRevenuePattern = SPARK_CHAT_KNOWLEDGE.compositeMetrics.guaranteedRevenue.pattern;
  if (guaranteedRevenuePattern.test(normalizeSparkChatText(question))) {
    const subquestions = sparkGuaranteedRevenueSubquestions(question);
    const invoiceQuestion = subquestions.invoices;
    const orderQuestion = subquestions.orders;
    const invoiceResult = await executeSparkChatQuery(invoiceQuestion, apiKey, []);
    const orderResult = await executeSparkChatQuery(orderQuestion, apiKey, []);
    if (invoiceResult.kind !== "metric" || orderResult.kind !== "metric") throw new SparkChatStageError("guaranteed revenue", "Garanti gelir bileşenleri metric üretmedi");
    const value = invoiceResult.value + orderResult.value;
    const queriedAt = new Date().toISOString();
    const period = invoiceResult.interpretation.split(" · ")[1] ?? "Aynı dönem";
    return {
      kind: "breakdown" as const,
      title: SPARK_CHAT_KNOWLEDGE.compositeMetrics.guaranteedRevenue.label,
      groupLabel: "Gelir bileşeni",
      items: [
        { key: "invoiced", label: "Faturalanan", value: invoiceResult.value, formattedValue: formatMetric(invoiceResult.value, amountProperties.invoices), recordCount: invoiceResult.recordCount },
        { key: "orders", label: "Açık order", value: orderResult.value, formattedValue: formatMetric(orderResult.value, amountProperties.orders), recordCount: orderResult.recordCount },
      ],
      summary: `Garanti gelir ${formatMetric(value, amountProperties.invoices)}: faturalanan ${invoiceResult.formattedValue} + açık order ${orderResult.formattedValue}.`,
      recordCount: invoiceResult.recordCount + orderResult.recordCount,
      interpretation: `Fatura + açık order · ${period} · Toplam USD tutarı`,
      queryContext: { ...invoiceResult.queryContext, metricKind: "guaranteed_revenue" as const },
      queriedAt,
      source: "live_hubspot" as const,
    };
  }
  const [dealCatalog, invoiceCatalog, orderCatalog] = await stage("catalog", () => Promise.all([
    fetchHubSpotPropertyCatalog("deals"), fetchHubSpotPropertyCatalog("invoices"), fetchHubSpotPropertyCatalog("orders"),
  ]));
  const catalogs: Record<ObjectType, HubSpotProperty[]> = { deals: dealCatalog, invoices: invoiceCatalog, orders: orderCatalog };
  const plan = await stage("planner", async () => {
    const models = ["openai/gpt-oss-20b", "llama-3.1-8b-instant", "openai/gpt-oss-120b"];
    let lastError: unknown;
    for (let index = 0; index < models.length; index += 1) {
      try { return await createPlan(question, catalogs, apiKey, context, models[index], index > 0); }
      catch (error) { lastError = error; }
    }
    throw lastError;
  });
  if (plan.responseType === "text") {
    return {
      kind: "text" as const,
      title: plan.title,
      text: plan.answer ?? "Bu konuda doğrulanmış Spark veri sözleşmesinde yeterli bilgi bulunmuyor.",
      queriedAt: new Date().toISOString(),
      source: "planner_knowledge" as const,
    };
  }
  const valid = new Set(catalogs[plan.object].map((property) => property.name));
  const filterProperties = [...plan.filters, ...plan.associatedDealFilters].map((filter) => filter.property).filter((property) => !property.startsWith("_"));
  const selected = Array.from(new Set([...requiredProperties[plan.object], ...plan.properties, ...filterProperties, plan.aggregate?.property, plan.groupBy, plan.sort?.property]
    .filter((property): property is string => Boolean(property) && valid.has(property!))));

  const [rows, owners, dealStages, orderStages] = await stage("records", () => Promise.all([
    fetchHubSpotObjects(plan.object, selected), fetchHubSpotOwners(), fetchHubSpotStages("deals"), fetchHubSpotStages("orders"),
  ]));
  const resolvedPlan = resolveOwnerFilters(plan, owners);
  const stages = resolvedPlan.object === "deals" ? dealStages : resolvedPlan.object === "orders" ? orderStages : new Map();
  let flattenedRows = rows.map((row) => flatten(resolvedPlan.object, row, owners, stages));
  const needsCompany = resolvedPlan.responseType === "records"
    || resolvedPlan.properties.includes("_company_name")
    || resolvedPlan.filters.some((filter) => filter.property === "_company_name")
    || resolvedPlan.groupBy === "_company_name";
  if (needsCompany) {
    const ids = flattenedRows.map((row) => row._id);
    const companyAssociations = await stage("customer company associations", () => fetchHubSpotAssociations(resolvedPlan.object, ids, "companies"));
    const companyIds = Array.from(new Set(Array.from(companyAssociations.values()).flat()));
    const companies = await stage("customer companies", () => fetchHubSpotObjectsByIds("companies", companyIds, ["name"]));
    const companyNames = new Map(companies.map((company) => [company.id, company.properties.name ?? ""]));
    let orderDealAssociations = new Map<string, string[]>();
    let dealNames = new Map<string, string>();
    if (resolvedPlan.object === "orders") {
      orderDealAssociations = await stage("customer deal associations", () => fetchHubSpotAssociations("orders", ids));
      const dealIds = Array.from(new Set(Array.from(orderDealAssociations.values()).flat()));
      const deals = await stage("customer deals", () => fetchHubSpotObjectsByIds("deals", dealIds, ["dealname"]));
      dealNames = new Map(deals.map((deal) => [deal.id, deal.properties.dealname ?? ""]));
    }
    flattenedRows = flattenedRows.map((row) => ({
      ...row,
      _company_name: (companyAssociations.get(row._id) ?? []).map((companyId) => companyNames.get(companyId)).filter(Boolean).join(" | ")
        || (resolvedPlan.object === "orders"
          ? (orderDealAssociations.get(row._id) ?? []).map((dealId) => dealNames.get(dealId)).filter(Boolean).join(" | ") || row.hs_order_name
          : row._company_name),
    }));
  }
  let filtered = flattenedRows.filter((row) => resolvedPlan.filters.every((filter) => sparkChatMatchesFilter(row, filter)));

  if (resolvedPlan.associatedDealFilters.length && resolvedPlan.object !== "deals") {
    const associatedObject: "invoices" | "orders" = resolvedPlan.object;
    const dealProperties = Array.from(new Set([...requiredProperties.deals, ...resolvedPlan.associatedDealFilters.map((filter) => filter.property).filter((property) => !property.startsWith("_"))]));
    const associations = await stage("associations", () => fetchHubSpotAssociations(associatedObject, filtered.map((row) => row._id)));
    const dealIds = Array.from(new Set(Array.from(associations.values()).flat()));
    const deals = await stage("associated deals", () => fetchHubSpotObjectsByIds("deals", dealIds, dealProperties));
    const allowedDeals = new Set(deals.map((row) => flatten("deals", row, owners, dealStages)).filter((row) => resolvedPlan.associatedDealFilters.every((filter) => sparkChatMatchesFilter(row, filter))).map((row) => row._id));
    filtered = filtered.filter((row) => (associations.get(row._id) ?? []).some((dealId) => allowedDeals.has(dealId)));
  }

  if (resolvedPlan.sort) {
    filtered.sort((a, b) => {
      const left = sparkChatComparableValue(a[resolvedPlan.sort!.property]);
      const right = sparkChatComparableValue(b[resolvedPlan.sort!.property]);
      const result = left < right ? -1 : left > right ? 1 : 0;
      return resolvedPlan.sort!.direction === "asc" ? result : -result;
    });
  }

  const queriedAt = new Date().toISOString();
  const planInterpretation = interpretation(resolvedPlan, catalogs[resolvedPlan.object]);
  const compactQuery = queryContext(resolvedPlan);
  if (resolvedPlan.responseType === "metric") {
    const operation = resolvedPlan.aggregate?.operation ?? "count";
    const property = resolvedPlan.aggregate?.property;
    if (resolvedPlan.groupBy) {
      const groupFilter = resolvedPlan.filters.find((filter) => filter.property === resolvedPlan.groupBy && ["eq", "in"].includes(filter.operator));
      const requestedGroups = groupFilter?.operator === "in" ? groupFilter.values ?? [] : groupFilter?.value ? [groupFilter.value] : [];
      const defaultGroups = resolvedPlan.groupBy === "_revenue_group" ? ["license", "service"] : [];
      const multiValueGroup = SPARK_CHAT_KNOWLEDGE.filterContracts.multiValueProperties.includes(resolvedPlan.groupBy as "vendor_name" | "revenue_type");
      const discoveredGroups = filtered.flatMap((row) => {
        const values = multiValueGroup ? sparkMultiValueTokens(row[resolvedPlan.groupBy!]) : [row[resolvedPlan.groupBy!] ?? ""];
        return values.length ? values : [""];
      });
      const groupValues = requestedGroups.length ? requestedGroups : defaultGroups.length ? defaultGroups : Array.from(new Set(discoveredGroups));
      const items = groupValues.map((groupValue) => {
        const groupRows = filtered.filter((row) => sparkChatMatchesFilter(row, { property: resolvedPlan.groupBy!, operator: "eq", value: groupValue }));
        const metric = aggregateRows(groupRows, operation, property);
        return { key: groupValue, label: sparkBreakdownValueLabel(groupValue), ...metric, formattedValue: formatMetric(metric.value, property) };
      });
      const ranked = [...items].sort((a, b) => b.value - a.value);
      const difference = ranked.length >= 2 ? Math.abs(ranked[0].value - ranked[1].value) : 0;
      const summary = ranked.length >= 2
        ? difference === 0
          ? `${ranked[0].label} ve ${ranked[1].label} sonuçları ${ranked[0].formattedValue} ile eşit.`
          : `${ranked[0].label} ${ranked[0].formattedValue}, ${ranked[1].label} ${ranked[1].formattedValue}. ${ranked[0].label}, ${formatMetric(difference, property)} daha yüksek.`
        : ranked.length === 1 ? `${ranked[0].label} sonucu ${ranked[0].formattedValue}.` : "Bu kırılımda eşleşen kayıt bulunamadı.";
      return { kind: "breakdown" as const, title: resolvedPlan.title, groupLabel: labelMap(catalogs[resolvedPlan.object]).get(resolvedPlan.groupBy) ?? resolvedPlan.groupBy, items, summary, recordCount: filtered.length, interpretation: planInterpretation, queryContext: compactQuery, queriedAt, source: "live_hubspot" as const };
    }
    const { value, recordCount } = aggregateRows(filtered, operation, property);
    return { kind: "metric" as const, title: resolvedPlan.title, value, formattedValue: formatMetric(value, property), recordCount, interpretation: planInterpretation, queryContext: compactQuery, queriedAt, source: "live_hubspot" as const };
  }

  const labels = labelMap(catalogs[resolvedPlan.object]);
  const internalDisplayFields = new Set(["hubspot_owner_id", "dealstage", "hs_pipeline_stage"]);
  const fields = Array.from(new Set([...coreFields(resolvedPlan.object), ...resolvedPlan.properties])).filter((property) => !internalDisplayFields.has(property) && (valid.has(property) || property.startsWith("_")));
  const shown = filtered.slice(0, resolvedPlan.limit);
  return {
    kind: "records" as const,
    title: resolvedPlan.title,
    objectLabel: objectNames[resolvedPlan.object],
    totalRecords: filtered.length,
    shownRecords: shown.length,
    interpretation: planInterpretation,
    queryContext: compactQuery,
    columns: fields.map((key) => ({ key, label: labels.get(key) ?? key, format: key.includes("amount") ? "currency" : key.includes("date") ? "date" : "text" })),
    records: shown.map((row) => ({ id: row._id, url: row._url, values: Object.fromEntries(fields.map((field) => [field, row[field] ?? ""])) })),
    queriedAt,
    source: "live_hubspot" as const,
  };
}
