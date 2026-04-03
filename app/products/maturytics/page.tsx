import { Metadata } from "next";
import Link from "next/link";
import { ExternalLink, Globe, Target, BarChart2, Map, Award } from "lucide-react";

export const metadata: Metadata = {
  title: "Maturytics – Data Maturity Assessment Platform",
  description:
    "Maturytics benchmarks your organization's data maturity against industry peers and generates actionable roadmaps for data transformation.",
};

const capabilities = [
  {
    icon: Target,
    title: "5-Dimension Maturity Framework",
    description:
      "Maturytics assesses your organization across five critical dimensions: Data Strategy, Data Architecture, Data Governance, Data Culture, and Analytics Capability. Each dimension is scored on a 1-5 maturity scale with granular sub-criteria.",
  },
  {
    icon: BarChart2,
    title: "Industry Peer Benchmarking",
    description:
      "Compare your maturity scores against a curated database of 200+ organizations across 12 industries. Understand where you stand relative to your peers and identify which dimensions offer the highest competitive differentiation potential.",
  },
  {
    icon: Map,
    title: "Automated Roadmap Generation",
    description:
      "Maturytics automatically generates a prioritized improvement roadmap based on your assessment results, business priorities, and available investment. Each initiative is sized, sequenced, and mapped to expected business outcomes.",
  },
  {
    icon: Award,
    title: "Progress Tracking & Certifications",
    description:
      "Run assessments quarterly to track progress over time. Celebrate milestones with Maturytics maturity certifications — shareable credentials that demonstrate your data transformation progress to stakeholders, partners, and regulators.",
  },
];

const dimensions = [
  {
    name: "Data Strategy",
    description: "Vision, executive sponsorship, and business alignment",
    levels: ["Ad-hoc", "Reactive", "Proactive", "Managed", "Optimized"],
  },
  {
    name: "Data Architecture",
    description: "Infrastructure, integration, and technology platforms",
    levels: ["Ad-hoc", "Reactive", "Proactive", "Managed", "Optimized"],
  },
  {
    name: "Data Governance",
    description: "Quality, lineage, ownership, and compliance",
    levels: ["Ad-hoc", "Reactive", "Proactive", "Managed", "Optimized"],
  },
  {
    name: "Data Culture",
    description: "Literacy, democratization, and data-driven decision-making",
    levels: ["Ad-hoc", "Reactive", "Proactive", "Managed", "Optimized"],
  },
  {
    name: "Analytics Capability",
    description: "Reporting, advanced analytics, AI/ML adoption",
    levels: ["Ad-hoc", "Reactive", "Proactive", "Managed", "Optimized"],
  },
];

const useCases = [
  {
    type: "Strategic Planning",
    desc: "Use assessment results to build the business case for data transformation investment.",
  },
  {
    type: "M&A Due Diligence",
    desc: "Rapidly assess the data maturity of acquisition targets to quantify integration risk.",
  },
  {
    type: "CDO Onboarding",
    desc: "Give a new Chief Data Officer an objective baseline and 100-day action plan.",
  },
  {
    type: "Program Governance",
    desc: "Track progress of an ongoing transformation program with quarterly assessments.",
  },
];

const benefits = [
  { metric: "4 hrs", label: "Time to complete assessment" },
  { metric: "200+", label: "Organizations benchmarked" },
  { metric: "12", label: "Industries covered" },
  { metric: "100%", label: "Actionable recommendations" },
];

