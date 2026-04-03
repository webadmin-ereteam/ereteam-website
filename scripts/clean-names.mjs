import { createClient } from "@sanity/client";

const client = createClient({
  projectId: "oe7hnrwl",
  dataset: "production",
  apiVersion: "2024-01-01",
  token: "skEDqZV4mUe6k2wleb9dFLCRlZ8kgcGpUAxs3gNewQUFRo03xvelPKah3oQULct72Ac6ZNcS9KmRPcMBe7wbznckPN5vlW3KmVqEW8hauNwDi0zTdZqXmnCqnzqw4OgqmexVA81hkHUB5HZQO6XFmRhklYwxXyArH30PbDN3bMNsLpw7nnjN",
  useCdn: false,
});

const patches = [
  {
    id: "successStory-ing-bank-budget",
    summary: "Designed and implemented an integrated budget planning and forecasting platform for a leading Turkish retail bank, consolidating over 30 budget templates into a unified Planning Analytics workspace.",
    results: "Reduced budget cycle from 6 weeks to 10 days. Eliminated manual Excel consolidation for 200+ users. Achieved single version of financial truth across all business lines.",
  },
  {
    id: "successStory-ing-bank-hr",
    summary: "Built a comprehensive HR analytics and workforce planning solution enabling the bank's HR department to model headcount scenarios, track personnel costs, and align workforce plans with financial budgets.",
    results: "Provided HR and Finance a shared platform for headcount planning. Enabled 'what-if' modelling for salary increase scenarios and hiring plans.",
  },
  {
    id: "successStory-halkbank",
    summary: "Implemented IBM Cognos Controller for group-level financial consolidation across the bank and its subsidiaries, enabling automated intercompany eliminations, currency translation, and regulatory reporting packages.",
    results: "Reduced monthly close cycle by 40%. Automated BRSA regulatory report generation. Enabled consolidated balance sheet in real time.",
  },
  {
    id: "successStory-akbank-argus",
    summary: "Led the end-to-end delivery of ARGUS — a large Turkish private bank's enterprise risk and performance analytics platform. The platform integrates credit risk, market risk, and financial performance data into a single analytical layer.",
    results: "Single integrated risk/finance data mart serving 500+ internal users. Real-time Basel III capital ratio monitoring. 60% reduction in manual report preparation.",
  },
  {
    id: "successStory-alternatif-bank",
    summary: "Delivered a branch-level performance and profitability analytics solution for a mid-size private bank, enabling management to evaluate revenue, cost, and risk metrics at granular branch and product levels.",
    results: "Enabled product-level P&L visibility at branch level. Improved banker incentive calculations accuracy.",
  },
  {
    id: "successStory-ziraat-bank",
    summary: "Architected and implemented the enterprise data warehouse and BI platform for Turkey's largest state-owned bank by assets.",
    results: "Consolidated 15+ source systems into a single EDW. Enabled self-service analytics for 300+ business users.",
  },
  {
    id: "successStory-iyzico",
    summary: "Built a real-time payment analytics and merchant intelligence dashboard for a leading Turkish fintech, enabling the company to monitor transaction volumes, detect anomalies, and provide merchants with performance insights.",
    results: "Real-time transaction monitoring across 10,000+ merchants. 30% improvement in fraud detection response time.",
  },
  {
    id: "successStory-vakifbank-crm",
    summary: "Built a customer analytics and CRM intelligence platform for a major state-owned bank, enabling relationship managers to identify cross-sell opportunities, track customer profitability, and segment the customer base for targeted campaigns.",
    results: "Cross-sell conversion rates improved by 28%. Customer profitability scoring deployed to 15M+ customers.",
  },
  {
    id: "successStory-vakifbank-risk",
    summary: "Implemented credit risk analytics and IFRS 9 reporting capabilities for a major state-owned bank, automating the calculation of Expected Credit Loss (ECL) provisions, Stage classification, and regulatory disclosures.",
    results: "IFRS 9 reporting cycle reduced from 3 weeks to 4 days. ECL model validated and approved by external auditors.",
  },
  {
    id: "successStory-fibabanka",
    summary: "Designed and implemented the enterprise data warehouse and management reporting platform for a private deposit bank, consolidating retail, commercial, and treasury data to provide executive and board-level reporting.",
    results: "Single EDW serving all management reporting needs. Monthly management pack automated reducing preparation time by 70%.",
  },
  {
    id: "successStory-nn-life",
    summary: "Implemented an actuarial and financial planning platform for a major life insurance company, automating the translation of actuarial projections into financial plans and enabling dynamic scenario modelling.",
    results: "Reduced actuarial-to-finance reporting cycle by 50%. Enabled monthly rolling forecast with scenario comparison.",
  },
  {
    id: "successStory-mapfre",
    summary: "Delivered a claims analytics solution for a large non-life insurance company, providing actuaries and claims managers with deep visibility into loss ratios, claims frequency, and reserve adequacy across all product lines.",
    results: "Identified 15% improvement opportunity in claims reserves. Reduced loss ratio reporting time from 2 weeks to 2 days.",
  },
  {
    id: "successStory-sompo-sigorta",
    summary: "Built a reinsurance analytics and treaty management dashboard for a P&C insurance company, enabling underwriters and reinsurance managers to track cession rates, recoveries, and net retained risk.",
    results: "Full visibility into reinsurance program performance. Automated cession calculation reducing errors by 90%.",
  },
  {
    id: "successStory-commonwealth-care-alliance",
    summary: "Developed a population health management and risk stratification platform for a US managed care organization, enabling care managers to identify high-risk members and predict hospitalizations.",
    results: "15% reduction in preventable hospital admissions. Identified 8,000 high-risk members for proactive care management. $12M estimated savings in year 1.",
  },
  {
    id: "successStory-vodafone",
    summary: "Designed and deployed a customer lifetime value scoring and churn prediction platform for a major mobile operator, leveraging machine learning models to identify at-risk customers and optimize retention campaigns.",
    results: "15% reduction in voluntary churn for targeted segments. CLV model deployed to 25M+ active subscribers. 3x improvement in retention campaign ROI.",
  },
  {
    id: "successStory-charter-communications",
    summary: "Implemented a subscriber analytics and network performance dashboard for a major US cable operator, integrating billing, network, and customer service data.",
    results: "Reduced average handle time by 20% through better agent dashboards. Network-to-billing correlation enabled 25% faster fault resolution.",
  },
  {
    id: "successStory-turk-telekom",
    summary: "Implemented enterprise financial planning and consolidation for a large telecom group, covering budget planning, quarterly forecasting, and statutory consolidation across the group's 10+ legal entities.",
    results: "Group consolidation cycle reduced from 15 days to 4 days. Automated IFRS adjustment calculations.",
  },
  {
    id: "successStory-haleon",
    summary: "Built a global commercial analytics and market intelligence platform for a leading global consumer healthcare company, integrating sell-in, sell-out, market share, and competitor data across 25 markets.",
    results: "25 markets on single platform. 40% reduction in time-to-insight for commercial decisions. Automated data refresh replacing 80+ manual Excel reports.",
  },
  {
    id: "successStory-roche-forecasting",
    summary: "Developed a global demand forecasting and supply chain analytics platform for a global biopharma company, combining statistical forecasting models with market intelligence to improve supply planning accuracy for 40+ oncology products.",
    results: "Forecast accuracy improved by 22%. Inventory holding costs reduced by $18M annually. Automated consensus forecasting process.",
  },
  {
    id: "successStory-roche-patient",
    summary: "Designed a patient journey analytics solution for a global biopharma company, mapping treatment pathways, time-to-treatment, and therapy switching patterns using real-world evidence data from US healthcare claims.",
    results: "Identified 3 key intervention points to improve patient outcomes. Informed commercial strategy for new product launch.",
  },
  {
    id: "successStory-novartis",
    summary: "Implemented an integrated commercial reporting platform for a major pharma company's local affiliate, consolidating sales force activity, market access, and market share data.",
    results: "Brand performance reporting reduced from weekly manual process to daily automated updates. Sales force deployment optimized based on territory analytics.",
  },
  {
    id: "successStory-amgen",
    summary: "Built a patient identification and market access analytics platform for a rare disease-focused biopharma's portfolio, using claims data and physician-level analytics.",
    results: "Identified 40% more eligible patients versus traditional methods. Reduced time to first prescription by 30 days on average.",
  },
  {
    id: "successStory-electrocore",
    summary: "Built a real-world evidence analytics platform for a medical device company, aggregating clinical trial data, EHR extracts, and claims data to demonstrate real-world effectiveness of vagus nerve stimulation therapy.",
    results: "RWE package supporting payer submissions in 5 markets. 60% improvement in payer engagement outcomes.",
  },
  {
    id: "successStory-coca-cola",
    summary: "Delivered a route-to-market analytics and sales force effectiveness platform for a global beverage brand's local operation, enabling territory managers to optimize outlet coverage and track cooler performance.",
    results: "Sales force coverage improved by 18%. Cooler asset utilization increased by 25%. Route optimization reduced logistics costs by 12%.",
  },
  {
    id: "successStory-koctas",
    summary: "Implemented a retail analytics and store performance platform for a major DIY retail chain, integrating POS, inventory, and CRM data to provide store managers and category teams with real-time performance visibility.",
    results: "Store-level P&L visibility for 120+ stores. Category performance insights reduced slow-moving inventory by 20%.",
  },
  {
    id: "successStory-pepsi",
    summary: "Built a trade promotion analytics and ROI measurement solution for a global snack brand's local operation, enabling the commercial team to evaluate the incremental impact of promotions and optimize trade investment allocation.",
    results: "Trade promotion ROI improved by 22%. Promotion evaluation time reduced from 3 weeks to 2 days.",
  },
  {
    id: "successStory-balparmak",
    summary: "Built supply chain and distribution analytics for Turkey's largest honey brand, enabling the company to optimize inventory levels, track distributor performance, and improve demand-supply matching.",
    results: "Inventory turnover improved by 15%. Distributor performance visibility enabled 10% reduction in stockouts.",
  },
  {
    id: "successStory-oyak-cement",
    summary: "Implemented group financial consolidation and performance reporting for a large cement group, covering statutory consolidation, management reporting, and KPI dashboards across 8 cement plants.",
    results: "Consolidated reporting reduced from 20 days to 5 days. Standardized KPI framework across all plants.",
  },
  {
    id: "successStory-enerjisa",
    summary: "Developed an energy analytics and grid performance platform for a major energy distribution company, enabling real-time monitoring of grid performance, outage prediction, and demand forecasting.",
    results: "Outage prediction accuracy improved by 35%. Demand forecasting error reduced by 18%. Enabled predictive maintenance scheduling.",
  },
  {
    id: "successStory-zorlu",
    summary: "Implemented a manufacturing performance and OEE analytics platform for a diversified industrial group, connecting shop-floor data with financial KPIs.",
    results: "OEE improved by 8% through data-driven maintenance scheduling. Integration of SAP and shop-floor data eliminated manual reporting.",
  },
  {
    id: "successStory-mng-kargo",
    summary: "Designed a logistics network analytics and last-mile optimization platform for a major cargo company, enabling operations managers to analyze route efficiency and optimize courier allocation across 80+ distribution hubs.",
    results: "On-time delivery rate improved by 12%. Courier productivity increased by 18%. Fuel costs reduced by 9% through route optimization.",
  },
  {
    id: "successStory-digiturk",
    summary: "Built a subscriber analytics and content performance platform for Turkey's leading pay-TV operator, enabling the marketing team to analyze viewing behavior and measure content ROI.",
    results: "Churn prediction model reduced voluntary churn by 18%. Content investment decisions informed by 50M+ viewing events per day.",
  },
  {
    id: "successStory-siriusxm",
    summary: "Developed a subscriber lifetime value and retention analytics platform for a major US satellite radio company, enabling the data science team to build CLV models and identify churn risk segments.",
    results: "CLV model accuracy improved by 30%. Retention program ROI increased by $45M annually. Automated A/B test analysis framework.",
  },
];

async function run() {
  console.log(`🧹 ${patches.length} kayıt güncelleniyor...`);
  for (const p of patches) {
    await client.patch(p.id).set({ summary: p.summary, results: p.results }).commit();
    console.log(`  ✓ ${p.id}`);
  }
  console.log("\n✅ Tüm firma isimleri temizlendi.");
}

run().catch((err) => { console.error("❌ Hata:", err.message); process.exit(1); });
