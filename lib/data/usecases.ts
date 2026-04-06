export type Industry =
  | "Banking & Finance"
  | "Insurance"
  | "Telecom"
  | "Pharma & Biotech"
  | "Retail"
  | "Manufacturing"
  | "Media"
  | "Government"
  | "Other";

export interface UseCase {
  id: string;
  client: string;
  domain?: string;
  industry: Industry;
  project: string;
  technologies: string[];
  summary: string;
  results?: string;
}

export const useCases: UseCase[] = [
  {
    id: "ing-bank-budget",
    client: "ING Bank",
    domain: "ing.com",
    industry: "Banking & Finance",
    project: "Integrated Budget Planning & Forecasting Platform",
    technologies: ["IBM Cognos TM1", "IBM Planning Analytics", "REST API"],
    summary:
      "Designed and implemented an integrated budget planning and forecasting platform for ING Bank Turkey, consolidating over 30 budget templates into a unified Planning Analytics workspace. The solution automated data consolidation, enabled driver-based modelling, and provided real-time variance reporting.",
    results:
      "Reduced budget cycle from 6 weeks to 10 days. Eliminated manual Excel consolidation for 200+ users. Achieved single version of financial truth across all business lines.",
  },
  {
    id: "ing-bank-hr",
    client: "ING Bank",
    domain: "ing.com",
    industry: "Banking & Finance",
    project: "HR Analytics & Workforce Planning",
    technologies: ["IBM Cognos TM1", "IBM Planning Analytics", "SQL Server"],
    summary:
      "Built a comprehensive HR analytics and workforce planning solution enabling ING Bank Turkey's HR department to model headcount scenarios, track personnel costs, and align workforce plans with financial budgets.",
    results:
      "Provided HR and Finance a shared platform for headcount planning. Enabled 'what-if' modelling for salary increase scenarios and hiring plans.",
  },
  {
    id: "halkbank",
    client: "Halkbank",
    domain: "halkbank.com.tr",
    industry: "Banking & Finance",
    project: "Financial Consolidation & Regulatory Reporting",
    technologies: ["IBM Cognos Controller", "IBM Cognos Analytics", "Oracle"],
    summary:
      "Implemented IBM Cognos Controller for group-level financial consolidation across Halkbank and its subsidiaries, enabling automated intercompany eliminations, currency translation, and regulatory reporting packages.",
    results:
      "Reduced monthly close cycle by 40%. Automated BRSA regulatory report generation. Enabled consolidated balance sheet in real time.",
  },
  {
    id: "akbank-argus",
    client: "Akbank",
    domain: "akbank.com",
    industry: "Banking & Finance",
    project: "Enterprise Risk & Performance Analytics Platform",
    technologies: [
      "IBM Cognos Analytics",
      "IBM Planning Analytics",
      "Python",
      "Oracle",
    ],
    summary:
      "Led the end-to-end delivery of an enterprise risk and performance analytics platform. The platform integrates credit risk, market risk, and financial performance data into a single analytical layer, providing executive dashboards and regulatory capital calculations.",
    results:
      "Single integrated risk/finance data mart serving 500+ internal users. Real-time Basel III capital ratio monitoring. 60% reduction in manual report preparation.",
  },
  {
    id: "alternatif-bank",
    client: "Alternatif Bank",
    domain: "alternatifbank.com.tr",
    industry: "Banking & Finance",
    project: "Branch Performance & Profitability Analytics",
    technologies: ["IBM Cognos Analytics", "IBM Planning Analytics"],
    summary:
      "Delivered a branch-level performance and profitability analytics solution for Alternatif Bank, enabling management to evaluate revenue, cost, and risk metrics at granular branch and product levels.",
    results:
      "Enabled product-level P&L visibility at branch level. Improved banker incentive calculations accuracy.",
  },
  {
    id: "ziraat-bank",
    client: "Ziraat Bank",
    domain: "ziraatbank.com.tr",
    industry: "Banking & Finance",
    project: "Enterprise Data Warehouse & BI Platform",
    technologies: ["IBM InfoSphere", "IBM Cognos Analytics", "Teradata"],
    summary:
      "Architected and implemented the enterprise data warehouse and BI platform for Ziraat Bank, Turkey's largest bank by assets. The solution integrated data from core banking, CRM, and risk systems to provide unified analytical capabilities.",
    results:
      "Consolidated 15+ source systems into a single EDW. Enabled self-service analytics for 300+ business users.",
  },
  {
    id: "iyzico",
    client: "IYZICO",
    domain: "iyzico.com",
    industry: "Banking & Finance",
    project: "Payment Analytics & Merchant Intelligence Dashboard",
    technologies: ["Tableau", "Databricks", "AWS S3", "Python"],
    summary:
      "Built a real-time payment analytics and merchant intelligence dashboard for IYZICO, enabling the fintech company to monitor transaction volumes, detect anomalies, and provide merchants with performance insights.",
    results:
      "Real-time transaction monitoring across 10,000+ merchants. 30% improvement in fraud detection response time.",
  },
  {
    id: "nn-life",
    client: "NN Life",
    domain: "nn.com.tr",
    industry: "Insurance",
    project: "Actuarial & Financial Planning Platform",
    technologies: ["IBM Planning Analytics", "TM1", "SQL Server"],
    summary:
      "Implemented an actuarial and financial planning platform for NN Life Turkey, automating the translation of actuarial projections into financial plans and enabling dynamic scenario modelling for premium pricing and reserve calculations.",
    results:
      "Reduced actuarial-to-finance reporting cycle by 50%. Enabled monthly rolling forecast with scenario comparison.",
  },
  {
    id: "mapfre",
    client: "Mapfre",
    domain: "mapfre.com.tr",
    industry: "Insurance",
    project: "Claims Analytics & Loss Ratio Optimization",
    technologies: ["IBM Cognos Analytics", "IBM Planning Analytics", "Oracle"],
    summary:
      "Delivered a claims analytics solution for Mapfre Turkey, providing actuaries and claims managers with deep visibility into loss ratios, claims frequency, and reserve adequacy across all product lines.",
    results:
      "Identified 15% improvement opportunity in claims reserves. Reduced loss ratio reporting time from 2 weeks to 2 days.",
  },
  {
    id: "sompo-sigorta",
    client: "Sompo Sigorta",
    domain: "sompo.com.tr",
    industry: "Insurance",
    project: "Reinsurance Analytics & Treaty Management",
    technologies: ["Tableau", "SQL Server", "Python"],
    summary:
      "Built a reinsurance analytics and treaty management dashboard for Sompo Sigorta, enabling underwriters and reinsurance managers to track cession rates, recoveries, and net retained risk across all treaties.",
    results:
      "Full visibility into reinsurance program performance. Automated cession calculation reducing errors by 90%.",
  },
  {
    id: "vodafone",
    client: "Vodafone",
    domain: "vodafone.com",
    industry: "Telecom",
    project: "Customer Lifetime Value & Churn Prediction Platform",
    technologies: ["Databricks", "Python", "Spark", "Tableau", "AWS"],
    summary:
      "Designed and deployed a customer lifetime value scoring and churn prediction platform for Vodafone Turkey, leveraging machine learning models to identify at-risk customers and optimize retention campaigns.",
    results:
      "15% reduction in voluntary churn for targeted segments. CLV model deployed to 25M+ active subscribers. 3x improvement in retention campaign ROI.",
  },
  {
    id: "charter-communications",
    client: "Charter Communications",
    domain: "charter.com",
    industry: "Telecom",
    project: "Subscriber Analytics & Network Performance Dashboard",
    technologies: ["Tableau", "Databricks", "AWS Redshift", "Python"],
    summary:
      "Implemented a subscriber analytics and network performance dashboard for Charter Spectrum, integrating billing, network, and customer service data to provide unified visibility into subscriber health and service quality.",
    results:
      "Reduced average handle time by 20% through better agent dashboards. Network-to-billing correlation enabled 25% faster fault resolution.",
  },
  {
    id: "turk-telekom",
    client: "Türk Telekom",
    domain: "turktelekom.com.tr",
    industry: "Telecom",
    project: "Enterprise Financial Planning & Consolidation",
    technologies: ["IBM Planning Analytics", "IBM Cognos Controller"],
    summary:
      "Implemented enterprise financial planning and consolidation for Türk Telekom Group, covering budget planning, quarterly forecasting, and statutory consolidation across the group's 10+ legal entities.",
    results:
      "Group consolidation cycle reduced from 15 days to 4 days. Automated IFRS adjustment calculations.",
  },
  {
    id: "haleon",
    client: "Haleon",
    domain: "haleon.com",
    industry: "Pharma & Biotech",
    project: "Commercial Analytics & Market Intelligence Platform",
    technologies: ["Tableau", "Databricks", "Alteryx", "AWS"],
    summary:
      "Built a global commercial analytics and market intelligence platform for Haleon (formerly GSK Consumer Healthcare), integrating sell-in, sell-out, market share, and competitor data across 25 markets into a single Tableau-based intelligence layer.",
    results:
      "25 markets on single platform. 40% reduction in time-to-insight for commercial decisions. Automated data refresh replacing 80+ manual Excel reports.",
  },
  {
    id: "roche-forecasting",
    client: "Roche",
    domain: "roche.com",
    industry: "Pharma & Biotech",
    project: "Global Demand Forecasting & Supply Chain Analytics",
    technologies: ["Databricks", "Python", "Tableau", "Azure"],
    summary:
      "Developed a global demand forecasting and supply chain analytics platform for Roche, combining statistical forecasting models with market intelligence to improve supply planning accuracy for 40+ oncology products.",
    results:
      "Forecast accuracy improved by 22%. Inventory holding costs reduced by $18M annually. Automated consensus forecasting process.",
  },
  {
    id: "roche-patient",
    client: "Roche",
    domain: "roche.com",
    industry: "Pharma & Biotech",
    project: "Patient Journey Analytics",
    technologies: ["Databricks", "Python", "Tableau", "Azure"],
    summary:
      "Designed a patient journey analytics solution for Roche, mapping treatment pathways, time-to-treatment, and therapy switching patterns using real-world evidence data from US healthcare claims.",
    results:
      "Identified 3 key intervention points to improve patient outcomes. Informed commercial strategy for new product launch.",
  },
  {
    id: "novartis",
    client: "Novartis",
    domain: "novartis.com",
    industry: "Pharma & Biotech",
    project: "Integrated Commercial Reporting Platform",
    technologies: ["Tableau", "Alteryx", "AWS S3", "Python"],
    summary:
      "Implemented an integrated commercial reporting platform for Novartis Turkey, consolidating sales force activity, market access, and market share data to provide brand teams with unified performance dashboards.",
    results:
      "Brand performance reporting reduced from weekly manual process to daily automated updates. Sales force deployment optimized based on territory analytics.",
  },
  {
    id: "amgen",
    client: "Amgen",
    domain: "amgen.com",
    industry: "Pharma & Biotech",
    project: "Rare Disease Patient Identification & Market Access Analytics",
    technologies: ["Python", "Tableau", "Databricks", "AWS"],
    summary:
      "Built a patient identification and market access analytics platform for Amgen's rare disease portfolio, using claims data and physician-level analytics to identify undiagnosed patient populations and optimize access programs.",
    results:
      "Identified 40% more eligible patients versus traditional methods. Reduced time to first prescription by 30 days on average.",
  },
  {
    id: "commonwealth-care-alliance",
    client: "Commonwealth Care Alliance",
    domain: "commonwealthcare.org",
    industry: "Insurance",
    project: "Population Health Management & Risk Stratification Platform",
    technologies: ["Databricks", "Python", "Tableau", "AWS"],
    summary:
      "Developed a population health management and risk stratification platform for Commonwealth Care Alliance, enabling care managers to identify high-risk members, predict hospitalizations, and optimize care intervention programs.",
    results:
      "15% reduction in preventable hospital admissions. Identified 8,000 high-risk members for proactive care management. $12M estimated savings in year 1.",
  },
  {
    id: "electrocore",
    client: "ElectroCore",
    domain: "electrocore.com",
    industry: "Pharma & Biotech",
    project: "Real-World Evidence Analytics Platform",
    technologies: ["Python", "Tableau", "AWS", "SQL"],
    summary:
      "Built a real-world evidence analytics platform for ElectroCore, aggregating clinical trial data, EHR extracts, and claims data to demonstrate the real-world effectiveness of vagus nerve stimulation therapy.",
    results:
      "RWE package supporting payer submissions in 5 markets. 60% improvement in payer engagement outcomes.",
  },
  {
    id: "coca-cola",
    client: "Coca-Cola",
    domain: "coca-cola.com",
    industry: "Retail",
    project: "Route-to-Market Analytics & Sales Force Effectiveness",
    technologies: ["Tableau", "Alteryx", "SQL Server", "Python"],
    summary:
      "Delivered a route-to-market analytics and sales force effectiveness platform for Coca-Cola Turkey, enabling territory managers to optimize outlet coverage, track cooler performance, and measure sales execution quality.",
    results:
      "Sales force coverage improved by 18%. Cooler asset utilization increased by 25%. Route optimization reduced logistics costs by 12%.",
  },
  {
    id: "koctas",
    client: "Koçtaş",
    domain: "koctas.com.tr",
    industry: "Retail",
    project: "Retail Analytics & Store Performance Platform",
    technologies: ["IBM Cognos Analytics", "SQL Server", "Oracle Retail"],
    summary:
      "Implemented a retail analytics and store performance platform for Koçtaş (Turkey's leading DIY retailer), integrating POS, inventory, and CRM data to provide store managers and category teams with real-time performance visibility.",
    results:
      "Store-level P&L visibility for 120+ stores. Category performance insights reduced slow-moving inventory by 20%.",
  },
  {
    id: "pepsi",
    client: "Pepsi (Frito-Lay)",
    domain: "pepsi.com",
    industry: "Retail",
    project: "Trade Promotion Analytics & ROI Measurement",
    technologies: ["Alteryx", "Tableau", "SQL Server"],
    summary:
      "Built a trade promotion analytics and ROI measurement solution for Frito-Lay Turkey, enabling the commercial team to evaluate the incremental impact of promotions, optimize trade investment allocation, and benchmark performance across key accounts.",
    results:
      "Trade promotion ROI improved by 22%. Promotion evaluation time reduced from 3 weeks to 2 days.",
  },
  {
    id: "oyak-cement",
    client: "OYAK Cement",
    domain: "oyak.com.tr",
    industry: "Manufacturing",
    project: "Group Financial Consolidation & Performance Reporting",
    technologies: ["IBM Cognos Controller", "IBM Planning Analytics"],
    summary:
      "Implemented group financial consolidation and performance reporting for OYAK Cement Group, covering statutory consolidation, management reporting, and KPI dashboards across 8 cement plants and international subsidiaries.",
    results:
      "Consolidated reporting reduced from 20 days to 5 days. Standardized KPI framework across all plants.",
  },
  {
    id: "enerjisa",
    client: "Enerjisa",
    domain: "enerjisa.com.tr",
    industry: "Manufacturing",
    project: "Energy Analytics & Grid Performance Platform",
    technologies: ["Databricks", "Python", "Tableau", "Azure"],
    summary:
      "Developed an energy analytics and grid performance platform for Enerjisa (Turkey's leading energy distribution company), enabling real-time monitoring of grid performance, outage prediction, and demand forecasting.",
    results:
      "Outage prediction accuracy improved by 35%. Demand forecasting error reduced by 18%. Enabled predictive maintenance scheduling.",
  },
  {
    id: "zorlu",
    client: "Zorlu",
    domain: "zorlu.com.tr",
    industry: "Manufacturing",
    project: "Manufacturing Performance & OEE Analytics",
    technologies: ["IBM Cognos Analytics", "SQL Server", "SAP integration"],
    summary:
      "Implemented a manufacturing performance and OEE (Overall Equipment Effectiveness) analytics platform for Zorlu Group, connecting shop-floor data with financial KPIs to provide integrated operational and financial performance views.",
    results:
      "OEE improved by 8% through data-driven maintenance scheduling. Integration of SAP and shop-floor data eliminated manual reporting.",
  },
  {
    id: "balparmak",
    client: "Balparmak",
    domain: "balparmak.com.tr",
    industry: "Retail",
    project: "Supply Chain & Distribution Analytics",
    technologies: ["Tableau", "SQL Server", "Python"],
    summary:
      "Built supply chain and distribution analytics for Balparmak, Turkey's largest honey brand, enabling the company to optimize inventory levels, track distributor performance, and improve demand-supply matching.",
    results:
      "Inventory turnover improved by 15%. Distributor performance visibility enabled 10% reduction in stockouts.",
  },
  {
    id: "mng-kargo",
    client: "MNG Kargo",
    domain: "mngkargo.com.tr",
    industry: "Other",
    project: "Logistics Network Analytics & Last-Mile Optimization",
    technologies: ["Databricks", "Python", "Tableau", "AWS"],
    summary:
      "Designed a logistics network analytics and last-mile optimization platform for MNG Kargo, enabling operations managers to analyze route efficiency, predict delivery times, and optimize courier allocation across 80+ distribution hubs.",
    results:
      "On-time delivery rate improved by 12%. Courier productivity increased by 18%. Fuel costs reduced by 9% through route optimization.",
  },
  {
    id: "vakifbank-crm",
    client: "VakıfBank",
    domain: "vakifbank.com.tr",
    industry: "Banking & Finance",
    project: "Customer Analytics & CRM Intelligence Platform",
    technologies: ["IBM Cognos Analytics", "Python", "Oracle"],
    summary:
      "Built a customer analytics and CRM intelligence platform for VakıfBank, enabling relationship managers to identify cross-sell opportunities, track customer profitability, and segment the customer base for targeted campaigns.",
    results:
      "Cross-sell conversion rates improved by 28%. Customer profitability scoring deployed to 15M+ customers.",
  },
  {
    id: "vakifbank-risk",
    client: "VakıfBank",
    domain: "vakifbank.com.tr",
    industry: "Banking & Finance",
    project: "Credit Risk Analytics & IFRS 9 Reporting",
    technologies: ["IBM Cognos Analytics", "Python", "Oracle", "SAS"],
    summary:
      "Implemented credit risk analytics and IFRS 9 reporting capabilities for VakıfBank, automating the calculation of Expected Credit Loss (ECL) provisions, Stage classification, and regulatory disclosures.",
    results:
      "IFRS 9 reporting cycle reduced from 3 weeks to 4 days. ECL model validated and approved by external auditors.",
  },
  {
    id: "fibabanka",
    client: "Fibabanka",
    domain: "fibabanka.com",
    industry: "Banking & Finance",
    project: "Enterprise Data Warehouse & Management Reporting",
    technologies: ["IBM Cognos Analytics", "Teradata", "SQL Server"],
    summary:
      "Designed and implemented the enterprise data warehouse and management reporting platform for Fibabanka, consolidating retail, commercial, and treasury data to provide executive and board-level reporting.",
    results:
      "Single EDW serving all management reporting needs. Monthly management pack automated reducing preparation time by 70%.",
  },
  {
    id: "digiturk",
    client: "Digiturk",
    domain: "digiturk.com.tr",
    industry: "Media",
    project: "Subscriber Analytics & Content Performance Platform",
    technologies: ["Tableau", "Databricks", "AWS", "Python"],
    summary:
      "Built a subscriber analytics and content performance platform for Digiturk, Turkey's leading pay-TV operator, enabling the marketing team to analyze viewing behavior, measure content ROI, and optimize acquisition and retention campaigns.",
    results:
      "Churn prediction model reduced voluntary churn by 18%. Content investment decisions informed by 50M+ viewing events per day.",
  },
  {
    id: "siriusxm",
    client: "SiriusXM",
    domain: "siriusxm.com",
    industry: "Media",
    project: "Subscriber Lifetime Value & Retention Analytics",
    technologies: ["Databricks", "Python", "Tableau", "AWS Redshift"],
    summary:
      "Developed a subscriber lifetime value and retention analytics platform for SiriusXM, enabling the data science team to build CLV models, identify churn risk segments, and measure the impact of retention interventions.",
    results:
      "CLV model accuracy improved by 30%. Retention program ROI increased by $45M annually. Automated A/B test analysis framework.",
  },
  {
    id: "istanbul-municipality",
    client: "Istanbul Metropolitan Municipality",
    domain: "ibb.gov.tr",
    industry: "Government",
    project: "Smart City Analytics & Urban Performance Dashboard",
    technologies: ["IBM Cognos Analytics", "ArcGIS", "SQL Server"],
    summary:
      "Implemented a smart city analytics and urban performance dashboard for Istanbul Metropolitan Municipality, integrating data from transportation, utilities, public services, and citizen feedback channels to support data-driven urban management decisions.",
    results:
      "Unified view of 50+ city services in single dashboard. Decision-making cycle for urban investments reduced by 40%.",
  },
];
