import assert from "node:assert/strict";
import { applyLiveCatalogContracts, applySparkQueryGuardrails, normalizeSparkPlanProperties, resolveSparkDateRange, resolveSparkOwnerFilter, resolveSparkOwnerName, sparkChatComparableValue, sparkChatMatchesFilter, sparkQueryPlanJsonSchema } from "../lib/spark/chat";
import { SPARK_CHAT_KNOWLEDGE, canonicalSparkCountry, detectSparkCompanyName, detectSparkCompositeRevenueMetric, detectSparkCountries, detectSparkDashboardMetric, sparkRevenueGroup, sparkUnsupportedQuestionAnswer, type SparkObjectType } from "../lib/spark/chatKnowledge";
import { hubspotDealState, isHubSpotOpenOrder, isIncludedInvoice, validateInvoiceStatusProperty, type HubSpotObject, type StageMap } from "../lib/spark/hubspot";

const amountProperties: Record<SparkObjectType, string> = {
  deals: "amount_in_home_currency",
  invoices: "hs_amount_billed_in_company_currency",
  orders: "hs_homecurrency_amount",
};

assert.equal(sparkQueryPlanJsonSchema.additionalProperties, false);
assert.deepEqual(sparkQueryPlanJsonSchema.required, Object.keys(sparkQueryPlanJsonSchema.properties));
assert.equal(sparkQueryPlanJsonSchema.properties.filters.items.additionalProperties, false);
assert.deepEqual(sparkQueryPlanJsonSchema.properties.filters.items.required, ["property", "operator", "value", "values"]);
assert.deepEqual(normalizeSparkPlanProperties({ items: ["hs_invoice_date", "hubspot_owner_id"] }), ["hs_invoice_date", "hubspot_owner_id"]);
assert.throws(() => normalizeSparkPlanProperties({ values: ["hs_invoice_date"] }), /Property listesi geçersiz/);

const recoveredExpectedDetails = applySparkQueryGuardrails({
  responseType: "metric",
  title: "Bu ay beklenen faturaların toplamı",
  object: "invoices",
  metricKind: "expected_revenue",
  properties: ["hs_invoice_date", "hs_amount_billed_in_company_currency"],
  filters: [],
  associatedDealFilters: [],
  aggregate: { operation: "sum", property: "hs_amount_billed_in_company_currency" },
  groupBy: null,
  answer: null,
  sort: null,
  limit: 100,
}, "Bu ay beklenen faturaların detaylarını göster", new Date("2026-08-15T12:00:00Z"), []);
assert.equal(recoveredExpectedDetails.object, "orders");
assert.equal(recoveredExpectedDetails.responseType, "records");
assert.deepEqual(recoveredExpectedDetails.properties, []);
assert.equal(recoveredExpectedDetails.metricKind, null);
assert.equal(recoveredExpectedDetails.filters.find((filter) => filter.property === "_is_open")?.value, "true");

assert.equal(sparkChatComparableValue("2027-01-01"), Date.parse("2026-12-31T21:00:00Z"), "İstanbul takvim günü UTC sınırı yanlış");
assert.ok(sparkChatComparableValue("2026-12-31T21:00:00Z") >= sparkChatComparableValue("2027-01-01"), "1 Ocak İstanbul kaydı 2026 aralığına girmemeli");

