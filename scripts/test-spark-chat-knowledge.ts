import assert from "node:assert/strict";
import { applySparkQueryGuardrails } from "../lib/spark/chat";
import { SPARK_CHAT_KNOWLEDGE, type SparkObjectType } from "../lib/spark/chatKnowledge";

const amountProperties: Record<SparkObjectType, string> = {
  deals: "amount_in_home_currency",
  invoices: "hs_amount_billed_in_company_currency",
  orders: "hs_homecurrency_amount",
};

for (const testCase of SPARK_CHAT_KNOWLEDGE.regressionCases) {
  const plan = applySparkQueryGuardrails({
    responseType: "records",
    title: "Regresyon testi",
    object: testCase.object,
    properties: [],
    filters: [],
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
  if ("expectedGroupBy" in testCase) assert.equal(plan.groupBy, testCase.expectedGroupBy, `${testCase.question}: kırılım alanı yanlış`);
  if ("expectedFilterProperties" in testCase) assert.ok(testCase.expectedFilterProperties.every((property) => plan.filters.some((filter) => filter.property === property)), `${testCase.question}: zorunlu filtrelerden biri eksik`);
  if (/ne\s+kadar/i.test(testCase.question)) {
    assert.equal(plan.responseType, "metric", `${testCase.question}: metric olmalı`);
    assert.deepEqual(plan.aggregate, { operation: "sum", property: amountProperties[testCase.object] }, `${testCase.question}: tutar alanı yanlış`);
  }
}

console.log(`${SPARK_CHAT_KNOWLEDGE.regressionCases.length} Spark chatbot regresyon senaryosu geçti.`);
