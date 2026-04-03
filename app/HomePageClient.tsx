"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, ExternalLink, Database, TrendingUp, BarChart3 } from "lucide-react";

const services = [
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
  },
];

const products = [
  {
    name: "Obserian",
    href: "https://obserian.com",
    internalHref: "/products/obserian",
    tagline: "Validate. Monitor. Trust.",
    description:
      "AI-powered data quality and governance platform. Automated validation, lineage tracking, and compliance reporting at enterprise scale.",
    logo: "/logos/products/obserian.svg",
    color: "#7454A2",
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
  },
];

const selectedWork = [
  {
    industry: "Pharma & Biotech",
    project: "Commercial Analytics & Market Intelligence Platform",
    result: "25 markets on single platform. 40% reduction in time-to-insight.",
    href: "/use-cases",
    tags: ["Tableau", "Databricks", "Alteryx"],
  },
  {
    industry: "Banking & Finance",
    project: "ARGUS – Enterprise Risk & Performance Analytics",
    result: "Real-time Basel III monitoring. 60% less manual report preparation.",
    href: "/use-cases",
    tags: ["IBM Cognos", "Planning Analytics", "Python"],
  },
  {
    industry: "Banking & Finance",
    project: "Integrated Budget Planning & Forecasting",
    result: "Budget cycle reduced from 6 weeks to 10 days.",
    href: "/use-cases",
    tags: ["IBM TM1", "Planning Analytics"],
  },
];