for (const testCase of SPARK_CHAT_KNOWLEDGE.ownerMatching.regressionCases) {
  assert.equal(resolveSparkOwnerName(testCase.input, testCase.owners), testCase.expected, `${testCase.input}: owner eşleşmesi yanlış`);
}
assert.deepEqual(
  resolveSparkOwnerFilter({ property: "_owner_name", operator: "eq", value: "Selda" }, ["Kerem Arıtürk", "Selda Kaygusuz"]),
  { property: "_owner_name", operator: "eq", value: "Selda Kaygusuz" },
  "Owner filtresi canlı tam ada çevrilmeli",
);
assert.deepEqual(resolveSparkDateRange("2026 yılının ilk yarısı", new Date("2026-08-10T12:00:00Z")), { start: "2026-01-01", endExclusive: "2026-07-01", label: "2026 ilk yarı" });
assert.deepEqual(resolveSparkDateRange("2026 ilk yarısının toplamı", new Date("2026-08-14T12:00:00Z")), { start: "2026-01-01", endExclusive: "2026-07-01", label: "2026 ilk yarı" });
assert.deepEqual(resolveSparkDateRange("2026 ilkyarısının toplamı", new Date("2026-08-14T12:00:00Z")), { start: "2026-01-01", endExclusive: "2026-07-01", label: "2026 ilk yarı" });
assert.deepEqual(resolveSparkDateRange("H2 2026", new Date("2026-08-10T12:00:00Z")), { start: "2026-07-01", endExclusive: "2027-01-01", label: "2026 ikinci yarı" });
assert.deepEqual(resolveSparkDateRange("2026 yılının ilk çeyreği", new Date("2026-08-10T12:00:00Z")), { start: "2026-01-01", endExclusive: "2026-04-01", label: "2026 1. çeyrek" });
assert.deepEqual(resolveSparkDateRange("2026 Q4", new Date("2026-08-10T12:00:00Z")), { start: "2026-10-01", endExclusive: "2027-01-01", label: "2026 4. çeyrek" });
assert.deepEqual(resolveSparkDateRange("Bu ay sonuna kadar", new Date("2026-08-14T12:00:00Z")), { start: "2026-08-01", endExclusive: "2026-09-01", label: "Bu ay" });
assert.deepEqual(resolveSparkDateRange("YTD faturalar", new Date("2026-08-14T12:00:00Z")), { start: "2026-01-01", endExclusive: "2026-08-15", label: "Yılbaşından bugüne" });
assert.deepEqual(resolveSparkDateRange("MTD faturalar", new Date("2026-08-14T12:00:00Z")), { start: "2026-08-01", endExclusive: "2026-08-15", label: "Aybaşından bugüne" });
assert.deepEqual(resolveSparkDateRange("Bu hafta açılan fırsatlar", new Date("2026-08-14T12:00:00Z")), { start: "2026-08-10", endExclusive: "2026-08-15", label: "Bu hafta" });
assert.deepEqual(resolveSparkDateRange("Geçen hafta kazanılan fırsatlar", new Date("2026-08-14T12:00:00Z")), { start: "2026-08-03", endExclusive: "2026-08-10", label: "Geçen hafta" });
assert.deepEqual(resolveSparkDateRange("Son 90 gün", new Date("2026-08-14T12:00:00Z")), { start: "2026-05-17", endExclusive: "2026-08-15", label: "Son 90 gün" });
assert.deepEqual(resolveSparkDateRange("Ağustos 2026 faturaları", new Date("2026-09-21T12:00:00Z")), { start: "2026-08-01", endExclusive: "2026-09-01", label: "agustos 2026" });
assert.deepEqual(resolveSparkDateRange("Bu çeyrek pipeline", new Date("2026-08-14T12:00:00Z")), { start: "2026-07-01", endExclusive: "2026-10-01", label: "Bu çeyrek (Q3)" });
assert.deepEqual(resolveSparkDateRange("Önümüzdeki ay order", new Date("2026-12-14T12:00:00Z")), { start: "2027-01-01", endExclusive: "2027-02-01", label: "Gelecek ay" });
assert.equal(canonicalSparkCountry("Türkiye"), "Turkiye");
assert.equal(canonicalSparkCountry("TR"), "Turkiye");
assert.equal(canonicalSparkCountry("United States of America"), "USA");
assert.deepEqual(detectSparkCountries("Türkiyedeki ve ABD'deki faturalar"), ["Turkiye", "USA"]);
assert.equal(detectSparkCompanyName("Migrosa kestiğimiz faturalar"), "migros");
assert.equal(detectSparkCompanyName("2026 yılında Coca Cola'ya kestiğimiz faturalar"), "coca cola");
assert.equal(detectSparkCompanyName("Migros firmasına ait siparişler"), "migros");
assert.equal(detectSparkCompanyName("Partneri IBM olan faturalar"), null);
assert.equal(sparkChatMatchesFilter({ vendor_name: "Ereteam;IBM" }, { property: "vendor_name", operator: "eq", value: "IBM" }), true);
assert.equal(sparkChatMatchesFilter({ vendor_name: "IBMX" }, { property: "vendor_name", operator: "eq", value: "IBM" }), false);
assert.equal(sparkChatMatchesFilter({ revenue_type: "License;Project" }, { property: "revenue_type", operator: "in", values: ["License", "SNS"] }), true);
assert.equal(sparkChatMatchesFilter({ country: "Türkiye" }, { property: "country", operator: "eq", value: "Turkiye" }), true);
assert.equal(sparkChatMatchesFilter({ country: "TR" }, { property: "country", operator: "in", values: ["Turkiye", "USA"] }), true);
assert.equal(sparkChatMatchesFilter({ country: "United States" }, { property: "country", operator: "eq", value: "USA" }), true);
assert.equal(sparkRevenueGroup("License;Project"), "license;service");
assert.equal(sparkRevenueGroup("Project"), "service");
assert.equal(sparkRevenueGroup(""), "");
assert.equal(isIncludedInvoice({ id: "1", properties: { status: "cancelled" } }), false);
assert.equal(isIncludedInvoice({ id: "2", properties: { status: "invoiced" } }), true);
assert.equal(isIncludedInvoice({ id: "3", properties: {} }), true);
assert.equal(isIncludedInvoice({ id: "4", properties: { status: "Cancelled" } }), true);
assert.equal(isIncludedInvoice({ id: "5", properties: { status: " cancelled " } }), true);
assert.equal(validateInvoiceStatusProperty([{ name: "status", label: "Status", options: [{ label: "Invoiced", value: "invoiced" }, { label: "Cancelled", value: "cancelled" }] }]).name, "status");
assert.throws(() => validateInvoiceStatusProperty([{ name: "hs_invoice_status", label: "Invoice status", options: [] }]), /custom status sözleşmesi/);

