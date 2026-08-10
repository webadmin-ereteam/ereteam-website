/**
 * Spark chatbot domain knowledge.
 *
 * Update this file when a new business phrase, HubSpot enum, grouping rule or
 * regression example is discovered. The deterministic guardrails and planner
 * prompt both consume this source so their definitions cannot drift apart.
 */

export type SparkObjectType = "deals" | "invoices" | "orders";
export type SparkRevenueIntent = { kind: "exact"; value: string } | { kind: "license" } | { kind: "service" };

export function normalizeSparkChatText(value?: string | null) {
  return (value ?? "").trim().toLocaleLowerCase("tr-TR").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/ı/g, "i");
}

export const SPARK_CHAT_KNOWLEDGE = {
  objects: {
    deals: {
      label: "Deal",
      dateProperty: "closedate",
      amountProperty: "amount_in_home_currency",
      requiredProperties: ["dealname", "dealstage", "createdate", "closedate", "amount_in_home_currency", "hs_is_closed_won", "dealtype", "country", "vendor_name", "revenue_type", "ereteam_domain", "hubspot_owner_id"],
      coreFields: ["dealname", "closedate", "amount_in_home_currency", "country", "vendor_name", "revenue_type", "ereteam_domain", "dealtype", "_owner_name", "_stage_label"],
    },
    invoices: {
      label: "Fatura",
      dateProperty: "hs_invoice_date",
      amountProperty: "hs_amount_billed_in_company_currency",
      requiredProperties: ["hs_number", "invoice_name", "hs_invoice_latest_company_name", "hs_invoice_date", "hs_amount_billed_in_company_currency", "country", "vendor_name", "revenue_type", "ereteam_domain", "hubspot_owner_id"],
      coreFields: ["hs_number", "invoice_name", "hs_invoice_latest_company_name", "hs_invoice_date", "hs_amount_billed_in_company_currency", "country", "vendor_name", "revenue_type", "ereteam_domain", "_owner_name"],
    },
    orders: {
      label: "Order",
      dateProperty: "hs_processed_date",
      amountProperty: "hs_homecurrency_amount",
      requiredProperties: ["hs_order_name", "hs_pipeline_stage", "hs_processed_date", "hs_homecurrency_amount", "country", "vendor_name", "revenue_type", "ereteam_domain", "hubspot_owner_id"],
      coreFields: ["hs_order_name", "hs_processed_date", "hs_homecurrency_amount", "country", "vendor_name", "revenue_type", "ereteam_domain", "_owner_name", "_stage_label"],
    },
  },
  countries: [
    { value: "Turkiye", pattern: /\b(turkiye|turkey)\b/ },
    { value: "USA", pattern: /\b(amerika|abd|usa|united\s+states)\b/ },
  ],
  breakdown: {
    triggerPattern: /\b(kirilim\w*|bazinda|ayri\s+(ayri|rakam)|karsilastir\w*|iki\s+rakam)\b/,
    dimensions: [
      { property: "country", pattern: /\b(ulke|turkiye|turkey|amerika|abd|usa|united\s+states)\b/ },
      { property: "vendor_name", pattern: /\b(vendor|satici|uretici)\b/ },
      { property: "_revenue_group", pattern: /(?=.*\b(lisans|license|sns)\b)(?=.*\b(servis|danismanlik)\b)/ },
      { property: "revenue_type", pattern: /\b(revenue\s*type|gelir\s+tip|lisans|servis|danismanlik|sns|proje|project)\b/ },
      { property: "ereteam_domain", pattern: /\b(ereteam\s+domain|uzmanlik|data\s+isi|veri\s+isi|finans\s+isi|marketing\s+isi|pazarlama\s+isi|martech)\b/ },
      { property: "dealtype", pattern: /\b(is\s+tip|deal\s*type|yeni\s+is|mevcut\s+is|new\s+business|existing\s+business)\b/ },
      { property: "_owner_name", pattern: /\b(owner|satisci|sorumlu)\b/ },
      { property: "_stage_label", pattern: /\b(stage|asama|durum)\b/ },
    ],
    valueLabels: {
      Turkiye: "Türkiye",
      USA: "USA",
      newbusiness: "New Business",
      existingbusiness: "Existing Business",
      license: "Lisans",
      service: "Servis",
    },
  },
  revenue: {
    property: "revenue_type",
    licenseValues: ["License", "SNS"],
    valuesByObject: {
      deals: ["License", "SNS", "Outsource", "Project", "Engineering", "Cloud", "Assessment", "Training", "Maintenance & Support"],
      invoices: ["Cloud", "License", "Outsource", "Project", "SNS", "Training", "Maintenance & Support", "Eski_Backlog"],
      orders: ["Cloud", "License", "Outsource", "Project", "SNS", "Training", "Maintenance & Support", "Engineering", "Eski_Backlog"],
    },
    licenseGroupPatterns: [/\blisans\s+gelir/, /\bne\s+kadari\s+lisans\w*/, /\blisans\w*\s+toplam/],
    serviceGroupPatterns: [/\bservis\w*\b/, /\bdanismanlik\w*\b/],
    exactAliases: [
      { value: "License", pattern: /\b(lisans|license)\b/ },
      { value: "SNS", pattern: /\bsns\b/ },
      { value: "Outsource", pattern: /\b(outsource|dis\s+kaynak)\b/ },
      { value: "Project", pattern: /\b(proje|project)\b/ },
      { value: "Engineering", pattern: /\b(engineering|muhendislik)\b/ },
      { value: "Cloud", pattern: /\bcloud\b/ },
      { value: "Assessment", pattern: /\b(assessment|degerlendirme)\b/ },
      { value: "Training", pattern: /\b(training|egitim)\b/ },
      { value: "Maintenance & Support", pattern: /\b(maintenance|support|bakim|destek)\b/ },
      { value: "Eski_Backlog", pattern: /\beski[ _-]?backlog\b/ },
    ],
  },
  vendors: {
    property: "vendor_name",
    triggerPattern: /\b(vendor|satici|uretici)\b/,
    valuesByObject: {
      deals: ["Alterian", "Alteryx", "Apparo", "AtScale", "AWS", "DataRobot", "DigiEye", "Ereteam", "HCL", "IBM", "Insider", "Metrica", "Microsoft", "Qualytics", "Salesforce", "Snowflake", "Theobald"],
      invoices: ["Alteryx", "Apparo", "AWS", "Datarobot", "Digieye", "Ereteam", "HCL", "IBM", "LOCATIONBOX", "Macrosoft", "Metrica", "Qlik", "Qualytics", "Salesforce", "Snowflake", "TechData", "Theobald", "ZASLOGIC"],
      orders: ["Alteryx", "Apparo", "AWS", "DataRobot", "DigiEye", "Ereteam", "HCL", "IBM", "Qualitics", "Salesforce", "Snowflake", "Theobald"],
    },
  },
  domains: {
    property: "ereteam_domain",
    aliases: [
      { value: "Data, Cloud & AI (DC&AI)", pattern: /\b(dc\s*&?\s*ai|data\s*,?\s*cloud\s*&?\s*ai|data\s+(isi|uzmanlik|domain)|veri\s+(isi|uzmanlik|domain))\b/ },
      { value: "Enterprise Planning (EP)", pattern: /\b(ep|enterprise\s+planning|finans\s+(isi|uzmanlik|domain)|financial\s+(planning|domain))\b/ },
      { value: "Intelligent MarTech (IM)", pattern: /\b(im|intelligent\s+martech|martech|marketing\s+(isi|uzmanlik|domain)|pazarlama\s+(isi|uzmanlik|domain))\b/ },
    ],
  },
  dealBusinessTypes: [
    { value: "newbusiness", pattern: /\b(yeni\s+is|new\s+business)\b/ },
    { value: "existingbusiness", pattern: /\b(mevcut\s+is|existing\s+business)\b/ },
  ],
  quarters: [
    { key: "q1", pattern: /\b(q1|first\s+quarter|(ilk|birinci|1\.?|1['’]?inci)\s+ceyre(k(te)?|g(i|inde)))\b/, startMonth: 1, endExclusiveMonth: 4, label: "1. çeyrek" },
    { key: "q2", pattern: /\b(q2|second\s+quarter|(ikinci|2\.?|2['’]?nci)\s+ceyre(k(te)?|g(i|inde)))\b/, startMonth: 4, endExclusiveMonth: 7, label: "2. çeyrek" },
    { key: "q3", pattern: /\b(q3|third\s+quarter|(ucuncu|3\.?|3['’]?uncu)\s+ceyre(k(te)?|g(i|inde)))\b/, startMonth: 7, endExclusiveMonth: 10, label: "3. çeyrek" },
    { key: "q4", pattern: /\b(q4|fourth\s+quarter|(dorduncu|son|4\.?|4['’]?uncu)\s+ceyre(k(te)?|g(i|inde)))\b/, startMonth: 10, endExclusiveMonth: 13, label: "4. çeyrek" },
  ],
  halfYears: [
    { key: "first", pattern: /\b(ilk\s+(yari(si|sinda)?|6\s+ay(i|inda)?)|h1|first\s+half)\b/, startMonth: 1, endExclusiveMonth: 7, label: "ilk yarı" },
    { key: "second", pattern: /\b(ikinci\s+(yari(si|sinda)?|6\s+ay(i|inda)?)|h2|second\s+half)\b/, startMonth: 7, endExclusiveMonth: 13, label: "ikinci yarı" },
  ],
  ownerMatching: {
    minimumSimilarity: 0.72,
    ambiguityMargin: 0.08,
    regressionCases: [
      { input: "Selda", owners: ["Kerem Arıtürk", "Selda Kaygusuz"], expected: "Selda Kaygusuz" },
      { input: "Sleda", owners: ["Kerem Arıtürk", "Selda Kaygusuz"], expected: "Selda Kaygusuz" },
      { input: "Ali", owners: ["Ali Veli", "Ali Can"], expected: null },
    ],
  },
  plannerRules: [
    "Order tarihi yalnızca hs_processed_date, USD tutarı yalnızca hs_homecurrency_amount.",
    "Fatura tarihi yalnızca hs_invoice_date, USD tutarı yalnızca hs_amount_billed_in_company_currency.",
    "Deal USD tutarı yalnızca amount_in_home_currency; deal tarih bağlamına göre closedate veya createdate.",
    "Genel amount, TL tutarı veya başka para birimi property'lerini kullanma.",
    '"Beklenen fatura" açık order demektir: hs_processed_date, hs_homecurrency_amount ve _stage_label eq Open.',
    '"Faturalanan/kesilen fatura" object invoices demektir.',
    '"Aktif pipeline/açık fırsat" Closed Won ve Closed Lost olmayan deal kayıtlarıdır. Won/Lost sorularında closedate kullan.',
    "Fatura veya order için New Business sorusunda bağlı deal üzerinde dealtype eq newbusiness ve Closed Won filtresini associatedDealFilters ile uygula.",
    "country enumları Turkiye ve USA: Türkiye/Turkey -> Turkiye; Amerika/ABD/USA/United States -> USA.",
    "Vendor sorularında tüm nesnelerde vendor_name kullan.",
    "Deal için yeni iş/New Business -> dealtype eq newbusiness; mevcut iş/Existing Business -> dealtype eq existingbusiness.",
    'Revenue Type tüm nesnelerde revenue_type alanıdır. "Ne kadarı lisanstı/lisans geliri" License + SNS; "ne kadarı servisti/servis/danışmanlık geliri" License ve SNS dışındaki tiplerdir.',
    "Ereteam uzmanlık alanı tüm nesnelerde ereteam_domain alanıdır: data/veri -> Data, Cloud & AI (DC&AI); finans -> Enterprise Planning (EP); marketing/pazarlama -> Intelligent MarTech (IM).",
    "Owner adını kullanıcının yazdığı biçimde _owner_name filtresine koy. Çalışma zamanı bu değeri canlı HubSpot owner listesindeki en yakın güvenli tam adla eşleştirir.",
    '"Yılın ilk yarısı" ve H1, 1 Ocak dahil–1 Temmuz hariç; "yılın ikinci yarısı" ve H2, 1 Temmuz dahil–sonraki 1 Ocak hariç aralığıdır.',
    "Çeyrek ifadelerinde ilk/1. çeyrek/Q1 Ocak–Mart, ikinci/Q2 Nisan–Haziran, üçüncü/Q3 Temmuz–Eylül, dördüncü/son/Q4 Ekim–Aralık takvim aralığıdır.",
    "Kırılım, bazında, karşılaştırma veya iki rakam istenirse groupBy alanına ilgili property adını yaz; kategoriyi tek bir filtreye indirgeme.",
    "Kullanıcının istediği hiçbir dönem, owner, stage, tür veya bağlantı filtresini sessizce atlama. Katalogda olmayan property uydurma.",
  ],
  regressionCases: [
    { question: "Geçen ay ne kadar fatura kestik?", object: "invoices", expectedProperty: "hs_invoice_date" },
    { question: "Türkiye faturaları ne kadar?", object: "invoices", expectedProperty: "country", expectedValues: ["Turkiye"] },
    { question: "IBM vendor aktif pipeline ne kadar?", object: "deals", expectedProperty: "vendor_name", expectedValues: ["IBM"] },
    { question: "Mevcut iş deallarının toplamı", object: "deals", expectedProperty: "dealtype", expectedValues: ["existingbusiness"] },
    { question: "Ne kadarı lisanstı?", object: "invoices", expectedProperty: "revenue_type", expectedValues: ["License", "SNS"] },
    { question: "Ne kadarı servisti?", object: "invoices", expectedProperty: "revenue_type", excludedValues: ["License", "SNS"] },
    { question: "Finans işi faturaları ne kadar?", object: "invoices", expectedProperty: "ereteam_domain", expectedValues: ["Enterprise Planning (EP)"] },
    { question: "MarTech faturalarını göster", object: "invoices", expectedProperty: "ereteam_domain", expectedValues: ["Intelligent MarTech (IM)"], expectedResponseType: "records" },
    { question: "2026'da toplam açık orderı Türkiye ve ABD kırılımında iki rakam olarak göster", object: "orders", expectedProperty: "country", expectedValues: ["Turkiye", "USA"], expectedResponseType: "metric", expectedGroupBy: "country", expectedFilterProperties: ["country", "hs_processed_date", "_stage_label"] },
    { question: "Lisans ve servis gelirini iki rakam olarak karşılaştır", object: "invoices", expectedResponseType: "metric", expectedGroupBy: "_revenue_group" },
    { question: "2026 yılının ilk yarısında ABD için kesilen toplam servis faturası ne kadardır?", object: "invoices", expectedProperty: "revenue_type", excludedValues: ["License", "SNS"], expectedResponseType: "metric", expectedFilterProperties: ["hs_invoice_date", "country", "revenue_type"], expectedDateRange: ["2026-01-01", "2026-07-01"] },
    { question: "2026 3. çeyreğinde açık order toplamı nedir?", object: "orders", expectedResponseType: "metric", expectedFilterProperties: ["hs_processed_date", "_stage_label"], expectedDateRange: ["2026-07-01", "2026-10-01"] },
  ],
} as const;

export const sparkObjectTypes = Object.keys(SPARK_CHAT_KNOWLEDGE.objects) as SparkObjectType[];

export function detectSparkCountry(text: string) {
  return detectSparkCountries(text)[0] ?? null;
}

export function detectSparkCountries(text: string) {
  return SPARK_CHAT_KNOWLEDGE.countries.filter((entry) => entry.pattern.test(text)).map((entry) => entry.value);
}

export function detectSparkGroupBy(text: string) {
  const countries = detectSparkCountries(text);
  if (countries.length > 1) return "country";
  if (!SPARK_CHAT_KNOWLEDGE.breakdown.triggerPattern.test(text)) return null;
  return SPARK_CHAT_KNOWLEDGE.breakdown.dimensions.find((entry) => entry.pattern.test(text))?.property ?? null;
}

export function sparkBreakdownValueLabel(value: string) {
  return SPARK_CHAT_KNOWLEDGE.breakdown.valueLabels[value as keyof typeof SPARK_CHAT_KNOWLEDGE.breakdown.valueLabels] ?? (value || "Belirtilmemiş");
}

export function detectSparkRevenueIntent(text: string): SparkRevenueIntent | null {
  if (SPARK_CHAT_KNOWLEDGE.revenue.licenseGroupPatterns.some((pattern) => pattern.test(text))) return { kind: "license" };
  if (SPARK_CHAT_KNOWLEDGE.revenue.serviceGroupPatterns.some((pattern) => pattern.test(text))) return { kind: "service" };
  const exact = SPARK_CHAT_KNOWLEDGE.revenue.exactAliases.find((entry) => entry.pattern.test(text));
  return exact ? { kind: "exact", value: exact.value } : null;
}

export function sparkRevenueValues(intent: SparkRevenueIntent, object: SparkObjectType): string[] {
  if (intent.kind === "license") return [...SPARK_CHAT_KNOWLEDGE.revenue.licenseValues];
  if (intent.kind === "service") return SPARK_CHAT_KNOWLEDGE.revenue.valuesByObject[object].filter((value) => !SPARK_CHAT_KNOWLEDGE.revenue.licenseValues.includes(value as "License" | "SNS"));
  return [intent.value];
}

export function detectSparkVendor(text: string, object: SparkObjectType) {
  if (!SPARK_CHAT_KNOWLEDGE.vendors.triggerPattern.test(text)) return null;
  return SPARK_CHAT_KNOWLEDGE.vendors.valuesByObject[object].find((value) => text.includes(normalizeSparkChatText(value))) ?? null;
}

export function detectSparkDomain(text: string) {
  return SPARK_CHAT_KNOWLEDGE.domains.aliases.find((entry) => entry.pattern.test(text))?.value ?? null;
}

export function detectSparkDealBusinessType(text: string) {
  return SPARK_CHAT_KNOWLEDGE.dealBusinessTypes.find((entry) => entry.pattern.test(text))?.value ?? null;
}

export const sparkPlannerKnowledge = SPARK_CHAT_KNOWLEDGE.plannerRules.map((rule) => `- ${rule}`).join("\n");
