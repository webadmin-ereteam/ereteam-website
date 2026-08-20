import { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Database, TrendingUp, BarChart3 } from "lucide-react";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Ereteam's enterprise data and analytics services: Data, Cloud & AI, Financial Performance & Intelligence, and Marketing Intelligence.",
};

const services = [
  {
    icon: Database,
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
    tags: ["IBM", "AWS", "Databricks", "Snowflake", "HCL Software"],
    color: "bg-white border-gray-200 hover:border-[#38bdf8]/50",
    iconBg: "bg-[#38bdf8]/10",
    iconColor: "text-[#38bdf8]",
  },
  {
    icon: TrendingUp,
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
    tags: ["IBM Planning Analytics", "TM1", "IBM Cognos", "SAP"],
    color: "bg-white border-gray-200 hover:border-[#10b981]/50",
    iconBg: "bg-[#10b981]/10",
    iconColor: "text-[#10b981]",
  },
  {
    icon: BarChart3,
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
    tags: ["Tableau", "Alteryx", "DataRobot", "Databricks"],
    color: "bg-white border-gray-200 hover:border-[#f472b6]/50",
    iconBg: "bg-[#f472b6]/10",
    iconColor: "text-[#f472b6]",
  },
];

export default function ServicesPage() {
  return (
    <>
      {/* Hero */}
      {/* Hero */}
      <section
        className="site-overview-hero"
        style={{ background: "linear-gradient(135deg, #0a1628 0%, #1a2a5e 100%)" }}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm font-medium text-[#38bdf8] uppercase tracking-widest mb-4">
            Our Services
          </p>
          <h1 className="site-page-title mb-6 text-white">
            Expertise at Every Layer of{" "}
            <span style={{ background: "linear-gradient(90deg, #1A6FA8, #38bdf8, #0C9472)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Your Data Stack
            </span>
          </h1>
          <p className="site-page-lead mx-auto max-w-2xl text-gray-300">
            From raw data infrastructure to C-suite decision intelligence, Ereteam
            delivers end-to-end analytics capabilities built on 25 years of enterprise
            expertise.
          </p>
        </div>
      </section>

      {/* Service Cards */}
      <section className="py-20 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {services.map((service) => {
              const Icon = service.icon;
              return (
                <Link
                  key={service.title}
                  href={service.href}
                  className={`group block rounded-2xl p-8 border ${service.color} hover:shadow-xl transition-all duration-300`}
                >
                  <div
                    className={`w-14 h-14 ${service.iconBg} rounded-2xl flex items-center justify-center mb-6`}
                  >
                    <Icon size={28} className={service.iconColor} />
                  </div>
                  <h2 className={`text-xl font-bold text-brand-dark mb-4 transition-colors ${service.iconColor.replace('text', 'group-hover:text')}`}>
                    {service.title}
                  </h2>
                  <p className="text-sm text-text-body leading-relaxed mb-6">
                    {service.description}
                  </p>
                  <ul className="space-y-3 mb-8">
                    {service.capabilities.map((cap) => (
                      <li
                        key={cap}
                        className="flex items-center gap-3 text-sm text-text-muted"
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${service.iconColor.replace('text-', 'bg-')} flex-shrink-0 opacity-80`} />
                        {cap}
                      </li>
                    ))}
                  </ul>
                  <div className="flex flex-wrap gap-2 mb-8">
                    {service.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-xs px-3 py-1.5 bg-gray-50 rounded-md border border-gray-200 text-gray-500"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className={`flex items-center gap-1.5 text-sm font-semibold ${service.iconColor}`}>
                    Explore service{" "}
                    <ArrowRight
                      size={16}
                      className="group-hover:translate-x-1 transition-transform"
                    />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Why Ereteam */}
      <section className="py-24 bg-brand-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-sm font-medium text-brand-primary uppercase tracking-widest mb-3">
              Why Ereteam
            </p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-brand-dark mb-4">
              What Sets Us Apart
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: "Deep Domain Expertise",
                desc: "25 years of specialized focus on enterprise data and analytics — not a generalist IT firm.",
              },
              {
                title: "Technology Agnostic",
                desc: "We select the best tool for your needs, backed by certifications across IBM, AWS, Databricks, Alteryx, and more.",
              },
              {
                title: "Industry-Specific Frameworks",
                desc: "Proven accelerators for banking, insurance, pharma, retail, and telecom built from real-world implementations.",
              },
              {
                title: "Global Delivery",
                desc: "US headquarters with Türkiye operations — bridging world-class expertise with cost-effective delivery.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="bg-white rounded-2xl p-8 border border-gray-200 hover:border-brand-primary/50 transition-colors shadow-sm"
              >
                <h3 className="text-lg font-bold text-brand-dark mb-3">
                  {item.title}
                </h3>
                <p className="text-sm text-text-muted leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
