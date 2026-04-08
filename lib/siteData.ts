// Single source of truth for company data.
// Update here → chat assistant + any page importing from here stays in sync.

export const company = {
  name: "Ereteam",
  founded: 2001,
  yearsOfExpertise: "25+",
  professionals: "80+",
  enterpriseClients: "100+",
  countries: "17",
  projects: "200+",
  proprietaryProducts: 3,
  hq: "New Jersey, USA",
  operations: "Istanbul, Turkey",
};

export const contact = {
  email: "info@ereteam.com",
  us: {
    label: "US Headquarters",
    name: "Ereteam Analytics USA HQ",
    address: "39 Woodbrook Circle, Westfield, NJ 07090, New Jersey, USA",
    phone: "+1 (973) 349 3440",
    tel: "+19733493440",
  },
  tr: {
    label: "Operations Center",
    name: "Ereteam Operations Center",
    address: "Mehmet Akif Mah. Tavukçuyolu Cad. No:150 K:2 D:3, Ümraniye / İstanbul, Türkiye",
    phone: "+90 216 518 44 40",
    tel: "+902165184440",
  },
};

export const industries = [
  "Banking & Finance",
  "Insurance",
  "Telecom",
  "Pharma & Biotech",
  "Retail",
  "Manufacturing",
  "Media",
  "Government",
];

export const notableClients = [
  "ING Bank", "Halkbank", "Akbank", "Ziraat Bank", "VakıfBank",
  "Vodafone", "Türk Telekom",
  "Roche", "Novartis", "Haleon", "Amgen",
  "Coca-Cola", "Koçtaş", "OYAK Cement", "Enerjisa", "Digiturk",
  "SiriusXM", "Istanbul Metropolitan Municipality",
];

export const services = [
  {
    title: "Data, Cloud & AI",
    href: "/services/data-cloud-ai",
    description:
      "Build a modern, scalable data foundation with cloud-native architecture, AI/ML solutions, and enterprise data governance. From strategy to implementation, we deliver the data infrastructure that powers smarter decisions.",
    capabilities: [
      "Data Strategy & Architecture",
      "Cloud Migration & Modernization",
      "AI & Machine Learning",
      "Data Governance & Quality",
      "Self-Service Analytics",
    ],
    technologies: ["IBM", "AWS", "Databricks", "Snowflake", "HCL Software"],
  },
  {
    title: "Financial Performance & Intelligence",
    href: "/services/financial-performance-intelligence",
    description:
      "Transform your finance function with integrated FP&A, budgeting, forecasting, and financial consolidation. We help CFOs and finance teams make faster, more confident decisions with data-driven insights.",
    capabilities: [
      "Integrated FP&A & Budgeting",
      "Financial Consolidation",
      "Profitability Analytics",
      "Regulatory Reporting",
      "Management Reporting",
    ],
    technologies: ["IBM Planning Analytics", "TM1", "IBM Cognos", "SAP"],
  },
  {
    title: "Marketing Intelligence",
    href: "/services/marketing-intelligence",
    description:
      "Turn marketing spend into competitive advantage with advanced analytics, attribution modelling, and campaign intelligence. We help marketing teams understand what works and optimize every dollar of investment.",
    capabilities: [
      "Marketing Mix Modelling",
      "Campaign Performance Analytics",
      "Customer Segmentation",
      "Digital Analytics & Attribution",
      "Trade Promotion Analytics",
    ],
    technologies: ["Tableau", "Alteryx", "DataRobot", "Databricks"],
  },
];

export const products = [
  {
    name: "Obserian",
    tagline: "Enterprise Data Governance Platform",
    href: "/products/obserian",
    externalHref: "https://obserian.com",
    description:
      "AI-powered data quality and governance platform that automates validation rules, tracks data lineage end-to-end, and provides compliance reporting — all at enterprise scale. Deployed across financial services, pharma, and telecom organizations worldwide.",
    capabilities: [
      "Automated data quality validation",
      "End-to-end data lineage tracking",
      "Business metadata management",
      "Compliance & audit reporting",
      "Real-time quality dashboards",
    ],
    deploymentOptions: ["Cloud (AWS, Azure, GCP)", "On-Premise", "Hybrid"],
  },
  {
    name: "Pharmeta",
    tagline: "AI-Powered Data Platform",
    href: "/products/pharmeta",
    externalHref: "https://pharmeta.io",
    description:
      "AI-powered SKU and product data management platform. Pharmeta solves distributor data chaos — automatically matching, cleaning, and certifying product records across markets so your team works from a single golden record.",
    capabilities: [
      "AI-powered SKU matching & harmonization",
      "Golden record creation & certification",
      "Multi-market & multi-distributor support",
      "Automated data quality scoring",
      "Secure by design, enterprise-ready",
    ],
    deploymentOptions: ["Cloud (SaaS)", "Enterprise License"],
  },
  {
    name: "Maturytics",
    tagline: "Data Maturity Assessment Platform",
    href: "/products/maturytics",
    externalHref: "https://maturytics.com",
    description:
      "Assess your organization's data and analytics maturity across 5 dimensions. Provides a structured assessment framework, generates actionable improvement roadmaps, and tracks progress over time — helping data leaders make the case for investment and prioritize initiatives.",
    capabilities: [
      "5-dimension maturity framework",
      "Industry-calibrated maturity scoring",
      "Automated roadmap generation",
      "Progress tracking over time",
      "Executive presentation output",
    ],
    deploymentOptions: ["SaaS (Cloud)", "Enterprise License"],
  },
];

export const pages = [
  { label: "Services overview", path: "/services" },
  { label: "Data, Cloud & AI service", path: "/services/data-cloud-ai" },
  { label: "Financial Performance & Intelligence service", path: "/services/financial-performance-intelligence" },
  { label: "Marketing Intelligence service", path: "/services/marketing-intelligence" },
  { label: "Products overview", path: "/products" },
  { label: "Obserian product", path: "/products/obserian" },
  { label: "Pharmeta product", path: "/products/pharmeta" },
  { label: "Maturytics product", path: "/products/maturytics" },
  { label: "Use Cases & client work", path: "/use-cases" },
  { label: "About Ereteam", path: "/about" },
  { label: "Careers", path: "/about/careers" },
  { label: "Contact", path: "/contact" },
  { label: "Partners", path: "/partners" },
];
