/**
 * Spark chatbot domain knowledge.
 *
 * Update this file when a new business phrase, HubSpot enum, grouping rule or
 * regression example is discovered. The deterministic guardrails and planner
 * prompt both consume this source so their definitions cannot drift apart.
 */

export type SparkObjectType = "deals" | "invoices" | "orders";
export type SparkRevenueIntent = { kind: "exact"; value: string } | { kind: "license" } | { kind: "service" };
export type SparkCompositeRevenueMetricKind = "guaranteed_revenue" | "expected_revenue";
export type SparkDashboardMetricKind = "annual_target" | "remaining_target" | "guaranteed_coverage" | "forecast_coverage" | "annual_forecast";

export function normalizeSparkChatText(value?: string | null) {
  return (value ?? "").trim().toLocaleLowerCase("tr-TR").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/ı/g, "i");
}

export const SPARK_CHAT_KNOWLEDGE = {
  compositeMetrics: {
    guaranteedRevenue: {
      kind: "guaranteed_revenue",
      pattern: /\b(garanti|garantili)\s+gelir\w*\b/,
      amountPattern: /\b(ne\s+kadar|toplam\w*|tutar\w*|ne\s+olacak)\b/,
      label: "Garanti gelir",
      definition: "Aynı dönemde faturalanan gelir ile açık order toplamı",
    },
    expectedRevenue: {
      kind: "expected_revenue",
      pattern: /\b(?:beklenen\s+(?:fatura|gelir)\w*|(?:fatura|gelir)\w*\s+beklenti\w*|ne\s+kadar\s+(?:fatura|gelir)\w*\s+bekliyoruz)\b/,
      amountPattern: /\b(ne\s+kadar|toplam\w*|tutar\w*)\b/,
      label: "Beklenen gelir",
      definition: "Aynı dönemde kesilen faturalar ile açık order toplamı",
    },
    weightedPipeline: {
      pattern: /\b(weighted|agirlikli)\s+(pipeline|forecast)\b/,
      label: "Weighted pipeline",
      property: "hs_projected_amount_in_home_currency",
    },
  },
  filterContracts: {
    common: ["_company_name", "country", "vendor_name", "revenue_type", "ereteam_domain", "_owner_name"],
    deals: ["createdate", "closedate", "_stage_label", "_is_open", "_is_closed", "_is_won", "dealtype"],
    invoices: ["hs_invoice_date"],
    orders: ["hs_processed_date", "_stage_label", "_is_open"],
    multiValueProperties: ["vendor_name", "revenue_type", "_revenue_group"],
    missingValueLabel: "Belirtilmemiş",
  },
  objects: {
    deals: {
      label: "Deal",
      dateProperty: "closedate",
      amountProperty: "amount_in_home_currency",
      requiredProperties: ["dealname", "dealstage", "createdate", "closedate", "amount_in_home_currency", "hs_projected_amount_in_home_currency", "hs_is_closed", "hs_is_closed_won", "dealtype", "country", "vendor_name", "revenue_type", "ereteam_domain", "hubspot_owner_id"],
      coreFields: ["dealname", "_company_name", "closedate", "amount_in_home_currency", "country", "vendor_name", "revenue_type", "ereteam_domain", "dealtype", "_owner_name", "_stage_label"],
    },
    invoices: {
      label: "Fatura",
      dateProperty: "hs_invoice_date",
      amountProperty: "hs_amount_billed_in_company_currency",
      requiredProperties: ["hs_number", "invoice_name", "hs_invoice_latest_company_name", "hs_invoice_date", "hs_amount_billed_in_company_currency", "status", "country", "vendor_name", "revenue_type", "ereteam_domain", "hubspot_owner_id"],
      coreFields: ["hs_number", "invoice_name", "_company_name", "hs_invoice_date", "hs_amount_billed_in_company_currency", "country", "vendor_name", "revenue_type", "ereteam_domain", "_owner_name"],
    },
    orders: {
      label: "Order",
      dateProperty: "hs_processed_date",
      amountProperty: "hs_homecurrency_amount",
      requiredProperties: ["hs_order_name", "hs_pipeline_stage", "hs_processed_date", "hs_homecurrency_amount", "country", "vendor_name", "revenue_type", "ereteam_domain", "hubspot_owner_id"],
      coreFields: ["hs_order_name", "_company_name", "hs_processed_date", "hs_homecurrency_amount", "country", "vendor_name", "revenue_type", "ereteam_domain", "_owner_name", "_stage_label"],
    },
  },
  countries: [
    { value: "Turkiye", pattern: /\b(turkiye(?:['’]?(?:de|den|nin|ye|yi|li|deki))?|turkey|tr)\b/ },
    { value: "USA", pattern: /\b(amerika(?:['’]?(?:da|dan|nin|ya|yi|li|daki))?|abd|usa|us|united\s+states(?:\s+of\s+america)?)\b/ },
  ],
  breakdown: {
    triggerPattern: /\b(kirilim\w*|bazinda|ayri\s+(ayri|rakam)|karsilastir\w*|iki\s+rakam)\b/,
    dimensions: [
      { property: "country", pattern: /\b(ulke|turkiye|turkey|tr|amerika|abd|usa|us|united\s+states)\b/ },
      { property: "_company_name", pattern: /\b(musteri|firma|sirket)\b/ },
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
      USA: "ABD",
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
    licenseGroupPatterns: [/\b(lisans|license)\w*\b/],
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
    triggerPattern: /\b(vendor\w*|partner\w*|is\s+ortag\w*|satici\w*|uretici\w*)\b/,
    valuesByObject: {
      deals: ["Alterian", "Alteryx", "Apparo", "AtScale", "AWS", "DataRobot", "DigiEye", "Ereteam", "HCL", "IBM", "Insider", "Metrica", "Microsoft", "Qualytics", "Salesforce", "Snowflake", "Theobald"],
      invoices: ["Alteryx", "Apparo", "AWS", "Datarobot", "Digieye", "Ereteam", "HCL", "IBM", "LOCATIONBOX", "Macrosoft", "Metrica", "Qlik", "Qualytics", "Salesforce", "Snowflake", "TechData", "Theobald", "ZASLOGIC"],
      orders: ["Alteryx", "Apparo", "AWS", "DataRobot", "DigiEye", "Ereteam", "HCL", "IBM", "Qualitics", "Salesforce", "Snowflake", "Theobald"],
    },
  },
  companies: {
    property: "_company_name",
    triggerPattern: /\b(firma\w*|sirket\w*|musteri\w*|kestigimiz|kesilen|duzenledigimiz|ait)\b/,
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
    { key: "first", pattern: /\b((ilk|birinci)\s*(yari[a-z]*|6\s*ay[a-z]*)|h1|first\s+half)\b/, startMonth: 1, endExclusiveMonth: 7, label: "ilk yarı" },
    { key: "second", pattern: /\b(ikinci\s*(yari[a-z]*|6\s*ay[a-z]*)|h2|second\s+half)\b/, startMonth: 7, endExclusiveMonth: 13, label: "ikinci yarı" },
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
    '"Beklenen fatura/gelir toplamı" aynı dönem için kesilen faturalar ile açık order toplamıdır. Detay/liste sorusuysa yalnız açık order kayıtlarını getir.',
    'İş metriğini kelime eşleşmesiyle sınırlama: Kullanıcının farklı bir ifadeyle gerçekleşen faturalar + açık order beklentisini sorması expected_revenue; garanti geliri sorması guaranteed_revenue; olasılık ağırlıklı aktif pipeline istemesi weighted_pipeline metricKind değeridir.',
    'expected_revenue için bu ay faturaları bugüne kadar, açık orderları ay sonuna kadar hesapla. Diğer açık dönemlerde iki bileşene de sorulan takvim aralığını uygula.',
    '"Faturalanan/kesilen fatura" object invoices demektir.',
    '"Aktif pipeline/açık fırsat" _is_open eq true; kazanılan/Won _is_won eq true; kaybedilen/Lost _is_closed eq true ve _is_won eq false kullanır. Won/Lost sorularında closedate kullan.',
    'Invoice kapsamı custom status alanında cancelled olmayan kayıtlardır. "Garanti gelir" aynı dönem için faturalanan gelir ile açık order toplamıdır. Tüm order sorgularında hs_processed_date + hs_homecurrency_amount + _is_open eq true kullan; kapalı/cancelled orderları getirme.',
    '"Weighted pipeline/ağırlıklı pipeline/weighted forecast" yalnızca aktif deallardaki hazır hs_projected_amount_in_home_currency alanının toplamıdır. Bu alan HubSpot tarafından deal tutarı ve kapanma olasılığıyla hesaplanır; chatbot yeniden hesaplama yapmaz.',
    "Fatura veya order için yeni iş/New Business sorusunda bağlı deal üzerinde dealtype eq newbusiness ve _is_won eq true filtresini associatedDealFilters ile uygula. Mevcut iş/Existing Business için bağlı deal üzerinde dealtype eq existingbusiness kullan.",
    "country canlı enumu nesneye göre farklı yazılabilir: Türkiye/Turkiye/Turkey/TR -> Turkiye; Amerika/ABD/USA/US/United States -> USA. Filtre değerini canlı enum label/value ile eşleştir.",
    'Müşteri/firma sorularında tüm nesnelerde sanal _company_name alanını kullan. Önce HubSpot company ilişkisini, ilişki yoksa nesnenin kontrollü müşteri adı yedeğini kullan. "Migros\'a kestiğimiz faturalar" müşteri Migros filtresidir; vendor değildir.',
    'vendor_name yalnızca kullanıcı açıkça vendor, satıcı, üretici, partner veya iş ortağı dediğinde kullanılır. "Vendorı IBM" ve "partneri IBM" vendor filtresidir.',
    "vendor_name ve revenue_type HubSpot çoklu seçim alanlarıdır; Ereteam;IBM değeri IBM filtresine, License;Project değeri License filtresine eşleşir. Noktalı virgülle birleşen değeri tek enum gibi değerlendirme.",
    "Deal için yeni iş/New Business -> dealtype eq newbusiness; mevcut iş/Existing Business -> dealtype eq existingbusiness.",
    'Revenue Type tüm nesnelerde revenue_type alanıdır. "Ne kadarı lisanstı/lisans geliri" License + SNS; "ne kadarı servisti/servis/danışmanlık geliri" License ve SNS dışındaki tiplerdir.',
    "Ereteam uzmanlık alanı tüm nesnelerde ereteam_domain alanıdır: data/veri -> Data, Cloud & AI (DC&AI); finans -> Enterprise Planning (EP); marketing/pazarlama -> Intelligent MarTech (IM).",
    "Owner adını kullanıcının yazdığı biçimde _owner_name filtresine koy. Çalışma zamanı bu değeri canlı HubSpot owner listesindeki en yakın güvenli tam adla eşleştirir.",
    '"Yılın ilk yarısı" ve H1, 1 Ocak dahil–1 Temmuz hariç; "yılın ikinci yarısı" ve H2, 1 Temmuz dahil–sonraki 1 Ocak hariç aralığıdır.',
    "Çeyrek ifadelerinde ilk/1. çeyrek/Q1 Ocak–Mart, ikinci/Q2 Nisan–Haziran, üçüncü/Q3 Temmuz–Eylül, dördüncü/son/Q4 Ekim–Aralık takvim aralığıdır.",
    "Kırılım, bazında, karşılaştırma veya iki rakam istenirse groupBy alanına ilgili property adını yaz; kategoriyi tek bir filtreye indirgeme. Boş sınıflandırmaları uydurma ve kırılımda Belirtilmemiş olarak koru.",
    "Müşteri/firma/şirket bazında kırılım için _company_name; owner bazında _owner_name; stage/aşama bazında _stage_label kullan.",
    "Weighted pipeline ülke, owner, stage, vendor, revenue type veya domain bazında sorulursa groupBy değerini koru ve hs_projected_amount_in_home_currency alanını grupla.",
    '"Kaç dolar/kaç USD/kaç milyon" tutar sorusudur; count değildir. "Kaç tane/kaç adet/kayıt sayısı" count sorusudur.',
    "Bu ay aktif veya weighted pipeline, close date'i ay sonuna kadar olan açık fırsatları kapsar. Kesilen faturalar için bu ay bugüne kadar olan kayıtları kullan.",
    "Kullanıcının istediği hiçbir dönem, owner, stage, tür veya bağlantı filtresini sessizce atlama. Katalogda olmayan property uydurma.",
    "Kullanıcının açıkça istemediği ülke, vendor, müşteri, revenue type, domain veya iş tipi filtresini ekleme. Geçerli bir HubSpot property olması, kendiliğinden filtre uygulama izni değildir.",
    "Order sorgularındaki zorunlu _is_open filtresi dışında stage, pipeline, açık, won/kazanılan, lost/kaybedilen veya beklenen fatura açıkça söylenmedikçe dealstage, hs_is_closed, hs_is_closed_won, hs_pipeline_stage, _stage_label, _is_open, _is_closed ya da _is_won filtresi ekleme.",
  ],
  regressionCases: [
    { question: "Geçen ay ne kadar fatura kestik?", object: "invoices", expectedProperty: "hs_invoice_date" },
    { question: "Geçen ay ABD servis faturalarının toplamı neydi?", object: "invoices", plannerMetricKind: "expected_revenue", expectedMetricKind: null, expectedProperty: "revenue_type", expectedValues: ["Cloud", "Outsource", "Project", "Training", "Maintenance & Support", "Eski_Backlog"] },
    { question: "Bu ay gerçekleşen faturalarla açık siparişleri beraber düşünürsek toplam ne eder?", object: "invoices", plannerMetricKind: "expected_revenue", expectedMetricKind: "expected_revenue", expectedResponseType: "metric" },
    { question: "Bu ay beklenen faturaların detaylarını göster", object: "orders", expectedResponseType: "records", expectedFilterProperties: ["hs_processed_date", "_is_open"], expectedDateRange: ["2026-08-01", "2026-09-01"] },
    { question: "Türkiye faturaları ne kadar?", object: "invoices", expectedProperty: "country", expectedValues: ["Turkiye"] },
    { question: "TR faturaları kaç dolar?", object: "invoices", expectedProperty: "country", expectedValues: ["Turkiye"], expectedResponseType: "metric", expectedAggregateProperty: "hs_amount_billed_in_company_currency" },
    { question: "Türkiyedeki açık siparişleri göster", object: "orders", expectedProperty: "country", expectedValues: ["Turkiye"], expectedResponseType: "records", expectedFilterProperties: ["_is_open"] },
    { question: "US pipeline ne kadar?", object: "deals", expectedProperty: "country", expectedValues: ["USA"], expectedResponseType: "metric", expectedFilterProperties: ["_is_open"] },
    { question: "IBM vendor aktif pipeline ne kadar?", object: "deals", expectedProperty: "vendor_name", expectedValues: ["IBM"] },
    { question: "Weighted pipeline değerimiz ne kadar?", object: "deals", plannerFilters: [{ property: "hs_is_closed_won", operator: "neq", value: "true" }, { property: "dealstage", operator: "not_contains", value: "lost" }], expectedResponseType: "metric", expectedAggregateProperty: "hs_projected_amount_in_home_currency", expectedFilterProperties: ["_is_open"], expectedForbiddenProperties: ["hs_is_closed_won", "dealstage", "_stage_label"] },
    { question: "Partneri IBM olan faturalar ne kadar?", object: "invoices", expectedProperty: "vendor_name", expectedValues: ["IBM"] },
    { question: "Migros'a kestiğimiz faturalar ne kadar?", object: "invoices", plannerFilters: [{ property: "vendor_name", operator: "eq", value: "Migros" }], expectedProperty: "_company_name", expectedValues: ["migros"], unexpectedProperty: "vendor_name" },
    { question: "Migros firmasına ait siparişleri göster", object: "orders", expectedProperty: "_company_name", expectedValues: ["migros"], expectedResponseType: "records", expectedFilterProperties: ["_is_open"] },
    { question: "Mevcut iş deallarının toplamı", object: "deals", expectedProperty: "dealtype", expectedValues: ["existingbusiness"] },
    { question: "Yeni iş siparişlerinin toplamı ne kadar?", object: "orders", expectedAssociatedProperty: "dealtype", expectedAssociatedValues: ["newbusiness"], expectedAssociatedWon: true },
    { question: "Mevcut iş faturalarını göster", object: "invoices", expectedAssociatedProperty: "dealtype", expectedAssociatedValues: ["existingbusiness"], expectedResponseType: "records" },
    { question: "Ne kadarı lisanstı?", object: "invoices", expectedProperty: "revenue_type", expectedValues: ["License", "SNS"] },
    { question: "Ne kadarı servisti?", object: "invoices", expectedProperty: "revenue_type", excludedValues: ["License", "SNS"] },
    { question: "Finans işi faturaları ne kadar?", object: "invoices", expectedProperty: "ereteam_domain", expectedValues: ["Enterprise Planning (EP)"] },
    { question: "MarTech faturalarını göster", object: "invoices", expectedProperty: "ereteam_domain", expectedValues: ["Intelligent MarTech (IM)"], expectedResponseType: "records" },
    { question: "2026'da toplam açık orderı Türkiye ve ABD kırılımında iki rakam olarak göster", object: "orders", expectedProperty: "country", expectedValues: ["Turkiye", "USA"], expectedResponseType: "metric", expectedGroupBy: "country", expectedFilterProperties: ["country", "hs_processed_date", "_is_open"] },
    { question: "Lisans ve servis gelirini iki rakam olarak karşılaştır", object: "invoices", plannerFilters: [{ property: "country", operator: "in", values: ["Turkiye", "USA"] }, { property: "ereteam_domain", operator: "in", values: ["Data, Cloud & AI (DC&AI)"] }, { property: "revenue_type", operator: "in", values: ["License", "SNS"] }, { property: "_stage_label", operator: "contains", value: "won" }, { property: "hubspot_owner_id", operator: "not_empty" }], expectedResponseType: "metric", expectedGroupBy: "_revenue_group", expectedForbiddenProperties: ["country", "ereteam_domain", "revenue_type", "_stage_label", "hubspot_owner_id"] },
    { question: "Selda'nın deallarını göster", object: "deals", expectedProperty: "_owner_name", expectedValues: ["selda"], expectedResponseType: "records" },
    { question: "2026 yılının ilk yarısında ABD için kesilen toplam servis faturası ne kadardır?", object: "invoices", expectedProperty: "revenue_type", excludedValues: ["License", "SNS"], expectedResponseType: "metric", expectedFilterProperties: ["hs_invoice_date", "country", "revenue_type"], expectedDateRange: ["2026-01-01", "2026-07-01"] },
    { question: "2026 ilkyarısının toplam danışmanlık faturası ne kadar?", object: "invoices", expectedProperty: "revenue_type", excludedValues: ["License", "SNS"], expectedResponseType: "metric", expectedFilterProperties: ["hs_invoice_date", "revenue_type"], expectedDateRange: ["2026-01-01", "2026-07-01"] },
    { question: "2026 3. çeyreğinde açık order toplamı nedir?", object: "orders", expectedResponseType: "metric", expectedFilterProperties: ["hs_processed_date", "_is_open"], expectedDateRange: ["2026-07-01", "2026-10-01"] },
    { question: "Bu ay açık siparişleri göster", object: "orders", expectedResponseType: "records", expectedFilterProperties: ["hs_processed_date", "_is_open"] },
    { question: "Ağustos 2026 Türkiye faturalarının toplamı", object: "invoices", expectedResponseType: "metric", expectedProperty: "country", expectedValues: ["Turkiye"], expectedFilterProperties: ["hs_invoice_date"], expectedDateRange: ["2026-08-01", "2026-09-01"] },
    { question: "Bu ay aktif pipeline ne kadar?", object: "deals", expectedResponseType: "metric", expectedFilterProperties: ["closedate", "_is_open"], expectedDateRange: ["2026-08-01", "2026-09-01"] },
    { question: "Bu çeyrek aktif pipeline owner bazında", object: "deals", expectedResponseType: "metric", expectedGroupBy: "_owner_name", expectedFilterProperties: ["closedate", "_is_open"], expectedDateRange: ["2026-07-01", "2026-10-01"] },
    { question: "Weighted pipeline ülke bazında", object: "deals", expectedResponseType: "metric", expectedGroupBy: "country", expectedAggregateProperty: "hs_projected_amount_in_home_currency", expectedFilterProperties: ["_is_open"] },
    { question: "Müşteri bazında fatura toplamı", object: "invoices", expectedResponseType: "metric", expectedGroupBy: "_company_name" },
    { question: "Kaç tane açık fırsat var?", object: "deals", expectedResponseType: "metric", expectedFilterProperties: ["_is_open"] },
    { question: "Ortalama açık order tutarı", object: "orders", expectedResponseType: "metric", expectedFilterProperties: ["_is_open"] },
    { question: "Gelecek ay açık order toplamı", object: "orders", expectedResponseType: "metric", expectedFilterProperties: ["hs_processed_date", "_is_open"], expectedDateRange: ["2026-09-01", "2026-10-01"] },
  ],
} as const;

export const sparkObjectTypes = Object.keys(SPARK_CHAT_KNOWLEDGE.objects) as SparkObjectType[];

export function detectSparkCountry(text: string) {
  return detectSparkCountries(text)[0] ?? null;
}

export function detectSparkCountries(text: string) {
  const normalized = normalizeSparkChatText(text);
  return SPARK_CHAT_KNOWLEDGE.countries.filter((entry) => entry.pattern.test(normalized)).map((entry) => entry.value);
}

export function canonicalSparkCountry(value?: string | null) {
  const normalized = normalizeSparkChatText(value).replace(/[._-]+/g, " ").replace(/\s+/g, " ");
  if (["turkiye", "turkey", "tr"].includes(normalized)) return "Turkiye";
  if (["amerika", "abd", "usa", "us", "united states", "united states of america"].includes(normalized)) return "USA";
  return null;
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

export function sparkMultiValueTokens(value?: string | null) {
  return (value ?? "").split(";").map((item) => item.trim()).filter(Boolean);
}

export function sparkRevenueGroup(value?: string | null) {
  const licenseValues = new Set(SPARK_CHAT_KNOWLEDGE.revenue.licenseValues.map(normalizeSparkChatText));
  const tokens = sparkMultiValueTokens(value);
  if (!tokens.length) return "";
  const groups = new Set(tokens.map((item) => licenseValues.has(normalizeSparkChatText(item)) ? "license" : "service"));
  return Array.from(groups).join(";");
}

export function detectSparkCompositeRevenueMetric(question: string): SparkCompositeRevenueMetricKind | null {
  const text = normalizeSparkChatText(question);
  const guaranteed = SPARK_CHAT_KNOWLEDGE.compositeMetrics.guaranteedRevenue;
  if (guaranteed.pattern.test(text) && guaranteed.amountPattern.test(text)) return "guaranteed_revenue";
  const expected = SPARK_CHAT_KNOWLEDGE.compositeMetrics.expectedRevenue;
  return expected.pattern.test(text) && expected.amountPattern.test(text) ? "expected_revenue" : null;
}

export function detectSparkDashboardMetric(question: string): SparkDashboardMetricKind | null {
  const text = normalizeSparkChatText(question);
  if (/\bhedefe\s+(?:ne\s+kadar\s+)?kalan\b|\bhedef\w*\s+ulasmak\w*\s+icin\s+(?:gereken|kalan)\b/.test(text)) return "remaining_target";
  if (/\bgaranti(?:li)?\s+(?:revenue\s+)?coverage\b|\bgaranti(?:li)?\s+gelir\w*\s+hedef\w*\s+(?:oran|yuzde)/.test(text)) return "guaranteed_coverage";
  if (/\bforecast\s+coverage\b|\bforecast\w*\s+hedef\w*\s+(?:oran|yuzde)/.test(text)) return "forecast_coverage";
  if (/\b(?:toplam|yillik|bu\s+yil(?:ki)?)\s+forecast\b|\bforecast\s+(?:toplami|tutari|ne\s+kadar)\b/.test(text)) return "annual_forecast";
  if (/\b(?:yillik|bu\s+yil(?:ki)?|revenue|ciro)\s+hedef\w*\b|\bhedefimiz\s+(?:ne|kac)/.test(text)) return "annual_target";
  return null;
}

export function sparkUnsupportedQuestionAnswer(question: string) {
  const text = normalizeSparkChatText(question);
  if (/\b(tl|try|lira|eur|euro)\b/.test(text) && /\b(kur|cevir|karsilik|tutar|toplam|ne\s+kadar)\b/.test(text)) {
    return "Spark yalnız doğrulanmış şirket para birimi USD alanlarını kullanır; kur dönüşümü veya TL/EUR toplamı üretmez.";
  }
  if (/\b(mail|e-?posta|email|toplanti|meeting|arama|call|aktivite|calendar|takvim)\b/.test(text)) {
    return "Aktivite, e-posta, toplantı ve takvim entegrasyonları yönetim raporu için yeterince güvenilir olmadığı için Spark AI kapsamına dahil değildir.";
  }
  if (/\b(donusum|conversion)\s+(oran|rate)\b|\bstage\s+gecis\w*\b/.test(text)) {
    return "Geçmiş stage hareketleri tutulmadığı için dönüşüm oranı veya stage geçiş analizi hesaplanamaz; yalnız mevcut canlı stage dağılımı sorgulanabilir.";
  }
  return null;
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

function cleanSparkCompanyName(value: string) {
  return value
    .replace(/^(?:(?:20\d{2}(?:\s+yilinda)?|bu\s+(?:ay|yil)|gecen\s+(?:ay|yil))\s+)*/, "")
    .replace(/^(?:bana|toplam|tum)\s+/, "")
    .trim();
}

export function detectSparkCompanyName(text: string) {
  if (SPARK_CHAT_KNOWLEDGE.vendors.triggerPattern.test(text)) return null;
  const normalized = normalizeSparkChatText(text);
  const namedCompany = normalized.match(/(?:^|\b)([a-z0-9][a-z0-9&. -]{0,80}?)\s+(?:firmasina|sirketine|musterisine|firmasinin|sirketinin|musterinin)\b/)?.[1];
  if (namedCompany) return cleanSparkCompanyName(namedCompany);
  const billedPrefix = normalized.match(/^(.{1,100}?)\s+(?:kestigimiz|kesilen|duzenledigimiz|verdigimiz|sattigimiz)\b/)?.[1];
  if (!billedPrefix) return null;
  const words = cleanSparkCompanyName(billedPrefix).split(/\s+/).filter(Boolean);
  const suffixWord = words.pop() ?? "";
  if (!/^(?:a|e)$/.test(suffixWord)) words.push(suffixWord.replace(/(?:['’](?:ya|ye|a|e)|(?:ya|ye|na|ne|a|e))$/, ""));
  return words.filter(Boolean).join(" ") || null;
}

export function detectSparkDomain(text: string) {
  return SPARK_CHAT_KNOWLEDGE.domains.aliases.find((entry) => entry.pattern.test(text))?.value ?? null;
}

export function detectSparkDealBusinessType(text: string) {
  return SPARK_CHAT_KNOWLEDGE.dealBusinessTypes.find((entry) => entry.pattern.test(text))?.value ?? null;
}

export const sparkPlannerKnowledge = SPARK_CHAT_KNOWLEDGE.plannerRules.map((rule) => `- ${rule}`).join("\n");