const stageMap: StageMap = new Map([
  ["active-tr-label", { label: "Görüşme", probability: 0.5, isClosed: false, displayOrder: 0, pipelineLabel: "Sales" }],
  ["won-tr-label", { label: "Kazanıldı", probability: 1, isClosed: true, displayOrder: 1, pipelineLabel: "Sales" }],
  ["lost-tr-label", { label: "Kapandı", probability: 0, isClosed: true, displayOrder: 2, pipelineLabel: "Sales" }],
  ["cancelled", { label: "Cancelled", probability: 0, isClosed: false, displayOrder: 3, pipelineLabel: "Sales" }],
]);
const object = (dealstage: string, extra: Record<string, string> = {}): HubSpotObject => ({ id: dealstage, properties: { dealstage, ...extra } });
assert.equal(hubspotDealState(object("active-tr-label"), stageMap), "open");
assert.equal(hubspotDealState(object("won-tr-label"), stageMap), "won");
assert.equal(hubspotDealState(object("lost-tr-label"), stageMap), "lost");
assert.equal(hubspotDealState(object("active-tr-label", { hs_is_closed_won: "true" }), stageMap), "won");
assert.equal(isHubSpotOpenOrder({ id: "order", properties: { hs_pipeline_stage: "active-tr-label" } }, stageMap), true);
assert.equal(isHubSpotOpenOrder({ id: "cancelled-order", properties: { hs_pipeline_stage: "cancelled" } }, stageMap), false);
assert.equal(SPARK_CHAT_KNOWLEDGE.compositeMetrics.guaranteedRevenue.pattern.test("2026 toplam garanti gelirim"), true);
assert.equal(detectSparkCompositeRevenueMetric("Bu ay beklenen fatura toplamı nedir?"), "expected_revenue");
assert.equal(detectSparkCompositeRevenueMetric("Bu ay beklenen faturaların toplamı nedir?"), "expected_revenue");
assert.equal(detectSparkCompositeRevenueMetric("Bu ay ne kadar gelir bekliyoruz?"), "expected_revenue");
assert.equal(detectSparkCompositeRevenueMetric("Bu ay beklenen faturaların detaylarını göster"), null);
assert.equal(detectSparkCompositeRevenueMetric("Bu ay kestiğimiz faturalar ne kadar?"), null);
assert.equal(detectSparkCompositeRevenueMetric("Garanti gelir nasıl hesaplanır?"), null);
assert.equal(detectSparkDashboardMetric("Bu yılki revenue hedefimiz ne?"), "annual_target");
assert.equal(detectSparkDashboardMetric("Hedefe ne kadar kalan var?"), "remaining_target");
assert.equal(detectSparkDashboardMetric("Forecast coverage yüzde kaç?"), "forecast_coverage");
assert.equal(detectSparkDashboardMetric("Bu yıl toplam forecast ne kadar?"), "annual_forecast");
assert.match(sparkUnsupportedQuestionAnswer("Faturaların TL karşılığı ne kadar?") ?? "", /USD/);
assert.match(sparkUnsupportedQuestionAnswer("Bu ay kaç toplantı yaptık?") ?? "", /kapsamına dahil değildir/);

