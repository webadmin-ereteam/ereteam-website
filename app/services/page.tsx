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
    accent: "#38bdf8",
    label: "Modern data foundations",
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
    accent: "#10b981",
    label: "Connected financial performance",
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
    accent: "#f472b6",
    label: "Evidence-led commercial growth",
  },
];

export default function ServicesPage() {
  return (
    <>
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

      {/* Service domains */}
      <section className="border-b border-brand-dark/10 bg-[#F2EFE8] py-20 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr] lg:items-end lg:gap-16">
            <div>
              <p className="text-sm font-medium uppercase tracking-widest text-brand-magenta">
                Service domains
              </p>
              <h2 className="site-display mt-4 max-w-xl text-4xl leading-tight text-brand-dark sm:text-5xl">
                Three disciplines. One connected capability.
              </h2>
            </div>
            <p className="max-w-2xl text-lg leading-8 text-text-muted lg:justify-self-end">
              Strategy, engineering and adoption stay connected from the first business
              question through to the capability your teams use every day.
            </p>
          </div>

          <div className="mt-14 border-t border-brand-dark/15">
            {services.map((service) => {
              const Icon = service.icon;
              return (
                <Link
                  key={service.title}
                  href={service.href}
                  className="group -mx-4 grid gap-8 border-b border-brand-dark/15 px-4 py-10 transition-colors duration-300 hover:bg-white/55 sm:py-12 lg:grid-cols-[0.82fr_1.18fr] lg:gap-16"
                >
                  <div className="flex items-start gap-5">
                    <div
                      className="flex h-12 w-12 flex-shrink-0 items-center justify-center border"
                      style={{ backgroundColor: `${service.accent}12`, borderColor: `${service.accent}35` }}
                    >
                      <Icon size={23} style={{ color: service.accent }} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[.15em]" style={{ color: service.accent }}>
                        {service.label}
                      </p>
                      <h2 className="site-display mt-3 max-w-md text-3xl leading-tight text-brand-dark sm:text-4xl">
                        {service.title}
                      </h2>
                      <div className="mt-7 inline-flex items-center gap-2 text-sm font-bold text-brand-dark">
                        Explore service
                        <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
                      </div>
                    </div>
                  </div>

                  <div>
                    <p className="max-w-2xl text-lg leading-8 text-text-body">
                      {service.description}
                    </p>
                    <ul className="mt-7 grid gap-x-8 gap-y-3 sm:grid-cols-2">
                      {service.capabilities.map((cap) => (
                        <li key={cap} className="flex items-center gap-3 text-sm text-text-muted">
                          <span className="h-px w-5 flex-shrink-0" style={{ backgroundColor: service.accent }} />
                          {cap}
                        </li>
                      ))}
                    </ul>
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