export default function MaturyticsPage() {
  return (
    <>
      {/* Hero */}
      <section
        className="pt-32 pb-20"
        style={{ background: "linear-gradient(135deg, #1A1A2E 0%, #3d1800 100%)" }}
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-4">
            <Link href="/products" className="text-sm text-gray-400 hover:text-white transition-colors">
              ← Products
            </Link>
          </div>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
            <div>
              <div className="mb-6 pb-6 border-b border-white/10">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/logos/products/maturytics.svg" alt="Maturytics" className="h-10 w-auto max-w-[200px] object-contain brightness-0 invert" />
              </div>
              <p className="text-sm font-medium text-[#F15A29] uppercase tracking-widest mb-3">
                Maturity Assessment Platform
              </p>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-4">
                Maturytics
              </h1>
              <p className="text-lg text-gray-300 mb-6 max-w-xl">
                Benchmark your organization&apos;s data maturity against industry peers.
                Get an actionable roadmap to accelerate your data transformation journey.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/contact"
                  className="inline-flex items-center px-6 py-3 bg-[#F15A29] text-white font-semibold rounded-lg hover:bg-opacity-90 transition-all text-sm"
                >
                  Start Free Assessment
                </Link>
                <a
                  href="https://maturytics.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 border border-white/20 text-white font-semibold rounded-lg hover:bg-white/20 transition-all text-sm"
                >
                  Visit maturytics.com <ExternalLink size={14} />
                </a>
              </div>
            </div>
            {/* Benefits */}
            <div className="grid grid-cols-2 gap-4 lg:w-72 flex-shrink-0">
              {benefits.map((b) => (
                <div
                  key={b.label}
                  className="bg-white/10 rounded-xl p-4 text-center border border-white/10"
                >
                  <div className="text-2xl font-extrabold text-[#F15A29] mb-1">
                    {b.metric}
                  </div>
                  <div className="text-xs text-gray-300 leading-tight">{b.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Capabilities */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-brand-dark mb-4">
              Platform Capabilities
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {capabilities.map((cap) => {
              const Icon = cap.icon;
              return (
                <div
                  key={cap.title}
                  className="bg-brand-light rounded-2xl p-8 border border-gray-200 hover:border-[#F15A29] hover:shadow-md transition-all"
                >
                  <div className="w-12 h-12 bg-[#F15A29]/10 rounded-xl flex items-center justify-center mb-5">
                    <Icon size={24} className="text-[#c4461e]" />
                  </div>
                  <h3 className="text-lg font-bold text-brand-dark mb-3">
                    {cap.title}
                  </h3>
                  <p className="text-sm text-text-body leading-relaxed">
                    {cap.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Maturity Dimensions */}
      <section className="py-16 bg-brand-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-extrabold text-brand-dark mb-2">
              The 5-Dimension Framework
            </h2>
            <p className="text-text-muted">
              Each dimension is assessed on a 1–5 maturity scale.
            </p>
          </div>
          <div className="space-y-4 max-w-4xl mx-auto">
            {dimensions.map((dim, index) => (
              <div
                key={dim.name}
                className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm"
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="sm:w-48 flex-shrink-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="w-6 h-6 bg-[#F15A29] text-white rounded-full text-xs font-bold flex items-center justify-center">
                        {index + 1}
                      </span>
                      <span className="font-bold text-brand-dark text-sm">
                        {dim.name}
                      </span>
                    </div>
                    <p className="text-xs text-text-muted pl-8">{dim.description}</p>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {dim.levels.map((level, i) => (
                      <span
                        key={level}
                        className={`text-xs px-3 py-1.5 rounded-lg font-medium ${
                          i === 0
                            ? "bg-red-100 text-red-700"
                            : i === 1
                            ? "bg-orange-100 text-orange-700"
                            : i === 2
                            ? "bg-yellow-100 text-yellow-700"
                            : i === 3
                            ? "bg-blue-100 text-blue-700"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        {i + 1}. {level}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-extrabold text-brand-dark mb-2">
              How Organizations Use Maturytics
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {useCases.map((uc) => (
              <div
                key={uc.type}
                className="bg-brand-light rounded-xl p-6 border border-gray-200"
              >
                <Globe size={20} className="text-[#F15A29] mb-3" />
                <h3 className="font-bold text-brand-dark mb-2 text-sm">
                  {uc.type}
                </h3>
                <p className="text-xs text-text-muted leading-relaxed">{uc.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section
        className="py-16"
        style={{ background: "linear-gradient(135deg, #1A1A2E 0%, #3d1800 100%)" }}
      >
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-extrabold text-white mb-4">
            Discover your data maturity level
          </h2>
          <p className="text-gray-300 mb-8">
            Start a free assessment and receive your personalized maturity report.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center px-8 py-4 bg-[#F15A29] text-white font-semibold rounded-lg hover:bg-opacity-90 transition-all"
            >
              Start Free Assessment
            </Link>
            <a
              href="https://maturytics.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 border border-white/20 text-white font-semibold rounded-lg hover:bg-white/20 transition-all"
            >
              Visit maturytics.com <ExternalLink size={14} />
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
