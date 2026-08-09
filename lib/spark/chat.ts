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
  deals: ["dealname", "dealstage", "createdate", "closedate", "amount_in_home_currency", "hs_is_closed_won", "dealtype", "country", "vendor_name", "revenue_type", "ereteam_domain", "hubspot_owner_id"],
  invoices: ["hs_number", "invoice_name", "hs_invoice_latest_company_name", "hs_invoice_date", "hs_amount_billed_in_company_currency", "country", "vendor_name", "revenue_type", "ereteam_domain", "hubspot_owner_id"],
  orders: ["hs_order_name", "hs_pipeline_stage", "hs_processed_date", "hs_homecurrency_amount", "country", "vendor_name", "revenue_type", "ereteam_domain", "hubspot_owner_id"],
};

const objectNames: Record<ObjectType, string> = { deals: "Deal", invoices: "Fatura", orders: "Order" };
const dateProperties: Record<ObjectType, string> = { deals: "closedate", invoices: "hs_invoice_date", orders: "hs_processed_date" };
const amountProperties: Record<ObjectType, string> = { deals: "amount_in_home_currency", invoices: "hs_amount_billed_in_company_currency", orders: "hs_homecurrency_amount" };

type QueryPlan = z.infer<typeof planSchema>;
export type SparkChatQueryContext = Pick<QueryPlan, "object" | "filters" | "associatedDealFilters" | "aggregate">;
export type SparkChatContextItem = {
  question: string;
  result: ({ kind: "metric"; title: string; value: string; recordCount: number } | { kind: "records"; title: string; recordCount: number; objectLabel: string }) & { queryContext?: SparkChatQueryContext };
};
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
  return normalized(value).normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/ı/g, "i");
}

export function resolveSparkDateRange(question: string, now = new Date()): DateRange | null {
  const text = semanticText(question);
  const { year, month, day } = dateParts(now);
  const previousMonthYear = month === 1 ? year - 1 : year;
  const previousMonth = month === 1 ? 12 : month - 1;

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
  return null;
}

function explicitObject(question: string): ObjectType | null {
  const text = semanticText(question);
  if (/\bbeklenen\s+fatura/.test(text) || /\b(open|acik)\s+order\b/.test(text)) return "orders";
  if (/\b(fatura|faturalan|invoice)/.test(text)) return "invoices";
  if (/\b(order|siparis)/.test(text)) return "orders";
  if (/\b(deal|firsat|pipeline|won|lost)/.test(text)) return "deals";
  return null;
}

function explicitCountry(question: string): "Turkiye" | "USA" | null {
  const text = semanticText(question);
  if (/\b(turkiye|turkey)/.test(text)) return "Turkiye";
  if (/\b(amerika|abd|usa|united\s+states)/.test(text)) return "USA";
  return null;
}

const revenueTypes: Record<ObjectType, string[]> = {
  deals: ["License", "SNS", "Outsource", "Project", "Engineering", "Cloud", "Assessment", "Training", "Maintenance & Support"],
  invoices: ["Cloud", "License", "Outsource", "Project", "SNS", "Training", "Maintenance & Support", "Eski_Backlog"],
  orders: ["Cloud", "License", "Outsource", "Project", "SNS", "Training", "Maintenance & Support", "Engineering", "Eski_Backlog"],
};

const revenueTypeAliases: Array<[RegExp, string]> = [
  [/\bsns\b/, "SNS"],
  [/\b(outsource|dis\s+kaynak)\b/, "Outsource"],
  [/\b(proje|project)\b/, "Project"],
  [/\b(engineering|muhendislik)\b/, "Engineering"],
  [/\bcloud\b/, "Cloud"],
  [/\b(assessment|degerlendirme)\b/, "Assessment"],
  [/\b(training|egitim)\b/, "Training"],
  [/\b(maintenance|support|bakim|destek)\b/, "Maintenance & Support"],
  [/\b(eski[ _-]?backlog)\b/, "Eski_Backlog"],
];

type RevenueIntent = { kind: "exact"; value: string } | { kind: "license" } | { kind: "service" };

