import assert from "node:assert/strict";
import { applySparkQueryGuardrails, resolveSparkDateRange, resolveSparkOwnerFilter, resolveSparkOwnerName, sparkChatComparableValue, sparkChatMatchesFilter } from "../lib/spark/chat";
import { SPARK_CHAT_KNOWLEDGE, detectSparkCompanyName, sparkRevenueGroup, type SparkObjectType } from "../lib/spark/chatKnowledge";

const amountProperties: Record<SparkObjectType, string> = {
  deals: "amount_in_home_currency",
  invoices: "hs_amount_billed_in_company_currency",
  orders: "hs_homecurrency_amount",
};

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
assert.equal(detectSparkCompanyName("Migrosa kestiğimiz faturalar"), "migros");
assert.equal(detectSparkCompanyName("2026 yılında Coca Cola'ya kestiğimiz faturalar"), "coca cola");
assert.equal(detectSparkCompanyName("Migros firmasına ait siparişler"), "migros");
assert.equal(detectSparkCompanyName("Partneri IBM olan faturalar"), null);
assert.equal(sparkChatMatchesFilter({ vendor_name: "Ereteam;IBM" }, { property: "vendor_name", operator: "eq", value: "IBM" }), true);
assert.equal(sparkChatMatchesFilter({ vendor_name: "IBMX" }, { property: "vendor_name", operator: "eq", value: "IBM" }), false);
assert.equal(sparkChatMatchesFilter({ revenue_type: "License;Project" }, { property: "revenue_type", operator: "in", values: ["License", "SNS"] }), true);
assert.equal(sparkRevenueGroup("License;Project"), "license");
assert.equal(sparkRevenueGroup("Project"), "service");

for (const testCase of SPARK_CHAT_KNOWLEDGE.regressionCases) {
  const plan = applySparkQueryGuardrails({
    responseType: "records",
    title: "Regresyon testi",
    object: testCase.object,
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
  if ("expectedAssociatedProperty" in testCase) {
    const filter = plan.associatedDealFilters.find((item) => item.property === testCase.expectedAssociatedProperty);
    assert.ok(filter, `${testCase.question}: bağlı deal ${testCase.expectedAssociatedProperty} filtresi eksik`);
    const values = filter.values ?? (filter.value ? [filter.value] : []);
    if ("expectedAssociatedValues" in testCase) assert.deepEqual([...values].sort(), [...testCase.expectedAssociatedValues].sort(), `${testCase.question}: bağlı deal değerleri yanlış`);
  }
  if ("expectedAssociatedStage" in testCase) assert.equal(plan.associatedDealFilters.find((filter) => filter.property === "_stage_label")?.value, testCase.expectedAssociatedStage, `${testCase.question}: bağlı deal stage filtresi yanlış`);
  if ("unexpectedProperty" in testCase) assert.ok(!plan.filters.some((filter) => filter.property === testCase.unexpectedProperty), `${testCase.question}: ${testCase.unexpectedProperty} filtresi kullanılmamalı`);
  if ("expectedForbiddenProperties" in testCase) assert.ok(testCase.expectedForbiddenProperties.every((property) => !plan.filters.some((filter) => filter.property === property)), `${testCase.question}: istenmeyen boyut filtresi temizlenmedi`);
  if ("expectedGroupBy" in testCase) assert.equal(plan.groupBy, testCase.expectedGroupBy, `${testCase.question}: kırılım alanı yanlış`);
  if ("expectedFilterProperties" in testCase) assert.ok(testCase.expectedFilterProperties.every((property) => plan.filters.some((filter) => filter.property === property)), `${testCase.question}: zorunlu filtrelerden biri eksik`);
  if ("expectedDateRange" in testCase) {
    const dateProperty = SPARK_CHAT_KNOWLEDGE.objects[testCase.object].dateProperty;
    assert.equal(plan.filters.find((filter) => filter.property === dateProperty && filter.operator === "gte")?.value, testCase.expectedDateRange[0], `${testCase.question}: dönem başlangıcı yanlış`);
    assert.equal(plan.filters.find((filter) => filter.property === dateProperty && filter.operator === "lt")?.value, testCase.expectedDateRange[1], `${testCase.question}: dönem bitişi yanlış`);
  }
  if (/ne\s+kadar/i.test(testCase.question)) {
    assert.equal(plan.responseType, "metric", `${testCase.question}: metric olmalı`);
    assert.deepEqual(plan.aggregate, { operation: "sum", property: amountProperties[testCase.object] }, `${testCase.question}: tutar alanı yanlış`);
  }
}

console.log(`${SPARK_CHAT_KNOWLEDGE.regressionCases.length} Spark chatbot regresyon senaryosu geçti.`);
