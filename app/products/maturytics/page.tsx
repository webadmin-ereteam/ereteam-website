import { Metadata } from "next";
import Link from "next/link";
import { ExternalLink, Globe, Target, BarChart2, Map, Award, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Maturytics – Data Maturity Assessment Platform",
  description:
    "Maturytics benchmarks your organization's data maturity against industry peers and generates actionable roadmaps for data transformation.",
};

const steps = [
  {
    id: "ASSESS",
    color: "bg-teal-600",
    title: "Complete the Assessment",
    description: "Answer structured questions across 5 dimensions in under 4 hours. Covers strategy, architecture, governance, culture, and analytics capability with granular sub-criteria.",
  },
  {
    id: "BENCHMARK",
    color: "bg-[#c44a1f]",
    title: "See Where You Stand",
    description: "Your scores are instantly benchmarked against 200+ organizations across 12 industries. See peer percentile rankings and identify your biggest gaps relative to leaders.",
  },
  {
    id: "ROADMAP",
    color: "bg-[#e05520]",
    title: "Get Your Roadmap",
    description: "Maturytics automatically generates a prioritized improvement roadmap with sized initiatives, expected outcomes, and investment guidance — ready for executive presentation.",
  },
  {
    id: "TRACK",
    color: "bg-[#F15A29]",
    title: "Track Progress Over Time",
    description: "Run quarterly assessments to measure progress. Certify milestones and demonstrate your data transformation journey to stakeholders, partners, and regulators.",
  },
];

