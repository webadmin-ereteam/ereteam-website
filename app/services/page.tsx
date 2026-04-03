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
    color: "bg-blue-50 border-blue-100",
    iconBg: "bg-brand-primary/10",
    iconColor: "text-brand-primary",
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
    color: "bg-green-50 border-green-100",
    iconBg: "bg-green-100",
    iconColor: "text-green-700",
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
    color: "bg-purple-50 border-purple-100",
    iconBg: "bg-brand-magenta/10",
    iconColor: "text-brand-magenta",
  },
];

export default function ServicesPage() {
  return (
    <>
      {/* Hero */}
      <section
        className="pt-32 pb-20"
        style={{
          background: "linear-gradient(135deg, #1A1A2E 0%, #0D3A5C 100%)",
        }}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm font-medium text-brand-primary uppercase tracking-widest mb-3">
            Our Services
          </p>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-6">
            Expertise at Every Layer of{" "}
            <span className="text-brand-primary">Your Data Stack</span>
          </h1>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            From raw data infrastructure to C-suite decision intelligence, Ereteam
            delivers end-to-end analytics capabilities built on 25 years of enterprise
            expertise.
          </p>
        </div>
      </section>

      {/* Service Cards */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {services.map((service) => {
              const Icon = service.icon;
              return (
                <Link
                  key={service.title}
                  href={service.href}
                  className={`group block rounded-2xl p-8 border-2 ${service.color} hover:shadow-xl hover:border-brand-primary transition-all duration-300`}
                >
                  <div
                    className={`w-14 h-14 ${service.iconBg} rounded-2xl flex items-center justify-center mb-6`}
                  >
                    <Icon size={28} className={service.iconColor} />
                  </div>
                  <h2 className="text-xl font-bold text-brand-dark mb-4 group-hover:text-brand-primary transition-colors">
                    {service.title}
                  </h2>
                  <p className="text-sm text-text-body leading-relaxed mb-6">
                    {service.description}
                  </p>
                  <ul className="space-y-2 mb-6">
                    {service.capabilities.map((cap) => (
                      <li
                        key={cap}
                        className="flex items-center gap-2 text-sm text-text-muted"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-brand-primary flex-shrink-0" />
                        {cap}
                      </li>
                    ))}
                  </ul>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {service.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-xs px-2 py-1 bg-white rounded-md border border-gray-200 text-text-muted"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center gap-1.5 text-sm font-semibold text-brand-primary">
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
      <section className="py-20 bg-brand-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-sm font-medium text-brand-magenta uppercase tracking-widest mb-2">
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
                className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm"
              >
                <h3 className="text-sm font-bold text-brand-dark mb-2">
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