function explicitRevenueIntent(question: string): RevenueIntent | null {
  const text = semanticText(question);
  if (/\blisans\s+gelir/.test(text)) return { kind: "license" };
  if (/\b(servis|danismanlik)\b/.test(text)) return { kind: "service" };
  if (/\b(lisans|license)\b/.test(text)) return { kind: "exact", value: "License" };
  const match = revenueTypeAliases.find(([pattern]) => pattern.test(text));
  return match ? { kind: "exact", value: match[1] } : null;
}

const vendorValues: Record<ObjectType, string[]> = {
  deals: ["Alterian", "Alteryx", "Apparo", "AtScale", "AWS", "DataRobot", "DigiEye", "Ereteam", "HCL", "IBM", "Insider", "Metrica", "Microsoft", "Qualytics", "Salesforce", "Snowflake", "Theobald"],
  invoices: ["Alteryx", "Apparo", "AWS", "Datarobot", "Digieye", "Ereteam", "HCL", "IBM", "LOCATIONBOX", "Macrosoft", "Metrica", "Qlik", "Qualytics", "Salesforce", "Snowflake", "TechData", "Theobald", "ZASLOGIC"],
  orders: ["Alteryx", "Apparo", "AWS", "DataRobot", "DigiEye", "Ereteam", "HCL", "IBM", "Qualitics", "Salesforce", "Snowflake", "Theobald"],
};

function explicitVendor(question: string, object: ObjectType) {
  const text = semanticText(question);
  if (!/\b(vendor|satici|uretici)\b/.test(text)) return null;
  return vendorValues[object].find((value) => text.includes(semanticText(value))) ?? null;
}

function explicitEreteamDomain(question: string) {
  const text = semanticText(question);
  if (/\b(dc\s*&?\s*ai|data\s*,?\s*cloud\s*&?\s*ai|data\s+(isi|uzmanlik|domain)|veri\s+(isi|uzmanlik|domain))\b/.test(text)) return "Data, Cloud & AI (DC&AI)";
  if (/\b(ep|enterprise\s+planning|finans\s+(isi|uzmanlik|domain)|financial\s+(planning|domain))\b/.test(text)) return "Enterprise Planning (EP)";
  if (/\b(im|intelligent\s+martech|martech|marketing\s+(isi|uzmanlik|domain)|pazarlama\s+(isi|uzmanlik|domain))\b/.test(text)) return "Intelligent MarTech (IM)";
  return null;
}

function uniqueFilters(filters: QueryPlan["filters"]) {
  return Array.from(new Map(filters.map((filter) => [JSON.stringify(filter), filter])).values());
}