const countryPlan = applySparkQueryGuardrails({
  responseType: "metric", title: "Türkiye faturaları", object: "invoices", metricKind: null, properties: [], filters: [], associatedDealFilters: [],
  aggregate: { operation: "sum", property: "hs_amount_billed_in_company_currency" }, groupBy: null, answer: null, sort: null, limit: 50,
}, "Türkiye faturaları ne kadar?", new Date("2026-08-09T12:00:00Z"), []);
const resolvedCountryPlan = applyLiveCatalogContracts(countryPlan, "Türkiye faturaları ne kadar?", {
  deals: [],
  invoices: [{ name: "country", label: "Country", options: [{ label: "Türkiye", value: "TR" }, { label: "United States", value: "US" }] }],
  orders: [],
});
assert.equal(resolvedCountryPlan.filters.find((filter) => filter.property === "country")?.value, "TR", "Türkiye filtresi canlı enum değerine çözülmeli");

const weightedFollowup = applySparkQueryGuardrails({
  responseType: "records", title: "Regresyon testi", object: "invoices", metricKind: null, properties: [], filters: [], associatedDealFilters: [],
  aggregate: null, groupBy: null, answer: null, sort: null, limit: 50,
}, "Türkiye?", new Date("2026-08-09T12:00:00Z"), [{
  question: "Weighted pipeline ne kadar?",
  result: {
    kind: "metric", title: "Weighted pipeline", value: "$1", recordCount: 1,
    queryContext: { object: "deals", filters: [{ property: "_is_open", operator: "eq", value: "true" }], associatedDealFilters: [], aggregate: { operation: "sum", property: "hs_projected_amount_in_home_currency" }, groupBy: null, metricKind: "weighted_pipeline" },
  },
}, {
  question: "Bu nasıl hesaplanıyor?",
  result: { kind: "text", title: "Açıklama", value: "HubSpot projected amount", recordCount: 0 },
}]);
assert.equal(weightedFollowup.object, "deals");
assert.equal(weightedFollowup.metricKind, "weighted_pipeline");
assert.equal(weightedFollowup.aggregate?.property, "hs_projected_amount_in_home_currency");
assert.equal(weightedFollowup.filters.find((filter) => filter.property === "country")?.value, "Turkiye");