const partners = [
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

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

export default function HomePageClient() {
  return (
    <>
      {/* What We Do */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="text-center mb-16"
          >
            <motion.p variants={fadeUp} className="text-sm font-medium text-brand-magenta uppercase tracking-widest mb-2">
              What We Do
            </motion.p>
            <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl font-extrabold text-brand-dark mb-4">
              Expertise at Every Layer of Your Data Stack
            </motion.h2>
            <motion.p variants={fadeUp} className="text-lg text-text-muted max-w-2xl mx-auto">
              From raw data infrastructure to C-suite decision intelligence — we cover the full analytics spectrum.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {services.map((service) => {
              const Icon = service.icon;
              return (
                <motion.div key={service.title} variants={fadeUp}>
                  <Link
                    href={service.href}
                    className={`group block h-full p-6 sm:p-8 bg-gradient-to-br ${service.gradient} rounded-2xl border hover:shadow-2xl transition-all duration-300 relative overflow-hidden`}
                    style={{ borderColor: `${service.accent}30` }}
                  >
                    {/* Hover glow */}
                    <div
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"
                      style={{ background: `radial-gradient(circle at 20% 80%, ${service.accent}20 0%, transparent 60%)` }}
                    />
                    {/* Top accent line */}
                    <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl" style={{ background: service.accent }} />
                    <div className="relative z-10">
                      <div
                        className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6"
                        style={{ background: `${service.accent}22`, border: `1px solid ${service.accent}40` }}
                      >
                        <Icon size={26} style={{ color: service.accent }} />
                      </div>
                      <h3 className="text-xl font-bold text-white mb-3">
                        {service.title}
                      </h3>
                      <p className="text-sm text-gray-300 leading-relaxed mb-5">
                        {service.description}
                      </p>
                      <div className="flex flex-wrap gap-2 mb-5">
                        {service.tags.map((tag) => (
                          <span key={tag} className="text-xs px-2.5 py-1 rounded-md font-medium" style={{ background: `${service.accent}18`, border: `1px solid ${service.accent}35`, color: service.accent }}>
                            {tag}
                          </span>
                        ))}
                      </div>
                      <div className="flex items-center gap-1.5 text-sm font-semibold" style={{ color: service.accent }}>
                        Learn more <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Our Products */}
      <section
        className="py-24 relative overflow-hidden"
        style={{ background: "linear-gradient(160deg, #1A1A2E 0%, #0D3A5C 60%, #1A1A2E 100%)" }}
      >
        {/* Background decoration */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] opacity-5 rounded-full"
            style={{ background: "radial-gradient(circle, #1A6FA8 0%, transparent 70%)", transform: "translate(30%, -30%)" }} />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] opacity-5 rounded-full"
            style={{ background: "radial-gradient(circle, #E91E8C 0%, transparent 70%)", transform: "translate(-30%, 30%)" }} />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="text-center mb-14"
          >
            <motion.p variants={fadeUp} className="text-sm font-medium text-brand-magenta uppercase tracking-widest mb-2">
              Our Products
            </motion.p>
            <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
              Built for Enterprise Scale
            </motion.h2>
            <motion.p variants={fadeUp} className="text-lg text-gray-400 max-w-2xl mx-auto">
              Purpose-built platforms that extend the reach of our consulting expertise.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {products.map((product) => (
              <motion.div key={product.name} variants={fadeUp} className="group">
                <div
                  className="h-full rounded-2xl p-6 sm:p-8 border transition-all duration-300 relative overflow-hidden"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    borderColor: "rgba(255,255,255,0.10)",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLDivElement).style.borderColor = `${product.color}60`;
                    (e.currentTarget as HTMLDivElement).style.background = "rgba(255,255,255,0.08)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(255,255,255,0.10)";
                    (e.currentTarget as HTMLDivElement).style.background = "rgba(255,255,255,0.04)";
                  }}
                >
                  <div
                    className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-0 group-hover:opacity-10 transition-opacity duration-500"
                    style={{ background: product.color, transform: "translate(30%, -30%)" }}
                  />
                  <div className="relative z-10">
                    <div className="mb-6 pb-5 border-b border-white/10">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={product.logo}
                        alt={product.name}
                        className="h-9 w-auto max-w-[150px] object-contain"
                      />
                    </div>
                    <div className="mb-1 text-xs font-medium text-gray-400 italic">
                      {product.tagline}
                    </div>
                    <h3 className="text-xl font-bold text-white mb-3">{product.name}</h3>
                    <p className="text-sm text-gray-400 leading-relaxed mb-6">
                      {product.description}
                    </p>
                    <div className="flex flex-col gap-2">
                      <Link
                        href={product.internalHref}
                        className="inline-flex items-center gap-1.5 text-sm font-semibold transition-colors"
                        style={{ color: product.color }}
                      >
                        Learn more <ArrowRight size={14} />
                      </Link>
                      <a
                        href={product.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-300 transition-colors"
                      >
                        Visit website <ExternalLink size={12} />
                      </a>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Selected Work */}
      <section className="py-24 bg-[#F7F8FA]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="flex flex-col sm:flex-row sm:items-end justify-between mb-14"
          >
            <div>
              <motion.p variants={fadeUp} className="text-sm font-medium text-brand-magenta uppercase tracking-widest mb-2">
                Selected Work
              </motion.p>
              <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl font-extrabold text-brand-dark">
                Proven Impact Across Industries
              </motion.h2>
            </div>
            <motion.div variants={fadeUp} className="mt-4 sm:mt-0">
              <Link
                href="/use-cases"
                className="inline-flex items-center gap-2 text-sm font-semibold text-brand-primary hover:text-brand-dark transition-colors"
              >
                View all use cases <ArrowRight size={16} />
              </Link>
            </motion.div>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {selectedWork.map((work) => (
              <motion.div key={work.project} variants={fadeUp}>
                <Link
                  href={work.href}
                  className="group block h-full bg-white rounded-2xl p-8 border border-gray-200 hover:border-brand-primary hover:shadow-xl transition-all duration-300 relative overflow-hidden"
                >
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-primary scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                  <span className="inline-block text-xs font-semibold text-brand-primary bg-brand-primary/10 px-3 py-1 rounded-full mb-5">
                    {work.industry}
                  </span>
                  <h3 className="text-xl font-extrabold text-brand-dark mb-4 group-hover:text-brand-primary transition-colors">
                    {work.project}
                  </h3>
                  <p className="text-sm text-text-body mb-5 leading-relaxed font-medium border-l-2 border-brand-magenta pl-3">
                    {work.result}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {work.tags.map((tag) => (
                      <span key={tag} className="text-xs px-2.5 py-1 bg-brand-light rounded-md border border-gray-200 text-text-muted">
                        {tag}
                      </span>
                    ))}
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Technology Partners */}
      <section className="py-16 bg-white border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-10"
          >
            <p className="text-xs font-semibold text-text-muted uppercase tracking-widest">
              Technology Partners
            </p>
          </motion.div>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="flex flex-wrap justify-center gap-4"
          >
            {partners.map((partner) => (
              <motion.div
                key={partner.name}
                variants={fadeUp}
                className="w-[150px] h-[80px] bg-[#F7F8FA] rounded-xl border border-gray-200 hover:border-brand-primary hover:shadow-md hover:bg-white transition-all cursor-default flex items-center justify-center"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={partner.logo}
                  alt={partner.name}
                  className="max-h-10 max-w-[110px] w-auto object-contain"
                />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
    </>
  );
}