export function applySparkQueryGuardrails(plan: QueryPlan, question: string, now = new Date(), context: SparkChatContextItem[] = []): QueryPlan {
  const text = semanticText(question);
  const explicit = explicitObject(question);
  const country = explicitCountry(question);
  const revenueIntent = explicitRevenueIntent(question);
  const domain = explicitEreteamDomain(question);
  const previous = context.at(-1)?.result.queryContext;
  const range = resolveSparkDateRange(question, now);
  const referencesPrevious = /\b(peki|bunlar|bunlarin|onlar|onlarin|ayni)\b/.test(text)
    || /^(toplami|tutari|kac(\s+tane(si)?)?|detaylari|listele|goster)[?!.]*$/.test(text)
    || Boolean(range || country || revenueIntent || domain || /\b(vendor|satici|uretici|yeni\s+is|mevcut\s+is)\b/.test(text));
  const followsPrevious = Boolean(!explicit && previous && referencesPrevious);
  const object = explicit ?? (followsPrevious ? previous!.object : plan.object);
  const vendor = explicitVendor(question, object);
  const asksAverage = /\bortalama\b/.test(text);
  const asksCount = /\b(kac|sayi|adet)/.test(text) && !/\bne\s+kadar\b/.test(text);
  const asksAmount = /\b(ne\s+kadar|tutar|toplam|ciro)/.test(text);
  const asksRecords = /\b(hangi|liste|goster|detay|kayit)/.test(text) && !asksAmount && !asksCount && !asksAverage;

  let responseType = plan.responseType;
  let aggregate = plan.aggregate;
  if (asksRecords) {
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

  let filters = [...plan.filters];
  let associatedDealFilters = [...plan.associatedDealFilters];
  if (followsPrevious && previous) {
    const previousNonDate = previous.filters.filter((filter) => !Object.values(dateProperties).includes(filter.property));
    const plannedNonDate = filters.filter((filter) => !Object.values(dateProperties).includes(filter.property));
    if (/\b(bunlar|bunlarin|onlar|onlarin|ayni)\b/.test(text)) {
      filters = range ? uniqueFilters([...previousNonDate, ...plannedNonDate]) : previous.filters;
      associatedDealFilters = previous.associatedDealFilters;
    } else if (range) {
      filters = uniqueFilters([...previousNonDate, ...plannedNonDate]);
      associatedDealFilters = previous.associatedDealFilters;
    } else if (country || vendor || revenueIntent || domain || /\b(yeni\s+is|mevcut\s+is)\b/.test(text)) {
      const changedProperties = new Set([
        country && "country", vendor && "vendor_name", revenueIntent && "revenue_type",
        domain && "ereteam_domain",
        object === "deals" && /\b(yeni\s+is|mevcut\s+is)\b/.test(text) && "dealtype",
      ].filter(Boolean));
      const previousUnchanged = previous.filters.filter((filter) => !changedProperties.has(filter.property));
      const plannedUnchanged = filters.filter((filter) => !changedProperties.has(filter.property));
      filters = uniqueFilters([...previousUnchanged, ...plannedUnchanged]);
      associatedDealFilters = previous.associatedDealFilters;
    }
  }
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
  if (object === "orders" && /\bbeklenen\s+fatura/.test(text)) {
    filters = filters.filter((filter) => filter.property !== "_stage_label");
    filters.push({ property: "_stage_label", operator: "eq", value: "Open" });
  }
  if (object === "deals") {
    if (/\b(pipeline|aktif|acik\s+firsat)/.test(text)) {
      filters = filters.filter((filter) => filter.property !== "_stage_label");
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
  if (object !== "deals" && /\bnew\s+business\b/.test(text)) {
    associatedDealFilters = associatedDealFilters.filter((filter) => !["dealtype", "_stage_label"].includes(filter.property));
    associatedDealFilters.push(
      { property: "dealtype", operator: "eq", value: "newbusiness" },
      { property: "_stage_label", operator: "contains", value: "won" },
    );
  }
  if (country) {
    filters = filters.filter((filter) => filter.property !== "country");
    filters.push({ property: "country", operator: "eq", value: country });
  }
  if (vendor) {
    filters = filters.filter((filter) => filter.property !== "vendor_name");
    filters.push({ property: "vendor_name", operator: "eq", value: vendor });
  }
  if (revenueIntent) {
    filters = filters.filter((filter) => filter.property !== "revenue_type");
    let values: string[];
    if (revenueIntent.kind === "license") values = ["License", "SNS"];
    else if (revenueIntent.kind === "service") values = revenueTypes[object].filter((value) => !["License", "SNS"].includes(value));
    else values = [revenueIntent.value];
    filters.push(values.length === 1
      ? { property: "revenue_type", operator: "eq", value: values[0] }
      : { property: "revenue_type", operator: "in", values });
  }
  if (domain) {
    filters = filters.filter((filter) => filter.property !== "ereteam_domain");
    filters.push({ property: "ereteam_domain", operator: "eq", value: domain });
  }
  if (object === "deals" && /\b(yeni\s+is|new\s+business)\b/.test(text)) {
    filters = filters.filter((filter) => filter.property !== "dealtype");
    filters.push({ property: "dealtype", operator: "eq", value: "newbusiness" });
  } else if (object === "deals" && /\b(mevcut\s+is|existing\s+business)\b/.test(text)) {
    filters = filters.filter((filter) => filter.property !== "dealtype");
    filters.push({ property: "dealtype", operator: "eq", value: "existingbusiness" });
  }

  const guarded = { ...plan, object, responseType, aggregate, filters: uniqueFilters(filters), associatedDealFilters };
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
    return query ? [...query.filters, ...query.associatedDealFilters].map((filter) => filter.property).concat(query.aggregate?.property ?? []) : [];
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
- Order tarihi yalnızca hs_processed_date, USD tutarı yalnızca hs_homecurrency_amount.
- Fatura tarihi yalnızca hs_invoice_date, USD tutarı yalnızca hs_amount_billed_in_company_currency.
- Deal USD tutarı yalnızca amount_in_home_currency; deal tarih bağlamına göre closedate veya createdate.
- Genel amount, TL tutarı veya başka para birimi property'lerini kullanma.
- "Beklenen fatura" henüz kesilmemiş, ilgili dönem tarihli açık order demektir: object orders, tarih hs_processed_date, tutar hs_homecurrency_amount, stage _stage_label eq Open.
- "Faturalanan/kesilen fatura" object invoices demektir.
- "Aktif pipeline/açık fırsat" Closed Won ve Closed Lost olmayan deal kayıtlarıdır. Won/Lost sorularında closedate kullan.
- Fatura veya order için "New Business" deniyorsa bağlı deal üzerinde dealtype eq newbusiness ve Closed Won filtresini associatedDealFilters ile birlikte uygula.
- Ülke property adı country, geçerli enum değerleri yalnızca Turkiye ve USA. Türkiye/Turkey -> Turkiye; Amerika/ABD/USA/United States -> USA.
- Vendor sorularında tüm nesnelerde yalnızca vendor_name kullan.
- Deal için yeni iş/New Business -> dealtype eq newbusiness; mevcut iş/Existing Business -> dealtype eq existingbusiness.
- Revenue Type tüm nesnelerde revenue_type alanıdır. Belirli tip sorularında enum değerini kullan. Genel "lisans geliri" License veya SNS; genel "servis/danışmanlık geliri" License ve SNS dışındaki tiplerdir.
- Ereteam uzmanlık alanı tüm nesnelerde ereteam_domain alanıdır: data/veri işi -> Data, Cloud & AI (DC&AI); finans işi -> Enterprise Planning (EP); marketing/pazarlama işi -> Intelligent MarTech (IM).
- Kullanıcının istediği hiçbir dönem, owner, stage, tür veya bağlantı filtresini sessizce atlama. Katalogda olmayan property uydurma.
Yalnızca JSON döndür. Şema:
{"responseType":"metric|records","title":"kısa Türkçe başlık","object":"deals|invoices|orders","properties":[],"filters":[{"property":"","operator":"eq|neq|contains|not_contains|gt|gte|lt|lte|between|in|is_empty|not_empty","value":"","values":[]}],"associatedDealFilters":[],"aggregate":{"operation":"sum|count|average","property":""},"sort":{"property":"","direction":"asc|desc"},"limit":50}.
Tek bir sayı/değer soruluyorsa metric, kayıtlar veya detaylar isteniyorsa records seç. Metric için aggregate zorunlu. Tutar toplamında sum kullan.
Sanal alanlar: _stage_label ve _owner_name filtrelenebilir. Tarih değerlerini YYYY-MM-DD yaz. "Bu ay", "geçen ay", "bu yıl", "geçen yıl", "bugün", "dün" ve "son 7/30 gün" ifadelerinde tam takvim aralığını uygula; tarih filtresini asla atlama.
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
  const responseAliases: Record<string, "metric" | "records"> = {
    metric: "metric", metrics: "metric", value: "metric", number: "metric", single_value: "metric",
    records: "records", record: "records", list: "records", table: "records", details: "records",
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
  if (raw.responseType === "records") raw.aggregate = null;
  if (raw.responseType === "metric") {
    const operationAliases: Record<string, "sum" | "count" | "average"> = { sum: "sum", total: "sum", count: "count", average: "average", avg: "average" };
    if (raw.aggregate?.operation) raw.aggregate.operation = operationAliases[String(raw.aggregate.operation).toLowerCase()];
  }
  raw.limit = Math.min(100, Math.max(1, Number(raw.limit) || 50));
  raw.title = String(raw.title || "HubSpot canlı sonucu").slice(0, 100);
  const plan = applySparkQueryGuardrails(planSchema.parse(raw), question, new Date(), context);
  if (plan.responseType === "metric" && !plan.aggregate) throw new Error("Metric sorgusunda hesaplama eksik");
  const virtualProperties = plan.object === "invoices" ? ["_owner_name"] : ["_owner_name", "_stage_label"];
  const objectFilterProperties = new Set([...catalogs[plan.object].map((property) => property.name), ...virtualProperties]);
  const dealFilterProperties = new Set([...catalogs.deals.map((property) => property.name), "_owner_name", "_stage_label"]);
  const invalidFilter = plan.filters.find((filter) => !objectFilterProperties.has(filter.property));
  const invalidDealFilter = plan.associatedDealFilters.find((filter) => !dealFilterProperties.has(filter.property));
  const invalidProperty = plan.properties.find((property) => !objectFilterProperties.has(property));
  const invalidSort = plan.sort && !objectFilterProperties.has(plan.sort.property) ? plan.sort.property : null;
  const invalidAggregate = plan.aggregate?.property && !objectFilterProperties.has(plan.aggregate.property) ? plan.aggregate.property : null;
  if (invalidFilter || invalidDealFilter || invalidProperty || invalidSort || invalidAggregate) {
    throw new Error(`Geçersiz sorgu alanı: ${invalidFilter?.property ?? invalidDealFilter?.property ?? invalidProperty ?? invalidSort ?? invalidAggregate}`);
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
  labels.set("country", "Ülke");
  labels.set("vendor_name", "Vendor");
  labels.set("revenue_type", "Revenue Type");
  labels.set("dealtype", "İş tipi");
  labels.set("ereteam_domain", "Ereteam Domain");
  return labels;
}

function coreFields(type: ObjectType) {
  if (type === "deals") return ["dealname", "closedate", "amount_in_home_currency", "country", "vendor_name", "revenue_type", "ereteam_domain", "dealtype", "_owner_name", "_stage_label"];
  if (type === "invoices") return ["hs_number", "invoice_name", "hs_invoice_latest_company_name", "hs_invoice_date", "hs_amount_billed_in_company_currency", "country", "vendor_name", "revenue_type", "ereteam_domain", "_owner_name"];
  return ["hs_order_name", "hs_processed_date", "hs_homecurrency_amount", "country", "vendor_name", "revenue_type", "ereteam_domain", "_owner_name", "_stage_label"];
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
  const otherFilters = plan.filters
    .filter((filter) => filter.property !== dateProperty)
    .slice(0, 3)
    .map((filter) => `${labels.get(filter.property) ?? filter.property}: ${filter.value ?? filter.values?.join(", ") ?? filter.operator}`);
  if (plan.associatedDealFilters.length) otherFilters.push("Bağlı deal filtresi uygulandı");
  return [objectNames[plan.object], period, measure, ...otherFilters].join(" · ");
}

export async function executeSparkChatQuery(question: string, apiKey: string, context: SparkChatContextItem[] = []) {
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
  const planInterpretation = interpretation(plan, catalogs[plan.object]);
  const compactQuery = queryContext(plan);
  if (plan.responseType === "metric") {
    const operation = plan.aggregate?.operation ?? "count";
    const property = plan.aggregate?.property;
    const values = property ? filtered.flatMap((row) => {
      const raw = row[property];
      const numeric = Number(raw);
      return raw?.trim() && Number.isFinite(numeric) ? [numeric] : [];
    }) : [];
    const value = operation === "count" ? filtered.length : operation === "average" ? (values.reduce((sum, item) => sum + item, 0) / Math.max(values.length, 1)) : values.reduce((sum, item) => sum + item, 0);
    const recordCount = operation === "count" ? filtered.length : values.length;
    return { kind: "metric" as const, title: plan.title, value, formattedValue: formatMetric(value, property), recordCount, interpretation: planInterpretation, queryContext: compactQuery, queriedAt, source: "live_hubspot" as const };
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
    interpretation: planInterpretation,
    queryContext: compactQuery,
    columns: fields.map((key) => ({ key, label: labels.get(key) ?? key, format: key.includes("amount") ? "currency" : key.includes("date") ? "date" : "text" })),
    records: shown.map((row) => ({ id: row._id, url: row._url, values: Object.fromEntries(fields.map((field) => [field, row[field] ?? ""])) })),
    queriedAt,
    source: "live_hubspot" as const,
  };
}