const capabilities = [
  {
    icon: Target,
    title: "5-Dimension Maturity Framework",
    description:
      "Maturytics assesses your organization across five critical dimensions: Data Strategy, Data Architecture, Data Governance, Data Culture, and Analytics Capability. Each dimension is scored on a 1–5 maturity scale with granular sub-criteria.",
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

const metrics = [
  { value: "4 hrs", label: "Time to complete assessment" },
  { value: "200+", label: "Organizations benchmarked" },
  { value: "12", label: "Industries covered" },
  { value: "100%", label: "Actionable recommendations" },
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

const comparison = [
  { criterion: "Time to Complete", internal: "Weeks of meetings", consulting: "2–3 months", maturytics: "4 hours" },
  { criterion: "Peer Benchmarks", internal: "None", consulting: "Limited", maturytics: "200+ orgs" },
  { criterion: "Roadmap Output", internal: "Opinions", consulting: "Slides", maturytics: "Automated" },
  { criterion: "Progress Tracking", internal: "None", consulting: "Ad-hoc", maturytics: "Quarterly" },
  { criterion: "Cost", internal: "High (staff time)", consulting: "Very High", maturytics: "Predictable" },
  { criterion: "Executive Ready", internal: "Rarely", consulting: "Yes", maturytics: "Built-in" },
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
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-10">
            <div className="flex-1">
              <div className="mb-6 pb-6 border-b border-white/10">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/logos/products/maturytics.svg" alt="Maturytics" className="h-10 w-auto max-w-[200px] object-contain" />
              </div>
              <p className="text-sm font-medium text-[#F15A29] uppercase tracking-widest mb-3">
                Data Maturity Assessment Platform
              </p>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-4">
                You can&apos;t improve{" "}
                <span className="text-[#F15A29]">what you can&apos;t measure.</span>
              </h1>
              <p className="text-lg text-gray-300 mb-6 max-w-xl">
                Maturytics benchmarks your organization&apos;s data and analytics maturity against 200+ industry peers, generates a prioritized improvement roadmap, and tracks your transformation progress over time.
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
            {/* Metrics */}
            <div className="grid grid-cols-2 gap-4 lg:w-72 flex-shrink-0">
              {metrics.map((m) => (
                <div
                  key={m.label}
                  className="bg-white/10 rounded-xl p-4 text-center border border-white/10"
                >
                  <div className="text-2xl font-extrabold text-[#F15A29] mb-1">{m.value}</div>
                  <div className="text-xs text-gray-300 leading-tight">{m.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* The Problem */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-sm font-medium text-[#F15A29] uppercase tracking-widest mb-2">The Real Problem</p>
            <h2 className="text-3xl font-extrabold text-brand-dark mb-4">
              Everyone has a data strategy. Few know if it&apos;s working.
            </h2>
            <p className="text-text-muted max-w-2xl mx-auto">
              Without an objective baseline, data transformation programs run on gut feel. Investments get made in the wrong areas, and the business never sees ROI.
            </p>
          </div>
          <div className="space-y-2 mb-10">
            {[
              { label: "Data Strategy", status: "Undocumented", note: "Exists in CDO's head, not aligned with business units" },
              { label: "Data Architecture", status: "Fragmented", note: "14 different BI tools, no single source of truth" },
              { label: "Data Governance", status: "Ad-hoc", note: "No data ownership, no quality standards, no lineage" },
              { label: "Data Culture", status: "Low", note: "Decisions made on intuition, not data" },
            ].map((row) => (
              <div key={row.label} className="flex items-center gap-3 rounded-xl overflow-hidden border border-gray-200">
                <div className="bg-[#3d1800] text-white text-xs font-semibold px-4 py-3 w-36 flex-shrink-0">{row.label}</div>
                <div className="bg-[#F15A29] text-white text-xs font-bold px-3 py-3 w-28 flex-shrink-0">{row.status}</div>
                <div className="bg-[#1e1e3f] text-white text-xs px-4 py-3 flex-1">{row.note}</div>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { chain: "No Baseline → Wrong Priorities → Wasted Investment", outcome: "Budget Waste", color: "bg-orange-50 border-orange-200" },
              { chain: "No Benchmarks → No Context → No Board Buy-in", outcome: "Stalled Programs", color: "bg-red-50 border-red-200" },
              { chain: "No Roadmap → No Direction → Low ROI", outcome: "Missed Value", color: "bg-yellow-50 border-yellow-200" },
            ].map((item) => (
              <div key={item.outcome} className={`rounded-xl p-4 border ${item.color}`}>
                <p className="text-xs text-text-muted mb-2">{item.chain}</p>
                <p className="font-bold text-brand-dark flex items-center gap-1">
                  <ArrowRight size={14} className="text-[#F15A29]" /> {item.outcome}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-brand-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-sm font-medium text-[#F15A29] uppercase tracking-widest mb-2">How It Works</p>
            <h2 className="text-3xl font-extrabold text-brand-dark mb-4">
              From gut feel to a data-driven transformation roadmap
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step, i) => (
              <div key={step.id} className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm relative">
                <span className={`inline-block text-xs font-bold text-white px-3 py-1 rounded-full mb-4 ${step.color}`}>
                  {step.id}
                </span>
                {i < steps.length - 1 && (
                  <ArrowRight size={16} className="absolute -right-3 top-8 text-gray-300 hidden lg:block" />
                )}
                <h3 className="font-bold text-brand-dark mb-2 text-sm">{step.title}</h3>
                <p className="text-xs text-text-muted leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Capabilities */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-sm font-medium text-[#F15A29] uppercase tracking-widest mb-2">Platform</p>
            <h2 className="text-3xl font-extrabold text-brand-dark">Built for Data Leaders</h2>
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
                  <h3 className="text-lg font-bold text-brand-dark mb-3">{cap.title}</h3>
                  <p className="text-sm text-text-body leading-relaxed">{cap.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Comparison */}
      <section className="py-20 bg-brand-light">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-sm font-medium text-[#F15A29] uppercase tracking-widest mb-2">Comparison</p>
            <h2 className="text-3xl font-extrabold text-brand-dark mb-2">Faster Than Consulting. More Rigorous Than Internal Reviews.</h2>
            <p className="text-text-muted">See how Maturytics compares</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="grid grid-cols-4 text-xs font-bold uppercase tracking-wider">
              <div className="p-4 bg-gray-50 border-b border-gray-200"></div>
              <div className="p-4 bg-gray-50 border-b border-gray-200 text-center text-blue-500">Internal Review</div>
              <div className="p-4 bg-gray-50 border-b border-gray-200 text-center text-blue-600">Big Consulting</div>
              <div className="p-4 bg-[#F15A29]/10 border-b border-[#F15A29]/20 text-center text-[#F15A29]">maturytics</div>
            </div>
            {comparison.map((row, i) => (
              <div key={row.criterion} className={`grid grid-cols-4 text-sm ${i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}`}>
                <div className="p-4 font-medium text-brand-dark border-b border-gray-100">{row.criterion}</div>
                <div className="p-4 text-center text-text-muted border-b border-gray-100">{row.internal}</div>
                <div className="p-4 text-center text-text-muted border-b border-gray-100">{row.consulting}</div>
                <div className="p-4 text-center font-semibold text-[#F15A29] bg-[#F15A29]/5 border-b border-[#F15A29]/10">{row.maturytics}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Maturity Dimensions */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-sm font-medium text-[#F15A29] uppercase tracking-widest mb-2">Framework</p>
            <h2 className="text-2xl font-extrabold text-brand-dark mb-2">
              The 5-Dimension Assessment Framework
            </h2>
            <p className="text-text-muted">
              Each dimension is assessed on a 1–5 maturity scale.
            </p>
          </div>
          <div className="space-y-4 max-w-4xl mx-auto">
            {dimensions.map((dim, index) => (
              <div
                key={dim.name}
                className="bg-brand-light rounded-xl p-6 border border-gray-200 shadow-sm"
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="sm:w-48 flex-shrink-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="w-6 h-6 bg-[#F15A29] text-white rounded-full text-xs font-bold flex items-center justify-center">
                        {index + 1}
                      </span>
                      <span className="font-bold text-brand-dark text-sm">{dim.name}</span>
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
      <section className="py-16 bg-brand-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-sm font-medium text-[#F15A29] uppercase tracking-widest mb-2">Use Cases</p>
            <h2 className="text-2xl font-extrabold text-brand-dark">How Organizations Use Maturytics</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {useCases.map((uc) => (
              <div key={uc.type} className="bg-white rounded-xl p-6 border border-gray-200 hover:border-[#F15A29] transition-all">
                <Globe size={20} className="text-[#F15A29] mb-3" />
                <h3 className="font-bold text-brand-dark mb-2 text-sm">{uc.type}</h3>
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
            Start a free assessment and receive your personalized maturity report in hours — not months.
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
