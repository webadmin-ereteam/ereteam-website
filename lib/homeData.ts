import { Database, TrendingUp, BarChart3 } from "lucide-react";

export const services = [
  {
    icon: Database,
    title: "Data, Cloud & AI",
    href: "/services/data-cloud-ai",
    description:
      "Modern data architecture, cloud migration, AI/ML solutions, and data governance. We help you build the data foundation your business needs to compete.",
    tags: ["IBM", "AWS", "Databricks", "Snowflake"],
    gradient: "from-[#0D3A5C] to-[#0a2540]",
    accent: "#38bdf8",
    textLight: true,
    image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=1000",
  },
  {
    icon: TrendingUp,
    title: "Financial Performance & Intelligence",
    href: "/services/financial-performance-intelligence",
    description:
      "Integrated FP&A, budgeting, forecasting, and financial consolidation. Transform your finance function with data-driven insights.",
    tags: ["IBM Planning Analytics", "TM1", "Cognos"],
    gradient: "from-[#1A1A2E] to-[#2e1065]",
    accent: "#a78bfa",
    textLight: true,
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=1000",
  },
  {
    icon: BarChart3,
    title: "Marketing Intelligence",
    href: "/services/marketing-intelligence",
    description:
      "Marketing analytics, campaign intelligence, attribution modelling, and ROI optimization. Turn your marketing spend into competitive advantage.",
    tags: ["Tableau", "Alteryx", "DataRobot"],
    gradient: "from-[#1a0a14] to-[#3d0028]",
    accent: "#f472b6",
    textLight: true,
    image: "https://images.unsplash.com/photo-1542744094-2a52c02285e6?auto=format&fit=crop&q=80&w=1000",
  },
];

export const products = [
  {
    name: "Obserian",
    href: "https://obserian.com",
    internalHref: "/products/obserian",
    tagline: "Validate. Monitor. Trust.",
    description:
      "AI-powered data quality and governance platform. Automated validation, lineage tracking, and compliance reporting at enterprise scale.",
    logo: "/logos/products/obserian.svg",
    color: "#7454A2",
    image: "/images/ai/product_obserian.png",
  },
  {
    name: "Pharmeta",
    href: "https://pharmeta.io",
    internalHref: "/products/pharmeta",
    tagline: "Your data is costing you money.",
    description:
      "AI-powered product & customer data management for pharma & FMCG. Clean, match, and certify golden records at scale.",
    logo: "/logos/products/pharmeta_logo.png",
    color: "#5B8ED6",
    image: "/images/ai/product_pharmeta.png",
  },
  {
    name: "Maturytics",
    href: "https://maturytics.com",
    internalHref: "/products/maturytics",
    tagline: "Step up your Maturity.",
    description:
      "SaaS platform for data & analytics maturity assessments. From signal to strategy in one platform.",
    logo: "/logos/products/maturytics.svg",
    color: "#F15A29",
    image: "/images/ai/product_maturytics.png",
  },
];

export const selectedWork = [
  {
    industry: "Pharma & Biotech",
    project: "Commercial Analytics & Market Intelligence Platform",
    result: "25 markets on single platform. 40% reduction in time-to-insight.",
    href: "/use-cases",
    tags: ["Tableau", "Databricks", "Alteryx"],
    image: "/images/ai/work_pharma.png",
  },
  {
    industry: "Banking & Finance",
    project: "Enterprise Risk & Performance Analytics",
    result: "Real-time Basel III monitoring. 60% less manual report preparation.",
    href: "/use-cases",
    tags: ["IBM Cognos", "Planning Analytics", "Python"],
    image: "/images/ai/work_finance1.png",
  },
  {
    industry: "Banking & Finance",
    project: "Integrated Budget Planning & Forecasting",
    result: "Budget cycle reduced from 6 weeks to 10 days.",
    href: "/use-cases",
    tags: ["IBM TM1", "Planning Analytics"],
    image: "/images/ai/work_finance2.png",
  },
];

export const partners = [
  { name: "IBM", logo: "/logos/partners/ibm.png" },
  { name: "AWS", logo: "/logos/partners/aws.png" },
  { name: "HCL Software", logo: "/logos/partners/hcl.png" },
  { name: "Databricks", logo: "/logos/partners/databricks.png" },
  { name: "Alteryx", logo: "/logos/partners/alteryx.png" },
  { name: "Tableau", logo: "/logos/partners/tableau.png" },
  { name: "DataRobot", logo: "/logos/partners/Datarobot_logo.png" },
  { name: "Snowflake", logo: "/logos/partners/snowflake.png" },
  { name: "Apparo", logo: "/logos/partners/apparo.png" },
  { name: "Theobald Software", logo: "/logos/partners/theobald.png" },
];