for (const testCase of SPARK_CHAT_KNOWLEDGE.regressionCases) {
  const plan = applySparkQueryGuardrails({
    responseType: "records",
    title: "Regresyon testi",
    object: testCase.object,
    metricKind: "plannerMetricKind" in testCase ? testCase.plannerMetricKind : null,
    properties: [],
    filters: "plannerFilters" in testCase ? [...testCase.plannerFilters] : [],
    associatedDealFilters: [],
    aggregate: null,
    sort: null,
    limit: 50,
  }, testCase.question, new Date("2026-08-09T12:00:00Z"), []);

  if ("expectedProperty" in testCase) {
    const filter = plan.filters.find((item) => item.property === testCase.expectedProperty);
    assert.ok(filter, `${testCase.question}: ${testCase.expectedProperty} filtresi eksik`);
    const values = filter.values ?? (filter.value ? [filter.value] : []);
    if ("expectedValues" in testCase) assert.deepEqual([...values].sort(), [...testCase.expectedValues].sort(), `${testCase.question}: filtre değerleri yanlış`);
    if ("excludedValues" in testCase) assert.ok(testCase.excludedValues.every((value) => !values.includes(value)), `${testCase.question}: hariç tutulan revenue type bulundu`);
  }
  if ("expectedResponseType" in testCase) assert.equal(plan.responseType, testCase.expectedResponseType, `${testCase.question}: sonuç tipi yanlış`);
  if ("expectedMetricKind" in testCase) assert.equal(plan.metricKind, testCase.expectedMetricKind, `${testCase.question}: iş metriği yanlış`);
  if ("expectedAggregateProperty" in testCase) assert.equal(plan.aggregate?.property, testCase.expectedAggregateProperty, `${testCase.question}: hesaplama alanı yanlış`);
  if ("expectedAssociatedProperty" in testCase) {
    const filter = plan.associatedDealFilters.find((item) => item.property === testCase.expectedAssociatedProperty);
    assert.ok(filter, `${testCase.question}: bağlı deal ${testCase.expectedAssociatedProperty} filtresi eksik`);
    const values = filter.values ?? (filter.value ? [filter.value] : []);
    if ("expectedAssociatedValues" in testCase) assert.deepEqual([...values].sort(), [...testCase.expectedAssociatedValues].sort(), `${testCase.question}: bağlı deal değerleri yanlış`);
  }
  if ("expectedAssociatedWon" in testCase) assert.equal(plan.associatedDealFilters.find((filter) => filter.property === "_is_won")?.value, "true", `${testCase.question}: bağlı deal won filtresi yanlış`);
  if ("unexpectedProperty" in testCase) assert.ok(!plan.filters.some((filter) => filter.property === testCase.unexpectedProperty), `${testCase.question}: ${testCase.unexpectedProperty} filtresi kullanılmamalı`);
  if ("expectedForbiddenProperties" in testCase) assert.ok(testCase.expectedForbiddenProperties.every((property) => !plan.filters.some((filter) => filter.property === property)), `${testCase.question}: istenmeyen boyut filtresi temizlenmedi`);
  if ("expectedGroupBy" in testCase) assert.equal(plan.groupBy, testCase.expectedGroupBy, `${testCase.question}: kırılım alanı yanlış`);
  if ("expectedFilterProperties" in testCase) assert.ok(testCase.expectedFilterProperties.every((property) => plan.filters.some((filter) => filter.property === property)), `${testCase.question}: zorunlu filtrelerden biri eksik`);
  if ("expectedDateRange" in testCase) {
    const dateProperty = SPARK_CHAT_KNOWLEDGE.objects[testCase.object].dateProperty;
    assert.equal(plan.filters.find((filter) => filter.property === dateProperty && filter.operator === "gte")?.value, testCase.expectedDateRange[0], `${testCase.question}: dönem başlangıcı yanlış`);
    assert.equal(plan.filters.find((filter) => filter.property === dateProperty && filter.operator === "lt")?.value, testCase.expectedDateRange[1], `${testCase.question}: dönem bitişi yanlış`);
  }
  if (/ne\s+kadar/i.test(testCase.question) && !("expectedAggregateProperty" in testCase)) {
    assert.equal(plan.responseType, "metric", `${testCase.question}: metric olmalı`);
    assert.deepEqual(plan.aggregate, { operation: "sum", property: amountProperties[testCase.object] }, `${testCase.question}: tutar alanı yanlış`);
  }
}

console.log(`${SPARK_CHAT_KNOWLEDGE.regressionCases.length} Spark chatbot regresyon senaryosu geçti.`);
